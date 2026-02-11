# -*- coding: utf-8 -*-
{
    'name': 'Event & Association Management',
    'version': '17.0.1.0.0',
    'category': 'Events',
    'summary': 'Complete event and association/club management solution',
    'description': """
Event & Association Management
==============================

Complete solution for managing events, associations, clubs, and member organizations.

Features:
---------
* Event planning and registration
* Membership management with subscriptions
* Activity and workshop scheduling
* Volunteer coordination
* Donation and fundraising tracking
* Communication tools
* Resource and venue booking
* Financial reporting

This module is designed for:
- Non-profit organizations
- Sports clubs
- Cultural associations
- Professional societies
- Community groups
- Conference organizers
    """,
    'author': 'ULTRA-CREATE',
    'website': 'https://ultra-create.com',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'mail',
        'calendar',
        'account',
        'hr',
    ],
    'data': [
        # Security
        'security/association_security.xml',
        'security/ir.model.access.csv',
        # Data
        'data/ir_sequence_data.xml',
        'data/association_data.xml',
        # Views
        'views/association_member_views.xml',
        'views/association_event_views.xml',
        'views/association_activity_views.xml',
        'views/association_donation_views.xml',
        'views/association_resource_views.xml',
        'views/association_menu_views.xml',
        # Reports
        'reports/membership_card_report.xml',
        # Wizards
        'wizards/member_wizard_views.xml',
    ],
    'demo': [
        'demo/association_demo.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'event_association/static/src/css/association.css',
        ],
    },
    'installable': True,
    'application': True,
    'auto_install': False,
}
