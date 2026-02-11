# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from datetime import datetime, timedelta


class AssociationResource(models.Model):
    """Association resources and equipment"""
    _name = 'association.resource'
    _description = 'Association Resource'
    _inherit = ['mail.thread']
    _order = 'name'

    name = fields.Char(
        string='Resource Name',
        required=True,
    )
    code = fields.Char(
        string='Code',
    )
    resource_type = fields.Selection([
        ('equipment', 'Equipment'),
        ('material', 'Material'),
        ('vehicle', 'Vehicle'),
        ('room', 'Room'),
        ('other', 'Other'),
    ], string='Type', required=True, default='equipment')
    category_id = fields.Many2one(
        'association.resource.category',
        string='Category',
    )
    state = fields.Selection([
        ('available', 'Available'),
        ('in_use', 'In Use'),
        ('maintenance', 'Maintenance'),
        ('unavailable', 'Unavailable'),
    ], string='Status', default='available', tracking=True)

    description = fields.Text(
        string='Description',
    )
    image = fields.Binary(
        string='Image',
    )

    # Details
    quantity = fields.Integer(
        string='Quantity',
        default=1,
    )
    location = fields.Char(
        string='Location',
    )
    serial_number = fields.Char(
        string='Serial Number',
    )
    purchase_date = fields.Date(
        string='Purchase Date',
    )
    purchase_value = fields.Monetary(
        string='Purchase Value',
    )
    current_value = fields.Monetary(
        string='Current Value',
    )
    currency_id = fields.Many2one(
        'res.currency',
        default=lambda self: self.env.company.currency_id,
    )

    # Borrowing
    is_borrowable = fields.Boolean(
        string='Can Be Borrowed',
        default=True,
    )
    max_borrow_days = fields.Integer(
        string='Max Borrow Days',
        default=7,
    )
    deposit_required = fields.Boolean(
        string='Deposit Required',
        default=False,
    )
    deposit_amount = fields.Monetary(
        string='Deposit Amount',
    )

    # Bookings
    booking_ids = fields.One2many(
        'association.resource.booking',
        'resource_id',
        string='Bookings',
    )
    current_booking_id = fields.Many2one(
        'association.resource.booking',
        string='Current Booking',
        compute='_compute_current_booking',
    )

    # Maintenance
    last_maintenance = fields.Date(
        string='Last Maintenance',
    )
    next_maintenance = fields.Date(
        string='Next Maintenance',
    )
    maintenance_notes = fields.Text(
        string='Maintenance Notes',
    )

    active = fields.Boolean(
        string='Active',
        default=True,
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

    def _compute_current_booking(self):
        today = fields.Date.today()
        for resource in self:
            booking = resource.booking_ids.filtered(
                lambda b: b.state == 'confirmed' and
                          b.date_start <= today <= (b.date_end or b.date_start)
            )[:1]
            resource.current_booking_id = booking

    def action_set_available(self):
        """Set resource as available"""
        self.write({'state': 'available'})

    def action_set_maintenance(self):
        """Set resource under maintenance"""
        self.write({'state': 'maintenance'})

    def action_view_bookings(self):
        """View resource bookings"""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': _('Bookings'),
            'res_model': 'association.resource.booking',
            'view_mode': 'tree,calendar,form',
            'domain': [('resource_id', '=', self.id)],
            'context': {'default_resource_id': self.id},
        }


class AssociationResourceCategory(models.Model):
    """Resource category"""
    _name = 'association.resource.category'
    _description = 'Resource Category'
    _order = 'name'

    name = fields.Char(
        string='Category Name',
        required=True,
    )
    code = fields.Char(
        string='Code',
    )
    description = fields.Text(
        string='Description',
    )


class AssociationResourceBooking(models.Model):
    """Resource booking management"""
    _name = 'association.resource.booking'
    _description = 'Resource Booking'
    _inherit = ['mail.thread']
    _order = 'date_start desc'

    name = fields.Char(
        string='Reference',
        required=True,
        readonly=True,
        default='New',
        copy=False,
    )
    resource_id = fields.Many2one(
        'association.resource',
        string='Resource',
        required=True,
        ondelete='cascade',
    )
    member_id = fields.Many2one(
        'association.member',
        string='Borrower',
        required=True,
    )
    event_id = fields.Many2one(
        'association.event',
        string='For Event',
    )
    activity_id = fields.Many2one(
        'association.activity',
        string='For Activity',
    )
    state = fields.Selection([
        ('draft', 'Draft'),
        ('pending', 'Pending Approval'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('returned', 'Returned'),
        ('cancelled', 'Cancelled'),
    ], string='Status', default='draft', required=True, tracking=True)

    # Dates
    date_start = fields.Date(
        string='Start Date',
        required=True,
    )
    date_end = fields.Date(
        string='End Date',
    )
    date_returned = fields.Date(
        string='Actual Return Date',
    )

    # Deposit
    deposit_paid = fields.Boolean(
        string='Deposit Paid',
        default=False,
    )
    deposit_returned = fields.Boolean(
        string='Deposit Returned',
        default=False,
    )

    # Condition
    condition_out = fields.Selection([
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
    ], string='Condition at Checkout')
    condition_in = fields.Selection([
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
        ('damaged', 'Damaged'),
    ], string='Condition at Return')
    damage_notes = fields.Text(
        string='Damage Notes',
    )

    purpose = fields.Text(
        string='Purpose',
    )
    notes = fields.Text(
        string='Notes',
    )

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', 'New') == 'New':
                vals['name'] = self.env['ir.sequence'].next_by_code('association.resource.booking') or 'New'
        return super().create(vals_list)

    @api.constrains('date_start', 'date_end', 'resource_id')
    def _check_overlap(self):
        for booking in self:
            if booking.state in ('draft', 'cancelled'):
                continue
            domain = [
                ('resource_id', '=', booking.resource_id.id),
                ('id', '!=', booking.id),
                ('state', 'in', ('confirmed', 'in_progress')),
            ]
            if booking.date_end:
                domain += [
                    ('date_start', '<=', booking.date_end),
                    '|',
                    ('date_end', '>=', booking.date_start),
                    ('date_end', '=', False),
                ]
            else:
                domain += [
                    '|',
                    ('date_end', '>=', booking.date_start),
                    ('date_end', '=', False),
                ]
            if self.search_count(domain):
                raise ValidationError(_('This resource is already booked for the selected period.'))

    def action_confirm(self):
        """Confirm the booking"""
        self.write({'state': 'confirmed'})

    def action_start(self):
        """Start the booking (checkout)"""
        self.write({
            'state': 'in_progress',
        })
        self.resource_id.state = 'in_use'

    def action_return(self):
        """Return the resource"""
        self.write({
            'state': 'returned',
            'date_returned': fields.Date.today(),
        })
        # Check if resource has other active bookings
        other_bookings = self.search([
            ('resource_id', '=', self.resource_id.id),
            ('state', '=', 'in_progress'),
            ('id', '!=', self.id),
        ])
        if not other_bookings:
            self.resource_id.state = 'available'

    def action_cancel(self):
        """Cancel the booking"""
        self.write({'state': 'cancelled'})
