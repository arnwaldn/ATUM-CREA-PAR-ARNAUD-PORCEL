# Odoo Education & Training Expert

## Role Definition
Expert en développement de modules Odoo pour le secteur de l'éducation et de la formation. Spécialisé dans les systèmes de gestion d'apprentissage (LMS), centres de formation, auto-écoles, universités et organismes de certification.

## Core Competencies

### 1. Modèles Métier Éducation

#### Course (Cours/Formation)
```python
from odoo import models, fields, api
from odoo.exceptions import ValidationError
from datetime import timedelta

class EducationCourse(models.Model):
    _name = 'education.course'
    _description = 'Formation'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'sequence, name'

    name = fields.Char(string='Nom de la formation', required=True, tracking=True)
    code = fields.Char(string='Code', required=True, copy=False)
    sequence = fields.Integer(default=10)
    active = fields.Boolean(default=True)

    # Classification
    category_id = fields.Many2one('education.course.category', string='Catégorie')
    tag_ids = fields.Many2many('education.course.tag', string='Tags')
    level = fields.Selection([
        ('beginner', 'Débutant'),
        ('intermediate', 'Intermédiaire'),
        ('advanced', 'Avancé'),
        ('expert', 'Expert'),
    ], string='Niveau', default='beginner')

    # Contenu
    description = fields.Html(string='Description')
    objectives = fields.Html(string='Objectifs pédagogiques')
    prerequisites = fields.Html(string='Prérequis')
    target_audience = fields.Text(string='Public cible')

    # Durée et format
    duration_hours = fields.Float(string='Durée (heures)', required=True)
    duration_days = fields.Float(string='Durée (jours)', compute='_compute_duration_days', store=True)
    format = fields.Selection([
        ('presential', 'Présentiel'),
        ('online', 'En ligne'),
        ('hybrid', 'Hybride'),
        ('elearning', 'E-learning asynchrone'),
    ], string='Format', default='presential')
    max_participants = fields.Integer(string='Participants max', default=12)
    min_participants = fields.Integer(string='Participants min', default=1)

    # Certification
    certification_id = fields.Many2one('education.certification', string='Certification délivrée')
    cpf_eligible = fields.Boolean(string='Éligible CPF')
    cpf_code = fields.Char(string='Code CPF')
    qualiopi_eligible = fields.Boolean(string='Éligible Qualiopi')

    # Tarification
    price = fields.Monetary(string='Prix', currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)
    price_unit = fields.Selection([
        ('per_person', 'Par personne'),
        ('per_group', 'Par groupe'),
        ('per_hour', 'Par heure'),
    ], string='Unité de prix', default='per_person')

    # Relations
    module_ids = fields.One2many('education.course.module', 'course_id', string='Modules')
    session_ids = fields.One2many('education.session', 'course_id', string='Sessions')
    instructor_ids = fields.Many2many('education.instructor', string='Formateurs habilités')
    material_ids = fields.One2many('education.material', 'course_id', string='Supports pédagogiques')

    # Statistiques
    session_count = fields.Integer(compute='_compute_statistics')
    enrollment_count = fields.Integer(compute='_compute_statistics')
    completion_rate = fields.Float(compute='_compute_statistics', string='Taux de complétion (%)')
    average_rating = fields.Float(compute='_compute_statistics', string='Note moyenne')

    # Slides (eLearning natif Odoo)
    slide_channel_id = fields.Many2one('slide.channel', string='Cours eLearning')

    _sql_constraints = [
        ('code_unique', 'UNIQUE(code)', 'Le code de formation doit être unique.'),
    ]

    @api.depends('duration_hours')
    def _compute_duration_days(self):
        for record in self:
            record.duration_days = record.duration_hours / 7.0  # 7h/jour standard

    @api.depends('session_ids', 'session_ids.enrollment_ids')
    def _compute_statistics(self):
        for record in self:
            sessions = record.session_ids
            record.session_count = len(sessions)
            enrollments = sessions.mapped('enrollment_ids')
            record.enrollment_count = len(enrollments)
            completed = enrollments.filtered(lambda e: e.state == 'completed')
            record.completion_rate = (len(completed) / len(enrollments) * 100) if enrollments else 0
            ratings = enrollments.filtered(lambda e: e.rating).mapped('rating')
            record.average_rating = sum(ratings) / len(ratings) if ratings else 0


class EducationCourseModule(models.Model):
    _name = 'education.course.module'
    _description = 'Module de formation'
    _order = 'sequence'

    name = fields.Char(string='Nom du module', required=True)
    sequence = fields.Integer(default=10)
    course_id = fields.Many2one('education.course', string='Formation', required=True, ondelete='cascade')
    duration_hours = fields.Float(string='Durée (heures)')
    description = fields.Html(string='Contenu')
    objectives = fields.Text(string='Objectifs')

    # Évaluation
    has_evaluation = fields.Boolean(string='Avec évaluation')
    evaluation_type = fields.Selection([
        ('quiz', 'Quiz'),
        ('practical', 'Exercice pratique'),
        ('exam', 'Examen'),
        ('project', 'Projet'),
    ], string='Type d\'évaluation')
    passing_score = fields.Float(string='Score de réussite (%)', default=70)
```

#### Session (Session de formation)
```python
class EducationSession(models.Model):
    _name = 'education.session'
    _description = 'Session de formation'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'date_start desc'

    name = fields.Char(string='Référence', required=True, copy=False,
                       default=lambda self: self.env['ir.sequence'].next_by_code('education.session'))

    course_id = fields.Many2one('education.course', string='Formation', required=True, tracking=True)

    # Planning
    date_start = fields.Datetime(string='Date de début', required=True, tracking=True)
    date_end = fields.Datetime(string='Date de fin', required=True, tracking=True)
    duration_hours = fields.Float(related='course_id.duration_hours', store=True)

    # Lieu
    location_type = fields.Selection([
        ('onsite', 'Sur site'),
        ('client', 'Chez le client'),
        ('online', 'En ligne'),
    ], string='Type de lieu', default='onsite')
    location_id = fields.Many2one('education.location', string='Lieu')
    room_id = fields.Many2one('education.room', string='Salle')
    online_url = fields.Char(string='Lien visio')
    online_platform = fields.Selection([
        ('zoom', 'Zoom'),
        ('teams', 'Microsoft Teams'),
        ('meet', 'Google Meet'),
        ('webex', 'Webex'),
        ('other', 'Autre'),
    ], string='Plateforme')

    # Formateur
    instructor_id = fields.Many2one('education.instructor', string='Formateur', required=True, tracking=True)
    co_instructor_ids = fields.Many2many('education.instructor', 'session_co_instructor_rel',
                                          string='Co-formateurs')

    # Participants
    enrollment_ids = fields.One2many('education.enrollment', 'session_id', string='Inscriptions')
    participant_count = fields.Integer(compute='_compute_participant_count', store=True)
    available_seats = fields.Integer(compute='_compute_participant_count', store=True)
    max_participants = fields.Integer(related='course_id.max_participants')
    min_participants = fields.Integer(related='course_id.min_participants')

    # État
    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('confirmed', 'Confirmée'),
        ('in_progress', 'En cours'),
        ('done', 'Terminée'),
        ('cancelled', 'Annulée'),
    ], string='État', default='draft', tracking=True)

    # Calendrier
    calendar_event_id = fields.Many2one('calendar.event', string='Événement calendrier')

    # Documents
    attendance_sheet = fields.Binary(string='Feuille d\'émargement')
    attendance_filename = fields.Char()

    # Facturation
    is_invoiced = fields.Boolean(string='Facturée', compute='_compute_invoiced')
    invoice_ids = fields.Many2many('account.move', string='Factures', compute='_compute_invoiced')

    @api.depends('enrollment_ids', 'enrollment_ids.state')
    def _compute_participant_count(self):
        for record in self:
            confirmed = record.enrollment_ids.filtered(lambda e: e.state in ['confirmed', 'attended', 'completed'])
            record.participant_count = len(confirmed)
            record.available_seats = record.max_participants - record.participant_count

    @api.constrains('date_start', 'date_end')
    def _check_dates(self):
        for record in self:
            if record.date_end < record.date_start:
                raise ValidationError("La date de fin doit être après la date de début.")

    @api.constrains('participant_count', 'max_participants')
    def _check_capacity(self):
        for record in self:
            if record.participant_count > record.max_participants:
                raise ValidationError(f"Capacité maximale dépassée ({record.max_participants} places).")

    def action_confirm(self):
        self.ensure_one()
        if self.participant_count < self.min_participants:
            raise ValidationError(f"Minimum {self.min_participants} participants requis.")
        self._create_calendar_event()
        self.state = 'confirmed'

    def action_start(self):
        self.state = 'in_progress'

    def action_done(self):
        self.state = 'done'
        self._generate_certificates()

    def action_cancel(self):
        self.state = 'cancelled'
        self._notify_cancellation()

    def _create_calendar_event(self):
        """Créer l'événement calendrier"""
        self.ensure_one()
        if not self.calendar_event_id:
            event = self.env['calendar.event'].create({
                'name': f"{self.course_id.name} - {self.name}",
                'start': self.date_start,
                'stop': self.date_end,
                'location': self.location_id.name if self.location_id else self.online_url,
                'partner_ids': [(6, 0, self.enrollment_ids.mapped('student_id.partner_id').ids)],
            })
            self.calendar_event_id = event

    def _generate_certificates(self):
        """Générer les attestations pour les participants ayant réussi"""
        for enrollment in self.enrollment_ids.filtered(lambda e: e.state == 'attended' and e.passed):
            enrollment._generate_certificate()

    def _notify_cancellation(self):
        """Notifier les participants de l'annulation"""
        template = self.env.ref('education.email_template_session_cancelled', raise_if_not_found=False)
        if template:
            for enrollment in self.enrollment_ids:
                template.send_mail(enrollment.id)
```

#### Student (Apprenant)
```python
class EducationStudent(models.Model):
    _name = 'education.student'
    _description = 'Apprenant'
    _inherits = {'res.partner': 'partner_id'}
    _inherit = ['mail.thread', 'mail.activity.mixin']

    partner_id = fields.Many2one('res.partner', string='Contact', required=True, ondelete='cascade')

    # Identité étudiante
    student_code = fields.Char(string='Matricule', copy=False,
                               default=lambda self: self.env['ir.sequence'].next_by_code('education.student'))

    # Informations personnelles
    birthdate = fields.Date(string='Date de naissance')
    gender = fields.Selection([
        ('male', 'Homme'),
        ('female', 'Femme'),
        ('other', 'Autre'),
    ], string='Genre')
    nationality_id = fields.Many2one('res.country', string='Nationalité')

    # Contact professionnel
    employer_id = fields.Many2one('res.partner', string='Employeur', domain=[('is_company', '=', True)])
    job_title = fields.Char(string='Fonction')

    # Niveau et parcours
    education_level = fields.Selection([
        ('bac', 'Baccalauréat'),
        ('bac2', 'Bac +2'),
        ('bac3', 'Bac +3 (Licence)'),
        ('bac5', 'Bac +5 (Master)'),
        ('bac8', 'Bac +8 (Doctorat)'),
        ('other', 'Autre'),
    ], string='Niveau d\'études')

    # Financement
    funding_type = fields.Selection([
        ('self', 'Autofinancement'),
        ('employer', 'Employeur'),
        ('cpf', 'CPF'),
        ('opco', 'OPCO'),
        ('pole_emploi', 'Pôle Emploi'),
        ('region', 'Région'),
        ('other', 'Autre'),
    ], string='Type de financement')
    cpf_account = fields.Char(string='Compte CPF')

    # Inscriptions et historique
    enrollment_ids = fields.One2many('education.enrollment', 'student_id', string='Inscriptions')
    certification_ids = fields.One2many('education.student.certification', 'student_id', string='Certifications')

    # Statistiques
    total_hours = fields.Float(compute='_compute_statistics', string='Heures de formation')
    certification_count = fields.Integer(compute='_compute_statistics')
    completion_rate = fields.Float(compute='_compute_statistics', string='Taux de réussite (%)')

    # eLearning
    slide_partner_id = fields.Many2one('slide.channel.partner', string='Profil eLearning')

    @api.depends('enrollment_ids', 'certification_ids')
    def _compute_statistics(self):
        for record in self:
            completed = record.enrollment_ids.filtered(lambda e: e.state == 'completed')
            record.total_hours = sum(completed.mapped('session_id.duration_hours'))
            record.certification_count = len(record.certification_ids)
            total = len(record.enrollment_ids.filtered(lambda e: e.state in ['completed', 'failed']))
            passed = len(record.enrollment_ids.filtered(lambda e: e.state == 'completed' and e.passed))
            record.completion_rate = (passed / total * 100) if total else 0
```

#### Enrollment (Inscription)
```python
class EducationEnrollment(models.Model):
    _name = 'education.enrollment'
    _description = 'Inscription à une formation'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'create_date desc'

    name = fields.Char(string='Référence', required=True, copy=False,
                       default=lambda self: self.env['ir.sequence'].next_by_code('education.enrollment'))

    student_id = fields.Many2one('education.student', string='Apprenant', required=True, tracking=True)
    session_id = fields.Many2one('education.session', string='Session', required=True, tracking=True)
    course_id = fields.Many2one(related='session_id.course_id', store=True)

    # Dates
    enrollment_date = fields.Date(string='Date d\'inscription', default=fields.Date.today)

    # État
    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('pending', 'En attente'),
        ('confirmed', 'Confirmée'),
        ('attended', 'Présent'),
        ('completed', 'Terminée'),
        ('failed', 'Échouée'),
        ('cancelled', 'Annulée'),
    ], string='État', default='draft', tracking=True)

    # Présence
    attendance_ids = fields.One2many('education.attendance', 'enrollment_id', string='Présences')
    attendance_rate = fields.Float(compute='_compute_attendance', string='Taux de présence (%)')

    # Évaluation
    evaluation_ids = fields.One2many('education.evaluation', 'enrollment_id', string='Évaluations')
    final_score = fields.Float(compute='_compute_final_score', store=True, string='Note finale')
    passed = fields.Boolean(compute='_compute_final_score', store=True, string='Réussi')

    # Satisfaction
    rating = fields.Selection([
        ('1', '1 - Très insatisfait'),
        ('2', '2 - Insatisfait'),
        ('3', '3 - Neutre'),
        ('4', '4 - Satisfait'),
        ('5', '5 - Très satisfait'),
    ], string='Note de satisfaction')
    feedback = fields.Text(string='Commentaire')

    # Financement
    funding_type = fields.Selection(related='student_id.funding_type')
    funding_amount = fields.Monetary(string='Montant pris en charge', currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)

    # Documents
    convention_signed = fields.Boolean(string='Convention signée')
    convention_file = fields.Binary(string='Convention')
    certificate_id = fields.Many2one('education.certificate', string='Attestation')

    # Facturation
    sale_order_id = fields.Many2one('sale.order', string='Bon de commande')
    invoice_id = fields.Many2one('account.move', string='Facture')

    @api.depends('attendance_ids')
    def _compute_attendance(self):
        for record in self:
            total = len(record.attendance_ids)
            present = len(record.attendance_ids.filtered(lambda a: a.status == 'present'))
            record.attendance_rate = (present / total * 100) if total else 0

    @api.depends('evaluation_ids', 'evaluation_ids.score')
    def _compute_final_score(self):
        for record in self:
            evaluations = record.evaluation_ids.filtered(lambda e: e.score is not None)
            if evaluations:
                weighted_sum = sum(e.score * e.weight for e in evaluations)
                total_weight = sum(e.weight for e in evaluations)
                record.final_score = weighted_sum / total_weight if total_weight else 0
                record.passed = record.final_score >= record.course_id.certification_id.passing_score if record.course_id.certification_id else record.final_score >= 70
            else:
                record.final_score = 0
                record.passed = False

    def action_confirm(self):
        self.state = 'confirmed'
        self._send_confirmation_email()

    def action_mark_attended(self):
        self.state = 'attended'

    def action_complete(self):
        if self.passed:
            self.state = 'completed'
            self._generate_certificate()
        else:
            self.state = 'failed'

    def _generate_certificate(self):
        """Générer l'attestation de formation"""
        certificate = self.env['education.certificate'].create({
            'enrollment_id': self.id,
            'student_id': self.student_id.id,
            'course_id': self.course_id.id,
            'issue_date': fields.Date.today(),
            'final_score': self.final_score,
        })
        self.certificate_id = certificate
        return certificate
```

### 2. Modèles Spécialisés Auto-École

```python
class DrivingSchoolCategory(models.Model):
    _name = 'driving.license.category'
    _description = 'Catégorie de permis'

    name = fields.Char(string='Catégorie', required=True)  # A, A1, A2, B, C, D, etc.
    code = fields.Char(string='Code')
    description = fields.Text(string='Description')
    min_age = fields.Integer(string='Âge minimum')
    theory_hours = fields.Float(string='Heures de code')
    practice_hours = fields.Float(string='Heures de conduite minimum')

    course_ids = fields.One2many('education.course', 'license_category_id', string='Formations')


class DrivingLesson(models.Model):
    _name = 'driving.lesson'
    _description = 'Leçon de conduite'
    _order = 'date_start'

    student_id = fields.Many2one('education.student', string='Élève', required=True)
    instructor_id = fields.Many2one('education.instructor', string='Moniteur', required=True)
    vehicle_id = fields.Many2one('fleet.vehicle', string='Véhicule', required=True)

    date_start = fields.Datetime(string='Début', required=True)
    date_end = fields.Datetime(string='Fin', required=True)
    duration = fields.Float(compute='_compute_duration', store=True)

    # Type de leçon
    lesson_type = fields.Selection([
        ('theory', 'Code'),
        ('practice', 'Conduite'),
        ('simulator', 'Simulateur'),
        ('exam_theory', 'Examen code'),
        ('exam_practice', 'Examen conduite'),
    ], string='Type', default='practice')

    # Évaluation
    skills_evaluated = fields.Many2many('driving.skill', string='Compétences évaluées')
    notes = fields.Text(string='Notes du moniteur')
    progress_level = fields.Selection([
        ('1', 'Non acquis'),
        ('2', 'En cours d\'acquisition'),
        ('3', 'À consolider'),
        ('4', 'Acquis'),
    ], string='Niveau global')

    state = fields.Selection([
        ('scheduled', 'Planifiée'),
        ('done', 'Effectuée'),
        ('cancelled', 'Annulée'),
        ('no_show', 'Absence'),
    ], string='État', default='scheduled')

    @api.depends('date_start', 'date_end')
    def _compute_duration(self):
        for record in self:
            if record.date_start and record.date_end:
                delta = record.date_end - record.date_start
                record.duration = delta.total_seconds() / 3600
            else:
                record.duration = 0


class DrivingExam(models.Model):
    _name = 'driving.exam'
    _description = 'Examen de permis'

    student_id = fields.Many2one('education.student', string='Candidat', required=True)
    license_category_id = fields.Many2one('driving.license.category', string='Catégorie', required=True)
    exam_type = fields.Selection([
        ('theory', 'Code'),
        ('practice', 'Conduite'),
    ], string='Type d\'examen', required=True)

    exam_date = fields.Datetime(string='Date d\'examen')
    exam_center = fields.Char(string='Centre d\'examen')

    result = fields.Selection([
        ('pending', 'En attente'),
        ('passed', 'Réussi'),
        ('failed', 'Échoué'),
    ], string='Résultat', default='pending')

    score = fields.Integer(string='Score (code)')  # Pour l'examen du code
    faults = fields.Integer(string='Nombre de fautes')

    notes = fields.Text(string='Observations')
```

### 3. Certification et Attestations

```python
class EducationCertification(models.Model):
    _name = 'education.certification'
    _description = 'Certification / Diplôme'

    name = fields.Char(string='Nom', required=True)
    code = fields.Char(string='Code RNCP/RS')

    certification_type = fields.Selection([
        ('diploma', 'Diplôme'),
        ('certificate', 'Certificat'),
        ('attestation', 'Attestation'),
        ('badge', 'Badge numérique'),
    ], string='Type', default='certificate')

    issuing_body = fields.Char(string='Organisme certificateur')
    validity_months = fields.Integer(string='Validité (mois)', default=0)  # 0 = illimité

    passing_score = fields.Float(string='Score de réussite (%)', default=70)

    # Compétences
    skill_ids = fields.Many2many('education.skill', string='Compétences certifiées')

    # Formations associées
    course_ids = fields.One2many('education.course', 'certification_id', string='Formations')


class EducationCertificate(models.Model):
    _name = 'education.certificate'
    _description = 'Attestation de formation'
    _order = 'issue_date desc'

    name = fields.Char(string='Numéro', required=True, copy=False,
                       default=lambda self: self.env['ir.sequence'].next_by_code('education.certificate'))

    enrollment_id = fields.Many2one('education.enrollment', string='Inscription')
    student_id = fields.Many2one('education.student', string='Apprenant', required=True)
    course_id = fields.Many2one('education.course', string='Formation', required=True)
    certification_id = fields.Many2one(related='course_id.certification_id')

    issue_date = fields.Date(string='Date d\'émission', default=fields.Date.today)
    expiry_date = fields.Date(string='Date d\'expiration', compute='_compute_expiry')

    final_score = fields.Float(string='Note obtenue')
    grade = fields.Char(compute='_compute_grade', string='Mention')

    # Document
    document = fields.Binary(string='Document PDF')
    document_filename = fields.Char()

    # Vérification
    verification_code = fields.Char(string='Code de vérification', copy=False)
    verification_url = fields.Char(compute='_compute_verification_url')

    @api.model
    def create(self, vals):
        record = super().create(vals)
        record.verification_code = self.env['ir.sequence'].next_by_code('education.certificate.verification')
        record._generate_pdf()
        return record

    @api.depends('issue_date', 'certification_id.validity_months')
    def _compute_expiry(self):
        for record in self:
            if record.certification_id and record.certification_id.validity_months > 0:
                record.expiry_date = record.issue_date + timedelta(days=record.certification_id.validity_months * 30)
            else:
                record.expiry_date = False

    @api.depends('final_score')
    def _compute_grade(self):
        for record in self:
            if record.final_score >= 90:
                record.grade = 'Très bien'
            elif record.final_score >= 80:
                record.grade = 'Bien'
            elif record.final_score >= 70:
                record.grade = 'Assez bien'
            else:
                record.grade = 'Passable'

    def _generate_pdf(self):
        """Générer le PDF de l'attestation"""
        report = self.env.ref('education.action_report_certificate')
        pdf_content, _ = report._render_qweb_pdf(self.ids)
        self.document = base64.b64encode(pdf_content)
        self.document_filename = f"attestation_{self.name}.pdf"
```

### 4. Intégration eLearning Odoo

```python
class EducationCourseElearning(models.Model):
    _inherit = 'education.course'

    # Lien avec le module Slides (eLearning natif)
    slide_channel_id = fields.Many2one('slide.channel', string='Cours en ligne')
    auto_create_channel = fields.Boolean(string='Créer cours eLearning auto')

    def action_create_elearning_channel(self):
        """Créer automatiquement un cours eLearning"""
        self.ensure_one()
        if not self.slide_channel_id:
            channel = self.env['slide.channel'].create({
                'name': self.name,
                'description': self.description,
                'channel_type': 'training',
                'enroll': 'invite',
                'visibility': 'members',
                'promote_strategy': 'none',
            })
            self.slide_channel_id = channel

            # Créer les sections pour chaque module
            for module in self.module_ids:
                self.env['slide.slide'].create({
                    'name': module.name,
                    'channel_id': channel.id,
                    'slide_category': 'category',
                    'sequence': module.sequence,
                })

        return {
            'type': 'ir.actions.act_window',
            'res_model': 'slide.channel',
            'res_id': self.slide_channel_id.id,
            'view_mode': 'form',
        }


class SlideChannelInherit(models.Model):
    _inherit = 'slide.channel'

    education_course_id = fields.Many2one('education.course', string='Formation associée')

    def _action_add_members(self, partners):
        """Override pour synchroniser avec les inscriptions"""
        result = super()._action_add_members(partners)
        if self.education_course_id:
            # Logique de synchronisation
            pass
        return result
```

### 5. Planification et Calendrier

```python
class EducationSchedule(models.Model):
    _name = 'education.schedule'
    _description = 'Planning de formation'

    session_id = fields.Many2one('education.session', string='Session', required=True)
    date = fields.Date(string='Date', required=True)
    time_start = fields.Float(string='Heure début')
    time_end = fields.Float(string='Heure fin')

    module_id = fields.Many2one('education.course.module', string='Module')
    instructor_id = fields.Many2one('education.instructor', string='Formateur')
    room_id = fields.Many2one('education.room', string='Salle')

    notes = fields.Text(string='Notes')

    @api.constrains('time_start', 'time_end')
    def _check_times(self):
        for record in self:
            if record.time_end <= record.time_start:
                raise ValidationError("L'heure de fin doit être après l'heure de début.")


class EducationRoom(models.Model):
    _name = 'education.room'
    _description = 'Salle de formation'

    name = fields.Char(string='Nom', required=True)
    location_id = fields.Many2one('education.location', string='Site')
    capacity = fields.Integer(string='Capacité')

    # Équipements
    has_projector = fields.Boolean(string='Vidéoprojecteur')
    has_whiteboard = fields.Boolean(string='Tableau blanc')
    has_computers = fields.Boolean(string='Postes informatiques')
    computer_count = fields.Integer(string='Nombre de postes')
    has_visio = fields.Boolean(string='Équipement visio')

    equipment_notes = fields.Text(string='Équipements supplémentaires')

    active = fields.Boolean(default=True)
```

### 6. Reporting et Analytics

```python
class EducationReportMixin(models.AbstractModel):
    _name = 'education.report.mixin'
    _description = 'Mixin pour rapports éducation'

    def _get_training_hours_by_period(self, date_from, date_to, group_by='month'):
        """Heures de formation par période"""
        query = """
            SELECT
                DATE_TRUNC(%s, s.date_start) as period,
                SUM(c.duration_hours * COUNT(DISTINCT e.id)) as total_hours,
                COUNT(DISTINCT e.student_id) as student_count
            FROM education_session s
            JOIN education_course c ON s.course_id = c.id
            JOIN education_enrollment e ON e.session_id = s.id
            WHERE s.date_start BETWEEN %s AND %s
              AND e.state IN ('attended', 'completed')
            GROUP BY DATE_TRUNC(%s, s.date_start)
            ORDER BY period
        """
        self.env.cr.execute(query, (group_by, date_from, date_to, group_by))
        return self.env.cr.dictfetchall()

    def _get_completion_rates_by_course(self):
        """Taux de réussite par formation"""
        query = """
            SELECT
                c.id as course_id,
                c.name as course_name,
                COUNT(e.id) as total_enrollments,
                COUNT(CASE WHEN e.state = 'completed' AND e.passed THEN 1 END) as passed,
                ROUND(
                    COUNT(CASE WHEN e.state = 'completed' AND e.passed THEN 1 END)::numeric /
                    NULLIF(COUNT(e.id), 0) * 100, 2
                ) as completion_rate
            FROM education_course c
            LEFT JOIN education_enrollment e ON e.course_id = c.id
            WHERE e.state IN ('completed', 'failed')
            GROUP BY c.id, c.name
            ORDER BY completion_rate DESC
        """
        self.env.cr.execute(query)
        return self.env.cr.dictfetchall()
```

## Integration Patterns

### Intégration Website pour inscriptions en ligne
```python
class WebsiteEducation(models.Model):
    _inherit = 'education.course'

    website_published = fields.Boolean(string='Publié sur le site')
    website_url = fields.Char(compute='_compute_website_url')

    def _compute_website_url(self):
        for record in self:
            record.website_url = f'/formations/{record.id}'


# Controller
from odoo import http

class EducationController(http.Controller):

    @http.route('/formations', type='http', auth='public', website=True)
    def course_list(self, **kwargs):
        courses = http.request.env['education.course'].sudo().search([
            ('website_published', '=', True),
        ])
        return http.request.render('education.course_list_template', {
            'courses': courses,
        })

    @http.route('/formations/<int:course_id>', type='http', auth='public', website=True)
    def course_detail(self, course_id, **kwargs):
        course = http.request.env['education.course'].sudo().browse(course_id)
        sessions = course.session_ids.filtered(
            lambda s: s.state == 'confirmed' and s.available_seats > 0
        )
        return http.request.render('education.course_detail_template', {
            'course': course,
            'sessions': sessions,
        })

    @http.route('/formations/inscription', type='http', auth='public', website=True, methods=['POST'])
    def enroll(self, session_id, **post):
        # Logique d'inscription en ligne
        pass
```

## Best Practices

### Conformité Qualiopi
```python
class QualiopiCompliance(models.Model):
    _name = 'education.qualiopi'
    _description = 'Conformité Qualiopi'

    # Les 7 critères Qualiopi
    criterion_ids = fields.One2many('education.qualiopi.criterion', 'compliance_id')

    # Indicateurs par critère
    # Critère 1: Information du public
    # Critère 2: Identification des objectifs
    # Critère 3: Adaptation aux publics
    # Critère 4: Moyens pédagogiques
    # Critère 5: Qualification des formateurs
    # Critère 6: Environnement professionnel
    # Critère 7: Amélioration continue
```

### Gestion RGPD
```python
class EducationStudentRGPD(models.Model):
    _inherit = 'education.student'

    consent_date = fields.Date(string='Date de consentement RGPD')
    consent_marketing = fields.Boolean(string='Consentement marketing')
    data_retention_date = fields.Date(compute='_compute_retention')

    def action_anonymize(self):
        """Anonymiser les données personnelles"""
        self.ensure_one()
        self.partner_id.write({
            'name': f'Anonyme-{self.student_code}',
            'email': False,
            'phone': False,
            'mobile': False,
        })
```

## Commandes Utiles

### Recherche de sessions disponibles
```python
# Sessions avec places disponibles dans les 30 prochains jours
sessions = env['education.session'].search([
    ('state', '=', 'confirmed'),
    ('date_start', '>=', fields.Date.today()),
    ('date_start', '<=', fields.Date.today() + timedelta(days=30)),
    ('available_seats', '>', 0),
])
```

### Génération de rapports CPF
```python
# Export pour Mon Compte Formation
def export_cpf_data(self):
    return {
        'organisme': self.env.company.name,
        'siret': self.env.company.siret,
        'formations': [{
            'code_cpf': c.cpf_code,
            'intitule': c.name,
            'duree': c.duration_hours,
            'prix': c.price,
        } for c in self.env['education.course'].search([('cpf_eligible', '=', True)])]
    }
```
