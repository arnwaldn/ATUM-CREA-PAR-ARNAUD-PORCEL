# -*- coding: utf-8 -*-

import json
import hmac
import hashlib
import logging
from datetime import datetime

from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)


class WebhookController(http.Controller):
    """Controller pour recevoir les webhooks externes"""

    @http.route(
        '/{{module_name}}/webhook',
        type='http',
        auth='public',
        methods=['POST'],
        csrf=False,
    )
    def receive_webhook(self, **kwargs):
        """
        Endpoint pour recevoir les webhooks

        Headers attendus:
        - X-Webhook-Signature: Signature HMAC du payload
        - X-Webhook-Timestamp: Timestamp de la requête

        Body: JSON avec event_type et data
        """
        start_time = datetime.now()

        try:
            # 1. Récupérer le secret webhook
            webhook_secret = request.env['ir.config_parameter'].sudo().get_param(
                '{{module_name}}.webhook_secret'
            )

            # 2. Valider la signature si configurée
            if webhook_secret:
                signature = request.httprequest.headers.get('X-Webhook-Signature', '')
                timestamp = request.httprequest.headers.get('X-Webhook-Timestamp', '')
                raw_body = request.httprequest.data

                if not self._verify_signature(webhook_secret, raw_body, signature, timestamp):
                    _logger.warning("Invalid webhook signature")
                    return request.make_json_response(
                        {'error': 'Invalid signature'},
                        status=401
                    )

            # 3. Parser le payload
            try:
                payload = json.loads(request.httprequest.data)
            except json.JSONDecodeError as e:
                _logger.error(f"Invalid JSON payload: {e}")
                return request.make_json_response(
                    {'error': 'Invalid JSON'},
                    status=400
                )

            # 4. Extraire le type d'événement
            event_type = payload.get('event_type') or payload.get('event')
            if not event_type:
                return request.make_json_response(
                    {'error': 'Missing event_type'},
                    status=400
                )

            # 5. Router vers le handler approprié
            handler_name = f'_handle_{event_type.replace(".", "_")}'
            handler = getattr(self, handler_name, None)

            if handler:
                result = handler(payload)
            else:
                result = self._handle_unknown_event(event_type, payload)

            # 6. Log succès
            self._log_webhook(event_type, payload, 'success', start_time)

            return request.make_json_response({
                'status': 'success',
                'event_type': event_type,
                'result': result,
            })

        except Exception as e:
            _logger.exception(f"Webhook error: {e}")
            self._log_webhook('error', {}, 'error', start_time, str(e))
            return request.make_json_response(
                {'error': 'Internal server error'},
                status=500
            )

    def _verify_signature(self, secret: str, payload: bytes,
                          signature: str, timestamp: str) -> bool:
        """Vérifier la signature HMAC du webhook"""
        if not signature or not timestamp:
            return False

        try:
            # Vérifier la fraîcheur (max 5 minutes)
            ts = int(timestamp)
            now = int(datetime.now().timestamp())
            if abs(now - ts) > 300:
                _logger.warning(f"Webhook timestamp too old: {ts}")
                return False
        except ValueError:
            return False

        # Calculer la signature attendue
        message = timestamp.encode() + payload
        expected = hmac.new(
            secret.encode(),
            message,
            hashlib.sha256
        ).hexdigest()

        # Extraire la signature (enlever le préfixe sha256= si présent)
        actual = signature.replace('sha256=', '')

        return hmac.compare_digest(expected, actual)

    def _log_webhook(self, event_type: str, payload: dict,
                     status: str, start_time: datetime, error: str = None):
        """Enregistrer le webhook dans les logs"""
        duration = (datetime.now() - start_time).total_seconds() * 1000

        try:
            request.env['{{module_name}}.log'].sudo().create({
                'operation': 'webhook_received',
                'event_type': event_type,
                'direction': 'inbound',
                'status': status,
                'request_data': json.dumps(payload)[:10000],
                'error_message': error,
                'duration_ms': int(duration),
            })
        except Exception as e:
            _logger.error(f"Failed to log webhook: {e}")

    # ==================== HANDLERS D'ÉVÉNEMENTS ====================

    def _handle_unknown_event(self, event_type: str, payload: dict) -> dict:
        """Handler par défaut pour événements inconnus"""
        _logger.info(f"Received unknown event type: {event_type}")
        return {'action': 'logged', 'event_type': event_type}

    # Exemple de handler spécifique:
    # def _handle_booking_created(self, payload: dict) -> dict:
    #     """Handler pour l'événement booking.created"""
    #     data = payload.get('data', {})
    #     # Traiter la réservation...
    #     return {'action': 'processed', 'booking_id': data.get('id')}
