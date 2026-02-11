# Odoo Field Service Expert

## Role Definition
Expert en développement de modules Odoo pour la gestion des interventions terrain. Spécialisé dans les services de maintenance, plomberie, électricité, nettoyage, installation, SAV et toute activité nécessitant des techniciens sur le terrain.

## Core Competencies

### 1. Modèles Métier Field Service

#### Intervention (Work Order)
```python
from odoo import models, fields, api
from odoo.exceptions import ValidationError, UserError
from datetime import datetime, timedelta
import math

class FieldServiceIntervention(models.Model):
    _name = 'field.service.intervention'
    _description = 'Intervention'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'scheduled_date desc, priority desc'

    name = fields.Char(string='Référence', required=True, copy=False,
                       default=lambda self: self.env['ir.sequence'].next_by_code('field.service.intervention'))

    # Client et adresse
    partner_id = fields.Many2one('res.partner', string='Client', required=True, tracking=True)
    contact_id = fields.Many2one('res.partner', string='Contact sur site')
    site_id = fields.Many2one('field.service.site', string='Site d\'intervention')

    # Adresse d'intervention
    street = fields.Char(string='Adresse')
    street2 = fields.Char(string='Complément')
    zip = fields.Char(string='Code postal')
    city = fields.Char(string='Ville')
    country_id = fields.Many2one('res.country', string='Pays')
    latitude = fields.Float(string='Latitude', digits=(10, 7))
    longitude = fields.Float(string='Longitude', digits=(10, 7))

    # Type d'intervention
    intervention_type_id = fields.Many2one('field.service.intervention.type', string='Type', required=True)
    category = fields.Selection([
        ('installation', 'Installation'),
        ('maintenance', 'Maintenance'),
        ('repair', 'Réparation'),
        ('inspection', 'Inspection'),
        ('diagnostic', 'Diagnostic'),
        ('emergency', 'Urgence'),
        ('quote', 'Devis'),
        ('other', 'Autre'),
    ], string='Catégorie', default='maintenance')

    # Origine
    origin = fields.Selection([
        ('manual', 'Saisie manuelle'),
        ('phone', 'Appel téléphonique'),
        ('email', 'Email'),
        ('website', 'Site web'),
        ('contract', 'Contrat'),
        ('recurrence', 'Récurrence'),
        ('ticket', 'Ticket support'),
    ], string='Origine', default='manual')
    origin_ticket_id = fields.Many2one('helpdesk.ticket', string='Ticket source')
    origin_sale_id = fields.Many2one('sale.order', string='Commande source')
    origin_contract_id = fields.Many2one('field.service.contract', string='Contrat source')

    # Équipement
    equipment_id = fields.Many2one('field.service.equipment', string='Équipement')
    equipment_serial = fields.Char(related='equipment_id.serial_number')
    equipment_warranty = fields.Boolean(compute='_compute_warranty', string='Sous garantie')

    # Description
    description = fields.Text(string='Description du problème')
    symptoms = fields.Text(string='Symptômes signalés')
    customer_note = fields.Text(string='Notes client')

    # Priorité et SLA
    priority = fields.Selection([
        ('0', 'Basse'),
        ('1', 'Normale'),
        ('2', 'Haute'),
        ('3', 'Urgente'),
    ], string='Priorité', default='1', tracking=True)
    sla_id = fields.Many2one('field.service.sla', string='SLA')
    sla_deadline = fields.Datetime(string='Échéance SLA')
    sla_status = fields.Selection([
        ('on_track', 'Dans les temps'),
        ('at_risk', 'À risque'),
        ('breached', 'Dépassé'),
    ], string='Statut SLA', compute='_compute_sla_status')

    # Planning
    scheduled_date = fields.Datetime(string='Date planifiée', tracking=True)
    scheduled_duration = fields.Float(string='Durée prévue (h)', default=1.0)
    scheduled_end = fields.Datetime(compute='_compute_scheduled_end', store=True)
    flexible_schedule = fields.Boolean(string='Horaire flexible')
    preferred_time = fields.Selection([
        ('morning', 'Matin (8h-12h)'),
        ('afternoon', 'Après-midi (14h-18h)'),
        ('evening', 'Soirée (18h-20h)'),
        ('any', 'Indifférent'),
    ], string='Créneau souhaité', default='any')

    # Technicien
    technician_id = fields.Many2one('field.service.technician', string='Technicien', tracking=True)
    team_id = fields.Many2one('field.service.team', string='Équipe')
    skill_ids = fields.Many2many(related='intervention_type_id.skill_ids', string='Compétences requises')

    # Temps réels
    actual_start = fields.Datetime(string='Début réel')
    actual_end = fields.Datetime(string='Fin réelle')
    actual_duration = fields.Float(compute='_compute_actual_duration', store=True, string='Durée réelle (h)')
    travel_start = fields.Datetime(string='Départ')
    arrival_time = fields.Datetime(string='Arrivée sur site')
    travel_duration = fields.Float(compute='_compute_travel_duration', string='Temps de trajet (h)')

    # État
    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('planned', 'Planifiée'),
        ('confirmed', 'Confirmée'),
        ('traveling', 'En route'),
        ('in_progress', 'En cours'),
        ('paused', 'En pause'),
        ('done', 'Terminée'),
        ('cancelled', 'Annulée'),
    ], string='État', default='draft', tracking=True)

    # Résolution
    resolution = fields.Text(string='Résolution / Travaux effectués')
    resolution_type = fields.Selection([
        ('resolved', 'Résolu'),
        ('partial', 'Partiellement résolu'),
        ('not_resolved', 'Non résolu'),
        ('follow_up', 'Suivi nécessaire'),
    ], string='Type de résolution')
    root_cause = fields.Text(string='Cause identifiée')

    # Pièces et consommables
    part_ids = fields.One2many('field.service.intervention.part', 'intervention_id', string='Pièces utilisées')
    parts_cost = fields.Monetary(compute='_compute_costs', string='Coût pièces')

    # Main d'œuvre
    timesheet_ids = fields.One2many('field.service.timesheet', 'intervention_id', string='Temps passé')
    labor_cost = fields.Monetary(compute='_compute_costs', string='Coût main d\'œuvre')

    # Coûts totaux
    total_cost = fields.Monetary(compute='_compute_costs', string='Coût total')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)

    # Facturation
    billable = fields.Boolean(string='Facturable', default=True)
    invoice_status = fields.Selection([
        ('no', 'Rien à facturer'),
        ('to_invoice', 'À facturer'),
        ('invoiced', 'Facturé'),
    ], string='Statut facturation', default='no')
    invoice_id = fields.Many2one('account.move', string='Facture')
    sale_order_id = fields.Many2one('sale.order', string='Devis/Commande')

    # Signature client
    customer_signature = fields.Binary(string='Signature client')
    signed_by = fields.Char(string='Signé par')
    signature_date = fields.Datetime(string='Date de signature')

    # Photos
    photo_before_ids = fields.One2many('field.service.photo', 'intervention_id',
                                        domain=[('photo_type', '=', 'before')], string='Photos avant')
    photo_after_ids = fields.One2many('field.service.photo', 'intervention_id',
                                       domain=[('photo_type', '=', 'after')], string='Photos après')

    # Satisfaction
    satisfaction_rating = fields.Selection([
        ('1', '1 - Très insatisfait'),
        ('2', '2 - Insatisfait'),
        ('3', '3 - Neutre'),
        ('4', '4 - Satisfait'),
        ('5', '5 - Très satisfait'),
    ], string='Note satisfaction')
    satisfaction_comment = fields.Text(string='Commentaire client')

    # Checklists
    checklist_ids = fields.One2many('field.service.checklist.line', 'intervention_id', string='Checklist')
    checklist_progress = fields.Float(compute='_compute_checklist_progress', string='Progression checklist (%)')

    @api.depends('scheduled_date', 'scheduled_duration')
    def _compute_scheduled_end(self):
        for intervention in self:
            if intervention.scheduled_date and intervention.scheduled_duration:
                intervention.scheduled_end = intervention.scheduled_date + timedelta(hours=intervention.scheduled_duration)
            else:
                intervention.scheduled_end = intervention.scheduled_date

    @api.depends('actual_start', 'actual_end')
    def _compute_actual_duration(self):
        for intervention in self:
            if intervention.actual_start and intervention.actual_end:
                delta = intervention.actual_end - intervention.actual_start
                intervention.actual_duration = delta.total_seconds() / 3600
            else:
                intervention.actual_duration = 0

    @api.depends('travel_start', 'arrival_time')
    def _compute_travel_duration(self):
        for intervention in self:
            if intervention.travel_start and intervention.arrival_time:
                delta = intervention.arrival_time - intervention.travel_start
                intervention.travel_duration = delta.total_seconds() / 3600
            else:
                intervention.travel_duration = 0

    @api.depends('part_ids.subtotal', 'timesheet_ids.cost')
    def _compute_costs(self):
        for intervention in self:
            intervention.parts_cost = sum(intervention.part_ids.mapped('subtotal'))
            intervention.labor_cost = sum(intervention.timesheet_ids.mapped('cost'))
            intervention.total_cost = intervention.parts_cost + intervention.labor_cost

    @api.depends('sla_deadline')
    def _compute_sla_status(self):
        now = fields.Datetime.now()
        for intervention in self:
            if not intervention.sla_deadline:
                intervention.sla_status = False
            elif intervention.state == 'done':
                if intervention.actual_end and intervention.actual_end <= intervention.sla_deadline:
                    intervention.sla_status = 'on_track'
                else:
                    intervention.sla_status = 'breached'
            elif intervention.sla_deadline < now:
                intervention.sla_status = 'breached'
            elif intervention.sla_deadline < now + timedelta(hours=2):
                intervention.sla_status = 'at_risk'
            else:
                intervention.sla_status = 'on_track'

    @api.depends('checklist_ids.is_done')
    def _compute_checklist_progress(self):
        for intervention in self:
            total = len(intervention.checklist_ids)
            done = len(intervention.checklist_ids.filtered('is_done'))
            intervention.checklist_progress = (done / total * 100) if total else 0

    @api.depends('equipment_id.warranty_end')
    def _compute_warranty(self):
        today = fields.Date.today()
        for intervention in self:
            if intervention.equipment_id and intervention.equipment_id.warranty_end:
                intervention.equipment_warranty = intervention.equipment_id.warranty_end >= today
            else:
                intervention.equipment_warranty = False

    # Actions
    def action_plan(self):
        if not self.scheduled_date or not self.technician_id:
            raise UserError("Veuillez spécifier une date et un technicien.")
        self.state = 'planned'

    def action_confirm(self):
        self.state = 'confirmed'
        self._send_confirmation_to_customer()

    def action_start_travel(self):
        self.write({
            'state': 'traveling',
            'travel_start': fields.Datetime.now(),
        })

    def action_arrive(self):
        self.write({
            'state': 'in_progress',
            'arrival_time': fields.Datetime.now(),
            'actual_start': fields.Datetime.now(),
        })

    def action_pause(self):
        self.state = 'paused'

    def action_resume(self):
        self.state = 'in_progress'

    def action_done(self):
        if not self.resolution:
            raise UserError("Veuillez renseigner la résolution avant de terminer.")
        self.write({
            'state': 'done',
            'actual_end': fields.Datetime.now(),
        })
        if self.billable:
            self.invoice_status = 'to_invoice'

    def action_cancel(self):
        self.state = 'cancelled'

    def action_create_invoice(self):
        """Créer la facture d'intervention"""
        self.ensure_one()
        invoice_lines = []

        # Ligne main d'œuvre
        if self.labor_cost:
            invoice_lines.append((0, 0, {
                'name': f"Main d'œuvre - {self.name}",
                'quantity': self.actual_duration,
                'price_unit': self.labor_cost / self.actual_duration if self.actual_duration else 0,
            }))

        # Lignes pièces
        for part in self.part_ids:
            invoice_lines.append((0, 0, {
                'name': part.product_id.name,
                'product_id': part.product_id.id,
                'quantity': part.quantity,
                'price_unit': part.unit_price,
            }))

        invoice = self.env['account.move'].create({
            'move_type': 'out_invoice',
            'partner_id': self.partner_id.id,
            'invoice_line_ids': invoice_lines,
            'invoice_origin': self.name,
        })

        self.write({
            'invoice_id': invoice.id,
            'invoice_status': 'invoiced',
        })

        return {
            'type': 'ir.actions.act_window',
            'res_model': 'account.move',
            'res_id': invoice.id,
            'view_mode': 'form',
        }


class FieldServiceInterventionPart(models.Model):
    _name = 'field.service.intervention.part'
    _description = 'Pièce utilisée'

    intervention_id = fields.Many2one('field.service.intervention', required=True, ondelete='cascade')
    product_id = fields.Many2one('product.product', string='Pièce', required=True,
                                  domain=[('type', '=', 'product')])

    quantity = fields.Float(string='Quantité', default=1)
    uom_id = fields.Many2one(related='product_id.uom_id')

    unit_price = fields.Monetary(string='Prix unitaire', currency_field='currency_id')
    subtotal = fields.Monetary(compute='_compute_subtotal', string='Sous-total')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)

    # Stock
    lot_id = fields.Many2one('stock.lot', string='Lot/Série')
    from_stock = fields.Boolean(string='Du stock technicien', default=True)

    @api.depends('quantity', 'unit_price')
    def _compute_subtotal(self):
        for line in self:
            line.subtotal = line.quantity * line.unit_price

    @api.onchange('product_id')
    def _onchange_product(self):
        if self.product_id:
            self.unit_price = self.product_id.lst_price
```

### 2. Techniciens et Équipes

```python
class FieldServiceTechnician(models.Model):
    _name = 'field.service.technician'
    _description = 'Technicien'
    _inherits = {'res.users': 'user_id'}
    _inherit = ['mail.thread']

    user_id = fields.Many2one('res.users', string='Utilisateur', required=True, ondelete='cascade')

    # Code technicien
    technician_code = fields.Char(string='Code', copy=False,
                                   default=lambda self: self.env['ir.sequence'].next_by_code('field.service.technician'))

    # Équipe
    team_id = fields.Many2one('field.service.team', string='Équipe')

    # Contact
    mobile_work = fields.Char(string='Téléphone professionnel')

    # Compétences
    skill_ids = fields.Many2many('field.service.skill', string='Compétences')
    certification_ids = fields.One2many('field.service.certification', 'technician_id', string='Certifications')

    # Véhicule
    vehicle_id = fields.Many2one('fleet.vehicle', string='Véhicule')
    vehicle_plate = fields.Char(related='vehicle_id.license_plate')

    # Zone géographique
    zone_ids = fields.Many2many('field.service.zone', string='Zones d\'intervention')

    # Planning
    working_hours_id = fields.Many2one('resource.calendar', string='Horaires de travail')
    max_daily_interventions = fields.Integer(string='Max interventions/jour', default=6)

    # Stock mobile
    warehouse_id = fields.Many2one('stock.warehouse', string='Entrepôt mobile')
    stock_location_id = fields.Many2one('stock.location', string='Emplacement stock')

    # Position GPS (temps réel)
    current_latitude = fields.Float(string='Latitude actuelle')
    current_longitude = fields.Float(string='Longitude actuelle')
    last_position_update = fields.Datetime(string='Dernière mise à jour position')

    # Statistiques
    intervention_count = fields.Integer(compute='_compute_stats')
    avg_rating = fields.Float(compute='_compute_stats', string='Note moyenne')
    sla_compliance = fields.Float(compute='_compute_stats', string='Respect SLA (%)')

    # État
    availability_state = fields.Selection([
        ('available', 'Disponible'),
        ('busy', 'En intervention'),
        ('traveling', 'En déplacement'),
        ('break', 'En pause'),
        ('off', 'Indisponible'),
    ], string='Disponibilité', default='available')

    active = fields.Boolean(default=True)

    @api.depends('user_id')
    def _compute_stats(self):
        for tech in self:
            interventions = self.env['field.service.intervention'].search([
                ('technician_id', '=', tech.id),
                ('state', '=', 'done'),
            ])
            tech.intervention_count = len(interventions)

            ratings = interventions.filtered(lambda i: i.satisfaction_rating).mapped('satisfaction_rating')
            tech.avg_rating = sum(int(r) for r in ratings) / len(ratings) if ratings else 0

            sla_ok = len(interventions.filtered(lambda i: i.sla_status == 'on_track'))
            tech.sla_compliance = (sla_ok / len(interventions) * 100) if interventions else 0


class FieldServiceTeam(models.Model):
    _name = 'field.service.team'
    _description = 'Équipe terrain'

    name = fields.Char(string='Nom', required=True)
    code = fields.Char(string='Code')

    # Manager
    manager_id = fields.Many2one('res.users', string='Responsable')

    # Membres
    technician_ids = fields.One2many('field.service.technician', 'team_id', string='Techniciens')
    technician_count = fields.Integer(compute='_compute_counts')

    # Spécialisation
    specialization = fields.Selection([
        ('general', 'Généraliste'),
        ('electrical', 'Électricité'),
        ('plumbing', 'Plomberie'),
        ('hvac', 'CVC/Climatisation'),
        ('it', 'Informatique'),
        ('cleaning', 'Nettoyage'),
        ('security', 'Sécurité'),
    ], string='Spécialisation', default='general')

    # Zone
    zone_ids = fields.Many2many('field.service.zone', string='Zones couvertes')

    # Couleur (pour planning)
    color = fields.Integer(string='Couleur')

    active = fields.Boolean(default=True)

    @api.depends('technician_ids')
    def _compute_counts(self):
        for team in self:
            team.technician_count = len(team.technician_ids)


class FieldServiceSkill(models.Model):
    _name = 'field.service.skill'
    _description = 'Compétence'

    name = fields.Char(string='Nom', required=True)
    code = fields.Char(string='Code')
    category = fields.Selection([
        ('technical', 'Technique'),
        ('safety', 'Sécurité'),
        ('soft', 'Savoir-être'),
        ('certification', 'Certification'),
    ], string='Catégorie', default='technical')
    description = fields.Text(string='Description')


class FieldServiceCertification(models.Model):
    _name = 'field.service.certification'
    _description = 'Certification technicien'

    technician_id = fields.Many2one('field.service.technician', required=True, ondelete='cascade')

    name = fields.Char(string='Certification', required=True)
    issuer = fields.Char(string='Organisme')
    number = fields.Char(string='Numéro')

    issue_date = fields.Date(string='Date d\'obtention')
    expiry_date = fields.Date(string='Date d\'expiration')

    is_valid = fields.Boolean(compute='_compute_validity', string='Valide')
    document = fields.Binary(string='Document')

    @api.depends('expiry_date')
    def _compute_validity(self):
        today = fields.Date.today()
        for cert in self:
            cert.is_valid = not cert.expiry_date or cert.expiry_date >= today
```

### 3. Équipements et Contrats de Maintenance

```python
class FieldServiceEquipment(models.Model):
    _name = 'field.service.equipment'
    _description = 'Équipement'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(string='Nom', required=True)
    serial_number = fields.Char(string='Numéro de série', copy=False)
    barcode = fields.Char(string='Code-barre', copy=False)

    # Propriétaire et localisation
    partner_id = fields.Many2one('res.partner', string='Client', required=True)
    site_id = fields.Many2one('field.service.site', string='Site')
    location_description = fields.Char(string='Emplacement précis')

    # Produit et catégorie
    product_id = fields.Many2one('product.product', string='Produit')
    category_id = fields.Many2one('field.service.equipment.category', string='Catégorie')
    brand = fields.Char(string='Marque')
    model = fields.Char(string='Modèle')

    # Dates
    installation_date = fields.Date(string='Date d\'installation')
    warranty_start = fields.Date(string='Début garantie')
    warranty_end = fields.Date(string='Fin garantie')
    is_under_warranty = fields.Boolean(compute='_compute_warranty', string='Sous garantie')

    # Contrat
    contract_id = fields.Many2one('field.service.contract', string='Contrat de maintenance')
    contract_state = fields.Selection(related='contract_id.state')

    # Maintenance préventive
    next_maintenance_date = fields.Date(string='Prochaine maintenance')
    maintenance_interval = fields.Integer(string='Intervalle maintenance (jours)')

    # Compteurs
    counter_ids = fields.One2many('field.service.equipment.counter', 'equipment_id', string='Compteurs')
    current_hours = fields.Float(string='Heures de fonctionnement')
    current_cycles = fields.Integer(string='Cycles')

    # Documents techniques
    document_ids = fields.One2many('field.service.equipment.document', 'equipment_id', string='Documents')

    # Interventions
    intervention_ids = fields.One2many('field.service.intervention', 'equipment_id', string='Interventions')
    intervention_count = fields.Integer(compute='_compute_counts')
    last_intervention_date = fields.Date(compute='_compute_counts')

    # État
    state = fields.Selection([
        ('operational', 'Opérationnel'),
        ('degraded', 'Dégradé'),
        ('maintenance', 'En maintenance'),
        ('broken', 'En panne'),
        ('decommissioned', 'Décommissionné'),
    ], string='État', default='operational', tracking=True)

    # Notes
    note = fields.Text(string='Notes techniques')

    # QR Code pour identification rapide
    qr_code = fields.Binary(string='QR Code', compute='_compute_qr_code', store=True)

    @api.depends('warranty_end')
    def _compute_warranty(self):
        today = fields.Date.today()
        for equipment in self:
            equipment.is_under_warranty = equipment.warranty_end and equipment.warranty_end >= today

    @api.depends('intervention_ids')
    def _compute_counts(self):
        for equipment in self:
            interventions = equipment.intervention_ids.filtered(lambda i: i.state == 'done')
            equipment.intervention_count = len(interventions)
            if interventions:
                equipment.last_intervention_date = max(interventions.mapped('actual_end')).date()
            else:
                equipment.last_intervention_date = False


class FieldServiceContract(models.Model):
    _name = 'field.service.contract'
    _description = 'Contrat de maintenance'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'date_start desc'

    name = fields.Char(string='Numéro de contrat', required=True, copy=False,
                       default=lambda self: self.env['ir.sequence'].next_by_code('field.service.contract'))

    partner_id = fields.Many2one('res.partner', string='Client', required=True, tracking=True)

    # Type
    contract_type = fields.Selection([
        ('preventive', 'Maintenance préventive'),
        ('corrective', 'Maintenance corrective'),
        ('full', 'Maintenance complète'),
        ('on_demand', 'Sur demande'),
    ], string='Type', required=True, default='preventive')

    # Durée
    date_start = fields.Date(string='Date de début', required=True)
    date_end = fields.Date(string='Date de fin', required=True)
    duration_months = fields.Integer(string='Durée (mois)')

    # Renouvellement
    auto_renewal = fields.Boolean(string='Renouvellement automatique')
    renewal_notice_days = fields.Integer(string='Préavis (jours)', default=30)

    # Équipements couverts
    equipment_ids = fields.One2many('field.service.equipment', 'contract_id', string='Équipements')
    equipment_count = fields.Integer(compute='_compute_equipment_count')

    # Visites planifiées
    planned_visit_ids = fields.One2many('field.service.planned.visit', 'contract_id', string='Visites planifiées')
    visits_per_year = fields.Integer(string='Visites/an')

    # Tarification
    pricing_type = fields.Selection([
        ('fixed', 'Forfait annuel'),
        ('per_visit', 'Par visite'),
        ('per_equipment', 'Par équipement'),
        ('mixed', 'Mixte'),
    ], string='Type de tarification', default='fixed')

    annual_amount = fields.Monetary(string='Montant annuel', currency_field='currency_id')
    visit_amount = fields.Monetary(string='Prix par visite')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)

    # Couverture
    includes_parts = fields.Boolean(string='Pièces incluses')
    includes_labor = fields.Boolean(string='Main d\'œuvre incluse')
    includes_travel = fields.Boolean(string='Déplacement inclus')
    max_response_time = fields.Integer(string='Délai d\'intervention max (h)')

    # SLA
    sla_id = fields.Many2one('field.service.sla', string='SLA')

    # État
    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('active', 'Actif'),
        ('to_renew', 'À renouveler'),
        ('expired', 'Expiré'),
        ('cancelled', 'Annulé'),
    ], string='État', default='draft', tracking=True)

    # Documents
    document = fields.Binary(string='Contrat signé')
    document_filename = fields.Char()

    @api.depends('equipment_ids')
    def _compute_equipment_count(self):
        for contract in self:
            contract.equipment_count = len(contract.equipment_ids)

    def action_activate(self):
        self.state = 'active'
        self._generate_planned_visits()

    def _generate_planned_visits(self):
        """Générer les visites préventives planifiées"""
        if not self.visits_per_year:
            return

        interval_days = 365 // self.visits_per_year
        current_date = self.date_start

        for i in range(self.visits_per_year):
            self.env['field.service.planned.visit'].create({
                'contract_id': self.id,
                'planned_date': current_date,
                'visit_type': 'preventive',
            })
            current_date += timedelta(days=interval_days)

    @api.model
    def _cron_check_expiration(self):
        """Vérifier les contrats arrivant à expiration"""
        soon_to_expire = self.search([
            ('state', '=', 'active'),
            ('date_end', '<=', fields.Date.today() + timedelta(days=60)),
            ('date_end', '>', fields.Date.today()),
        ])
        soon_to_expire.write({'state': 'to_renew'})

        for contract in soon_to_expire:
            contract.activity_schedule(
                'mail.mail_activity_data_warning',
                date_deadline=contract.date_end - timedelta(days=contract.renewal_notice_days),
                summary=f"Contrat à renouveler avant le {contract.date_end}"
            )
```

### 4. Planification et Optimisation

```python
class FieldServicePlanning(models.Model):
    _name = 'field.service.planning'
    _description = 'Planning interventions'

    def get_available_slots(self, technician_id, date, duration):
        """Obtenir les créneaux disponibles pour un technicien"""
        technician = self.env['field.service.technician'].browse(technician_id)

        # Récupérer les horaires de travail
        calendar = technician.working_hours_id
        if not calendar:
            return []

        # Récupérer les interventions existantes
        existing = self.env['field.service.intervention'].search([
            ('technician_id', '=', technician_id),
            ('scheduled_date', '>=', datetime.combine(date, datetime.min.time())),
            ('scheduled_date', '<', datetime.combine(date + timedelta(days=1), datetime.min.time())),
            ('state', 'not in', ['cancelled', 'done']),
        ])

        # Calculer les créneaux libres
        slots = []
        work_intervals = calendar._work_intervals_batch(
            datetime.combine(date, datetime.min.time()),
            datetime.combine(date, datetime.max.time()),
            resources=technician.user_id.resource_ids
        )

        # Logique de calcul des créneaux disponibles...
        return slots

    def optimize_route(self, interventions):
        """Optimiser l'ordre des interventions pour minimiser les trajets"""
        if len(interventions) <= 1:
            return interventions

        # Algorithme de plus proche voisin pour le TSP
        ordered = []
        remaining = list(interventions)

        # Point de départ : première intervention ou position actuelle du technicien
        current = remaining.pop(0)
        ordered.append(current)

        while remaining:
            # Trouver l'intervention la plus proche
            nearest = min(remaining, key=lambda i: self._calculate_distance(
                current.latitude, current.longitude,
                i.latitude, i.longitude
            ))
            ordered.append(nearest)
            remaining.remove(nearest)
            current = nearest

        return ordered

    def _calculate_distance(self, lat1, lon1, lat2, lon2):
        """Calculer la distance entre deux points (formule de Haversine)"""
        R = 6371  # Rayon de la Terre en km

        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))

        return R * c

    def auto_assign_technician(self, intervention):
        """Assigner automatiquement le meilleur technicien"""
        required_skills = intervention.skill_ids

        # Filtrer les techniciens disponibles avec les compétences requises
        technicians = self.env['field.service.technician'].search([
            ('availability_state', '=', 'available'),
            ('skill_ids', 'in', required_skills.ids) if required_skills else (1, '=', 1),
        ])

        # Filtrer par zone géographique
        if intervention.latitude and intervention.longitude:
            # Garder les techniciens dans un rayon de 50km
            nearby = technicians.filtered(lambda t:
                t.current_latitude and t.current_longitude and
                self._calculate_distance(
                    intervention.latitude, intervention.longitude,
                    t.current_latitude, t.current_longitude
                ) <= 50
            )
            if nearby:
                technicians = nearby

        if not technicians:
            return False

        # Sélectionner le technicien avec le moins d'interventions planifiées
        best = min(technicians, key=lambda t: self.env['field.service.intervention'].search_count([
            ('technician_id', '=', t.id),
            ('state', 'in', ['planned', 'confirmed']),
            ('scheduled_date', '>=', fields.Date.today()),
        ]))

        return best
```

### 5. Application Mobile (API)

```python
from odoo import http
from odoo.http import request
import json

class FieldServiceAPI(http.Controller):

    @http.route('/api/field-service/interventions', type='json', auth='user')
    def get_interventions(self, **kwargs):
        """Récupérer les interventions du technicien connecté"""
        technician = request.env['field.service.technician'].search([
            ('user_id', '=', request.env.user.id)
        ], limit=1)

        if not technician:
            return {'error': 'Technicien non trouvé'}

        interventions = request.env['field.service.intervention'].search([
            ('technician_id', '=', technician.id),
            ('state', 'in', ['planned', 'confirmed', 'traveling', 'in_progress']),
            ('scheduled_date', '>=', fields.Date.today()),
        ], order='scheduled_date')

        return [{
            'id': i.id,
            'name': i.name,
            'client': i.partner_id.name,
            'address': f"{i.street}, {i.zip} {i.city}",
            'latitude': i.latitude,
            'longitude': i.longitude,
            'scheduled_date': i.scheduled_date.isoformat() if i.scheduled_date else None,
            'priority': i.priority,
            'state': i.state,
            'description': i.description,
            'equipment': i.equipment_id.name if i.equipment_id else None,
        } for i in interventions]

    @http.route('/api/field-service/intervention/<int:intervention_id>/start', type='json', auth='user', methods=['POST'])
    def start_intervention(self, intervention_id, **kwargs):
        """Démarrer une intervention"""
        intervention = request.env['field.service.intervention'].browse(intervention_id)
        if intervention.state == 'traveling':
            intervention.action_arrive()
        elif intervention.state == 'confirmed':
            intervention.action_start_travel()
        return {'success': True, 'state': intervention.state}

    @http.route('/api/field-service/intervention/<int:intervention_id>/complete', type='json', auth='user', methods=['POST'])
    def complete_intervention(self, intervention_id, **post):
        """Terminer une intervention"""
        intervention = request.env['field.service.intervention'].browse(intervention_id)

        # Mettre à jour les informations
        intervention.write({
            'resolution': post.get('resolution'),
            'resolution_type': post.get('resolution_type', 'resolved'),
        })

        intervention.action_done()

        return {'success': True, 'state': intervention.state}

    @http.route('/api/field-service/intervention/<int:intervention_id>/signature', type='json', auth='user', methods=['POST'])
    def save_signature(self, intervention_id, **post):
        """Enregistrer la signature client"""
        intervention = request.env['field.service.intervention'].browse(intervention_id)
        intervention.write({
            'customer_signature': post.get('signature'),
            'signed_by': post.get('signed_by'),
            'signature_date': fields.Datetime.now(),
        })
        return {'success': True}

    @http.route('/api/field-service/update-position', type='json', auth='user', methods=['POST'])
    def update_position(self, latitude, longitude, **kwargs):
        """Mettre à jour la position GPS du technicien"""
        technician = request.env['field.service.technician'].search([
            ('user_id', '=', request.env.user.id)
        ], limit=1)

        if technician:
            technician.write({
                'current_latitude': latitude,
                'current_longitude': longitude,
                'last_position_update': fields.Datetime.now(),
            })
            return {'success': True}
        return {'error': 'Technicien non trouvé'}
```

### 6. Rapports et KPIs

```python
class FieldServiceReport(models.Model):
    _name = 'field.service.report'
    _description = 'Rapport Field Service'
    _auto = False

    def get_kpis(self, date_from, date_to):
        """Calculer les KPIs de la période"""
        interventions = self.env['field.service.intervention'].search([
            ('actual_end', '>=', date_from),
            ('actual_end', '<=', date_to),
            ('state', '=', 'done'),
        ])

        total = len(interventions)
        if not total:
            return {}

        # First Time Fix Rate
        ftfr_count = len(interventions.filtered(lambda i: i.resolution_type == 'resolved'))
        ftfr = (ftfr_count / total) * 100

        # SLA Compliance
        sla_ok = len(interventions.filtered(lambda i: i.sla_status == 'on_track'))
        sla_compliance = (sla_ok / total) * 100

        # Temps moyen de résolution
        avg_duration = sum(interventions.mapped('actual_duration')) / total

        # Satisfaction moyenne
        rated = interventions.filtered(lambda i: i.satisfaction_rating)
        avg_satisfaction = sum(int(i.satisfaction_rating) for i in rated) / len(rated) if rated else 0

        # Productivité
        revenue = sum(interventions.filtered('billable').mapped('total_cost'))
        labor_hours = sum(interventions.mapped('actual_duration'))

        return {
            'total_interventions': total,
            'ftfr': round(ftfr, 1),
            'sla_compliance': round(sla_compliance, 1),
            'avg_duration': round(avg_duration, 2),
            'avg_satisfaction': round(avg_satisfaction, 1),
            'total_revenue': revenue,
            'labor_hours': round(labor_hours, 1),
            'revenue_per_hour': round(revenue / labor_hours, 2) if labor_hours else 0,
        }

    def get_technician_performance(self, technician_id, date_from, date_to):
        """Performance d'un technicien"""
        interventions = self.env['field.service.intervention'].search([
            ('technician_id', '=', technician_id),
            ('actual_end', '>=', date_from),
            ('actual_end', '<=', date_to),
            ('state', '=', 'done'),
        ])

        return {
            'interventions_completed': len(interventions),
            'total_hours': sum(interventions.mapped('actual_duration')),
            'avg_intervention_time': sum(interventions.mapped('actual_duration')) / len(interventions) if interventions else 0,
            'parts_used_value': sum(interventions.mapped('parts_cost')),
            'satisfaction_avg': sum(int(i.satisfaction_rating) for i in interventions.filtered('satisfaction_rating')) / len(interventions.filtered('satisfaction_rating')) if interventions.filtered('satisfaction_rating') else 0,
        }
```

## Best Practices

### Géocodage automatique
```python
@api.onchange('street', 'zip', 'city', 'country_id')
def _onchange_address_geocode(self):
    """Géocoder automatiquement l'adresse"""
    if self.street and self.city:
        # Utiliser un service de géocodage (ex: Nominatim, Google Maps)
        address = f"{self.street}, {self.zip} {self.city}"
        # coords = geocode_address(address)
        # self.latitude = coords['lat']
        # self.longitude = coords['lng']
        pass
```

### Notifications push
```python
def _send_push_notification(self, technician, title, body):
    """Envoyer une notification push au technicien"""
    # Intégration Firebase Cloud Messaging ou autre service
    pass
```

---

## Section 8: IT Asset Management Extension

> Patterns additionnels pour la gestion de parcs informatiques
> Source: github.com/noushiFlex/odoo-it-asset-management

### 8.1 Software/License Management

```python
class ITLogiciel(models.Model):
    """Gestion des logiciels et licences IT"""
    _name = 'it.logiciel'
    _description = 'Logiciel IT'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char('Nom du logiciel', required=True, tracking=True)
    version = fields.Char('Version')
    editeur = fields.Char('Éditeur')

    type_licence = fields.Selection([
        ('perpetual', 'Perpétuelle'),
        ('subscription', 'Abonnement'),
        ('oem', 'OEM'),
        ('volume', 'Volume'),
        ('freeware', 'Gratuit'),
        ('open_source', 'Open Source'),
    ], string='Type de licence', default='subscription', tracking=True)

    date_achat = fields.Date('Date d\'achat')
    date_expiration = fields.Date('Date d\'expiration', tracking=True)

    nb_licences_total = fields.Integer('Licences totales')
    nb_licences_utilisees = fields.Integer('Licences utilisées', compute='_compute_licences')
    nb_licences_disponibles = fields.Integer('Licences disponibles', compute='_compute_licences')

    cout_unitaire = fields.Float('Coût unitaire')
    cout_total = fields.Float('Coût total', compute='_compute_cout')

    equipement_ids = fields.Many2many('it.equipement', string='Équipements installés')
    fournisseur_id = fields.Many2one('res.partner', string='Fournisseur')

    state = fields.Selection([
        ('active', 'Active'),
        ('expiring', 'Expire bientôt'),
        ('expired', 'Expirée'),
        ('archived', 'Archivée'),
    ], string='État', compute='_compute_state', store=True)

    @api.depends('equipement_ids')
    def _compute_licences(self):
        for record in self:
            record.nb_licences_utilisees = len(record.equipement_ids)
            record.nb_licences_disponibles = record.nb_licences_total - record.nb_licences_utilisees

    @api.depends('nb_licences_total', 'cout_unitaire')
    def _compute_cout(self):
        for record in self:
            record.cout_total = record.nb_licences_total * record.cout_unitaire

    @api.depends('date_expiration')
    def _compute_state(self):
        today = fields.Date.today()
        for record in self:
            if not record.date_expiration:
                record.state = 'active'
            elif record.date_expiration < today:
                record.state = 'expired'
            elif record.date_expiration < today + timedelta(days=30):
                record.state = 'expiring'
            else:
                record.state = 'active'

    @api.model
    def _cron_check_expiring_licenses(self):
        """Cron pour alerter sur les licences qui expirent"""
        today = fields.Date.today()
        expiring_soon = self.search([
            ('date_expiration', '>=', today),
            ('date_expiration', '<=', today + timedelta(days=30)),
            ('type_licence', '!=', 'freeware'),
        ])
        for licence in expiring_soon:
            licence.message_post(
                body=f"⚠️ La licence {licence.name} expire le {licence.date_expiration}",
                subject="Licence IT - Expiration proche"
            )
```

### 8.2 IT Equipment Tracking

```python
class ITEquipement(models.Model):
    """Extension équipement pour IT"""
    _name = 'it.equipement'
    _description = 'Équipement IT'
    _inherit = ['field.service.equipment']  # Hérite de l'équipement Field Service

    # Champs IT spécifiques
    type_equipement = fields.Selection([
        ('desktop', 'Ordinateur fixe'),
        ('laptop', 'Ordinateur portable'),
        ('server', 'Serveur'),
        ('printer', 'Imprimante'),
        ('network', 'Équipement réseau'),
        ('mobile', 'Appareil mobile'),
        ('peripheral', 'Périphérique'),
        ('other', 'Autre'),
    ], string='Type d\'équipement', required=True)

    hostname = fields.Char('Nom d\'hôte')
    ip_address = fields.Char('Adresse IP')
    mac_address = fields.Char('Adresse MAC')

    os_id = fields.Many2one('it.logiciel', string='Système d\'exploitation',
                            domain=[('type_licence', 'in', ['perpetual', 'oem'])])
    logiciel_ids = fields.Many2many('it.logiciel', string='Logiciels installés')

    ram_gb = fields.Integer('RAM (Go)')
    stockage_gb = fields.Integer('Stockage (Go)')
    processeur = fields.Char('Processeur')

    employe_id = fields.Many2one('hr.employee', string='Utilisateur')
    poste_technique_id = fields.Many2one('hr.poste.technique', string='Poste technique')

    date_installation = fields.Date('Date d\'installation')
    date_fin_garantie = fields.Date('Fin de garantie')

    # Cycle de vie
    lifecycle_state = fields.Selection([
        ('new', 'Neuf'),
        ('deployed', 'Déployé'),
        ('maintenance', 'En maintenance'),
        ('retired', 'Réformé'),
        ('disposed', 'Éliminé'),
    ], string='État du cycle de vie', default='new', tracking=True)

    def action_deploy(self):
        """Déployer l'équipement"""
        self.write({
            'lifecycle_state': 'deployed',
            'date_installation': fields.Date.today(),
        })

    def action_retire(self):
        """Réformer l'équipement"""
        self.write({
            'lifecycle_state': 'retired',
            'employe_id': False,
        })
```

### 8.3 IT Dashboard KPIs

```python
class ITDashboard(models.Model):
    """Dashboard KPIs IT"""
    _name = 'it.dashboard'
    _description = 'Tableau de bord IT'

    name = fields.Char('Nom', default='Dashboard IT')

    # KPIs calculés
    total_equipements = fields.Integer('Total équipements', compute='_compute_stats')
    equipements_deployes = fields.Integer('Déployés', compute='_compute_stats')
    equipements_maintenance = fields.Integer('En maintenance', compute='_compute_stats')

    total_licences = fields.Integer('Total licences', compute='_compute_licence_stats')
    licences_expirant = fields.Integer('Expirent sous 30j', compute='_compute_licence_stats')
    licences_expirees = fields.Integer('Expirées', compute='_compute_licence_stats')

    tickets_ouverts = fields.Integer('Tickets ouverts', compute='_compute_ticket_stats')
    tickets_urgents = fields.Integer('Tickets urgents', compute='_compute_ticket_stats')

    cout_licences_mensuel = fields.Float('Coût licences/mois', compute='_compute_costs')
    valeur_parc = fields.Float('Valeur du parc', compute='_compute_costs')

    def _compute_stats(self):
        Equipement = self.env['it.equipement']
        for record in self:
            record.total_equipements = Equipement.search_count([])
            record.equipements_deployes = Equipement.search_count([('lifecycle_state', '=', 'deployed')])
            record.equipements_maintenance = Equipement.search_count([('lifecycle_state', '=', 'maintenance')])

    def _compute_licence_stats(self):
        Logiciel = self.env['it.logiciel']
        today = fields.Date.today()
        for record in self:
            record.total_licences = Logiciel.search_count([])
            record.licences_expirant = Logiciel.search_count([
                ('date_expiration', '>=', today),
                ('date_expiration', '<=', today + timedelta(days=30)),
            ])
            record.licences_expirees = Logiciel.search_count([
                ('date_expiration', '<', today),
            ])

    def _compute_ticket_stats(self):
        Ticket = self.env['helpdesk.ticket']
        for record in self:
            record.tickets_ouverts = Ticket.search_count([
                ('stage_id.is_close', '=', False),
            ])
            record.tickets_urgents = Ticket.search_count([
                ('stage_id.is_close', '=', False),
                ('priority', '>=', '2'),
            ])

    def _compute_costs(self):
        Logiciel = self.env['it.logiciel']
        Equipement = self.env['it.equipement']
        for record in self:
            # Coût mensuel des abonnements
            subscriptions = Logiciel.search([('type_licence', '=', 'subscription')])
            record.cout_licences_mensuel = sum(subscriptions.mapped('cout_total')) / 12

            # Valeur du parc
            equipements = Equipement.search([('lifecycle_state', 'in', ['new', 'deployed'])])
            record.valeur_parc = sum(equipements.mapped('purchase_value'))
```

### 8.4 Helpdesk IT Extension

```python
class HelpdeskTicketIT(models.Model):
    """Extension tickets helpdesk pour IT"""
    _inherit = 'helpdesk.ticket'

    equipement_id = fields.Many2one('it.equipement', string='Équipement concerné')
    logiciel_id = fields.Many2one('it.logiciel', string='Logiciel concerné')

    type_incident = fields.Selection([
        ('hardware', 'Matériel'),
        ('software', 'Logiciel'),
        ('network', 'Réseau'),
        ('security', 'Sécurité'),
        ('access', 'Accès/Droits'),
        ('other', 'Autre'),
    ], string='Type d\'incident')

    impact = fields.Selection([
        ('low', 'Faible - Un utilisateur'),
        ('medium', 'Moyen - Équipe/Service'),
        ('high', 'Élevé - Département'),
        ('critical', 'Critique - Organisation'),
    ], string='Impact')

    @api.onchange('equipement_id')
    def _onchange_equipement(self):
        """Pré-remplir infos depuis l'équipement"""
        if self.equipement_id:
            self.partner_id = self.equipement_id.employe_id.address_home_id
```

---

*Section 8 ajoutée le 27 Décembre 2025 - Patterns IT Asset Management*
