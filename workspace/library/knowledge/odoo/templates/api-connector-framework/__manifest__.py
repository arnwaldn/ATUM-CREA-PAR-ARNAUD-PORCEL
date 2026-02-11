# -*- coding: utf-8 -*-
{
    'name': 'API Connector Framework',
    'version': '19.0.1.0.0',
    'category': 'Technical',
    'summary': 'Framework for building API integrations',
    'description': '''
        API Connector Framework
        =======================
        A reusable framework for building external API integrations.

        Features:
        - API key management with rate limiting
        - Webhook handling (inbound and outbound)
        - Data mapping and transformation
        - Sync orchestration with queue
        - Error handling and retry logic
        - Audit logging
    ''',
    'author': 'Your Company',
    'website': 'https://yourcompany.com',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'mail',
    ],
    'external_dependencies': {
        'python': [
            'requests',
            'cryptography',
        ],
    },
    'data': [
        'security/api_connector_security.xml',
        'security/ir.model.access.csv',
        'data/ir_sequence_data.xml',
        'data/ir_cron_data.xml',
        'views/api_key_views.xml',
        'views/api_connector_views.xml',
        'views/webhook_views.xml',
        'views/sync_orchestrator_views.xml',
        'views/api_log_views.xml',
        'views/menu_views.xml',
    ],
    'installable': True,
    'application': False,
    'auto_install': False,
}
