# -*- coding: utf-8 -*-
{
    'name': 'Field Service Management',
    'version': '17.0.1.0.0',
    'category': 'Field Service',
    'summary': 'Complete field intervention and maintenance management',
    'description': """
Field Service Management
========================

Complete solution for field service, maintenance, and intervention management.

Features:
---------
* Intervention planning and scheduling
* Technician management with skills
* Equipment and asset tracking
* Service contracts and SLA
* Route optimization
* Mobile-ready interface
* Customer portal

This module is designed for:
- Maintenance companies
- Installation services
- Repair services
- HVAC contractors
- IT support teams
    """,
    'author': 'ULTRA-CREATE',
    'website': 'https://ultra-create.com',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'mail',
        'calendar',
        'account',
        'product',
        'hr',
    ],
    'data': [
        # Security
        'security/fsm_security.xml',
        'security/ir.model.access.csv',
        # Data
        'data/ir_sequence_data.xml',
        'data/fsm_data.xml',
        # Views
        'views/fsm_intervention_views.xml',
        'views/fsm_technician_views.xml',
        'views/fsm_equipment_views.xml',
        'views/fsm_contract_views.xml',
        'views/fsm_menu_views.xml',
        # Reports
        'reports/intervention_report.xml',
        # Wizards
        'wizards/intervention_wizard_views.xml',
    ],
    'demo': [
        'demo/fsm_demo.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'field_service/static/src/css/fsm.css',
        ],
    },
    'installable': True,
    'application': True,
    'auto_install': False,
}
