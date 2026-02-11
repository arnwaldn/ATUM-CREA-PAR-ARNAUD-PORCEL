# -*- coding: utf-8 -*-

from odoo import models, fields, api


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    # ==================== CHAMPS DE CONFIGURATION ====================

    {{module_name}}_api_url = fields.Char(
        string='API URL',
        config_parameter='{{module_name}}.api_url',
        default='https://api.example.com/v1',
    )

    {{module_name}}_api_key = fields.Char(
        string='API Key',
        config_parameter='{{module_name}}.api_key',
    )

    {{module_name}}_api_secret = fields.Char(
        string='API Secret',
        config_parameter='{{module_name}}.api_secret',
    )

    {{module_name}}_webhook_secret = fields.Char(
        string='Webhook Secret',
        config_parameter='{{module_name}}.webhook_secret',
    )

    {{module_name}}_auto_sync = fields.Boolean(
        string='Synchronisation automatique',
        config_parameter='{{module_name}}.auto_sync',
        default=True,
    )

    {{module_name}}_sync_interval = fields.Integer(
        string='Intervalle de sync (minutes)',
        config_parameter='{{module_name}}.sync_interval',
        default=5,
    )

    # ==================== ACTIONS ====================

    def action_test_connection(self):
        """Tester la connexion à l'API externe"""
        self.ensure_one()

        # TODO: Implémenter le test de connexion
        # api_url = self.env['ir.config_parameter'].sudo().get_param('{{module_name}}.api_url')
        # api_key = self.env['ir.config_parameter'].sudo().get_param('{{module_name}}.api_key')

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': 'Test de connexion',
                'message': 'Connexion réussie!',
                'type': 'success',
                'sticky': False,
            }
        }

    def action_sync_now(self):
        """Lancer une synchronisation manuelle"""
        self.ensure_one()

        # TODO: Implémenter la synchronisation manuelle
        # self.env['{{model.name}}.sync'].sync_all()

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': 'Synchronisation',
                'message': 'Synchronisation lancée!',
                'type': 'info',
                'sticky': False,
            }
        }
