# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError
import logging

_logger = logging.getLogger(__name__)


class {{ModelName}}(models.Model):
    _name = '{{model.name}}'
    _description = '{{Model Description}}'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'sequence, name'
    _rec_name = 'name'

    # ==================== CHAMPS ====================

    name = fields.Char(
        string='Nom',
        required=True,
        tracking=True,
        index=True,
    )

    sequence = fields.Integer(
        string='Séquence',
        default=10,
    )

    active = fields.Boolean(
        string='Actif',
        default=True,
    )

    state = fields.Selection(
        selection=[
            ('draft', 'Brouillon'),
            ('confirmed', 'Confirmé'),
            ('done', 'Terminé'),
            ('cancelled', 'Annulé'),
        ],
        string='État',
        default='draft',
        required=True,
        tracking=True,
        copy=False,
    )

    description = fields.Text(
        string='Description',
    )

    date = fields.Date(
        string='Date',
        default=fields.Date.context_today,
    )

    # Champs relationnels
    partner_id = fields.Many2one(
        comodel_name='res.partner',
        string='Partenaire',
        ondelete='restrict',
        index=True,
    )

    company_id = fields.Many2one(
        comodel_name='res.company',
        string='Société',
        required=True,
        default=lambda self: self.env.company,
        index=True,
    )

    user_id = fields.Many2one(
        comodel_name='res.users',
        string='Responsable',
        default=lambda self: self.env.user,
        tracking=True,
    )

    line_ids = fields.One2many(
        comodel_name='{{model.name}}.line',
        inverse_name='parent_id',
        string='Lignes',
        copy=True,
    )

    # Champs monétaires
    currency_id = fields.Many2one(
        comodel_name='res.currency',
        string='Devise',
        default=lambda self: self.env.company.currency_id,
    )

    amount_total = fields.Monetary(
        string='Total',
        currency_field='currency_id',
        compute='_compute_amount_total',
        store=True,
    )

    # ==================== CONTRAINTES SQL ====================

    _sql_constraints = [
        ('name_company_uniq', 'UNIQUE(name, company_id)',
         'Le nom doit être unique par société!'),
    ]

    # ==================== MÉTHODES COMPUTE ====================

    @api.depends('line_ids.subtotal')
    def _compute_amount_total(self):
        for record in self:
            record.amount_total = sum(record.line_ids.mapped('subtotal'))

    # ==================== CONTRAINTES PYTHON ====================

    @api.constrains('date')
    def _check_date(self):
        for record in self:
            if record.date and record.date > fields.Date.today():
                raise ValidationError(_("La date ne peut pas être dans le futur!"))

    # ==================== ONCHANGE ====================

    @api.onchange('partner_id')
    def _onchange_partner_id(self):
        if self.partner_id:
            # Exemple: récupérer des données du partenaire
            pass

    # ==================== MÉTHODES CRUD ====================

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', _('New')) == _('New'):
                vals['name'] = self.env['ir.sequence'].next_by_code(
                    '{{model.name}}'
                ) or _('New')
        return super().create(vals_list)

    def write(self, vals):
        # Logique pré-écriture si nécessaire
        result = super().write(vals)
        # Logique post-écriture si nécessaire
        return result

    def unlink(self):
        for record in self:
            if record.state not in ('draft', 'cancelled'):
                raise UserError(_(
                    "Impossible de supprimer un enregistrement qui n'est pas "
                    "en brouillon ou annulé!"
                ))
        return super().unlink()

    def copy(self, default=None):
        default = dict(default or {})
        default['name'] = _('%s (copie)') % self.name
        return super().copy(default)

    # ==================== ACTIONS ====================

    def action_confirm(self):
        """Confirmer l'enregistrement"""
        for record in self:
            if record.state != 'draft':
                raise UserError(_("Seuls les brouillons peuvent être confirmés!"))
        self.write({'state': 'confirmed'})
        return True

    def action_done(self):
        """Marquer comme terminé"""
        self.write({'state': 'done'})
        return True

    def action_cancel(self):
        """Annuler l'enregistrement"""
        self.write({'state': 'cancelled'})
        return True

    def action_draft(self):
        """Remettre en brouillon"""
        self.write({'state': 'draft'})
        return True

    # ==================== MÉTHODES MÉTIER ====================

    def _prepare_data(self):
        """Préparer les données pour traitement"""
        self.ensure_one()
        return {
            'name': self.name,
            'partner_id': self.partner_id.id,
            'date': self.date,
            'amount': self.amount_total,
        }


class {{ModelName}}Line(models.Model):
    _name = '{{model.name}}.line'
    _description = '{{Model Description}} Line'
    _order = 'sequence, id'

    parent_id = fields.Many2one(
        comodel_name='{{model.name}}',
        string='Parent',
        required=True,
        ondelete='cascade',
        index=True,
    )

    sequence = fields.Integer(
        string='Séquence',
        default=10,
    )

    name = fields.Char(
        string='Description',
        required=True,
    )

    product_id = fields.Many2one(
        comodel_name='product.product',
        string='Produit',
    )

    quantity = fields.Float(
        string='Quantité',
        default=1.0,
    )

    price_unit = fields.Float(
        string='Prix unitaire',
        digits='Product Price',
    )

    currency_id = fields.Many2one(
        related='parent_id.currency_id',
    )

    subtotal = fields.Monetary(
        string='Sous-total',
        currency_field='currency_id',
        compute='_compute_subtotal',
        store=True,
    )

    @api.depends('quantity', 'price_unit')
    def _compute_subtotal(self):
        for line in self:
            line.subtotal = line.quantity * line.price_unit

    @api.onchange('product_id')
    def _onchange_product_id(self):
        if self.product_id:
            self.name = self.product_id.display_name
            self.price_unit = self.product_id.list_price
