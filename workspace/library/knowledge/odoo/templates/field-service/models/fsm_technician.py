# -*- coding: utf-8 -*-
from odoo import models, fields, api


class FsmTechnician(models.Model):
    _name = 'fsm.technician'
    _description = 'Field Service Technician'
    _inherits = {'hr.employee': 'employee_id'}
    _inherit = ['mail.thread', 'mail.activity.mixin']

    employee_id = fields.Many2one(
        'hr.employee', string='Employee', required=True,
        ondelete='restrict', auto_join=True)

    # Skills
    skill_ids = fields.Many2many(
        'fsm.skill', string='Skills')
    certification_ids = fields.One2many(
        'fsm.technician.certification', 'technician_id',
        string='Certifications')

    # Availability
    available = fields.Boolean(
        string='Available', default=True, tracking=True)
    availability_status = fields.Selection([
        ('available', 'Available'),
        ('on_intervention', 'On Intervention'),
        ('on_break', 'On Break'),
        ('off_duty', 'Off Duty'),
        ('sick', 'Sick Leave'),
        ('vacation', 'Vacation'),
    ], string='Status', default='available', tracking=True)

    # Location
    current_latitude = fields.Float(string='Current Latitude')
    current_longitude = fields.Float(string='Current Longitude')
    last_location_update = fields.Datetime(string='Last Location Update')
    home_latitude = fields.Float(string='Home Latitude')
    home_longitude = fields.Float(string='Home Longitude')

    # Vehicle
    vehicle_id = fields.Many2one('fleet.vehicle', string='Assigned Vehicle')
    vehicle_registration = fields.Char(string='Vehicle Registration')

    # Statistics
    intervention_ids = fields.One2many(
        'fsm.intervention', 'technician_id', string='Interventions')
    intervention_count = fields.Integer(compute='_compute_stats')
    avg_rating = fields.Float(
        string='Average Rating', compute='_compute_stats')
    completed_today = fields.Integer(compute='_compute_stats')

    # Calendar
    calendar_id = fields.Many2one('resource.calendar', string='Working Hours')

    notes = fields.Text(string='Notes')
    active = fields.Boolean(default=True)

    @api.depends('intervention_ids', 'intervention_ids.state',
                 'intervention_ids.customer_rating')
    def _compute_stats(self):
        today = fields.Date.today()
        for tech in self:
            interventions = tech.intervention_ids
            tech.intervention_count = len(interventions)

            completed_today = interventions.filtered(
                lambda i: i.state == 'done' and
                i.completion_date and i.completion_date.date() == today)
            tech.completed_today = len(completed_today)

            rated = interventions.filtered('customer_rating')
            if rated:
                tech.avg_rating = sum(
                    int(r.customer_rating) for r in rated) / len(rated)
            else:
                tech.avg_rating = 0

    def action_set_available(self):
        self.write({
            'available': True,
            'availability_status': 'available',
        })

    def action_set_on_break(self):
        self.write({
            'available': False,
            'availability_status': 'on_break',
        })

    def action_view_interventions(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Interventions',
            'res_model': 'fsm.intervention',
            'view_mode': 'tree,form,calendar',
            'domain': [('technician_id', '=', self.id)],
            'context': {'default_technician_id': self.id},
        }

    def action_view_today_schedule(self):
        self.ensure_one()
        today = fields.Date.today()
        return {
            'type': 'ir.actions.act_window',
            'name': "Today's Schedule",
            'res_model': 'fsm.intervention',
            'view_mode': 'tree,form',
            'domain': [
                ('technician_id', '=', self.id),
                ('scheduled_date', '>=', today),
                ('scheduled_date', '<', fields.Date.add(today, days=1)),
            ],
        }


class FsmTechnicianCertification(models.Model):
    _name = 'fsm.technician.certification'
    _description = 'Technician Certification'
    _order = 'expiry_date'

    technician_id = fields.Many2one(
        'fsm.technician', string='Technician', required=True, ondelete='cascade')
    skill_id = fields.Many2one(
        'fsm.skill', string='Certification/Skill', required=True,
        domain=[('requires_certification', '=', True)])
    certification_number = fields.Char(string='Certificate Number')
    issue_date = fields.Date(string='Issue Date', required=True)
    expiry_date = fields.Date(string='Expiry Date')
    issuing_authority = fields.Char(string='Issuing Authority')
    document = fields.Binary(string='Certificate Document')
    document_filename = fields.Char(string='Document Filename')
    is_valid = fields.Boolean(
        string='Valid', compute='_compute_is_valid', store=True)

    @api.depends('expiry_date')
    def _compute_is_valid(self):
        today = fields.Date.today()
        for cert in self:
            cert.is_valid = not cert.expiry_date or cert.expiry_date >= today
