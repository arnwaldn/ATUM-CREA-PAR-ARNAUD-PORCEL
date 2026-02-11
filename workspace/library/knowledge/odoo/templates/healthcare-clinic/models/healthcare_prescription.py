# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import UserError
from datetime import timedelta


class HealthcarePrescription(models.Model):
    _name = 'healthcare.prescription'
    _description = 'Medical Prescription'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'date desc'

    name = fields.Char(
        string='Reference', required=True, copy=False, readonly=True,
        default=lambda self: self.env['ir.sequence'].next_by_code('healthcare.prescription'))

    # Participants
    patient_id = fields.Many2one(
        'healthcare.patient', string='Patient', required=True,
        tracking=True, index=True)
    practitioner_id = fields.Many2one(
        'healthcare.practitioner', string='Prescriber', required=True,
        tracking=True)
    consultation_id = fields.Many2one(
        'healthcare.consultation', string='Consultation')

    # Dates
    date = fields.Date(
        string='Prescription Date', default=fields.Date.today,
        required=True, tracking=True)
    validity_date = fields.Date(
        string='Valid Until', compute='_compute_validity_date', store=True)
    validity_days = fields.Integer(
        string='Validity (days)', default=30)

    # Prescription Lines
    line_ids = fields.One2many(
        'healthcare.prescription.line', 'prescription_id',
        string='Medications', copy=True)
    line_count = fields.Integer(compute='_compute_line_count')

    # State
    state = fields.Selection([
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('dispensed', 'Dispensed'),
        ('cancelled', 'Cancelled'),
    ], string='Status', default='draft', tracking=True)

    # Additional Info
    diagnosis = fields.Text(string='Diagnosis')
    notes = fields.Text(string='Instructions for Patient')
    internal_notes = fields.Text(string='Internal Notes')

    # Dispensing Info
    dispensed_date = fields.Datetime(string='Dispensed Date')
    dispensed_by = fields.Many2one('res.users', string='Dispensed By')

    # Renewal
    is_renewal = fields.Boolean(string='Is Renewal')
    original_prescription_id = fields.Many2one(
        'healthcare.prescription', string='Original Prescription')
    renewal_count = fields.Integer(
        string='Renewal Count', default=0)
    max_renewals = fields.Integer(
        string='Max Renewals Allowed', default=0)
    can_renew = fields.Boolean(compute='_compute_can_renew')

    # Print tracking
    print_count = fields.Integer(string='Times Printed', default=0)
    last_printed = fields.Datetime(string='Last Printed')

    @api.depends('date', 'validity_days')
    def _compute_validity_date(self):
        for prescription in self:
            if prescription.date and prescription.validity_days:
                prescription.validity_date = prescription.date + timedelta(
                    days=prescription.validity_days)
            else:
                prescription.validity_date = False

    @api.depends('line_ids')
    def _compute_line_count(self):
        for prescription in self:
            prescription.line_count = len(prescription.line_ids)

    @api.depends('renewal_count', 'max_renewals', 'state')
    def _compute_can_renew(self):
        for prescription in self:
            prescription.can_renew = (
                prescription.state == 'confirmed' and
                prescription.renewal_count < prescription.max_renewals
            )

    def action_confirm(self):
        for prescription in self:
            if not prescription.line_ids:
                raise UserError('Cannot confirm prescription without medications.')
            prescription.state = 'confirmed'

    def action_dispense(self):
        self.write({
            'state': 'dispensed',
            'dispensed_date': fields.Datetime.now(),
            'dispensed_by': self.env.uid,
        })

    def action_cancel(self):
        self.write({'state': 'cancelled'})

    def action_draft(self):
        self.write({'state': 'draft'})

    def action_print(self):
        self.ensure_one()
        self.write({
            'print_count': self.print_count + 1,
            'last_printed': fields.Datetime.now(),
        })
        return self.env.ref(
            'healthcare_clinic.action_report_prescription'
        ).report_action(self)

    def action_renew(self):
        self.ensure_one()
        if not self.can_renew:
            raise UserError('This prescription cannot be renewed.')

        new_prescription = self.copy({
            'date': fields.Date.today(),
            'state': 'draft',
            'is_renewal': True,
            'original_prescription_id': self.id if not self.is_renewal else self.original_prescription_id.id,
            'renewal_count': self.renewal_count + 1,
            'dispensed_date': False,
            'dispensed_by': False,
            'print_count': 0,
            'last_printed': False,
        })

        return {
            'type': 'ir.actions.act_window',
            'res_model': 'healthcare.prescription',
            'res_id': new_prescription.id,
            'view_mode': 'form',
        }


class HealthcarePrescriptionLine(models.Model):
    _name = 'healthcare.prescription.line'
    _description = 'Prescription Line'
    _order = 'sequence, id'

    prescription_id = fields.Many2one(
        'healthcare.prescription', string='Prescription',
        required=True, ondelete='cascade')
    sequence = fields.Integer(string='Sequence', default=10)

    # Medication
    medication_id = fields.Many2one(
        'healthcare.medication', string='Medication', required=True)
    medication_form = fields.Selection(
        related='medication_id.form', string='Form')

    # Dosage
    dosage = fields.Char(string='Dosage', required=True,
                         help='e.g., 1 tablet, 5ml, 2 puffs')
    frequency = fields.Selection([
        ('once_daily', 'Once Daily'),
        ('twice_daily', 'Twice Daily'),
        ('three_daily', 'Three Times Daily'),
        ('four_daily', 'Four Times Daily'),
        ('every_4h', 'Every 4 Hours'),
        ('every_6h', 'Every 6 Hours'),
        ('every_8h', 'Every 8 Hours'),
        ('every_12h', 'Every 12 Hours'),
        ('weekly', 'Once Weekly'),
        ('as_needed', 'As Needed (PRN)'),
        ('other', 'Other (see instructions)'),
    ], string='Frequency', required=True, default='once_daily')
    frequency_other = fields.Char(string='Other Frequency')

    # Duration
    duration = fields.Integer(string='Duration')
    duration_unit = fields.Selection([
        ('days', 'Days'),
        ('weeks', 'Weeks'),
        ('months', 'Months'),
    ], string='Duration Unit', default='days')

    # Quantity
    quantity = fields.Float(string='Quantity to Dispense')
    quantity_unit = fields.Char(string='Unit', default='units')

    # Timing
    take_with_food = fields.Boolean(string='Take with Food')
    time_of_day = fields.Selection([
        ('morning', 'Morning'),
        ('noon', 'Noon'),
        ('evening', 'Evening'),
        ('bedtime', 'Bedtime'),
        ('any', 'Any Time'),
    ], string='Time of Day', default='any')

    # Instructions
    instructions = fields.Text(string='Special Instructions')
    substitution_allowed = fields.Boolean(
        string='Generic Substitution Allowed', default=True)

    # Computed
    full_instructions = fields.Text(
        string='Full Instructions', compute='_compute_full_instructions')

    @api.depends('dosage', 'frequency', 'frequency_other', 'duration',
                 'duration_unit', 'instructions', 'take_with_food')
    def _compute_full_instructions(self):
        frequency_labels = dict(self._fields['frequency'].selection)
        duration_labels = dict(self._fields['duration_unit'].selection)

        for line in self:
            parts = []

            # Dosage and frequency
            freq_text = (line.frequency_other if line.frequency == 'other'
                         else frequency_labels.get(line.frequency, ''))
            parts.append(f"Take {line.dosage} {freq_text}")

            # Duration
            if line.duration and line.duration_unit:
                dur_unit = duration_labels.get(line.duration_unit, '')
                parts.append(f"for {line.duration} {dur_unit}")

            # Food
            if line.take_with_food:
                parts.append("- Take with food")

            # Additional instructions
            if line.instructions:
                parts.append(f"Note: {line.instructions}")

            line.full_instructions = '\n'.join(parts)

    @api.onchange('medication_id')
    def _onchange_medication_id(self):
        if self.medication_id:
            med = self.medication_id
            if med.default_dosage:
                self.dosage = med.default_dosage
            if med.default_frequency:
                self.frequency = med.default_frequency
            if med.default_duration_days:
                self.duration = med.default_duration_days
                self.duration_unit = 'days'
