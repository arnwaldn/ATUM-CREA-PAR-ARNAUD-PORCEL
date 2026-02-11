# -*- coding: utf-8 -*-
{
    'name': 'Healthcare Clinic Management',
    'version': '17.0.1.0.0',
    'category': 'Healthcare',
    'summary': 'Complete clinic and medical practice management',
    'description': """
Healthcare Clinic Management
============================

Complete solution for medical clinics, doctors offices, and healthcare practices.

Features:
---------
* Patient management with full medical history
* Appointment scheduling with calendar integration
* Medical consultations and clinical notes
* Prescription management with medication database
* Laboratory orders and results tracking
* Invoice generation and insurance handling
* Patient portal for online booking
* RGPD compliant data handling

This module is designed for:
- General practitioners
- Specialist clinics
- Medical centers
- Dental practices
- Physiotherapy centers
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
        'portal',
    ],
    'data': [
        # Security
        'security/healthcare_security.xml',
        'security/ir.model.access.csv',
        # Data
        'data/ir_sequence_data.xml',
        'data/healthcare_data.xml',
        # Views
        'views/healthcare_patient_views.xml',
        'views/healthcare_practitioner_views.xml',
        'views/healthcare_appointment_views.xml',
        'views/healthcare_consultation_views.xml',
        'views/healthcare_prescription_views.xml',
        'views/healthcare_menu_views.xml',
        # Reports
        'reports/prescription_report.xml',
        # Wizards
        'wizards/appointment_wizard_views.xml',
    ],
    'demo': [
        'demo/healthcare_demo.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'healthcare_clinic/static/src/css/healthcare.css',
        ],
    },
    'installable': True,
    'application': True,
    'auto_install': False,
}
