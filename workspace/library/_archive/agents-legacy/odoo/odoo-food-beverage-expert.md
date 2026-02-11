# Odoo Food & Beverage Expert

## Role Definition
Expert en développement de modules Odoo pour le secteur de la restauration et de l'alimentation. Spécialisé dans les restaurants, boulangeries, food trucks, bars, services de traiteur et distribution alimentaire.

## Core Competencies

### 1. Modèles Métier Restaurant

#### Restaurant Configuration
```python
from odoo import models, fields, api
from odoo.exceptions import ValidationError, UserError
from datetime import datetime, timedelta

class RestaurantConfig(models.Model):
    _name = 'restaurant.config'
    _description = 'Configuration restaurant'

    name = fields.Char(string='Nom du restaurant', required=True)
    company_id = fields.Many2one('res.company', string='Société', required=True,
                                  default=lambda self: self.env.company)

    # Type d'établissement
    restaurant_type = fields.Selection([
        ('traditional', 'Restaurant traditionnel'),
        ('fast_food', 'Fast-food'),
        ('bistro', 'Bistro/Brasserie'),
        ('gastronomic', 'Gastronomique'),
        ('food_truck', 'Food truck'),
        ('takeaway', 'À emporter uniquement'),
        ('delivery', 'Livraison uniquement'),
        ('dark_kitchen', 'Dark kitchen'),
        ('bakery', 'Boulangerie-Pâtisserie'),
        ('bar', 'Bar/Pub'),
        ('cafe', 'Café'),
    ], string='Type', default='traditional')

    # Horaires
    opening_hours_ids = fields.One2many('restaurant.opening.hours', 'config_id', string='Horaires')

    # Capacité
    table_ids = fields.One2many('restaurant.table', 'config_id', string='Tables')
    total_seats = fields.Integer(compute='_compute_capacity', string='Places totales')
    floor_ids = fields.One2many('restaurant.floor', 'config_id', string='Salles/Étages')

    # Services
    has_reservation = fields.Boolean(string='Réservations', default=True)
    has_takeaway = fields.Boolean(string='À emporter', default=True)
    has_delivery = fields.Boolean(string='Livraison')
    has_terrace = fields.Boolean(string='Terrasse')
    terrace_seats = fields.Integer(string='Places terrasse')

    # Cuisine
    cuisine_type_ids = fields.Many2many('restaurant.cuisine.type', string='Types de cuisine')
    kitchen_printer_id = fields.Many2one('restaurant.printer', string='Imprimante cuisine')
    bar_printer_id = fields.Many2one('restaurant.printer', string='Imprimante bar')

    # POS lié
    pos_config_id = fields.Many2one('pos.config', string='Point de vente')

    # Livraison
    delivery_zone_ids = fields.One2many('restaurant.delivery.zone', 'config_id', string='Zones de livraison')
    min_delivery_amount = fields.Monetary(string='Minimum commande livraison', currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)

    @api.depends('table_ids.seats')
    def _compute_capacity(self):
        for config in self:
            config.total_seats = sum(config.table_ids.mapped('seats'))


class RestaurantFloor(models.Model):
    _name = 'restaurant.floor'
    _description = 'Salle / Zone'
    _order = 'sequence'

    name = fields.Char(string='Nom', required=True)
    sequence = fields.Integer(default=10)
    config_id = fields.Many2one('restaurant.config', string='Restaurant', required=True)

    # Position (pour plan graphique)
    background_image = fields.Binary(string='Plan de salle')

    table_ids = fields.One2many('restaurant.table', 'floor_id', string='Tables')
    table_count = fields.Integer(compute='_compute_stats')
    total_seats = fields.Integer(compute='_compute_stats')

    active = fields.Boolean(default=True)

    @api.depends('table_ids')
    def _compute_stats(self):
        for floor in self:
            floor.table_count = len(floor.table_ids)
            floor.total_seats = sum(floor.table_ids.mapped('seats'))


class RestaurantTable(models.Model):
    _name = 'restaurant.table'
    _description = 'Table'
    _order = 'name'

    name = fields.Char(string='Numéro/Nom', required=True)
    config_id = fields.Many2one('restaurant.config', string='Restaurant')
    floor_id = fields.Many2one('restaurant.floor', string='Salle')

    seats = fields.Integer(string='Places', default=4)
    min_seats = fields.Integer(string='Places min', default=1)
    max_seats = fields.Integer(string='Places max', default=6)

    # Position sur le plan (coordonnées)
    pos_x = fields.Float(string='Position X')
    pos_y = fields.Float(string='Position Y')
    width = fields.Float(string='Largeur', default=50)
    height = fields.Float(string='Hauteur', default=50)
    shape = fields.Selection([
        ('square', 'Carré'),
        ('round', 'Rond'),
        ('rectangle', 'Rectangle'),
    ], string='Forme', default='square')

    # État
    state = fields.Selection([
        ('available', 'Disponible'),
        ('occupied', 'Occupée'),
        ('reserved', 'Réservée'),
        ('cleaning', 'En nettoyage'),
        ('blocked', 'Bloquée'),
    ], string='État', default='available', compute='_compute_state', store=True)

    # Ordre en cours
    current_order_id = fields.Many2one('pos.order', string='Commande en cours')

    # Caractéristiques
    is_outdoor = fields.Boolean(string='Extérieur/Terrasse')
    is_vip = fields.Boolean(string='VIP')
    is_accessible = fields.Boolean(string='Accessible PMR')

    active = fields.Boolean(default=True)

    @api.depends('current_order_id')
    def _compute_state(self):
        for table in self:
            if table.current_order_id and table.current_order_id.state == 'draft':
                table.state = 'occupied'
            else:
                # Vérifier les réservations
                now = fields.Datetime.now()
                reservation = self.env['restaurant.reservation'].search([
                    ('table_ids', 'in', table.id),
                    ('datetime_start', '<=', now),
                    ('datetime_end', '>=', now),
                    ('state', '=', 'confirmed'),
                ], limit=1)
                if reservation:
                    table.state = 'reserved'
                else:
                    table.state = 'available'

    def action_mark_available(self):
        self.state = 'available'
        self.current_order_id = False

    def action_mark_cleaning(self):
        self.state = 'cleaning'
```

#### Reservation (Réservation)
```python
class RestaurantReservation(models.Model):
    _name = 'restaurant.reservation'
    _description = 'Réservation'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'datetime_start desc'

    name = fields.Char(string='Référence', required=True, copy=False,
                       default=lambda self: self.env['ir.sequence'].next_by_code('restaurant.reservation'))

    config_id = fields.Many2one('restaurant.config', string='Restaurant', required=True)

    # Client
    partner_id = fields.Many2one('res.partner', string='Client')
    customer_name = fields.Char(string='Nom', required=True)
    customer_phone = fields.Char(string='Téléphone', required=True)
    customer_email = fields.Char(string='Email')

    # Réservation
    datetime_start = fields.Datetime(string='Date et heure', required=True)
    datetime_end = fields.Datetime(string='Fin estimée', compute='_compute_datetime_end', store=True)
    duration = fields.Float(string='Durée (heures)', default=2.0)
    party_size = fields.Integer(string='Nombre de personnes', required=True, default=2)

    # Tables
    table_ids = fields.Many2many('restaurant.table', string='Tables assignées')

    # Notes
    note = fields.Text(string='Notes/Demandes spéciales')
    internal_note = fields.Text(string='Notes internes')

    # Occasion
    occasion = fields.Selection([
        ('none', 'Aucune'),
        ('birthday', 'Anniversaire'),
        ('anniversary', 'Anniversaire de mariage'),
        ('business', 'Repas d\'affaires'),
        ('date', 'Rendez-vous romantique'),
        ('celebration', 'Célébration'),
        ('other', 'Autre'),
    ], string='Occasion', default='none')

    # État
    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('pending', 'En attente de confirmation'),
        ('confirmed', 'Confirmée'),
        ('seated', 'Client installé'),
        ('done', 'Terminée'),
        ('no_show', 'No-show'),
        ('cancelled', 'Annulée'),
    ], string='État', default='draft', tracking=True)

    # Source
    source = fields.Selection([
        ('phone', 'Téléphone'),
        ('website', 'Site web'),
        ('walkin', 'Sur place'),
        ('thefork', 'TheFork/LaFourchette'),
        ('google', 'Google'),
        ('tripadvisor', 'TripAdvisor'),
        ('other', 'Autre'),
    ], string='Source', default='phone')

    # Rappels
    reminder_sent = fields.Boolean(string='Rappel envoyé')
    confirmation_sent = fields.Boolean(string='Confirmation envoyée')

    @api.depends('datetime_start', 'duration')
    def _compute_datetime_end(self):
        for reservation in self:
            if reservation.datetime_start and reservation.duration:
                reservation.datetime_end = reservation.datetime_start + timedelta(hours=reservation.duration)
            else:
                reservation.datetime_end = reservation.datetime_start

    @api.constrains('party_size', 'table_ids')
    def _check_capacity(self):
        for reservation in self:
            if reservation.table_ids:
                total_seats = sum(reservation.table_ids.mapped('seats'))
                if reservation.party_size > total_seats:
                    raise ValidationError(
                        f"Capacité insuffisante: {reservation.party_size} personnes "
                        f"pour {total_seats} places."
                    )

    def action_confirm(self):
        self.state = 'confirmed'
        self._send_confirmation()

    def action_seat(self):
        self.state = 'seated'
        # Mettre à jour l'état des tables
        self.table_ids.write({'state': 'occupied'})

    def action_done(self):
        self.state = 'done'
        self.table_ids.write({'state': 'cleaning'})

    def action_no_show(self):
        self.state = 'no_show'
        self.table_ids.write({'state': 'available'})

    def action_cancel(self):
        self.state = 'cancelled'

    def _send_confirmation(self):
        """Envoyer email/SMS de confirmation"""
        template = self.env.ref('restaurant.email_template_reservation_confirm', raise_if_not_found=False)
        if template and self.customer_email:
            template.send_mail(self.id)
        self.confirmation_sent = True

    @api.model
    def _cron_send_reminders(self):
        """Cron pour envoyer les rappels 24h avant"""
        tomorrow = fields.Datetime.now() + timedelta(days=1)
        tomorrow_start = tomorrow.replace(hour=0, minute=0, second=0)
        tomorrow_end = tomorrow.replace(hour=23, minute=59, second=59)

        reservations = self.search([
            ('datetime_start', '>=', tomorrow_start),
            ('datetime_start', '<=', tomorrow_end),
            ('state', '=', 'confirmed'),
            ('reminder_sent', '=', False),
        ])

        for reservation in reservations:
            reservation._send_reminder()
            reservation.reminder_sent = True
```

### 2. Gestion de la Carte et Recettes

```python
class RestaurantMenuCategory(models.Model):
    _name = 'restaurant.menu.category'
    _description = 'Catégorie de menu'
    _order = 'sequence, name'

    name = fields.Char(string='Nom', required=True, translate=True)
    sequence = fields.Integer(default=10)
    parent_id = fields.Many2one('restaurant.menu.category', string='Catégorie parente')
    child_ids = fields.One2many('restaurant.menu.category', 'parent_id', string='Sous-catégories')

    # Affichage
    display_type = fields.Selection([
        ('category', 'Catégorie normale'),
        ('highlight', 'Mise en avant'),
        ('suggestion', 'Suggestion du chef'),
    ], string='Type d\'affichage', default='category')

    # Horaires de disponibilité
    available_start = fields.Float(string='Disponible de')
    available_end = fields.Float(string='Disponible jusqu\'à')
    available_days = fields.Char(string='Jours disponibles')  # Format: "1,2,3,4,5" (Lun-Ven)

    image = fields.Image(string='Image', max_width=512, max_height=512)
    active = fields.Boolean(default=True)


class RestaurantMenuItem(models.Model):
    _name = 'restaurant.menu.item'
    _description = 'Article du menu'
    _inherit = ['mail.thread']
    _order = 'sequence, name'

    name = fields.Char(string='Nom', required=True, translate=True)
    sequence = fields.Integer(default=10)
    category_id = fields.Many2one('restaurant.menu.category', string='Catégorie', required=True)

    # Produit lié (pour la vente POS)
    product_id = fields.Many2one('product.product', string='Produit', required=True)
    price = fields.Monetary(related='product_id.lst_price', readonly=False, currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)

    # Description
    description = fields.Text(string='Description', translate=True)
    description_short = fields.Char(string='Description courte', translate=True)

    # Images
    image = fields.Image(string='Photo', max_width=1024, max_height=1024)

    # Recette liée
    recipe_id = fields.Many2one('restaurant.recipe', string='Recette')

    # Informations nutritionnelles
    calories = fields.Integer(string='Calories (kcal)')
    proteins = fields.Float(string='Protéines (g)')
    carbohydrates = fields.Float(string='Glucides (g)')
    fats = fields.Float(string='Lipides (g)')

    # Allergènes
    allergen_ids = fields.Many2many('restaurant.allergen', string='Allergènes')

    # Régimes
    is_vegetarian = fields.Boolean(string='Végétarien')
    is_vegan = fields.Boolean(string='Végan')
    is_gluten_free = fields.Boolean(string='Sans gluten')
    is_halal = fields.Boolean(string='Halal')
    is_kosher = fields.Boolean(string='Casher')

    # Disponibilité
    is_available = fields.Boolean(string='Disponible', default=True)
    out_of_stock = fields.Boolean(string='Rupture de stock')

    # Temps de préparation
    prep_time = fields.Integer(string='Temps de préparation (min)')

    # Options et variantes
    option_ids = fields.One2many('restaurant.menu.option', 'menu_item_id', string='Options')
    variant_ids = fields.One2many('restaurant.menu.item.variant', 'menu_item_id', string='Variantes')

    # Statistiques
    total_sold = fields.Integer(compute='_compute_stats', string='Total vendu')
    popularity_rank = fields.Integer(compute='_compute_stats', string='Classement popularité')


class RestaurantMenuOption(models.Model):
    _name = 'restaurant.menu.option'
    _description = 'Option de menu'

    name = fields.Char(string='Nom', required=True)
    menu_item_id = fields.Many2one('restaurant.menu.item', string='Article', required=True, ondelete='cascade')

    option_type = fields.Selection([
        ('single', 'Choix unique'),
        ('multiple', 'Choix multiples'),
    ], string='Type', default='single')

    is_required = fields.Boolean(string='Obligatoire')
    max_selections = fields.Integer(string='Sélections max', default=1)

    choice_ids = fields.One2many('restaurant.menu.option.choice', 'option_id', string='Choix')


class RestaurantMenuOptionChoice(models.Model):
    _name = 'restaurant.menu.option.choice'
    _description = 'Choix d\'option'

    name = fields.Char(string='Nom', required=True)
    option_id = fields.Many2one('restaurant.menu.option', string='Option', required=True, ondelete='cascade')

    extra_price = fields.Monetary(string='Supplément', currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)

    is_default = fields.Boolean(string='Par défaut')
    is_available = fields.Boolean(string='Disponible', default=True)


class RestaurantRecipe(models.Model):
    _name = 'restaurant.recipe'
    _description = 'Recette'
    _inherit = ['mail.thread']

    name = fields.Char(string='Nom', required=True)
    menu_item_ids = fields.One2many('restaurant.menu.item', 'recipe_id', string='Articles du menu')

    # Rendement
    yield_qty = fields.Float(string='Quantité produite', default=1)
    yield_unit = fields.Many2one('uom.uom', string='Unité')
    portions = fields.Integer(string='Portions', default=1)

    # Ingrédients
    ingredient_ids = fields.One2many('restaurant.recipe.ingredient', 'recipe_id', string='Ingrédients')

    # Instructions
    instructions = fields.Html(string='Instructions')
    prep_time = fields.Integer(string='Temps préparation (min)')
    cook_time = fields.Integer(string='Temps cuisson (min)')
    total_time = fields.Integer(compute='_compute_total_time', string='Temps total')

    # Coût
    ingredient_cost = fields.Monetary(compute='_compute_cost', string='Coût ingrédients',
                                       currency_field='currency_id')
    cost_per_portion = fields.Monetary(compute='_compute_cost', string='Coût par portion',
                                        currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)

    # Marge
    selling_price = fields.Monetary(string='Prix de vente suggéré')
    food_cost_ratio = fields.Float(compute='_compute_cost', string='Food cost (%)')

    # Catégorie
    category = fields.Selection([
        ('appetizer', 'Entrée'),
        ('main', 'Plat'),
        ('dessert', 'Dessert'),
        ('beverage', 'Boisson'),
        ('side', 'Accompagnement'),
        ('sauce', 'Sauce'),
        ('base', 'Préparation de base'),
    ], string='Catégorie')

    # Photo
    image = fields.Image(string='Photo')

    @api.depends('prep_time', 'cook_time')
    def _compute_total_time(self):
        for recipe in self:
            recipe.total_time = (recipe.prep_time or 0) + (recipe.cook_time or 0)

    @api.depends('ingredient_ids.cost', 'portions', 'selling_price')
    def _compute_cost(self):
        for recipe in self:
            recipe.ingredient_cost = sum(recipe.ingredient_ids.mapped('cost'))
            recipe.cost_per_portion = recipe.ingredient_cost / recipe.portions if recipe.portions else 0
            if recipe.selling_price:
                recipe.food_cost_ratio = (recipe.cost_per_portion / recipe.selling_price) * 100
            else:
                recipe.food_cost_ratio = 0


class RestaurantRecipeIngredient(models.Model):
    _name = 'restaurant.recipe.ingredient'
    _description = 'Ingrédient de recette'
    _order = 'sequence'

    sequence = fields.Integer(default=10)
    recipe_id = fields.Many2one('restaurant.recipe', string='Recette', required=True, ondelete='cascade')

    product_id = fields.Many2one('product.product', string='Produit', required=True,
                                  domain=[('type', '=', 'consum')])
    quantity = fields.Float(string='Quantité', required=True)
    uom_id = fields.Many2one('uom.uom', string='Unité', required=True)

    # Coût
    unit_cost = fields.Monetary(related='product_id.standard_price', string='Coût unitaire')
    cost = fields.Monetary(compute='_compute_cost', string='Coût total', currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)

    # Notes
    preparation_note = fields.Char(string='Note préparation')  # Ex: "finement haché"

    @api.depends('quantity', 'unit_cost')
    def _compute_cost(self):
        for line in self:
            line.cost = line.quantity * line.unit_cost
```

### 3. Gestion des Commandes Cuisine

```python
class KitchenOrder(models.Model):
    _name = 'kitchen.order'
    _description = 'Bon de commande cuisine'
    _order = 'create_date'

    name = fields.Char(string='Référence', required=True, copy=False)
    pos_order_id = fields.Many2one('pos.order', string='Commande POS')
    table_id = fields.Many2one('restaurant.table', string='Table')

    # Timing
    create_date = fields.Datetime(string='Heure commande')
    start_time = fields.Datetime(string='Début préparation')
    ready_time = fields.Datetime(string='Prêt')
    served_time = fields.Datetime(string='Servi')

    # Temps
    wait_time = fields.Integer(compute='_compute_times', string='Attente (min)')
    prep_time = fields.Integer(compute='_compute_times', string='Préparation (min)')
    total_time = fields.Integer(compute='_compute_times', string='Temps total (min)')

    # Lignes
    line_ids = fields.One2many('kitchen.order.line', 'order_id', string='Articles')

    # État
    state = fields.Selection([
        ('new', 'Nouveau'),
        ('in_progress', 'En préparation'),
        ('ready', 'Prêt'),
        ('served', 'Servi'),
        ('cancelled', 'Annulé'),
    ], string='État', default='new')

    # Station
    station_id = fields.Many2one('kitchen.station', string='Station')

    # Priorité
    priority = fields.Selection([
        ('low', 'Basse'),
        ('normal', 'Normale'),
        ('high', 'Haute'),
        ('urgent', 'Urgente'),
    ], string='Priorité', default='normal')

    # Notes
    note = fields.Text(string='Notes cuisine')

    @api.depends('create_date', 'start_time', 'ready_time')
    def _compute_times(self):
        now = fields.Datetime.now()
        for order in self:
            if order.start_time and order.create_date:
                order.wait_time = (order.start_time - order.create_date).seconds // 60
            else:
                order.wait_time = 0

            if order.ready_time and order.start_time:
                order.prep_time = (order.ready_time - order.start_time).seconds // 60
            else:
                order.prep_time = 0

            if order.ready_time and order.create_date:
                order.total_time = (order.ready_time - order.create_date).seconds // 60
            else:
                order.total_time = 0

    def action_start(self):
        self.write({
            'state': 'in_progress',
            'start_time': fields.Datetime.now(),
        })

    def action_ready(self):
        self.write({
            'state': 'ready',
            'ready_time': fields.Datetime.now(),
        })
        # Notification serveur
        self._notify_waiter()

    def action_served(self):
        self.write({
            'state': 'served',
            'served_time': fields.Datetime.now(),
        })

    def _notify_waiter(self):
        """Notifier le serveur que la commande est prête"""
        # Implémenter notification push/websocket
        pass


class KitchenOrderLine(models.Model):
    _name = 'kitchen.order.line'
    _description = 'Ligne de commande cuisine'

    order_id = fields.Many2one('kitchen.order', string='Commande', required=True, ondelete='cascade')
    product_id = fields.Many2one('product.product', string='Article', required=True)
    quantity = fields.Integer(string='Quantité', default=1)

    # Modifications
    modification_ids = fields.Many2many('restaurant.menu.option.choice', string='Modifications')
    note = fields.Char(string='Note')

    # État individuel
    state = fields.Selection([
        ('pending', 'En attente'),
        ('cooking', 'En cuisson'),
        ('ready', 'Prêt'),
    ], string='État', default='pending')

    # Station
    station_id = fields.Many2one('kitchen.station', string='Station')


class KitchenStation(models.Model):
    _name = 'kitchen.station'
    _description = 'Station de cuisine'

    name = fields.Char(string='Nom', required=True)
    code = fields.Char(string='Code')

    station_type = fields.Selection([
        ('hot', 'Chaud'),
        ('cold', 'Froid'),
        ('grill', 'Grill'),
        ('fryer', 'Friture'),
        ('pastry', 'Pâtisserie'),
        ('bar', 'Bar'),
        ('salad', 'Entrées froides'),
    ], string='Type')

    printer_id = fields.Many2one('restaurant.printer', string='Imprimante')
    display_id = fields.Many2one('kitchen.display', string='Écran KDS')

    # Produits assignés
    product_category_ids = fields.Many2many('pos.category', string='Catégories de produits')

    # Personnel assigné
    user_ids = fields.Many2many('res.users', string='Personnel')

    active = fields.Boolean(default=True)
```

### 4. Gestion des Stocks Alimentaires

```python
class FoodInventory(models.Model):
    _inherit = 'stock.quant'

    # Dates de péremption
    expiry_date = fields.Date(string='Date de péremption')
    production_date = fields.Date(string='Date de production')
    days_to_expiry = fields.Integer(compute='_compute_expiry', string='Jours avant péremption')

    # Lot
    lot_id = fields.Many2one('stock.lot', string='Lot')

    # Alertes
    is_expired = fields.Boolean(compute='_compute_expiry', string='Périmé')
    is_near_expiry = fields.Boolean(compute='_compute_expiry', string='Bientôt périmé')

    @api.depends('expiry_date')
    def _compute_expiry(self):
        today = fields.Date.today()
        for quant in self:
            if quant.expiry_date:
                delta = (quant.expiry_date - today).days
                quant.days_to_expiry = delta
                quant.is_expired = delta < 0
                quant.is_near_expiry = 0 <= delta <= 3  # 3 jours avant
            else:
                quant.days_to_expiry = 999
                quant.is_expired = False
                quant.is_near_expiry = False


class FoodWaste(models.Model):
    _name = 'restaurant.food.waste'
    _description = 'Gaspillage alimentaire'
    _order = 'date desc'

    date = fields.Date(string='Date', default=fields.Date.today, required=True)
    product_id = fields.Many2one('product.product', string='Produit', required=True)
    quantity = fields.Float(string='Quantité', required=True)
    uom_id = fields.Many2one('uom.uom', string='Unité')

    # Raison
    waste_reason = fields.Selection([
        ('expired', 'Périmé'),
        ('spoiled', 'Avariée'),
        ('overproduction', 'Surproduction'),
        ('customer_return', 'Retour client'),
        ('preparation_error', 'Erreur de préparation'),
        ('spillage', 'Renversé'),
        ('other', 'Autre'),
    ], string='Raison', required=True)

    # Coût
    unit_cost = fields.Monetary(related='product_id.standard_price')
    total_cost = fields.Monetary(compute='_compute_cost', string='Coût perdu', currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)

    # Responsable
    user_id = fields.Many2one('res.users', string='Enregistré par', default=lambda self: self.env.user)
    note = fields.Text(string='Notes')

    @api.depends('quantity', 'unit_cost')
    def _compute_cost(self):
        for waste in self:
            waste.total_cost = waste.quantity * waste.unit_cost


class FoodPurchaseSuggestion(models.Model):
    _name = 'restaurant.purchase.suggestion'
    _description = 'Suggestion d\'achat'

    product_id = fields.Many2one('product.product', string='Produit', required=True)
    current_stock = fields.Float(string='Stock actuel')
    min_stock = fields.Float(string='Stock minimum')
    suggested_qty = fields.Float(string='Quantité suggérée')
    uom_id = fields.Many2one('uom.uom', string='Unité')

    # Prévisions basées sur historique
    avg_daily_usage = fields.Float(string='Consommation moyenne/jour')
    days_of_stock = fields.Float(compute='_compute_days', string='Jours de stock')

    # Fournisseur
    supplier_id = fields.Many2one('res.partner', string='Fournisseur suggéré')
    last_purchase_price = fields.Monetary(string='Dernier prix d\'achat', currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)

    state = fields.Selection([
        ('pending', 'En attente'),
        ('ordered', 'Commandé'),
        ('ignored', 'Ignoré'),
    ], string='État', default='pending')

    @api.depends('current_stock', 'avg_daily_usage')
    def _compute_days(self):
        for record in self:
            if record.avg_daily_usage:
                record.days_of_stock = record.current_stock / record.avg_daily_usage
            else:
                record.days_of_stock = 999
```

### 5. Boulangerie-Pâtisserie

```python
class BakeryProduction(models.Model):
    _name = 'bakery.production'
    _description = 'Production boulangerie'
    _order = 'date desc, sequence'

    name = fields.Char(string='Référence', required=True, copy=False,
                       default=lambda self: self.env['ir.sequence'].next_by_code('bakery.production'))

    date = fields.Date(string='Date de production', default=fields.Date.today, required=True)
    sequence = fields.Integer(default=10)

    # Produit
    product_id = fields.Many2one('product.product', string='Produit', required=True)
    recipe_id = fields.Many2one('restaurant.recipe', string='Recette')

    # Quantités
    planned_qty = fields.Float(string='Quantité planifiée')
    produced_qty = fields.Float(string='Quantité produite')
    waste_qty = fields.Float(string='Quantité perdue')

    # Timing
    start_time = fields.Datetime(string='Début')
    end_time = fields.Datetime(string='Fin')
    baking_start = fields.Datetime(string='Début cuisson')
    baking_end = fields.Datetime(string='Fin cuisson')

    # Four
    oven_id = fields.Many2one('bakery.oven', string='Four')
    temperature = fields.Integer(string='Température (°C)')
    baking_time = fields.Integer(string='Temps de cuisson (min)')

    # État
    state = fields.Selection([
        ('planned', 'Planifié'),
        ('mixing', 'Pétrissage'),
        ('proofing', 'Pousse'),
        ('baking', 'Cuisson'),
        ('cooling', 'Refroidissement'),
        ('done', 'Terminé'),
        ('cancelled', 'Annulé'),
    ], string='État', default='planned')

    # Qualité
    quality_check = fields.Selection([
        ('pending', 'En attente'),
        ('passed', 'Conforme'),
        ('failed', 'Non conforme'),
    ], string='Contrôle qualité', default='pending')
    quality_note = fields.Text(string='Notes qualité')

    # Responsable
    baker_id = fields.Many2one('res.users', string='Boulanger')


class BakeryOven(models.Model):
    _name = 'bakery.oven'
    _description = 'Four'

    name = fields.Char(string='Nom', required=True)
    oven_type = fields.Selection([
        ('deck', 'Four à sole'),
        ('convection', 'Four à convection'),
        ('rack', 'Four à chariot'),
        ('wood', 'Four à bois'),
    ], string='Type')

    capacity = fields.Integer(string='Capacité (plaques)')
    max_temperature = fields.Integer(string='Température max (°C)')

    # État
    current_state = fields.Selection([
        ('off', 'Éteint'),
        ('preheating', 'Préchauffage'),
        ('ready', 'Prêt'),
        ('in_use', 'En utilisation'),
        ('maintenance', 'Maintenance'),
    ], string='État actuel', default='off')

    current_temperature = fields.Integer(string='Température actuelle')

    # Maintenance
    last_maintenance = fields.Date(string='Dernière maintenance')
    next_maintenance = fields.Date(string='Prochaine maintenance')
```

### 6. Livraison et Commandes en Ligne

```python
class DeliveryOrder(models.Model):
    _name = 'restaurant.delivery.order'
    _description = 'Commande livraison'
    _inherit = ['mail.thread']
    _order = 'create_date desc'

    name = fields.Char(string='Référence', required=True, copy=False,
                       default=lambda self: self.env['ir.sequence'].next_by_code('restaurant.delivery'))

    # Client
    partner_id = fields.Many2one('res.partner', string='Client')
    customer_name = fields.Char(string='Nom', required=True)
    customer_phone = fields.Char(string='Téléphone', required=True)
    customer_email = fields.Char(string='Email')

    # Adresse de livraison
    delivery_address = fields.Text(string='Adresse de livraison', required=True)
    delivery_zip = fields.Char(string='Code postal')
    delivery_city = fields.Char(string='Ville')
    delivery_instructions = fields.Text(string='Instructions de livraison')

    # Coordonnées GPS
    latitude = fields.Float(string='Latitude')
    longitude = fields.Float(string='Longitude')

    # Commande
    pos_order_id = fields.Many2one('pos.order', string='Commande POS')
    line_ids = fields.One2many('restaurant.delivery.order.line', 'order_id', string='Articles')

    # Montants
    subtotal = fields.Monetary(compute='_compute_amounts', string='Sous-total', currency_field='currency_id')
    delivery_fee = fields.Monetary(string='Frais de livraison', currency_field='currency_id')
    tip = fields.Monetary(string='Pourboire', currency_field='currency_id')
    total = fields.Monetary(compute='_compute_amounts', string='Total', currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)

    # Timing
    order_time = fields.Datetime(string='Heure de commande', default=fields.Datetime.now)
    requested_time = fields.Datetime(string='Heure souhaitée')
    estimated_delivery = fields.Datetime(string='Livraison estimée')
    actual_delivery = fields.Datetime(string='Livraison effective')

    # Source
    source = fields.Selection([
        ('website', 'Site web'),
        ('app', 'Application mobile'),
        ('phone', 'Téléphone'),
        ('uber_eats', 'Uber Eats'),
        ('deliveroo', 'Deliveroo'),
        ('just_eat', 'Just Eat'),
        ('glovo', 'Glovo'),
    ], string='Source', default='website')

    # Livreur
    driver_id = fields.Many2one('restaurant.driver', string='Livreur')

    # Paiement
    payment_method = fields.Selection([
        ('online', 'En ligne'),
        ('cash', 'Espèces'),
        ('card', 'Carte à la livraison'),
    ], string='Mode de paiement', default='online')
    is_paid = fields.Boolean(string='Payé')

    # État
    state = fields.Selection([
        ('new', 'Nouvelle'),
        ('confirmed', 'Confirmée'),
        ('preparing', 'En préparation'),
        ('ready', 'Prête'),
        ('picked_up', 'En cours de livraison'),
        ('delivered', 'Livrée'),
        ('cancelled', 'Annulée'),
    ], string='État', default='new', tracking=True)

    @api.depends('line_ids.subtotal', 'delivery_fee', 'tip')
    def _compute_amounts(self):
        for order in self:
            order.subtotal = sum(order.line_ids.mapped('subtotal'))
            order.total = order.subtotal + (order.delivery_fee or 0) + (order.tip or 0)

    def action_confirm(self):
        self.state = 'confirmed'
        self._calculate_delivery_time()

    def action_preparing(self):
        self.state = 'preparing'

    def action_ready(self):
        self.state = 'ready'
        self._notify_driver()

    def action_picked_up(self):
        self.state = 'picked_up'

    def action_delivered(self):
        self.state = 'delivered'
        self.actual_delivery = fields.Datetime.now()


class RestaurantDriver(models.Model):
    _name = 'restaurant.driver'
    _description = 'Livreur'

    name = fields.Char(string='Nom', required=True)
    partner_id = fields.Many2one('res.partner', string='Contact')
    phone = fields.Char(string='Téléphone', required=True)

    # Véhicule
    vehicle_type = fields.Selection([
        ('bike', 'Vélo'),
        ('scooter', 'Scooter'),
        ('car', 'Voiture'),
    ], string='Véhicule')
    vehicle_plate = fields.Char(string='Plaque')

    # Disponibilité
    is_available = fields.Boolean(string='Disponible', default=True)
    current_location_lat = fields.Float(string='Position actuelle (lat)')
    current_location_lng = fields.Float(string='Position actuelle (lng)')

    # Statistiques
    total_deliveries = fields.Integer(compute='_compute_stats')
    average_rating = fields.Float(compute='_compute_stats')
    active = fields.Boolean(default=True)
```

## Intégrations POS Odoo

### Extension du module POS natif
```python
class PosOrderInherit(models.Model):
    _inherit = 'pos.order'

    # Lien avec restaurant
    table_id = fields.Many2one('restaurant.table', string='Table')
    floor_id = fields.Many2one(related='table_id.floor_id', store=True)
    guest_count = fields.Integer(string='Nombre de couverts')

    # Type de commande
    order_type = fields.Selection([
        ('dine_in', 'Sur place'),
        ('takeaway', 'À emporter'),
        ('delivery', 'Livraison'),
    ], string='Type', default='dine_in')

    # Cuisine
    kitchen_order_ids = fields.One2many('kitchen.order', 'pos_order_id', string='Bons cuisine')
    kitchen_state = fields.Selection([
        ('pending', 'En attente'),
        ('sent', 'Envoyé en cuisine'),
        ('preparing', 'En préparation'),
        ('ready', 'Prêt'),
        ('served', 'Servi'),
    ], string='État cuisine', default='pending')

    # Service
    waiter_id = fields.Many2one('res.users', string='Serveur')

    def send_to_kitchen(self):
        """Envoyer la commande en cuisine"""
        for order in self:
            kitchen_order = self.env['kitchen.order'].create({
                'name': order.name,
                'pos_order_id': order.id,
                'table_id': order.table_id.id,
                'line_ids': [(0, 0, {
                    'product_id': line.product_id.id,
                    'quantity': line.qty,
                    'note': line.note,
                }) for line in order.lines if line.product_id.type != 'service']
            })
            order.kitchen_state = 'sent'
```

## Reporting et Analytics

```python
class RestaurantDashboard(models.Model):
    _name = 'restaurant.dashboard'
    _description = 'Dashboard Restaurant'
    _auto = False

    def get_daily_stats(self, date=None):
        """Statistiques du jour"""
        if not date:
            date = fields.Date.today()

        return {
            'revenue': self._get_daily_revenue(date),
            'covers': self._get_daily_covers(date),
            'average_ticket': self._get_average_ticket(date),
            'top_items': self._get_top_items(date),
            'reservations': self._get_reservation_stats(date),
            'food_cost': self._get_food_cost(date),
        }

    def _get_daily_revenue(self, date):
        query = """
            SELECT SUM(amount_total)
            FROM pos_order
            WHERE DATE(date_order) = %s
              AND state IN ('paid', 'done', 'invoiced')
        """
        self.env.cr.execute(query, (date,))
        result = self.env.cr.fetchone()
        return result[0] or 0

    def _get_top_items(self, date, limit=10):
        query = """
            SELECT
                pp.name,
                SUM(pol.qty) as quantity,
                SUM(pol.price_subtotal) as revenue
            FROM pos_order_line pol
            JOIN pos_order po ON pol.order_id = po.id
            JOIN product_product pp ON pol.product_id = pp.id
            WHERE DATE(po.date_order) = %s
              AND po.state IN ('paid', 'done', 'invoiced')
            GROUP BY pp.id, pp.name
            ORDER BY quantity DESC
            LIMIT %s
        """
        self.env.cr.execute(query, (date, limit))
        return self.env.cr.dictfetchall()
```

## Best Practices

### Calcul du Food Cost
```python
def calculate_theoretical_food_cost(self, date_from, date_to):
    """Calculer le food cost théorique basé sur les recettes"""
    orders = self.env['pos.order'].search([
        ('date_order', '>=', date_from),
        ('date_order', '<=', date_to),
        ('state', 'in', ['paid', 'done']),
    ])

    total_revenue = sum(orders.mapped('amount_total'))
    total_cost = 0

    for order in orders:
        for line in order.lines:
            recipe = line.product_id.recipe_id
            if recipe:
                total_cost += recipe.cost_per_portion * line.qty

    food_cost_ratio = (total_cost / total_revenue * 100) if total_revenue else 0
    return {
        'revenue': total_revenue,
        'cost': total_cost,
        'ratio': food_cost_ratio,
    }
```

### HACCP - Traçabilité
```python
class HACCPLog(models.Model):
    _name = 'restaurant.haccp.log'
    _description = 'Journal HACCP'

    date = fields.Datetime(string='Date', default=fields.Datetime.now, required=True)
    check_type = fields.Selection([
        ('temperature', 'Relevé température'),
        ('cleaning', 'Nettoyage'),
        ('delivery', 'Réception marchandises'),
        ('pest', 'Contrôle nuisibles'),
    ], string='Type de contrôle', required=True)

    location = fields.Char(string='Emplacement')
    equipment_id = fields.Many2one('maintenance.equipment', string='Équipement')

    # Température
    temperature = fields.Float(string='Température (°C)')
    temperature_ok = fields.Boolean(string='Conforme')

    # Observations
    observation = fields.Text(string='Observations')
    corrective_action = fields.Text(string='Action corrective')

    user_id = fields.Many2one('res.users', string='Contrôlé par', default=lambda self: self.env.user)
```
