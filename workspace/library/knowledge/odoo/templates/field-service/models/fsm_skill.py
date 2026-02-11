# -*- coding: utf-8 -*-
from odoo import models, fields


class FsmSkill(models.Model):
    _name = 'fsm.skill'
    _description = 'Technician Skill'
    _order = 'name'

    name = fields.Char(string='Skill Name', required=True, translate=True)
    code = fields.Char(string='Code')
    category = fields.Selection([
        ('technical', 'Technical'),
        ('certification', 'Certification'),
        ('language', 'Language'),
        ('safety', 'Safety'),
        ('software', 'Software'),
        ('other', 'Other'),
    ], string='Category', default='technical')
    description = fields.Text(string='Description')
    requires_certification = fields.Boolean(string='Requires Certification')
    certification_validity_months = fields.Integer(
        string='Certification Validity (months)')
    active = fields.Boolean(default=True)


class FsmInterventionType(models.Model):
    _name = 'fsm.intervention.type'
    _description = 'Intervention Type'
    _order = 'sequence, name'

    name = fields.Char(string='Type Name', required=True, translate=True)
    code = fields.Char(string='Code')
    sequence = fields.Integer(default=10)
    description = fields.Text(string='Description')

    # Default values
    default_duration = fields.Float(
        string='Default Duration (hours)', default=1.0)
    default_priority = fields.Selection([
        ('0', 'Low'),
        ('1', 'Normal'),
        ('2', 'High'),
        ('3', 'Urgent'),
    ], string='Default Priority', default='1')

    # SLA
    sla_response_hours = fields.Float(
        string='SLA Response Time (hours)',
        help='Maximum time to first response')
    sla_resolution_hours = fields.Float(
        string='SLA Resolution Time (hours)',
        help='Maximum time to resolution')

    # Required skills
    skill_ids = fields.Many2many(
        'fsm.skill', string='Required Skills')

    # Billing
    billable = fields.Boolean(string='Billable by Default', default=True)
    service_product_id = fields.Many2one(
        'product.product', string='Service Product',
        domain=[('type', '=', 'service')])

    color = fields.Integer(string='Color')
    active = fields.Boolean(default=True)
