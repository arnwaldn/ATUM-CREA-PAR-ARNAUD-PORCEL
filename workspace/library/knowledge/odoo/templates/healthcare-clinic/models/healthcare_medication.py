# -*- coding: utf-8 -*-
from odoo import models, fields, api


class HealthcareMedication(models.Model):
    _name = 'healthcare.medication'
    _description = 'Medication'
    _inherit = ['mail.thread']
    _order = 'name'

    name = fields.Char(string='Medication Name', required=True, index=True)
    active_ingredient = fields.Char(string='Active Ingredient')
    brand_name = fields.Char(string='Brand Name')

    # Classification
    medication_type = fields.Selection([
        ('brand', 'Brand Name'),
        ('generic', 'Generic'),
        ('otc', 'Over-the-Counter'),
    ], string='Type', default='generic')

    category_id = fields.Many2one(
        'healthcare.medication.category', string='Category')

    # Dosage Information
    form = fields.Selection([
        ('tablet', 'Tablet'),
        ('capsule', 'Capsule'),
        ('syrup', 'Syrup'),
        ('injection', 'Injection'),
        ('cream', 'Cream/Ointment'),
        ('drops', 'Drops'),
        ('inhaler', 'Inhaler'),
        ('patch', 'Patch'),
        ('suppository', 'Suppository'),
        ('powder', 'Powder'),
        ('solution', 'Solution'),
        ('suspension', 'Suspension'),
        ('other', 'Other'),
    ], string='Form', required=True, default='tablet')

    strength = fields.Char(string='Strength', help='e.g., 500mg, 10mg/ml')
    unit = fields.Selection([
        ('mg', 'mg'),
        ('g', 'g'),
        ('ml', 'ml'),
        ('mcg', 'mcg'),
        ('iu', 'IU'),
        ('percent', '%'),
    ], string='Unit', default='mg')

    # Administration
    route = fields.Selection([
        ('oral', 'Oral'),
        ('sublingual', 'Sublingual'),
        ('topical', 'Topical'),
        ('inhalation', 'Inhalation'),
        ('injection_im', 'Intramuscular'),
        ('injection_iv', 'Intravenous'),
        ('injection_sc', 'Subcutaneous'),
        ('rectal', 'Rectal'),
        ('ophthalmic', 'Ophthalmic'),
        ('otic', 'Otic'),
        ('nasal', 'Nasal'),
        ('transdermal', 'Transdermal'),
    ], string='Route of Administration', default='oral')

    # Warnings & Contraindications
    contraindications = fields.Text(string='Contraindications')
    side_effects = fields.Text(string='Common Side Effects')
    interactions = fields.Text(string='Drug Interactions')
    pregnancy_category = fields.Selection([
        ('a', 'Category A - Safe'),
        ('b', 'Category B - Probably Safe'),
        ('c', 'Category C - Use with Caution'),
        ('d', 'Category D - Positive Evidence of Risk'),
        ('x', 'Category X - Contraindicated'),
    ], string='Pregnancy Category')

    # Prescribing
    requires_prescription = fields.Boolean(
        string='Requires Prescription', default=True)
    controlled_substance = fields.Boolean(string='Controlled Substance')
    controlled_schedule = fields.Selection([
        ('i', 'Schedule I'),
        ('ii', 'Schedule II'),
        ('iii', 'Schedule III'),
        ('iv', 'Schedule IV'),
        ('v', 'Schedule V'),
    ], string='Controlled Schedule')

    # Default prescription values
    default_dosage = fields.Char(
        string='Default Dosage', help='e.g., 1 tablet')
    default_frequency = fields.Selection([
        ('once_daily', 'Once Daily'),
        ('twice_daily', 'Twice Daily'),
        ('three_daily', 'Three Times Daily'),
        ('four_daily', 'Four Times Daily'),
        ('every_4h', 'Every 4 Hours'),
        ('every_6h', 'Every 6 Hours'),
        ('every_8h', 'Every 8 Hours'),
        ('every_12h', 'Every 12 Hours'),
        ('weekly', 'Once Weekly'),
        ('as_needed', 'As Needed'),
        ('other', 'Other'),
    ], string='Default Frequency')
    default_duration_days = fields.Integer(string='Default Duration (days)')

    # Product Link
    product_id = fields.Many2one(
        'product.product', string='Product',
        help='Link to inventory product for stock management')

    notes = fields.Text(string='Notes')
    active = fields.Boolean(default=True)

    @api.depends('name', 'strength', 'form')
    def _compute_display_name(self):
        for med in self:
            name_parts = [med.name]
            if med.strength:
                name_parts.append(med.strength)
            if med.form:
                name_parts.append(dict(self._fields['form'].selection).get(med.form, ''))
            med.display_name = ' - '.join(filter(None, name_parts))


class HealthcareMedicationCategory(models.Model):
    _name = 'healthcare.medication.category'
    _description = 'Medication Category'
    _order = 'name'

    name = fields.Char(string='Category Name', required=True, translate=True)
    code = fields.Char(string='Code')
    parent_id = fields.Many2one(
        'healthcare.medication.category', string='Parent Category')
    child_ids = fields.One2many(
        'healthcare.medication.category', 'parent_id', string='Subcategories')
    description = fields.Text(string='Description')
    active = fields.Boolean(default=True)
