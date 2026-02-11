# -*- coding: utf-8 -*-

import json
import logging

from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)


class MainController(http.Controller):
    """Controller principal pour les routes HTTP"""

    @http.route(
        '/{{module_name}}/health',
        type='http',
        auth='public',
        methods=['GET'],
    )
    def health_check(self, **kwargs):
        """Endpoint de santé pour monitoring"""
        return request.make_json_response({
            'status': 'healthy',
            'module': '{{module_name}}',
            'version': '19.0.1.0.0',
        })

    @http.route(
        '/{{module_name}}/api/v1/<string:model>',
        type='http',
        auth='api_key',
        methods=['GET'],
    )
    def api_list(self, model, **kwargs):
        """API REST pour lister les enregistrements"""
        try:
            # Mapping des modèles autorisés
            allowed_models = {
                'records': '{{model.name}}',
            }

            if model not in allowed_models:
                return request.make_json_response(
                    {'error': 'Model not found'},
                    status=404
                )

            odoo_model = allowed_models[model]
            limit = int(kwargs.get('limit', 100))
            offset = int(kwargs.get('offset', 0))

            records = request.env[odoo_model].search(
                [],
                limit=min(limit, 100),
                offset=offset,
            )

            return request.make_json_response({
                'data': [{
                    'id': r.id,
                    'name': r.name,
                    'state': r.state,
                } for r in records],
                'pagination': {
                    'limit': limit,
                    'offset': offset,
                    'total': request.env[odoo_model].search_count([]),
                }
            })

        except Exception as e:
            _logger.exception(f"API error: {e}")
            return request.make_json_response(
                {'error': str(e)},
                status=500
            )

    @http.route(
        '/{{module_name}}/api/v1/<string:model>/<int:record_id>',
        type='http',
        auth='api_key',
        methods=['GET'],
    )
    def api_read(self, model, record_id, **kwargs):
        """API REST pour lire un enregistrement"""
        try:
            allowed_models = {
                'records': '{{model.name}}',
            }

            if model not in allowed_models:
                return request.make_json_response(
                    {'error': 'Model not found'},
                    status=404
                )

            odoo_model = allowed_models[model]
            record = request.env[odoo_model].browse(record_id)

            if not record.exists():
                return request.make_json_response(
                    {'error': 'Record not found'},
                    status=404
                )

            return request.make_json_response({
                'data': {
                    'id': record.id,
                    'name': record.name,
                    'state': record.state,
                    'date': record.date.isoformat() if record.date else None,
                    'partner_id': record.partner_id.id if record.partner_id else None,
                    'partner_name': record.partner_id.name if record.partner_id else None,
                    'amount_total': record.amount_total,
                }
            })

        except Exception as e:
            _logger.exception(f"API error: {e}")
            return request.make_json_response(
                {'error': str(e)},
                status=500
            )
