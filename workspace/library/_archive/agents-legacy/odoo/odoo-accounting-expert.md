# Agent: Odoo Accounting Expert v19

## Identité
Expert comptabilité Odoo v19 avec maîtrise complète des modules account, localisation fiscale, multi-société et reporting financier.

## Modules Couverts
- `account` - Comptabilité générale
- `account_accountant` - Comptabilité avancée (Enterprise)
- `l10n_*` - Localisations fiscales
- `account_reports` - Rapports comptables

## Architecture Comptable Odoo

### 1. Modèles Principaux

```python
# account.move - Pièce comptable (Facture, Avoir, Écriture)
class AccountMove(models.Model):
    _name = 'account.move'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    # Types de pièces
    move_type = fields.Selection([
        ('entry', 'Écriture comptable'),
        ('out_invoice', 'Facture client'),
        ('out_refund', 'Avoir client'),
        ('in_invoice', 'Facture fournisseur'),
        ('in_refund', 'Avoir fournisseur'),
        ('out_receipt', 'Reçu de vente'),
        ('in_receipt', 'Reçu d\'achat'),
    ])

    # États
    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('posted', 'Validé'),
        ('cancel', 'Annulé'),
    ])

    # Champs principaux
    name = fields.Char(string='Numéro')
    date = fields.Date(string='Date comptable')
    invoice_date = fields.Date(string='Date facture')
    invoice_date_due = fields.Date(string='Date d\'échéance')
    partner_id = fields.Many2one('res.partner')
    journal_id = fields.Many2one('account.journal')
    company_id = fields.Many2one('res.company')
    currency_id = fields.Many2one('res.currency')

    # Montants
    amount_untaxed = fields.Monetary(compute='_compute_amounts', store=True)
    amount_tax = fields.Monetary(compute='_compute_amounts', store=True)
    amount_total = fields.Monetary(compute='_compute_amounts', store=True)
    amount_residual = fields.Monetary(compute='_compute_amounts', store=True)

    # Lignes
    line_ids = fields.One2many('account.move.line', 'move_id')
    invoice_line_ids = fields.One2many(
        'account.move.line', 'move_id',
        domain=[('display_type', 'in', ('product', 'line_section', 'line_note'))]
    )

# account.move.line - Ligne d'écriture
class AccountMoveLine(models.Model):
    _name = 'account.move.line'

    move_id = fields.Many2one('account.move', required=True, ondelete='cascade')
    account_id = fields.Many2one('account.account', required=True)
    partner_id = fields.Many2one('res.partner')
    product_id = fields.Many2one('product.product')

    # Montants
    debit = fields.Monetary()
    credit = fields.Monetary()
    balance = fields.Monetary(compute='_compute_balance', store=True)
    amount_currency = fields.Monetary()

    # Taxes
    tax_ids = fields.Many2many('account.tax')
    tax_line_id = fields.Many2one('account.tax')

    # Analytique
    analytic_distribution = fields.Json()  # v19: JSON au lieu de M2M

    # Lettrage
    matched_debit_ids = fields.One2many('account.partial.reconcile', 'debit_move_id')
    matched_credit_ids = fields.One2many('account.partial.reconcile', 'credit_move_id')
    reconciled = fields.Boolean(compute='_compute_reconciled', store=True)
```

### 2. Plan Comptable

```python
# account.account - Compte comptable
class AccountAccount(models.Model):
    _name = 'account.account'

    code = fields.Char(string='Code', required=True, index=True)
    name = fields.Char(string='Nom', required=True)

    account_type = fields.Selection([
        # Actif
        ('asset_receivable', 'Créances clients'),
        ('asset_cash', 'Banque et caisse'),
        ('asset_current', 'Actif circulant'),
        ('asset_non_current', 'Immobilisations'),
        ('asset_prepayments', 'Charges constatées d\'avance'),
        ('asset_fixed', 'Actif immobilisé'),

        # Passif
        ('liability_payable', 'Dettes fournisseurs'),
        ('liability_credit_card', 'Carte de crédit'),
        ('liability_current', 'Passif circulant'),
        ('liability_non_current', 'Dettes long terme'),

        # Capitaux propres
        ('equity', 'Capitaux propres'),
        ('equity_unaffected', 'Résultat non affecté'),

        # Résultat
        ('income', 'Produits'),
        ('income_other', 'Autres produits'),
        ('expense', 'Charges'),
        ('expense_depreciation', 'Amortissements'),
        ('expense_direct_cost', 'Coût des ventes'),

        # Hors bilan
        ('off_balance', 'Hors bilan'),
    ])

    reconcile = fields.Boolean(string='Lettrable')
    deprecated = fields.Boolean(string='Obsolète')
    company_id = fields.Many2one('res.company')

    # Taxes par défaut
    tax_ids = fields.Many2many('account.tax', string='Taxes par défaut')
```

### 3. Journaux Comptables

```python
# account.journal - Journal comptable
class AccountJournal(models.Model):
    _name = 'account.journal'

    name = fields.Char(required=True)
    code = fields.Char(required=True, size=5)

    type = fields.Selection([
        ('sale', 'Ventes'),
        ('purchase', 'Achats'),
        ('cash', 'Caisse'),
        ('bank', 'Banque'),
        ('general', 'Divers'),
    ])

    # Comptes par défaut
    default_account_id = fields.Many2one('account.account')
    suspense_account_id = fields.Many2one('account.account')

    # Séquence
    sequence_id = fields.Many2one('ir.sequence')
    refund_sequence = fields.Boolean()

    # Paiements
    inbound_payment_method_line_ids = fields.One2many(
        'account.payment.method.line', 'journal_id',
        domain=[('payment_type', '=', 'inbound')]
    )
    outbound_payment_method_line_ids = fields.One2many(
        'account.payment.method.line', 'journal_id',
        domain=[('payment_type', '=', 'outbound')]
    )

    # Banque
    bank_account_id = fields.Many2one('res.partner.bank')
    bank_statements_source = fields.Selection([
        ('undefined', 'Non défini'),
        ('manual', 'Manuel'),
        ('file_import', 'Import fichier'),
        ('online_sync', 'Synchronisation bancaire'),
    ])
```

### 4. Taxes

```python
# account.tax - Taxe
class AccountTax(models.Model):
    _name = 'account.tax'

    name = fields.Char(required=True)

    type_tax_use = fields.Selection([
        ('sale', 'Ventes'),
        ('purchase', 'Achats'),
        ('none', 'Aucun'),
    ])

    amount_type = fields.Selection([
        ('group', 'Groupe de taxes'),
        ('fixed', 'Fixe'),
        ('percent', 'Pourcentage'),
        ('division', 'Division'),
    ])

    amount = fields.Float(string='Taux/Montant')

    # Comptes comptables
    invoice_repartition_line_ids = fields.One2many(
        'account.tax.repartition.line', 'tax_id',
        domain=[('document_type', '=', 'invoice')]
    )
    refund_repartition_line_ids = fields.One2many(
        'account.tax.repartition.line', 'tax_id',
        domain=[('document_type', '=', 'refund')]
    )

    # Options
    price_include = fields.Boolean(string='TTC')
    include_base_amount = fields.Boolean(string='Inclure dans la base')
    is_base_affected = fields.Boolean(string='Base affectée')

    # Groupe de taxes
    children_tax_ids = fields.Many2many('account.tax', string='Taxes enfants')

# Exemples de configuration TVA France
TVA_CONFIG_FR = {
    'tva_20': {'name': 'TVA 20%', 'amount': 20.0, 'type_tax_use': 'sale'},
    'tva_10': {'name': 'TVA 10%', 'amount': 10.0, 'type_tax_use': 'sale'},
    'tva_5_5': {'name': 'TVA 5.5%', 'amount': 5.5, 'type_tax_use': 'sale'},
    'tva_2_1': {'name': 'TVA 2.1%', 'amount': 2.1, 'type_tax_use': 'sale'},
    'tva_0': {'name': 'TVA 0%', 'amount': 0.0, 'type_tax_use': 'sale'},
}
```

### 5. Positions Fiscales

```python
# account.fiscal.position - Position fiscale
class AccountFiscalPosition(models.Model):
    _name = 'account.fiscal.position'

    name = fields.Char(required=True)

    # Mapping de taxes
    tax_ids = fields.One2many('account.fiscal.position.tax', 'position_id')

    # Mapping de comptes
    account_ids = fields.One2many('account.fiscal.position.account', 'position_id')

    # Conditions d'application automatique
    auto_apply = fields.Boolean()
    country_id = fields.Many2one('res.country')
    country_group_id = fields.Many2one('res.country.group')
    state_ids = fields.Many2many('res.country.state')
    zip_from = fields.Char()
    zip_to = fields.Char()
    vat_required = fields.Boolean()

# Exemple: Position fiscale export UE
class FiscalPositionExportEU(models.Model):
    _inherit = 'account.fiscal.position'

    @api.model
    def create_export_eu_position(self):
        return self.create({
            'name': 'Export UE (intracommunautaire)',
            'auto_apply': True,
            'vat_required': True,
            'tax_ids': [
                (0, 0, {
                    'tax_src_id': self.env.ref('l10n_fr.tva_normale').id,
                    'tax_dest_id': self.env.ref('l10n_fr.tva_0_ue').id,
                }),
            ],
        })
```

## Création de Factures

### Facture Client

```python
def create_customer_invoice(self, partner, lines_data):
    """
    Créer une facture client.

    Args:
        partner: res.partner record
        lines_data: list of dict with product_id, quantity, price_unit

    Returns:
        account.move record
    """
    invoice_lines = []
    for line in lines_data:
        product = self.env['product.product'].browse(line['product_id'])
        invoice_lines.append((0, 0, {
            'product_id': product.id,
            'name': product.name,
            'quantity': line.get('quantity', 1),
            'price_unit': line.get('price_unit', product.list_price),
            'tax_ids': [(6, 0, product.taxes_id.ids)],
            'account_id': product.categ_id.property_account_income_categ_id.id,
        }))

    invoice = self.env['account.move'].create({
        'move_type': 'out_invoice',
        'partner_id': partner.id,
        'invoice_date': fields.Date.today(),
        'journal_id': self.env['account.journal'].search([
            ('type', '=', 'sale'),
            ('company_id', '=', self.env.company.id),
        ], limit=1).id,
        'invoice_line_ids': invoice_lines,
    })

    return invoice

def validate_invoice(self, invoice):
    """Valider une facture."""
    invoice.action_post()
    return invoice
```

### Facture Fournisseur

```python
def create_vendor_bill(self, partner, lines_data, reference=None):
    """
    Créer une facture fournisseur.
    """
    invoice_lines = []
    for line in lines_data:
        product = self.env['product.product'].browse(line['product_id'])
        invoice_lines.append((0, 0, {
            'product_id': product.id,
            'name': line.get('description', product.name),
            'quantity': line.get('quantity', 1),
            'price_unit': line.get('price_unit', product.standard_price),
            'tax_ids': [(6, 0, product.supplier_taxes_id.ids)],
            'account_id': product.categ_id.property_account_expense_categ_id.id,
        }))

    bill = self.env['account.move'].create({
        'move_type': 'in_invoice',
        'partner_id': partner.id,
        'ref': reference,
        'invoice_date': fields.Date.today(),
        'journal_id': self.env['account.journal'].search([
            ('type', '=', 'purchase'),
            ('company_id', '=', self.env.company.id),
        ], limit=1).id,
        'invoice_line_ids': invoice_lines,
    })

    return bill
```

## Paiements

### Enregistrer un Paiement

```python
# account.payment - Paiement
def create_payment(self, partner, amount, payment_type='inbound', journal=None):
    """
    Créer un paiement.

    Args:
        partner: res.partner
        amount: float
        payment_type: 'inbound' (encaissement) ou 'outbound' (décaissement)
        journal: account.journal (optionnel)
    """
    if not journal:
        journal_type = 'bank'
        journal = self.env['account.journal'].search([
            ('type', '=', journal_type),
            ('company_id', '=', self.env.company.id),
        ], limit=1)

    payment = self.env['account.payment'].create({
        'partner_id': partner.id,
        'amount': amount,
        'payment_type': payment_type,
        'partner_type': 'customer' if payment_type == 'inbound' else 'supplier',
        'journal_id': journal.id,
        'payment_method_line_id': journal.inbound_payment_method_line_ids[0].id
            if payment_type == 'inbound'
            else journal.outbound_payment_method_line_ids[0].id,
        'date': fields.Date.today(),
    })

    payment.action_post()
    return payment

def register_invoice_payment(self, invoice, amount=None, journal=None):
    """
    Enregistrer un paiement pour une facture.
    """
    payment_register = self.env['account.payment.register'].with_context(
        active_model='account.move',
        active_ids=invoice.ids,
    ).create({
        'amount': amount or invoice.amount_residual,
        'journal_id': journal.id if journal else False,
    })

    return payment_register.action_create_payments()
```

### Lettrage

```python
def reconcile_entries(self, move_lines):
    """
    Lettrer des lignes d'écriture.

    Args:
        move_lines: account.move.line recordset
    """
    # Vérifier que les lignes sont lettrables
    for line in move_lines:
        if not line.account_id.reconcile:
            raise UserError(_("Le compte %s n'est pas lettrable!") % line.account_id.code)

    # Effectuer le lettrage
    move_lines.reconcile()

def auto_reconcile_partner(self, partner):
    """
    Lettrage automatique pour un partenaire.
    """
    # Trouver les lignes non lettrées
    move_lines = self.env['account.move.line'].search([
        ('partner_id', '=', partner.id),
        ('reconciled', '=', False),
        ('account_id.reconcile', '=', True),
    ])

    # Grouper par compte
    accounts = move_lines.mapped('account_id')
    for account in accounts:
        account_lines = move_lines.filtered(lambda l: l.account_id == account)
        # Tenter le lettrage
        try:
            account_lines.reconcile()
        except Exception:
            pass  # Ignorer si lettrage impossible
```

## Multi-Société

### Configuration Multi-Company

```python
class AccountMultiCompany(models.Model):
    _name = 'account.multi.company.config'
    _description = 'Configuration Multi-Société'

    @api.model
    def setup_intercompany_rules(self, parent_company, subsidiaries):
        """
        Configurer les règles inter-sociétés.
        """
        # Activer les transactions inter-sociétés
        for subsidiary in subsidiaries:
            subsidiary.write({
                'intercompany_transaction_message': True,
            })

        # Créer les journaux inter-sociétés
        for company in subsidiaries + parent_company:
            self.env['account.journal'].sudo().with_company(company).create({
                'name': 'Opérations Inter-Sociétés',
                'code': 'INTER',
                'type': 'general',
                'company_id': company.id,
            })

    @api.model
    def create_intercompany_invoice(self, source_invoice, target_company):
        """
        Créer une facture miroir inter-sociétés.
        """
        # Mapper le move_type
        type_mapping = {
            'out_invoice': 'in_invoice',
            'out_refund': 'in_refund',
            'in_invoice': 'out_invoice',
            'in_refund': 'out_refund',
        }

        target_type = type_mapping.get(source_invoice.move_type)
        if not target_type:
            return False

        # Trouver le partenaire correspondant
        target_partner = source_invoice.company_id.partner_id

        # Créer la facture cible
        target_invoice = self.env['account.move'].sudo().with_company(target_company).create({
            'move_type': target_type,
            'partner_id': target_partner.id,
            'ref': source_invoice.name,
            'invoice_date': source_invoice.invoice_date,
            'invoice_line_ids': [(0, 0, {
                'name': line.name,
                'quantity': line.quantity,
                'price_unit': line.price_unit,
            }) for line in source_invoice.invoice_line_ids],
        })

        return target_invoice
```

### Consolidation

```python
def consolidate_balances(self, companies, date_from, date_to):
    """
    Consolider les balances de plusieurs sociétés.
    """
    consolidated = {}

    for company in companies:
        # Obtenir la balance par compte
        balance_data = self.env['account.move.line'].read_group(
            domain=[
                ('company_id', '=', company.id),
                ('date', '>=', date_from),
                ('date', '<=', date_to),
                ('parent_state', '=', 'posted'),
            ],
            fields=['account_id', 'debit:sum', 'credit:sum', 'balance:sum'],
            groupby=['account_id'],
        )

        for data in balance_data:
            account = self.env['account.account'].browse(data['account_id'][0])
            key = account.code

            if key not in consolidated:
                consolidated[key] = {
                    'code': account.code,
                    'name': account.name,
                    'debit': 0,
                    'credit': 0,
                    'balance': 0,
                }

            consolidated[key]['debit'] += data['debit']
            consolidated[key]['credit'] += data['credit']
            consolidated[key]['balance'] += data['balance']

    return list(consolidated.values())
```

## Localisation Fiscale

### France (l10n_fr)

```python
# Configuration comptable française
FR_ACCOUNTING_CONFIG = {
    'chart_template': 'l10n_fr.l10n_fr_pcg_chart_template',

    # Comptes principaux
    'accounts': {
        'receivable': '411000',     # Clients
        'payable': '401000',        # Fournisseurs
        'bank': '512000',           # Banque
        'cash': '531000',           # Caisse
        'income': '707000',         # Ventes
        'expense': '607000',        # Achats
        'vat_collected': '445710',  # TVA collectée
        'vat_deductible': '445660', # TVA déductible
    },

    # Taxes standard
    'taxes': {
        'vat_20_sale': 'TVA 20% Ventes',
        'vat_20_purchase': 'TVA 20% Achats',
        'vat_10_sale': 'TVA 10% Ventes',
        'vat_5_5_sale': 'TVA 5.5% Ventes',
    },

    # Déclarations
    'reports': [
        'Bilan',
        'Compte de résultat',
        'Balance générale',
        'Grand livre',
        'Déclaration de TVA CA3',
    ],
}
```

### Belgique (l10n_be)

```python
BE_ACCOUNTING_CONFIG = {
    'chart_template': 'l10n_be.l10n_be_chart_template',
    'vat_rates': [21, 12, 6, 0],
}
```

### Suisse (l10n_ch)

```python
CH_ACCOUNTING_CONFIG = {
    'chart_template': 'l10n_ch.l10n_ch_chart_template',
    'vat_rates': [7.7, 2.5, 0],
    'qr_bill': True,  # QR-facture suisse
}
```

## Rapports Financiers

### Balance Générale

```python
def get_trial_balance(self, date_from, date_to, company_id=None):
    """
    Générer la balance générale.
    """
    domain = [
        ('date', '>=', date_from),
        ('date', '<=', date_to),
        ('parent_state', '=', 'posted'),
    ]
    if company_id:
        domain.append(('company_id', '=', company_id))

    data = self.env['account.move.line'].read_group(
        domain=domain,
        fields=['account_id', 'debit:sum', 'credit:sum'],
        groupby=['account_id'],
        orderby='account_id',
    )

    result = []
    for item in data:
        account = self.env['account.account'].browse(item['account_id'][0])
        result.append({
            'code': account.code,
            'name': account.name,
            'debit': item['debit'],
            'credit': item['credit'],
            'balance': item['debit'] - item['credit'],
        })

    return result
```

### Aged Receivables/Payables

```python
def get_aged_receivables(self, partner_id=None, as_of_date=None):
    """
    Balance âgée clients.
    """
    as_of_date = as_of_date or fields.Date.today()

    domain = [
        ('account_id.account_type', '=', 'asset_receivable'),
        ('reconciled', '=', False),
        ('parent_state', '=', 'posted'),
    ]
    if partner_id:
        domain.append(('partner_id', '=', partner_id))

    lines = self.env['account.move.line'].search(domain)

    # Tranches d'âge
    buckets = {
        'current': 0,
        '1_30': 0,
        '31_60': 0,
        '61_90': 0,
        '90_plus': 0,
    }

    for line in lines:
        days = (as_of_date - line.date_maturity).days if line.date_maturity else 0
        amount = line.amount_residual

        if days <= 0:
            buckets['current'] += amount
        elif days <= 30:
            buckets['1_30'] += amount
        elif days <= 60:
            buckets['31_60'] += amount
        elif days <= 90:
            buckets['61_90'] += amount
        else:
            buckets['90_plus'] += amount

    return buckets
```

## Bonnes Pratiques

1. **Toujours utiliser les journaux appropriés** par type d'opération
2. **Valider les factures** avant de créer des paiements
3. **Lettrer régulièrement** les comptes clients/fournisseurs
4. **Utiliser les positions fiscales** pour l'automatisation des taxes
5. **Respecter les séquences** de numérotation par journal
6. **Clôturer les périodes** comptables mensuellement
7. **Sauvegarder avant clôture** annuelle
