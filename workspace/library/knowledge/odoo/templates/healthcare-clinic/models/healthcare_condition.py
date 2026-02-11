# -*- coding: utf-8 -*-
from odoo import models, fields, api


class HealthcareCondition(models.Model):
    _name = 'healthcare.condition'
    _description = 'Medical Condition / Diagnosis'
    _order = 'name'

    name = fields.Char(string='Condition Name', required=True, translate=True)
    icd_code = fields.Char(string='ICD-10 Code', index=True)
    description = fields.Text(string='Description', translate=True)
    category = fields.Selection([
        ('infectious', 'Infectious Diseases'),
        ('neoplasms', 'Neoplasms'),
        ('blood', 'Blood Diseases'),
        ('endocrine', 'Endocrine/Metabolic'),
        ('mental', 'Mental Disorders'),
        ('nervous', 'Nervous System'),
        ('eye', 'Eye Diseases'),
        ('ear', 'Ear Diseases'),
        ('circulatory', 'Circulatory System'),
        ('respiratory', 'Respiratory System'),
        ('digestive', 'Digestive System'),
        ('skin', 'Skin Diseases'),
        ('musculoskeletal', 'Musculoskeletal'),
        ('genitourinary', 'Genitourinary'),
        ('pregnancy', 'Pregnancy/Childbirth'),
        ('perinatal', 'Perinatal Conditions'),
        ('congenital', 'Congenital Anomalies'),
        ('symptoms', 'Symptoms/Signs'),
        ('injury', 'Injury/Poisoning'),
        ('external', 'External Causes'),
        ('other', 'Other'),
    ], string='Category', default='other')
    is_chronic = fields.Boolean(string='Chronic Condition')
    is_allergy = fields.Boolean(string='Is Allergy')
    severity = fields.Selection([
        ('mild', 'Mild'),
        ('moderate', 'Moderate'),
        ('severe', 'Severe'),
    ], string='Default Severity')
    active = fields.Boolean(default=True)

    _sql_constraints = [
        ('icd_code_uniq', 'unique(icd_code)',
         'ICD-10 code must be unique!'),
    ]

    @api.depends('name', 'icd_code')
    def _compute_display_name(self):
        for condition in self:
            if condition.icd_code:
                condition.display_name = f"[{condition.icd_code}] {condition.name}"
            else:
                condition.display_name = condition.name
