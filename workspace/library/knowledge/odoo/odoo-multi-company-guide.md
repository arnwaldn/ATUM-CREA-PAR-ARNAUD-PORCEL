# Odoo Multi-Company & Localization Guide

## Vue d'ensemble

Guide complet pour configurer et développer des applications Odoo multi-sociétés avec localisation fiscale.

---

## 1. Architecture Multi-Company

### Configuration de Base

```python
class MultiCompanyModel(models.Model):
    _name = 'multi.company.model'
    _description = 'Multi-Company Model'

    name = fields.Char(required=True)

    # Champ company_id - OBLIGATOIRE pour multi-company
    company_id = fields.Many2one(
        'res.company',
        string='Company',
        required=True,
        default=lambda self: self.env.company,
        index=True,
    )

    # Alternative: Champ optionnel (partagé si vide)
    company_id_optional = fields.Many2one(
        'res.company',
        string='Company',
        default=lambda self: self.env.company,
    )

    # Champ company_ids pour accès multi-company
    company_ids = fields.Many2many(
        'res.company',
        string='Companies',
        default=lambda self: self.env.company,
    )


class ResCompany(models.Model):
    _inherit = 'res.company'

    # Paramètres spécifiques à la société
    custom_sequence_id = fields.Many2one(
        'ir.sequence',
        string='Custom Sequence',
    )
    default_warehouse_id = fields.Many2one(
        'stock.warehouse',
        string='Default Warehouse',
    )
    fiscal_country_id = fields.Many2one(
        'res.country',
        string='Fiscal Country',
    )
```

### Record Rules Multi-Company

```xml
<!-- security/multi_company_rules.xml -->
<odoo>
    <!-- Règle globale: voir sa company ou sans company -->
    <record id="rule_multi_company_global" model="ir.rule">
        <field name="name">Multi-Company Global Rule</field>
        <field name="model_id" ref="model_multi_company_model"/>
        <field name="global" eval="True"/>
        <field name="domain_force">
            ['|',
             ('company_id', '=', False),
             ('company_id', 'in', company_ids)]
        </field>
    </record>

    <!-- Règle stricte: uniquement sa company -->
    <record id="rule_multi_company_strict" model="ir.rule">
        <field name="name">Multi-Company Strict Rule</field>
        <field name="model_id" ref="model_sensitive_model"/>
        <field name="global" eval="True"/>
        <field name="domain_force">
            [('company_id', 'in', company_ids)]
        </field>
    </record>

    <!-- Règle pour données partagées entre companies -->
    <record id="rule_multi_company_shared" model="ir.rule">
        <field name="name">Multi-Company Shared Rule</field>
        <field name="model_id" ref="model_shared_model"/>
        <field name="global" eval="True"/>
        <field name="domain_force">
            ['|',
             ('company_ids', 'in', company_ids),
             ('company_ids', '=', False)]
        </field>
    </record>
</odoo>
```

### Contexte Multi-Company

```python
class MultiCompanyOperations(models.Model):
    _name = 'multi.company.operations'

    def action_for_specific_company(self):
        """Exécuter une action pour une company spécifique"""
        company = self.env['res.company'].browse(2)

        # Changer de company dans le contexte
        self_with_company = self.with_company(company)

        # Toutes les opérations utilisent cette company
        product = self_with_company.env['product.product'].create({
            'name': 'Product for Company 2',
        })
        # product.company_id sera automatiquement company

        return product

    def action_cross_company(self):
        """Opérations cross-company"""
        # Récupérer toutes les companies de l'utilisateur
        companies = self.env.user.company_ids

        for company in companies:
            with_company = self.with_company(company)

            # Chaque itération travaille dans une company différente
            orders = with_company.env['sale.order'].search([])

    def action_sudo_cross_company(self):
        """Accès cross-company avec sudo"""
        # sudo() ignore les record rules mais respecte company_id
        all_partners = self.env['res.partner'].sudo().search([])

        # Pour vraiment tout voir, combiner sudo et contexte
        all_records = self.env['sale.order'].sudo().with_context(
            allowed_company_ids=self.env['res.company'].search([]).ids
        ).search([])

    def get_company_dependent_value(self):
        """Valeurs dépendantes de la company"""
        # Champ company-dependent
        # Le même champ peut avoir des valeurs différentes par company
        product = self.env['product.product'].browse(1)

        # Lire la valeur pour la company courante
        current_price = product.standard_price

        # Lire pour une autre company
        company_2 = self.env['res.company'].browse(2)
        price_company_2 = product.with_company(company_2).standard_price
```

---

## 2. Données Inter-Company

### Transactions Inter-Company

```python
class InterCompanyTransaction(models.Model):
    _name = 'inter.company.transaction'
    _description = 'Inter-Company Transaction'

    name = fields.Char(required=True)
    source_company_id = fields.Many2one(
        'res.company',
        string='Source Company',
        required=True,
    )
    target_company_id = fields.Many2one(
        'res.company',
        string='Target Company',
        required=True,
    )
    source_document_id = fields.Reference(
        selection=[
            ('sale.order', 'Sale Order'),
            ('purchase.order', 'Purchase Order'),
            ('account.move', 'Invoice'),
        ],
        string='Source Document',
    )
    target_document_id = fields.Reference(
        selection=[
            ('sale.order', 'Sale Order'),
            ('purchase.order', 'Purchase Order'),
            ('account.move', 'Invoice'),
        ],
        string='Target Document',
    )
    state = fields.Selection([
        ('draft', 'Draft'),
        ('synchronized', 'Synchronized'),
        ('error', 'Error'),
    ], default='draft')


class SaleOrder(models.Model):
    _inherit = 'sale.order'

    def action_confirm(self):
        """Confirme et crée la commande inter-company si nécessaire"""
        res = super().action_confirm()

        for order in self:
            if order._is_inter_company_sale():
                order._create_inter_company_purchase()

        return res

    def _is_inter_company_sale(self):
        """Vérifie si c'est une vente inter-company"""
        self.ensure_one()
        return (
            self.partner_id.company_id and
            self.partner_id.company_id != self.company_id
        )

    def _create_inter_company_purchase(self):
        """Crée l'achat correspondant dans l'autre company"""
        self.ensure_one()

        target_company = self.partner_id.company_id

        # Créer dans le contexte de l'autre company
        purchase = self.env['purchase.order'].with_company(target_company).create({
            'partner_id': self.company_id.partner_id.id,
            'company_id': target_company.id,
            'origin': self.name,
            'order_line': [(0, 0, {
                'product_id': line.product_id.id,
                'product_qty': line.product_uom_qty,
                'price_unit': line.price_unit,
            }) for line in self.order_line],
        })

        # Enregistrer la transaction
        self.env['inter.company.transaction'].create({
            'name': f'{self.name} -> {purchase.name}',
            'source_company_id': self.company_id.id,
            'target_company_id': target_company.id,
            'source_document_id': f'sale.order,{self.id}',
            'target_document_id': f'purchase.order,{purchase.id}',
            'state': 'synchronized',
        })

        return purchase
```

### Consolidation Comptable

```python
class AccountConsolidation(models.Model):
    _name = 'account.consolidation'
    _description = 'Account Consolidation'

    name = fields.Char(required=True)
    company_ids = fields.Many2many(
        'res.company',
        string='Companies to Consolidate',
    )
    consolidation_company_id = fields.Many2one(
        'res.company',
        string='Consolidation Company',
        help='Company where consolidated entries are posted',
    )
    date_from = fields.Date(required=True)
    date_to = fields.Date(required=True)
    state = fields.Selection([
        ('draft', 'Draft'),
        ('done', 'Done'),
    ], default='draft')

    consolidated_move_ids = fields.One2many(
        'account.move',
        'consolidation_id',
        string='Consolidated Entries',
    )

    def action_consolidate(self):
        """Consolide les écritures de toutes les companies"""
        self.ensure_one()

        # Collecter les soldes par compte
        account_balances = {}

        for company in self.company_ids:
            moves = self.env['account.move'].with_company(company).search([
                ('date', '>=', self.date_from),
                ('date', '<=', self.date_to),
                ('state', '=', 'posted'),
            ])

            for move in moves:
                for line in move.line_ids:
                    account_code = line.account_id.code
                    if account_code not in account_balances:
                        account_balances[account_code] = 0
                    account_balances[account_code] += line.balance

        # Créer l'écriture consolidée
        lines = []
        for account_code, balance in account_balances.items():
            if balance == 0:
                continue

            account = self.env['account.account'].with_company(
                self.consolidation_company_id
            ).search([('code', '=', account_code)], limit=1)

            if account:
                lines.append((0, 0, {
                    'account_id': account.id,
                    'debit': balance if balance > 0 else 0,
                    'credit': -balance if balance < 0 else 0,
                }))

        if lines:
            self.env['account.move'].with_company(
                self.consolidation_company_id
            ).create({
                'journal_id': self._get_consolidation_journal().id,
                'date': self.date_to,
                'ref': f'Consolidation {self.name}',
                'consolidation_id': self.id,
                'line_ids': lines,
            })

        self.state = 'done'
```

---

## 3. Localisation Fiscale

### Structure Localisation France

```python
# l10n_fr_custom/models/account_fiscal_position.py
class AccountFiscalPositionFR(models.Model):
    _inherit = 'account.fiscal.position'

    fr_tax_regime = fields.Selection([
        ('normal', 'Régime Normal'),
        ('simplified', 'Régime Simplifié'),
        ('micro', 'Micro-entreprise'),
        ('franchise', 'Franchise de TVA'),
    ], string='Régime Fiscal')

    fr_vat_type = fields.Selection([
        ('debit', 'TVA sur les débits'),
        ('encaissement', 'TVA sur encaissements'),
    ], string='Type de TVA', default='debit')


class AccountTaxFR(models.Model):
    _inherit = 'account.tax'

    fr_tax_type = fields.Selection([
        ('tva_normale', 'TVA Normale 20%'),
        ('tva_intermediaire', 'TVA Intermédiaire 10%'),
        ('tva_reduite', 'TVA Réduite 5.5%'),
        ('tva_super_reduite', 'TVA Super Réduite 2.1%'),
        ('tva_dom', 'TVA DOM'),
        ('autoliquidation', 'Autoliquidation'),
    ], string='Type TVA France')


# Data: Taxes françaises
"""
<odoo>
    <record id="tva_normale_vente" model="account.tax">
        <field name="name">TVA 20% (Ventes)</field>
        <field name="amount">20</field>
        <field name="type_tax_use">sale</field>
        <field name="fr_tax_type">tva_normale</field>
    </record>

    <record id="tva_intermediaire_vente" model="account.tax">
        <field name="name">TVA 10% (Ventes)</field>
        <field name="amount">10</field>
        <field name="type_tax_use">sale</field>
        <field name="fr_tax_type">tva_intermediaire</field>
    </record>

    <record id="tva_reduite_vente" model="account.tax">
        <field name="name">TVA 5.5% (Ventes)</field>
        <field name="amount">5.5</field>
        <field name="type_tax_use">sale</field>
        <field name="fr_tax_type">tva_reduite</field>
    </record>
</odoo>
"""
```

### Déclarations TVA

```python
class AccountVatDeclaration(models.Model):
    _name = 'account.vat.declaration'
    _description = 'VAT Declaration'

    name = fields.Char(required=True)
    company_id = fields.Many2one(
        'res.company',
        required=True,
        default=lambda self: self.env.company,
    )
    date_from = fields.Date(required=True)
    date_to = fields.Date(required=True)
    state = fields.Selection([
        ('draft', 'Draft'),
        ('computed', 'Computed'),
        ('submitted', 'Submitted'),
    ], default='draft')

    # Montants TVA collectée
    vat_collected_20 = fields.Monetary(string='TVA 20% Collectée')
    vat_collected_10 = fields.Monetary(string='TVA 10% Collectée')
    vat_collected_55 = fields.Monetary(string='TVA 5.5% Collectée')

    # Montants TVA déductible
    vat_deductible_20 = fields.Monetary(string='TVA 20% Déductible')
    vat_deductible_10 = fields.Monetary(string='TVA 10% Déductible')
    vat_deductible_55 = fields.Monetary(string='TVA 5.5% Déductible')

    # Totaux
    total_collected = fields.Monetary(
        compute='_compute_totals',
        string='Total TVA Collectée',
    )
    total_deductible = fields.Monetary(
        compute='_compute_totals',
        string='Total TVA Déductible',
    )
    vat_due = fields.Monetary(
        compute='_compute_totals',
        string='TVA à Payer',
    )
    vat_credit = fields.Monetary(
        compute='_compute_totals',
        string='Crédit de TVA',
    )

    currency_id = fields.Many2one(
        related='company_id.currency_id',
    )

    @api.depends(
        'vat_collected_20', 'vat_collected_10', 'vat_collected_55',
        'vat_deductible_20', 'vat_deductible_10', 'vat_deductible_55'
    )
    def _compute_totals(self):
        for dec in self:
            dec.total_collected = (
                dec.vat_collected_20 +
                dec.vat_collected_10 +
                dec.vat_collected_55
            )
            dec.total_deductible = (
                dec.vat_deductible_20 +
                dec.vat_deductible_10 +
                dec.vat_deductible_55
            )

            balance = dec.total_collected - dec.total_deductible
            dec.vat_due = balance if balance > 0 else 0
            dec.vat_credit = -balance if balance < 0 else 0

    def action_compute(self):
        """Calcule la déclaration TVA"""
        self.ensure_one()

        # Récupérer les écritures de TVA
        tax_lines = self.env['account.move.line'].search([
            ('company_id', '=', self.company_id.id),
            ('date', '>=', self.date_from),
            ('date', '<=', self.date_to),
            ('parent_state', '=', 'posted'),
            ('tax_line_id', '!=', False),
        ])

        # Grouper par type de taxe
        collected = {'20': 0, '10': 0, '5.5': 0}
        deductible = {'20': 0, '10': 0, '5.5': 0}

        for line in tax_lines:
            tax = line.tax_line_id
            amount = abs(line.balance)

            if tax.type_tax_use == 'sale':
                if tax.amount == 20:
                    collected['20'] += amount
                elif tax.amount == 10:
                    collected['10'] += amount
                elif tax.amount == 5.5:
                    collected['5.5'] += amount
            else:  # purchase
                if tax.amount == 20:
                    deductible['20'] += amount
                elif tax.amount == 10:
                    deductible['10'] += amount
                elif tax.amount == 5.5:
                    deductible['5.5'] += amount

        self.write({
            'vat_collected_20': collected['20'],
            'vat_collected_10': collected['10'],
            'vat_collected_55': collected['5.5'],
            'vat_deductible_20': deductible['20'],
            'vat_deductible_10': deductible['10'],
            'vat_deductible_55': deductible['5.5'],
            'state': 'computed',
        })
```

### Formats Légaux (FEC)

```python
class AccountFEC(models.TransientModel):
    _name = 'account.fec'
    _description = 'Fichier des Écritures Comptables'

    company_id = fields.Many2one(
        'res.company',
        default=lambda self: self.env.company,
    )
    date_from = fields.Date(required=True)
    date_to = fields.Date(required=True)

    def generate_fec(self):
        """Génère le fichier FEC"""
        import csv
        from io import StringIO

        # En-têtes FEC
        headers = [
            'JournalCode', 'JournalLib', 'EcritureNum', 'EcritureDate',
            'CompteNum', 'CompteLib', 'CompAuxNum', 'CompAuxLib',
            'PieceRef', 'PieceDate', 'EcritureLib', 'Debit', 'Credit',
            'EcritureLet', 'DateLet', 'ValidDate', 'Montantdevise', 'Idevise'
        ]

        output = StringIO()
        writer = csv.writer(output, delimiter='|')
        writer.writerow(headers)

        # Récupérer les écritures
        moves = self.env['account.move'].search([
            ('company_id', '=', self.company_id.id),
            ('date', '>=', self.date_from),
            ('date', '<=', self.date_to),
            ('state', '=', 'posted'),
        ])

        for move in moves:
            for line in move.line_ids:
                writer.writerow([
                    move.journal_id.code,
                    move.journal_id.name,
                    move.name,
                    move.date.strftime('%Y%m%d'),
                    line.account_id.code,
                    line.account_id.name,
                    line.partner_id.ref or '',
                    line.partner_id.name or '',
                    move.ref or '',
                    move.date.strftime('%Y%m%d'),
                    line.name or move.ref or '',
                    f"{line.debit:.2f}".replace('.', ','),
                    f"{line.credit:.2f}".replace('.', ','),
                    line.full_reconcile_id.name if line.full_reconcile_id else '',
                    line.full_reconcile_id.create_date.strftime('%Y%m%d') if line.full_reconcile_id else '',
                    move.date.strftime('%Y%m%d'),
                    '',
                    '',
                ])

        # Retourner le fichier
        content = output.getvalue()
        return self._create_attachment(content)

    def _create_attachment(self, content):
        """Crée la pièce jointe FEC"""
        filename = f"FEC_{self.company_id.siret}_{self.date_to.strftime('%Y%m%d')}.txt"

        attachment = self.env['ir.attachment'].create({
            'name': filename,
            'type': 'binary',
            'datas': base64.b64encode(content.encode('utf-8')),
            'res_model': self._name,
            'res_id': self.id,
        })

        return {
            'type': 'ir.actions.act_url',
            'url': f'/web/content/{attachment.id}?download=true',
            'target': 'new',
        }
```

---

## 4. Configuration Multi-Devise

```python
class MultiCurrencyConfig(models.Model):
    _inherit = 'res.company'

    # Devises utilisées
    currency_exchange_journal_id = fields.Many2one(
        'account.journal',
        string='Exchange Difference Journal',
    )

    def update_currency_rates(self):
        """Met à jour les taux de change"""
        import requests

        currencies = self.env['res.currency'].search([
            ('active', '=', True),
        ])

        # API BCE pour EUR
        response = requests.get(
            'https://api.exchangerate-api.com/v4/latest/EUR'
        )
        rates = response.json().get('rates', {})

        for currency in currencies:
            if currency.name in rates and currency.name != 'EUR':
                self.env['res.currency.rate'].create({
                    'currency_id': currency.id,
                    'rate': 1 / rates[currency.name],
                    'name': fields.Date.today(),
                })
```

---

## 5. Bonnes Pratiques

### Checklist Multi-Company

```markdown
## Modèles
- [ ] Champ company_id sur tous les modèles de données
- [ ] Default company via lambda
- [ ] Index sur company_id

## Record Rules
- [ ] Règle globale multi-company
- [ ] Règles spécifiques par groupe
- [ ] Test des accès cross-company

## Transactions
- [ ] Gestion inter-company automatisée
- [ ] Consolidation comptable
- [ ] Réconciliation inter-company

## Localisation
- [ ] Taxes configurées par pays
- [ ] Positions fiscales correctes
- [ ] Formats légaux (FEC, XML, etc.)
```
