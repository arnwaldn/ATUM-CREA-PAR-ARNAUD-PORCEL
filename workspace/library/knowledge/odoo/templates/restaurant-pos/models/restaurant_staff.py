# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from datetime import datetime, timedelta


class RestaurantStaff(models.Model):
    """Restaurant staff management"""
    _name = 'restaurant.staff'
    _description = 'Restaurant Staff'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'name'

    name = fields.Char(
        string='Name',
        required=True,
        tracking=True,
    )
    employee_id = fields.Many2one(
        'hr.employee',
        string='Employee',
    )
    user_id = fields.Many2one(
        'res.users',
        string='User',
    )
    position = fields.Selection([
        ('manager', 'Manager'),
        ('waiter', 'Waiter/Waitress'),
        ('bartender', 'Bartender'),
        ('chef', 'Chef'),
        ('cook', 'Cook'),
        ('host', 'Host/Hostess'),
        ('busser', 'Busser'),
        ('dishwasher', 'Dishwasher'),
    ], string='Position', required=True, tracking=True)
    active = fields.Boolean(
        string='Active',
        default=True,
    )
    phone = fields.Char(
        string='Phone',
    )
    email = fields.Char(
        string='Email',
    )
    image = fields.Binary(
        string='Photo',
    )
    pin = fields.Char(
        string='PIN',
        help='4-digit PIN for POS login',
    )
    hourly_rate = fields.Float(
        string='Hourly Rate',
    )
    hire_date = fields.Date(
        string='Hire Date',
    )

    # Performance metrics
    order_count = fields.Integer(
        string='Orders Served',
        compute='_compute_metrics',
    )
    total_sales = fields.Monetary(
        string='Total Sales',
        compute='_compute_metrics',
    )
    avg_tip = fields.Monetary(
        string='Average Tip',
        compute='_compute_metrics',
    )
    currency_id = fields.Many2one(
        'res.currency',
        default=lambda self: self.env.company.currency_id,
    )

    # Current shift
    current_shift_id = fields.Many2one(
        'restaurant.shift',
        string='Current Shift',
        compute='_compute_current_shift',
    )
    is_on_shift = fields.Boolean(
        string='On Shift',
        compute='_compute_current_shift',
    )

    company_id = fields.Many2one(
        'res.company',
        string='Company',
        required=True,
        default=lambda self: self.env.company,
    )

    _sql_constraints = [
        ('pin_unique', 'UNIQUE(pin, company_id)',
         'PIN must be unique per company!'),
    ]

    @api.constrains('pin')
    def _check_pin(self):
        for staff in self:
            if staff.pin and (not staff.pin.isdigit() or len(staff.pin) != 4):
                raise ValidationError(_('PIN must be exactly 4 digits.'))

    def _compute_metrics(self):
        for staff in self:
            orders = self.env['restaurant.order'].search([
                ('waiter_id', '=', staff.id),
                ('state', '=', 'paid'),
            ])
            staff.order_count = len(orders)
            staff.total_sales = sum(orders.mapped('total'))
            if orders:
                staff.avg_tip = sum(orders.mapped('tip_amount')) / len(orders)
            else:
                staff.avg_tip = 0

    def _compute_current_shift(self):
        now = fields.Datetime.now()
        for staff in self:
            shift = self.env['restaurant.shift'].search([
                ('staff_id', '=', staff.id),
                ('start_datetime', '<=', now),
                ('end_datetime', '>=', now),
                ('state', '=', 'active'),
            ], limit=1)
            staff.current_shift_id = shift
            staff.is_on_shift = bool(shift)

    def action_start_shift(self):
        """Start a new shift"""
        self.ensure_one()
        if self.is_on_shift:
            raise UserError(_('Already on an active shift.'))
        self.env['restaurant.shift'].create({
            'staff_id': self.id,
            'start_datetime': fields.Datetime.now(),
            'state': 'active',
        })

    def action_end_shift(self):
        """End current shift"""
        self.ensure_one()
        if self.current_shift_id:
            self.current_shift_id.write({
                'end_datetime': fields.Datetime.now(),
                'state': 'completed',
            })


class RestaurantShift(models.Model):
    """Staff shift tracking"""
    _name = 'restaurant.shift'
    _description = 'Staff Shift'
    _order = 'start_datetime desc'

    staff_id = fields.Many2one(
        'restaurant.staff',
        string='Staff Member',
        required=True,
        ondelete='cascade',
    )
    start_datetime = fields.Datetime(
        string='Start Time',
        required=True,
    )
    end_datetime = fields.Datetime(
        string='End Time',
    )
    scheduled_start = fields.Datetime(
        string='Scheduled Start',
    )
    scheduled_end = fields.Datetime(
        string='Scheduled End',
    )
    state = fields.Selection([
        ('scheduled', 'Scheduled'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('absent', 'Absent'),
    ], string='Status', default='scheduled', required=True)
    duration = fields.Float(
        string='Duration (hours)',
        compute='_compute_duration',
        store=True,
    )
    break_minutes = fields.Integer(
        string='Break (minutes)',
        default=0,
    )
    notes = fields.Text(
        string='Notes',
    )

    # Shift statistics
    order_count = fields.Integer(
        string='Orders',
        compute='_compute_shift_stats',
    )
    total_sales = fields.Monetary(
        string='Sales',
        compute='_compute_shift_stats',
    )
    total_tips = fields.Monetary(
        string='Tips',
        compute='_compute_shift_stats',
    )
    currency_id = fields.Many2one(
        'res.currency',
        default=lambda self: self.env.company.currency_id,
    )

    company_id = fields.Many2one(
        related='staff_id.company_id',
        store=True,
    )

    @api.depends('start_datetime', 'end_datetime', 'break_minutes')
    def _compute_duration(self):
        for shift in self:
            if shift.start_datetime and shift.end_datetime:
                delta = shift.end_datetime - shift.start_datetime
                hours = delta.total_seconds() / 3600
                shift.duration = hours - (shift.break_minutes / 60)
            else:
                shift.duration = 0

    def _compute_shift_stats(self):
        for shift in self:
            orders = self.env['restaurant.order'].search([
                ('waiter_id', '=', shift.staff_id.id),
                ('state', '=', 'paid'),
                ('order_datetime', '>=', shift.start_datetime),
                ('order_datetime', '<=', shift.end_datetime or fields.Datetime.now()),
            ])
            shift.order_count = len(orders)
            shift.total_sales = sum(orders.mapped('total'))
            shift.total_tips = sum(orders.mapped('tip_amount'))
