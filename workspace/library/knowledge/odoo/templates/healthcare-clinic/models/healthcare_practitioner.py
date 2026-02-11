# -*- coding: utf-8 -*-
from odoo import models, fields, api


class HealthcarePractitioner(models.Model):
    _name = 'healthcare.practitioner'
    _description = 'Healthcare Practitioner'
    _inherits = {'res.partner': 'partner_id'}
    _inherit = ['mail.thread']
    _order = 'name'

    partner_id = fields.Many2one(
        'res.partner', string='Contact', required=True, ondelete='cascade')

    # Professional Identification
    practitioner_type = fields.Selection([
        ('doctor', 'Doctor'),
        ('specialist', 'Specialist'),
        ('dentist', 'Dentist'),
        ('nurse', 'Nurse'),
        ('physiotherapist', 'Physiotherapist'),
        ('psychologist', 'Psychologist'),
        ('other', 'Other'),
    ], string='Type', required=True, default='doctor')

    specialty_id = fields.Many2one(
        'healthcare.specialty', string='Specialty')
    registration_number = fields.Char(
        string='Registration Number', help='Professional registration number')
    license_number = fields.Char(string='License Number')

    # User Link
    user_id = fields.Many2one(
        'res.users', string='Related User',
        help='Odoo user account for this practitioner')

    # Schedule
    calendar_id = fields.Many2one(
        'resource.calendar', string='Working Hours')
    appointment_duration = fields.Integer(
        string='Default Appointment Duration (min)', default=30)

    # Fees
    consultation_fee = fields.Monetary(
        string='Consultation Fee', currency_field='currency_id')
    currency_id = fields.Many2one(
        'res.currency', default=lambda self: self.env.company.currency_id)

    # Statistics
    appointment_ids = fields.One2many(
        'healthcare.appointment', 'practitioner_id', string='Appointments')
    consultation_ids = fields.One2many(
        'healthcare.consultation', 'practitioner_id', string='Consultations')
    patient_count = fields.Integer(
        compute='_compute_patient_count', string='Patients')

    active = fields.Boolean(default=True)
    color = fields.Integer(string='Color Index')

    @api.depends('consultation_ids')
    def _compute_patient_count(self):
        for practitioner in self:
            patients = practitioner.consultation_ids.mapped('patient_id')
            practitioner.patient_count = len(patients)

    def action_view_appointments(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'My Appointments',
            'res_model': 'healthcare.appointment',
            'view_mode': 'calendar,tree,form',
            'domain': [('practitioner_id', '=', self.id)],
            'context': {'default_practitioner_id': self.id},
        }


class HealthcareSpecialty(models.Model):
    _name = 'healthcare.specialty'
    _description = 'Medical Specialty'
    _order = 'name'

    name = fields.Char(string='Specialty', required=True)
    code = fields.Char(string='Code')
    description = fields.Text(string='Description')

    practitioner_ids = fields.One2many(
        'healthcare.practitioner', 'specialty_id', string='Practitioners')
