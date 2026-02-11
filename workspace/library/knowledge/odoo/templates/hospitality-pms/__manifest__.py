# -*- coding: utf-8 -*-
{
    'name': 'Hotel Property Management System',
    'version': '19.0.1.0.0',
    'category': 'Hospitality',
    'summary': 'Complete PMS for hotel management',
    'description': '''
        Hotel Property Management System (PMS)
        =======================================
        Features:
        - Room and room type management
        - Reservations and bookings
        - Guest management with loyalty program
        - Rate plans and revenue management
        - Housekeeping management
        - Channel manager integration
        - Front desk operations
        - Folio and billing
    ''',
    'author': 'Your Company',
    'website': 'https://yourcompany.com',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'mail',
        'account',
        'sale',
        'contacts',
        'hr',
    ],
    'external_dependencies': {
        'python': [
            'requests',
        ],
    },
    'data': [
        # Security
        'security/hotel_security.xml',
        'security/ir.model.access.csv',

        # Data
        'data/ir_sequence_data.xml',
        'data/hotel_amenity_data.xml',
        'data/hotel_room_status_data.xml',

        # Views
        'views/hotel_property_views.xml',
        'views/hotel_room_type_views.xml',
        'views/hotel_room_views.xml',
        'views/hotel_reservation_views.xml',
        'views/hotel_guest_views.xml',
        'views/hotel_rate_plan_views.xml',
        'views/hotel_housekeeping_views.xml',
        'views/hotel_channel_views.xml',
        'views/hotel_folio_views.xml',
        'views/res_config_settings_views.xml',
        'views/menu_views.xml',

        # Wizards
        'wizards/hotel_checkin_wizard_views.xml',
        'wizards/hotel_checkout_wizard_views.xml',

        # Reports
        'reports/hotel_reservation_report.xml',
        'reports/hotel_occupancy_report.xml',
    ],
    'demo': [
        'demo/demo_data.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'hotel_pms/static/src/js/**/*',
            'hotel_pms/static/src/xml/**/*',
            'hotel_pms/static/src/scss/**/*',
        ],
    },
    'installable': True,
    'application': True,
    'auto_install': False,
}
