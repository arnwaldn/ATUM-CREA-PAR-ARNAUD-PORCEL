# -*- coding: utf-8 -*-
{
    'name': 'Real Estate Agency Management',
    'version': '17.0.1.0.0',
    'category': 'Real Estate',
    'summary': 'Complete real estate agency and property management',
    'description': """
Real Estate Agency Management
=============================

Complete solution for real estate agencies, property managers, and rental companies.

Features:
---------
* Property listings with detailed characteristics
* Sale and rental mandates
* Owner and tenant management
* Visit scheduling and tracking
* Offers and negotiations
* Rental contracts and lease management
* Commission calculations
* Document management
* Property portal for online listings

This module is designed for:
- Real estate agencies
- Property management companies
- Rental agencies
- Independent agents
    """,
    'author': 'ULTRA-CREATE',
    'website': 'https://ultra-create.com',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'mail',
        'calendar',
        'account',
        'portal',
    ],
    'data': [
        # Security
        'security/realestate_security.xml',
        'security/ir.model.access.csv',
        # Data
        'data/ir_sequence_data.xml',
        'data/realestate_data.xml',
        # Views
        'views/realestate_property_views.xml',
        'views/realestate_mandate_views.xml',
        'views/realestate_visit_views.xml',
        'views/realestate_offer_views.xml',
        'views/realestate_lease_views.xml',
        'views/realestate_owner_views.xml',
        'views/realestate_menu_views.xml',
        # Reports
        'reports/property_report.xml',
        # Wizards
        'wizards/visit_wizard_views.xml',
    ],
    'demo': [
        'demo/realestate_demo.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'real_estate_agency/static/src/css/realestate.css',
        ],
    },
    'installable': True,
    'application': True,
    'auto_install': False,
}
