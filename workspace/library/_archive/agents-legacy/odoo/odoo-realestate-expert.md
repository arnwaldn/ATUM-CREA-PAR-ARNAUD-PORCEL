# Odoo Real Estate Expert

## Role Definition
Expert en développement de modules Odoo pour le secteur immobilier. Spécialisé dans les agences immobilières, la gestion locative, les syndics de copropriété, la promotion immobilière et la gestion de patrimoine.

## Core Competencies

### 1. Modèles Métier Immobilier

#### Property (Bien immobilier)
```python
from odoo import models, fields, api
from odoo.exceptions import ValidationError
from datetime import date, timedelta

class RealEstateProperty(models.Model):
    _name = 'realestate.property'
    _description = 'Bien immobilier'
    _inherit = ['mail.thread', 'mail.activity.mixin', 'website.seo.metadata']
    _order = 'create_date desc'

    name = fields.Char(string='Référence', required=True, copy=False,
                       default=lambda self: self.env['ir.sequence'].next_by_code('realestate.property'))
    title = fields.Char(string='Titre annonce', required=True)

    # Type de bien
    property_type = fields.Selection([
        ('apartment', 'Appartement'),
        ('house', 'Maison'),
        ('villa', 'Villa'),
        ('studio', 'Studio'),
        ('loft', 'Loft'),
        ('duplex', 'Duplex'),
        ('triplex', 'Triplex'),
        ('penthouse', 'Penthouse'),
        ('land', 'Terrain'),
        ('commercial', 'Local commercial'),
        ('office', 'Bureau'),
        ('warehouse', 'Entrepôt'),
        ('parking', 'Parking'),
        ('building', 'Immeuble'),
        ('other', 'Autre'),
    ], string='Type de bien', required=True)

    # Transaction
    transaction_type = fields.Selection([
        ('sale', 'Vente'),
        ('rent', 'Location'),
        ('seasonal', 'Location saisonnière'),
        ('sale_rent', 'Vente ou Location'),
    ], string='Type de transaction', required=True)

    # Prix
    price = fields.Monetary(string='Prix', currency_field='currency_id', tracking=True)
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)
    price_per_sqm = fields.Monetary(compute='_compute_price_per_sqm', string='Prix/m²')
    rent_charges = fields.Monetary(string='Charges mensuelles')
    rent_total = fields.Monetary(compute='_compute_rent_total', string='Loyer charges comprises')

    # Localisation
    street = fields.Char(string='Adresse')
    street2 = fields.Char(string='Adresse (suite)')
    zip = fields.Char(string='Code postal')
    city = fields.Char(string='Ville', required=True)
    district = fields.Char(string='Quartier')
    country_id = fields.Many2one('res.country', string='Pays', default=lambda self: self.env.ref('base.fr'))

    # Coordonnées GPS
    latitude = fields.Float(string='Latitude', digits=(10, 7))
    longitude = fields.Float(string='Longitude', digits=(10, 7))

    # Surface
    living_area = fields.Float(string='Surface habitable (m²)', required=True)
    total_area = fields.Float(string='Surface totale (m²)')
    land_area = fields.Float(string='Surface terrain (m²)')
    carrez_area = fields.Float(string='Surface Carrez (m²)')

    # Composition
    rooms = fields.Integer(string='Nombre de pièces')
    bedrooms = fields.Integer(string='Chambres')
    bathrooms = fields.Integer(string='Salles de bain')
    toilets = fields.Integer(string='WC')
    floor = fields.Integer(string='Étage')
    total_floors = fields.Integer(string='Nombre d\'étages')
    elevator = fields.Boolean(string='Ascenseur')

    # Construction
    construction_year = fields.Integer(string='Année de construction')
    renovation_year = fields.Integer(string='Année de rénovation')
    condition = fields.Selection([
        ('new', 'Neuf'),
        ('excellent', 'Excellent état'),
        ('good', 'Bon état'),
        ('to_refresh', 'À rafraîchir'),
        ('to_renovate', 'À rénover'),
    ], string='État')

    # Exposition et caractéristiques
    orientation = fields.Selection([
        ('north', 'Nord'),
        ('south', 'Sud'),
        ('east', 'Est'),
        ('west', 'Ouest'),
        ('north_east', 'Nord-Est'),
        ('north_west', 'Nord-Ouest'),
        ('south_east', 'Sud-Est'),
        ('south_west', 'Sud-Ouest'),
    ], string='Orientation')
    view = fields.Selection([
        ('garden', 'Jardin'),
        ('street', 'Rue'),
        ('courtyard', 'Cour'),
        ('panoramic', 'Panoramique'),
        ('sea', 'Mer'),
        ('mountain', 'Montagne'),
    ], string='Vue')

    # Équipements
    heating_type = fields.Selection([
        ('individual_gas', 'Individuel gaz'),
        ('collective_gas', 'Collectif gaz'),
        ('individual_electric', 'Individuel électrique'),
        ('collective_electric', 'Collectif électrique'),
        ('fuel', 'Fioul'),
        ('wood', 'Bois'),
        ('heat_pump', 'Pompe à chaleur'),
        ('geothermal', 'Géothermie'),
        ('solar', 'Solaire'),
        ('other', 'Autre'),
    ], string='Chauffage')
    hot_water = fields.Selection([
        ('individual', 'Individuel'),
        ('collective', 'Collectif'),
    ], string='Eau chaude')

    # Équipements booléens
    has_parking = fields.Boolean(string='Parking')
    parking_count = fields.Integer(string='Nombre de places')
    has_garage = fields.Boolean(string='Garage')
    has_cellar = fields.Boolean(string='Cave')
    has_balcony = fields.Boolean(string='Balcon')
    balcony_area = fields.Float(string='Surface balcon (m²)')
    has_terrace = fields.Boolean(string='Terrasse')
    terrace_area = fields.Float(string='Surface terrasse (m²)')
    has_garden = fields.Boolean(string='Jardin')
    garden_area = fields.Float(string='Surface jardin (m²)')
    has_pool = fields.Boolean(string='Piscine')
    has_air_conditioning = fields.Boolean(string='Climatisation')
    has_alarm = fields.Boolean(string='Alarme')
    has_intercom = fields.Boolean(string='Interphone')
    has_digicode = fields.Boolean(string='Digicode')
    has_caretaker = fields.Boolean(string='Gardien')
    is_furnished = fields.Boolean(string='Meublé')

    # DPE et diagnostics
    dpe_energy = fields.Selection([
        ('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D'),
        ('E', 'E'), ('F', 'F'), ('G', 'G'), ('NS', 'Non soumis'),
    ], string='DPE Énergie')
    dpe_energy_value = fields.Integer(string='Consommation (kWh/m²/an)')
    dpe_ges = fields.Selection([
        ('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D'),
        ('E', 'E'), ('F', 'F'), ('G', 'G'), ('NS', 'Non soumis'),
    ], string='DPE GES')
    dpe_ges_value = fields.Integer(string='Émissions (kgCO2/m²/an)')
    dpe_date = fields.Date(string='Date DPE')

    # Copropriété
    is_copro = fields.Boolean(string='En copropriété')
    copro_lots = fields.Integer(string='Nombre de lots')
    copro_charges = fields.Monetary(string='Charges copro/an')
    copro_procedure = fields.Boolean(string='Procédure en cours')
    copro_procedure_details = fields.Text(string='Détails procédure')

    # Relations
    owner_id = fields.Many2one('res.partner', string='Propriétaire', tracking=True)
    mandate_ids = fields.One2many('realestate.mandate', 'property_id', string='Mandats')
    current_mandate_id = fields.Many2one('realestate.mandate', string='Mandat actif',
                                          compute='_compute_current_mandate')

    # Visites
    visit_ids = fields.One2many('realestate.visit', 'property_id', string='Visites')
    visit_count = fields.Integer(compute='_compute_counts')

    # Offres
    offer_ids = fields.One2many('realestate.offer', 'property_id', string='Offres')
    offer_count = fields.Integer(compute='_compute_counts')

    # Agent responsable
    agent_id = fields.Many2one('res.users', string='Agent', default=lambda self: self.env.user)

    # État
    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('available', 'Disponible'),
        ('option', 'Sous option'),
        ('under_offer', 'Offre acceptée'),
        ('sold', 'Vendu'),
        ('rented', 'Loué'),
        ('withdrawn', 'Retiré'),
    ], string='État', default='draft', tracking=True)

    # Site web
    website_published = fields.Boolean(string='Publié sur le site')
    website_url = fields.Char(compute='_compute_website_url')

    # Photos
    image_ids = fields.One2many('realestate.property.image', 'property_id', string='Photos')
    image_main = fields.Binary(string='Photo principale', compute='_compute_main_image')

    # Description
    description = fields.Html(string='Description')
    description_short = fields.Text(string='Description courte')

    # Documents
    document_ids = fields.One2many('realestate.property.document', 'property_id', string='Documents')

    @api.depends('price', 'living_area')
    def _compute_price_per_sqm(self):
        for prop in self:
            if prop.living_area:
                prop.price_per_sqm = prop.price / prop.living_area
            else:
                prop.price_per_sqm = 0

    @api.depends('price', 'rent_charges')
    def _compute_rent_total(self):
        for prop in self:
            if prop.transaction_type in ('rent', 'seasonal'):
                prop.rent_total = prop.price + (prop.rent_charges or 0)
            else:
                prop.rent_total = 0

    @api.depends('mandate_ids', 'mandate_ids.state')
    def _compute_current_mandate(self):
        for prop in self:
            active_mandate = prop.mandate_ids.filtered(lambda m: m.state == 'active')
            prop.current_mandate_id = active_mandate[0] if active_mandate else False

    @api.depends('visit_ids', 'offer_ids')
    def _compute_counts(self):
        for prop in self:
            prop.visit_count = len(prop.visit_ids)
            prop.offer_count = len(prop.offer_ids)


class RealEstatePropertyImage(models.Model):
    _name = 'realestate.property.image'
    _description = 'Photo du bien'
    _order = 'sequence'

    property_id = fields.Many2one('realestate.property', required=True, ondelete='cascade')
    sequence = fields.Integer(default=10)
    name = fields.Char(string='Titre')
    image = fields.Image(string='Image', required=True, max_width=1920, max_height=1080)
    is_main = fields.Boolean(string='Image principale')
```

#### Mandate (Mandat)
```python
class RealEstateMandate(models.Model):
    _name = 'realestate.mandate'
    _description = 'Mandat'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'date_start desc'

    name = fields.Char(string='Numéro de mandat', required=True, copy=False,
                       default=lambda self: self.env['ir.sequence'].next_by_code('realestate.mandate'))

    property_id = fields.Many2one('realestate.property', string='Bien', required=True)
    owner_id = fields.Many2one(related='property_id.owner_id', store=True)

    # Type de mandat
    mandate_type = fields.Selection([
        ('simple', 'Mandat simple'),
        ('exclusive', 'Mandat exclusif'),
        ('semi_exclusive', 'Mandat semi-exclusif'),
    ], string='Type', required=True, default='simple')

    transaction_type = fields.Selection([
        ('sale', 'Vente'),
        ('rent', 'Location'),
        ('management', 'Gestion locative'),
    ], string='Transaction', required=True)

    # Prix
    asking_price = fields.Monetary(string='Prix demandé', currency_field='currency_id', required=True)
    minimum_price = fields.Monetary(string='Prix minimum')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)

    # Commission
    commission_type = fields.Selection([
        ('percentage', 'Pourcentage'),
        ('fixed', 'Montant fixe'),
    ], string='Type de commission', default='percentage')
    commission_percentage = fields.Float(string='Commission (%)', default=5.0)
    commission_amount = fields.Monetary(string='Commission (montant)')
    commission_payer = fields.Selection([
        ('seller', 'Vendeur'),
        ('buyer', 'Acquéreur'),
        ('both', 'Les deux'),
    ], string='À la charge de', default='seller')

    # Dates
    date_start = fields.Date(string='Date de début', required=True, default=fields.Date.today)
    date_end = fields.Date(string='Date de fin', required=True)
    duration_months = fields.Integer(string='Durée (mois)', default=3)

    # Agent
    agent_id = fields.Many2one('res.users', string='Agent responsable', default=lambda self: self.env.user)

    # État
    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('active', 'Actif'),
        ('expired', 'Expiré'),
        ('sold', 'Vendu'),
        ('cancelled', 'Annulé'),
    ], string='État', default='draft', tracking=True)

    # Documents
    document_signed = fields.Binary(string='Mandat signé')
    document_filename = fields.Char()

    @api.onchange('date_start', 'duration_months')
    def _onchange_dates(self):
        if self.date_start and self.duration_months:
            self.date_end = self.date_start + timedelta(days=self.duration_months * 30)

    def action_activate(self):
        self.state = 'active'

    def action_expire(self):
        self.state = 'expired'

    @api.model
    def _cron_check_expiration(self):
        """Vérifier les mandats arrivant à expiration"""
        soon_to_expire = self.search([
            ('state', '=', 'active'),
            ('date_end', '<=', fields.Date.today() + timedelta(days=30)),
            ('date_end', '>', fields.Date.today()),
        ])
        for mandate in soon_to_expire:
            mandate.message_post(
                body=f"Le mandat expire le {mandate.date_end}. Pensez à le renouveler.",
                subject="Mandat bientôt expiré"
            )
```

### 2. Gestion des Visites et Offres

```python
class RealEstateVisit(models.Model):
    _name = 'realestate.visit'
    _description = 'Visite'
    _inherit = ['mail.thread']
    _order = 'datetime desc'

    name = fields.Char(string='Référence', required=True, copy=False,
                       default=lambda self: self.env['ir.sequence'].next_by_code('realestate.visit'))

    property_id = fields.Many2one('realestate.property', string='Bien', required=True)
    lead_id = fields.Many2one('crm.lead', string='Opportunité')

    # Visiteur
    visitor_id = fields.Many2one('res.partner', string='Visiteur', required=True)
    visitor_phone = fields.Char(related='visitor_id.phone')
    visitor_email = fields.Char(related='visitor_id.email')

    # Planning
    datetime = fields.Datetime(string='Date et heure', required=True)
    duration = fields.Float(string='Durée (heures)', default=0.5)

    # Agent
    agent_id = fields.Many2one('res.users', string='Agent', default=lambda self: self.env.user)

    # État
    state = fields.Selection([
        ('scheduled', 'Planifiée'),
        ('confirmed', 'Confirmée'),
        ('done', 'Effectuée'),
        ('cancelled', 'Annulée'),
        ('no_show', 'Absent'),
    ], string='État', default='scheduled', tracking=True)

    # Feedback
    feedback = fields.Text(string='Compte-rendu')
    interest_level = fields.Selection([
        ('very_high', 'Très intéressé'),
        ('high', 'Intéressé'),
        ('medium', 'Moyennement intéressé'),
        ('low', 'Peu intéressé'),
        ('none', 'Pas intéressé'),
    ], string='Niveau d\'intérêt')

    # Notes
    note = fields.Text(string='Notes')

    # Calendrier
    calendar_event_id = fields.Many2one('calendar.event', string='Événement calendrier')

    def action_confirm(self):
        self.state = 'confirmed'
        self._create_calendar_event()
        self._send_confirmation()

    def action_done(self):
        self.state = 'done'

    def action_cancel(self):
        self.state = 'cancelled'
        if self.calendar_event_id:
            self.calendar_event_id.unlink()

    def _create_calendar_event(self):
        self.ensure_one()
        event = self.env['calendar.event'].create({
            'name': f"Visite {self.property_id.name}",
            'start': self.datetime,
            'stop': fields.Datetime.from_string(self.datetime) + timedelta(hours=self.duration),
            'location': f"{self.property_id.street}, {self.property_id.city}",
            'user_id': self.agent_id.id,
            'partner_ids': [(4, self.visitor_id.id)],
        })
        self.calendar_event_id = event


class RealEstateOffer(models.Model):
    _name = 'realestate.offer'
    _description = 'Offre d\'achat/location'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'create_date desc'

    name = fields.Char(string='Référence', required=True, copy=False,
                       default=lambda self: self.env['ir.sequence'].next_by_code('realestate.offer'))

    property_id = fields.Many2one('realestate.property', string='Bien', required=True)
    buyer_id = fields.Many2one('res.partner', string='Acquéreur', required=True)

    # Montant
    amount = fields.Monetary(string='Montant offert', required=True, currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)
    asking_price = fields.Monetary(related='property_id.price', string='Prix demandé')
    price_difference = fields.Monetary(compute='_compute_difference', string='Écart')
    price_difference_percent = fields.Float(compute='_compute_difference', string='Écart (%)')

    # Dates
    date_offer = fields.Date(string='Date de l\'offre', default=fields.Date.today)
    validity_date = fields.Date(string='Validité jusqu\'au')

    # Conditions
    conditions = fields.Text(string='Conditions suspensives')
    financing_type = fields.Selection([
        ('cash', 'Comptant'),
        ('mortgage', 'Crédit immobilier'),
        ('mortgage_pending', 'Sous réserve de crédit'),
    ], string='Financement', default='mortgage')
    deposit_amount = fields.Monetary(string='Dépôt de garantie proposé')

    # État
    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('submitted', 'Soumise'),
        ('negotiation', 'En négociation'),
        ('accepted', 'Acceptée'),
        ('counter_offer', 'Contre-offre'),
        ('rejected', 'Refusée'),
        ('withdrawn', 'Retirée'),
    ], string='État', default='draft', tracking=True)

    # Contre-offre
    counter_offer_amount = fields.Monetary(string='Montant contre-offre')
    counter_offer_date = fields.Date(string='Date contre-offre')

    # Notes
    note = fields.Text(string='Notes')

    # Documents
    offer_document = fields.Binary(string='Document d\'offre signé')

    @api.depends('amount', 'asking_price')
    def _compute_difference(self):
        for offer in self:
            offer.price_difference = offer.amount - offer.asking_price
            if offer.asking_price:
                offer.price_difference_percent = (offer.price_difference / offer.asking_price) * 100
            else:
                offer.price_difference_percent = 0

    def action_submit(self):
        self.state = 'submitted'
        self.property_id.state = 'under_offer'

    def action_accept(self):
        self.state = 'accepted'
        self.property_id.state = 'under_offer'
        # Rejeter les autres offres
        other_offers = self.search([
            ('property_id', '=', self.property_id.id),
            ('id', '!=', self.id),
            ('state', 'in', ['submitted', 'negotiation']),
        ])
        other_offers.write({'state': 'rejected'})

    def action_reject(self):
        self.state = 'rejected'

    def action_counter_offer(self):
        return {
            'type': 'ir.actions.act_window',
            'name': 'Contre-offre',
            'res_model': 'realestate.offer.counter.wizard',
            'view_mode': 'form',
            'target': 'new',
            'context': {'default_offer_id': self.id},
        }
```

### 3. Gestion Locative

```python
class RealEstateLease(models.Model):
    _name = 'realestate.lease'
    _description = 'Bail de location'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'date_start desc'

    name = fields.Char(string='Référence bail', required=True, copy=False,
                       default=lambda self: self.env['ir.sequence'].next_by_code('realestate.lease'))

    property_id = fields.Many2one('realestate.property', string='Bien', required=True)
    owner_id = fields.Many2one(related='property_id.owner_id', store=True)

    # Locataires
    tenant_ids = fields.Many2many('res.partner', string='Locataires', required=True)
    primary_tenant_id = fields.Many2one('res.partner', string='Locataire principal')

    # Type de bail
    lease_type = fields.Selection([
        ('empty', 'Location vide'),
        ('furnished', 'Location meublée'),
        ('commercial', 'Bail commercial'),
        ('professional', 'Bail professionnel'),
        ('seasonal', 'Location saisonnière'),
    ], string='Type de bail', required=True)

    # Durée
    date_start = fields.Date(string='Date de début', required=True)
    date_end = fields.Date(string='Date de fin')
    duration_years = fields.Integer(string='Durée (années)', default=3)
    tacit_renewal = fields.Boolean(string='Tacite reconduction', default=True)

    # Loyer
    rent_amount = fields.Monetary(string='Loyer HC', required=True, currency_field='currency_id')
    charges_amount = fields.Monetary(string='Charges')
    rent_total = fields.Monetary(compute='_compute_rent_total', string='Loyer CC')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)
    payment_day = fields.Integer(string='Jour de paiement', default=5)

    # Dépôt de garantie
    deposit_amount = fields.Monetary(string='Dépôt de garantie')
    deposit_received = fields.Boolean(string='Dépôt reçu')
    deposit_return_date = fields.Date(string='Date retour dépôt')

    # Révision loyer
    revision_index = fields.Selection([
        ('irl', 'IRL (Indice de Référence des Loyers)'),
        ('ilc', 'ILC (Indice des Loyers Commerciaux)'),
        ('ilat', 'ILAT (Indice des Loyers des Activités Tertiaires)'),
        ('none', 'Pas de révision'),
    ], string='Indice de révision', default='irl')
    revision_date = fields.Date(string='Date de révision')
    initial_index_value = fields.Float(string='Indice initial')

    # État des lieux
    entry_inventory_date = fields.Date(string='Date EDL entrée')
    entry_inventory_document = fields.Binary(string='EDL entrée')
    exit_inventory_date = fields.Date(string='Date EDL sortie')
    exit_inventory_document = fields.Binary(string='EDL sortie')

    # Assurance
    insurance_policy = fields.Char(string='N° police assurance')
    insurance_company = fields.Char(string='Compagnie d\'assurance')
    insurance_expiry = fields.Date(string='Expiration assurance')

    # État
    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('active', 'Actif'),
        ('notice', 'Préavis en cours'),
        ('ended', 'Terminé'),
        ('cancelled', 'Annulé'),
    ], string='État', default='draft', tracking=True)

    # Paiements
    payment_ids = fields.One2many('realestate.rent.payment', 'lease_id', string='Paiements')
    balance = fields.Monetary(compute='_compute_balance', string='Solde')

    # Documents
    lease_document = fields.Binary(string='Bail signé')

    @api.depends('rent_amount', 'charges_amount')
    def _compute_rent_total(self):
        for lease in self:
            lease.rent_total = lease.rent_amount + (lease.charges_amount or 0)

    @api.depends('payment_ids.amount', 'payment_ids.state')
    def _compute_balance(self):
        for lease in self:
            payments = lease.payment_ids.filtered(lambda p: p.state == 'paid')
            total_paid = sum(payments.mapped('amount'))
            # Calculer le total dû depuis le début
            if lease.date_start:
                months = (fields.Date.today().year - lease.date_start.year) * 12 + \
                         fields.Date.today().month - lease.date_start.month + 1
                total_due = months * lease.rent_total
                lease.balance = total_paid - total_due
            else:
                lease.balance = 0

    def action_activate(self):
        self.state = 'active'
        self.property_id.state = 'rented'

    def action_give_notice(self):
        self.state = 'notice'

    def action_end(self):
        self.state = 'ended'
        self.property_id.state = 'available'


class RealEstateRentPayment(models.Model):
    _name = 'realestate.rent.payment'
    _description = 'Paiement de loyer'
    _order = 'date_due desc'

    lease_id = fields.Many2one('realestate.lease', string='Bail', required=True)
    property_id = fields.Many2one(related='lease_id.property_id')
    tenant_id = fields.Many2one(related='lease_id.primary_tenant_id')

    # Période
    period_month = fields.Integer(string='Mois')
    period_year = fields.Integer(string='Année')
    period_label = fields.Char(compute='_compute_period_label', string='Période')

    # Montants
    rent_amount = fields.Monetary(string='Loyer', currency_field='currency_id')
    charges_amount = fields.Monetary(string='Charges')
    total_amount = fields.Monetary(compute='_compute_total', string='Total dû')
    amount = fields.Monetary(string='Montant payé')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)

    # Dates
    date_due = fields.Date(string='Date d\'échéance', required=True)
    date_paid = fields.Date(string='Date de paiement')

    # Mode de paiement
    payment_method = fields.Selection([
        ('bank_transfer', 'Virement'),
        ('check', 'Chèque'),
        ('cash', 'Espèces'),
        ('direct_debit', 'Prélèvement'),
    ], string='Mode de paiement')
    payment_reference = fields.Char(string='Référence paiement')

    # État
    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('pending', 'En attente'),
        ('paid', 'Payé'),
        ('partial', 'Paiement partiel'),
        ('late', 'En retard'),
    ], string='État', default='pending')

    @api.depends('period_month', 'period_year')
    def _compute_period_label(self):
        months = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
        for payment in self:
            if payment.period_month and payment.period_year:
                payment.period_label = f"{months[payment.period_month]} {payment.period_year}"
            else:
                payment.period_label = ''

    @api.depends('rent_amount', 'charges_amount')
    def _compute_total(self):
        for payment in self:
            payment.total_amount = (payment.rent_amount or 0) + (payment.charges_amount or 0)

    def action_mark_paid(self):
        self.write({
            'state': 'paid',
            'date_paid': fields.Date.today(),
            'amount': self.total_amount,
        })
```

### 4. Syndic de Copropriété

```python
class Condo(models.Model):
    _name = 'realestate.condo'
    _description = 'Copropriété'
    _inherit = ['mail.thread']

    name = fields.Char(string='Nom', required=True)
    address = fields.Text(string='Adresse')
    city = fields.Char(string='Ville')
    zip = fields.Char(string='Code postal')

    # Caractéristiques
    total_lots = fields.Integer(string='Nombre de lots')
    construction_year = fields.Integer(string='Année de construction')
    total_area = fields.Float(string='Surface totale (m²)')

    # Lots
    lot_ids = fields.One2many('realestate.condo.lot', 'condo_id', string='Lots')

    # Conseil syndical
    council_president_id = fields.Many2one('res.partner', string='Président du CS')
    council_member_ids = fields.Many2many('res.partner', 'condo_council_rel',
                                           string='Membres du conseil syndical')

    # Syndic
    syndic_id = fields.Many2one('res.partner', string='Syndic')
    syndic_contract_end = fields.Date(string='Fin mandat syndic')

    # Budget
    annual_budget = fields.Monetary(string='Budget annuel', currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)
    reserve_fund = fields.Monetary(string='Fonds de réserve')

    # Assemblées générales
    meeting_ids = fields.One2many('realestate.condo.meeting', 'condo_id', string='AG')

    # Contrats
    contract_ids = fields.One2many('realestate.condo.contract', 'condo_id', string='Contrats')

    # État
    state = fields.Selection([
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ], string='État', default='active')


class CondoLot(models.Model):
    _name = 'realestate.condo.lot'
    _description = 'Lot de copropriété'

    condo_id = fields.Many2one('realestate.condo', string='Copropriété', required=True)

    lot_number = fields.Char(string='Numéro de lot', required=True)
    lot_type = fields.Selection([
        ('apartment', 'Appartement'),
        ('parking', 'Parking'),
        ('cellar', 'Cave'),
        ('commercial', 'Local commercial'),
        ('other', 'Autre'),
    ], string='Type')

    floor = fields.Integer(string='Étage')
    area = fields.Float(string='Surface (m²)')
    tantieme = fields.Integer(string='Tantièmes')
    tantieme_percentage = fields.Float(compute='_compute_percentage', string='% des charges')

    # Propriétaire
    owner_id = fields.Many2one('res.partner', string='Propriétaire')

    # Si en location
    is_rented = fields.Boolean(string='En location')
    tenant_id = fields.Many2one('res.partner', string='Locataire')

    # Charges
    charge_ids = fields.One2many('realestate.condo.charge', 'lot_id', string='Appels de charges')
    balance = fields.Monetary(compute='_compute_balance', string='Solde')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)

    @api.depends('tantieme', 'condo_id.lot_ids.tantieme')
    def _compute_percentage(self):
        for lot in self:
            total_tantiemes = sum(lot.condo_id.lot_ids.mapped('tantieme'))
            if total_tantiemes:
                lot.tantieme_percentage = (lot.tantieme / total_tantiemes) * 100
            else:
                lot.tantieme_percentage = 0


class CondoMeeting(models.Model):
    _name = 'realestate.condo.meeting'
    _description = 'Assemblée Générale'
    _order = 'date desc'

    condo_id = fields.Many2one('realestate.condo', string='Copropriété', required=True)

    name = fields.Char(string='Titre', required=True)
    meeting_type = fields.Selection([
        ('ordinary', 'AG Ordinaire'),
        ('extraordinary', 'AG Extraordinaire'),
    ], string='Type', default='ordinary')

    date = fields.Datetime(string='Date et heure', required=True)
    location = fields.Char(string='Lieu')

    # Convocation
    convocation_date = fields.Date(string='Date de convocation')
    convocation_sent = fields.Boolean(string='Convocations envoyées')

    # Ordre du jour
    agenda = fields.Html(string='Ordre du jour')
    resolution_ids = fields.One2many('realestate.condo.resolution', 'meeting_id', string='Résolutions')

    # Présence
    attendee_ids = fields.Many2many('res.partner', string='Présents')
    proxy_ids = fields.One2many('realestate.condo.proxy', 'meeting_id', string='Pouvoirs')
    quorum = fields.Float(compute='_compute_quorum', string='Quorum (%)')
    quorum_reached = fields.Boolean(compute='_compute_quorum')

    # PV
    minutes = fields.Html(string='Procès-verbal')
    minutes_document = fields.Binary(string='PV signé')

    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('convened', 'Convoquée'),
        ('done', 'Tenue'),
        ('cancelled', 'Annulée'),
    ], string='État', default='draft')
```

## Portail Web et API

### Portail acquéreurs/locataires
```python
from odoo import http
from odoo.http import request

class RealEstatePortal(http.Controller):

    @http.route('/properties', type='http', auth='public', website=True)
    def properties_list(self, **kwargs):
        domain = [
            ('website_published', '=', True),
            ('state', '=', 'available'),
        ]

        # Filtres
        if kwargs.get('type'):
            domain.append(('property_type', '=', kwargs['type']))
        if kwargs.get('transaction'):
            domain.append(('transaction_type', '=', kwargs['transaction']))
        if kwargs.get('city'):
            domain.append(('city', 'ilike', kwargs['city']))
        if kwargs.get('price_min'):
            domain.append(('price', '>=', float(kwargs['price_min'])))
        if kwargs.get('price_max'):
            domain.append(('price', '<=', float(kwargs['price_max'])))

        properties = request.env['realestate.property'].sudo().search(domain)

        return request.render('realestate.properties_list', {
            'properties': properties,
        })

    @http.route('/property/<int:property_id>', type='http', auth='public', website=True)
    def property_detail(self, property_id, **kwargs):
        prop = request.env['realestate.property'].sudo().browse(property_id)
        return request.render('realestate.property_detail', {
            'property': prop,
        })

    @http.route('/property/<int:property_id>/schedule-visit', type='http', auth='public',
                website=True, methods=['POST'])
    def schedule_visit(self, property_id, **post):
        # Créer une demande de visite
        partner = request.env['res.partner'].sudo().create({
            'name': post.get('name'),
            'email': post.get('email'),
            'phone': post.get('phone'),
        })

        visit = request.env['realestate.visit'].sudo().create({
            'property_id': property_id,
            'visitor_id': partner.id,
            'datetime': post.get('datetime'),
            'state': 'scheduled',
        })

        return request.redirect(f'/property/{property_id}?visit_scheduled=1')
```

## Best Practices

### Calcul des honoraires
```python
def calculate_commission(self, sale_price):
    """Calculer les honoraires selon le barème"""
    if self.commission_type == 'percentage':
        base_commission = sale_price * (self.commission_percentage / 100)
    else:
        base_commission = self.commission_amount

    # TVA sur honoraires
    tva_rate = 0.20
    commission_ttc = base_commission * (1 + tva_rate)

    return {
        'commission_ht': base_commission,
        'tva': base_commission * tva_rate,
        'commission_ttc': commission_ttc,
    }
```

### Alertes automatiques
```python
@api.model
def _cron_alerts(self):
    """Cron pour les alertes diverses"""
    today = fields.Date.today()

    # Mandats expirant dans 30 jours
    expiring_mandates = self.env['realestate.mandate'].search([
        ('state', '=', 'active'),
        ('date_end', '<=', today + timedelta(days=30)),
        ('date_end', '>', today),
    ])
    for mandate in expiring_mandates:
        mandate.activity_schedule(
            'mail.mail_activity_data_warning',
            date_deadline=mandate.date_end - timedelta(days=7),
            summary=f"Mandat expirant le {mandate.date_end}"
        )

    # Loyers en retard
    late_payments = self.env['realestate.rent.payment'].search([
        ('state', '=', 'pending'),
        ('date_due', '<', today),
    ])
    late_payments.write({'state': 'late'})
```
