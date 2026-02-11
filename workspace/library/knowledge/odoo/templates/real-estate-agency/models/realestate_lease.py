# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import ValidationError
from dateutil.relativedelta import relativedelta


class RealestateLease(models.Model):
    _name = 'realestate.lease'
    _description = 'Rental Lease'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'date_start desc'

    name = fields.Char(
        string='Reference', required=True, copy=False, readonly=True,
        default=lambda self: self.env['ir.sequence'].next_by_code('realestate.lease'))

    # Property & Parties
    property_id = fields.Many2one(
        'realestate.property', string='Property', required=True, tracking=True)
    owner_id = fields.Many2one(
        related='property_id.owner_id', string='Owner', store=True)
    tenant_id = fields.Many2one(
        'realestate.tenant', string='Tenant', required=True, tracking=True)

    # Lease Type
    lease_type = fields.Selection([
        ('unfurnished', 'Unfurnished (3 years)'),
        ('furnished', 'Furnished (1 year)'),
        ('mobility', 'Mobility Lease'),
        ('student', 'Student Lease'),
        ('professional', 'Professional Lease'),
        ('commercial', 'Commercial Lease'),
    ], string='Lease Type', required=True, default='unfurnished')

    # Dates
    date_start = fields.Date(
        string='Start Date', required=True, tracking=True)
    date_end = fields.Date(
        string='End Date', required=True, tracking=True)
    duration_months = fields.Integer(
        string='Duration (months)', compute='_compute_duration', store=True)
    notice_period = fields.Integer(
        string='Notice Period (months)', default=3)

    # Rent
    rent_amount = fields.Monetary(
        string='Monthly Rent', currency_field='currency_id',
        required=True, tracking=True)
    charges_amount = fields.Monetary(
        string='Monthly Charges', currency_field='currency_id')
    total_monthly = fields.Monetary(
        string='Total Monthly', compute='_compute_total',
        currency_field='currency_id')
    currency_id = fields.Many2one(
        'res.currency', default=lambda self: self.env.company.currency_id)

    # Deposit
    deposit_amount = fields.Monetary(
        string='Security Deposit', currency_field='currency_id')
    deposit_received = fields.Boolean(string='Deposit Received')
    deposit_date = fields.Date(string='Deposit Received Date')

    # Rent Review
    rent_review_type = fields.Selection([
        ('none', 'No Review'),
        ('irl', 'IRL Index'),
        ('ilc', 'ILC Index'),
        ('fixed', 'Fixed Percentage'),
    ], string='Rent Review', default='irl')
    rent_review_percentage = fields.Float(string='Review Percentage')
    rent_review_date = fields.Date(string='Next Review Date')
    last_review_date = fields.Date(string='Last Review Date')

    # Payment
    payment_day = fields.Integer(
        string='Payment Due Day', default=5,
        help='Day of month when rent is due')
    payment_method = fields.Selection([
        ('transfer', 'Bank Transfer'),
        ('check', 'Check'),
        ('direct_debit', 'Direct Debit'),
        ('cash', 'Cash'),
    ], string='Payment Method', default='transfer')

    # State
    state = fields.Selection([
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('notice', 'Notice Given'),
        ('ended', 'Ended'),
        ('renewed', 'Renewed'),
    ], string='Status', default='draft', tracking=True)

    # Inventory
    inventory_in_date = fields.Date(string='Move-in Inventory Date')
    inventory_in_done = fields.Boolean(string='Move-in Inventory Done')
    inventory_out_date = fields.Date(string='Move-out Inventory Date')
    inventory_out_done = fields.Boolean(string='Move-out Inventory Done')

    # Documents
    document_ids = fields.Many2many('ir.attachment', string='Documents')
    lease_signed = fields.Boolean(string='Lease Signed')

    # Rent Payments
    payment_ids = fields.One2many(
        'realestate.lease.payment', 'lease_id', string='Payments')
    balance = fields.Monetary(
        string='Balance', compute='_compute_balance',
        currency_field='currency_id')

    # Agent
    agent_id = fields.Many2one('res.users', string='Agent')

    notes = fields.Text(string='Notes')

    @api.depends('date_start', 'date_end')
    def _compute_duration(self):
        for lease in self:
            if lease.date_start and lease.date_end:
                delta = relativedelta(lease.date_end, lease.date_start)
                lease.duration_months = delta.years * 12 + delta.months
            else:
                lease.duration_months = 0

    @api.depends('rent_amount', 'charges_amount')
    def _compute_total(self):
        for lease in self:
            lease.total_monthly = lease.rent_amount + lease.charges_amount

    @api.depends('payment_ids.amount', 'payment_ids.state')
    def _compute_balance(self):
        for lease in self:
            paid = sum(lease.payment_ids.filtered(
                lambda p: p.state == 'paid').mapped('amount'))
            # Calculate expected rent
            if lease.date_start:
                today = fields.Date.today()
                months = 0
                current = lease.date_start
                while current <= min(today, lease.date_end or today):
                    months += 1
                    current += relativedelta(months=1)
                expected = months * lease.total_monthly
                lease.balance = paid - expected
            else:
                lease.balance = 0

    @api.constrains('date_start', 'date_end')
    def _check_dates(self):
        for lease in self:
            if lease.date_end <= lease.date_start:
                raise ValidationError('End date must be after start date.')

    @api.onchange('lease_type', 'date_start')
    def _onchange_lease_type(self):
        if self.date_start and self.lease_type:
            durations = {
                'unfurnished': 36,
                'furnished': 12,
                'mobility': 10,
                'student': 9,
                'professional': 24,
                'commercial': 108,  # 9 years
            }
            months = durations.get(self.lease_type, 12)
            self.date_end = self.date_start + relativedelta(months=months)

    def action_activate(self):
        for lease in self:
            if not lease.lease_signed:
                raise ValidationError('Lease must be signed before activation.')
            if not lease.deposit_received:
                raise ValidationError('Deposit must be received before activation.')
        self.write({'state': 'active'})
        # Update property status
        self.property_id.write({'state': 'rented'})

    def action_give_notice(self):
        self.write({'state': 'notice'})

    def action_end(self):
        self.write({'state': 'ended'})
        self.property_id.write({'state': 'available'})

    def action_renew(self):
        self.ensure_one()
        new_lease = self.copy({
            'date_start': self.date_end,
            'date_end': self.date_end + relativedelta(months=self.duration_months),
            'state': 'draft',
            'deposit_received': True,  # Keep deposit
            'deposit_date': self.deposit_date,
            'lease_signed': False,
            'inventory_in_done': False,
            'inventory_out_done': False,
        })
        self.write({'state': 'renewed'})
        return {
            'type': 'ir.actions.act_window',
            'res_model': 'realestate.lease',
            'res_id': new_lease.id,
            'view_mode': 'form',
        }

    def action_generate_rent_invoice(self):
        """Generate monthly rent invoice."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Generate Invoice',
            'res_model': 'realestate.rent.invoice.wizard',
            'view_mode': 'form',
            'target': 'new',
            'context': {'default_lease_id': self.id},
        }


class RealestateLeasePayment(models.Model):
    _name = 'realestate.lease.payment'
    _description = 'Lease Payment'
    _order = 'date desc'

    lease_id = fields.Many2one(
        'realestate.lease', string='Lease', required=True, ondelete='cascade')
    date = fields.Date(string='Payment Date', required=True)
    period_start = fields.Date(string='Period Start')
    period_end = fields.Date(string='Period End')
    amount = fields.Monetary(
        string='Amount', currency_field='currency_id', required=True)
    currency_id = fields.Many2one(
        related='lease_id.currency_id', store=True)
    payment_type = fields.Selection([
        ('rent', 'Rent'),
        ('charges', 'Charges'),
        ('deposit', 'Deposit'),
        ('regularization', 'Regularization'),
        ('other', 'Other'),
    ], string='Type', default='rent', required=True)
    state = fields.Selection([
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('late', 'Late'),
    ], string='Status', default='pending')
    invoice_id = fields.Many2one('account.move', string='Invoice')
    notes = fields.Char(string='Notes')
