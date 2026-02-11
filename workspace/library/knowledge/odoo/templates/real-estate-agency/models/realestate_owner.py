# -*- coding: utf-8 -*-
from odoo import models, fields, api


class RealestateOwner(models.Model):
    _name = 'realestate.owner'
    _description = 'Property Owner'
    _inherits = {'res.partner': 'partner_id'}
    _inherit = ['mail.thread', 'mail.activity.mixin']

    partner_id = fields.Many2one(
        'res.partner', string='Contact', required=True,
        ondelete='restrict', auto_join=True)

    owner_type = fields.Selection([
        ('individual', 'Individual'),
        ('company', 'Company'),
        ('estate', 'Estate'),
        ('institution', 'Institution'),
    ], string='Owner Type', default='individual')

    # Properties
    property_ids = fields.One2many(
        'realestate.property', 'owner_id', string='Properties')
    property_count = fields.Integer(compute='_compute_property_count')

    # Mandates
    mandate_ids = fields.One2many(
        'realestate.mandate', 'owner_id', string='Mandates')
    mandate_count = fields.Integer(compute='_compute_mandate_count')

    # Banking
    bank_account = fields.Char(string='Bank Account (IBAN)')
    bic = fields.Char(string='BIC/SWIFT')

    # Tax info
    tax_id = fields.Char(string='Tax ID')

    # Preferences
    preferred_contact = fields.Selection([
        ('email', 'Email'),
        ('phone', 'Phone'),
        ('mail', 'Postal Mail'),
    ], string='Preferred Contact Method', default='email')
    notes = fields.Text(string='Notes')

    active = fields.Boolean(default=True)

    @api.depends('property_ids')
    def _compute_property_count(self):
        for owner in self:
            owner.property_count = len(owner.property_ids)

    @api.depends('mandate_ids')
    def _compute_mandate_count(self):
        for owner in self:
            owner.mandate_count = len(owner.mandate_ids)

    def action_view_properties(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Properties',
            'res_model': 'realestate.property',
            'view_mode': 'kanban,tree,form',
            'domain': [('owner_id', '=', self.id)],
            'context': {'default_owner_id': self.id},
        }


class RealestateTenant(models.Model):
    _name = 'realestate.tenant'
    _description = 'Tenant'
    _inherits = {'res.partner': 'partner_id'}
    _inherit = ['mail.thread', 'mail.activity.mixin']

    partner_id = fields.Many2one(
        'res.partner', string='Contact', required=True,
        ondelete='restrict', auto_join=True)

    # Employment
    employer = fields.Char(string='Employer')
    profession = fields.Char(string='Profession')
    monthly_income = fields.Monetary(
        string='Monthly Income', currency_field='currency_id')
    currency_id = fields.Many2one(
        'res.currency', default=lambda self: self.env.company.currency_id)

    # References
    guarantor_name = fields.Char(string='Guarantor Name')
    guarantor_phone = fields.Char(string='Guarantor Phone')
    guarantor_address = fields.Text(string='Guarantor Address')

    # Documents
    has_id_copy = fields.Boolean(string='ID Copy Provided')
    has_income_proof = fields.Boolean(string='Income Proof Provided')
    has_employer_letter = fields.Boolean(string='Employer Letter Provided')

    # Leases
    lease_ids = fields.One2many(
        'realestate.lease', 'tenant_id', string='Leases')
    current_lease_id = fields.Many2one(
        'realestate.lease', string='Current Lease',
        compute='_compute_current_lease')

    notes = fields.Text(string='Notes')
    active = fields.Boolean(default=True)

    @api.depends('lease_ids', 'lease_ids.state')
    def _compute_current_lease(self):
        for tenant in self:
            active_lease = tenant.lease_ids.filtered(
                lambda l: l.state == 'active')[:1]
            tenant.current_lease_id = active_lease.id if active_lease else False
