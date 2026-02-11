# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import UserError, ValidationError
from datetime import timedelta


class FsmIntervention(models.Model):
    _name = 'fsm.intervention'
    _description = 'Field Service Intervention'
    _inherit = ['mail.thread', 'mail.activity.mixin', 'portal.mixin']
    _order = 'scheduled_date, priority desc'

    name = fields.Char(
        string='Reference', required=True, copy=False, readonly=True,
        default=lambda self: self.env['ir.sequence'].next_by_code('fsm.intervention'))

    # Type and Priority
    intervention_type_id = fields.Many2one(
        'fsm.intervention.type', string='Type', required=True, tracking=True)
    priority = fields.Selection([
        ('0', 'Low'),
        ('1', 'Normal'),
        ('2', 'High'),
        ('3', 'Urgent'),
    ], string='Priority', default='1', tracking=True)

    # Customer
    partner_id = fields.Many2one(
        'res.partner', string='Customer', required=True, tracking=True)
    partner_phone = fields.Char(related='partner_id.phone', string='Phone')
    contact_name = fields.Char(string='Contact Person')
    contact_phone = fields.Char(string='Contact Phone')

    # Equipment
    equipment_id = fields.Many2one(
        'fsm.equipment', string='Equipment',
        domain="[('partner_id', '=', partner_id)]")
    equipment_serial = fields.Char(
        related='equipment_id.serial_number', string='Serial')

    # Contract
    contract_id = fields.Many2one(
        'fsm.contract', string='Contract',
        domain="[('partner_id', '=', partner_id), ('state', '=', 'active')]")
    under_contract = fields.Boolean(
        string='Under Contract', compute='_compute_under_contract')

    # Location
    location_street = fields.Char(string='Street')
    location_city = fields.Char(string='City')
    location_zip = fields.Char(string='Zip')
    location_notes = fields.Text(string='Access Notes')
    latitude = fields.Float(string='Latitude')
    longitude = fields.Float(string='Longitude')

    # Schedule
    scheduled_date = fields.Datetime(
        string='Scheduled Date', required=True, tracking=True)
    scheduled_end = fields.Datetime(
        string='Scheduled End', compute='_compute_scheduled_end', store=True)
    duration_planned = fields.Float(
        string='Planned Duration (hours)', default=1.0)

    # Technician
    technician_id = fields.Many2one(
        'fsm.technician', string='Technician', tracking=True)
    technician_user_id = fields.Many2one(
        related='technician_id.user_id', string='Technician User')

    # Execution
    start_datetime = fields.Datetime(string='Started At')
    end_datetime = fields.Datetime(string='Completed At')
    actual_duration = fields.Float(
        string='Actual Duration', compute='_compute_actual_duration',
        store=True)
    travel_time = fields.Float(string='Travel Time (hours)')
    completion_date = fields.Datetime(string='Completion Date')

    # Description
    description = fields.Text(string='Problem Description')
    work_done = fields.Html(string='Work Performed')
    resolution_notes = fields.Text(string='Resolution Notes')

    # Parts Used
    part_ids = fields.One2many(
        'fsm.intervention.part', 'intervention_id', string='Parts Used')
    parts_total = fields.Monetary(
        string='Parts Total', compute='_compute_totals',
        currency_field='currency_id')

    # Time Entries
    time_ids = fields.One2many(
        'fsm.intervention.time', 'intervention_id', string='Time Entries')
    labor_total = fields.Monetary(
        string='Labor Total', compute='_compute_totals',
        currency_field='currency_id')

    # Totals
    currency_id = fields.Many2one(
        'res.currency', default=lambda self: self.env.company.currency_id)
    total_amount = fields.Monetary(
        string='Total Amount', compute='_compute_totals',
        currency_field='currency_id')

    # Billing
    billable = fields.Boolean(string='Billable', default=True)
    invoice_id = fields.Many2one('account.move', string='Invoice', copy=False)
    invoice_status = fields.Selection([
        ('no', 'Nothing to Invoice'),
        ('to_invoice', 'To Invoice'),
        ('invoiced', 'Invoiced'),
    ], string='Invoice Status', compute='_compute_invoice_status')

    # SLA
    sla_response_deadline = fields.Datetime(
        string='Response Deadline', compute='_compute_sla', store=True)
    sla_resolution_deadline = fields.Datetime(
        string='Resolution Deadline', compute='_compute_sla', store=True)
    sla_response_met = fields.Boolean(
        string='Response SLA Met', compute='_compute_sla_status')
    sla_resolution_met = fields.Boolean(
        string='Resolution SLA Met', compute='_compute_sla_status')

    # Status
    state = fields.Selection([
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('done', 'Completed'),
        ('cancelled', 'Cancelled'),
    ], string='Status', default='draft', tracking=True)

    # Customer Feedback
    customer_rating = fields.Selection([
        ('1', '1 Star'),
        ('2', '2 Stars'),
        ('3', '3 Stars'),
        ('4', '4 Stars'),
        ('5', '5 Stars'),
    ], string='Customer Rating')
    customer_feedback = fields.Text(string='Customer Feedback')

    # Signatures
    technician_signature = fields.Binary(string='Technician Signature')
    customer_signature = fields.Binary(string='Customer Signature')

    # Calendar
    calendar_event_id = fields.Many2one('calendar.event', string='Calendar Event')

    notes = fields.Text(string='Internal Notes')

    @api.depends('contract_id')
    def _compute_under_contract(self):
        for intervention in self:
            intervention.under_contract = bool(
                intervention.contract_id and
                intervention.contract_id.state == 'active')

    @api.depends('scheduled_date', 'duration_planned')
    def _compute_scheduled_end(self):
        for intervention in self:
            if intervention.scheduled_date and intervention.duration_planned:
                intervention.scheduled_end = intervention.scheduled_date + timedelta(
                    hours=intervention.duration_planned)
            else:
                intervention.scheduled_end = False

    @api.depends('start_datetime', 'end_datetime')
    def _compute_actual_duration(self):
        for intervention in self:
            if intervention.start_datetime and intervention.end_datetime:
                delta = intervention.end_datetime - intervention.start_datetime
                intervention.actual_duration = delta.total_seconds() / 3600
            else:
                intervention.actual_duration = 0

    @api.depends('part_ids.subtotal', 'time_ids.amount')
    def _compute_totals(self):
        for intervention in self:
            intervention.parts_total = sum(intervention.part_ids.mapped('subtotal'))
            intervention.labor_total = sum(intervention.time_ids.mapped('amount'))
            intervention.total_amount = (
                intervention.parts_total + intervention.labor_total)

    @api.depends('billable', 'invoice_id', 'state')
    def _compute_invoice_status(self):
        for intervention in self:
            if not intervention.billable or intervention.under_contract:
                intervention.invoice_status = 'no'
            elif intervention.invoice_id:
                intervention.invoice_status = 'invoiced'
            elif intervention.state == 'done':
                intervention.invoice_status = 'to_invoice'
            else:
                intervention.invoice_status = 'no'

    @api.depends('intervention_type_id', 'create_date')
    def _compute_sla(self):
        for intervention in self:
            itype = intervention.intervention_type_id
            create_date = intervention.create_date or fields.Datetime.now()
            if itype and itype.sla_response_hours:
                intervention.sla_response_deadline = create_date + timedelta(
                    hours=itype.sla_response_hours)
            else:
                intervention.sla_response_deadline = False
            if itype and itype.sla_resolution_hours:
                intervention.sla_resolution_deadline = create_date + timedelta(
                    hours=itype.sla_resolution_hours)
            else:
                intervention.sla_resolution_deadline = False

    @api.depends('sla_response_deadline', 'sla_resolution_deadline',
                 'start_datetime', 'end_datetime')
    def _compute_sla_status(self):
        for intervention in self:
            intervention.sla_response_met = (
                not intervention.sla_response_deadline or
                (intervention.start_datetime and
                 intervention.start_datetime <= intervention.sla_response_deadline))
            intervention.sla_resolution_met = (
                not intervention.sla_resolution_deadline or
                (intervention.end_datetime and
                 intervention.end_datetime <= intervention.sla_resolution_deadline))

    @api.onchange('equipment_id')
    def _onchange_equipment_id(self):
        if self.equipment_id:
            self.location_street = self.equipment_id.location_street
            self.location_city = self.equipment_id.location_city
            self.location_zip = self.equipment_id.location_zip
            self.location_notes = self.equipment_id.location_notes
            self.latitude = self.equipment_id.latitude
            self.longitude = self.equipment_id.longitude
            if self.equipment_id.contract_id:
                self.contract_id = self.equipment_id.contract_id

    @api.onchange('intervention_type_id')
    def _onchange_intervention_type(self):
        if self.intervention_type_id:
            self.duration_planned = self.intervention_type_id.default_duration
            self.priority = self.intervention_type_id.default_priority
            self.billable = self.intervention_type_id.billable

    def action_schedule(self):
        for intervention in self:
            if not intervention.technician_id:
                raise UserError('Please assign a technician before scheduling.')
            if not intervention.scheduled_date:
                raise UserError('Please set a scheduled date.')
            intervention.state = 'scheduled'
            intervention._create_calendar_event()

    def action_start(self):
        self.write({
            'state': 'in_progress',
            'start_datetime': fields.Datetime.now(),
        })
        # Update technician status
        self.mapped('technician_id').write({
            'availability_status': 'on_intervention',
            'available': False,
        })

    def action_complete(self):
        now = fields.Datetime.now()
        self.write({
            'state': 'done',
            'end_datetime': now,
            'completion_date': now,
        })
        # Update technician status
        self.mapped('technician_id').write({
            'availability_status': 'available',
            'available': True,
        })
        # Update equipment last maintenance
        for intervention in self:
            if intervention.equipment_id:
                intervention.equipment_id.write({
                    'last_maintenance_date': now.date(),
                    'state': 'operational',
                })

    def action_cancel(self):
        self.write({'state': 'cancelled'})
        # Delete calendar events
        for intervention in self:
            if intervention.calendar_event_id:
                intervention.calendar_event_id.unlink()

    def _create_calendar_event(self):
        self.ensure_one()
        if self.calendar_event_id:
            self.calendar_event_id.unlink()

        event = self.env['calendar.event'].create({
            'name': f'[{self.name}] {self.partner_id.name}',
            'start': self.scheduled_date,
            'stop': self.scheduled_end,
            'user_id': self.technician_id.user_id.id if self.technician_id else self.env.uid,
            'description': f"""
Intervention: {self.name}
Customer: {self.partner_id.name}
Location: {self.location_street or ''}, {self.location_city or ''}
Equipment: {self.equipment_id.name if self.equipment_id else 'N/A'}
            """.strip(),
        })
        self.calendar_event_id = event

    def action_create_invoice(self):
        self.ensure_one()
        if self.invoice_id:
            raise UserError('An invoice already exists for this intervention.')
        if not self.billable:
            raise UserError('This intervention is not billable.')

        invoice_lines = []

        # Labor lines
        for time_entry in self.time_ids:
            invoice_lines.append((0, 0, {
                'name': f'Labor - {self.name}',
                'quantity': time_entry.duration,
                'price_unit': time_entry.hourly_rate,
            }))

        # Parts lines
        for part in self.part_ids:
            invoice_lines.append((0, 0, {
                'name': f'{part.product_id.name}',
                'product_id': part.product_id.id,
                'quantity': part.quantity,
                'price_unit': part.unit_price,
            }))

        if not invoice_lines:
            raise UserError('No labor or parts to invoice.')

        invoice = self.env['account.move'].create({
            'move_type': 'out_invoice',
            'partner_id': self.partner_id.id,
            'invoice_date': fields.Date.today(),
            'invoice_line_ids': invoice_lines,
        })
        self.invoice_id = invoice

        return {
            'type': 'ir.actions.act_window',
            'res_model': 'account.move',
            'res_id': invoice.id,
            'view_mode': 'form',
        }


class FsmInterventionPart(models.Model):
    _name = 'fsm.intervention.part'
    _description = 'Intervention Part'

    intervention_id = fields.Many2one(
        'fsm.intervention', string='Intervention',
        required=True, ondelete='cascade')
    product_id = fields.Many2one(
        'product.product', string='Part', required=True,
        domain=[('type', 'in', ['product', 'consu'])])
    quantity = fields.Float(string='Quantity', default=1.0)
    unit_price = fields.Monetary(
        string='Unit Price', currency_field='currency_id')
    currency_id = fields.Many2one(
        related='intervention_id.currency_id', store=True)
    subtotal = fields.Monetary(
        string='Subtotal', compute='_compute_subtotal',
        currency_field='currency_id')

    @api.depends('quantity', 'unit_price')
    def _compute_subtotal(self):
        for part in self:
            part.subtotal = part.quantity * part.unit_price

    @api.onchange('product_id')
    def _onchange_product_id(self):
        if self.product_id:
            self.unit_price = self.product_id.list_price


class FsmInterventionTime(models.Model):
    _name = 'fsm.intervention.time'
    _description = 'Intervention Time Entry'

    intervention_id = fields.Many2one(
        'fsm.intervention', string='Intervention',
        required=True, ondelete='cascade')
    technician_id = fields.Many2one(
        'fsm.technician', string='Technician')
    date = fields.Date(string='Date', default=fields.Date.today)
    duration = fields.Float(string='Duration (hours)', required=True)
    hourly_rate = fields.Monetary(
        string='Hourly Rate', currency_field='currency_id')
    currency_id = fields.Many2one(
        related='intervention_id.currency_id', store=True)
    amount = fields.Monetary(
        string='Amount', compute='_compute_amount',
        currency_field='currency_id')
    description = fields.Char(string='Description')

    @api.depends('duration', 'hourly_rate')
    def _compute_amount(self):
        for entry in self:
            entry.amount = entry.duration * entry.hourly_rate
