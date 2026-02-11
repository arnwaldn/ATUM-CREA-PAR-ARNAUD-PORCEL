# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError
from datetime import datetime, timedelta


class RestaurantReservation(models.Model):
    """Restaurant reservation management"""
    _name = 'restaurant.reservation'
    _description = 'Restaurant Reservation'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'reservation_datetime desc'

    name = fields.Char(
        string='Reservation Number',
        required=True,
        readonly=True,
        default='New',
        copy=False,
    )
    partner_id = fields.Many2one(
        'res.partner',
        string='Customer',
        tracking=True,
    )
    customer_name = fields.Char(
        string='Customer Name',
        required=True,
    )
    customer_phone = fields.Char(
        string='Phone',
        required=True,
    )
    customer_email = fields.Char(
        string='Email',
    )
    party_size = fields.Integer(
        string='Party Size',
        required=True,
        default=2,
    )
    reservation_datetime = fields.Datetime(
        string='Reservation Date/Time',
        required=True,
        tracking=True,
    )
    duration = fields.Float(
        string='Duration (hours)',
        default=2.0,
    )
    end_datetime = fields.Datetime(
        string='End Time',
        compute='_compute_end_datetime',
        store=True,
    )
    table_ids = fields.Many2many(
        'restaurant.table',
        string='Tables',
    )
    floor_id = fields.Many2one(
        'restaurant.floor',
        string='Preferred Floor',
    )
    state = fields.Selection([
        ('draft', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('seated', 'Seated'),
        ('completed', 'Completed'),
        ('no_show', 'No Show'),
        ('cancelled', 'Cancelled'),
    ], string='Status', default='draft', required=True, tracking=True)
    source = fields.Selection([
        ('phone', 'Phone'),
        ('walk_in', 'Walk-in'),
        ('website', 'Website'),
        ('app', 'Mobile App'),
        ('third_party', 'Third Party'),
    ], string='Source', default='phone')
    occasion = fields.Selection([
        ('none', 'None'),
        ('birthday', 'Birthday'),
        ('anniversary', 'Anniversary'),
        ('business', 'Business'),
        ('date', 'Date Night'),
        ('celebration', 'Celebration'),
    ], string='Occasion', default='none')
    special_requests = fields.Text(
        string='Special Requests',
    )
    internal_notes = fields.Text(
        string='Internal Notes',
    )
    order_id = fields.Many2one(
        'restaurant.order',
        string='Order',
        readonly=True,
    )
    reminder_sent = fields.Boolean(
        string='Reminder Sent',
        default=False,
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
                vals['name'] = self.env['ir.sequence'].next_by_code('restaurant.reservation') or 'New'
        return super().create(vals_list)

    @api.depends('reservation_datetime', 'duration')
    def _compute_end_datetime(self):
        for res in self:
            if res.reservation_datetime and res.duration:
                res.end_datetime = res.reservation_datetime + timedelta(hours=res.duration)
            else:
                res.end_datetime = False

    @api.constrains('party_size')
    def _check_party_size(self):
        for res in self:
            if res.party_size < 1:
                raise ValidationError(_('Party size must be at least 1.'))

    @api.constrains('reservation_datetime')
    def _check_datetime(self):
        for res in self:
            if res.reservation_datetime < fields.Datetime.now():
                if res.state == 'draft':
                    raise ValidationError(_('Cannot create reservation in the past.'))

    def action_confirm(self):
        """Confirm the reservation"""
        for res in self:
            res.write({'state': 'confirmed'})
            # Send confirmation email if customer email exists
            if res.customer_email:
                template = self.env.ref('restaurant_pos.mail_template_reservation_confirmed',
                                        raise_if_not_found=False)
                if template:
                    template.send_mail(res.id, force_send=True)

    def action_seat(self):
        """Mark reservation as seated and create order"""
        for res in self:
            # Create order for the reservation
            order_vals = {
                'table_id': res.table_ids[0].id if res.table_ids else False,
                'customer_count': res.party_size,
                'partner_id': res.partner_id.id,
                'order_type': 'dine_in',
            }
            order = self.env['restaurant.order'].create(order_vals)
            res.write({
                'state': 'seated',
                'order_id': order.id,
            })
            # Update table status
            for table in res.table_ids:
                table.action_set_occupied()

    def action_complete(self):
        """Mark reservation as completed"""
        self.write({'state': 'completed'})

    def action_no_show(self):
        """Mark reservation as no-show"""
        for res in self:
            res.write({'state': 'no_show'})
            # Release tables
            for table in res.table_ids:
                if table.state == 'reserved':
                    table.action_set_available()

    def action_cancel(self):
        """Cancel the reservation"""
        for res in self:
            if res.state == 'seated':
                raise UserError(_('Cannot cancel a seated reservation.'))
            res.write({'state': 'cancelled'})
            # Release tables
            for table in res.table_ids:
                if table.state == 'reserved':
                    table.action_set_available()

    @api.model
    def _cron_send_reminders(self):
        """Send reservation reminders"""
        tomorrow_start = fields.Datetime.now() + timedelta(days=1)
        tomorrow_end = tomorrow_start + timedelta(days=1)

        reservations = self.search([
            ('state', '=', 'confirmed'),
            ('reservation_datetime', '>=', tomorrow_start),
            ('reservation_datetime', '<', tomorrow_end),
            ('reminder_sent', '=', False),
            ('customer_email', '!=', False),
        ])

        template = self.env.ref('restaurant_pos.mail_template_reservation_reminder',
                                raise_if_not_found=False)
        if template:
            for res in reservations:
                template.send_mail(res.id, force_send=True)
                res.reminder_sent = True

    @api.model
    def _cron_mark_no_shows(self):
        """Mark past confirmed reservations as no-show"""
        cutoff = fields.Datetime.now() - timedelta(hours=1)
        reservations = self.search([
            ('state', '=', 'confirmed'),
            ('reservation_datetime', '<', cutoff),
        ])
        reservations.action_no_show()

    def action_view_order(self):
        """View the associated order"""
        self.ensure_one()
        if self.order_id:
            return {
                'type': 'ir.actions.act_window',
                'name': _('Order'),
                'res_model': 'restaurant.order',
                'res_id': self.order_id.id,
                'view_mode': 'form',
            }
