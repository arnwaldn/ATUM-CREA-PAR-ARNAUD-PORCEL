# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from datetime import date
from dateutil.relativedelta import relativedelta


class AssociationMember(models.Model):
    """Association member management"""
    _name = 'association.member'
    _description = 'Association Member'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _inherits = {'res.partner': 'partner_id'}
    _order = 'name'

    partner_id = fields.Many2one(
        'res.partner',
        string='Contact',
        required=True,
        ondelete='cascade',
    )
    member_number = fields.Char(
        string='Member Number',
        required=True,
        readonly=True,
        default='New',
        copy=False,
    )
    member_type_id = fields.Many2one(
        'association.member.type',
        string='Member Type',
        required=True,
        tracking=True,
    )
    state = fields.Selection([
        ('prospect', 'Prospect'),
        ('pending', 'Pending Approval'),
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ], string='Status', default='prospect', required=True, tracking=True)

    # Dates
    join_date = fields.Date(
        string='Join Date',
    )
    membership_start = fields.Date(
        string='Membership Start',
    )
    membership_end = fields.Date(
        string='Membership End',
        tracking=True,
    )
    birth_date = fields.Date(
        string='Birth Date',
    )
    age = fields.Integer(
        string='Age',
        compute='_compute_age',
    )

    # Personal info
    gender = fields.Selection([
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ], string='Gender')
    nationality = fields.Many2one(
        'res.country',
        string='Nationality',
    )
    occupation = fields.Char(
        string='Occupation',
    )
    emergency_contact = fields.Char(
        string='Emergency Contact',
    )
    emergency_phone = fields.Char(
        string='Emergency Phone',
    )

    # Membership
    membership_ids = fields.One2many(
        'association.membership',
        'member_id',
        string='Membership History',
    )
    current_membership_id = fields.Many2one(
        'association.membership',
        string='Current Membership',
        compute='_compute_current_membership',
    )
    is_member_active = fields.Boolean(
        string='Active Member',
        compute='_compute_is_member_active',
        store=True,
    )

    # Participation
    event_registration_ids = fields.One2many(
        'association.event.registration',
        'member_id',
        string='Event Registrations',
    )
    activity_participation_ids = fields.One2many(
        'association.activity.participation',
        'member_id',
        string='Activity Participations',
    )
    volunteer_ids = fields.One2many(
        'association.volunteer',
        'member_id',
        string='Volunteer Activities',
    )
    donation_ids = fields.One2many(
        'association.donation',
        'member_id',
        string='Donations',
    )

    # Statistics
    event_count = fields.Integer(
        string='Events Attended',
        compute='_compute_stats',
    )
    activity_count = fields.Integer(
        string='Activities',
        compute='_compute_stats',
    )
    volunteer_hours = fields.Float(
        string='Volunteer Hours',
        compute='_compute_stats',
    )
    total_donations = fields.Monetary(
        string='Total Donations',
        compute='_compute_stats',
    )
    currency_id = fields.Many2one(
        'res.currency',
        default=lambda self: self.env.company.currency_id,
    )

    # Skills and interests
    skill_ids = fields.Many2many(
        'association.skill',
        string='Skills',
    )
    interest_ids = fields.Many2many(
        'association.interest',
        string='Interests',
    )

    # Communication preferences
    newsletter = fields.Boolean(
        string='Subscribe to Newsletter',
        default=True,
    )
    communication_preference = fields.Selection([
        ('email', 'Email'),
        ('phone', 'Phone'),
        ('mail', 'Postal Mail'),
        ('sms', 'SMS'),
    ], string='Preferred Communication', default='email')

    notes = fields.Text(
        string='Notes',
    )
    company_id = fields.Many2one(
        'res.company',
        string='Company',
        required=True,
        default=lambda self: self.env.company,
    )

    _sql_constraints = [
        ('member_number_unique', 'UNIQUE(member_number, company_id)',
         'Member number must be unique!'),
    ]

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('member_number', 'New') == 'New':
                vals['member_number'] = self.env['ir.sequence'].next_by_code('association.member') or 'New'
        return super().create(vals_list)

    @api.depends('birth_date')
    def _compute_age(self):
        today = date.today()
        for member in self:
            if member.birth_date:
                member.age = relativedelta(today, member.birth_date).years
            else:
                member.age = 0

    @api.depends('membership_ids', 'membership_ids.state')
    def _compute_current_membership(self):
        for member in self:
            membership = member.membership_ids.filtered(
                lambda m: m.state == 'active'
            ).sorted('date_start', reverse=True)[:1]
            member.current_membership_id = membership

    @api.depends('membership_end', 'state')
    def _compute_is_member_active(self):
        today = date.today()
        for member in self:
            member.is_member_active = (
                member.state == 'active' and
                (not member.membership_end or member.membership_end >= today)
            )

    def _compute_stats(self):
        for member in self:
            member.event_count = len(member.event_registration_ids.filtered(
                lambda r: r.state == 'attended'
            ))
            member.activity_count = len(member.activity_participation_ids)
            member.volunteer_hours = sum(member.volunteer_ids.mapped('hours'))
            member.total_donations = sum(member.donation_ids.filtered(
                lambda d: d.state == 'confirmed'
            ).mapped('amount'))

    def action_approve(self):
        """Approve pending membership"""
        for member in self:
            if member.state == 'pending':
                member.write({
                    'state': 'active',
                    'join_date': fields.Date.today(),
                })

    def action_suspend(self):
        """Suspend membership"""
        self.write({'state': 'suspended'})

    def action_reactivate(self):
        """Reactivate membership"""
        self.write({'state': 'active'})

    def action_cancel(self):
        """Cancel membership"""
        self.write({'state': 'cancelled'})

    def action_renew_membership(self):
        """Open renewal wizard"""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': _('Renew Membership'),
            'res_model': 'association.membership.renew.wizard',
            'view_mode': 'form',
            'target': 'new',
            'context': {
                'default_member_id': self.id,
            },
        }

    def action_print_card(self):
        """Print membership card"""
        return self.env.ref('event_association.action_report_membership_card').report_action(self)


class AssociationMemberType(models.Model):
    """Member type configuration"""
    _name = 'association.member.type'
    _description = 'Member Type'
    _order = 'sequence, name'

    name = fields.Char(
        string='Type Name',
        required=True,
        translate=True,
    )
    code = fields.Char(
        string='Code',
        required=True,
    )
    sequence = fields.Integer(
        string='Sequence',
        default=10,
    )
    description = fields.Text(
        string='Description',
    )
    annual_fee = fields.Monetary(
        string='Annual Fee',
    )
    currency_id = fields.Many2one(
        'res.currency',
        default=lambda self: self.env.company.currency_id,
    )
    duration_months = fields.Integer(
        string='Duration (months)',
        default=12,
    )
    benefits = fields.Text(
        string='Benefits',
    )
    age_min = fields.Integer(
        string='Minimum Age',
    )
    age_max = fields.Integer(
        string='Maximum Age',
    )
    active = fields.Boolean(
        string='Active',
        default=True,
    )
    color = fields.Integer(
        string='Color',
    )


class AssociationSkill(models.Model):
    """Member skills"""
    _name = 'association.skill'
    _description = 'Skill'
    _order = 'name'

    name = fields.Char(
        string='Skill',
        required=True,
        translate=True,
    )
    category = fields.Selection([
        ('technical', 'Technical'),
        ('creative', 'Creative'),
        ('administrative', 'Administrative'),
        ('communication', 'Communication'),
        ('leadership', 'Leadership'),
        ('other', 'Other'),
    ], string='Category', default='other')


class AssociationInterest(models.Model):
    """Member interests"""
    _name = 'association.interest'
    _description = 'Interest'
    _order = 'name'

    name = fields.Char(
        string='Interest',
        required=True,
        translate=True,
    )
    category = fields.Selection([
        ('sports', 'Sports'),
        ('culture', 'Culture'),
        ('education', 'Education'),
        ('social', 'Social'),
        ('environment', 'Environment'),
        ('other', 'Other'),
    ], string='Category', default='other')
