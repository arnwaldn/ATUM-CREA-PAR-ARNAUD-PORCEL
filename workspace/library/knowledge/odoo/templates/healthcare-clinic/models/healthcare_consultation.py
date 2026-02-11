# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import UserError


class HealthcareConsultation(models.Model):
    _name = 'healthcare.consultation'
    _description = 'Medical Consultation'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'date desc'

    name = fields.Char(
        string='Reference', required=True, copy=False, readonly=True,
        default=lambda self: self.env['ir.sequence'].next_by_code('healthcare.consultation'))

    # Patient & Practitioner
    patient_id = fields.Many2one(
        'healthcare.patient', string='Patient', required=True, tracking=True)
    practitioner_id = fields.Many2one(
        'healthcare.practitioner', string='Practitioner', required=True, tracking=True)
    appointment_id = fields.Many2one(
        'healthcare.appointment', string='Appointment')

    # Date
    date = fields.Datetime(
        string='Date', default=fields.Datetime.now, required=True, tracking=True)

    # Chief Complaint
    reason = fields.Text(string='Reason for Visit')
    chief_complaint = fields.Text(string='Chief Complaint')
    history_present_illness = fields.Html(string='History of Present Illness')

    # Vital Signs
    weight = fields.Float(string='Weight (kg)')
    height = fields.Float(string='Height (cm)')
    bmi = fields.Float(string='BMI', compute='_compute_bmi', store=True)
    temperature = fields.Float(string='Temperature (°C)')
    blood_pressure_systolic = fields.Integer(string='Systolic BP (mmHg)')
    blood_pressure_diastolic = fields.Integer(string='Diastolic BP (mmHg)')
    blood_pressure = fields.Char(
        string='Blood Pressure', compute='_compute_blood_pressure')
    heart_rate = fields.Integer(string='Heart Rate (bpm)')
    respiratory_rate = fields.Integer(string='Respiratory Rate')
    oxygen_saturation = fields.Float(string='SpO2 (%)')

    # Physical Examination
    physical_examination = fields.Html(string='Physical Examination')
    examination_notes = fields.Text(string='Examination Notes')

    # Diagnosis
    diagnosis_ids = fields.Many2many(
        'healthcare.condition', string='Diagnoses')
    diagnosis_notes = fields.Text(string='Diagnosis Notes')
    icd_codes = fields.Char(
        string='ICD-10 Codes', compute='_compute_icd_codes')

    # Treatment Plan
    treatment_plan = fields.Html(string='Treatment Plan')

    # Related Records
    prescription_ids = fields.One2many(
        'healthcare.prescription', 'consultation_id', string='Prescriptions')
    prescription_count = fields.Integer(
        compute='_compute_prescription_count')

    # State
    state = fields.Selection([
        ('draft', 'In Progress'),
        ('done', 'Completed'),
        ('cancelled', 'Cancelled'),
    ], string='Status', default='draft', tracking=True)

    # Follow-up
    follow_up_required = fields.Boolean(string='Follow-up Required')
    follow_up_date = fields.Date(string='Recommended Follow-up Date')
    follow_up_notes = fields.Text(string='Follow-up Notes')

    # Billing
    billable = fields.Boolean(string='Billable', default=True)
    consultation_fee = fields.Monetary(
        string='Fee', currency_field='currency_id')
    currency_id = fields.Many2one(
        'res.currency', default=lambda self: self.env.company.currency_id)
    invoice_id = fields.Many2one('account.move', string='Invoice', copy=False)
    invoice_status = fields.Selection([
        ('no', 'Nothing to Invoice'),
        ('to_invoice', 'To Invoice'),
        ('invoiced', 'Invoiced'),
    ], string='Invoice Status', default='no', compute='_compute_invoice_status')

    @api.depends('weight', 'height')
    def _compute_bmi(self):
        for consultation in self:
            if consultation.weight and consultation.height:
                height_m = consultation.height / 100
                consultation.bmi = round(
                    consultation.weight / (height_m ** 2), 1)
            else:
                consultation.bmi = 0

    @api.depends('blood_pressure_systolic', 'blood_pressure_diastolic')
    def _compute_blood_pressure(self):
        for consultation in self:
            if consultation.blood_pressure_systolic and consultation.blood_pressure_diastolic:
                consultation.blood_pressure = (
                    f"{consultation.blood_pressure_systolic}/"
                    f"{consultation.blood_pressure_diastolic}")
            else:
                consultation.blood_pressure = ''

    @api.depends('diagnosis_ids')
    def _compute_icd_codes(self):
        for consultation in self:
            codes = consultation.diagnosis_ids.filtered(
                'icd_code').mapped('icd_code')
            consultation.icd_codes = ', '.join(codes) if codes else ''

    @api.depends('prescription_ids')
    def _compute_prescription_count(self):
        for consultation in self:
            consultation.prescription_count = len(consultation.prescription_ids)

    @api.depends('billable', 'invoice_id')
    def _compute_invoice_status(self):
        for consultation in self:
            if not consultation.billable:
                consultation.invoice_status = 'no'
            elif consultation.invoice_id:
                consultation.invoice_status = 'invoiced'
            elif consultation.state == 'done':
                consultation.invoice_status = 'to_invoice'
            else:
                consultation.invoice_status = 'no'

    @api.onchange('practitioner_id')
    def _onchange_practitioner_id(self):
        if self.practitioner_id:
            self.consultation_fee = self.practitioner_id.consultation_fee

    def action_complete(self):
        for consultation in self:
            consultation.state = 'done'
            if consultation.appointment_id:
                consultation.appointment_id.action_done()

    def action_cancel(self):
        self.write({'state': 'cancelled'})

    def action_create_prescription(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'New Prescription',
            'res_model': 'healthcare.prescription',
            'view_mode': 'form',
            'context': {
                'default_patient_id': self.patient_id.id,
                'default_practitioner_id': self.practitioner_id.id,
                'default_consultation_id': self.id,
            },
        }

    def action_view_prescriptions(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Prescriptions',
            'res_model': 'healthcare.prescription',
            'view_mode': 'tree,form',
            'domain': [('consultation_id', '=', self.id)],
            'context': {'default_consultation_id': self.id},
        }

    def action_create_invoice(self):
        self.ensure_one()
        if self.invoice_id:
            raise UserError('An invoice already exists for this consultation.')

        if not self.billable or not self.consultation_fee:
            raise UserError('This consultation is not billable.')

        invoice_vals = {
            'move_type': 'out_invoice',
            'partner_id': self.patient_id.partner_id.id,
            'invoice_date': fields.Date.today(),
            'invoice_line_ids': [(0, 0, {
                'name': f'Medical Consultation - {self.name}',
                'quantity': 1,
                'price_unit': self.consultation_fee,
            })],
        }

        invoice = self.env['account.move'].create(invoice_vals)
        self.invoice_id = invoice

        return {
            'type': 'ir.actions.act_window',
            'res_model': 'account.move',
            'res_id': invoice.id,
            'view_mode': 'form',
        }

    def action_schedule_follow_up(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Schedule Follow-up',
            'res_model': 'healthcare.appointment.wizard',
            'view_mode': 'form',
            'target': 'new',
            'context': {
                'default_patient_id': self.patient_id.id,
                'default_practitioner_id': self.practitioner_id.id,
                'default_appointment_type': 'follow_up',
                'default_reason': self.follow_up_notes or f'Follow-up for {self.name}',
            },
        }
