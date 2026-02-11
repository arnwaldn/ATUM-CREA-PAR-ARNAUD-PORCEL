# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import UserError
from datetime import date
from dateutil.relativedelta import relativedelta


class AssociationMembership(models.Model):
    """Membership subscription management"""
    _name = 'association.membership'
    _description = 'Membership Subscription'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'date_start desc'

    name = fields.Char(
        string='Reference',
        required=True,
        readonly=True,
        default='New',
        copy=False,
    )
    member_id = fields.Many2one(
        'association.member',
        string='Member',
        required=True,
        ondelete='cascade',
    )
    member_type_id = fields.Many2one(
        'association.member.type',
        string='Membership Type',
        required=True,
    )
    state = fields.Selection([
        ('draft', 'Draft'),
        ('pending_payment', 'Pending Payment'),
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ], string='Status', default='draft', required=True, tracking=True)

    # Dates
    date_start = fields.Date(
        string='Start Date',
        required=True,
        default=fields.Date.today,
    )
    date_end = fields.Date(
        string='End Date',
        compute='_compute_date_end',
        store=True,
    )
    duration_months = fields.Integer(
        string='Duration (months)',
        default=12,
    )

    # Payment
    amount = fields.Monetary(
        string='Amount',
        tracking=True,
    )
    currency_id = fields.Many2one(
        'res.currency',
        default=lambda self: self.env.company.currency_id,
    )
    payment_state = fields.Selection([
        ('not_paid', 'Not Paid'),
        ('partial', 'Partially Paid'),
        ('paid', 'Paid'),
    ], string='Payment Status', default='not_paid', tracking=True)
    payment_date = fields.Date(
        string='Payment Date',
    )
    payment_method = fields.Selection([
        ('cash', 'Cash'),
        ('bank_transfer', 'Bank Transfer'),
        ('check', 'Check'),
        ('card', 'Credit Card'),
        ('online', 'Online Payment'),
    ], string='Payment Method')
    payment_reference = fields.Char(
        string='Payment Reference',
    )
    invoice_id = fields.Many2one(
        'account.move',
        string='Invoice',
        readonly=True,
    )

    # Renewal
    is_renewal = fields.Boolean(
        string='Is Renewal',
        default=False,
    )
    previous_membership_id = fields.Many2one(
        'association.membership',
        string='Previous Membership',
    )

    notes = fields.Text(
        string='Notes',
    )
    company_id = fields.Many2one(
        'res.company',
        string='Company',
        required=True,
        default=lambda self: self.env.company,
    )

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', 'New') == 'New':
                vals['name'] = self.env['ir.sequence'].next_by_code('association.membership') or 'New'
        return super().create(vals_list)

    @api.depends('date_start', 'duration_months')
    def _compute_date_end(self):
        for membership in self:
            if membership.date_start and membership.duration_months:
                membership.date_end = membership.date_start + relativedelta(
                    months=membership.duration_months
                ) - relativedelta(days=1)
            else:
                membership.date_end = False

    @api.onchange('member_type_id')
    def _onchange_member_type_id(self):
        if self.member_type_id:
            self.amount = self.member_type_id.annual_fee
            self.duration_months = self.member_type_id.duration_months

    def action_confirm(self):
        """Confirm membership (pending payment)"""
        self.write({'state': 'pending_payment'})

    def action_pay(self):
        """Mark as paid and activate"""
        for membership in self:
            membership.write({
                'state': 'active',
                'payment_state': 'paid',
                'payment_date': fields.Date.today(),
            })
            # Update member
            membership.member_id.write({
                'state': 'active',
                'membership_start': membership.date_start,
                'membership_end': membership.date_end,
                'member_type_id': membership.member_type_id.id,
            })

    def action_create_invoice(self):
        """Create invoice for membership"""
        self.ensure_one()
        if self.invoice_id:
            raise UserError(_('Invoice already exists.'))

        invoice_vals = {
            'move_type': 'out_invoice',
            'partner_id': self.member_id.partner_id.id,
            'invoice_origin': self.name,
            'invoice_line_ids': [(0, 0, {
                'name': _('Membership: %s - %s') % (
                    self.member_type_id.name,
                    self.member_id.name
                ),
                'quantity': 1,
                'price_unit': self.amount,
            })],
        }
        invoice = self.env['account.move'].create(invoice_vals)
        self.invoice_id = invoice
        self.state = 'pending_payment'

        return {
            'type': 'ir.actions.act_window',
            'name': _('Invoice'),
            'res_model': 'account.move',
            'res_id': invoice.id,
            'view_mode': 'form',
        }

    def action_cancel(self):
        """Cancel membership"""
        self.write({'state': 'cancelled'})

    @api.model
    def _cron_check_expiry(self):
        """Check for expired memberships"""
        today = date.today()

        # Find memberships expiring today
        expiring = self.search([
            ('state', '=', 'active'),
            ('date_end', '=', today),
        ])
        for membership in expiring:
            membership.write({'state': 'expired'})
            membership.member_id.write({'state': 'expired'})

        # Send renewal reminders (30 days before expiry)
        reminder_date = today + relativedelta(days=30)
        to_remind = self.search([
            ('state', '=', 'active'),
            ('date_end', '=', reminder_date),
        ])
        for membership in to_remind:
            template = self.env.ref('event_association.mail_template_membership_renewal',
                                    raise_if_not_found=False)
            if template:
                template.send_mail(membership.id, force_send=True)
