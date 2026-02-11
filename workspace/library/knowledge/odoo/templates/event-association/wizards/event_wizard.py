# -*- coding: utf-8 -*-

from odoo import api, fields, models, _
from odoo.exceptions import UserError, ValidationError


class EventRegistrationWizard(models.TransientModel):
    """Wizard for quick event registration"""
    _name = 'association.event.registration.wizard'
    _description = 'Event Registration Wizard'

    event_id = fields.Many2one(
        'association.event',
        string='Event',
        required=True,
    )
    registration_type = fields.Selection([
        ('member', 'Member'),
        ('non_member', 'Non-Member'),
    ], string='Registration Type', default='member', required=True)
    member_id = fields.Many2one(
        'association.member',
        string='Member',
    )
    partner_id = fields.Many2one(
        'res.partner',
        string='Participant',
    )
    name = fields.Char(string='Name')
    email = fields.Char(string='Email')
    phone = fields.Char(string='Phone')
    guests = fields.Integer(
        string='Number of Guests',
        default=0,
    )
    amount = fields.Monetary(
        string='Registration Fee',
        compute='_compute_amount',
        store=True,
    )
    currency_id = fields.Many2one(
        'res.currency',
        string='Currency',
        default=lambda self: self.env.company.currency_id,
    )
    notes = fields.Text(string='Notes')

    @api.model
    def default_get(self, fields_list):
        res = super().default_get(fields_list)
        if self._context.get('default_event_id'):
            res['event_id'] = self._context['default_event_id']
        return res

    @api.depends('event_id', 'registration_type', 'guests')
    def _compute_amount(self):
        for wizard in self:
            if not wizard.event_id or wizard.event_id.is_free:
                wizard.amount = 0
            else:
                if wizard.registration_type == 'member':
                    base_price = wizard.event_id.price_member
                else:
                    base_price = wizard.event_id.price_non_member
                wizard.amount = base_price * (1 + wizard.guests)

    @api.onchange('member_id')
    def _onchange_member_id(self):
        if self.member_id:
            self.partner_id = self.member_id.partner_id
            self.name = self.member_id.name
            self.email = self.member_id.email
            self.phone = self.member_id.phone

    def action_register(self):
        """Create event registration"""
        self.ensure_one()

        # Validate event capacity
        if self.event_id.is_full:
            raise UserError(_('This event is full. No more registrations are accepted.'))

        total_seats = 1 + self.guests
        if self.event_id.seats_available < total_seats:
            raise UserError(
                _('Not enough seats available. Only %d seats remaining.') %
                self.event_id.seats_available
            )

        # Check registration deadline
        if self.event_id.registration_deadline and \
           fields.Date.today() > self.event_id.registration_deadline:
            raise UserError(_('Registration deadline has passed.'))

        # Check member-only event
        if self.event_id.member_only and self.registration_type != 'member':
            raise UserError(_('This event is only open to members.'))

        # Prepare values
        vals = {
            'event_id': self.event_id.id,
            'guests': self.guests,
            'amount': self.amount,
            'notes': self.notes,
        }

        if self.registration_type == 'member':
            if not self.member_id:
                raise UserError(_('Please select a member.'))
            vals['member_id'] = self.member_id.id
            vals['partner_id'] = self.member_id.partner_id.id
        else:
            if self.partner_id:
                vals['partner_id'] = self.partner_id.id
            else:
                # Create partner
                partner = self.env['res.partner'].create({
                    'name': self.name,
                    'email': self.email,
                    'phone': self.phone,
                })
                vals['partner_id'] = partner.id

        # Set state based on event settings
        if self.event_id.registration_approval:
            vals['state'] = 'pending'
        else:
            vals['state'] = 'confirmed'

        registration = self.env['association.event.registration'].create(vals)

        return {
            'type': 'ir.actions.act_window',
            'name': _('Registration'),
            'res_model': 'association.event.registration',
            'res_id': registration.id,
            'view_mode': 'form',
        }


class EventMassRegistrationWizard(models.TransientModel):
    """Wizard for registering multiple members to an event"""
    _name = 'association.event.mass.registration.wizard'
    _description = 'Mass Event Registration Wizard'

    event_id = fields.Many2one(
        'association.event',
        string='Event',
        required=True,
    )
    member_ids = fields.Many2many(
        'association.member',
        string='Members',
        required=True,
    )
    send_confirmation = fields.Boolean(
        string='Send Confirmation Email',
        default=True,
    )

    def action_register_all(self):
        """Register all selected members"""
        self.ensure_one()

        # Check capacity
        if self.event_id.seats_available < len(self.member_ids):
            raise UserError(
                _('Not enough seats. Available: %d, Requested: %d') %
                (self.event_id.seats_available, len(self.member_ids))
            )

        registrations = self.env['association.event.registration']

        for member in self.member_ids:
            # Check if already registered
            existing = self.env['association.event.registration'].search([
                ('event_id', '=', self.event_id.id),
                ('member_id', '=', member.id),
                ('state', 'not in', ['cancelled']),
            ], limit=1)

            if existing:
                continue

            # Determine price
            if self.event_id.is_free:
                amount = 0
            else:
                amount = self.event_id.price_member

            # Create registration
            vals = {
                'event_id': self.event_id.id,
                'member_id': member.id,
                'partner_id': member.partner_id.id,
                'amount': amount,
                'state': 'confirmed' if not self.event_id.registration_approval else 'pending',
            }

            registration = self.env['association.event.registration'].create(vals)
            registrations |= registration

            # Send confirmation
            if self.send_confirmation and member.email:
                registration._send_confirmation_email()

        return {
            'type': 'ir.actions.act_window',
            'name': _('Registrations'),
            'res_model': 'association.event.registration',
            'view_mode': 'tree,form',
            'domain': [('id', 'in', registrations.ids)],
        }


class EventAttendanceWizard(models.TransientModel):
    """Wizard to mark attendance for an event"""
    _name = 'association.event.attendance.wizard'
    _description = 'Event Attendance Wizard'

    event_id = fields.Many2one(
        'association.event',
        string='Event',
        required=True,
    )
    registration_ids = fields.Many2many(
        'association.event.registration',
        string='Registrations',
        compute='_compute_registrations',
    )
    attendance_line_ids = fields.One2many(
        'association.event.attendance.wizard.line',
        'wizard_id',
        string='Attendance',
    )

    @api.model
    def default_get(self, fields_list):
        res = super().default_get(fields_list)
        if self._context.get('active_id'):
            event = self.env['association.event'].browse(self._context['active_id'])
            res['event_id'] = event.id
        return res

    @api.depends('event_id')
    def _compute_registrations(self):
        for wizard in self:
            wizard.registration_ids = wizard.event_id.registration_ids.filtered(
                lambda r: r.state == 'confirmed'
            )

    @api.onchange('event_id')
    def _onchange_event_id(self):
        if self.event_id:
            lines = []
            for reg in self.event_id.registration_ids.filtered(lambda r: r.state == 'confirmed'):
                lines.append((0, 0, {
                    'registration_id': reg.id,
                    'partner_id': reg.partner_id.id,
                    'attended': reg.state == 'attended',
                }))
            self.attendance_line_ids = lines

    def action_mark_attendance(self):
        """Save attendance records"""
        self.ensure_one()

        for line in self.attendance_line_ids:
            if line.attended:
                line.registration_id.write({'state': 'attended'})

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Success'),
                'message': _('Attendance recorded successfully.'),
                'type': 'success',
            }
        }


class EventAttendanceWizardLine(models.TransientModel):
    """Line for attendance wizard"""
    _name = 'association.event.attendance.wizard.line'
    _description = 'Event Attendance Wizard Line'

    wizard_id = fields.Many2one(
        'association.event.attendance.wizard',
        string='Wizard',
    )
    registration_id = fields.Many2one(
        'association.event.registration',
        string='Registration',
    )
    partner_id = fields.Many2one(
        'res.partner',
        string='Participant',
        readonly=True,
    )
    attended = fields.Boolean(
        string='Attended',
        default=False,
    )


class EventDuplicateWizard(models.TransientModel):
    """Wizard to duplicate an event"""
    _name = 'association.event.duplicate.wizard'
    _description = 'Event Duplicate Wizard'

    event_id = fields.Many2one(
        'association.event',
        string='Original Event',
        required=True,
    )
    name = fields.Char(
        string='New Event Name',
        required=True,
    )
    date_start = fields.Datetime(
        string='Start Date',
        required=True,
    )
    date_end = fields.Datetime(
        string='End Date',
        required=True,
    )
    copy_registrations = fields.Boolean(
        string='Copy Registrations',
        default=False,
    )

    @api.model
    def default_get(self, fields_list):
        res = super().default_get(fields_list)
        if self._context.get('active_id'):
            event = self.env['association.event'].browse(self._context['active_id'])
            res['event_id'] = event.id
            res['name'] = _('%s (Copy)') % event.name
        return res

    def action_duplicate(self):
        """Create duplicate event"""
        self.ensure_one()

        new_event = self.event_id.copy({
            'name': self.name,
            'date_start': self.date_start,
            'date_end': self.date_end,
            'state': 'draft',
            'registration_ids': False,
        })

        if self.copy_registrations:
            for reg in self.event_id.registration_ids.filtered(lambda r: r.state == 'confirmed'):
                reg.copy({
                    'event_id': new_event.id,
                    'state': 'draft',
                })

        return {
            'type': 'ir.actions.act_window',
            'name': _('Event'),
            'res_model': 'association.event',
            'res_id': new_event.id,
            'view_mode': 'form',
        }
