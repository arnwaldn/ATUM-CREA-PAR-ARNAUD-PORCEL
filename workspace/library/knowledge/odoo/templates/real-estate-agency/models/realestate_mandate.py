# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import ValidationError
from dateutil.relativedelta import relativedelta


class RealestateMandate(models.Model):
    _name = 'realestate.mandate'
    _description = 'Property Mandate'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'create_date desc'

    name = fields.Char(
        string='Reference', required=True, copy=False, readonly=True,
        default=lambda self: self.env['ir.sequence'].next_by_code('realestate.mandate'))

    # Related
    property_id = fields.Many2one(
        'realestate.property', string='Property', required=True, tracking=True)
    owner_id = fields.Many2one(
        'realestate.owner', string='Owner', required=True, tracking=True)

    # Type
    mandate_type = fields.Selection([
        ('simple', 'Simple Mandate'),
        ('exclusive', 'Exclusive Mandate'),
        ('semi_exclusive', 'Semi-Exclusive'),
    ], string='Mandate Type', required=True, default='simple', tracking=True)

    transaction_type = fields.Selection([
        ('sale', 'Sale'),
        ('rent', 'Rental'),
    ], string='Transaction Type', required=True, default='sale')

    # Pricing
    asking_price = fields.Monetary(
        string='Asking Price', currency_field='currency_id', required=True)
    minimum_price = fields.Monetary(
        string='Minimum Acceptable', currency_field='currency_id')
    currency_id = fields.Many2one(
        'res.currency', default=lambda self: self.env.company.currency_id)

    # Commission
    commission_type = fields.Selection([
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    ], string='Commission Type', default='percentage')
    commission_percentage = fields.Float(string='Commission (%)')
    commission_fixed = fields.Monetary(
        string='Fixed Commission', currency_field='currency_id')
    commission_amount = fields.Monetary(
        string='Commission Amount', compute='_compute_commission',
        currency_field='currency_id')
    commission_paid_by = fields.Selection([
        ('seller', 'Seller/Owner'),
        ('buyer', 'Buyer/Tenant'),
        ('both', 'Shared'),
    ], string='Commission Paid By', default='seller')

    # Dates
    date_start = fields.Date(
        string='Start Date', required=True, default=fields.Date.today)
    date_end = fields.Date(string='End Date', required=True)
    duration_months = fields.Integer(
        string='Duration (months)', default=3,
        help='Auto-calculate end date')
    auto_renew = fields.Boolean(string='Auto-Renewal')
    renewal_notice_days = fields.Integer(
        string='Notice Period (days)', default=30)

    # Status
    state = fields.Selection([
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('terminated', 'Terminated'),
        ('completed', 'Completed'),
    ], string='Status', default='draft', tracking=True)

    # Agent
    agent_id = fields.Many2one('res.users', string='Agent', tracking=True)

    # Marketing
    publish_online = fields.Boolean(string='Publish Online', default=True)
    publish_portals = fields.Boolean(string='Publish on Portals', default=True)
    signage_installed = fields.Boolean(string='For Sale Sign Installed')

    # Documents
    mandate_signed = fields.Boolean(string='Mandate Signed')
    document_ids = fields.Many2many('ir.attachment', string='Documents')

    # Results
    visit_count = fields.Integer(compute='_compute_visit_count')
    offer_count = fields.Integer(compute='_compute_offer_count')

    notes = fields.Text(string='Notes')

    @api.depends('asking_price', 'commission_type', 'commission_percentage', 'commission_fixed')
    def _compute_commission(self):
        for mandate in self:
            if mandate.commission_type == 'percentage':
                mandate.commission_amount = (
                    mandate.asking_price * mandate.commission_percentage / 100)
            else:
                mandate.commission_amount = mandate.commission_fixed

    @api.depends('property_id.visit_ids')
    def _compute_visit_count(self):
        for mandate in self:
            mandate.visit_count = len(mandate.property_id.visit_ids.filtered(
                lambda v: v.date >= mandate.date_start and
                (not mandate.date_end or v.date <= mandate.date_end)))

    @api.depends('property_id.offer_ids')
    def _compute_offer_count(self):
        for mandate in self:
            mandate.offer_count = len(mandate.property_id.offer_ids.filtered(
                lambda o: o.create_date.date() >= mandate.date_start and
                (not mandate.date_end or o.create_date.date() <= mandate.date_end)))

    @api.onchange('duration_months', 'date_start')
    def _onchange_duration(self):
        if self.date_start and self.duration_months:
            self.date_end = self.date_start + relativedelta(
                months=self.duration_months)

    @api.constrains('date_start', 'date_end')
    def _check_dates(self):
        for mandate in self:
            if mandate.date_end and mandate.date_start > mandate.date_end:
                raise ValidationError('End date must be after start date.')

    def action_activate(self):
        self.write({'state': 'active'})
        # Update property status
        self.property_id.write({'state': 'available'})

    def action_terminate(self):
        self.write({'state': 'terminated'})

    def action_complete(self):
        self.write({'state': 'completed'})

    def action_expire(self):
        self.write({'state': 'expired'})

    @api.model
    def _cron_check_expiry(self):
        """Check for expired mandates."""
        today = fields.Date.today()
        expired = self.search([
            ('state', '=', 'active'),
            ('date_end', '<', today),
            ('auto_renew', '=', False),
        ])
        expired.write({'state': 'expired'})

        # Handle auto-renewal
        to_renew = self.search([
            ('state', '=', 'active'),
            ('date_end', '<', today),
            ('auto_renew', '=', True),
        ])
        for mandate in to_renew:
            mandate.write({
                'date_start': mandate.date_end,
                'date_end': mandate.date_end + relativedelta(
                    months=mandate.duration_months),
            })
