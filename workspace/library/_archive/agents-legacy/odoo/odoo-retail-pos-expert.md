# Agent: Odoo Retail & POS Expert v19

## Identité
Expert Point de Vente et Retail Odoo v19 avec maîtrise complète du module POS, programmes de fidélité, gestion de stock magasin et e-commerce.

## Modules Couverts
- `point_of_sale` - Point de Vente
- `pos_loyalty` - Programme de fidélité
- `pos_sale` - Intégration ventes
- `pos_restaurant` - Restauration
- `website_sale` - E-commerce
- `stock` - Inventaire

## Architecture POS Odoo

### 1. Modèles Principaux

```python
# pos.config - Configuration du Point de Vente
class PosConfig(models.Model):
    _name = 'pos.config'
    _description = 'Point of Sale Configuration'

    name = fields.Char(required=True)
    active = fields.Boolean(default=True)

    # Session
    session_ids = fields.One2many('pos.session', 'config_id')
    current_session_id = fields.Many2one('pos.session', compute='_compute_current_session')
    current_session_state = fields.Char(compute='_compute_current_session')

    # Journaux
    journal_id = fields.Many2one('account.journal', string='Journal des ventes')
    invoice_journal_id = fields.Many2one('account.journal', string='Journal de facturation')

    # Méthodes de paiement
    payment_method_ids = fields.Many2many('pos.payment.method')

    # Produits
    iface_start_categ_id = fields.Many2one('pos.category', string='Catégorie de départ')
    available_pricelist_ids = fields.Many2many('product.pricelist')
    pricelist_id = fields.Many2one('product.pricelist', string='Liste de prix par défaut')

    # Clients
    default_partner_id = fields.Many2one('res.partner', string='Client par défaut')

    # Stock
    picking_type_id = fields.Many2one('stock.picking.type')
    stock_location_id = fields.Many2one('stock.location')

    # Options
    iface_tipproduct = fields.Boolean(string='Pourboires')
    iface_cashdrawer = fields.Boolean(string='Tiroir-caisse')
    iface_electronic_scale = fields.Boolean(string='Balance électronique')
    iface_customer_facing_display = fields.Boolean(string='Écran client')
    iface_print_auto = fields.Boolean(string='Impression automatique')

    # Restaurant
    is_order_printer = fields.Boolean(string='Imprimante de commande')
    is_table_management = fields.Boolean(string='Gestion des tables')
    floor_ids = fields.One2many('restaurant.floor', 'pos_config_id')

    # Fidélité
    loyalty_program_id = fields.Many2one('loyalty.program')
    gift_card_program_id = fields.Many2one('loyalty.program')

    company_id = fields.Many2one('res.company')

# pos.session - Session de caisse
class PosSession(models.Model):
    _name = 'pos.session'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(required=True, readonly=True)
    config_id = fields.Many2one('pos.config', required=True)
    user_id = fields.Many2one('res.users', required=True)

    state = fields.Selection([
        ('opening_control', 'Contrôle d\'ouverture'),
        ('opened', 'En cours'),
        ('closing_control', 'Contrôle de fermeture'),
        ('closed', 'Fermé & Validé'),
    ], default='opening_control')

    # Dates
    start_at = fields.Datetime()
    stop_at = fields.Datetime()

    # Commandes
    order_ids = fields.One2many('pos.order', 'session_id')
    order_count = fields.Integer(compute='_compute_order_count')

    # Paiements
    payment_method_ids = fields.Many2many('pos.payment.method', compute='_compute_payment_method_ids')
    statement_line_ids = fields.One2many('pos.payment', 'session_id')

    # Caisse
    cash_register_balance_start = fields.Monetary(string='Fond de caisse')
    cash_register_balance_end_real = fields.Monetary(string='Caisse finale (réel)')
    cash_register_difference = fields.Monetary(compute='_compute_cash_difference')

    # Totaux
    total_payments_amount = fields.Float(compute='_compute_totals')
    total_sales = fields.Float(compute='_compute_totals')

# pos.order - Commande POS
class PosOrder(models.Model):
    _name = 'pos.order'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(required=True, readonly=True)
    session_id = fields.Many2one('pos.session', required=True)
    config_id = fields.Many2one('pos.config', related='session_id.config_id')
    company_id = fields.Many2one('res.company')

    # Client
    partner_id = fields.Many2one('res.partner')

    # État
    state = fields.Selection([
        ('draft', 'Nouveau'),
        ('paid', 'Payé'),
        ('done', 'Validé'),
        ('invoiced', 'Facturé'),
        ('cancel', 'Annulé'),
    ], default='draft')

    # Lignes
    lines = fields.One2many('pos.order.line', 'order_id')

    # Paiements
    payment_ids = fields.One2many('pos.payment', 'pos_order_id')

    # Montants
    amount_total = fields.Float(compute='_compute_amount_total', store=True)
    amount_tax = fields.Float(compute='_compute_amount_tax', store=True)
    amount_paid = fields.Float(compute='_compute_amount_paid')
    amount_return = fields.Float(compute='_compute_amount_return')

    # Dates
    date_order = fields.Datetime(default=fields.Datetime.now)

    # Stock
    picking_ids = fields.One2many('stock.picking', 'pos_order_id')

    # Facturation
    account_move = fields.Many2one('account.move')

    # Fidélité
    loyalty_points = fields.Float()

    # Restaurant
    table_id = fields.Many2one('restaurant.table')
    floor_id = fields.Many2one('restaurant.floor')

    # Notes
    note = fields.Text(string='Note interne')
    customer_note = fields.Text(string='Note client')

# pos.order.line - Ligne de commande
class PosOrderLine(models.Model):
    _name = 'pos.order.line'

    order_id = fields.Many2one('pos.order', required=True, ondelete='cascade')
    product_id = fields.Many2one('product.product', required=True)
    full_product_name = fields.Char()

    qty = fields.Float(default=1.0)
    price_unit = fields.Float()
    discount = fields.Float(default=0.0)

    price_subtotal = fields.Float(compute='_compute_amount')
    price_subtotal_incl = fields.Float(compute='_compute_amount')

    tax_ids = fields.Many2many('account.tax')

    # Options
    pack_lot_ids = fields.One2many('pos.pack.operation.lot', 'pos_order_line_id')
    refunded_qty = fields.Float()
    refunded_orderline_id = fields.Many2one('pos.order.line')

    # Restaurant
    note = fields.Char(string='Note')
    is_reward_line = fields.Boolean()
```

### 2. Méthodes de Paiement

```python
# pos.payment.method - Méthode de paiement
class PosPaymentMethod(models.Model):
    _name = 'pos.payment.method'

    name = fields.Char(required=True)

    # Type
    type = fields.Selection([
        ('cash', 'Espèces'),
        ('bank', 'Banque'),
        ('pay_later', 'Paiement différé'),
    ], default='cash')

    is_cash_count = fields.Boolean(string='Compté en caisse')
    split_transactions = fields.Boolean(string='Transactions séparées')

    # Journal
    journal_id = fields.Many2one('account.journal')

    # Terminal de paiement
    use_payment_terminal = fields.Selection([
        ('none', 'Aucun'),
        ('adyen', 'Adyen'),
        ('stripe', 'Stripe'),
        ('worldline', 'Worldline'),
    ], default='none')

    # Validation
    receivable_account_id = fields.Many2one('account.account')
    outstanding_account_id = fields.Many2one('account.account')

    company_id = fields.Many2one('res.company')
```

## Gestion des Sessions

### Ouverture de Session

```python
def open_pos_session(self, config_id, opening_balance=0.0):
    """
    Ouvrir une session de caisse.

    Args:
        config_id: int - ID de la configuration POS
        opening_balance: float - Fond de caisse

    Returns:
        pos.session record
    """
    config = self.env['pos.config'].browse(config_id)

    # Vérifier qu'aucune session n'est ouverte
    if config.current_session_id and config.current_session_state != 'closed':
        raise UserError(_("Une session est déjà ouverte pour cette caisse."))

    session = self.env['pos.session'].create({
        'config_id': config_id,
        'user_id': self.env.uid,
        'cash_register_balance_start': opening_balance,
    })

    # Ouvrir la session
    session.action_pos_session_open()

    return session
```

### Clôture de Session

```python
def close_pos_session(self, session, closing_balance=None):
    """
    Clôturer une session de caisse.

    Args:
        session: pos.session record
        closing_balance: float - Solde final de caisse (optionnel)
    """
    if closing_balance is not None:
        session.cash_register_balance_end_real = closing_balance

    # Vérifier que toutes les commandes sont validées
    draft_orders = session.order_ids.filtered(lambda o: o.state == 'draft')
    if draft_orders:
        raise UserError(_("%d commande(s) non validée(s).") % len(draft_orders))

    # Passer en contrôle de fermeture
    session.action_pos_session_closing_control()

    # Valider la clôture
    session.action_pos_session_close()

    return session
```

## Commandes POS

### Créer une Commande

```python
def create_pos_order(self, session, lines_data, partner=None, payments=None):
    """
    Créer une commande POS.

    Args:
        session: pos.session
        lines_data: list of dict - [{product_id, qty, price_unit, discount}, ...]
        partner: res.partner (optionnel)
        payments: list of dict - [{payment_method_id, amount}, ...]
    """
    # Préparer les lignes
    order_lines = []
    for line in lines_data:
        product = self.env['product.product'].browse(line['product_id'])
        price = line.get('price_unit', product.lst_price)

        order_lines.append((0, 0, {
            'product_id': product.id,
            'full_product_name': product.display_name,
            'qty': line.get('qty', 1),
            'price_unit': price,
            'discount': line.get('discount', 0),
            'tax_ids': [(6, 0, product.taxes_id.ids)],
        }))

    # Créer la commande
    order = self.env['pos.order'].create({
        'session_id': session.id,
        'partner_id': partner.id if partner else False,
        'lines': order_lines,
    })

    # Ajouter les paiements
    if payments:
        for payment in payments:
            self.env['pos.payment'].create({
                'pos_order_id': order.id,
                'payment_method_id': payment['payment_method_id'],
                'amount': payment['amount'],
            })

        # Valider si entièrement payé
        if order.amount_paid >= order.amount_total:
            order.action_pos_order_paid()

    return order
```

### Remboursement

```python
def refund_pos_order(self, order, lines_to_refund=None):
    """
    Créer un remboursement.

    Args:
        order: pos.order - Commande originale
        lines_to_refund: list of dict - [{line_id, qty}, ...] (optionnel, toutes si non spécifié)
    """
    refund_lines = []

    if lines_to_refund:
        for item in lines_to_refund:
            original_line = self.env['pos.order.line'].browse(item['line_id'])
            qty = item.get('qty', original_line.qty)
            refund_lines.append((0, 0, {
                'product_id': original_line.product_id.id,
                'qty': -qty,  # Quantité négative pour remboursement
                'price_unit': original_line.price_unit,
                'tax_ids': [(6, 0, original_line.tax_ids.ids)],
                'refunded_orderline_id': original_line.id,
            }))
    else:
        # Rembourser toute la commande
        for line in order.lines:
            refund_lines.append((0, 0, {
                'product_id': line.product_id.id,
                'qty': -line.qty,
                'price_unit': line.price_unit,
                'tax_ids': [(6, 0, line.tax_ids.ids)],
                'refunded_orderline_id': line.id,
            }))

    refund_order = self.env['pos.order'].create({
        'session_id': order.session_id.config_id.current_session_id.id,
        'partner_id': order.partner_id.id,
        'lines': refund_lines,
        'note': _('Remboursement de %s') % order.name,
    })

    return refund_order
```

## Programme de Fidélité

### Configuration Fidélité

```python
# loyalty.program - Programme de fidélité
class LoyaltyProgram(models.Model):
    _name = 'loyalty.program'

    name = fields.Char(required=True)
    active = fields.Boolean(default=True)

    program_type = fields.Selection([
        ('loyalty', 'Fidélité'),
        ('gift_card', 'Carte cadeau'),
        ('promotion', 'Promotion'),
        ('ewallet', 'Porte-monnaie électronique'),
        ('buy_x_get_y', 'Achetez X Obtenez Y'),
        ('next_order_coupons', 'Coupons prochaine commande'),
    ])

    # Règles
    rule_ids = fields.One2many('loyalty.rule', 'program_id')

    # Récompenses
    reward_ids = fields.One2many('loyalty.reward', 'program_id')

    # Portée
    trigger = fields.Selection([
        ('auto', 'Automatique'),
        ('with_code', 'Avec code'),
    ])
    applies_on = fields.Selection([
        ('current', 'Commande en cours'),
        ('future', 'Prochaine commande'),
        ('both', 'Les deux'),
    ])

    # Limites
    limit_usage = fields.Boolean()
    max_usage = fields.Integer()

# loyalty.rule - Règle de fidélité
class LoyaltyRule(models.Model):
    _name = 'loyalty.rule'

    program_id = fields.Many2one('loyalty.program', required=True)

    # Conditions
    reward_point_mode = fields.Selection([
        ('order', 'Par commande'),
        ('money', 'Par montant dépensé'),
        ('unit', 'Par unité achetée'),
    ])
    reward_point_amount = fields.Float(string='Points gagnés')
    minimum_qty = fields.Float(string='Quantité minimum')
    minimum_amount = fields.Float(string='Montant minimum')

    # Produits concernés
    product_ids = fields.Many2many('product.product')
    product_category_id = fields.Many2one('product.category')

# loyalty.reward - Récompense
class LoyaltyReward(models.Model):
    _name = 'loyalty.reward'

    program_id = fields.Many2one('loyalty.program', required=True)

    reward_type = fields.Selection([
        ('discount', 'Remise'),
        ('product', 'Produit gratuit'),
    ])

    # Remise
    discount = fields.Float()
    discount_mode = fields.Selection([
        ('percent', 'Pourcentage'),
        ('per_point', 'Par point'),
        ('per_order', 'Par commande'),
    ])
    discount_applicability = fields.Selection([
        ('order', 'Commande'),
        ('specific', 'Produits spécifiques'),
        ('cheapest', 'Produit le moins cher'),
    ])

    # Produit gratuit
    reward_product_id = fields.Many2one('product.product')
    reward_product_qty = fields.Integer(default=1)

    # Coût
    required_points = fields.Float(string='Points requis')
```

### Utilisation Fidélité

```python
def create_loyalty_program(self, name, points_per_euro=1, reward_value=0.01):
    """
    Créer un programme de fidélité simple.

    Args:
        name: str
        points_per_euro: float - Points gagnés par euro dépensé
        reward_value: float - Valeur en euros d'un point
    """
    program = self.env['loyalty.program'].create({
        'name': name,
        'program_type': 'loyalty',
        'trigger': 'auto',
        'applies_on': 'both',
    })

    # Règle: gagner des points
    self.env['loyalty.rule'].create({
        'program_id': program.id,
        'reward_point_mode': 'money',
        'reward_point_amount': points_per_euro,
        'minimum_amount': 0.01,
    })

    # Récompense: utiliser les points
    self.env['loyalty.reward'].create({
        'program_id': program.id,
        'reward_type': 'discount',
        'discount_mode': 'per_point',
        'discount': reward_value,
        'discount_applicability': 'order',
        'required_points': 1,
    })

    return program

def apply_loyalty_reward(self, order, reward, points_to_use):
    """
    Appliquer une récompense de fidélité.
    """
    if order.partner_id.loyalty_points < points_to_use:
        raise UserError(_("Points insuffisants."))

    discount_amount = points_to_use * reward.discount

    # Ajouter la ligne de récompense
    self.env['pos.order.line'].create({
        'order_id': order.id,
        'product_id': reward.discount_line_product_id.id,
        'qty': 1,
        'price_unit': -discount_amount,
        'is_reward_line': True,
    })

    # Déduire les points
    order.partner_id.loyalty_points -= points_to_use

    return order
```

## Cartes Cadeaux

```python
def create_gift_card_program(self, name):
    """
    Créer un programme de cartes cadeaux.
    """
    return self.env['loyalty.program'].create({
        'name': name,
        'program_type': 'gift_card',
        'trigger': 'with_code',
        'applies_on': 'current',
    })

def issue_gift_card(self, program, amount, partner=None):
    """
    Émettre une carte cadeau.
    """
    code = self.env['loyalty.card'].generate_code()

    card = self.env['loyalty.card'].create({
        'program_id': program.id,
        'partner_id': partner.id if partner else False,
        'code': code,
        'points': amount,
    })

    return card
```

## Gestion Restaurant

### Tables et Plans de Salle

```python
# restaurant.floor - Plan de salle
class RestaurantFloor(models.Model):
    _name = 'restaurant.floor'

    name = fields.Char(required=True)
    pos_config_ids = fields.Many2many('pos.config')
    background_color = fields.Char(default='#FFFFFF')
    table_ids = fields.One2many('restaurant.table', 'floor_id')

# restaurant.table - Table
class RestaurantTable(models.Model):
    _name = 'restaurant.table'

    name = fields.Char(required=True)
    floor_id = fields.Many2one('restaurant.floor')
    seats = fields.Integer(default=4)
    position_h = fields.Float()
    position_v = fields.Float()
    width = fields.Float()
    height = fields.Float()
    shape = fields.Selection([
        ('square', 'Carré'),
        ('round', 'Rond'),
    ], default='square')
    color = fields.Char()
    active = fields.Boolean(default=True)

def setup_restaurant_floor(self, config, floor_name, tables):
    """
    Configurer un plan de salle.

    Args:
        config: pos.config
        floor_name: str
        tables: list of dict - [{name, seats, shape}, ...]
    """
    floor = self.env['restaurant.floor'].create({
        'name': floor_name,
        'pos_config_ids': [(4, config.id)],
    })

    for idx, table_data in enumerate(tables):
        self.env['restaurant.table'].create({
            'name': table_data.get('name', f"Table {idx + 1}"),
            'floor_id': floor.id,
            'seats': table_data.get('seats', 4),
            'shape': table_data.get('shape', 'square'),
            'position_h': (idx % 5) * 150,
            'position_v': (idx // 5) * 150,
        })

    return floor
```

## Reporting POS

### Rapport de Ventes

```python
def get_pos_sales_report(self, date_from, date_to, config_id=None):
    """
    Générer un rapport des ventes POS.
    """
    domain = [
        ('date_order', '>=', date_from),
        ('date_order', '<=', date_to),
        ('state', 'in', ['paid', 'done', 'invoiced']),
    ]
    if config_id:
        domain.append(('config_id', '=', config_id))

    orders = self.env['pos.order'].search(domain)

    # Ventes par produit
    sales_by_product = {}
    for order in orders:
        for line in order.lines.filtered(lambda l: l.qty > 0):
            product_id = line.product_id.id
            if product_id not in sales_by_product:
                sales_by_product[product_id] = {
                    'product': line.product_id.name,
                    'qty': 0,
                    'amount': 0,
                }
            sales_by_product[product_id]['qty'] += line.qty
            sales_by_product[product_id]['amount'] += line.price_subtotal_incl

    # Ventes par méthode de paiement
    sales_by_payment = {}
    for order in orders:
        for payment in order.payment_ids:
            method = payment.payment_method_id.name
            if method not in sales_by_payment:
                sales_by_payment[method] = 0
            sales_by_payment[method] += payment.amount

    return {
        'total_orders': len(orders),
        'total_sales': sum(orders.mapped('amount_total')),
        'total_tax': sum(orders.mapped('amount_tax')),
        'average_ticket': sum(orders.mapped('amount_total')) / len(orders) if orders else 0,
        'sales_by_product': list(sales_by_product.values()),
        'sales_by_payment': sales_by_payment,
    }
```

## Bonnes Pratiques

1. **Toujours clôturer les sessions** en fin de journée
2. **Vérifier le fond de caisse** à l'ouverture et fermeture
3. **Former les caissiers** sur les procédures de remboursement
4. **Configurer les méthodes de paiement** adaptées au commerce
5. **Utiliser les catégories** pour organiser les produits
6. **Synchroniser le stock** régulièrement
7. **Sauvegarder les données** avant mise à jour
