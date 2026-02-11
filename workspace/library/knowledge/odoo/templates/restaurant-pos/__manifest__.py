# -*- coding: utf-8 -*-
{
    'name': 'Restaurant POS Management',
    'version': '17.0.1.0.0',
    'category': 'Point of Sale',
    'summary': 'Complete restaurant and food service management with POS integration',
    'description': """
Restaurant POS Management
=========================

Complete solution for restaurant, bar, and food service management with
integrated Point of Sale.

Features:
---------
* Table management with floor plans
* Order taking and kitchen display
* Menu management with categories
* Ingredient and recipe management
* Kitchen orders and preparation tracking
* Split bills and tips handling
* Reservation management
* Inventory and stock alerts
* Staff management and shifts
* Sales reports and analytics

This module is designed for:
- Restaurants
- Cafes and coffee shops
- Bars and pubs
- Fast food outlets
- Food trucks
- Catering services
    """,
    'author': 'ULTRA-CREATE',
    'website': 'https://ultra-create.com',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'mail',
        'product',
        'stock',
        'account',
        'hr',
    ],
    'data': [
        # Security
        'security/restaurant_security.xml',
        'security/ir.model.access.csv',
        # Data
        'data/ir_sequence_data.xml',
        'data/restaurant_data.xml',
        # Views
        'views/restaurant_table_views.xml',
        'views/restaurant_menu_views.xml',
        'views/restaurant_order_views.xml',
        'views/restaurant_reservation_views.xml',
        'views/restaurant_menu_views_main.xml',
        # Reports
        'reports/order_ticket_report.xml',
        # Wizards
        'wizards/order_wizard_views.xml',
    ],
    'demo': [
        'demo/restaurant_demo.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'restaurant_pos/static/src/css/restaurant.css',
        ],
    },
    'installable': True,
    'application': True,
    'auto_install': False,
}
