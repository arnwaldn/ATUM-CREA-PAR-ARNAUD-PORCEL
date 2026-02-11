# Odoo Healthcare & Wellness Expert

## Role Definition
Expert en développement de modules Odoo pour le secteur de la santé et du bien-être. Spécialisé dans les cliniques, cabinets médicaux, laboratoires, pharmacies, centres de bien-être, salles de sport et spas.

## Core Competencies

### 1. Modèles Métier Santé

#### Patient
```python
from odoo import models, fields, api
from odoo.exceptions import ValidationError, UserError
from datetime import date, timedelta
import hashlib

class HealthcarePatient(models.Model):
    _name = 'healthcare.patient'
    _description = 'Patient'
    _inherits = {'res.partner': 'partner_id'}
    _inherit = ['mail.thread', 'mail.activity.mixin']

    partner_id = fields.Many2one('res.partner', string='Contact', required=True, ondelete='cascade')

    # Identifiant unique
    patient_id = fields.Char(string='Numéro patient', required=True, copy=False,
                              default=lambda self: self.env['ir.sequence'].next_by_code('healthcare.patient'))

    # Informations personnelles
    birthdate = fields.Date(string='Date de naissance', required=True)
    age = fields.Integer(string='Âge', compute='_compute_age', store=True)
    gender = fields.Selection([
        ('male', 'Homme'),
        ('female', 'Femme'),
        ('other', 'Autre'),
    ], string='Genre', required=True)
    blood_type = fields.Selection([
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
    ], string='Groupe sanguin')

    # Numéros officiels
    social_security_number = fields.Char(string='Numéro de sécurité sociale')
    national_id = fields.Char(string='Numéro d\'identité nationale')

    # Contact d'urgence
    emergency_contact_name = fields.Char(string='Contact d\'urgence')
    emergency_contact_phone = fields.Char(string='Téléphone urgence')
    emergency_contact_relation = fields.Selection([
        ('spouse', 'Conjoint(e)'),
        ('parent', 'Parent'),
        ('child', 'Enfant'),
        ('sibling', 'Frère/Sœur'),
        ('other', 'Autre'),
    ], string='Relation')

    # Médecin traitant
    primary_physician_id = fields.Many2one('healthcare.practitioner', string='Médecin traitant')

    # Informations médicales
    allergy_ids = fields.Many2many('healthcare.allergy', string='Allergies')
    chronic_condition_ids = fields.Many2many('healthcare.condition', string='Conditions chroniques')
    current_medication_ids = fields.One2many('healthcare.patient.medication', 'patient_id',
                                              string='Médicaments en cours')

    # Antécédents
    medical_history_ids = fields.One2many('healthcare.medical.history', 'patient_id',
                                           string='Antécédents médicaux')
    surgical_history_ids = fields.One2many('healthcare.surgical.history', 'patient_id',
                                            string='Antécédents chirurgicaux')
    family_history_ids = fields.One2many('healthcare.family.history', 'patient_id',
                                          string='Antécédents familiaux')

    # Rendez-vous et consultations
    appointment_ids = fields.One2many('healthcare.appointment', 'patient_id', string='Rendez-vous')
    consultation_ids = fields.One2many('healthcare.consultation', 'patient_id', string='Consultations')
    prescription_ids = fields.One2many('healthcare.prescription', 'patient_id', string='Ordonnances')

    # Documents
    document_ids = fields.One2many('healthcare.patient.document', 'patient_id', string='Documents')

    # Assurance
    insurance_ids = fields.One2many('healthcare.patient.insurance', 'patient_id', string='Assurances')
    primary_insurance_id = fields.Many2one('healthcare.patient.insurance', string='Assurance principale')

    # Consentements
    consent_ids = fields.One2many('healthcare.consent', 'patient_id', string='Consentements')

    # Notes
    note = fields.Text(string='Notes médicales')
    alert_note = fields.Text(string='Alerte (affiché en priorité)')

    # Statistiques
    appointment_count = fields.Integer(compute='_compute_counts')
    consultation_count = fields.Integer(compute='_compute_counts')
    prescription_count = fields.Integer(compute='_compute_counts')

    # RGPD
    data_consent = fields.Boolean(string='Consentement données personnelles')
    data_consent_date = fields.Date(string='Date du consentement')

    @api.depends('birthdate')
    def _compute_age(self):
        today = date.today()
        for patient in self:
            if patient.birthdate:
                patient.age = today.year - patient.birthdate.year - (
                    (today.month, today.day) < (patient.birthdate.month, patient.birthdate.day)
                )
            else:
                patient.age = 0

    @api.depends('appointment_ids', 'consultation_ids', 'prescription_ids')
    def _compute_counts(self):
        for patient in self:
            patient.appointment_count = len(patient.appointment_ids)
            patient.consultation_count = len(patient.consultation_ids)
            patient.prescription_count = len(patient.prescription_ids)

    def action_view_medical_record(self):
        """Ouvrir le dossier médical complet"""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': f'Dossier médical - {self.name}',
            'res_model': 'healthcare.patient',
            'res_id': self.id,
            'view_mode': 'form',
            'view_id': self.env.ref('healthcare.view_patient_medical_record_form').id,
        }


class HealthcarePatientInsurance(models.Model):
    _name = 'healthcare.patient.insurance'
    _description = 'Assurance patient'

    patient_id = fields.Many2one('healthcare.patient', string='Patient', required=True, ondelete='cascade')
    insurance_company_id = fields.Many2one('res.partner', string='Assureur', required=True,
                                            domain=[('is_company', '=', True)])

    policy_number = fields.Char(string='Numéro de police', required=True)
    group_number = fields.Char(string='Numéro de groupe')
    member_id = fields.Char(string='Numéro d\'adhérent')

    coverage_start = fields.Date(string='Début de couverture')
    coverage_end = fields.Date(string='Fin de couverture')

    coverage_type = fields.Selection([
        ('basic', 'Base'),
        ('complementary', 'Complémentaire'),
        ('full', 'Intégrale'),
    ], string='Type de couverture')

    coverage_percentage = fields.Float(string='Taux de couverture (%)', default=100)

    is_active = fields.Boolean(string='Active', compute='_compute_is_active', store=True)

    @api.depends('coverage_start', 'coverage_end')
    def _compute_is_active(self):
        today = fields.Date.today()
        for insurance in self:
            insurance.is_active = (
                insurance.coverage_start <= today <= (insurance.coverage_end or date.max)
            )
```

#### Practitioner (Praticien)
```python
class HealthcarePractitioner(models.Model):
    _name = 'healthcare.practitioner'
    _description = 'Praticien de santé'
    _inherits = {'res.partner': 'partner_id'}
    _inherit = ['mail.thread']

    partner_id = fields.Many2one('res.partner', string='Contact', required=True, ondelete='cascade')

    # Identification professionnelle
    practitioner_type = fields.Selection([
        ('doctor', 'Médecin'),
        ('specialist', 'Médecin spécialiste'),
        ('dentist', 'Dentiste'),
        ('nurse', 'Infirmier(e)'),
        ('physiotherapist', 'Kinésithérapeute'),
        ('psychologist', 'Psychologue'),
        ('pharmacist', 'Pharmacien'),
        ('optician', 'Opticien'),
        ('other', 'Autre'),
    ], string='Type', required=True)

    specialty_id = fields.Many2one('healthcare.specialty', string='Spécialité')
    registration_number = fields.Char(string='Numéro RPPS/ADELI')
    license_number = fields.Char(string='Numéro d\'ordre')

    # Qualifications
    qualification_ids = fields.One2many('healthcare.practitioner.qualification', 'practitioner_id',
                                         string='Qualifications')

    # Disponibilité
    schedule_ids = fields.One2many('healthcare.practitioner.schedule', 'practitioner_id',
                                    string='Planning')
    appointment_duration = fields.Integer(string='Durée RDV par défaut (min)', default=30)

    # Tarifs
    consultation_fee = fields.Monetary(string='Tarif consultation', currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)

    # Lieu d'exercice
    location_ids = fields.Many2many('healthcare.location', string='Lieux d\'exercice')

    # Utilisateur Odoo lié
    user_id = fields.Many2one('res.users', string='Utilisateur')

    # Statistiques
    patient_count = fields.Integer(compute='_compute_stats')
    appointment_count = fields.Integer(compute='_compute_stats')

    active = fields.Boolean(default=True)


class HealthcareSpecialty(models.Model):
    _name = 'healthcare.specialty'
    _description = 'Spécialité médicale'

    name = fields.Char(string='Nom', required=True)
    code = fields.Char(string='Code')
    description = fields.Text(string='Description')

    practitioner_ids = fields.One2many('healthcare.practitioner', 'specialty_id', string='Praticiens')
```

#### Appointment (Rendez-vous)
```python
class HealthcareAppointment(models.Model):
    _name = 'healthcare.appointment'
    _description = 'Rendez-vous'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'datetime_start desc'

    name = fields.Char(string='Référence', required=True, copy=False,
                       default=lambda self: self.env['ir.sequence'].next_by_code('healthcare.appointment'))

    patient_id = fields.Many2one('healthcare.patient', string='Patient', required=True, tracking=True)
    practitioner_id = fields.Many2one('healthcare.practitioner', string='Praticien', required=True, tracking=True)

    # Planning
    datetime_start = fields.Datetime(string='Date et heure', required=True, tracking=True)
    datetime_end = fields.Datetime(string='Fin', compute='_compute_datetime_end', store=True)
    duration = fields.Integer(string='Durée (min)', default=30)

    # Type
    appointment_type_id = fields.Many2one('healthcare.appointment.type', string='Type de RDV')
    is_first_visit = fields.Boolean(string='Première visite')
    is_urgent = fields.Boolean(string='Urgent')

    # Lieu
    location_id = fields.Many2one('healthcare.location', string='Lieu')
    room_id = fields.Many2one('healthcare.room', string='Salle')

    # Téléconsultation
    is_teleconsultation = fields.Boolean(string='Téléconsultation')
    teleconsultation_url = fields.Char(string='Lien visio')

    # Motif
    reason = fields.Text(string='Motif de consultation')
    note = fields.Text(string='Notes internes')

    # État
    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('confirmed', 'Confirmé'),
        ('arrived', 'Patient arrivé'),
        ('in_progress', 'En cours'),
        ('done', 'Terminé'),
        ('no_show', 'Absent'),
        ('cancelled', 'Annulé'),
    ], string='État', default='draft', tracking=True)

    # Consultation liée
    consultation_id = fields.Many2one('healthcare.consultation', string='Consultation')

    # Rappels
    reminder_sent = fields.Boolean(string='Rappel envoyé')
    reminder_sms_sent = fields.Boolean(string='SMS envoyé')

    # Calendrier
    calendar_event_id = fields.Many2one('calendar.event', string='Événement calendrier')

    @api.depends('datetime_start', 'duration')
    def _compute_datetime_end(self):
        for appointment in self:
            if appointment.datetime_start and appointment.duration:
                appointment.datetime_end = appointment.datetime_start + timedelta(minutes=appointment.duration)
            else:
                appointment.datetime_end = appointment.datetime_start

    @api.constrains('datetime_start', 'practitioner_id')
    def _check_practitioner_availability(self):
        for appointment in self:
            # Vérifier les conflits de planning
            conflicts = self.search([
                ('id', '!=', appointment.id),
                ('practitioner_id', '=', appointment.practitioner_id.id),
                ('state', 'not in', ['cancelled', 'no_show']),
                ('datetime_start', '<', appointment.datetime_end),
                ('datetime_end', '>', appointment.datetime_start),
            ])
            if conflicts:
                raise ValidationError(
                    f"Le praticien a déjà un rendez-vous à cette heure: {conflicts[0].name}"
                )

    def action_confirm(self):
        self.state = 'confirmed'
        self._create_calendar_event()
        self._send_confirmation()

    def action_patient_arrived(self):
        self.state = 'arrived'

    def action_start(self):
        self.state = 'in_progress'
        # Créer la consultation
        consultation = self.env['healthcare.consultation'].create({
            'patient_id': self.patient_id.id,
            'practitioner_id': self.practitioner_id.id,
            'appointment_id': self.id,
            'date': fields.Datetime.now(),
        })
        self.consultation_id = consultation
        return {
            'type': 'ir.actions.act_window',
            'res_model': 'healthcare.consultation',
            'res_id': consultation.id,
            'view_mode': 'form',
        }

    def action_done(self):
        self.state = 'done'

    def action_no_show(self):
        self.state = 'no_show'

    def action_cancel(self):
        self.state = 'cancelled'
        if self.calendar_event_id:
            self.calendar_event_id.unlink()

    def _create_calendar_event(self):
        """Créer l'événement calendrier"""
        self.ensure_one()
        event = self.env['calendar.event'].create({
            'name': f"RDV {self.patient_id.name}",
            'start': self.datetime_start,
            'stop': self.datetime_end,
            'user_id': self.practitioner_id.user_id.id if self.practitioner_id.user_id else self.env.user.id,
            'partner_ids': [(4, self.patient_id.partner_id.id)],
        })
        self.calendar_event_id = event

    @api.model
    def _cron_send_reminders(self):
        """Envoyer les rappels de rendez-vous"""
        tomorrow = fields.Datetime.now() + timedelta(days=1)
        appointments = self.search([
            ('datetime_start', '>=', tomorrow.replace(hour=0, minute=0)),
            ('datetime_start', '<', tomorrow.replace(hour=23, minute=59)),
            ('state', '=', 'confirmed'),
            ('reminder_sent', '=', False),
        ])
        for appointment in appointments:
            appointment._send_reminder()
            appointment.reminder_sent = True
```

#### Consultation
```python
class HealthcareConsultation(models.Model):
    _name = 'healthcare.consultation'
    _description = 'Consultation médicale'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'date desc'

    name = fields.Char(string='Référence', required=True, copy=False,
                       default=lambda self: self.env['ir.sequence'].next_by_code('healthcare.consultation'))

    patient_id = fields.Many2one('healthcare.patient', string='Patient', required=True)
    practitioner_id = fields.Many2one('healthcare.practitioner', string='Praticien', required=True)
    appointment_id = fields.Many2one('healthcare.appointment', string='Rendez-vous')

    date = fields.Datetime(string='Date', default=fields.Datetime.now, required=True)

    # Motif
    chief_complaint = fields.Text(string='Motif de consultation')
    history_present_illness = fields.Html(string='Histoire de la maladie')

    # Examen clinique
    vital_sign_ids = fields.One2many('healthcare.vital.signs', 'consultation_id', string='Signes vitaux')

    # Paramètres vitaux (raccourcis)
    weight = fields.Float(string='Poids (kg)')
    height = fields.Float(string='Taille (cm)')
    bmi = fields.Float(string='IMC', compute='_compute_bmi', store=True)
    temperature = fields.Float(string='Température (°C)')
    blood_pressure_systolic = fields.Integer(string='Tension systolique')
    blood_pressure_diastolic = fields.Integer(string='Tension diastolique')
    heart_rate = fields.Integer(string='Fréquence cardiaque')
    respiratory_rate = fields.Integer(string='Fréquence respiratoire')
    oxygen_saturation = fields.Float(string='SpO2 (%)')

    # Examen physique
    physical_examination = fields.Html(string='Examen physique')

    # Diagnostic
    diagnosis_ids = fields.Many2many('healthcare.diagnosis', string='Diagnostics')
    diagnosis_notes = fields.Text(string='Notes diagnostic')

    # Plan de traitement
    treatment_plan = fields.Html(string='Plan de traitement')

    # Prescriptions
    prescription_ids = fields.One2many('healthcare.prescription', 'consultation_id', string='Ordonnances')

    # Examens prescrits
    lab_order_ids = fields.One2many('healthcare.lab.order', 'consultation_id', string='Examens de laboratoire')
    imaging_order_ids = fields.One2many('healthcare.imaging.order', 'consultation_id', string='Imagerie')

    # Suivi
    follow_up_required = fields.Boolean(string='Suivi requis')
    follow_up_date = fields.Date(string='Date de suivi')
    follow_up_notes = fields.Text(string='Notes de suivi')

    # État
    state = fields.Selection([
        ('draft', 'En cours'),
        ('completed', 'Terminée'),
        ('cancelled', 'Annulée'),
    ], string='État', default='draft')

    # Facturation
    invoice_id = fields.Many2one('account.move', string='Facture')
    amount = fields.Monetary(string='Montant', currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)

    @api.depends('weight', 'height')
    def _compute_bmi(self):
        for consultation in self:
            if consultation.weight and consultation.height:
                height_m = consultation.height / 100
                consultation.bmi = consultation.weight / (height_m ** 2)
            else:
                consultation.bmi = 0

    def action_complete(self):
        self.state = 'completed'
        if self.appointment_id:
            self.appointment_id.state = 'done'

    def action_create_prescription(self):
        """Créer une ordonnance"""
        return {
            'type': 'ir.actions.act_window',
            'name': 'Nouvelle ordonnance',
            'res_model': 'healthcare.prescription',
            'view_mode': 'form',
            'context': {
                'default_patient_id': self.patient_id.id,
                'default_practitioner_id': self.practitioner_id.id,
                'default_consultation_id': self.id,
            },
        }

    def action_create_invoice(self):
        """Créer la facture"""
        self.ensure_one()
        invoice = self.env['account.move'].create({
            'move_type': 'out_invoice',
            'partner_id': self.patient_id.partner_id.id,
            'invoice_line_ids': [(0, 0, {
                'name': f'Consultation du {self.date.strftime("%d/%m/%Y")}',
                'quantity': 1,
                'price_unit': self.practitioner_id.consultation_fee,
            })],
        })
        self.invoice_id = invoice
        return {
            'type': 'ir.actions.act_window',
            'res_model': 'account.move',
            'res_id': invoice.id,
            'view_mode': 'form',
        }
```

### 2. Ordonnances et Médicaments

```python
class HealthcarePrescription(models.Model):
    _name = 'healthcare.prescription'
    _description = 'Ordonnance'
    _inherit = ['mail.thread']
    _order = 'date desc'

    name = fields.Char(string='Numéro', required=True, copy=False,
                       default=lambda self: self.env['ir.sequence'].next_by_code('healthcare.prescription'))

    patient_id = fields.Many2one('healthcare.patient', string='Patient', required=True)
    practitioner_id = fields.Many2one('healthcare.practitioner', string='Prescripteur', required=True)
    consultation_id = fields.Many2one('healthcare.consultation', string='Consultation')

    date = fields.Date(string='Date', default=fields.Date.today, required=True)
    validity_days = fields.Integer(string='Validité (jours)', default=90)
    expiry_date = fields.Date(string='Date d\'expiration', compute='_compute_expiry')

    # Lignes de prescription
    line_ids = fields.One2many('healthcare.prescription.line', 'prescription_id', string='Médicaments')

    # Type
    prescription_type = fields.Selection([
        ('standard', 'Standard'),
        ('chronic', 'Maladie chronique'),
        ('exceptional', 'Médicament d\'exception'),
        ('hospital', 'Hospitalière'),
    ], string='Type', default='standard')

    # Instructions
    general_instructions = fields.Text(string='Instructions générales')

    # Renouvellement
    is_renewable = fields.Boolean(string='Renouvelable')
    renewal_count = fields.Integer(string='Nombre de renouvellements')
    renewals_remaining = fields.Integer(string='Renouvellements restants')

    # État
    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('validated', 'Validée'),
        ('dispensed', 'Délivrée'),
        ('expired', 'Expirée'),
        ('cancelled', 'Annulée'),
    ], string='État', default='draft')

    # Document
    document = fields.Binary(string='Document PDF')
    document_filename = fields.Char()

    @api.depends('date', 'validity_days')
    def _compute_expiry(self):
        for prescription in self:
            if prescription.date and prescription.validity_days:
                prescription.expiry_date = prescription.date + timedelta(days=prescription.validity_days)
            else:
                prescription.expiry_date = False

    def action_validate(self):
        self.state = 'validated'
        self._generate_pdf()

    def _generate_pdf(self):
        """Générer le PDF de l'ordonnance"""
        report = self.env.ref('healthcare.action_report_prescription')
        pdf_content, _ = report._render_qweb_pdf(self.ids)
        import base64
        self.document = base64.b64encode(pdf_content)
        self.document_filename = f"ordonnance_{self.name}.pdf"


class HealthcarePrescriptionLine(models.Model):
    _name = 'healthcare.prescription.line'
    _description = 'Ligne d\'ordonnance'
    _order = 'sequence'

    sequence = fields.Integer(default=10)
    prescription_id = fields.Many2one('healthcare.prescription', string='Ordonnance',
                                       required=True, ondelete='cascade')

    # Médicament
    medication_id = fields.Many2one('healthcare.medication', string='Médicament', required=True)
    medication_name = fields.Char(related='medication_id.name')

    # Posologie
    dosage = fields.Char(string='Dosage')  # Ex: "500mg"
    quantity = fields.Float(string='Quantité')
    quantity_unit = fields.Selection([
        ('tablet', 'Comprimé(s)'),
        ('capsule', 'Gélule(s)'),
        ('ml', 'ml'),
        ('mg', 'mg'),
        ('drop', 'Goutte(s)'),
        ('sachet', 'Sachet(s)'),
        ('patch', 'Patch(s)'),
        ('injection', 'Injection(s)'),
    ], string='Unité')

    # Fréquence
    frequency = fields.Selection([
        ('once', 'Une fois'),
        ('bid', '2 fois/jour'),
        ('tid', '3 fois/jour'),
        ('qid', '4 fois/jour'),
        ('qhs', 'Au coucher'),
        ('prn', 'Si besoin'),
        ('weekly', 'Hebdomadaire'),
    ], string='Fréquence')
    frequency_custom = fields.Char(string='Fréquence personnalisée')

    # Durée
    duration = fields.Integer(string='Durée')
    duration_unit = fields.Selection([
        ('day', 'Jour(s)'),
        ('week', 'Semaine(s)'),
        ('month', 'Mois'),
    ], string='Unité durée', default='day')

    # Instructions
    route = fields.Selection([
        ('oral', 'Voie orale'),
        ('sublingual', 'Sublingual'),
        ('topical', 'Application locale'),
        ('inhalation', 'Inhalation'),
        ('injection_im', 'Injection IM'),
        ('injection_iv', 'Injection IV'),
        ('injection_sc', 'Injection SC'),
        ('rectal', 'Voie rectale'),
        ('ophthalmic', 'Ophtalmique'),
        ('auricular', 'Auriculaire'),
    ], string='Voie d\'administration', default='oral')

    instructions = fields.Text(string='Instructions spécifiques')
    take_with_food = fields.Boolean(string='À prendre avec de la nourriture')

    # Substitution
    allow_generic = fields.Boolean(string='Substitution générique autorisée', default=True)


class HealthcareMedication(models.Model):
    _name = 'healthcare.medication'
    _description = 'Médicament'

    name = fields.Char(string='Nom commercial', required=True)
    generic_name = fields.Char(string='DCI (nom générique)')
    code_cip = fields.Char(string='Code CIP')

    # Forme
    form = fields.Selection([
        ('tablet', 'Comprimé'),
        ('capsule', 'Gélule'),
        ('syrup', 'Sirop'),
        ('injection', 'Injectable'),
        ('cream', 'Crème'),
        ('ointment', 'Pommade'),
        ('drops', 'Gouttes'),
        ('spray', 'Spray'),
        ('patch', 'Patch'),
        ('suppository', 'Suppositoire'),
    ], string='Forme galénique')

    strength = fields.Char(string='Dosage')  # Ex: "500mg", "10mg/ml"

    # Classification
    therapeutic_class = fields.Char(string='Classe thérapeutique')
    atc_code = fields.Char(string='Code ATC')

    # Informations
    manufacturer = fields.Char(string='Fabricant')
    requires_prescription = fields.Boolean(string='Sur ordonnance', default=True)

    # Contre-indications et interactions
    contraindication_ids = fields.Many2many('healthcare.contraindication', string='Contre-indications')
    interaction_ids = fields.Many2many('healthcare.medication', 'medication_interaction_rel',
                                        'medication_id', 'interacting_medication_id',
                                        string='Interactions médicamenteuses')

    active = fields.Boolean(default=True)
```

### 3. Laboratoire et Examens

```python
class HealthcareLabOrder(models.Model):
    _name = 'healthcare.lab.order'
    _description = 'Demande d\'examen de laboratoire'
    _inherit = ['mail.thread']
    _order = 'date desc'

    name = fields.Char(string='Référence', required=True, copy=False,
                       default=lambda self: self.env['ir.sequence'].next_by_code('healthcare.lab.order'))

    patient_id = fields.Many2one('healthcare.patient', string='Patient', required=True)
    practitioner_id = fields.Many2one('healthcare.practitioner', string='Prescripteur', required=True)
    consultation_id = fields.Many2one('healthcare.consultation', string='Consultation')

    date = fields.Datetime(string='Date de prescription', default=fields.Datetime.now)
    priority = fields.Selection([
        ('routine', 'Routine'),
        ('urgent', 'Urgent'),
        ('stat', 'STAT (immédiat)'),
    ], string='Priorité', default='routine')

    # Tests demandés
    test_ids = fields.Many2many('healthcare.lab.test', string='Examens demandés')

    # Échantillon
    sample_collection_date = fields.Datetime(string='Date de prélèvement')
    sample_type = fields.Selection([
        ('blood', 'Sang'),
        ('urine', 'Urine'),
        ('stool', 'Selles'),
        ('swab', 'Prélèvement'),
        ('tissue', 'Tissu'),
        ('other', 'Autre'),
    ], string='Type d\'échantillon')

    # Résultats
    result_ids = fields.One2many('healthcare.lab.result', 'order_id', string='Résultats')
    results_date = fields.Datetime(string='Date des résultats')
    results_comment = fields.Text(string='Commentaire du biologiste')

    # État
    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('ordered', 'Prescrit'),
        ('collected', 'Échantillon prélevé'),
        ('in_progress', 'En cours d\'analyse'),
        ('completed', 'Terminé'),
        ('cancelled', 'Annulé'),
    ], string='État', default='draft', tracking=True)

    # Document résultats
    results_document = fields.Binary(string='Document résultats')

    # Notes cliniques
    clinical_notes = fields.Text(string='Notes cliniques')
    fasting_required = fields.Boolean(string='À jeun requis')


class HealthcareLabTest(models.Model):
    _name = 'healthcare.lab.test'
    _description = 'Type d\'examen de laboratoire'

    name = fields.Char(string='Nom', required=True)
    code = fields.Char(string='Code')
    category = fields.Selection([
        ('hematology', 'Hématologie'),
        ('biochemistry', 'Biochimie'),
        ('microbiology', 'Microbiologie'),
        ('immunology', 'Immunologie'),
        ('endocrinology', 'Endocrinologie'),
        ('coagulation', 'Coagulation'),
        ('urinalysis', 'Analyse d\'urine'),
        ('other', 'Autre'),
    ], string='Catégorie')

    sample_type = fields.Selection([
        ('blood', 'Sang'),
        ('serum', 'Sérum'),
        ('plasma', 'Plasma'),
        ('urine', 'Urine'),
        ('other', 'Autre'),
    ], string='Type d\'échantillon')

    # Valeurs de référence
    reference_min = fields.Float(string='Valeur min')
    reference_max = fields.Float(string='Valeur max')
    unit = fields.Char(string='Unité')

    # Préparation
    fasting_required = fields.Boolean(string='À jeun')
    preparation_instructions = fields.Text(string='Instructions de préparation')

    # Délai
    turnaround_time = fields.Integer(string='Délai de rendu (heures)')

    active = fields.Boolean(default=True)


class HealthcareLabResult(models.Model):
    _name = 'healthcare.lab.result'
    _description = 'Résultat d\'examen'

    order_id = fields.Many2one('healthcare.lab.order', string='Demande', required=True, ondelete='cascade')
    test_id = fields.Many2one('healthcare.lab.test', string='Examen', required=True)

    # Résultat
    value = fields.Float(string='Valeur')
    value_text = fields.Char(string='Valeur (texte)')  # Pour résultats non numériques
    unit = fields.Char(related='test_id.unit')

    # Interprétation
    reference_range = fields.Char(string='Valeurs de référence',
                                   compute='_compute_reference_range')
    interpretation = fields.Selection([
        ('normal', 'Normal'),
        ('low', 'Bas'),
        ('high', 'Élevé'),
        ('critical_low', 'Critique bas'),
        ('critical_high', 'Critique élevé'),
        ('abnormal', 'Anormal'),
    ], string='Interprétation', compute='_compute_interpretation', store=True)

    comment = fields.Text(string='Commentaire')

    @api.depends('test_id')
    def _compute_reference_range(self):
        for result in self:
            if result.test_id.reference_min and result.test_id.reference_max:
                result.reference_range = f"{result.test_id.reference_min} - {result.test_id.reference_max} {result.unit or ''}"
            else:
                result.reference_range = ''

    @api.depends('value', 'test_id.reference_min', 'test_id.reference_max')
    def _compute_interpretation(self):
        for result in self:
            if result.value and result.test_id.reference_min and result.test_id.reference_max:
                if result.value < result.test_id.reference_min * 0.5:
                    result.interpretation = 'critical_low'
                elif result.value < result.test_id.reference_min:
                    result.interpretation = 'low'
                elif result.value > result.test_id.reference_max * 1.5:
                    result.interpretation = 'critical_high'
                elif result.value > result.test_id.reference_max:
                    result.interpretation = 'high'
                else:
                    result.interpretation = 'normal'
            else:
                result.interpretation = False
```

### 4. Centres de Bien-être et Fitness

```python
class WellnessMember(models.Model):
    _name = 'wellness.member'
    _description = 'Membre centre de bien-être'
    _inherits = {'res.partner': 'partner_id'}
    _inherit = ['mail.thread']

    partner_id = fields.Many2one('res.partner', string='Contact', required=True, ondelete='cascade')

    member_number = fields.Char(string='Numéro de membre', copy=False,
                                default=lambda self: self.env['ir.sequence'].next_by_code('wellness.member'))

    # Abonnement
    subscription_id = fields.Many2one('wellness.subscription', string='Abonnement actif')
    subscription_start = fields.Date(related='subscription_id.start_date')
    subscription_end = fields.Date(related='subscription_id.end_date')

    # Informations santé
    birthdate = fields.Date(string='Date de naissance')
    medical_conditions = fields.Text(string='Conditions médicales')
    emergency_contact = fields.Char(string='Contact d\'urgence')
    emergency_phone = fields.Char(string='Téléphone urgence')

    # Objectifs
    fitness_goal = fields.Selection([
        ('weight_loss', 'Perte de poids'),
        ('muscle_gain', 'Prise de masse'),
        ('endurance', 'Endurance'),
        ('flexibility', 'Souplesse'),
        ('general', 'Forme générale'),
        ('rehabilitation', 'Rééducation'),
    ], string='Objectif')

    # Mesures
    measurement_ids = fields.One2many('wellness.member.measurement', 'member_id', string='Mesures')
    current_weight = fields.Float(compute='_compute_current_measurements')
    current_bmi = fields.Float(compute='_compute_current_measurements')

    # Accès
    access_card_number = fields.Char(string='Numéro de carte')
    access_code = fields.Char(string='Code d\'accès')

    # Historique
    checkin_ids = fields.One2many('wellness.checkin', 'member_id', string='Check-ins')
    booking_ids = fields.One2many('wellness.booking', 'member_id', string='Réservations')

    # Photo
    image = fields.Image(string='Photo', max_width=256, max_height=256)

    state = fields.Selection([
        ('active', 'Actif'),
        ('expired', 'Expiré'),
        ('suspended', 'Suspendu'),
    ], string='État', compute='_compute_state', store=True)


class WellnessSubscription(models.Model):
    _name = 'wellness.subscription'
    _description = 'Abonnement'
    _order = 'start_date desc'

    name = fields.Char(string='Référence', required=True, copy=False,
                       default=lambda self: self.env['ir.sequence'].next_by_code('wellness.subscription'))

    member_id = fields.Many2one('wellness.member', string='Membre', required=True)
    plan_id = fields.Many2one('wellness.subscription.plan', string='Formule', required=True)

    start_date = fields.Date(string='Date de début', required=True)
    end_date = fields.Date(string='Date de fin', compute='_compute_end_date', store=True)

    # Paiement
    amount = fields.Monetary(related='plan_id.price')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)
    payment_method = fields.Selection([
        ('cash', 'Espèces'),
        ('card', 'Carte'),
        ('transfer', 'Virement'),
        ('direct_debit', 'Prélèvement'),
    ], string='Mode de paiement')

    # Renouvellement
    auto_renew = fields.Boolean(string='Renouvellement automatique')

    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('active', 'Actif'),
        ('expired', 'Expiré'),
        ('cancelled', 'Annulé'),
    ], string='État', default='draft')

    @api.depends('start_date', 'plan_id.duration_months')
    def _compute_end_date(self):
        for sub in self:
            if sub.start_date and sub.plan_id:
                sub.end_date = sub.start_date + timedelta(days=sub.plan_id.duration_months * 30)
            else:
                sub.end_date = False


class WellnessClass(models.Model):
    _name = 'wellness.class'
    _description = 'Cours collectif'
    _order = 'datetime_start'

    name = fields.Char(string='Nom', required=True)
    class_type_id = fields.Many2one('wellness.class.type', string='Type de cours', required=True)

    # Planning
    datetime_start = fields.Datetime(string='Date et heure', required=True)
    duration = fields.Integer(string='Durée (min)', default=60)
    datetime_end = fields.Datetime(compute='_compute_end')

    # Lieu
    room_id = fields.Many2one('wellness.room', string='Salle')

    # Instructeur
    instructor_id = fields.Many2one('wellness.instructor', string='Instructeur', required=True)

    # Participants
    max_participants = fields.Integer(string='Places max', default=20)
    booking_ids = fields.One2many('wellness.booking', 'class_id', string='Réservations')
    participant_count = fields.Integer(compute='_compute_participants')
    available_spots = fields.Integer(compute='_compute_participants')

    # Niveau
    level = fields.Selection([
        ('all', 'Tous niveaux'),
        ('beginner', 'Débutant'),
        ('intermediate', 'Intermédiaire'),
        ('advanced', 'Avancé'),
    ], string='Niveau', default='all')

    # État
    state = fields.Selection([
        ('scheduled', 'Programmé'),
        ('ongoing', 'En cours'),
        ('done', 'Terminé'),
        ('cancelled', 'Annulé'),
    ], string='État', default='scheduled')

    @api.depends('datetime_start', 'duration')
    def _compute_end(self):
        for cls in self:
            if cls.datetime_start:
                cls.datetime_end = cls.datetime_start + timedelta(minutes=cls.duration)
            else:
                cls.datetime_end = False

    @api.depends('booking_ids', 'max_participants')
    def _compute_participants(self):
        for cls in self:
            confirmed = cls.booking_ids.filtered(lambda b: b.state == 'confirmed')
            cls.participant_count = len(confirmed)
            cls.available_spots = cls.max_participants - cls.participant_count


class WellnessBooking(models.Model):
    _name = 'wellness.booking'
    _description = 'Réservation de cours'

    member_id = fields.Many2one('wellness.member', string='Membre', required=True)
    class_id = fields.Many2one('wellness.class', string='Cours', required=True)

    booking_date = fields.Datetime(string='Date de réservation', default=fields.Datetime.now)
    attended = fields.Boolean(string='Présent')

    state = fields.Selection([
        ('pending', 'En attente'),
        ('confirmed', 'Confirmée'),
        ('cancelled', 'Annulée'),
        ('no_show', 'Absent'),
    ], string='État', default='pending')

    @api.constrains('class_id', 'member_id')
    def _check_duplicate_booking(self):
        for booking in self:
            existing = self.search([
                ('id', '!=', booking.id),
                ('class_id', '=', booking.class_id.id),
                ('member_id', '=', booking.member_id.id),
                ('state', '!=', 'cancelled'),
            ])
            if existing:
                raise ValidationError("Ce membre est déjà inscrit à ce cours.")

    @api.constrains('class_id')
    def _check_availability(self):
        for booking in self:
            if booking.class_id.available_spots <= 0:
                raise ValidationError("Ce cours est complet.")
```

### 5. Pharmacie

```python
class PharmacyDispensing(models.Model):
    _name = 'pharmacy.dispensing'
    _description = 'Dispensation médicaments'
    _order = 'date desc'

    name = fields.Char(string='Référence', required=True, copy=False,
                       default=lambda self: self.env['ir.sequence'].next_by_code('pharmacy.dispensing'))

    # Patient et ordonnance
    patient_id = fields.Many2one('healthcare.patient', string='Patient')
    prescription_id = fields.Many2one('healthcare.prescription', string='Ordonnance')

    date = fields.Datetime(string='Date', default=fields.Datetime.now, required=True)

    # Lignes de dispensation
    line_ids = fields.One2many('pharmacy.dispensing.line', 'dispensing_id', string='Médicaments')

    # Pharmacien
    pharmacist_id = fields.Many2one('res.users', string='Pharmacien', default=lambda self: self.env.user)

    # Conseils
    advice = fields.Text(string='Conseils pharmaceutiques')

    # Facturation
    total_amount = fields.Monetary(compute='_compute_total', string='Total', currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)
    insurance_coverage = fields.Monetary(string='Prise en charge')
    patient_amount = fields.Monetary(compute='_compute_total', string='Reste à charge')

    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('dispensed', 'Dispensé'),
        ('cancelled', 'Annulé'),
    ], string='État', default='draft')

    @api.depends('line_ids.subtotal', 'insurance_coverage')
    def _compute_total(self):
        for dispensing in self:
            dispensing.total_amount = sum(dispensing.line_ids.mapped('subtotal'))
            dispensing.patient_amount = dispensing.total_amount - (dispensing.insurance_coverage or 0)


class PharmacyDispenseLine(models.Model):
    _name = 'pharmacy.dispensing.line'
    _description = 'Ligne de dispensation'

    dispensing_id = fields.Many2one('pharmacy.dispensing', required=True, ondelete='cascade')

    medication_id = fields.Many2one('healthcare.medication', string='Médicament', required=True)
    product_id = fields.Many2one('product.product', string='Produit')

    quantity = fields.Float(string='Quantité', default=1)
    unit_price = fields.Monetary(string='Prix unitaire', currency_field='currency_id')
    subtotal = fields.Monetary(compute='_compute_subtotal', string='Sous-total', currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)

    # Lot et traçabilité
    lot_id = fields.Many2one('stock.lot', string='Lot')
    expiry_date = fields.Date(related='lot_id.expiration_date', string='Date de péremption')

    # Substitution
    is_substitution = fields.Boolean(string='Substitution générique')
    original_medication_id = fields.Many2one('healthcare.medication', string='Médicament prescrit')

    @api.depends('quantity', 'unit_price')
    def _compute_subtotal(self):
        for line in self:
            line.subtotal = line.quantity * line.unit_price
```

## Conformité RGPD et Sécurité

```python
class HealthcareDataProtection(models.AbstractModel):
    _name = 'healthcare.data.protection'
    _description = 'Mixin protection des données'

    def _anonymize_patient_data(self, patient_ids):
        """Anonymiser les données patient (droit à l'oubli)"""
        patients = self.env['healthcare.patient'].browse(patient_ids)
        for patient in patients:
            # Hash des identifiants
            hashed_id = hashlib.sha256(patient.patient_id.encode()).hexdigest()[:12]

            patient.partner_id.write({
                'name': f'Patient anonymisé {hashed_id}',
                'email': False,
                'phone': False,
                'mobile': False,
                'street': False,
                'city': False,
            })

            patient.write({
                'social_security_number': False,
                'national_id': False,
                'emergency_contact_name': False,
                'emergency_contact_phone': False,
            })

    def _log_data_access(self, record, action):
        """Logger les accès aux données sensibles"""
        self.env['healthcare.audit.log'].create({
            'model': record._name,
            'res_id': record.id,
            'action': action,
            'user_id': self.env.user.id,
            'timestamp': fields.Datetime.now(),
            'ip_address': self._get_client_ip(),
        })


class HealthcareAuditLog(models.Model):
    _name = 'healthcare.audit.log'
    _description = 'Journal d\'audit santé'
    _order = 'timestamp desc'

    model = fields.Char(string='Modèle', required=True)
    res_id = fields.Integer(string='ID Enregistrement')
    action = fields.Selection([
        ('read', 'Consultation'),
        ('write', 'Modification'),
        ('export', 'Export'),
        ('print', 'Impression'),
    ], string='Action', required=True)
    user_id = fields.Many2one('res.users', string='Utilisateur', required=True)
    timestamp = fields.Datetime(string='Date/Heure', required=True)
    ip_address = fields.Char(string='Adresse IP')
    details = fields.Text(string='Détails')
```

## Best Practices

### Calendrier des disponibilités
```python
def get_available_slots(self, practitioner_id, date, duration=30):
    """Obtenir les créneaux disponibles"""
    practitioner = self.env['healthcare.practitioner'].browse(practitioner_id)

    # Récupérer le planning du praticien pour ce jour
    day_of_week = date.weekday()
    schedule = practitioner.schedule_ids.filtered(
        lambda s: s.day_of_week == str(day_of_week)
    )

    if not schedule:
        return []

    # Générer tous les créneaux possibles
    slots = []
    current_time = datetime.combine(date, datetime.min.time().replace(
        hour=int(schedule.start_time),
        minute=int((schedule.start_time % 1) * 60)
    ))
    end_time = datetime.combine(date, datetime.min.time().replace(
        hour=int(schedule.end_time),
        minute=int((schedule.end_time % 1) * 60)
    ))

    while current_time + timedelta(minutes=duration) <= end_time:
        # Vérifier si le créneau est libre
        existing = self.env['healthcare.appointment'].search([
            ('practitioner_id', '=', practitioner_id),
            ('datetime_start', '=', current_time),
            ('state', 'not in', ['cancelled', 'no_show']),
        ])
        if not existing:
            slots.append(current_time)
        current_time += timedelta(minutes=duration)

    return slots
```
