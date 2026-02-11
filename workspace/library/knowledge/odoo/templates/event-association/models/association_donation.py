# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import UserError


class AssociationDonation(models.Model):
    """Donation and fundraising management"""
    _name = 'association.donation'
    _description = 'Donation'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'donation_date desc'

    name = fields.Char(
        string='Reference',
        required=True,
        readonly=True,
        default='New',
        copy=False,
    )
    member_id = fields.Many2one(
        'association.member',
        string='Member',
    )
    partner_id = fields.Many2one(
        'res.partner',
        string='Donor',
        required=True,
    )
    donor_name = fields.Char(
        string='Donor Name',
        related='partner_id.name',
    )
    campaign_id = fields.Many2one(
        'association.donation.campaign',
        string='Campaign',
    )
    state = fields.Selection([
        ('draft', 'Draft'),
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ], string='Status', default='draft', required=True, tracking=True)

    # Donation details
    donation_type = fields.Selection([
        ('cash', 'Cash'),
        ('check', 'Check'),
        ('bank_transfer', 'Bank Transfer'),
        ('card', 'Credit Card'),
        ('online', 'Online'),
        ('in_kind', 'In-Kind'),
    ], string='Donation Type', required=True, default='cash')
    amount = fields.Monetary(
        string='Amount',
        required=True,
        tracking=True,
    )
    currency_id = fields.Many2one(
        'res.currency',
        default=lambda self: self.env.company.currency_id,
    )
    in_kind_description = fields.Text(
        string='In-Kind Description',
    )
    in_kind_value = fields.Monetary(
        string='Estimated Value',
    )

    # Dates
    donation_date = fields.Date(
        string='Donation Date',
        default=fields.Date.today,
        required=True,
    )
    received_date = fields.Date(
        string='Received Date',
    )

    # Tax receipt
    tax_receipt_required = fields.Boolean(
        string='Tax Receipt Required',
        default=True,
    )
    tax_receipt_sent = fields.Boolean(
        string='Tax Receipt Sent',
        default=False,
    )
    tax_receipt_number = fields.Char(
        string='Tax Receipt Number',
    )

    # Payment details
    payment_reference = fields.Char(
        string='Payment Reference',
    )
    check_number = fields.Char(
        string='Check Number',
    )
    bank_name = fields.Char(
        string='Bank Name',
    )

    # Purpose
    purpose = fields.Selection([
        ('general', 'General Fund'),
        ('project', 'Specific Project'),
        ('membership', 'Membership Support'),
        ('scholarship', 'Scholarship Fund'),
        ('event', 'Event Sponsorship'),
        ('other', 'Other'),
    ], string='Purpose', default='general')
    purpose_notes = fields.Text(
        string='Purpose Details',
    )

    # Recurring
    is_recurring = fields.Boolean(
        string='Recurring Donation',
        default=False,
    )
    recurring_frequency = fields.Selection([
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('annually', 'Annually'),
    ], string='Frequency')

    # Anonymous
    is_anonymous = fields.Boolean(
        string='Anonymous Donation',
        default=False,
    )

    # Acknowledgment
    acknowledgment_sent = fields.Boolean(
        string='Thank You Sent',
        default=False,
    )
    acknowledgment_date = fields.Date(
        string='Thank You Date',
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

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', 'New') == 'New':
                vals['name'] = self.env['ir.sequence'].next_by_code('association.donation') or 'New'
        return super().create(vals_list)

    def action_confirm(self):
        """Confirm the donation"""
        for donation in self:
            donation.write({
                'state': 'confirmed',
                'received_date': fields.Date.today(),
            })
            # Update campaign progress
            if donation.campaign_id:
                donation.campaign_id._compute_amounts()

    def action_send_receipt(self):
        """Send tax receipt"""
        self.ensure_one()
        if not self.tax_receipt_required:
            raise UserError(_('Tax receipt is not required for this donation.'))

        # Generate receipt number
        if not self.tax_receipt_number:
            self.tax_receipt_number = self.env['ir.sequence'].next_by_code('association.tax.receipt')

        template = self.env.ref('event_association.mail_template_donation_receipt',
                                raise_if_not_found=False)
        if template:
            template.send_mail(self.id, force_send=True)
            self.tax_receipt_sent = True

    def action_send_thanks(self):
        """Send thank you message"""
        self.ensure_one()
        template = self.env.ref('event_association.mail_template_donation_thanks',
                                raise_if_not_found=False)
        if template:
            template.send_mail(self.id, force_send=True)
            self.write({
                'acknowledgment_sent': True,
                'acknowledgment_date': fields.Date.today(),
            })

    def action_cancel(self):
        """Cancel the donation"""
        self.write({'state': 'cancelled'})


class AssociationDonationCampaign(models.Model):
    """Fundraising campaign"""
    _name = 'association.donation.campaign'
    _description = 'Donation Campaign'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'date_start desc'

    name = fields.Char(
        string='Campaign Name',
        required=True,
        tracking=True,
    )
    code = fields.Char(
        string='Code',
    )
    state = fields.Selection([
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ], string='Status', default='draft', required=True, tracking=True)

    description = fields.Html(
        string='Description',
    )
    image = fields.Binary(
        string='Image',
    )

    # Dates
    date_start = fields.Date(
        string='Start Date',
        required=True,
    )
    date_end = fields.Date(
        string='End Date',
    )

    # Goals
    goal_amount = fields.Monetary(
        string='Goal Amount',
        required=True,
    )
    currency_id = fields.Many2one(
        'res.currency',
        default=lambda self: self.env.company.currency_id,
    )
    goal_donors = fields.Integer(
        string='Goal Donors',
    )

    # Progress
    donation_ids = fields.One2many(
        'association.donation',
        'campaign_id',
        string='Donations',
    )
    amount_raised = fields.Monetary(
        string='Amount Raised',
        compute='_compute_amounts',
        store=True,
    )
    donor_count = fields.Integer(
        string='Donors',
        compute='_compute_amounts',
        store=True,
    )
    progress_percent = fields.Float(
        string='Progress %',
        compute='_compute_amounts',
        store=True,
    )

    # Responsible
    responsible_id = fields.Many2one(
        'res.users',
        string='Responsible',
        default=lambda self: self.env.user,
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

    @api.depends('donation_ids', 'donation_ids.state', 'donation_ids.amount', 'goal_amount')
    def _compute_amounts(self):
        for campaign in self:
            confirmed_donations = campaign.donation_ids.filtered(
                lambda d: d.state == 'confirmed'
            )
            campaign.amount_raised = sum(confirmed_donations.mapped('amount'))
            campaign.donor_count = len(confirmed_donations.mapped('partner_id'))
            if campaign.goal_amount:
                campaign.progress_percent = (campaign.amount_raised / campaign.goal_amount) * 100
            else:
                campaign.progress_percent = 0

    def action_start(self):
        """Start the campaign"""
        self.write({'state': 'active'})

    def action_pause(self):
        """Pause the campaign"""
        self.write({'state': 'paused'})

    def action_complete(self):
        """Complete the campaign"""
        self.write({'state': 'completed'})

    def action_cancel(self):
        """Cancel the campaign"""
        self.write({'state': 'cancelled'})


class AssociationVolunteer(models.Model):
    """Volunteer activity tracking"""
    _name = 'association.volunteer'
    _description = 'Volunteer Activity'
    _order = 'date desc'

    member_id = fields.Many2one(
        'association.member',
        string='Volunteer',
        required=True,
        ondelete='cascade',
    )
    event_id = fields.Many2one(
        'association.event',
        string='Event',
    )
    activity_id = fields.Many2one(
        'association.activity',
        string='Activity',
    )
    date = fields.Date(
        string='Date',
        required=True,
        default=fields.Date.today,
    )
    hours = fields.Float(
        string='Hours',
        required=True,
    )
    role = fields.Char(
        string='Role',
    )
    description = fields.Text(
        string='Description',
    )
    state = fields.Selection([
        ('planned', 'Planned'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ], string='Status', default='planned')
    notes = fields.Text(
        string='Notes',
    )
