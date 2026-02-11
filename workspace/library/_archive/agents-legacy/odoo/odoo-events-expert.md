# Odoo Events & Community Expert

## Role Definition
Expert en développement de modules Odoo pour l'événementiel, les associations, les clubs et les organisations communautaires. Spécialisé dans la gestion de conférences, festivals, mariages, associations, clubs sportifs et organisations à but non lucratif.

## Core Competencies

### 1. Modèles Métier Événementiel

#### Event (Événement)
```python
from odoo import models, fields, api
from odoo.exceptions import ValidationError, UserError
from datetime import timedelta
import qrcode
import base64
from io import BytesIO

class EventEvent(models.Model):
    _name = 'event.event'
    _description = 'Événement'
    _inherit = ['mail.thread', 'mail.activity.mixin', 'website.seo.metadata']
    _order = 'date_begin desc'

    name = fields.Char(string='Nom de l\'événement', required=True, tracking=True)
    active = fields.Boolean(default=True)

    # Classification
    event_type_id = fields.Many2one('event.type', string='Type d\'événement')
    tag_ids = fields.Many2many('event.tag', string='Tags')
    category = fields.Selection([
        ('conference', 'Conférence'),
        ('seminar', 'Séminaire'),
        ('workshop', 'Atelier'),
        ('festival', 'Festival'),
        ('concert', 'Concert'),
        ('exhibition', 'Exposition'),
        ('wedding', 'Mariage'),
        ('corporate', 'Événement corporate'),
        ('sport', 'Événement sportif'),
        ('charity', 'Gala de charité'),
        ('networking', 'Networking'),
        ('other', 'Autre'),
    ], string='Catégorie', default='conference')

    # Dates
    date_begin = fields.Datetime(string='Date de début', required=True, tracking=True)
    date_end = fields.Datetime(string='Date de fin', required=True, tracking=True)
    date_tz = fields.Selection('_tz_get', string='Fuseau horaire', default='Europe/Paris')
    duration_days = fields.Integer(compute='_compute_duration', store=True)

    # Lieu
    venue_id = fields.Many2one('event.venue', string='Lieu')
    address_id = fields.Many2one('res.partner', string='Adresse')
    is_online = fields.Boolean(string='Événement en ligne')
    online_url = fields.Char(string='Lien de l\'événement')
    online_platform = fields.Selection([
        ('zoom', 'Zoom'),
        ('teams', 'Microsoft Teams'),
        ('meet', 'Google Meet'),
        ('youtube', 'YouTube Live'),
        ('twitch', 'Twitch'),
        ('custom', 'Plateforme personnalisée'),
    ], string='Plateforme')

    # Organisateur
    organizer_id = fields.Many2one('res.partner', string='Organisateur',
                                    default=lambda self: self.env.company.partner_id)
    user_id = fields.Many2one('res.users', string='Responsable',
                               default=lambda self: self.env.user, tracking=True)

    # Description
    description = fields.Html(string='Description')
    note = fields.Html(string='Notes internes')
    introduction = fields.Html(string='Introduction (site web)')

    # Capacité et inscriptions
    seats_max = fields.Integer(string='Places maximum', default=0)
    seats_available = fields.Integer(compute='_compute_seats', store=True)
    seats_reserved = fields.Integer(compute='_compute_seats', store=True)
    seats_used = fields.Integer(compute='_compute_seats', store=True)
    seats_limited = fields.Boolean(string='Places limitées', compute='_compute_seats_limited')

    # Billetterie
    ticket_ids = fields.One2many('event.ticket', 'event_id', string='Types de billets')
    registration_ids = fields.One2many('event.registration', 'event_id', string='Inscriptions')

    # Programme
    track_ids = fields.One2many('event.track', 'event_id', string='Programme / Sessions')
    speaker_ids = fields.Many2many('event.speaker', string='Intervenants')
    sponsor_ids = fields.One2many('event.sponsor', 'event_id', string='Sponsors')

    # État
    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('confirm', 'Confirmé'),
        ('ongoing', 'En cours'),
        ('done', 'Terminé'),
        ('cancel', 'Annulé'),
    ], string='État', default='draft', tracking=True)

    # Statistiques
    registration_count = fields.Integer(compute='_compute_registration_count')
    attendee_count = fields.Integer(compute='_compute_registration_count')
    revenue = fields.Monetary(compute='_compute_revenue', currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)

    # Site web
    website_published = fields.Boolean(string='Publié')
    website_url = fields.Char(compute='_compute_website_url')

    # Images
    image = fields.Image(string='Image principale', max_width=1920, max_height=1080)
    image_medium = fields.Image(related='image', max_width=512, max_height=512)

    @api.model
    def _tz_get(self):
        return [(tz, tz) for tz in ['Europe/Paris', 'Europe/London', 'America/New_York', 'Asia/Tokyo']]

    @api.depends('date_begin', 'date_end')
    def _compute_duration(self):
        for event in self:
            if event.date_begin and event.date_end:
                delta = event.date_end - event.date_begin
                event.duration_days = delta.days + 1
            else:
                event.duration_days = 0

    @api.depends('seats_max', 'registration_ids.state')
    def _compute_seats(self):
        for event in self:
            confirmed = event.registration_ids.filtered(lambda r: r.state == 'open')
            event.seats_reserved = sum(confirmed.mapped('nb_register'))
            event.seats_used = len(event.registration_ids.filtered(lambda r: r.state == 'done'))
            event.seats_available = event.seats_max - event.seats_reserved if event.seats_max else 999999

    @api.depends('seats_max')
    def _compute_seats_limited(self):
        for event in self:
            event.seats_limited = event.seats_max > 0

    @api.depends('registration_ids')
    def _compute_registration_count(self):
        for event in self:
            event.registration_count = len(event.registration_ids)
            event.attendee_count = len(event.registration_ids.filtered(lambda r: r.state == 'done'))

    @api.depends('registration_ids.sale_order_id.amount_total')
    def _compute_revenue(self):
        for event in self:
            orders = event.registration_ids.mapped('sale_order_id').filtered(lambda o: o.state == 'sale')
            event.revenue = sum(orders.mapped('amount_total'))

    def action_confirm(self):
        self.state = 'confirm'

    def action_start(self):
        self.state = 'ongoing'

    def action_done(self):
        self.state = 'done'
        self._send_feedback_survey()

    def action_cancel(self):
        self.state = 'cancel'
        self._notify_cancellation()


class EventTicket(models.Model):
    _name = 'event.ticket'
    _description = 'Type de billet'
    _order = 'sequence, price'

    name = fields.Char(string='Nom du billet', required=True)
    sequence = fields.Integer(default=10)
    event_id = fields.Many2one('event.event', string='Événement', required=True, ondelete='cascade')

    # Prix
    price = fields.Monetary(string='Prix', currency_field='currency_id')
    currency_id = fields.Many2one(related='event_id.currency_id')
    price_reduce = fields.Monetary(string='Prix réduit')

    # Disponibilité
    start_sale = fields.Datetime(string='Début des ventes')
    end_sale = fields.Datetime(string='Fin des ventes')
    seats_max = fields.Integer(string='Places disponibles', default=0)
    seats_available = fields.Integer(compute='_compute_seats')
    seats_reserved = fields.Integer(compute='_compute_seats')

    # Restrictions
    is_vip = fields.Boolean(string='Billet VIP')
    requires_approval = fields.Boolean(string='Requiert approbation')
    min_per_order = fields.Integer(string='Min par commande', default=1)
    max_per_order = fields.Integer(string='Max par commande', default=10)

    # Description
    description = fields.Text(string='Description')

    # Produit lié (pour la vente)
    product_id = fields.Many2one('product.product', string='Produit')

    @api.depends('seats_max', 'event_id.registration_ids')
    def _compute_seats(self):
        for ticket in self:
            registrations = ticket.event_id.registration_ids.filtered(
                lambda r: r.event_ticket_id == ticket and r.state == 'open'
            )
            ticket.seats_reserved = sum(registrations.mapped('nb_register'))
            ticket.seats_available = ticket.seats_max - ticket.seats_reserved if ticket.seats_max else 999999


class EventRegistration(models.Model):
    _name = 'event.registration'
    _description = 'Inscription événement'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'create_date desc'

    name = fields.Char(string='Référence', required=True, copy=False,
                       default=lambda self: self.env['ir.sequence'].next_by_code('event.registration'))

    event_id = fields.Many2one('event.event', string='Événement', required=True, tracking=True)
    event_ticket_id = fields.Many2one('event.ticket', string='Type de billet')

    # Participant
    partner_id = fields.Many2one('res.partner', string='Contact')
    attendee_name = fields.Char(string='Nom du participant', required=True)
    email = fields.Char(string='Email', required=True)
    phone = fields.Char(string='Téléphone')
    company_name = fields.Char(string='Société')
    job_title = fields.Char(string='Fonction')

    # Inscription
    nb_register = fields.Integer(string='Nombre de places', default=1)
    date_register = fields.Datetime(string='Date d\'inscription', default=fields.Datetime.now)

    # État
    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('pending', 'En attente'),
        ('open', 'Confirmée'),
        ('done', 'Participé'),
        ('cancel', 'Annulée'),
    ], string='État', default='draft', tracking=True)

    # Check-in
    is_checked_in = fields.Boolean(string='Check-in effectué')
    checkin_date = fields.Datetime(string='Date check-in')
    checkin_by = fields.Many2one('res.users', string='Check-in par')

    # QR Code
    qr_code = fields.Binary(string='QR Code', compute='_compute_qr_code', store=True)
    barcode = fields.Char(string='Code-barre', copy=False)

    # Vente
    sale_order_id = fields.Many2one('sale.order', string='Bon de commande')
    sale_order_line_id = fields.Many2one('sale.order.line', string='Ligne de commande')
    amount_paid = fields.Monetary(related='sale_order_line_id.price_subtotal')

    # Notes
    note = fields.Text(string='Notes')

    @api.model
    def create(self, vals):
        if not vals.get('barcode'):
            vals['barcode'] = self.env['ir.sequence'].next_by_code('event.registration.barcode')
        return super().create(vals)

    @api.depends('barcode')
    def _compute_qr_code(self):
        for record in self:
            if record.barcode:
                qr = qrcode.QRCode(version=1, box_size=10, border=4)
                qr.add_data(record.barcode)
                qr.make(fit=True)
                img = qr.make_image(fill_color="black", back_color="white")
                buffer = BytesIO()
                img.save(buffer, format='PNG')
                record.qr_code = base64.b64encode(buffer.getvalue())
            else:
                record.qr_code = False

    def action_confirm(self):
        self.state = 'open'
        self._send_confirmation_email()

    def action_checkin(self):
        self.ensure_one()
        self.write({
            'is_checked_in': True,
            'checkin_date': fields.Datetime.now(),
            'checkin_by': self.env.user.id,
            'state': 'done',
        })

    def action_cancel(self):
        self.state = 'cancel'

    def _send_confirmation_email(self):
        template = self.env.ref('event.email_template_event_registration_confirm', raise_if_not_found=False)
        if template:
            template.send_mail(self.id)
```

### 2. Programme et Intervenants

```python
class EventTrack(models.Model):
    _name = 'event.track'
    _description = 'Session / Intervention'
    _order = 'date, sequence'
    _inherit = ['mail.thread']

    name = fields.Char(string='Titre', required=True)
    sequence = fields.Integer(default=10)
    event_id = fields.Many2one('event.event', string='Événement', required=True, ondelete='cascade')

    # Planning
    date = fields.Datetime(string='Date et heure')
    duration = fields.Float(string='Durée (heures)', default=1.0)
    date_end = fields.Datetime(compute='_compute_date_end', store=True)

    # Lieu
    location_id = fields.Many2one('event.track.location', string='Salle')
    stage_id = fields.Many2one('event.track.stage', string='Scène')

    # Type
    track_type = fields.Selection([
        ('keynote', 'Keynote'),
        ('talk', 'Conférence'),
        ('workshop', 'Atelier'),
        ('panel', 'Table ronde'),
        ('break', 'Pause'),
        ('networking', 'Networking'),
        ('exhibition', 'Exposition'),
        ('other', 'Autre'),
    ], string='Type', default='talk')

    # Contenu
    description = fields.Html(string='Description')
    tag_ids = fields.Many2many('event.track.tag', string='Thèmes')
    level = fields.Selection([
        ('beginner', 'Débutant'),
        ('intermediate', 'Intermédiaire'),
        ('advanced', 'Avancé'),
    ], string='Niveau')

    # Intervenants
    speaker_ids = fields.Many2many('event.speaker', string='Intervenants')

    # Documents
    slide_ids = fields.One2many('event.track.slide', 'track_id', string='Présentations')
    video_url = fields.Char(string='Vidéo (YouTube/Vimeo)')

    # État
    state = fields.Selection([
        ('draft', 'Proposition'),
        ('confirmed', 'Confirmée'),
        ('announced', 'Annoncée'),
        ('cancelled', 'Annulée'),
    ], string='État', default='draft')

    # Inscription (si session avec places limitées)
    seats_max = fields.Integer(string='Places max')
    attendee_ids = fields.Many2many('event.registration', string='Inscrits')
    attendee_count = fields.Integer(compute='_compute_attendee_count')

    @api.depends('date', 'duration')
    def _compute_date_end(self):
        for track in self:
            if track.date and track.duration:
                track.date_end = track.date + timedelta(hours=track.duration)
            else:
                track.date_end = track.date

    @api.depends('attendee_ids')
    def _compute_attendee_count(self):
        for track in self:
            track.attendee_count = len(track.attendee_ids)


class EventSpeaker(models.Model):
    _name = 'event.speaker'
    _description = 'Intervenant'
    _inherit = ['mail.thread']

    name = fields.Char(string='Nom', required=True)
    partner_id = fields.Many2one('res.partner', string='Contact')

    # Profil
    title = fields.Char(string='Titre')
    company = fields.Char(string='Société')
    function = fields.Char(string='Fonction')
    biography = fields.Html(string='Biographie')

    # Contact
    email = fields.Char(string='Email')
    phone = fields.Char(string='Téléphone')
    website = fields.Char(string='Site web')

    # Réseaux sociaux
    linkedin = fields.Char(string='LinkedIn')
    twitter = fields.Char(string='Twitter/X')
    github = fields.Char(string='GitHub')

    # Photo
    image = fields.Image(string='Photo', max_width=512, max_height=512)

    # Interventions
    track_ids = fields.Many2many('event.track', string='Interventions')
    event_ids = fields.Many2many('event.event', string='Événements')

    # Évaluation
    average_rating = fields.Float(compute='_compute_rating', string='Note moyenne')


class EventSponsor(models.Model):
    _name = 'event.sponsor'
    _description = 'Sponsor'
    _order = 'sequence, level'

    name = fields.Char(related='partner_id.name')
    partner_id = fields.Many2one('res.partner', string='Partenaire', required=True)
    event_id = fields.Many2one('event.event', string='Événement', required=True, ondelete='cascade')

    sequence = fields.Integer(default=10)

    # Niveau de sponsoring
    level = fields.Selection([
        ('platinum', 'Platinum'),
        ('gold', 'Gold'),
        ('silver', 'Silver'),
        ('bronze', 'Bronze'),
        ('partner', 'Partenaire'),
        ('media', 'Partenaire média'),
    ], string='Niveau', default='bronze')

    # Contreparties
    sponsorship_amount = fields.Monetary(string='Montant', currency_field='currency_id')
    currency_id = fields.Many2one(related='event_id.currency_id')
    booth_location = fields.Char(string='Emplacement stand')
    logo_on_website = fields.Boolean(string='Logo sur site')
    logo_on_print = fields.Boolean(string='Logo sur print')
    speaking_slot = fields.Boolean(string='Créneau de parole')
    attendee_passes = fields.Integer(string='Passes gratuits')

    # Logo
    logo = fields.Image(string='Logo', max_width=400, max_height=200)
    website_url = fields.Char(string='URL site web')
```

### 3. Gestion des Lieux et Ressources

```python
class EventVenue(models.Model):
    _name = 'event.venue'
    _description = 'Lieu / Venue'

    name = fields.Char(string='Nom', required=True)
    partner_id = fields.Many2one('res.partner', string='Propriétaire/Contact')

    # Adresse
    street = fields.Char(string='Rue')
    city = fields.Char(string='Ville')
    zip = fields.Char(string='Code postal')
    country_id = fields.Many2one('res.country', string='Pays')

    # Capacité
    capacity_standing = fields.Integer(string='Capacité debout')
    capacity_seated = fields.Integer(string='Capacité assise')
    capacity_theater = fields.Integer(string='Capacité théâtre')
    capacity_classroom = fields.Integer(string='Capacité salle de classe')
    capacity_banquet = fields.Integer(string='Capacité banquet')

    # Équipements
    has_parking = fields.Boolean(string='Parking')
    parking_capacity = fields.Integer(string='Places parking')
    has_wifi = fields.Boolean(string='WiFi')
    has_catering = fields.Boolean(string='Service traiteur')
    has_accommodation = fields.Boolean(string='Hébergement sur place')
    is_accessible = fields.Boolean(string='Accessible PMR')

    # Salles
    room_ids = fields.One2many('event.track.location', 'venue_id', string='Salles')
    room_count = fields.Integer(compute='_compute_room_count')

    # Prix
    daily_rate = fields.Monetary(string='Tarif journalier', currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)

    # Documents
    floor_plan = fields.Binary(string='Plan des lieux')
    photo_ids = fields.One2many('event.venue.photo', 'venue_id', string='Photos')

    # Localisation GPS
    latitude = fields.Float(string='Latitude', digits=(10, 7))
    longitude = fields.Float(string='Longitude', digits=(10, 7))

    @api.depends('room_ids')
    def _compute_room_count(self):
        for venue in self:
            venue.room_count = len(venue.room_ids)


class EventTrackLocation(models.Model):
    _name = 'event.track.location'
    _description = 'Salle'

    name = fields.Char(string='Nom', required=True)
    venue_id = fields.Many2one('event.venue', string='Lieu')

    capacity = fields.Integer(string='Capacité')
    floor = fields.Char(string='Étage')

    # Équipements
    has_projector = fields.Boolean(string='Vidéoprojecteur')
    has_screen = fields.Boolean(string='Écran')
    has_microphone = fields.Boolean(string='Micro')
    has_webcam = fields.Boolean(string='Webcam/Streaming')
    has_whiteboard = fields.Boolean(string='Tableau')

    equipment_notes = fields.Text(string='Notes équipements')
```

### 4. Associations et Membres

```python
class AssociationMember(models.Model):
    _name = 'association.member'
    _description = 'Membre d\'association'
    _inherits = {'res.partner': 'partner_id'}
    _inherit = ['mail.thread', 'mail.activity.mixin']

    partner_id = fields.Many2one('res.partner', string='Contact', required=True, ondelete='cascade')

    # Adhésion
    member_number = fields.Char(string='Numéro de membre', copy=False,
                                default=lambda self: self.env['ir.sequence'].next_by_code('association.member'))
    membership_type_id = fields.Many2one('association.membership.type', string='Type d\'adhésion')
    membership_start = fields.Date(string='Début adhésion')
    membership_end = fields.Date(string='Fin adhésion')
    membership_state = fields.Selection([
        ('draft', 'Prospect'),
        ('pending', 'En attente'),
        ('active', 'Actif'),
        ('expired', 'Expiré'),
        ('cancelled', 'Résilié'),
    ], string='État', default='draft', compute='_compute_membership_state', store=True)

    # Cotisation
    last_payment_date = fields.Date(string='Dernier paiement')
    last_payment_amount = fields.Monetary(string='Montant dernier paiement', currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)
    total_paid = fields.Monetary(compute='_compute_total_paid', string='Total cotisations')

    # Engagement
    join_date = fields.Date(string='Date d\'adhésion initiale')
    sponsor_id = fields.Many2one('association.member', string='Parrain')
    sponsored_ids = fields.One2many('association.member', 'sponsor_id', string='Filleuls')

    # Rôles
    is_board_member = fields.Boolean(string='Membre du bureau')
    board_role = fields.Selection([
        ('president', 'Président'),
        ('vice_president', 'Vice-Président'),
        ('treasurer', 'Trésorier'),
        ('secretary', 'Secrétaire'),
        ('board_member', 'Administrateur'),
    ], string='Rôle au bureau')

    # Commissions / Groupes de travail
    commission_ids = fields.Many2many('association.commission', string='Commissions')

    # Bénévolat
    volunteer_hours = fields.Float(compute='_compute_volunteer_hours', string='Heures de bénévolat')
    volunteer_activity_ids = fields.One2many('association.volunteer.activity', 'member_id', string='Activités bénévoles')

    # Documents
    id_document = fields.Binary(string='Pièce d\'identité')
    signed_charter = fields.Binary(string='Charte signée')

    @api.depends('membership_start', 'membership_end')
    def _compute_membership_state(self):
        today = fields.Date.today()
        for member in self:
            if not member.membership_start:
                member.membership_state = 'draft'
            elif member.membership_end and member.membership_end < today:
                member.membership_state = 'expired'
            elif member.membership_start <= today:
                member.membership_state = 'active'
            else:
                member.membership_state = 'pending'


class AssociationMembershipType(models.Model):
    _name = 'association.membership.type'
    _description = 'Type d\'adhésion'

    name = fields.Char(string='Nom', required=True)
    code = fields.Char(string='Code')

    # Tarification
    price = fields.Monetary(string='Cotisation annuelle', currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)

    # Durée
    duration_months = fields.Integer(string='Durée (mois)', default=12)

    # Avantages
    benefits = fields.Html(string='Avantages')
    free_events = fields.Integer(string='Événements gratuits/an')
    discount_percent = fields.Float(string='Réduction événements (%)')

    # Restrictions
    is_individual = fields.Boolean(string='Individuel', default=True)
    is_corporate = fields.Boolean(string='Entreprise')
    min_age = fields.Integer(string='Âge minimum')
    max_age = fields.Integer(string='Âge maximum')


class AssociationDonation(models.Model):
    _name = 'association.donation'
    _description = 'Don'
    _inherit = ['mail.thread']
    _order = 'date desc'

    name = fields.Char(string='Référence', required=True, copy=False,
                       default=lambda self: self.env['ir.sequence'].next_by_code('association.donation'))

    donor_id = fields.Many2one('res.partner', string='Donateur', required=True)
    member_id = fields.Many2one('association.member', string='Membre')

    date = fields.Date(string='Date', default=fields.Date.today, required=True)
    amount = fields.Monetary(string='Montant', required=True, currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)

    # Type
    donation_type = fields.Selection([
        ('one_time', 'Don ponctuel'),
        ('recurring', 'Don récurrent'),
        ('in_kind', 'Don en nature'),
        ('legacy', 'Legs'),
    ], string='Type', default='one_time')

    # Affectation
    campaign_id = fields.Many2one('association.campaign', string='Campagne')
    project_id = fields.Many2one('project.project', string='Projet')

    # Paiement
    payment_method = fields.Selection([
        ('cash', 'Espèces'),
        ('check', 'Chèque'),
        ('bank_transfer', 'Virement'),
        ('card', 'Carte bancaire'),
        ('paypal', 'PayPal'),
        ('other', 'Autre'),
    ], string='Mode de paiement')

    payment_reference = fields.Char(string='Référence paiement')
    payment_date = fields.Date(string='Date encaissement')

    # Fiscal
    tax_receipt_eligible = fields.Boolean(string='Éligible reçu fiscal', default=True)
    tax_receipt_sent = fields.Boolean(string='Reçu fiscal envoyé')
    tax_receipt_date = fields.Date(string='Date envoi reçu')

    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('confirmed', 'Confirmé'),
        ('received', 'Encaissé'),
        ('cancelled', 'Annulé'),
    ], string='État', default='draft')

    def action_generate_tax_receipt(self):
        """Générer et envoyer le reçu fiscal"""
        self.ensure_one()
        # Générer le PDF du reçu fiscal
        report = self.env.ref('association.action_report_tax_receipt')
        pdf_content, _ = report._render_qweb_pdf(self.ids)
        # Envoyer par email
        template = self.env.ref('association.email_template_tax_receipt')
        template.send_mail(self.id, email_values={'attachment_ids': []})
        self.write({
            'tax_receipt_sent': True,
            'tax_receipt_date': fields.Date.today(),
        })
```

### 5. Clubs Sportifs

```python
class SportClub(models.Model):
    _name = 'sport.club'
    _description = 'Club sportif'
    _inherit = ['mail.thread']

    name = fields.Char(string='Nom', required=True)
    partner_id = fields.Many2one('res.partner', string='Entité juridique')

    # Sport
    sport_id = fields.Many2one('sport.discipline', string='Discipline')
    federation_id = fields.Many2one('sport.federation', string='Fédération')
    affiliation_number = fields.Char(string='Numéro d\'affiliation')

    # Équipes
    team_ids = fields.One2many('sport.team', 'club_id', string='Équipes')

    # Licenciés
    member_ids = fields.One2many('sport.license', 'club_id', string='Licenciés')
    member_count = fields.Integer(compute='_compute_member_count')

    # Installations
    facility_ids = fields.One2many('sport.facility', 'club_id', string='Installations')

    # Compétitions
    competition_ids = fields.Many2many('sport.competition', string='Compétitions')

    @api.depends('member_ids')
    def _compute_member_count(self):
        for club in self:
            club.member_count = len(club.member_ids.filtered(lambda m: m.state == 'active'))


class SportLicense(models.Model):
    _name = 'sport.license'
    _description = 'Licence sportive'
    _inherit = ['mail.thread']

    name = fields.Char(string='Numéro de licence', required=True, copy=False)
    member_id = fields.Many2one('association.member', string='Membre')
    club_id = fields.Many2one('sport.club', string='Club', required=True)

    # Saison
    season_id = fields.Many2one('sport.season', string='Saison')
    date_start = fields.Date(string='Début validité')
    date_end = fields.Date(string='Fin validité')

    # Type
    license_type = fields.Selection([
        ('competition', 'Compétition'),
        ('leisure', 'Loisir'),
        ('youth', 'Jeune'),
        ('referee', 'Arbitre'),
        ('coach', 'Entraîneur'),
    ], string='Type', default='competition')

    # Catégorie d'âge
    age_category_id = fields.Many2one('sport.age.category', string='Catégorie')

    # Certificat médical
    medical_certificate = fields.Binary(string='Certificat médical')
    medical_certificate_date = fields.Date(string='Date certificat')
    medical_certificate_valid = fields.Boolean(compute='_compute_medical_valid')

    # État
    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('pending', 'En attente fédération'),
        ('active', 'Active'),
        ('expired', 'Expirée'),
        ('suspended', 'Suspendue'),
    ], string='État', default='draft')

    @api.depends('medical_certificate_date')
    def _compute_medical_valid(self):
        for license in self:
            if license.medical_certificate_date:
                # Validité 1 an
                expiry = license.medical_certificate_date + timedelta(days=365)
                license.medical_certificate_valid = expiry >= fields.Date.today()
            else:
                license.medical_certificate_valid = False


class SportTeam(models.Model):
    _name = 'sport.team'
    _description = 'Équipe'

    name = fields.Char(string='Nom', required=True)
    club_id = fields.Many2one('sport.club', string='Club', required=True)

    # Catégorie
    age_category_id = fields.Many2one('sport.age.category', string='Catégorie')
    gender = fields.Selection([
        ('male', 'Masculin'),
        ('female', 'Féminin'),
        ('mixed', 'Mixte'),
    ], string='Genre')

    # Effectif
    player_ids = fields.Many2many('sport.license', string='Joueurs')
    player_count = fields.Integer(compute='_compute_player_count')

    # Staff
    coach_id = fields.Many2one('sport.license', string='Entraîneur',
                                domain=[('license_type', '=', 'coach')])
    assistant_coach_ids = fields.Many2many('sport.license', 'team_assistant_rel',
                                            string='Entraîneurs adjoints')

    # Compétition
    division = fields.Char(string='Division')
    ranking = fields.Integer(string='Classement')

    @api.depends('player_ids')
    def _compute_player_count(self):
        for team in self:
            team.player_count = len(team.player_ids)


class SportMatch(models.Model):
    _name = 'sport.match'
    _description = 'Match / Rencontre'
    _order = 'date desc'

    name = fields.Char(string='Match', compute='_compute_name', store=True)

    competition_id = fields.Many2one('sport.competition', string='Compétition')
    round = fields.Char(string='Journée/Tour')

    # Équipes
    home_team_id = fields.Many2one('sport.team', string='Équipe domicile', required=True)
    away_team_id = fields.Many2one('sport.team', string='Équipe extérieur', required=True)

    # Planning
    date = fields.Datetime(string='Date et heure')
    facility_id = fields.Many2one('sport.facility', string='Lieu')

    # Score
    home_score = fields.Integer(string='Score domicile')
    away_score = fields.Integer(string='Score extérieur')

    # État
    state = fields.Selection([
        ('scheduled', 'Programmé'),
        ('ongoing', 'En cours'),
        ('finished', 'Terminé'),
        ('postponed', 'Reporté'),
        ('cancelled', 'Annulé'),
    ], string='État', default='scheduled')

    # Feuille de match
    home_lineup_ids = fields.Many2many('sport.license', 'match_home_lineup_rel', string='Composition domicile')
    away_lineup_ids = fields.Many2many('sport.license', 'match_away_lineup_rel', string='Composition extérieur')

    # Arbitrage
    referee_ids = fields.Many2many('sport.license', 'match_referee_rel', string='Arbitres',
                                    domain=[('license_type', '=', 'referee')])

    @api.depends('home_team_id', 'away_team_id')
    def _compute_name(self):
        for match in self:
            match.name = f"{match.home_team_id.name} vs {match.away_team_id.name}"
```

### 6. Mariage et Wedding Planning

```python
class WeddingEvent(models.Model):
    _name = 'wedding.event'
    _description = 'Mariage'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(string='Nom', compute='_compute_name', store=True)

    # Couple
    partner1_id = fields.Many2one('res.partner', string='Marié(e) 1', required=True)
    partner2_id = fields.Many2one('res.partner', string='Marié(e) 2', required=True)
    couple_name = fields.Char(string='Nom du couple')

    # Dates
    wedding_date = fields.Date(string='Date du mariage', required=True)
    ceremony_time = fields.Float(string='Heure cérémonie')
    reception_time = fields.Float(string='Heure réception')

    # Lieux
    ceremony_venue_id = fields.Many2one('event.venue', string='Lieu cérémonie')
    reception_venue_id = fields.Many2one('event.venue', string='Lieu réception')

    # Invités
    guest_ids = fields.One2many('wedding.guest', 'wedding_id', string='Invités')
    guest_count = fields.Integer(compute='_compute_guest_count')
    confirmed_count = fields.Integer(compute='_compute_guest_count')

    # Budget
    budget = fields.Monetary(string='Budget', currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)
    actual_cost = fields.Monetary(compute='_compute_costs', string='Coût réel')

    # Prestataires
    vendor_ids = fields.One2many('wedding.vendor', 'wedding_id', string='Prestataires')

    # Tâches
    task_ids = fields.One2many('wedding.task', 'wedding_id', string='Tâches')
    task_progress = fields.Float(compute='_compute_task_progress', string='Avancement (%)')

    # État
    state = fields.Selection([
        ('planning', 'En préparation'),
        ('confirmed', 'Confirmé'),
        ('done', 'Célébré'),
        ('cancelled', 'Annulé'),
    ], string='État', default='planning')

    @api.depends('partner1_id', 'partner2_id')
    def _compute_name(self):
        for wedding in self:
            if wedding.partner1_id and wedding.partner2_id:
                wedding.name = f"Mariage {wedding.partner1_id.name} & {wedding.partner2_id.name}"
            else:
                wedding.name = "Nouveau mariage"

    @api.depends('guest_ids', 'guest_ids.rsvp_status')
    def _compute_guest_count(self):
        for wedding in self:
            wedding.guest_count = len(wedding.guest_ids)
            wedding.confirmed_count = len(wedding.guest_ids.filtered(lambda g: g.rsvp_status == 'confirmed'))


class WeddingGuest(models.Model):
    _name = 'wedding.guest'
    _description = 'Invité mariage'

    wedding_id = fields.Many2one('wedding.event', string='Mariage', required=True, ondelete='cascade')
    partner_id = fields.Many2one('res.partner', string='Contact')

    name = fields.Char(string='Nom', required=True)
    email = fields.Char(string='Email')
    phone = fields.Char(string='Téléphone')

    # Groupe
    group = fields.Selection([
        ('family_p1', 'Famille Marié(e) 1'),
        ('family_p2', 'Famille Marié(e) 2'),
        ('friends', 'Amis'),
        ('colleagues', 'Collègues'),
        ('other', 'Autre'),
    ], string='Groupe')

    # RSVP
    rsvp_status = fields.Selection([
        ('pending', 'En attente'),
        ('confirmed', 'Confirmé'),
        ('declined', 'Décliné'),
        ('maybe', 'Peut-être'),
    ], string='RSVP', default='pending')
    rsvp_date = fields.Date(string='Date réponse')

    # Accompagnants
    plus_one = fields.Boolean(string='Avec accompagnant')
    plus_one_name = fields.Char(string='Nom accompagnant')
    children_count = fields.Integer(string='Nombre d\'enfants')

    # Table
    table_id = fields.Many2one('wedding.table', string='Table')
    seat_number = fields.Integer(string='Place')

    # Restrictions alimentaires
    dietary_restrictions = fields.Text(string='Restrictions alimentaires')
    menu_choice = fields.Selection([
        ('standard', 'Standard'),
        ('vegetarian', 'Végétarien'),
        ('vegan', 'Végan'),
        ('fish', 'Poisson'),
        ('child', 'Menu enfant'),
    ], string='Menu')
```

## Integration Website

### Portail d'inscription en ligne
```python
from odoo import http
from odoo.http import request

class EventPortal(http.Controller):

    @http.route('/events', type='http', auth='public', website=True)
    def events_list(self, **kwargs):
        events = request.env['event.event'].sudo().search([
            ('website_published', '=', True),
            ('date_begin', '>=', fields.Datetime.now()),
            ('state', '=', 'confirm'),
        ], order='date_begin')
        return request.render('event_custom.events_list', {'events': events})

    @http.route('/events/<int:event_id>', type='http', auth='public', website=True)
    def event_detail(self, event_id, **kwargs):
        event = request.env['event.event'].sudo().browse(event_id)
        return request.render('event_custom.event_detail', {'event': event})

    @http.route('/events/<int:event_id>/register', type='http', auth='public', website=True, methods=['POST'])
    def event_register(self, event_id, **post):
        event = request.env['event.event'].sudo().browse(event_id)
        registration = request.env['event.registration'].sudo().create({
            'event_id': event.id,
            'event_ticket_id': int(post.get('ticket_id')),
            'attendee_name': post.get('name'),
            'email': post.get('email'),
            'phone': post.get('phone'),
        })
        return request.redirect(f'/events/{event_id}/confirmation/{registration.id}')
```

## Best Practices

### Check-in avec QR Code
```python
@http.route('/event/checkin/<barcode>', type='json', auth='user')
def checkin_scan(self, barcode):
    registration = request.env['event.registration'].search([('barcode', '=', barcode)], limit=1)
    if not registration:
        return {'success': False, 'message': 'Inscription non trouvée'}
    if registration.is_checked_in:
        return {'success': False, 'message': 'Déjà enregistré', 'data': registration.read()[0]}
    registration.action_checkin()
    return {'success': True, 'message': 'Check-in réussi', 'data': registration.read()[0]}
```

### Export participants CSV
```python
def action_export_attendees(self):
    """Export CSV des participants"""
    import csv
    from io import StringIO

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(['Nom', 'Email', 'Téléphone', 'Billet', 'État'])

    for reg in self.registration_ids:
        writer.writerow([
            reg.attendee_name,
            reg.email,
            reg.phone,
            reg.event_ticket_id.name,
            dict(reg._fields['state'].selection).get(reg.state),
        ])

    return {
        'type': 'ir.actions.act_url',
        'url': f'data:text/csv;charset=utf-8,{output.getvalue()}',
        'target': 'new',
    }
```
