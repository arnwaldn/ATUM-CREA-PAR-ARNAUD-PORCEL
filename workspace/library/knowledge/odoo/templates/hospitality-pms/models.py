# -*- coding: utf-8 -*-
"""
Hotel PMS Core Models
=====================
Complete model definitions for hotel property management.
"""

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError, UserError
from datetime import datetime, timedelta


class HotelProperty(models.Model):
    """Hotel Property / Establishment"""
    _name = 'hotel.property'
    _description = 'Hotel Property'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(required=True, tracking=True)
    code = fields.Char(required=True, size=10)
    company_id = fields.Many2one('res.company', default=lambda self: self.env.company)
    partner_id = fields.Many2one('res.partner', string='Address')

    # Contact
    phone = fields.Char()
    email = fields.Char()
    website = fields.Char()

    # Configuration
    checkin_time = fields.Float(string='Check-in Time', default=14.0)
    checkout_time = fields.Float(string='Check-out Time', default=11.0)
    timezone = fields.Selection('_tz_get', string='Timezone')
    currency_id = fields.Many2one('res.currency')

    # Statistics
    room_count = fields.Integer(compute='_compute_stats')
    floor_count = fields.Integer(compute='_compute_stats')

    active = fields.Boolean(default=True)

    @api.model
    def _tz_get(self):
        import pytz
        return [(x, x) for x in pytz.all_timezones]

    def _compute_stats(self):
        for prop in self:
            prop.room_count = self.env['hotel.room'].search_count([
                ('property_id', '=', prop.id)
            ])
            prop.floor_count = len(self.env['hotel.floor'].search([
                ('property_id', '=', prop.id)
            ]))


class HotelFloor(models.Model):
    """Hotel Floor"""
    _name = 'hotel.floor'
    _description = 'Hotel Floor'
    _order = 'sequence'

    name = fields.Char(required=True)
    sequence = fields.Integer(default=10)
    property_id = fields.Many2one('hotel.property', required=True)
    room_ids = fields.One2many('hotel.room', 'floor_id')


class HotelAmenity(models.Model):
    """Room Amenity"""
    _name = 'hotel.amenity'
    _description = 'Hotel Amenity'
    _order = 'sequence'

    name = fields.Char(required=True, translate=True)
    code = fields.Char()
    sequence = fields.Integer(default=10)
    icon = fields.Char(help='FontAwesome icon class')
    amenity_type = fields.Selection([
        ('room', 'Room Amenity'),
        ('bathroom', 'Bathroom'),
        ('technology', 'Technology'),
        ('service', 'Service'),
    ], default='room')


class HotelRoomType(models.Model):
    """Hotel Room Type"""
    _name = 'hotel.room.type'
    _description = 'Hotel Room Type'
    _inherit = ['mail.thread']
    _order = 'sequence'

    name = fields.Char(required=True, tracking=True)
    code = fields.Char(required=True, size=10)
    sequence = fields.Integer(default=10)
    active = fields.Boolean(default=True)

    # Capacity
    default_capacity = fields.Integer(default=2)
    max_adults = fields.Integer(default=2)
    max_children = fields.Integer(default=2)
    max_occupancy = fields.Integer(compute='_compute_max_occupancy', store=True)

    # Bed configuration
    bed_type = fields.Selection([
        ('single', 'Single'),
        ('double', 'Double'),
        ('queen', 'Queen'),
        ('king', 'King'),
        ('twin', 'Twin'),
    ], default='double')

    # Pricing
    list_price = fields.Monetary(string='Rack Rate')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)

    # Amenities
    amenity_ids = fields.Many2many('hotel.amenity')

    # Rooms
    room_ids = fields.One2many('hotel.room', 'room_type_id')
    room_count = fields.Integer(compute='_compute_room_count')
    available_count = fields.Integer(compute='_compute_available')

    # Description
    description = fields.Html()
    image_ids = fields.One2many('hotel.room.type.image', 'room_type_id')

    @api.depends('max_adults', 'max_children')
    def _compute_max_occupancy(self):
        for rt in self:
            rt.max_occupancy = rt.max_adults + rt.max_children

    def _compute_room_count(self):
        for rt in self:
            rt.room_count = len(rt.room_ids)

    def _compute_available(self):
        for rt in self:
            rt.available_count = len(rt.room_ids.filtered(
                lambda r: r.state == 'available'
            ))


class HotelRoomTypeImage(models.Model):
    """Room Type Image"""
    _name = 'hotel.room.type.image'
    _description = 'Room Type Image'
    _order = 'sequence'

    room_type_id = fields.Many2one('hotel.room.type', required=True, ondelete='cascade')
    name = fields.Char()
    sequence = fields.Integer(default=10)
    image = fields.Binary(required=True)


class HotelRoom(models.Model):
    """Hotel Room"""
    _name = 'hotel.room'
    _description = 'Hotel Room'
    _inherit = ['mail.thread']
    _order = 'floor_id, name'

    name = fields.Char(string='Room Number', required=True, tracking=True)
    room_type_id = fields.Many2one('hotel.room.type', required=True, ondelete='restrict')
    floor_id = fields.Many2one('hotel.floor')
    property_id = fields.Many2one('hotel.property', required=True)

    # Status
    state = fields.Selection([
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        ('reserved', 'Reserved'),
        ('maintenance', 'Maintenance'),
        ('blocked', 'Blocked'),
    ], default='available', tracking=True)

    housekeeping_state = fields.Selection([
        ('clean', 'Clean'),
        ('dirty', 'Dirty'),
        ('inspected', 'Inspected'),
        ('out_of_service', 'Out of Service'),
    ], default='clean', tracking=True)

    # Housekeeping
    last_cleaned_date = fields.Datetime()
    last_inspected_date = fields.Datetime()
    housekeeper_id = fields.Many2one('hr.employee')

    # From room type
    capacity = fields.Integer(related='room_type_id.default_capacity')
    amenity_ids = fields.Many2many(related='room_type_id.amenity_ids')

    # Current reservation
    current_reservation_id = fields.Many2one('hotel.reservation', compute='_compute_current')
    current_guest_id = fields.Many2one('res.partner', compute='_compute_current')

    note = fields.Text()
    active = fields.Boolean(default=True)

    _sql_constraints = [
        ('room_unique', 'UNIQUE(name, property_id)', 'Room number must be unique per property!'),
    ]

    def _compute_current(self):
        today = fields.Date.today()
        for room in self:
            reservation = self.env['hotel.reservation'].search([
                ('room_ids', 'in', room.id),
                ('checkin_date', '<=', today),
                ('checkout_date', '>', today),
                ('state', '=', 'checkin'),
            ], limit=1)
            room.current_reservation_id = reservation
            room.current_guest_id = reservation.partner_id

    def action_set_clean(self):
        self.write({
            'housekeeping_state': 'clean',
            'last_cleaned_date': fields.Datetime.now(),
        })

    def action_set_inspected(self):
        self.write({
            'housekeeping_state': 'inspected',
            'last_inspected_date': fields.Datetime.now(),
        })


class HotelReservation(models.Model):
    """Hotel Reservation"""
    _name = 'hotel.reservation'
    _description = 'Hotel Reservation'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'checkin_date desc, id desc'

    name = fields.Char(readonly=True, copy=False, default='New')

    # Guest
    partner_id = fields.Many2one('res.partner', string='Guest', required=True, tracking=True)
    adults = fields.Integer(default=1)
    children = fields.Integer(default=0)

    # Dates
    checkin_date = fields.Date(required=True, tracking=True)
    checkout_date = fields.Date(required=True, tracking=True)
    nights = fields.Integer(compute='_compute_nights', store=True)
    expected_arrival_time = fields.Float(default=14.0)
    expected_departure_time = fields.Float(default=11.0)

    # Rooms
    room_type_id = fields.Many2one('hotel.room.type', required=True)
    room_ids = fields.Many2many('hotel.room')
    room_count = fields.Integer(default=1)

    # Status
    state = fields.Selection([
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('checkin', 'Checked In'),
        ('checkout', 'Checked Out'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ], default='draft', tracking=True)

    # Source
    source = fields.Selection([
        ('direct', 'Direct'),
        ('website', 'Website'),
        ('booking', 'Booking.com'),
        ('expedia', 'Expedia'),
        ('airbnb', 'Airbnb'),
        ('agent', 'Travel Agent'),
    ], default='direct', tracking=True)
    channel_reservation_id = fields.Char()

    # Pricing
    rate_plan_id = fields.Many2one('hotel.rate.plan')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)
    room_rate = fields.Monetary()
    total_room_charge = fields.Monetary(compute='_compute_totals', store=True)
    extra_charges = fields.Monetary(compute='_compute_totals', store=True)
    taxes = fields.Monetary(compute='_compute_totals', store=True)
    total_amount = fields.Monetary(compute='_compute_totals', store=True)

    # Payments
    deposit_amount = fields.Monetary()
    paid_amount = fields.Monetary(compute='_compute_payments')
    balance = fields.Monetary(compute='_compute_payments')

    # Folio lines
    folio_line_ids = fields.One2many('hotel.folio.line', 'reservation_id')

    # Notes
    special_requests = fields.Text()
    internal_notes = fields.Text()

    # Invoice
    invoice_id = fields.Many2one('account.move', copy=False)

    company_id = fields.Many2one('res.company', default=lambda self: self.env.company)

    @api.depends('checkin_date', 'checkout_date')
    def _compute_nights(self):
        for res in self:
            if res.checkin_date and res.checkout_date:
                res.nights = (res.checkout_date - res.checkin_date).days
            else:
                res.nights = 0

    @api.depends('room_rate', 'nights', 'room_count', 'folio_line_ids.amount')
    def _compute_totals(self):
        for res in self:
            res.total_room_charge = res.room_rate * res.nights * res.room_count
            res.extra_charges = sum(res.folio_line_ids.mapped('amount'))
            subtotal = res.total_room_charge + res.extra_charges
            res.taxes = subtotal * 0.10  # 10% tax - customize as needed
            res.total_amount = subtotal + res.taxes

    def _compute_payments(self):
        for res in self:
            payments = self.env['hotel.payment'].search([
                ('reservation_id', '=', res.id),
                ('state', '=', 'posted'),
            ])
            res.paid_amount = sum(payments.mapped('amount'))
            res.balance = res.total_amount - res.paid_amount

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', 'New') == 'New':
                vals['name'] = self.env['ir.sequence'].next_by_code('hotel.reservation') or 'New'
        return super().create(vals_list)

    @api.constrains('checkin_date', 'checkout_date')
    def _check_dates(self):
        for res in self:
            if res.checkout_date <= res.checkin_date:
                raise ValidationError(_("Check-out date must be after check-in date!"))

    def action_confirm(self):
        self.ensure_one()
        if not self.room_rate:
            self.room_rate = self._get_rate()
        self.write({'state': 'confirmed'})

    def action_checkin(self):
        self.ensure_one()
        if not self.room_ids:
            raise ValidationError(_("Please assign rooms before check-in!"))
        self.room_ids.write({'state': 'occupied'})
        self.write({'state': 'checkin'})

    def action_checkout(self):
        self.ensure_one()
        self.room_ids.write({
            'state': 'available',
            'housekeeping_state': 'dirty',
        })
        self.write({'state': 'checkout'})
        if not self.invoice_id:
            self._create_invoice()

    def action_cancel(self):
        if self.state == 'checkin':
            raise ValidationError(_("Cannot cancel a checked-in reservation!"))
        self.room_ids.write({'state': 'available'})
        self.write({'state': 'cancelled'})

    def _get_rate(self):
        if self.rate_plan_id:
            return self.rate_plan_id._get_rate(self.room_type_id, self.checkin_date, self.checkout_date)
        return self.room_type_id.list_price

    def _create_invoice(self):
        invoice_vals = {
            'partner_id': self.partner_id.id,
            'move_type': 'out_invoice',
            'invoice_origin': self.name,
            'invoice_line_ids': self._prepare_invoice_lines(),
        }
        invoice = self.env['account.move'].create(invoice_vals)
        self.invoice_id = invoice
        return invoice

    def _prepare_invoice_lines(self):
        lines = [(0, 0, {
            'name': f'{self.room_type_id.name} - {self.nights} nights',
            'quantity': self.nights * self.room_count,
            'price_unit': self.room_rate,
        })]
        for folio_line in self.folio_line_ids:
            lines.append((0, 0, {
                'name': folio_line.product_id.name,
                'quantity': folio_line.quantity,
                'price_unit': folio_line.unit_price,
            }))
        return lines


class HotelFolioLine(models.Model):
    """Folio Line - Extra charges"""
    _name = 'hotel.folio.line'
    _description = 'Hotel Folio Line'
    _order = 'date desc'

    reservation_id = fields.Many2one('hotel.reservation', required=True, ondelete='cascade')
    product_id = fields.Many2one('product.product', required=True)
    name = fields.Char()
    date = fields.Date(default=fields.Date.today)
    quantity = fields.Float(default=1.0)
    unit_price = fields.Monetary()
    amount = fields.Monetary(compute='_compute_amount', store=True)
    currency_id = fields.Many2one(related='reservation_id.currency_id')

    @api.depends('quantity', 'unit_price')
    def _compute_amount(self):
        for line in self:
            line.amount = line.quantity * line.unit_price

    @api.onchange('product_id')
    def _onchange_product(self):
        if self.product_id:
            self.name = self.product_id.name
            self.unit_price = self.product_id.list_price


class HotelRatePlan(models.Model):
    """Hotel Rate Plan"""
    _name = 'hotel.rate.plan'
    _description = 'Hotel Rate Plan'
    _order = 'sequence'

    name = fields.Char(required=True)
    code = fields.Char(required=True)
    sequence = fields.Integer(default=10)
    active = fields.Boolean(default=True)

    rate_type = fields.Selection([
        ('standard', 'Standard'),
        ('bar', 'Best Available'),
        ('promotional', 'Promotional'),
        ('corporate', 'Corporate'),
        ('package', 'Package'),
    ], default='standard')

    is_refundable = fields.Boolean(default=True)
    min_stay = fields.Integer(default=1)
    max_stay = fields.Integer(default=0)
    breakfast_included = fields.Boolean(default=False)

    rate_line_ids = fields.One2many('hotel.rate.plan.line', 'rate_plan_id')
    seasonal_rate_ids = fields.One2many('hotel.seasonal.rate', 'rate_plan_id')

    def _get_rate(self, room_type, date_from, date_to):
        self.ensure_one()
        rate_line = self.rate_line_ids.filtered(lambda r: r.room_type_id == room_type)
        if rate_line:
            return rate_line.rate
        return room_type.list_price


class HotelRatePlanLine(models.Model):
    """Rate Plan Line per Room Type"""
    _name = 'hotel.rate.plan.line'
    _description = 'Rate Plan Line'

    rate_plan_id = fields.Many2one('hotel.rate.plan', required=True, ondelete='cascade')
    room_type_id = fields.Many2one('hotel.room.type', required=True)
    rate = fields.Monetary()
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)


class HotelSeasonalRate(models.Model):
    """Seasonal Rate Override"""
    _name = 'hotel.seasonal.rate'
    _description = 'Seasonal Rate'

    rate_plan_id = fields.Many2one('hotel.rate.plan', required=True, ondelete='cascade')
    room_type_id = fields.Many2one('hotel.room.type', required=True)
    name = fields.Char(string='Season Name')
    date_from = fields.Date(required=True)
    date_to = fields.Date(required=True)
    rate = fields.Monetary()
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)


class HotelPayment(models.Model):
    """Hotel Payment"""
    _name = 'hotel.payment'
    _description = 'Hotel Payment'
    _inherit = ['mail.thread']
    _order = 'date desc'

    name = fields.Char(readonly=True, default='New')
    reservation_id = fields.Many2one('hotel.reservation', required=True)
    partner_id = fields.Many2one(related='reservation_id.partner_id')
    date = fields.Date(default=fields.Date.today)
    amount = fields.Monetary(required=True)
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)
    payment_method = fields.Selection([
        ('cash', 'Cash'),
        ('card', 'Credit Card'),
        ('bank', 'Bank Transfer'),
        ('online', 'Online'),
    ], default='card')
    reference = fields.Char()
    state = fields.Selection([
        ('draft', 'Draft'),
        ('posted', 'Posted'),
        ('cancelled', 'Cancelled'),
    ], default='draft')
    note = fields.Text()

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', 'New') == 'New':
                vals['name'] = self.env['ir.sequence'].next_by_code('hotel.payment') or 'New'
        return super().create(vals_list)

    def action_post(self):
        self.write({'state': 'posted'})

    def action_cancel(self):
        self.write({'state': 'cancelled'})
