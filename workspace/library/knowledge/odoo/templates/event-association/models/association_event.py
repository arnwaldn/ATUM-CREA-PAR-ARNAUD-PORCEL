# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError
from datetime import datetime, timedelta


class AssociationEvent(models.Model):
    """Association event management"""
    _name = 'association.event'
    _description = 'Association Event'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'date_start desc'

    name = fields.Char(
        string='Event Name',
        required=True,
        tracking=True,
    )
    code = fields.Char(
        string='Code',
        required=True,
        readonly=True,
        default='New',
        copy=False,
    )
    event_type_id = fields.Many2one(
        'association.event.type',
        string='Event Type',
        required=True,
    )
    state = fields.Selection([
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('ongoing', 'Ongoing'),
        ('done', 'Done'),
        ('cancelled', 'Cancelled'),
    ], string='Status', default='draft', required=True, tracking=True)

    # Description
    description = fields.Html(
        string='Description',
    )
    short_description = fields.Text(
        string='Short Description',
    )
    image = fields.Binary(
        string='Event Image',
    )

    # Dates
    date_start = fields.Datetime(
        string='Start Date',
        required=True,
        tracking=True,
    )
    date_end = fields.Datetime(
        string='End Date',
        required=True,
    )
    registration_deadline = fields.Datetime(
        string='Registration Deadline',
    )
    date_published = fields.Datetime(
        string='Published Date',
    )

    # Location
    location_type = fields.Selection([
        ('physical', 'Physical'),
        ('online', 'Online'),
        ('hybrid', 'Hybrid'),
    ], string='Location Type', default='physical', required=True)
    venue_id = fields.Many2one(
        'association.venue',
        string='Venue',
    )
    address = fields.Text(
        string='Address',
    )
    online_link = fields.Char(
        string='Online Meeting Link',
    )

    # Capacity
    capacity_min = fields.Integer(
        string='Minimum Participants',
    )
    capacity_max = fields.Integer(
        string='Maximum Capacity',
    )
    registration_count = fields.Integer(
        string='Registrations',
        compute='_compute_registration_count',
        store=True,
    )
    seats_available = fields.Integer(
        string='Available Seats',
        compute='_compute_seats_available',
    )
    is_full = fields.Boolean(
        string='Full',
        compute='_compute_seats_available',
    )

    # Pricing
    is_free = fields.Boolean(
        string='Free Event',
        default=True,
    )
    price_member = fields.Monetary(
        string='Member Price',
    )
    price_non_member = fields.Monetary(
        string='Non-Member Price',
    )
    currency_id = fields.Many2one(
        'res.currency',
        default=lambda self: self.env.company.currency_id,
    )

    # Registrations
    registration_ids = fields.One2many(
        'association.event.registration',
        'event_id',
        string='Registrations',
    )
    member_only = fields.Boolean(
        string='Members Only',
        default=False,
    )
    registration_approval = fields.Boolean(
        string='Require Approval',
        default=False,
    )

    # Organization
    organizer_id = fields.Many2one(
        'association.member',
        string='Organizer',
    )
    responsible_id = fields.Many2one(
        'res.users',
        string='Responsible',
        default=lambda self: self.env.user,
    )
    volunteer_ids = fields.Many2many(
        'association.member',
        'event_volunteer_rel',
        'event_id',
        'member_id',
        string='Volunteers',
    )

    # Calendar integration
    calendar_event_id = fields.Many2one(
        'calendar.event',
        string='Calendar Event',
    )

    notes = fields.Text(
        string='Internal Notes',
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
            if vals.get('code', 'New') == 'New':
                vals['code'] = self.env['ir.sequence'].next_by_code('association.event') or 'New'
        return super().create(vals_list)

    @api.depends('registration_ids', 'registration_ids.state')
    def _compute_registration_count(self):
        for event in self:
            event.registration_count = len(event.registration_ids.filtered(
                lambda r: r.state in ('confirmed', 'attended')
            ))

    @api.depends('capacity_max', 'registration_count')
    def _compute_seats_available(self):
        for event in self:
            if event.capacity_max:
                event.seats_available = event.capacity_max - event.registration_count
                event.is_full = event.seats_available <= 0
            else:
                event.seats_available = -1  # Unlimited
                event.is_full = False

    @api.constrains('date_start', 'date_end')
    def _check_dates(self):
        for event in self:
            if event.date_end < event.date_start:
                raise ValidationError(_('End date cannot be before start date.'))

    def action_publish(self):
        """Publish the event"""
        self.write({
            'state': 'published',
            'date_published': fields.Datetime.now(),
        })

    def action_start(self):
        """Mark event as ongoing"""
        self.write({'state': 'ongoing'})

    def action_done(self):
        """Mark event as done"""
        self.write({'state': 'done'})

    def action_cancel(self):
        """Cancel the event"""
        for event in self:
            # Notify registered participants
            for reg in event.registration_ids.filtered(lambda r: r.state == 'confirmed'):
                template = self.env.ref('event_association.mail_template_event_cancelled',
                                        raise_if_not_found=False)
                if template:
                    template.send_mail(reg.id, force_send=True)
            event.write({'state': 'cancelled'})

    def action_open_registrations(self):
        """View event registrations"""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': _('Registrations'),
            'res_model': 'association.event.registration',
            'view_mode': 'tree,form',
            'domain': [('event_id', '=', self.id)],
            'context': {'default_event_id': self.id},
        }


class AssociationEventType(models.Model):
    """Event type configuration"""
    _name = 'association.event.type'
    _description = 'Event Type'
    _order = 'sequence, name'

    name = fields.Char(
        string='Type Name',
        required=True,
        translate=True,
    )
    code = fields.Char(
        string='Code',
    )
    sequence = fields.Integer(
        string='Sequence',
        default=10,
    )
    description = fields.Text(
        string='Description',
    )
    color = fields.Integer(
        string='Color',
    )


class AssociationEventRegistration(models.Model):
    """Event registration"""
    _name = 'association.event.registration'
    _description = 'Event Registration'
    _inherit = ['mail.thread']
    _order = 'create_date desc'

    event_id = fields.Many2one(
        'association.event',
        string='Event',
        required=True,
        ondelete='cascade',
    )
    member_id = fields.Many2one(
        'association.member',
        string='Member',
    )
    partner_id = fields.Many2one(
        'res.partner',
        string='Contact',
        required=True,
    )
    name = fields.Char(
        string='Participant Name',
        related='partner_id.name',
    )
    email = fields.Char(
        string='Email',
        related='partner_id.email',
    )
    phone = fields.Char(
        string='Phone',
        related='partner_id.phone',
    )
    state = fields.Selection([
        ('draft', 'Draft'),
        ('pending', 'Pending Approval'),
        ('confirmed', 'Confirmed'),
        ('attended', 'Attended'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ], string='Status', default='draft', required=True, tracking=True)

    registration_date = fields.Datetime(
        string='Registration Date',
        default=fields.Datetime.now,
    )
    is_member = fields.Boolean(
        string='Is Member',
        compute='_compute_is_member',
        store=True,
    )

    # Payment
    amount = fields.Monetary(
        string='Amount',
        compute='_compute_amount',
        store=True,
    )
    currency_id = fields.Many2one(
        related='event_id.currency_id',
    )
    payment_state = fields.Selection([
        ('not_required', 'Not Required'),
        ('pending', 'Pending'),
        ('paid', 'Paid'),
    ], string='Payment', default='not_required')

    # Additional info
    guests = fields.Integer(
        string='Additional Guests',
        default=0,
    )
    dietary_requirements = fields.Char(
        string='Dietary Requirements',
    )
    special_needs = fields.Text(
        string='Special Needs',
    )
    notes = fields.Text(
        string='Notes',
    )

    @api.depends('member_id')
    def _compute_is_member(self):
        for reg in self:
            reg.is_member = bool(reg.member_id)

    @api.depends('event_id', 'is_member')
    def _compute_amount(self):
        for reg in self:
            if reg.event_id.is_free:
                reg.amount = 0
            elif reg.is_member:
                reg.amount = reg.event_id.price_member
            else:
                reg.amount = reg.event_id.price_non_member

    def action_confirm(self):
        """Confirm registration"""
        for reg in self:
            if reg.event_id.is_full:
                raise UserError(_('Event is full. Registration cannot be confirmed.'))
            reg.write({'state': 'confirmed'})

    def action_attend(self):
        """Mark as attended"""
        self.write({'state': 'attended'})

    def action_cancel(self):
        """Cancel registration"""
        self.write({'state': 'cancelled'})

    def action_no_show(self):
        """Mark as no show"""
        self.write({'state': 'no_show'})


class AssociationVenue(models.Model):
    """Venue management"""
    _name = 'association.venue'
    _description = 'Venue'
    _order = 'name'

    name = fields.Char(
        string='Venue Name',
        required=True,
    )
    code = fields.Char(
        string='Code',
    )
    venue_type = fields.Selection([
        ('internal', 'Internal'),
        ('external', 'External'),
        ('partner', 'Partner Venue'),
    ], string='Type', default='internal')
    address = fields.Text(
        string='Address',
    )
    capacity = fields.Integer(
        string='Capacity',
    )
    contact_name = fields.Char(
        string='Contact Person',
    )
    contact_phone = fields.Char(
        string='Contact Phone',
    )
    contact_email = fields.Char(
        string='Contact Email',
    )
    facilities = fields.Text(
        string='Facilities',
    )
    rental_cost = fields.Monetary(
        string='Rental Cost',
    )
    currency_id = fields.Many2one(
        'res.currency',
        default=lambda self: self.env.company.currency_id,
    )
    active = fields.Boolean(
        string='Active',
        default=True,
    )
    notes = fields.Text(
        string='Notes',
    )
