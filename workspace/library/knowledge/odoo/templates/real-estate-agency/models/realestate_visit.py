# -*- coding: utf-8 -*-
from odoo import models, fields, api
from datetime import timedelta


class RealestateVisit(models.Model):
    _name = 'realestate.visit'
    _description = 'Property Visit'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'date desc, time_start'

    name = fields.Char(
        string='Reference', required=True, copy=False, readonly=True,
        default=lambda self: self.env['ir.sequence'].next_by_code('realestate.visit'))

    # Property
    property_id = fields.Many2one(
        'realestate.property', string='Property', required=True, tracking=True)
    property_address = fields.Char(
        related='property_id.city', string='Location')

    # Visitor
    visitor_id = fields.Many2one(
        'res.partner', string='Visitor', required=True, tracking=True)
    visitor_phone = fields.Char(related='visitor_id.phone', string='Phone')
    visitor_email = fields.Char(related='visitor_id.email', string='Email')

    # Schedule
    date = fields.Date(string='Date', required=True, tracking=True)
    time_start = fields.Float(string='Start Time', required=True)
    time_end = fields.Float(string='End Time')
    duration = fields.Float(
        string='Duration (hours)', default=0.5,
        help='Expected duration of the visit')

    # Agent
    agent_id = fields.Many2one(
        'res.users', string='Agent', default=lambda self: self.env.uid,
        tracking=True)

    # Status
    state = fields.Selection([
        ('scheduled', 'Scheduled'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ], string='Status', default='scheduled', tracking=True)

    # Feedback
    visitor_interest = fields.Selection([
        ('very_interested', 'Very Interested'),
        ('interested', 'Interested'),
        ('maybe', 'Maybe'),
        ('not_interested', 'Not Interested'),
    ], string='Interest Level')
    feedback = fields.Text(string='Visitor Feedback')
    agent_notes = fields.Text(string='Agent Notes')

    # Follow-up
    follow_up_date = fields.Date(string='Follow-up Date')
    follow_up_done = fields.Boolean(string='Follow-up Done')

    # Calendar
    calendar_event_id = fields.Many2one(
        'calendar.event', string='Calendar Event', copy=False)

    @api.onchange('time_start', 'duration')
    def _onchange_time(self):
        if self.time_start and self.duration:
            self.time_end = self.time_start + self.duration

    @api.model_create_multi
    def create(self, vals_list):
        visits = super().create(vals_list)
        for visit in visits:
            visit._create_calendar_event()
        return visits

    def _create_calendar_event(self):
        """Create a calendar event for the visit."""
        self.ensure_one()
        if self.calendar_event_id:
            return

        # Convert float time to datetime
        start_hour = int(self.time_start)
        start_minute = int((self.time_start % 1) * 60)
        end_hour = int(self.time_end) if self.time_end else start_hour
        end_minute = int((self.time_end % 1) * 60) if self.time_end else start_minute + 30

        start_datetime = fields.Datetime.to_datetime(self.date).replace(
            hour=start_hour, minute=start_minute)
        end_datetime = fields.Datetime.to_datetime(self.date).replace(
            hour=end_hour, minute=end_minute)

        event = self.env['calendar.event'].create({
            'name': f'Visit: {self.property_id.title}',
            'start': start_datetime,
            'stop': end_datetime,
            'user_id': self.agent_id.id,
            'partner_ids': [(4, self.visitor_id.id)],
            'description': f"""
Property: {self.property_id.title}
Address: {self.property_id.street or ''}, {self.property_id.city}
Visitor: {self.visitor_id.name}
Phone: {self.visitor_phone or ''}
            """.strip(),
        })
        self.calendar_event_id = event

    def action_confirm(self):
        self.write({'state': 'confirmed'})
        # Send confirmation email
        template = self.env.ref(
            'real_estate_agency.email_template_visit_confirmation',
            raise_if_not_found=False)
        if template:
            for visit in self:
                template.send_mail(visit.id)

    def action_complete(self):
        self.write({'state': 'completed'})

    def action_cancel(self):
        for visit in self:
            if visit.calendar_event_id:
                visit.calendar_event_id.unlink()
        self.write({'state': 'cancelled'})

    def action_no_show(self):
        self.write({'state': 'no_show'})

    def action_create_offer(self):
        """Create an offer from this visit."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Create Offer',
            'res_model': 'realestate.offer',
            'view_mode': 'form',
            'context': {
                'default_property_id': self.property_id.id,
                'default_buyer_id': self.visitor_id.id,
            },
        }

    def action_schedule_follow_up(self):
        """Schedule a follow-up activity."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Schedule Follow-up',
            'res_model': 'mail.activity',
            'view_mode': 'form',
            'target': 'new',
            'context': {
                'default_res_model_id': self.env.ref(
                    'real_estate_agency.model_realestate_visit').id,
                'default_res_id': self.id,
                'default_user_id': self.agent_id.id,
                'default_summary': f'Follow-up: {self.visitor_id.name}',
            },
        }
