# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import ValidationError
from datetime import datetime, timedelta


class HealthcareAppointmentWizard(models.TransientModel):
    _name = 'healthcare.appointment.wizard'
    _description = 'Schedule Appointment Wizard'

    patient_id = fields.Many2one(
        'healthcare.patient', string='Patient', required=True)
    practitioner_id = fields.Many2one(
        'healthcare.practitioner', string='Practitioner', required=True)
    appointment_type = fields.Selection([
        ('consultation', 'Consultation'),
        ('follow_up', 'Follow-up'),
        ('procedure', 'Procedure'),
        ('vaccination', 'Vaccination'),
        ('checkup', 'Check-up'),
        ('emergency', 'Emergency'),
    ], string='Type', default='consultation', required=True)
    date = fields.Date(
        string='Date', required=True, default=fields.Date.today)
    time_slot = fields.Selection(
        selection='_get_time_slots', string='Time Slot', required=True)
    duration = fields.Float(
        string='Duration (hours)', default=0.5, required=True)
    reason = fields.Text(string='Reason for Visit')

    @api.model
    def _get_time_slots(self):
        """Generate time slots from 8:00 to 18:00 in 30-minute intervals."""
        slots = []
        for hour in range(8, 18):
            for minute in [0, 30]:
                time_str = f"{hour:02d}:{minute:02d}"
                label = f"{hour:02d}:{minute:02d}"
                slots.append((time_str, label))
        return slots

    @api.onchange('practitioner_id', 'date')
    def _onchange_practitioner_date(self):
        """Check practitioner availability."""
        if self.practitioner_id and self.date:
            # Here you could add logic to check calendar availability
            # and show available slots only
            pass

    def action_create_appointment(self):
        """Create the appointment from wizard data."""
        self.ensure_one()

        # Parse time slot
        if not self.time_slot:
            raise ValidationError('Please select a time slot.')

        hour, minute = map(int, self.time_slot.split(':'))
        date_start = datetime.combine(
            self.date,
            datetime.min.time().replace(hour=hour, minute=minute)
        )
        date_end = date_start + timedelta(hours=self.duration)

        # Check for conflicts
        existing = self.env['healthcare.appointment'].search([
            ('practitioner_id', '=', self.practitioner_id.id),
            ('date_start', '<', date_end),
            ('date_end', '>', date_start),
            ('state', 'not in', ['cancelled', 'no_show']),
        ])

        if existing:
            raise ValidationError(
                'This time slot conflicts with an existing appointment. '
                'Please choose another time.'
            )

        # Create appointment
        appointment = self.env['healthcare.appointment'].create({
            'patient_id': self.patient_id.id,
            'practitioner_id': self.practitioner_id.id,
            'appointment_type': self.appointment_type,
            'date_start': date_start,
            'duration': self.duration,
            'reason': self.reason,
        })

        return {
            'type': 'ir.actions.act_window',
            'res_model': 'healthcare.appointment',
            'res_id': appointment.id,
            'view_mode': 'form',
            'target': 'current',
        }


class HealthcareRescheduleWizard(models.TransientModel):
    _name = 'healthcare.reschedule.wizard'
    _description = 'Reschedule Appointment Wizard'

    appointment_id = fields.Many2one(
        'healthcare.appointment', string='Appointment', required=True)
    new_date = fields.Date(string='New Date', required=True)
    new_time_slot = fields.Selection(
        selection='_get_time_slots', string='New Time Slot', required=True)
    reason = fields.Text(string='Reason for Rescheduling')

    @api.model
    def _get_time_slots(self):
        slots = []
        for hour in range(8, 18):
            for minute in [0, 30]:
                time_str = f"{hour:02d}:{minute:02d}"
                slots.append((time_str, time_str))
        return slots

    def action_reschedule(self):
        self.ensure_one()

        hour, minute = map(int, self.new_time_slot.split(':'))
        new_date_start = datetime.combine(
            self.new_date,
            datetime.min.time().replace(hour=hour, minute=minute)
        )
        new_date_end = new_date_start + timedelta(
            hours=self.appointment_id.duration)

        # Check for conflicts
        existing = self.env['healthcare.appointment'].search([
            ('practitioner_id', '=', self.appointment_id.practitioner_id.id),
            ('id', '!=', self.appointment_id.id),
            ('date_start', '<', new_date_end),
            ('date_end', '>', new_date_start),
            ('state', 'not in', ['cancelled', 'no_show']),
        ])

        if existing:
            raise ValidationError(
                'This time slot conflicts with an existing appointment.')

        # Update appointment
        self.appointment_id.write({
            'date_start': new_date_start,
        })

        # Log the rescheduling
        self.appointment_id.message_post(
            body=f"Appointment rescheduled to {new_date_start.strftime('%Y-%m-%d %H:%M')}. "
                 f"Reason: {self.reason or 'Not specified'}"
        )

        return {'type': 'ir.actions.act_window_close'}
