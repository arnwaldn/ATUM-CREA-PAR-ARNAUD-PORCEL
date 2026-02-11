# -*- coding: utf-8 -*-
from odoo import models, fields, api


class RealestateProperty(models.Model):
    _name = 'realestate.property'
    _description = 'Real Estate Property'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'create_date desc'

    name = fields.Char(
        string='Reference', required=True, copy=False, readonly=True,
        default=lambda self: self.env['ir.sequence'].next_by_code('realestate.property'))

    # Basic Info
    title = fields.Char(string='Title', required=True, tracking=True)
    description = fields.Html(string='Description')
    property_type = fields.Selection([
        ('apartment', 'Apartment'),
        ('house', 'House'),
        ('villa', 'Villa'),
        ('studio', 'Studio'),
        ('loft', 'Loft'),
        ('duplex', 'Duplex'),
        ('land', 'Land'),
        ('commercial', 'Commercial Space'),
        ('office', 'Office'),
        ('warehouse', 'Warehouse'),
        ('parking', 'Parking'),
        ('other', 'Other'),
    ], string='Property Type', required=True, tracking=True)

    # Transaction Type
    transaction_type = fields.Selection([
        ('sale', 'For Sale'),
        ('rent', 'For Rent'),
        ('both', 'Sale or Rent'),
    ], string='Transaction Type', default='sale', required=True, tracking=True)

    # Pricing
    sale_price = fields.Monetary(
        string='Sale Price', currency_field='currency_id', tracking=True)
    rent_price = fields.Monetary(
        string='Monthly Rent', currency_field='currency_id', tracking=True)
    charges = fields.Monetary(
        string='Monthly Charges', currency_field='currency_id')
    price_per_sqm = fields.Monetary(
        string='Price/m²', compute='_compute_price_per_sqm',
        currency_field='currency_id')
    currency_id = fields.Many2one(
        'res.currency', default=lambda self: self.env.company.currency_id)

    # Location
    street = fields.Char(string='Street')
    street2 = fields.Char(string='Street 2')
    zip_code = fields.Char(string='Zip Code')
    city = fields.Char(string='City', required=True)
    state_id = fields.Many2one('res.country.state', string='Region')
    country_id = fields.Many2one(
        'res.country', string='Country',
        default=lambda self: self.env.company.country_id)
    latitude = fields.Float(string='Latitude', digits=(10, 7))
    longitude = fields.Float(string='Longitude', digits=(10, 7))

    # Characteristics
    living_area = fields.Float(string='Living Area (m²)')
    total_area = fields.Float(string='Total Area (m²)')
    land_area = fields.Float(string='Land Area (m²)')
    rooms = fields.Integer(string='Rooms')
    bedrooms = fields.Integer(string='Bedrooms')
    bathrooms = fields.Integer(string='Bathrooms')
    floor = fields.Integer(string='Floor')
    total_floors = fields.Integer(string='Total Floors')
    construction_year = fields.Integer(string='Construction Year')

    # Features
    furnished = fields.Boolean(string='Furnished')
    parking_spaces = fields.Integer(string='Parking Spaces')
    garage = fields.Boolean(string='Garage')
    garden = fields.Boolean(string='Garden')
    garden_area = fields.Float(string='Garden Area (m²)')
    terrace = fields.Boolean(string='Terrace')
    terrace_area = fields.Float(string='Terrace Area (m²)')
    balcony = fields.Boolean(string='Balcony')
    swimming_pool = fields.Boolean(string='Swimming Pool')
    elevator = fields.Boolean(string='Elevator')
    cellar = fields.Boolean(string='Cellar')
    disabled_access = fields.Boolean(string='Disabled Access')

    # Heating & Energy
    heating_type = fields.Selection([
        ('individual_gas', 'Individual Gas'),
        ('collective_gas', 'Collective Gas'),
        ('individual_electric', 'Individual Electric'),
        ('collective_electric', 'Collective Electric'),
        ('heat_pump', 'Heat Pump'),
        ('fuel_oil', 'Fuel Oil'),
        ('wood', 'Wood'),
        ('solar', 'Solar'),
        ('other', 'Other'),
    ], string='Heating Type')
    hot_water = fields.Selection([
        ('individual', 'Individual'),
        ('collective', 'Collective'),
    ], string='Hot Water')

    # Energy Performance (DPE)
    energy_class = fields.Selection([
        ('a', 'A'),
        ('b', 'B'),
        ('c', 'C'),
        ('d', 'D'),
        ('e', 'E'),
        ('f', 'F'),
        ('g', 'G'),
    ], string='Energy Class (DPE)', tracking=True)
    energy_value = fields.Integer(string='Energy Consumption (kWh/m²/year)')
    ghg_class = fields.Selection([
        ('a', 'A'),
        ('b', 'B'),
        ('c', 'C'),
        ('d', 'D'),
        ('e', 'E'),
        ('f', 'F'),
        ('g', 'G'),
    ], string='GHG Emission Class')
    ghg_value = fields.Integer(string='GHG Emissions (kg CO₂/m²/year)')

    # Condition
    condition = fields.Selection([
        ('new', 'New'),
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('to_renovate', 'To Renovate'),
        ('to_restore', 'To Restore'),
    ], string='Condition', default='good')
    renovation_year = fields.Integer(string='Last Renovation Year')

    # Status
    state = fields.Selection([
        ('draft', 'Draft'),
        ('available', 'Available'),
        ('option', 'Under Option'),
        ('sold', 'Sold'),
        ('rented', 'Rented'),
        ('withdrawn', 'Withdrawn'),
    ], string='Status', default='draft', tracking=True)

    # Relations
    owner_id = fields.Many2one('realestate.owner', string='Owner', tracking=True)
    mandate_ids = fields.One2many(
        'realestate.mandate', 'property_id', string='Mandates')
    visit_ids = fields.One2many(
        'realestate.visit', 'property_id', string='Visits')
    offer_ids = fields.One2many(
        'realestate.offer', 'property_id', string='Offers')

    # Counts
    mandate_count = fields.Integer(compute='_compute_counts')
    visit_count = fields.Integer(compute='_compute_counts')
    offer_count = fields.Integer(compute='_compute_counts')

    # Agent
    agent_id = fields.Many2one('res.users', string='Assigned Agent', tracking=True)
    company_id = fields.Many2one(
        'res.company', string='Company', default=lambda self: self.env.company)

    # Images
    image_ids = fields.One2many(
        'realestate.property.image', 'property_id', string='Images')
    image_main = fields.Binary(
        string='Main Image', compute='_compute_main_image', store=True)

    # Availability
    available_from = fields.Date(string='Available From')
    notes = fields.Text(string='Internal Notes')

    active = fields.Boolean(default=True)

    @api.depends('sale_price', 'rent_price', 'living_area', 'transaction_type')
    def _compute_price_per_sqm(self):
        for prop in self:
            if prop.living_area:
                if prop.transaction_type in ('sale', 'both') and prop.sale_price:
                    prop.price_per_sqm = prop.sale_price / prop.living_area
                elif prop.transaction_type == 'rent' and prop.rent_price:
                    prop.price_per_sqm = prop.rent_price / prop.living_area
                else:
                    prop.price_per_sqm = 0
            else:
                prop.price_per_sqm = 0

    @api.depends('image_ids')
    def _compute_main_image(self):
        for prop in self:
            main = prop.image_ids.filtered('is_main')[:1]
            prop.image_main = main.image if main else False

    @api.depends('mandate_ids', 'visit_ids', 'offer_ids')
    def _compute_counts(self):
        for prop in self:
            prop.mandate_count = len(prop.mandate_ids)
            prop.visit_count = len(prop.visit_ids)
            prop.offer_count = len(prop.offer_ids)

    def action_publish(self):
        self.write({'state': 'available'})

    def action_withdraw(self):
        self.write({'state': 'withdrawn'})

    def action_set_option(self):
        self.write({'state': 'option'})

    def action_mark_sold(self):
        self.write({'state': 'sold'})

    def action_mark_rented(self):
        self.write({'state': 'rented'})

    def action_view_visits(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Visits',
            'res_model': 'realestate.visit',
            'view_mode': 'tree,form,calendar',
            'domain': [('property_id', '=', self.id)],
            'context': {'default_property_id': self.id},
        }

    def action_view_offers(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Offers',
            'res_model': 'realestate.offer',
            'view_mode': 'tree,form',
            'domain': [('property_id', '=', self.id)],
            'context': {'default_property_id': self.id},
        }

    def action_schedule_visit(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Schedule Visit',
            'res_model': 'realestate.visit.wizard',
            'view_mode': 'form',
            'target': 'new',
            'context': {'default_property_id': self.id},
        }


class RealestatePropertyImage(models.Model):
    _name = 'realestate.property.image'
    _description = 'Property Image'
    _order = 'sequence, id'

    property_id = fields.Many2one(
        'realestate.property', string='Property',
        required=True, ondelete='cascade')
    sequence = fields.Integer(string='Sequence', default=10)
    name = fields.Char(string='Description')
    image = fields.Binary(string='Image', required=True, attachment=True)
    is_main = fields.Boolean(string='Main Image')

    @api.onchange('is_main')
    def _onchange_is_main(self):
        if self.is_main and self.property_id:
            # Unset other main images
            self.property_id.image_ids.filtered(
                lambda i: i.id != self.id).write({'is_main': False})
