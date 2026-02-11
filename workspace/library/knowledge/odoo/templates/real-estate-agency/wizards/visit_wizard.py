# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import ValidationError


class RealestateVisitWizard(models.TransientModel):
    _name = 'realestate.visit.wizard'
    _description = 'Schedule Visit Wizard'

    property_id = fields.Many2one(
        'realestate.property', string='Property', required=True)
    visitor_id = fields.Many2one(
        'res.partner', string='Visitor', required=True)
    visitor_name = fields.Char(string='Visitor Name')
    visitor_phone = fields.Char(string='Phone')
    visitor_email = fields.Char(string='Email')
    create_visitor = fields.Boolean(string='Create New Visitor')

    date = fields.Date(string='Date', required=True, default=fields.Date.today)
    time_slot = fields.Selection(
        selection='_get_time_slots', string='Time Slot', required=True)
    duration = fields.Float(string='Duration (hours)', default=0.5)
    agent_id = fields.Many2one(
        'res.users', string='Agent', default=lambda self: self.env.uid)

    notes = fields.Text(string='Notes')

    @api.model
    def _get_time_slots(self):
        slots = []
        for hour in range(9, 19):
            for minute in [0, 30]:
                time_str = f"{hour:02d}:{minute:02d}"
                slots.append((time_str, time_str))
        return slots

    @api.onchange('create_visitor')
    def _onchange_create_visitor(self):
        if self.create_visitor:
            self.visitor_id = False
        else:
            self.visitor_name = False
            self.visitor_phone = False
            self.visitor_email = False

    def action_schedule_visit(self):
        self.ensure_one()

        # Create visitor if needed
        if self.create_visitor:
            if not self.visitor_name:
                raise ValidationError('Please enter the visitor name.')
            visitor = self.env['res.partner'].create({
                'name': self.visitor_name,
                'phone': self.visitor_phone,
                'email': self.visitor_email,
            })
            visitor_id = visitor.id
        else:
            visitor_id = self.visitor_id.id

        # Parse time
        hour, minute = map(int, self.time_slot.split(':'))
        time_start = hour + minute / 60

        # Create visit
        visit = self.env['realestate.visit'].create({
            'property_id': self.property_id.id,
            'visitor_id': visitor_id,
            'date': self.date,
            'time_start': time_start,
            'duration': self.duration,
            'agent_id': self.agent_id.id,
        })

        return {
            'type': 'ir.actions.act_window',
            'res_model': 'realestate.visit',
            'res_id': visit.id,
            'view_mode': 'form',
        }
