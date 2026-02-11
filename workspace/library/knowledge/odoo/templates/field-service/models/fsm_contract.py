# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import ValidationError
from dateutil.relativedelta import relativedelta


class FsmContract(models.Model):
    _name = 'fsm.contract'
    _description = 'Service Contract'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'date_start desc'

    name = fields.Char(
        string='Reference', required=True, copy=False, readonly=True,
        default=lambda self: self.env['ir.sequence'].next_by_code('fsm.contract'))

    # Customer
    partner_id = fields.Many2one(
        'res.partner', string='Customer', required=True, tracking=True)

    # Contract Type
    contract_type = fields.Selection([
        ('maintenance', 'Maintenance Contract'),
        ('support', 'Support Contract'),
        ('warranty', 'Extended Warranty'),
        ('full', 'Full Service'),
    ], string='Contract Type', required=True, default='maintenance')

    # Dates
    date_start = fields.Date(
        string='Start Date', required=True, tracking=True)
    date_end = fields.Date(
        string='End Date', required=True, tracking=True)
    duration_months = fields.Integer(
        string='Duration (months)', default=12)

    # Coverage
    coverage_level = fields.Selection([
        ('basic', 'Basic'),
        ('standard', 'Standard'),
        ('premium', 'Premium'),
    ], string='Coverage Level', default='standard')

    # Included Services
    max_interventions = fields.Integer(
        string='Max Interventions/Year',
        help='0 = Unlimited')
    interventions_used = fields.Integer(
        string='Interventions Used', compute='_compute_interventions_used')
    interventions_remaining = fields.Integer(
        string='Remaining', compute='_compute_interventions_used')
    includes_parts = fields.Boolean(string='Parts Included')
    parts_coverage_percent = fields.Float(
        string='Parts Coverage (%)', default=100)
    includes_labor = fields.Boolean(string='Labor Included', default=True)
    response_time_hours = fields.Float(
        string='Response Time (hours)', default=24)
    preventive_visits = fields.Integer(
        string='Preventive Visits/Year', default=2)

    # Equipment
    equipment_ids = fields.One2many(
        'fsm.equipment', 'contract_id', string='Covered Equipment')
    equipment_count = fields.Integer(compute='_compute_equipment_count')

    # Pricing
    price_monthly = fields.Monetary(
        string='Monthly Price', currency_field='currency_id')
    price_annual = fields.Monetary(
        string='Annual Price', compute='_compute_annual_price',
        currency_field='currency_id')
    currency_id = fields.Many2one(
        'res.currency', default=lambda self: self.env.company.currency_id)

    # Billing
    billing_frequency = fields.Selection([
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('annually', 'Annually'),
    ], string='Billing Frequency', default='annually')
    next_invoice_date = fields.Date(string='Next Invoice Date')

    # Status
    state = fields.Selection([
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ], string='Status', default='draft', tracking=True)

    # Renewal
    auto_renew = fields.Boolean(string='Auto-Renewal', default=True)
    renewal_notice_days = fields.Integer(
        string='Renewal Notice (days)', default=30)

    # Interventions
    intervention_ids = fields.One2many(
        'fsm.intervention', 'contract_id', string='Interventions')

    # Documents
    document_ids = fields.Many2many('ir.attachment', string='Documents')
    terms_accepted = fields.Boolean(string='Terms Accepted')

    notes = fields.Text(string='Notes')

    @api.depends('equipment_ids')
    def _compute_equipment_count(self):
        for contract in self:
            contract.equipment_count = len(contract.equipment_ids)

    @api.depends('price_monthly')
    def _compute_annual_price(self):
        for contract in self:
            contract.price_annual = contract.price_monthly * 12

    @api.depends('intervention_ids', 'max_interventions')
    def _compute_interventions_used(self):
        for contract in self:
            # Count interventions in current period
            today = fields.Date.today()
            year_start = today.replace(month=1, day=1)
            used = len(contract.intervention_ids.filtered(
                lambda i: i.state == 'done' and
                i.completion_date and
                i.completion_date.date() >= year_start))
            contract.interventions_used = used
            if contract.max_interventions:
                contract.interventions_remaining = max(
                    0, contract.max_interventions - used)
            else:
                contract.interventions_remaining = -1  # Unlimited

    @api.constrains('date_start', 'date_end')
    def _check_dates(self):
        for contract in self:
            if contract.date_end <= contract.date_start:
                raise ValidationError('End date must be after start date.')

    @api.onchange('duration_months', 'date_start')
    def _onchange_duration(self):
        if self.date_start and self.duration_months:
            self.date_end = self.date_start + relativedelta(
                months=self.duration_months)

    def action_activate(self):
        for contract in self:
            if not contract.terms_accepted:
                raise ValidationError('Terms must be accepted.')
        self.write({'state': 'active'})

    def action_suspend(self):
        self.write({'state': 'suspended'})

    def action_expire(self):
        self.write({'state': 'expired'})

    def action_cancel(self):
        self.write({'state': 'cancelled'})

    def action_renew(self):
        self.ensure_one()
        new_contract = self.copy({
            'date_start': self.date_end,
            'date_end': self.date_end + relativedelta(months=self.duration_months),
            'state': 'draft',
            'terms_accepted': False,
        })
        return {
            'type': 'ir.actions.act_window',
            'res_model': 'fsm.contract',
            'res_id': new_contract.id,
            'view_mode': 'form',
        }

    def action_view_equipment(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Equipment',
            'res_model': 'fsm.equipment',
            'view_mode': 'tree,form',
            'domain': [('contract_id', '=', self.id)],
            'context': {
                'default_contract_id': self.id,
                'default_partner_id': self.partner_id.id,
            },
        }

    @api.model
    def _cron_check_expiry(self):
        """Check for expiring contracts."""
        today = fields.Date.today()

        # Expire contracts
        expired = self.search([
            ('state', '=', 'active'),
            ('date_end', '<', today),
            ('auto_renew', '=', False),
        ])
        expired.write({'state': 'expired'})

        # Auto-renew contracts
        to_renew = self.search([
            ('state', '=', 'active'),
            ('date_end', '<', today),
            ('auto_renew', '=', True),
        ])
        for contract in to_renew:
            contract.write({
                'date_start': contract.date_end,
                'date_end': contract.date_end + relativedelta(
                    months=contract.duration_months),
            })

        # Send renewal reminders
        reminder_date = today + relativedelta(
            days=30)  # Default reminder period
        upcoming = self.search([
            ('state', '=', 'active'),
            ('date_end', '<=', reminder_date),
            ('date_end', '>', today),
        ])
        for contract in upcoming:
            contract.activity_schedule(
                'mail.mail_activity_data_todo',
                date_deadline=contract.date_end - relativedelta(
                    days=contract.renewal_notice_days),
                summary=f'Contract {contract.name} expiring soon',
            )
