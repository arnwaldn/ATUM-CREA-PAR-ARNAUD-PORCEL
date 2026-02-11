# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import UserError


class RestaurantOrderPaymentWizard(models.TransientModel):
    """Wizard to process order payment"""
    _name = 'restaurant.order.payment.wizard'
    _description = 'Order Payment Wizard'

    order_id = fields.Many2one(
        'restaurant.order',
        string='Order',
        required=True,
    )
    amount_due = fields.Monetary(
        string='Amount Due',
        related='order_id.amount_due',
    )
    payment_method = fields.Selection([
        ('cash', 'Cash'),
        ('card', 'Credit/Debit Card'),
        ('mobile', 'Mobile Payment'),
        ('voucher', 'Voucher'),
        ('split', 'Split Payment'),
    ], string='Payment Method', required=True, default='cash')
    amount = fields.Monetary(
        string='Amount',
        required=True,
    )
    tip_amount = fields.Monetary(
        string='Tip',
    )
    tendered = fields.Monetary(
        string='Cash Tendered',
        help='Amount given by customer (for cash payments)',
    )
    change = fields.Monetary(
        string='Change',
        compute='_compute_change',
    )
    reference = fields.Char(
        string='Reference',
    )
    currency_id = fields.Many2one(
        'res.currency',
        default=lambda self: self.env.company.currency_id,
    )

    # Split payment fields
    split_type = fields.Selection([
        ('equal', 'Equal Split'),
        ('custom', 'Custom Amounts'),
        ('items', 'By Items'),
    ], string='Split Type', default='equal')
    split_count = fields.Integer(
        string='Number of People',
        default=2,
    )
    split_amount = fields.Monetary(
        string='Amount per Person',
        compute='_compute_split_amount',
    )

    @api.depends('tendered', 'amount')
    def _compute_change(self):
        for wizard in self:
            if wizard.payment_method == 'cash' and wizard.tendered:
                wizard.change = max(0, wizard.tendered - wizard.amount)
            else:
                wizard.change = 0

    @api.depends('amount_due', 'split_count')
    def _compute_split_amount(self):
        for wizard in self:
            if wizard.split_count > 0:
                wizard.split_amount = wizard.amount_due / wizard.split_count
            else:
                wizard.split_amount = wizard.amount_due

    @api.onchange('tendered')
    def _onchange_tendered(self):
        if self.payment_method == 'cash' and self.tendered and self.tendered >= self.amount:
            self.change = self.tendered - self.amount

    def action_pay(self):
        """Process the payment"""
        self.ensure_one()

        if self.amount <= 0:
            raise UserError(_('Payment amount must be positive.'))

        if self.payment_method == 'cash' and self.tendered and self.tendered < self.amount:
            raise UserError(_('Tendered amount is less than the payment amount.'))

        # Update tip if provided
        if self.tip_amount:
            self.order_id.tip_amount = (self.order_id.tip_amount or 0) + self.tip_amount

        # Create payment record
        payment_vals = {
            'order_id': self.order_id.id,
            'payment_method': self.payment_method if self.payment_method != 'split' else 'cash',
            'amount': self.amount,
            'reference': self.reference,
            'change_given': self.change if self.payment_method == 'cash' else 0,
            'staff_id': self.env.user.restaurant_staff_id.id if hasattr(self.env.user, 'restaurant_staff_id') else False,
        }
        self.env['restaurant.order.payment'].create(payment_vals)

        # Check if fully paid
        if self.order_id.payment_state == 'paid':
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('Payment Complete'),
                    'message': _('Order %s has been fully paid.') % self.order_id.name,
                    'type': 'success',
                    'sticky': False,
                    'next': {'type': 'ir.actions.act_window_close'},
                }
            }

        return {'type': 'ir.actions.act_window_close'}


class RestaurantTableTransferWizard(models.TransientModel):
    """Wizard to transfer order to another table"""
    _name = 'restaurant.table.transfer.wizard'
    _description = 'Table Transfer Wizard'

    order_id = fields.Many2one(
        'restaurant.order',
        string='Order',
        required=True,
    )
    current_table_id = fields.Many2one(
        'restaurant.table',
        string='Current Table',
        related='order_id.table_id',
    )
    new_table_id = fields.Many2one(
        'restaurant.table',
        string='New Table',
        required=True,
        domain="[('state', '=', 'available'), ('id', '!=', current_table_id)]",
    )

    def action_transfer(self):
        """Transfer order to new table"""
        self.ensure_one()

        if self.new_table_id.state != 'available':
            raise UserError(_('The selected table is not available.'))

        old_table = self.order_id.table_id

        # Transfer order
        self.order_id.table_id = self.new_table_id

        # Update table states
        self.new_table_id.action_set_occupied()
        if old_table:
            # Check if old table has other active orders
            other_orders = self.env['restaurant.order'].search([
                ('table_id', '=', old_table.id),
                ('state', 'not in', ('paid', 'cancelled')),
                ('id', '!=', self.order_id.id),
            ])
            if not other_orders:
                old_table.action_set_available()

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Transfer Complete'),
                'message': _('Order transferred to table %s') % self.new_table_id.name,
                'type': 'success',
                'sticky': False,
                'next': {'type': 'ir.actions.act_window_close'},
            }
        }


class RestaurantOrderMergeWizard(models.TransientModel):
    """Wizard to merge multiple orders"""
    _name = 'restaurant.order.merge.wizard'
    _description = 'Merge Orders Wizard'

    order_ids = fields.Many2many(
        'restaurant.order',
        string='Orders to Merge',
        required=True,
        domain="[('state', 'not in', ('paid', 'cancelled'))]",
    )
    target_order_id = fields.Many2one(
        'restaurant.order',
        string='Target Order',
        required=True,
        help='All items will be merged into this order',
    )

    @api.model
    def default_get(self, fields_list):
        res = super().default_get(fields_list)
        active_ids = self.env.context.get('active_ids', [])
        if active_ids and len(active_ids) >= 2:
            res['order_ids'] = [(6, 0, active_ids)]
            res['target_order_id'] = active_ids[0]
        return res

    def action_merge(self):
        """Merge selected orders"""
        self.ensure_one()

        if len(self.order_ids) < 2:
            raise UserError(_('Please select at least 2 orders to merge.'))

        if self.target_order_id not in self.order_ids:
            raise UserError(_('Target order must be one of the selected orders.'))

        orders_to_merge = self.order_ids - self.target_order_id

        for order in orders_to_merge:
            # Transfer lines
            for line in order.line_ids:
                line.order_id = self.target_order_id

            # Cancel the merged order
            order.write({
                'state': 'cancelled',
                'note': (order.note or '') + '\n[Merged into %s]' % self.target_order_id.name,
            })

            # Release table if applicable
            if order.table_id and order.table_id != self.target_order_id.table_id:
                order.table_id.action_set_available()

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Merge Complete'),
                'message': _('%d orders merged into %s') % (len(orders_to_merge), self.target_order_id.name),
                'type': 'success',
                'sticky': False,
                'next': {'type': 'ir.actions.act_window_close'},
            }
        }
