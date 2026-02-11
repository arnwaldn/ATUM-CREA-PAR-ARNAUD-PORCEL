# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class AssociationActivity(models.Model):
    """Regular activities and workshops"""
    _name = 'association.activity'
    _description = 'Association Activity'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'name'

    name = fields.Char(
        string='Activity Name',
        required=True,
        tracking=True,
    )
    code = fields.Char(
        string='Code',
    )
    activity_type_id = fields.Many2one(
        'association.activity.type',
        string='Activity Type',
        required=True,
    )
    state = fields.Selection([
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('archived', 'Archived'),
    ], string='Status', default='draft', required=True, tracking=True)

    description = fields.Html(
        string='Description',
    )
    image = fields.Binary(
        string='Image',
    )

    # Schedule
    schedule_type = fields.Selection([
        ('weekly', 'Weekly'),
        ('biweekly', 'Bi-weekly'),
        ('monthly', 'Monthly'),
        ('custom', 'Custom'),
    ], string='Schedule Type', default='weekly')
    weekday = fields.Selection([
        ('0', 'Monday'),
        ('1', 'Tuesday'),
        ('2', 'Wednesday'),
        ('3', 'Thursday'),
        ('4', 'Friday'),
        ('5', 'Saturday'),
        ('6', 'Sunday'),
    ], string='Day of Week')
    time_start = fields.Float(
        string='Start Time',
    )
    time_end = fields.Float(
        string='End Time',
    )
    duration = fields.Float(
        string='Duration (hours)',
        compute='_compute_duration',
    )

    # Location
    venue_id = fields.Many2one(
        'association.venue',
        string='Venue',
    )
    room = fields.Char(
        string='Room',
    )

    # Capacity
    capacity_min = fields.Integer(
        string='Minimum Participants',
    )
    capacity_max = fields.Integer(
        string='Maximum Capacity',
    )
    participant_count = fields.Integer(
        string='Participants',
        compute='_compute_participant_count',
    )

    # Participation
    participation_ids = fields.One2many(
        'association.activity.participation',
        'activity_id',
        string='Participants',
    )
    member_only = fields.Boolean(
        string='Members Only',
        default=True,
    )

    # Pricing
    is_free = fields.Boolean(
        string='Free Activity',
        default=True,
    )
    fee_type = fields.Selection([
        ('per_session', 'Per Session'),
        ('monthly', 'Monthly'),
        ('trimester', 'Per Trimester'),
        ('annual', 'Annual'),
    ], string='Fee Type', default='monthly')
    fee_amount = fields.Monetary(
        string='Fee Amount',
    )
    currency_id = fields.Many2one(
        'res.currency',
        default=lambda self: self.env.company.currency_id,
    )

    # Instructor
    instructor_id = fields.Many2one(
        'association.member',
        string='Instructor',
    )
    instructor_external = fields.Char(
        string='External Instructor',
    )
    instructor_cost = fields.Monetary(
        string='Instructor Cost',
    )

    # Sessions
    session_ids = fields.One2many(
        'association.activity.session',
        'activity_id',
        string='Sessions',
    )
    session_count = fields.Integer(
        string='Sessions',
        compute='_compute_session_count',
    )

    # Season
    season_start = fields.Date(
        string='Season Start',
    )
    season_end = fields.Date(
        string='Season End',
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

    @api.depends('time_start', 'time_end')
    def _compute_duration(self):
        for activity in self:
            if activity.time_start and activity.time_end:
                activity.duration = activity.time_end - activity.time_start
            else:
                activity.duration = 0

    @api.depends('participation_ids')
    def _compute_participant_count(self):
        for activity in self:
            activity.participant_count = len(activity.participation_ids.filtered(
                lambda p: p.state == 'active'
            ))

    @api.depends('session_ids')
    def _compute_session_count(self):
        for activity in self:
            activity.session_count = len(activity.session_ids)

    def action_activate(self):
        """Activate the activity"""
        self.write({'state': 'active'})

    def action_suspend(self):
        """Suspend the activity"""
        self.write({'state': 'suspended'})

    def action_archive(self):
        """Archive the activity"""
        self.write({'state': 'archived'})


class AssociationActivityType(models.Model):
    """Activity type configuration"""
    _name = 'association.activity.type'
    _description = 'Activity Type'
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
    category = fields.Selection([
        ('sports', 'Sports'),
        ('culture', 'Culture'),
        ('education', 'Education'),
        ('social', 'Social'),
        ('wellness', 'Wellness'),
        ('other', 'Other'),
    ], string='Category', default='other')
    color = fields.Integer(
        string='Color',
    )


class AssociationActivityParticipation(models.Model):
    """Activity participation (enrollment)"""
    _name = 'association.activity.participation'
    _description = 'Activity Participation'
    _inherit = ['mail.thread']
    _order = 'create_date desc'

    activity_id = fields.Many2one(
        'association.activity',
        string='Activity',
        required=True,
        ondelete='cascade',
    )
    member_id = fields.Many2one(
        'association.member',
        string='Member',
        required=True,
    )
    state = fields.Selection([
        ('draft', 'Draft'),
        ('pending', 'Pending Payment'),
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('cancelled', 'Cancelled'),
    ], string='Status', default='draft', required=True, tracking=True)

    enrollment_date = fields.Date(
        string='Enrollment Date',
        default=fields.Date.today,
    )
    start_date = fields.Date(
        string='Start Date',
    )
    end_date = fields.Date(
        string='End Date',
    )

    # Payment
    fee_amount = fields.Monetary(
        string='Fee',
        compute='_compute_fee',
        store=True,
    )
    currency_id = fields.Many2one(
        related='activity_id.currency_id',
    )
    payment_state = fields.Selection([
        ('not_required', 'Not Required'),
        ('pending', 'Pending'),
        ('paid', 'Paid'),
    ], string='Payment', default='not_required')

    # Attendance
    attendance_count = fields.Integer(
        string='Attendance Count',
        compute='_compute_attendance',
    )
    absence_count = fields.Integer(
        string='Absence Count',
        compute='_compute_attendance',
    )

    notes = fields.Text(
        string='Notes',
    )

    @api.depends('activity_id', 'activity_id.fee_amount', 'activity_id.is_free')
    def _compute_fee(self):
        for participation in self:
            if participation.activity_id.is_free:
                participation.fee_amount = 0
            else:
                participation.fee_amount = participation.activity_id.fee_amount

    def _compute_attendance(self):
        for participation in self:
            attendances = self.env['association.activity.attendance'].search([
                ('session_id.activity_id', '=', participation.activity_id.id),
                ('member_id', '=', participation.member_id.id),
            ])
            participation.attendance_count = len(attendances.filtered(lambda a: a.present))
            participation.absence_count = len(attendances.filtered(lambda a: not a.present))

    def action_confirm(self):
        """Confirm participation"""
        self.write({'state': 'active'})

    def action_suspend(self):
        """Suspend participation"""
        self.write({'state': 'suspended'})

    def action_cancel(self):
        """Cancel participation"""
        self.write({'state': 'cancelled'})


class AssociationActivitySession(models.Model):
    """Activity session (occurrence)"""
    _name = 'association.activity.session'
    _description = 'Activity Session'
    _order = 'date desc'

    activity_id = fields.Many2one(
        'association.activity',
        string='Activity',
        required=True,
        ondelete='cascade',
    )
    date = fields.Date(
        string='Date',
        required=True,
    )
    time_start = fields.Float(
        string='Start Time',
    )
    time_end = fields.Float(
        string='End Time',
    )
    venue_id = fields.Many2one(
        'association.venue',
        string='Venue',
    )
    instructor_id = fields.Many2one(
        'association.member',
        string='Instructor',
    )
    state = fields.Selection([
        ('scheduled', 'Scheduled'),
        ('done', 'Done'),
        ('cancelled', 'Cancelled'),
    ], string='Status', default='scheduled')
    attendance_ids = fields.One2many(
        'association.activity.attendance',
        'session_id',
        string='Attendance',
    )
    attendance_count = fields.Integer(
        string='Present',
        compute='_compute_attendance_count',
    )
    notes = fields.Text(
        string='Notes',
    )

    @api.depends('attendance_ids.present')
    def _compute_attendance_count(self):
        for session in self:
            session.attendance_count = len(session.attendance_ids.filtered('present'))


class AssociationActivityAttendance(models.Model):
    """Attendance tracking for activity sessions"""
    _name = 'association.activity.attendance'
    _description = 'Activity Attendance'
    _order = 'session_id, member_id'

    session_id = fields.Many2one(
        'association.activity.session',
        string='Session',
        required=True,
        ondelete='cascade',
    )
    member_id = fields.Many2one(
        'association.member',
        string='Member',
        required=True,
    )
    present = fields.Boolean(
        string='Present',
        default=True,
    )
    notes = fields.Char(
        string='Notes',
    )
