# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import ValidationError
from datetime import date


class HealthcarePatient(models.Model):
    _name = 'healthcare.patient'
    _description = 'Patient'
    _inherits = {'res.partner': 'partner_id'}
    _inherit = ['mail.thread', 'mail.activity.mixin', 'portal.mixin']
    _order = 'name'

    partner_id = fields.Many2one(
        'res.partner', string='Contact', required=True, ondelete='cascade',
        auto_join=True, index=True)

    # Identification
    patient_id = fields.Char(
        string='Patient ID', required=True, copy=False, readonly=True,
        default=lambda self: self.env['ir.sequence'].next_by_code('healthcare.patient'))

    # Personal Information
    birthdate = fields.Date(string='Date of Birth', required=True, tracking=True)
    age = fields.Integer(string='Age', compute='_compute_age', store=True)
    gender = fields.Selection([
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ], string='Gender', required=True, tracking=True)

    blood_type = fields.Selection([
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
        ('unknown', 'Unknown'),
    ], string='Blood Type', default='unknown')

    # Official IDs
    social_security_number = fields.Char(string='Social Security Number')
    national_id = fields.Char(string='National ID')

    # Emergency Contact
    emergency_contact_name = fields.Char(string='Emergency Contact')
    emergency_contact_phone = fields.Char(string='Emergency Phone')
    emergency_contact_relation = fields.Selection([
        ('spouse', 'Spouse'),
        ('parent', 'Parent'),
        ('child', 'Child'),
        ('sibling', 'Sibling'),
        ('friend', 'Friend'),
        ('other', 'Other'),
    ], string='Relationship')

    # Medical Information
    primary_physician_id = fields.Many2one(
        'healthcare.practitioner', string='Primary Physician')
    allergy_ids = fields.Many2many(
        'healthcare.allergy', string='Allergies')
    chronic_condition_ids = fields.Many2many(
        'healthcare.condition', string='Chronic Conditions')

    medical_notes = fields.Text(string='Medical Notes')
    alert_note = fields.Text(string='Alert Note',
        help='Important information displayed prominently')

    # Insurance
    insurance_company = fields.Char(string='Insurance Company')
    insurance_policy_number = fields.Char(string='Policy Number')
    insurance_coverage = fields.Float(string='Coverage %', default=100)

    # Related Records
    appointment_ids = fields.One2many(
        'healthcare.appointment', 'patient_id', string='Appointments')
    consultation_ids = fields.One2many(
        'healthcare.consultation', 'patient_id', string='Consultations')
    prescription_ids = fields.One2many(
        'healthcare.prescription', 'patient_id', string='Prescriptions')

    # Statistics
    appointment_count = fields.Integer(
        compute='_compute_counts', string='Appointments')
    consultation_count = fields.Integer(
        compute='_compute_counts', string='Consultations')
    last_visit_date = fields.Date(
        compute='_compute_counts', string='Last Visit')

    # GDPR Compliance
    data_consent = fields.Boolean(string='Data Processing Consent')
    data_consent_date = fields.Date(string='Consent Date')

    # State
    active = fields.Boolean(default=True)

    _sql_constraints = [
        ('patient_id_unique', 'UNIQUE(patient_id)', 'Patient ID must be unique!'),
    ]

    @api.depends('birthdate')
    def _compute_age(self):
        today = date.today()
        for patient in self:
            if patient.birthdate:
                born = patient.birthdate
                patient.age = today.year - born.year - (
                    (today.month, today.day) < (born.month, born.day))
            else:
                patient.age = 0

    @api.depends('appointment_ids', 'consultation_ids')
    def _compute_counts(self):
        for patient in self:
            patient.appointment_count = len(patient.appointment_ids)
            patient.consultation_count = len(patient.consultation_ids)

            done_consultations = patient.consultation_ids.filtered(
                lambda c: c.state == 'done')
            if done_consultations:
                patient.last_visit_date = max(
                    done_consultations.mapped('date')).date()
            else:
                patient.last_visit_date = False

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not vals.get('partner_id'):
                # Create partner automatically
                partner_vals = {
                    'name': vals.get('name', 'New Patient'),
                    'is_company': False,
                    'customer_rank': 1,
                }
                partner = self.env['res.partner'].create(partner_vals)
                vals['partner_id'] = partner.id
        return super().create(vals_list)

    def action_view_appointments(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Appointments',
            'res_model': 'healthcare.appointment',
            'view_mode': 'calendar,tree,form',
            'domain': [('patient_id', '=', self.id)],
            'context': {'default_patient_id': self.id},
        }

    def action_view_consultations(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Consultations',
            'res_model': 'healthcare.consultation',
            'view_mode': 'tree,form',
            'domain': [('patient_id', '=', self.id)],
            'context': {'default_patient_id': self.id},
        }

    def action_new_appointment(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'New Appointment',
            'res_model': 'healthcare.appointment',
            'view_mode': 'form',
            'context': {
                'default_patient_id': self.id,
                'default_partner_id': self.partner_id.id,
            },
        }


class HealthcareAllergy(models.Model):
    _name = 'healthcare.allergy'
    _description = 'Allergy'
    _order = 'name'

    name = fields.Char(string='Allergy', required=True)
    severity = fields.Selection([
        ('mild', 'Mild'),
        ('moderate', 'Moderate'),
        ('severe', 'Severe'),
        ('life_threatening', 'Life Threatening'),
    ], string='Severity', default='moderate')
    description = fields.Text(string='Description')
    active = fields.Boolean(default=True)


class HealthcareCondition(models.Model):
    _name = 'healthcare.condition'
    _description = 'Medical Condition'
    _order = 'name'

    name = fields.Char(string='Condition', required=True)
    icd_code = fields.Char(string='ICD-10 Code')
    description = fields.Text(string='Description')
    active = fields.Boolean(default=True)
