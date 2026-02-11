# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class RestaurantTable(models.Model):
    """Restaurant table management"""
    _name = 'restaurant.table'
    _description = 'Restaurant Table'
    _order = 'floor_id, name'

    name = fields.Char(
        string='Table Number',
        required=True,
    )
    floor_id = fields.Many2one(
        'restaurant.floor',
        string='Floor',
        required=True,
        ondelete='cascade',
    )
    shape_id = fields.Many2one(
        'restaurant.table.shape',
        string='Shape',
    )
    capacity = fields.Integer(
        string='Seats',
        required=True,
        default=4,
    )
    min_capacity = fields.Integer(
        string='Minimum Seats',
        default=1,
    )
    state = fields.Selection([
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        ('reserved', 'Reserved'),
        ('cleaning', 'Cleaning'),
        ('blocked', 'Blocked'),
    ], string='Status', default='available', required=True)
    current_order_id = fields.Many2one(
        'restaurant.order',
        string='Current Order',
        compute='_compute_current_order',
    )
    active = fields.Boolean(
        string='Active',
        default=True,
    )
    position_h = fields.Float(
        string='Horizontal Position',
        help='Position in floor plan (0-100%)',
    )
    position_v = fields.Float(
        string='Vertical Position',
        help='Position in floor plan (0-100%)',
    )
    width = fields.Float(
        string='Width',
        default=75,
    )
    height = fields.Float(
        string='Height',
        default=75,
    )
    color = fields.Char(
        string='Color',
        default='#a0a0a0',
    )
    notes = fields.Text(
        string='Notes',
    )
    company_id = fields.Many2one(
        related='floor_id.company_id',
        store=True,
    )

    _sql_constraints = [
        ('name_floor_unique', 'UNIQUE(name, floor_id)',
         'Table number must be unique per floor!'),
    ]

    @api.constrains('capacity', 'min_capacity')
    def _check_capacity(self):
        for table in self:
            if table.min_capacity > table.capacity:
                raise ValidationError(
                    _('Minimum capacity cannot exceed maximum capacity.')
                )

    @api.depends('state')
    def _compute_current_order(self):
        Order = self.env['restaurant.order']
        for table in self:
            if table.state == 'occupied':
                order = Order.search([
                    ('table_id', '=', table.id),
                    ('state', 'in', ['draft', 'confirmed', 'preparing']),
                ], limit=1, order='id desc')
                table.current_order_id = order
            else:
                table.current_order_id = False

    def action_set_available(self):
        """Mark table as available"""
        self.write({'state': 'available'})

    def action_set_occupied(self):
        """Mark table as occupied"""
        self.write({'state': 'occupied'})

    def action_set_reserved(self):
        """Mark table as reserved"""
        self.write({'state': 'reserved'})

    def action_set_cleaning(self):
        """Mark table as cleaning"""
        self.write({'state': 'cleaning'})

    def action_open_order(self):
        """Open current order or create new one"""
        self.ensure_one()
        if self.current_order_id:
            return {
                'type': 'ir.actions.act_window',
                'name': _('Order'),
                'res_model': 'restaurant.order',
                'res_id': self.current_order_id.id,
                'view_mode': 'form',
                'target': 'current',
            }
        else:
            return {
                'type': 'ir.actions.act_window',
                'name': _('New Order'),
                'res_model': 'restaurant.order',
                'view_mode': 'form',
                'target': 'current',
                'context': {
                    'default_table_id': self.id,
                },
            }

    def action_view_orders(self):
        """View all orders for this table"""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': _('Table Orders'),
            'res_model': 'restaurant.order',
            'view_mode': 'tree,form',
            'domain': [('table_id', '=', self.id)],
            'context': {'default_table_id': self.id},
        }
