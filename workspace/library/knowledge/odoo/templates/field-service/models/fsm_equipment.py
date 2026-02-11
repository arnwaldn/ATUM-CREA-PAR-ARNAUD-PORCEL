# -*- coding: utf-8 -*-
from odoo import models, fields, api


class FsmEquipment(models.Model):
    _name = 'fsm.equipment'
    _description = 'Customer Equipment'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'name'

    name = fields.Char(string='Equipment Name', required=True, tracking=True)
    reference = fields.Char(
        string='Reference', required=True, copy=False, readonly=True,
        default=lambda self: self.env['ir.sequence'].next_by_code('fsm.equipment'))

    # Customer
    partner_id = fields.Many2one(
        'res.partner', string='Customer', required=True, tracking=True)

    # Equipment Details
    equipment_type_id = fields.Many2one(
        'fsm.equipment.type', string='Type', tracking=True)
    brand = fields.Char(string='Brand')
    model = fields.Char(string='Model')
    serial_number = fields.Char(string='Serial Number', tracking=True)

    # Installation
    installation_date = fields.Date(string='Installation Date')
    warranty_expiry = fields.Date(string='Warranty Expiry')
    is_under_warranty = fields.Boolean(
        string='Under Warranty', compute='_compute_warranty')

    # Location
    location_street = fields.Char(string='Street')
    location_city = fields.Char(string='City')
    location_zip = fields.Char(string='Zip')
    location_notes = fields.Text(string='Location Notes',
                                  help='Floor, access code, contact person...')
    latitude = fields.Float(string='Latitude')
    longitude = fields.Float(string='Longitude')

    # Contract
    contract_id = fields.Many2one(
        'fsm.contract', string='Service Contract')
    contract_state = fields.Selection(
        related='contract_id.state', string='Contract Status')

    # Maintenance
    last_maintenance_date = fields.Date(string='Last Maintenance')
    next_maintenance_date = fields.Date(
        string='Next Maintenance', compute='_compute_next_maintenance',
        store=True)
    maintenance_interval_months = fields.Integer(
        string='Maintenance Interval (months)', default=12)

    # Status
    state = fields.Selection([
        ('operational', 'Operational'),
        ('maintenance', 'Under Maintenance'),
        ('broken', 'Broken'),
        ('decommissioned', 'Decommissioned'),
    ], string='Status', default='operational', tracking=True)

    # Interventions
    intervention_ids = fields.One2many(
        'fsm.intervention', 'equipment_id', string='Interventions')
    intervention_count = fields.Integer(compute='_compute_intervention_count')

    # Technical specs
    specifications = fields.Text(string='Technical Specifications')
    notes = fields.Text(string='Notes')
    document_ids = fields.Many2many('ir.attachment', string='Documents')

    active = fields.Boolean(default=True)

    @api.depends('warranty_expiry')
    def _compute_warranty(self):
        today = fields.Date.today()
        for equip in self:
            equip.is_under_warranty = (
                equip.warranty_expiry and equip.warranty_expiry >= today)

    @api.depends('last_maintenance_date', 'maintenance_interval_months')
    def _compute_next_maintenance(self):
        for equip in self:
            if equip.last_maintenance_date and equip.maintenance_interval_months:
                equip.next_maintenance_date = fields.Date.add(
                    equip.last_maintenance_date,
                    months=equip.maintenance_interval_months)
            else:
                equip.next_maintenance_date = False

    @api.depends('intervention_ids')
    def _compute_intervention_count(self):
        for equip in self:
            equip.intervention_count = len(equip.intervention_ids)

    def action_view_interventions(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Interventions',
            'res_model': 'fsm.intervention',
            'view_mode': 'tree,form',
            'domain': [('equipment_id', '=', self.id)],
            'context': {
                'default_equipment_id': self.id,
                'default_partner_id': self.partner_id.id,
            },
        }

    def action_create_intervention(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'New Intervention',
            'res_model': 'fsm.intervention',
            'view_mode': 'form',
            'context': {
                'default_equipment_id': self.id,
                'default_partner_id': self.partner_id.id,
            },
        }


class FsmEquipmentType(models.Model):
    _name = 'fsm.equipment.type'
    _description = 'Equipment Type'
    _order = 'name'

    name = fields.Char(string='Type Name', required=True, translate=True)
    code = fields.Char(string='Code')
    description = fields.Text(string='Description')
    default_maintenance_interval = fields.Integer(
        string='Default Maintenance Interval (months)', default=12)
    required_skills = fields.Many2many(
        'fsm.skill', string='Required Skills')
    active = fields.Boolean(default=True)
