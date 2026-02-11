# -*- coding: utf-8 -*-
{
    'name': '{{MODULE_NAME}}',
    'version': '19.0.1.0.0',
    'category': '{{CATEGORY}}',
    'summary': '{{SUMMARY}}',
    'description': '''
        {{DESCRIPTION}}
    ''',
    'author': '{{AUTHOR}}',
    'website': '{{WEBSITE}}',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'mail',
        # Ajouter les dépendances selon les besoins
        # 'sale',
        # 'account',
        # 'stock',
        # 'contacts',
    ],
    'external_dependencies': {
        'python': [
            # 'requests',
            # 'pydantic',
        ],
    },
    'data': [
        # Sécurité (toujours en premier)
        'security/{{module_name}}_security.xml',
        'security/ir.model.access.csv',

        # Données
        'data/ir_sequence_data.xml',
        # 'data/ir_cron_data.xml',

        # Vues
        'views/{{model_name}}_views.xml',
        'views/res_config_settings_views.xml',
        'views/menu_views.xml',

        # Wizards
        # 'wizards/{{wizard_name}}_views.xml',

        # Reports
        # 'reports/{{report_name}}_templates.xml',
        # 'reports/{{report_name}}_actions.xml',
    ],
    'demo': [
        # 'demo/demo_data.xml',
    ],
    'assets': {
        'web.assets_backend': [
            # '{{module_name}}/static/src/js/**/*',
            # '{{module_name}}/static/src/css/**/*',
            # '{{module_name}}/static/src/xml/**/*',
        ],
    },
    'installable': True,
    'application': True,
    'auto_install': False,
    # 'post_init_hook': 'post_init_hook',
    # 'uninstall_hook': 'uninstall_hook',
}
