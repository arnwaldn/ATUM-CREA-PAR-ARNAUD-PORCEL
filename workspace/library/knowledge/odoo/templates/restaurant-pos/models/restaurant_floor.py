# -*- coding: utf-8 -*-
from odoo import models, fields, api


class RestaurantFloor(models.Model):
    """Restaurant floor plan management"""
    _name = 'restaurant.floor'
    _description = 'Restaurant Floor'
    _order = 'sequence, name'

    name = fields.Char(
        string='Floor Name',
        required=True,
    )
    sequence = fields.Integer(
        string='Sequence',
        default=10,
    )
    active = fields.Boolean(
        string='Active',
        default=True,
    )
    table_ids = fields.One2many(
        'restaurant.table',
        'floor_id',
        string='Tables',
    )
    table_count = fields.Integer(
        string='Number of Tables',
        compute='_compute_table_count',
    )
    total_capacity = fields.Integer(
        string='Total Capacity',
        compute='_compute_total_capacity',
    )
    background_image = fields.Binary(
        string='Background Image',
        help='Floor plan background image',
    )
    background_color = fields.Char(
        string='Background Color',
        default='#f0f0f0',
    )
    company_id = fields.Many2one(
        'res.company',
        string='Company',
        required=True,
        default=lambda self: self.env.company,
    )

    @api.depends('table_ids')
    def _compute_table_count(self):
        for floor in self:
            floor.table_count = len(floor.table_ids)

    @api.depends('table_ids.capacity')
    def _compute_total_capacity(self):
        for floor in self:
            floor.total_capacity = sum(floor.table_ids.mapped('capacity'))


class RestaurantTableShape(models.Model):
    """Table shape definitions"""
    _name = 'restaurant.table.shape'
    _description = 'Table Shape'
    _order = 'name'

    name = fields.Char(
        string='Shape Name',
        required=True,
    )
    code = fields.Char(
        string='Code',
        required=True,
    )
    icon = fields.Char(
        string='Icon Class',
        help='CSS icon class',
    )
