# -*- coding: utf-8 -*-

from odoo import api, fields, models, _
from odoo.exceptions import UserError, ValidationError
from dateutil.relativedelta import relativedelta


class MemberRenewWizard(models.TransientModel):
    """Wizard to renew member subscriptions"""
    _name = 'association.member.renew.wizard'
    _description = 'Member Renewal Wizard'

    member_ids = fields.Many2many(
        'association.member',
        string='Members',
        required=True,
    )
    member_type_id = fields.Many2one(
        'association.member.type',
        string='Member Type',
        help='Leave empty to keep current type',
    )
    date_start = fields.Date(
        string='Start Date',
        default=fields.Date.today,
        required=True,
    )
    payment_method = fields.Selection([
        ('cash', 'Cash'),
        ('bank_transfer', 'Bank Transfer'),
        ('card', 'Card'),
        ('check', 'Check'),
    ], string='Payment Method', default='bank_transfer')
    send_confirmation = fields.Boolean(
        string='Send Confirmation Email',
        default=True,
    )

    @api.model
    def default_get(self, fields_list):
        res = super().default_get(fields_list)
        if self._context.get('active_ids'):
            res['member_ids'] = [(6, 0, self._context['active_ids'])]
        return res

    def action_renew(self):
        """Renew memberships for selected members"""
        self.ensure_one()

        if not self.member_ids:
            raise UserError(_('Please select at least one member to renew.'))

        memberships = self.env['association.membership']

        for member in self.member_ids:
            member_type = self.member_type_id or member.member_type_id
            if not member_type:
                raise UserError(
                    _('Member %s has no member type defined. Please select one.') % member.name
                )

            # Calculate end date based on member type duration
            if member_type.duration_months > 0:
                date_end = self.date_start + relativedelta(months=member_type.duration_months)
            else:
                date_end = False  # Lifetime membership

            # Create new membership
            membership = self.env['association.membership'].create({
                'member_id': member.id,
                'member_type_id': member_type.id,
                'date_start': self.date_start,
                'date_end': date_end,
                'amount': member_type.annual_fee,
                'payment_method': self.payment_method,
            })
            memberships |= membership

            # Send confirmation email
            if self.send_confirmation and member.email:
                membership._send_renewal_confirmation()

        return {
            'type': 'ir.actions.act_window',
            'name': _('New Memberships'),
            'res_model': 'association.membership',
            'view_mode': 'tree,form',
            'domain': [('id', 'in', memberships.ids)],
        }


class MemberImportWizard(models.TransientModel):
    """Wizard to import members from CSV/Excel"""
    _name = 'association.member.import.wizard'
    _description = 'Member Import Wizard'

    file = fields.Binary(
        string='File',
        required=True,
    )
    filename = fields.Char(string='Filename')
    member_type_id = fields.Many2one(
        'association.member.type',
        string='Default Member Type',
        required=True,
    )
    create_membership = fields.Boolean(
        string='Create Membership',
        default=True,
        help='Automatically create a membership for each imported member',
    )
    skip_duplicates = fields.Boolean(
        string='Skip Duplicates',
        default=True,
        help='Skip members with existing email addresses',
    )

    def action_import(self):
        """Import members from file"""
        self.ensure_one()

        import base64
        import csv
        from io import StringIO

        # Decode file
        data = base64.b64decode(self.file)

        # Try to decode as UTF-8
        try:
            content = data.decode('utf-8')
        except UnicodeDecodeError:
            content = data.decode('latin-1')

        # Parse CSV
        reader = csv.DictReader(StringIO(content))

        created_count = 0
        skipped_count = 0
        error_lines = []

        for i, row in enumerate(reader, start=2):
            try:
                email = row.get('email', '').strip()

                # Check for duplicates
                if self.skip_duplicates and email:
                    existing = self.env['association.member'].search([
                        ('email', '=ilike', email)
                    ], limit=1)
                    if existing:
                        skipped_count += 1
                        continue

                # Create member
                member_vals = {
                    'name': row.get('name', '').strip(),
                    'email': email,
                    'phone': row.get('phone', '').strip(),
                    'mobile': row.get('mobile', '').strip(),
                    'street': row.get('street', '').strip(),
                    'city': row.get('city', '').strip(),
                    'zip': row.get('zip', '').strip(),
                    'member_type_id': self.member_type_id.id,
                    'state': 'prospect',
                }

                # Handle birth date
                if row.get('birth_date'):
                    member_vals['birth_date'] = row['birth_date'].strip()

                member = self.env['association.member'].create(member_vals)

                # Create membership if requested
                if self.create_membership:
                    date_start = fields.Date.today()
                    if self.member_type_id.duration_months > 0:
                        date_end = date_start + relativedelta(
                            months=self.member_type_id.duration_months
                        )
                    else:
                        date_end = False

                    self.env['association.membership'].create({
                        'member_id': member.id,
                        'member_type_id': self.member_type_id.id,
                        'date_start': date_start,
                        'date_end': date_end,
                        'amount': self.member_type_id.annual_fee,
                    })

                created_count += 1

            except Exception as e:
                error_lines.append(_('Line %d: %s') % (i, str(e)))

        # Prepare result message
        message = _('Import completed:\n- Created: %d members\n- Skipped: %d duplicates') % (
            created_count, skipped_count
        )
        if error_lines:
            message += _('\n\nErrors:\n') + '\n'.join(error_lines[:10])
            if len(error_lines) > 10:
                message += _('\n... and %d more errors') % (len(error_lines) - 10)

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Import Result'),
                'message': message,
                'type': 'success' if not error_lines else 'warning',
                'sticky': True,
            }
        }


class MemberMergeWizard(models.TransientModel):
    """Wizard to merge duplicate members"""
    _name = 'association.member.merge.wizard'
    _description = 'Member Merge Wizard'

    member_ids = fields.Many2many(
        'association.member',
        string='Members to Merge',
        required=True,
    )
    target_member_id = fields.Many2one(
        'association.member',
        string='Keep This Member',
        required=True,
        help='All data will be merged into this member',
    )

    @api.model
    def default_get(self, fields_list):
        res = super().default_get(fields_list)
        if self._context.get('active_ids'):
            member_ids = self._context['active_ids']
            res['member_ids'] = [(6, 0, member_ids)]
            if member_ids:
                res['target_member_id'] = member_ids[0]
        return res

    @api.onchange('member_ids')
    def _onchange_member_ids(self):
        if self.member_ids and self.target_member_id not in self.member_ids:
            self.target_member_id = self.member_ids[0]

    def action_merge(self):
        """Merge selected members into target member"""
        self.ensure_one()

        if len(self.member_ids) < 2:
            raise UserError(_('Please select at least 2 members to merge.'))

        if self.target_member_id not in self.member_ids:
            raise UserError(_('Target member must be one of the selected members.'))

        members_to_merge = self.member_ids - self.target_member_id

        # Merge related records
        for member in members_to_merge:
            # Transfer memberships
            member.membership_ids.write({'member_id': self.target_member_id.id})

            # Transfer event registrations
            member.event_registration_ids.write({'member_id': self.target_member_id.id})

            # Transfer activity participations
            member.activity_participation_ids.write({'member_id': self.target_member_id.id})

            # Transfer donations
            member.donation_ids.write({'member_id': self.target_member_id.id})

            # Transfer volunteer records
            member.volunteer_ids.write({'member_id': self.target_member_id.id})

            # Merge skills and interests
            self.target_member_id.skill_ids |= member.skill_ids
            self.target_member_id.interest_ids |= member.interest_ids

            # Archive merged member
            member.write({'active': False})

        return {
            'type': 'ir.actions.act_window',
            'name': _('Merged Member'),
            'res_model': 'association.member',
            'res_id': self.target_member_id.id,
            'view_mode': 'form',
        }


class MemberCommunicationWizard(models.TransientModel):
    """Wizard to send communications to members"""
    _name = 'association.member.communication.wizard'
    _description = 'Member Communication Wizard'

    member_ids = fields.Many2many(
        'association.member',
        string='Recipients',
        required=True,
    )
    subject = fields.Char(
        string='Subject',
        required=True,
    )
    body = fields.Html(
        string='Message',
        required=True,
    )
    template_id = fields.Many2one(
        'mail.template',
        string='Email Template',
        domain="[('model', '=', 'association.member')]",
    )

    @api.model
    def default_get(self, fields_list):
        res = super().default_get(fields_list)
        if self._context.get('active_ids'):
            res['member_ids'] = [(6, 0, self._context['active_ids'])]
        return res

    @api.onchange('template_id')
    def _onchange_template_id(self):
        if self.template_id:
            self.subject = self.template_id.subject
            self.body = self.template_id.body_html

    def action_send(self):
        """Send communication to selected members"""
        self.ensure_one()

        members_without_email = self.member_ids.filtered(lambda m: not m.email)
        if members_without_email:
            raise UserError(
                _('The following members have no email address:\n%s') %
                '\n'.join(members_without_email.mapped('name'))
            )

        # Send emails
        for member in self.member_ids:
            mail_values = {
                'subject': self.subject,
                'body_html': self.body,
                'email_to': member.email,
                'model': 'association.member',
                'res_id': member.id,
            }
            self.env['mail.mail'].create(mail_values).send()

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Success'),
                'message': _('Email sent to %d members.') % len(self.member_ids),
                'type': 'success',
            }
        }
