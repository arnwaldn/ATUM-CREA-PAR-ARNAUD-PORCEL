# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import UserError


class RealestateOffer(models.Model):
    _name = 'realestate.offer'
    _description = 'Property Offer'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'create_date desc'

    name = fields.Char(
        string='Reference', required=True, copy=False, readonly=True,
        default=lambda self: self.env['ir.sequence'].next_by_code('realestate.offer'))

    # Property
    property_id = fields.Many2one(
        'realestate.property', string='Property', required=True, tracking=True)
    property_price = fields.Monetary(
        related='property_id.sale_price', string='Asking Price')

    # Buyer
    buyer_id = fields.Many2one(
        'res.partner', string='Buyer', required=True, tracking=True)
    buyer_phone = fields.Char(related='buyer_id.phone', string='Phone')
    buyer_email = fields.Char(related='buyer_id.email', string='Email')

    # Offer Details
    offer_amount = fields.Monetary(
        string='Offer Amount', currency_field='currency_id',
        required=True, tracking=True)
    currency_id = fields.Many2one(
        'res.currency', default=lambda self: self.env.company.currency_id)
    offer_percentage = fields.Float(
        string='% of Asking', compute='_compute_percentage')

    # Conditions
    condition_financing = fields.Boolean(
        string='Subject to Financing', default=True)
    financing_amount = fields.Monetary(
        string='Loan Amount', currency_field='currency_id')
    condition_inspection = fields.Boolean(
        string='Subject to Inspection', default=True)
    condition_sale = fields.Boolean(
        string='Subject to Sale of Property')
    other_conditions = fields.Text(string='Other Conditions')

    # Dates
    offer_date = fields.Date(
        string='Offer Date', default=fields.Date.today, required=True)
    validity_date = fields.Date(
        string='Valid Until', required=True)
    expected_closing = fields.Date(string='Expected Closing Date')

    # Deposit
    deposit_amount = fields.Monetary(
        string='Deposit Amount', currency_field='currency_id')
    deposit_received = fields.Boolean(string='Deposit Received')
    deposit_date = fields.Date(string='Deposit Date')

    # Status
    state = fields.Selection([
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('negotiating', 'Negotiating'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
        ('withdrawn', 'Withdrawn'),
    ], string='Status', default='draft', tracking=True)

    # Counter-offer
    is_counter = fields.Boolean(string='Is Counter-Offer')
    parent_offer_id = fields.Many2one(
        'realestate.offer', string='Original Offer')
    counter_offers = fields.One2many(
        'realestate.offer', 'parent_offer_id', string='Counter-Offers')

    # Agent
    agent_id = fields.Many2one('res.users', string='Agent', tracking=True)

    # Notes
    notes = fields.Text(string='Notes')
    rejection_reason = fields.Text(string='Rejection Reason')

    @api.depends('offer_amount', 'property_price')
    def _compute_percentage(self):
        for offer in self:
            if offer.property_price:
                offer.offer_percentage = (
                    offer.offer_amount / offer.property_price * 100)
            else:
                offer.offer_percentage = 0

    @api.constrains('offer_date', 'validity_date')
    def _check_dates(self):
        for offer in self:
            if offer.validity_date < offer.offer_date:
                raise UserError('Validity date must be after offer date.')

    def action_submit(self):
        self.write({'state': 'submitted'})
        # Notify owner
        self.property_id.message_post(
            body=f'New offer received: {self.offer_amount} {self.currency_id.symbol} '
                 f'from {self.buyer_id.name}',
            subject='New Offer Received',
        )

    def action_negotiate(self):
        self.write({'state': 'negotiating'})

    def action_accept(self):
        self.write({'state': 'accepted'})
        # Update property status
        self.property_id.write({'state': 'option'})
        # Reject other offers
        other_offers = self.search([
            ('property_id', '=', self.property_id.id),
            ('id', '!=', self.id),
            ('state', 'in', ['submitted', 'negotiating']),
        ])
        other_offers.write({
            'state': 'rejected',
            'rejection_reason': 'Another offer was accepted.',
        })

    def action_reject(self):
        return {
            'type': 'ir.actions.act_window',
            'name': 'Reject Offer',
            'res_model': 'realestate.offer.reject.wizard',
            'view_mode': 'form',
            'target': 'new',
            'context': {'default_offer_id': self.id},
        }

    def action_withdraw(self):
        self.write({'state': 'withdrawn'})

    def action_counter_offer(self):
        """Create a counter-offer."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Counter Offer',
            'res_model': 'realestate.offer',
            'view_mode': 'form',
            'context': {
                'default_property_id': self.property_id.id,
                'default_buyer_id': self.buyer_id.id,
                'default_is_counter': True,
                'default_parent_offer_id': self.id,
                'default_condition_financing': self.condition_financing,
                'default_condition_inspection': self.condition_inspection,
            },
        }

    @api.model
    def _cron_check_expired(self):
        """Mark expired offers."""
        today = fields.Date.today()
        expired = self.search([
            ('state', 'in', ['submitted', 'negotiating']),
            ('validity_date', '<', today),
        ])
        expired.write({'state': 'expired'})


class RealestateOfferRejectWizard(models.TransientModel):
    _name = 'realestate.offer.reject.wizard'
    _description = 'Reject Offer Wizard'

    offer_id = fields.Many2one('realestate.offer', required=True)
    reason = fields.Text(string='Reason', required=True)

    def action_reject(self):
        self.offer_id.write({
            'state': 'rejected',
            'rejection_reason': self.reason,
        })
        return {'type': 'ir.actions.act_window_close'}
