# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import ValidationError, UserError
from datetime import timedelta


class HealthcareAppointment(models.Model):
    _name = 'healthcare.appointment'
    _description = 'Medical Appointment'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'datetime_start desc'

    name = fields.Char(
        string='Reference', required=True, copy=False, readonly=True,
        default=lambda self: self.env['ir.sequence'].next_by_code('healthcare.appointment'))

    # Patient & Practitioner
    patient_id = fields.Many2one(
        'healthcare.patient', string='Patient', required=True,
        tracking=True, index=True)
    partner_id = fields.Many2one(
        related='patient_id.partner_id', store=True)
    practitioner_id = fields.Many2one(
        'healthcare.practitioner', string='Practitioner', required=True,
        tracking=True, index=True)

    # Schedule
    datetime_start = fields.Datetime(
        string='Date & Time', required=True, tracking=True, index=True)
    datetime_end = fields.Datetime(
        string='End Time', compute='_compute_datetime_end', store=True)
    duration = fields.Integer(
        string='Duration (min)', default=30, required=True)
    all_day = fields.Boolean(string='All Day')

    # Type
    appointment_type = fields.Selection([
        ('consultation', 'Consultation'),
        ('follow_up', 'Follow-up'),
        ('checkup', 'Check-up'),
        ('emergency', 'Emergency'),
        ('procedure', 'Procedure'),
        ('vaccination', 'Vaccination'),
    ], string='Type', default='consultation', required=True)

    is_first_visit = fields.Boolean(string='First Visit')
    is_teleconsultation = fields.Boolean(string='Teleconsultation')
    teleconsultation_url = fields.Char(string='Video Link')

    # Reason
    reason = fields.Text(string='Reason for Visit')
    symptoms = fields.Text(string='Symptoms')
    note = fields.Text(string='Internal Notes')

    # State
    state = fields.Selection([
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('arrived', 'Arrived'),
        ('in_progress', 'In Progress'),
        ('done', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ], string='Status', default='draft', tracking=True, index=True)

    # Calendar Integration
    calendar_event_id = fields.Many2one(
        'calendar.event', string='Calendar Event', copy=False)

    # Related Consultation
    consultation_id = fields.Many2one(
        'healthcare.consultation', string='Consultation', copy=False)

    # Reminders
    reminder_sent = fields.Boolean(string='Reminder Sent', copy=False)

    # Color for calendar view
    color = fields.Integer(
        related='practitioner_id.color', string='Color')

    @api.depends('datetime_start', 'duration')
    def _compute_datetime_end(self):
        for appointment in self:
            if appointment.datetime_start and appointment.duration:
                appointment.datetime_end = appointment.datetime_start + \
                    timedelta(minutes=appointment.duration)
            else:
                appointment.datetime_end = appointment.datetime_start

    @api.constrains('datetime_start', 'practitioner_id')
    def _check_practitioner_availability(self):
        for appointment in self:
            if appointment.state == 'cancelled':
                continue

            domain = [
                ('id', '!=', appointment.id),
                ('practitioner_id', '=', appointment.practitioner_id.id),
                ('state', 'not in', ['cancelled', 'no_show']),
                ('datetime_start', '<', appointment.datetime_end),
                ('datetime_end', '>', appointment.datetime_start),
            ]
            conflicts = self.search(domain, limit=1)
            if conflicts:
                raise ValidationError(
                    f"Practitioner already has an appointment at this time: "
                    f"{conflicts.name}")

    @api.onchange('practitioner_id')
    def _onchange_practitioner_id(self):
        if self.practitioner_id:
            self.duration = self.practitioner_id.appointment_duration or 30

    def action_confirm(self):
        for appointment in self:
            appointment.state = 'confirmed'
            appointment._create_calendar_event()
            appointment._send_confirmation_email()

    def action_patient_arrived(self):
        self.write({'state': 'arrived'})

    def action_start_consultation(self):
        self.ensure_one()
        if self.consultation_id:
            return {
                'type': 'ir.actions.act_window',
                'res_model': 'healthcare.consultation',
                'res_id': self.consultation_id.id,
                'view_mode': 'form',
            }

        # Create new consultation
        consultation = self.env['healthcare.consultation'].create({
            'patient_id': self.patient_id.id,
            'practitioner_id': self.practitioner_id.id,
            'appointment_id': self.id,
            'reason': self.reason,
        })
        self.write({
            'state': 'in_progress',
            'consultation_id': consultation.id,
        })

        return {
            'type': 'ir.actions.act_window',
            'res_model': 'healthcare.consultation',
            'res_id': consultation.id,
            'view_mode': 'form',
        }

    def action_done(self):
        self.write({'state': 'done'})

    def action_cancel(self):
        for appointment in self:
            appointment.state = 'cancelled'
            if appointment.calendar_event_id:
                appointment.calendar_event_id.unlink()

    def action_no_show(self):
        self.write({'state': 'no_show'})

    def _create_calendar_event(self):
        self.ensure_one()
        if self.calendar_event_id:
            return

        attendees = [(4, self.practitioner_id.partner_id.id)]
        if self.patient_id.partner_id:
            attendees.append((4, self.patient_id.partner_id.id))

        event_vals = {
            'name': f"Appointment: {self.patient_id.name}",
            'start': self.datetime_start,
            'stop': self.datetime_end,
            'allday': self.all_day,
            'partner_ids': attendees,
            'description': self.reason or '',
        }

        if self.practitioner_id.user_id:
            event_vals['user_id'] = self.practitioner_id.user_id.id

        event = self.env['calendar.event'].create(event_vals)
        self.calendar_event_id = event

    def _send_confirmation_email(self):
        template = self.env.ref(
            'healthcare_clinic.email_template_appointment_confirmation',
            raise_if_not_found=False)
        if template:
            template.send_mail(self.id, force_send=True)

    @api.model
    def _cron_send_reminders(self):
        """Send appointment reminders 24h before"""
        tomorrow_start = fields.Datetime.now() + timedelta(days=1)
        tomorrow_end = tomorrow_start + timedelta(hours=24)

        appointments = self.search([
            ('datetime_start', '>=', tomorrow_start),
            ('datetime_start', '<', tomorrow_end),
            ('state', '=', 'confirmed'),
            ('reminder_sent', '=', False),
        ])

        template = self.env.ref(
            'healthcare_clinic.email_template_appointment_reminder',
            raise_if_not_found=False)

        for appointment in appointments:
            if template:
                template.send_mail(appointment.id)
            appointment.reminder_sent = True
