# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class RestaurantMenuCategory(models.Model):
    """Menu category management"""
    _name = 'restaurant.menu.category'
    _description = 'Menu Category'
    _order = 'sequence, name'
    _parent_name = 'parent_id'
    _parent_store = True

    name = fields.Char(
        string='Category Name',
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
    parent_id = fields.Many2one(
        'restaurant.menu.category',
        string='Parent Category',
        ondelete='cascade',
    )
    parent_path = fields.Char(
        index=True,
        unaccent=False,
    )
    child_ids = fields.One2many(
        'restaurant.menu.category',
        'parent_id',
        string='Child Categories',
    )
    item_ids = fields.One2many(
        'restaurant.menu.item',
        'category_id',
        string='Menu Items',
    )
    item_count = fields.Integer(
        string='Items',
        compute='_compute_item_count',
    )
    active = fields.Boolean(
        string='Active',
        default=True,
    )
    image = fields.Binary(
        string='Image',
    )
    color = fields.Integer(
        string='Color Index',
    )
    available_time = fields.Selection([
        ('all', 'All Day'),
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
        ('late_night', 'Late Night'),
    ], string='Available Time', default='all')
    company_id = fields.Many2one(
        'res.company',
        string='Company',
        required=True,
        default=lambda self: self.env.company,
    )

    @api.depends('item_ids')
    def _compute_item_count(self):
        for category in self:
            category.item_count = len(category.item_ids)


class RestaurantMenuItem(models.Model):
    """Menu item management"""
    _name = 'restaurant.menu.item'
    _description = 'Menu Item'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'category_id, sequence, name'

    name = fields.Char(
        string='Item Name',
        required=True,
        translate=True,
        tracking=True,
    )
    code = fields.Char(
        string='Code',
    )
    category_id = fields.Many2one(
        'restaurant.menu.category',
        string='Category',
        required=True,
    )
    sequence = fields.Integer(
        string='Sequence',
        default=10,
    )
    description = fields.Text(
        string='Description',
        translate=True,
    )
    image = fields.Binary(
        string='Image',
    )
    product_id = fields.Many2one(
        'product.product',
        string='Product',
        domain="[('sale_ok', '=', True)]",
    )
    price = fields.Float(
        string='Price',
        required=True,
        digits='Product Price',
        tracking=True,
    )
    cost = fields.Float(
        string='Cost',
        digits='Product Price',
    )
    margin = fields.Float(
        string='Margin %',
        compute='_compute_margin',
    )
    currency_id = fields.Many2one(
        'res.currency',
        string='Currency',
        default=lambda self: self.env.company.currency_id,
    )
    tax_ids = fields.Many2many(
        'account.tax',
        string='Taxes',
        domain="[('type_tax_use', '=', 'sale')]",
    )
    active = fields.Boolean(
        string='Active',
        default=True,
    )
    available = fields.Boolean(
        string='Available',
        default=True,
        help='Temporarily mark item as unavailable',
    )
    preparation_time = fields.Integer(
        string='Preparation Time (min)',
        default=15,
    )
    kitchen_printer_id = fields.Many2one(
        'restaurant.kitchen.printer',
        string='Kitchen Printer',
    )

    # Dietary information
    is_vegetarian = fields.Boolean(
        string='Vegetarian',
    )
    is_vegan = fields.Boolean(
        string='Vegan',
    )
    is_gluten_free = fields.Boolean(
        string='Gluten Free',
    )
    is_spicy = fields.Boolean(
        string='Spicy',
    )
    spicy_level = fields.Selection([
        ('1', 'Mild'),
        ('2', 'Medium'),
        ('3', 'Hot'),
        ('4', 'Very Hot'),
    ], string='Spicy Level')
    allergens = fields.Char(
        string='Allergens',
        help='Comma-separated list of allergens',
    )
    calories = fields.Integer(
        string='Calories',
    )

    # Options
    option_ids = fields.One2many(
        'restaurant.menu.option',
        'item_id',
        string='Options',
    )
    ingredient_ids = fields.One2many(
        'restaurant.menu.ingredient',
        'item_id',
        string='Ingredients',
    )

    # Visibility
    available_time = fields.Selection([
        ('all', 'All Day'),
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
        ('late_night', 'Late Night'),
    ], string='Available Time', default='all')
    company_id = fields.Many2one(
        'res.company',
        string='Company',
        required=True,
        default=lambda self: self.env.company,
    )

    @api.depends('price', 'cost')
    def _compute_margin(self):
        for item in self:
            if item.price:
                item.margin = ((item.price - item.cost) / item.price) * 100
            else:
                item.margin = 0


class RestaurantMenuOption(models.Model):
    """Menu item options (size, extras, etc.)"""
    _name = 'restaurant.menu.option'
    _description = 'Menu Option'
    _order = 'option_type_id, sequence'

    item_id = fields.Many2one(
        'restaurant.menu.item',
        string='Menu Item',
        required=True,
        ondelete='cascade',
    )
    option_type_id = fields.Many2one(
        'restaurant.menu.option.type',
        string='Option Type',
        required=True,
    )
    name = fields.Char(
        string='Option Name',
        required=True,
    )
    sequence = fields.Integer(
        string='Sequence',
        default=10,
    )
    price_extra = fields.Float(
        string='Price Extra',
        digits='Product Price',
    )
    is_default = fields.Boolean(
        string='Default',
    )


class RestaurantMenuOptionType(models.Model):
    """Types of menu options (Size, Cooking, Sides, etc.)"""
    _name = 'restaurant.menu.option.type'
    _description = 'Menu Option Type'
    _order = 'sequence, name'

    name = fields.Char(
        string='Option Type',
        required=True,
    )
    code = fields.Char(
        string='Code',
    )
    sequence = fields.Integer(
        string='Sequence',
        default=10,
    )
    selection_type = fields.Selection([
        ('single', 'Single Selection'),
        ('multiple', 'Multiple Selection'),
    ], string='Selection Type', default='single', required=True)
    required = fields.Boolean(
        string='Required',
        default=False,
    )
    max_selections = fields.Integer(
        string='Max Selections',
        default=0,
        help='0 = unlimited',
    )


class RestaurantMenuIngredient(models.Model):
    """Menu item ingredients for recipe/stock management"""
    _name = 'restaurant.menu.ingredient'
    _description = 'Menu Ingredient'
    _order = 'sequence'

    item_id = fields.Many2one(
        'restaurant.menu.item',
        string='Menu Item',
        required=True,
        ondelete='cascade',
    )
    product_id = fields.Many2one(
        'product.product',
        string='Ingredient',
        required=True,
        domain="[('type', 'in', ['consu', 'product'])]",
    )
    sequence = fields.Integer(
        string='Sequence',
        default=10,
    )
    quantity = fields.Float(
        string='Quantity',
        required=True,
        default=1.0,
    )
    uom_id = fields.Many2one(
        'uom.uom',
        string='Unit',
        required=True,
    )
    is_optional = fields.Boolean(
        string='Optional',
        help='Customer can request to remove this ingredient',
    )
    extra_price = fields.Float(
        string='Extra Price',
        help='Price for adding extra of this ingredient',
    )


class RestaurantKitchenPrinter(models.Model):
    """Kitchen printer configuration"""
    _name = 'restaurant.kitchen.printer'
    _description = 'Kitchen Printer'
    _order = 'name'

    name = fields.Char(
        string='Printer Name',
        required=True,
    )
    printer_type = fields.Selection([
        ('kitchen', 'Kitchen'),
        ('bar', 'Bar'),
        ('dessert', 'Dessert'),
        ('receipt', 'Receipt'),
    ], string='Type', required=True, default='kitchen')
    ip_address = fields.Char(
        string='IP Address',
    )
    active = fields.Boolean(
        string='Active',
        default=True,
    )
