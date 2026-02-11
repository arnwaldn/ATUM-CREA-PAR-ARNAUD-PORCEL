# -*- coding: utf-8 -*-

from odoo import api, fields, models, _
from odoo.exceptions import UserError


class DonationThankWizard(models.TransientModel):
    """Wizard to send thank you emails for donations"""
    _name = 'association.donation.thank.wizard'
    _description = 'Donation Thank You Wizard'

    donation_ids = fields.Many2many(
        'association.donation',
        string='Donations',
        required=True,
    )
    template_id = fields.Many2one(
        'mail.template',
        string='Email Template',
        domain="[('model', '=', 'association.donation')]",
    )
    subject = fields.Char(
        string='Subject',
        default='Thank You for Your Generous Donation',
        required=True,
    )
    body = fields.Html(
        string='Message',
        required=True,
    )

    @api.model
    def default_get(self, fields_list):
        res = super().default_get(fields_list)
        if self._context.get('active_ids'):
            res['donation_ids'] = [(6, 0, self._context['active_ids'])]

        # Set default body
        res['body'] = """
        <p>Dear {donor_name},</p>
        <p>We would like to express our heartfelt gratitude for your generous donation
        of {amount} received on {date}.</p>
        <p>Your support helps us continue our mission and make a real difference
        in our community.</p>
        <p>Thank you for being part of our journey!</p>
        <p>With sincere appreciation,<br/>
        {company_name}</p>
        """
        return res

    @api.onchange('template_id')
    def _onchange_template_id(self):
        if self.template_id:
            self.subject = self.template_id.subject
            self.body = self.template_id.body_html

    def action_send_thank_you(self):
        """Send thank you emails to donors"""
        self.ensure_one()

        sent_count = 0
        for donation in self.donation_ids:
            if donation.thanked:
                continue

            # Get donor email
            email = donation.donor_id.email if donation.donor_id else donation.donor_email
            if not email:
                continue

            # Prepare email body with placeholders
            body = self.body
            body = body.replace('{donor_name}', donation.donor_id.name or 'Valued Donor')
            body = body.replace('{amount}', '%s %s' % (
                donation.amount, donation.currency_id.symbol
            ))
            body = body.replace('{date}', str(donation.donation_date))
            body = body.replace('{company_name}', donation.company_id.name)

            # Send email
            mail_values = {
                'subject': self.subject,
                'body_html': body,
                'email_to': email,
                'model': 'association.donation',
                'res_id': donation.id,
            }
            self.env['mail.mail'].create(mail_values).send()

            # Mark as thanked
            donation.write({
                'thanked': True,
                'thank_date': fields.Date.today(),
            })
            sent_count += 1

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Success'),
                'message': _('Thank you emails sent to %d donors.') % sent_count,
                'type': 'success',
            }
        }


class TaxReceiptGenerateWizard(models.TransientModel):
    """Wizard to generate tax receipts for donations"""
    _name = 'association.tax.receipt.generate.wizard'
    _description = 'Tax Receipt Generation Wizard'

    fiscal_year = fields.Char(
        string='Fiscal Year',
        required=True,
        default=lambda self: str(fields.Date.today().year),
    )
    donor_ids = fields.Many2many(
        'res.partner',
        string='Donors',
        help='Leave empty to generate for all eligible donors',
    )
    min_amount = fields.Monetary(
        string='Minimum Amount',
        default=0,
        help='Only generate receipts for donations above this amount',
    )
    currency_id = fields.Many2one(
        'res.currency',
        string='Currency',
        default=lambda self: self.env.company.currency_id,
    )

    def action_generate(self):
        """Generate tax receipts for eligible donations"""
        self.ensure_one()

        # Build domain for donations
        domain = [
            ('state', '=', 'received'),
            ('tax_deductible', '=', True),
            ('tax_receipt_id', '=', False),
            ('donation_date', '>=', '%s-01-01' % self.fiscal_year),
            ('donation_date', '<=', '%s-12-31' % self.fiscal_year),
        ]

        if self.donor_ids:
            domain.append(('donor_id', 'in', self.donor_ids.ids))

        if self.min_amount > 0:
            domain.append(('amount', '>=', self.min_amount))

        donations = self.env['association.donation'].search(domain)

        if not donations:
            raise UserError(_('No eligible donations found for the specified criteria.'))

        # Group donations by donor
        donors = {}
        for donation in donations:
            if donation.donor_id not in donors:
                donors[donation.donor_id] = self.env['association.donation']
            donors[donation.donor_id] |= donation

        # Create receipts
        receipts = self.env['association.tax.receipt']
        for donor, donor_donations in donors.items():
            total = sum(donor_donations.mapped('amount'))

            receipt = self.env['association.tax.receipt'].create({
                'donor_id': donor.id,
                'fiscal_year': self.fiscal_year,
                'donation_ids': [(6, 0, donor_donations.ids)],
                'total_amount': total,
            })
            receipts |= receipt

            # Link donations to receipt
            donor_donations.write({'tax_receipt_id': receipt.id})

        return {
            'type': 'ir.actions.act_window',
            'name': _('Generated Tax Receipts'),
            'res_model': 'association.tax.receipt',
            'view_mode': 'tree,form',
            'domain': [('id', 'in', receipts.ids)],
        }


class DonationRecordWizard(models.TransientModel):
    """Quick wizard to record a new donation"""
    _name = 'association.donation.record.wizard'
    _description = 'Record Donation Wizard'

    donor_type = fields.Selection([
        ('member', 'Member'),
        ('contact', 'Contact'),
        ('anonymous', 'Anonymous'),
    ], string='Donor Type', default='member', required=True)
    member_id = fields.Many2one(
        'association.member',
        string='Member',
    )
    donor_id = fields.Many2one(
        'res.partner',
        string='Donor',
    )
    donor_name = fields.Char(string='Donor Name')
    donor_email = fields.Char(string='Donor Email')

    donation_date = fields.Date(
        string='Date',
        default=fields.Date.today,
        required=True,
    )
    donation_type = fields.Selection([
        ('monetary', 'Monetary'),
        ('in_kind', 'In-Kind'),
    ], string='Type', default='monetary', required=True)
    amount = fields.Monetary(
        string='Amount',
        required=True,
    )
    currency_id = fields.Many2one(
        'res.currency',
        string='Currency',
        default=lambda self: self.env.company.currency_id,
    )
    payment_method = fields.Selection([
        ('cash', 'Cash'),
        ('bank_transfer', 'Bank Transfer'),
        ('card', 'Credit Card'),
        ('check', 'Check'),
        ('online', 'Online Payment'),
    ], string='Payment Method', default='bank_transfer')
    campaign_id = fields.Many2one(
        'association.donation.campaign',
        string='Campaign',
    )
    tax_deductible = fields.Boolean(
        string='Tax Deductible',
        default=True,
    )
    notes = fields.Text(string='Notes')

    @api.onchange('member_id')
    def _onchange_member_id(self):
        if self.member_id:
            self.donor_id = self.member_id.partner_id

    def action_record(self):
        """Create donation record"""
        self.ensure_one()

        # Determine donor
        if self.donor_type == 'member' and not self.member_id:
            raise UserError(_('Please select a member.'))
        if self.donor_type == 'contact' and not self.donor_id:
            raise UserError(_('Please select a donor.'))

        vals = {
            'donation_date': self.donation_date,
            'donation_type': self.donation_type,
            'amount': self.amount,
            'payment_method': self.payment_method,
            'campaign_id': self.campaign_id.id if self.campaign_id else False,
            'tax_deductible': self.tax_deductible,
            'notes': self.notes,
            'state': 'received',  # Direct to received for quick entry
        }

        if self.donor_type == 'member':
            vals['member_id'] = self.member_id.id
            vals['donor_id'] = self.member_id.partner_id.id
        elif self.donor_type == 'contact':
            vals['donor_id'] = self.donor_id.id
        else:  # anonymous
            vals['is_anonymous'] = True
            vals['donor_email'] = self.donor_email

        donation = self.env['association.donation'].create(vals)

        return {
            'type': 'ir.actions.act_window',
            'name': _('Donation'),
            'res_model': 'association.donation',
            'res_id': donation.id,
            'view_mode': 'form',
        }
