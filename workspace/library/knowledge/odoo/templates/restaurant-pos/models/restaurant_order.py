# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError
from datetime import datetime, timedelta


class RestaurantOrder(models.Model):
    """Restaurant order management"""
    _name = 'restaurant.order'
    _description = 'Restaurant Order'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'create_date desc'

    name = fields.Char(
        string='Order Number',
        required=True,
        readonly=True,
        default='New',
        copy=False,
    )
    table_id = fields.Many2one(
        'restaurant.table',
        string='Table',
        tracking=True,
    )
    floor_id = fields.Many2one(
        related='table_id.floor_id',
        store=True,
    )
    customer_count = fields.Integer(
        string='Guests',
        default=1,
    )
    waiter_id = fields.Many2one(
        'restaurant.staff',
        string='Waiter',
        domain="[('position', 'in', ['waiter', 'manager'])]",
        tracking=True,
    )
    state = fields.Selection([
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
        ('served', 'Served'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ], string='Status', default='draft', required=True, tracking=True)

    # Order details
    line_ids = fields.One2many(
        'restaurant.order.line',
        'order_id',
        string='Order Lines',
    )
    note = fields.Text(
        string='Notes',
    )

    # Timing
    order_datetime = fields.Datetime(
        string='Order Time',
        default=fields.Datetime.now,
    )
    confirmed_datetime = fields.Datetime(
        string='Confirmed Time',
    )
    ready_datetime = fields.Datetime(
        string='Ready Time',
    )
    served_datetime = fields.Datetime(
        string='Served Time',
    )

    # Amounts
    currency_id = fields.Many2one(
        'res.currency',
        string='Currency',
        default=lambda self: self.env.company.currency_id,
    )
    subtotal = fields.Monetary(
        string='Subtotal',
        compute='_compute_amounts',
        store=True,
    )
    tax_amount = fields.Monetary(
        string='Taxes',
        compute='_compute_amounts',
        store=True,
    )
    discount_amount = fields.Monetary(
        string='Discount',
        compute='_compute_amounts',
        store=True,
    )
    total = fields.Monetary(
        string='Total',
        compute='_compute_amounts',
        store=True,
    )

    # Discount
    discount_type = fields.Selection([
        ('percent', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    ], string='Discount Type')
    discount_value = fields.Float(
        string='Discount Value',
    )
    discount_reason = fields.Char(
        string='Discount Reason',
    )

    # Payment
    payment_state = fields.Selection([
        ('not_paid', 'Not Paid'),
        ('partial', 'Partially Paid'),
        ('paid', 'Paid'),
    ], string='Payment Status', default='not_paid', compute='_compute_payment_state', store=True)
    payment_ids = fields.One2many(
        'restaurant.order.payment',
        'order_id',
        string='Payments',
    )
    amount_paid = fields.Monetary(
        string='Amount Paid',
        compute='_compute_payment_state',
        store=True,
    )
    amount_due = fields.Monetary(
        string='Amount Due',
        compute='_compute_payment_state',
        store=True,
    )
    tip_amount = fields.Monetary(
        string='Tip',
    )

    # Order type
    order_type = fields.Selection([
        ('dine_in', 'Dine In'),
        ('takeaway', 'Takeaway'),
        ('delivery', 'Delivery'),
    ], string='Order Type', default='dine_in', required=True)

    # Customer (for takeaway/delivery)
    partner_id = fields.Many2one(
        'res.partner',
        string='Customer',
    )
    delivery_address = fields.Text(
        string='Delivery Address',
    )
    delivery_time = fields.Datetime(
        string='Requested Delivery Time',
    )

    # Invoice
    invoice_id = fields.Many2one(
        'account.move',
        string='Invoice',
        readonly=True,
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
                vals['name'] = self.env['ir.sequence'].next_by_code('restaurant.order') or 'New'
        return super().create(vals_list)

    @api.depends('line_ids.subtotal', 'line_ids.tax_amount', 'discount_type', 'discount_value')
    def _compute_amounts(self):
        for order in self:
            subtotal = sum(order.line_ids.mapped('subtotal'))
            tax_amount = sum(order.line_ids.mapped('tax_amount'))

            # Calculate discount
            discount = 0
            if order.discount_type == 'percent' and order.discount_value:
                discount = subtotal * (order.discount_value / 100)
            elif order.discount_type == 'fixed' and order.discount_value:
                discount = order.discount_value

            order.subtotal = subtotal
            order.tax_amount = tax_amount
            order.discount_amount = discount
            order.total = subtotal + tax_amount - discount

    @api.depends('payment_ids.amount', 'total')
    def _compute_payment_state(self):
        for order in self:
            paid = sum(order.payment_ids.mapped('amount'))
            order.amount_paid = paid
            order.amount_due = order.total + order.tip_amount - paid

            if paid >= order.total + order.tip_amount:
                order.payment_state = 'paid'
            elif paid > 0:
                order.payment_state = 'partial'
            else:
                order.payment_state = 'not_paid'

    def action_confirm(self):
        """Confirm the order and send to kitchen"""
        for order in self:
            if not order.line_ids:
                raise UserError(_('Cannot confirm an empty order.'))
            order.write({
                'state': 'confirmed',
                'confirmed_datetime': fields.Datetime.now(),
            })
            if order.table_id:
                order.table_id.action_set_occupied()

    def action_prepare(self):
        """Mark order as being prepared"""
        self.write({'state': 'preparing'})

    def action_ready(self):
        """Mark order as ready to serve"""
        self.write({
            'state': 'ready',
            'ready_datetime': fields.Datetime.now(),
        })

    def action_serve(self):
        """Mark order as served"""
        self.write({
            'state': 'served',
            'served_datetime': fields.Datetime.now(),
        })

    def action_pay(self):
        """Open payment wizard"""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': _('Payment'),
            'res_model': 'restaurant.order.payment.wizard',
            'view_mode': 'form',
            'target': 'new',
            'context': {
                'default_order_id': self.id,
                'default_amount': self.amount_due,
            },
        }

    def action_paid(self):
        """Mark order as fully paid"""
        for order in self:
            if order.payment_state != 'paid':
                raise UserError(_('Order is not fully paid.'))
            order.write({'state': 'paid'})
            if order.table_id:
                order.table_id.action_set_cleaning()

    def action_cancel(self):
        """Cancel the order"""
        for order in self:
            if order.state == 'paid':
                raise UserError(_('Cannot cancel a paid order.'))
            order.write({'state': 'cancelled'})
            if order.table_id and order.table_id.state == 'occupied':
                # Check if table has other active orders
                other_orders = self.search([
                    ('table_id', '=', order.table_id.id),
                    ('state', 'not in', ['paid', 'cancelled']),
                    ('id', '!=', order.id),
                ])
                if not other_orders:
                    order.table_id.action_set_available()

    def action_create_invoice(self):
        """Create invoice from order"""
        self.ensure_one()
        if self.invoice_id:
            raise UserError(_('Invoice already exists.'))

        invoice_vals = {
            'move_type': 'out_invoice',
            'partner_id': self.partner_id.id or self.env['res.partner'].search([], limit=1).id,
            'invoice_origin': self.name,
            'invoice_line_ids': [],
        }

        for line in self.line_ids:
            invoice_vals['invoice_line_ids'].append((0, 0, {
                'name': line.item_id.name,
                'quantity': line.quantity,
                'price_unit': line.unit_price,
                'tax_ids': [(6, 0, line.item_id.tax_ids.ids)],
            }))

        invoice = self.env['account.move'].create(invoice_vals)
        self.invoice_id = invoice

        return {
            'type': 'ir.actions.act_window',
            'name': _('Invoice'),
            'res_model': 'account.move',
            'res_id': invoice.id,
            'view_mode': 'form',
        }

    def action_print_ticket(self):
        """Print kitchen ticket"""
        return self.env.ref('restaurant_pos.action_report_kitchen_ticket').report_action(self)

    def action_print_bill(self):
        """Print customer bill"""
        return self.env.ref('restaurant_pos.action_report_customer_bill').report_action(self)


class RestaurantOrderLine(models.Model):
    """Order line items"""
    _name = 'restaurant.order.line'
    _description = 'Order Line'
    _order = 'sequence, id'

    order_id = fields.Many2one(
        'restaurant.order',
        string='Order',
        required=True,
        ondelete='cascade',
    )
    sequence = fields.Integer(
        string='Sequence',
        default=10,
    )
    item_id = fields.Many2one(
        'restaurant.menu.item',
        string='Menu Item',
        required=True,
    )
    quantity = fields.Float(
        string='Quantity',
        required=True,
        default=1.0,
    )
    unit_price = fields.Float(
        string='Unit Price',
        digits='Product Price',
    )
    discount_percent = fields.Float(
        string='Discount %',
    )
    subtotal = fields.Monetary(
        string='Subtotal',
        compute='_compute_amounts',
        store=True,
    )
    tax_amount = fields.Monetary(
        string='Tax',
        compute='_compute_amounts',
        store=True,
    )
    total = fields.Monetary(
        string='Total',
        compute='_compute_amounts',
        store=True,
    )
    currency_id = fields.Many2one(
        related='order_id.currency_id',
    )

    # Options and modifications
    option_ids = fields.Many2many(
        'restaurant.menu.option',
        string='Options',
    )
    modifications = fields.Char(
        string='Modifications',
        help='Special requests (e.g., no onions, extra cheese)',
    )
    note = fields.Char(
        string='Note',
    )

    # Kitchen status
    kitchen_state = fields.Selection([
        ('pending', 'Pending'),
        ('sent', 'Sent to Kitchen'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
        ('served', 'Served'),
        ('cancelled', 'Cancelled'),
    ], string='Kitchen Status', default='pending')
    sent_to_kitchen = fields.Boolean(
        string='Sent to Kitchen',
        default=False,
    )

    @api.onchange('item_id')
    def _onchange_item_id(self):
        if self.item_id:
            self.unit_price = self.item_id.price

    @api.depends('quantity', 'unit_price', 'discount_percent', 'option_ids.price_extra')
    def _compute_amounts(self):
        for line in self:
            options_extra = sum(line.option_ids.mapped('price_extra'))
            price = (line.unit_price + options_extra) * line.quantity
            discount = price * (line.discount_percent / 100)
            subtotal = price - discount

            # Calculate taxes
            taxes = line.item_id.tax_ids.compute_all(
                subtotal,
                currency=line.currency_id,
                quantity=1,
                product=line.item_id.product_id,
            )

            line.subtotal = taxes['total_excluded']
            line.tax_amount = taxes['total_included'] - taxes['total_excluded']
            line.total = taxes['total_included']

    def action_send_to_kitchen(self):
        """Send item to kitchen"""
        self.write({
            'kitchen_state': 'sent',
            'sent_to_kitchen': True,
        })

    def action_mark_ready(self):
        """Mark item as ready"""
        self.write({'kitchen_state': 'ready'})

    def action_mark_served(self):
        """Mark item as served"""
        self.write({'kitchen_state': 'served'})


class RestaurantOrderPayment(models.Model):
    """Order payment records"""
    _name = 'restaurant.order.payment'
    _description = 'Order Payment'
    _order = 'payment_datetime desc'

    order_id = fields.Many2one(
        'restaurant.order',
        string='Order',
        required=True,
        ondelete='cascade',
    )
    payment_method = fields.Selection([
        ('cash', 'Cash'),
        ('card', 'Credit/Debit Card'),
        ('mobile', 'Mobile Payment'),
        ('voucher', 'Voucher'),
        ('account', 'On Account'),
    ], string='Payment Method', required=True, default='cash')
    amount = fields.Monetary(
        string='Amount',
        required=True,
    )
    currency_id = fields.Many2one(
        related='order_id.currency_id',
    )
    payment_datetime = fields.Datetime(
        string='Payment Time',
        default=fields.Datetime.now,
    )
    reference = fields.Char(
        string='Reference',
        help='Card transaction reference, voucher number, etc.',
    )
    change_given = fields.Monetary(
        string='Change Given',
    )
    staff_id = fields.Many2one(
        'restaurant.staff',
        string='Received By',
    )
