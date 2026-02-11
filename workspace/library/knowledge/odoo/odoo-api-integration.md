# Guide d'Intégration API avec Odoo v19

## 1. Architecture d'Intégration

### Patterns d'Intégration

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Système Externe (PMS, CRM, etc.)                 │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  Webhooks   │ │  REST API   │ │  Batch Sync │
    │  (Push)     │ │  (Pull)     │ │  (Cron)     │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │               │               │
           └───────────────┼───────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Module d'Intégration Odoo                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │  Controller │  │  API Client │  │   Cron Job  │                 │
│  │  (Webhook)  │  │  (Externe)  │  │  (Scheduler)│                 │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                 │
│         │                │                │                         │
│         └────────────────┼────────────────┘                         │
│                          │                                          │
│                          ▼                                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Data Mapper                               │   │
│  │   Externe → Odoo    |    Odoo → Externe                     │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
│                             ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   Sync Orchestrator                          │   │
│  │   - Queue Management                                         │   │
│  │   - Error Handling                                           │   │
│  │   - Retry Logic                                              │   │
│  │   - Conflict Resolution                                      │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
│                             ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     Odoo Models                              │   │
│  │   res.partner | sale.order | product.product | account.*    │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## 2. Client API Externe

### Classe API Client Robuste

```python
import requests
import logging
import time
import hashlib
import hmac
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from functools import wraps

_logger = logging.getLogger(__name__)

class APIError(Exception):
    """Exception personnalisée pour les erreurs API"""
    def __init__(self, message: str, status_code: int = None, response: dict = None):
        self.message = message
        self.status_code = status_code
        self.response = response
        super().__init__(self.message)


class RateLimiter:
    """Gestionnaire de rate limiting"""
    def __init__(self, max_requests: int = 100, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = []

    def wait_if_needed(self):
        now = time.time()
        # Nettoyer les anciennes requêtes
        self.requests = [r for r in self.requests if now - r < self.window_seconds]

        if len(self.requests) >= self.max_requests:
            sleep_time = self.window_seconds - (now - self.requests[0])
            if sleep_time > 0:
                _logger.warning(f"Rate limit reached, sleeping {sleep_time:.2f}s")
                time.sleep(sleep_time)
                self.requests = []

        self.requests.append(now)


def retry_on_failure(max_retries: int = 3, backoff_factor: float = 2.0):
    """Décorateur pour retry avec backoff exponentiel"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except (requests.exceptions.RequestException, APIError) as e:
                    last_exception = e
                    if attempt < max_retries - 1:
                        sleep_time = backoff_factor ** attempt
                        _logger.warning(
                            f"Attempt {attempt + 1} failed: {e}. "
                            f"Retrying in {sleep_time}s..."
                        )
                        time.sleep(sleep_time)
            raise last_exception
        return wrapper
    return decorator


class ExternalAPIClient:
    """Client API générique robuste"""

    def __init__(self, base_url: str, api_key: str, api_secret: str = None,
                 timeout: int = 30, rate_limit: int = 100):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.api_secret = api_secret
        self.timeout = timeout
        self.rate_limiter = RateLimiter(max_requests=rate_limit)

        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Odoo-Integration/1.0',
        })

        # Token management
        self._access_token = None
        self._token_expiry = None

    def _get_auth_headers(self) -> Dict[str, str]:
        """Obtenir les headers d'authentification"""
        if self._access_token and self._token_expiry > datetime.now():
            return {'Authorization': f'Bearer {self._access_token}'}

        # Refresh token si nécessaire
        if self.api_secret:
            self._refresh_token()
            return {'Authorization': f'Bearer {self._access_token}'}

        return {'Authorization': f'Bearer {self.api_key}'}

    def _refresh_token(self):
        """Rafraîchir le token d'accès"""
        response = requests.post(
            f"{self.base_url}/auth/token",
            json={
                'api_key': self.api_key,
                'api_secret': self.api_secret,
            },
            timeout=self.timeout
        )
        response.raise_for_status()
        data = response.json()
        self._access_token = data['access_token']
        self._token_expiry = datetime.now() + timedelta(seconds=data.get('expires_in', 3600) - 60)

    def _sign_request(self, method: str, endpoint: str, body: str = '') -> str:
        """Signer une requête avec HMAC"""
        if not self.api_secret:
            return ''

        timestamp = str(int(time.time()))
        message = f"{method}{endpoint}{timestamp}{body}"
        signature = hmac.new(
            self.api_secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        return signature

    @retry_on_failure(max_retries=3, backoff_factor=2.0)
    def _request(self, method: str, endpoint: str, **kwargs) -> Dict:
        """Effectuer une requête HTTP avec gestion d'erreurs"""
        self.rate_limiter.wait_if_needed()

        url = f"{self.base_url}{endpoint}"
        headers = self._get_auth_headers()

        # Ajouter signature si nécessaire
        body = json.dumps(kwargs.get('json', {})) if 'json' in kwargs else ''
        signature = self._sign_request(method, endpoint, body)
        if signature:
            headers['X-Signature'] = signature
            headers['X-Timestamp'] = str(int(time.time()))

        kwargs['headers'] = {**self.session.headers, **headers}
        kwargs['timeout'] = self.timeout

        start_time = time.time()
        try:
            response = self.session.request(method, url, **kwargs)
            duration = (time.time() - start_time) * 1000

            _logger.debug(
                f"API {method} {endpoint} - Status: {response.status_code} - "
                f"Duration: {duration:.2f}ms"
            )

            if response.status_code == 429:
                # Rate limit atteint côté serveur
                retry_after = int(response.headers.get('Retry-After', 60))
                _logger.warning(f"Rate limited by server, waiting {retry_after}s")
                time.sleep(retry_after)
                raise APIError("Rate limit exceeded", 429)

            if response.status_code >= 400:
                raise APIError(
                    f"API Error: {response.status_code}",
                    status_code=response.status_code,
                    response=response.json() if response.text else None
                )

            return response.json() if response.text else {}

        except requests.exceptions.Timeout:
            _logger.error(f"Timeout on {method} {endpoint}")
            raise APIError("Request timeout", 408)

        except requests.exceptions.ConnectionError:
            _logger.error(f"Connection error on {method} {endpoint}")
            raise APIError("Connection error", 503)

    def get(self, endpoint: str, params: Dict = None) -> Dict:
        """GET request"""
        return self._request('GET', endpoint, params=params)

    def post(self, endpoint: str, data: Dict = None) -> Dict:
        """POST request"""
        return self._request('POST', endpoint, json=data)

    def put(self, endpoint: str, data: Dict = None) -> Dict:
        """PUT request"""
        return self._request('PUT', endpoint, json=data)

    def patch(self, endpoint: str, data: Dict = None) -> Dict:
        """PATCH request"""
        return self._request('PATCH', endpoint, json=data)

    def delete(self, endpoint: str) -> Dict:
        """DELETE request"""
        return self._request('DELETE', endpoint)

    # === Méthodes métier spécifiques ===

    def get_bookings(self, updated_since: datetime = None,
                     status: str = None, limit: int = 100) -> List[Dict]:
        """Récupérer les réservations"""
        params = {'limit': limit}
        if updated_since:
            params['updated_since'] = updated_since.isoformat()
        if status:
            params['status'] = status

        response = self.get('/bookings', params)
        return response.get('data', [])

    def get_booking(self, booking_id: str) -> Dict:
        """Récupérer une réservation"""
        return self.get(f'/bookings/{booking_id}')

    def create_payment(self, booking_id: str, payment_data: Dict) -> Dict:
        """Créer un paiement"""
        return self.post(f'/bookings/{booking_id}/payments', payment_data)

    def get_rooms(self) -> List[Dict]:
        """Récupérer les chambres"""
        response = self.get('/rooms')
        return response.get('data', [])

    def update_availability(self, room_type_id: str, date: str, available: int) -> Dict:
        """Mettre à jour la disponibilité"""
        return self.put(f'/room-types/{room_type_id}/availability', {
            'date': date,
            'available': available,
        })
```

## 3. Controller Webhook

### Réception Sécurisée des Webhooks

```python
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

    @http.route('/api/v1/webhook/<int:config_id>',
                type='http', auth='public', methods=['POST'], csrf=False)
    def receive_webhook(self, config_id, **kwargs):
        """
        Endpoint principal pour recevoir les webhooks

        Workflow:
        1. Valider la signature HMAC
        2. Parser le payload
        3. Enregistrer dans la queue
        4. Retourner 200 immédiatement
        5. Traiter en background
        """
        start_time = datetime.now()

        try:
            # 1. Récupérer la configuration
            config = request.env['integration.config'].sudo().browse(config_id)
            if not config.exists() or not config.active:
                _logger.warning(f"Webhook received for invalid config: {config_id}")
                return request.make_json_response(
                    {'error': 'Configuration not found'},
                    status=404
                )

            # 2. Valider la signature
            signature = request.httprequest.headers.get('X-Webhook-Signature', '')
            timestamp = request.httprequest.headers.get('X-Webhook-Timestamp', '')
            raw_body = request.httprequest.data

            if not self._verify_signature(config, raw_body, signature, timestamp):
                _logger.warning(f"Invalid webhook signature for config {config_id}")
                self._log_webhook(config, 'signature_error', raw_body, None,
                                  'Invalid signature', start_time)
                return request.make_json_response(
                    {'error': 'Invalid signature'},
                    status=401
                )

            # 3. Parser le payload
            try:
                payload = json.loads(raw_body)
            except json.JSONDecodeError as e:
                _logger.error(f"Invalid JSON payload: {e}")
                self._log_webhook(config, 'parse_error', raw_body, None,
                                  str(e), start_time)
                return request.make_json_response(
                    {'error': 'Invalid JSON'},
                    status=400
                )

            # 4. Valider l'événement
            event_type = payload.get('event_type') or payload.get('event')
            if not event_type:
                _logger.warning("Webhook without event_type")
                return request.make_json_response(
                    {'error': 'Missing event_type'},
                    status=400
                )

            # 5. Créer un job dans la queue
            job = request.env['integration.webhook.job'].sudo().create({
                'config_id': config.id,
                'event_type': event_type,
                'payload': json.dumps(payload),
                'received_at': datetime.now(),
                'state': 'pending',
            })

            # 6. Log succès
            self._log_webhook(config, 'received', raw_body, payload,
                              f"Job created: {job.id}", start_time)

            # 7. Retourner 200 immédiatement
            return request.make_json_response({
                'status': 'accepted',
                'job_id': job.id,
            }, status=200)

        except Exception as e:
            _logger.exception(f"Webhook error: {e}")
            return request.make_json_response(
                {'error': 'Internal server error'},
                status=500
            )

    def _verify_signature(self, config, raw_body: bytes,
                          signature: str, timestamp: str) -> bool:
        """
        Vérifier la signature HMAC du webhook

        Format attendu: HMAC-SHA256(secret, timestamp + body)
        """
        if not config.webhook_secret:
            _logger.warning("No webhook secret configured")
            return True  # Pas de vérification si pas de secret

        if not signature or not timestamp:
            return False

        # Vérifier que le timestamp n'est pas trop vieux (replay attack)
        try:
            ts = int(timestamp)
            now = int(datetime.now().timestamp())
            if abs(now - ts) > 300:  # 5 minutes max
                _logger.warning(f"Webhook timestamp too old: {ts}")
                return False
        except ValueError:
            return False

        # Calculer la signature attendue
        message = timestamp.encode() + raw_body
        expected_signature = hmac.new(
            config.webhook_secret.encode(),
            message,
            hashlib.sha256
        ).hexdigest()

        # Comparaison sécurisée (timing-safe)
        return hmac.compare_digest(expected_signature, signature)

    def _log_webhook(self, config, status: str, raw_body: bytes,
                     payload: dict, message: str, start_time: datetime):
        """Enregistrer un log de webhook"""
        duration = (datetime.now() - start_time).total_seconds() * 1000

        try:
            request.env['integration.log'].sudo().create({
                'config_id': config.id,
                'operation': 'webhook_received',
                'direction': 'inbound',
                'status': 'success' if status == 'received' else 'error',
                'request_data': raw_body.decode('utf-8', errors='replace')[:10000],
                'response_data': json.dumps(payload)[:10000] if payload else None,
                'error_message': message if status != 'received' else None,
                'duration_ms': int(duration),
            })
        except Exception as e:
            _logger.error(f"Failed to log webhook: {e}")


class WebhookJobProcessor:
    """Processeur de jobs webhook"""

    def __init__(self, env):
        self.env = env

    def process_pending_jobs(self, limit: int = 100):
        """Traiter les jobs en attente"""
        jobs = self.env['integration.webhook.job'].search([
            ('state', '=', 'pending'),
        ], limit=limit, order='received_at ASC')

        for job in jobs:
            self._process_job(job)

    def _process_job(self, job):
        """Traiter un job individuel"""
        job.state = 'processing'
        job.started_at = datetime.now()

        try:
            payload = json.loads(job.payload)
            event_type = job.event_type

            # Router vers le bon handler
            handler_method = f'_handle_{event_type.replace(".", "_")}'
            if hasattr(self, handler_method):
                result = getattr(self, handler_method)(job.config_id, payload)
            else:
                result = self._handle_generic(job.config_id, event_type, payload)

            job.write({
                'state': 'completed',
                'completed_at': datetime.now(),
                'result': json.dumps(result),
            })

        except Exception as e:
            job.write({
                'state': 'failed',
                'completed_at': datetime.now(),
                'error_message': str(e),
                'retry_count': job.retry_count + 1,
            })

            # Retry si pas trop d'échecs
            if job.retry_count < 3:
                job.state = 'pending'

            _logger.exception(f"Job {job.id} failed: {e}")

    def _handle_booking_created(self, config, payload: dict) -> dict:
        """Handler pour booking.created"""
        mapper = self.env['integration.data.mapper']
        booking_data = payload.get('data', payload)

        # Créer ou mettre à jour le partenaire
        partner_vals = mapper.map_guest_to_partner(booking_data.get('guest', {}))
        partner = self.env['res.partner'].sudo()._find_or_create(partner_vals)

        # Créer la commande
        order_vals = mapper.map_booking_to_order(booking_data, partner.id)
        order = self.env['sale.order'].sudo().create(order_vals)

        return {'partner_id': partner.id, 'order_id': order.id}

    def _handle_booking_updated(self, config, payload: dict) -> dict:
        """Handler pour booking.updated"""
        booking_data = payload.get('data', payload)
        external_id = str(booking_data.get('id'))

        order = self.env['sale.order'].sudo().search([
            ('x_external_id', '=', external_id),
        ], limit=1)

        if not order:
            # Créer si n'existe pas
            return self._handle_booking_created(config, payload)

        # Mettre à jour
        mapper = self.env['integration.data.mapper']
        order_vals = mapper.map_booking_to_order(booking_data, order.partner_id.id)
        order.write(order_vals)

        return {'order_id': order.id, 'action': 'updated'}

    def _handle_booking_cancelled(self, config, payload: dict) -> dict:
        """Handler pour booking.cancelled"""
        booking_data = payload.get('data', payload)
        external_id = str(booking_data.get('id'))

        order = self.env['sale.order'].sudo().search([
            ('x_external_id', '=', external_id),
        ], limit=1)

        if order:
            order.action_cancel()
            return {'order_id': order.id, 'action': 'cancelled'}

        return {'action': 'not_found'}

    def _handle_payment_received(self, config, payload: dict) -> dict:
        """Handler pour payment.received"""
        payment_data = payload.get('data', payload)
        booking_id = str(payment_data.get('booking_id'))

        order = self.env['sale.order'].sudo().search([
            ('x_external_id', '=', booking_id),
        ], limit=1)

        if not order:
            _logger.warning(f"Order not found for payment: {booking_id}")
            return {'action': 'order_not_found'}

        # Créer le paiement
        mapper = self.env['integration.data.mapper']
        payment_vals = mapper.map_payment(payment_data, order)
        payment = self.env['account.payment'].sudo().create(payment_vals)

        return {'payment_id': payment.id, 'action': 'created'}

    def _handle_generic(self, config, event_type: str, payload: dict) -> dict:
        """Handler générique pour événements non gérés"""
        _logger.info(f"Unhandled event type: {event_type}")
        return {'event_type': event_type, 'action': 'logged'}
```

## 4. Data Mapper

### Transformation des Données

```python
from odoo import models, api, _
from odoo.exceptions import ValidationError
import re
import logging
from datetime import datetime, date

_logger = logging.getLogger(__name__)


class DataMapper(models.AbstractModel):
    _name = 'integration.data.mapper'
    _description = 'Data Mapper for External Integration'

    # === MAPPING CONFIGURATION ===

    COUNTRY_CODES = {
        'FR': 'France',
        'US': 'United States',
        'GB': 'United Kingdom',
        'DE': 'Germany',
        'ES': 'Spain',
        'IT': 'Italy',
        # ... ajouter selon besoins
    }

    STATUS_MAPPING = {
        'confirmed': 'sale',
        'provisional': 'draft',
        'pending': 'draft',
        'cancelled': 'cancel',
        'checked_in': 'sale',
        'checked_out': 'done',
        'no_show': 'cancel',
    }

    PAYMENT_METHOD_MAPPING = {
        'credit_card': 'credit_card',
        'debit_card': 'credit_card',
        'cash': 'cash',
        'bank_transfer': 'bank_transfer',
        'check': 'check',
        'paypal': 'online',
        'stripe': 'online',
    }

    # === PARTNER MAPPING ===

    @api.model
    def map_guest_to_partner(self, guest_data: dict) -> dict:
        """
        Mapper les données guest externe vers res.partner Odoo

        Args:
            guest_data: Données du client depuis l'API externe

        Returns:
            dict: Valeurs pour res.partner
        """
        if not guest_data:
            raise ValidationError(_("Guest data is required"))

        # Récupérer le pays
        country_code = guest_data.get('country') or guest_data.get('country_code', 'FR')
        country = self.env['res.country'].search([
            ('code', '=', country_code.upper())
        ], limit=1)

        # Nettoyer le téléphone
        phone = self._format_phone(guest_data.get('phone', ''), country_code)
        mobile = self._format_phone(guest_data.get('mobile', ''), country_code)

        # Construire les valeurs
        vals = {
            'name': self._build_name(guest_data),
            'email': self._validate_email(guest_data.get('email', '')),
            'phone': phone,
            'mobile': mobile or phone,  # Fallback sur phone si pas de mobile
            'street': guest_data.get('address', {}).get('street', ''),
            'street2': guest_data.get('address', {}).get('street2', ''),
            'city': guest_data.get('address', {}).get('city', ''),
            'zip': guest_data.get('address', {}).get('postal_code', ''),
            'country_id': country.id if country else False,
            'lang': self._map_language(guest_data.get('language', 'fr')),
            'is_company': False,
            'customer_rank': 1,

            # Champs personnalisés
            'x_external_guest_id': str(guest_data.get('id', '')),
            'x_date_of_birth': self._parse_date(guest_data.get('date_of_birth')),
            'x_document_type': guest_data.get('document_type', ''),
            'x_document_number': guest_data.get('document_number', ''),
            'x_nationality': guest_data.get('nationality', country_code),
            'x_vip_status': guest_data.get('vip_status', False),
            'x_loyalty_points': guest_data.get('loyalty_points', 0),
        }

        # Nettoyer les valeurs vides
        return {k: v for k, v in vals.items() if v not in [None, '', False] or k.startswith('x_')}

    @api.model
    def _find_or_create_partner(self, partner_vals: dict):
        """Trouver ou créer un partenaire"""
        Partner = self.env['res.partner'].sudo()

        # Rechercher par ID externe
        if partner_vals.get('x_external_guest_id'):
            partner = Partner.search([
                ('x_external_guest_id', '=', partner_vals['x_external_guest_id'])
            ], limit=1)
            if partner:
                partner.write(partner_vals)
                return partner

        # Rechercher par email
        if partner_vals.get('email'):
            partner = Partner.search([
                ('email', '=ilike', partner_vals['email'])
            ], limit=1)
            if partner:
                partner.write(partner_vals)
                return partner

        # Rechercher par téléphone
        if partner_vals.get('phone'):
            partner = Partner.search([
                '|',
                ('phone', '=', partner_vals['phone']),
                ('mobile', '=', partner_vals['phone']),
            ], limit=1)
            if partner:
                partner.write(partner_vals)
                return partner

        # Créer nouveau
        return Partner.create(partner_vals)

    # === BOOKING / ORDER MAPPING ===

    @api.model
    def map_booking_to_order(self, booking_data: dict, partner_id: int) -> dict:
        """
        Mapper une réservation externe vers sale.order Odoo

        Args:
            booking_data: Données de réservation depuis l'API externe
            partner_id: ID du partenaire Odoo

        Returns:
            dict: Valeurs pour sale.order
        """
        # Récupérer les dates
        check_in = self._parse_date(booking_data.get('check_in'))
        check_out = self._parse_date(booking_data.get('check_out'))

        # Calculer les nuits
        nights = 0
        if check_in and check_out:
            nights = (check_out - check_in).days

        # Statut
        external_status = booking_data.get('status', 'confirmed')
        odoo_state = self.STATUS_MAPPING.get(external_status, 'draft')

        vals = {
            'partner_id': partner_id,
            'date_order': self._parse_datetime(booking_data.get('created_at')) or datetime.now(),
            'client_order_ref': booking_data.get('booking_reference', ''),
            'note': booking_data.get('special_requests', ''),

            # Champs personnalisés
            'x_external_id': str(booking_data.get('id', '')),
            'x_external_reference': booking_data.get('booking_reference', ''),
            'x_check_in_date': check_in,
            'x_check_out_date': check_out,
            'x_number_of_nights': nights,
            'x_number_of_guests': booking_data.get('adults', 0) + booking_data.get('children', 0),
            'x_booking_channel': booking_data.get('channel', {}).get('source', 'direct'),
            'x_external_status': external_status,

            # Lignes de commande
            'order_line': self._map_booking_lines(booking_data),
        }

        return vals

    @api.model
    def _map_booking_lines(self, booking_data: dict) -> list:
        """Mapper les lignes de réservation"""
        lines = []

        # Chambres
        for room in booking_data.get('rooms', []):
            product = self._get_or_create_room_product(room)
            nights = booking_data.get('nights', 1)

            lines.append((0, 0, {
                'product_id': product.id,
                'name': f"{room.get('room_type_name', 'Chambre')} - {nights} nuit(s)",
                'product_uom_qty': room.get('quantity', 1) * nights,
                'price_unit': room.get('price_per_night', 0),
                'x_room_number': room.get('room_number', ''),
                'x_rate_plan': room.get('rate_plan_name', ''),
                'x_adults': room.get('adults', 0),
                'x_children': room.get('children', 0),
            }))

        # Services/Extras
        for extra in booking_data.get('extras', []):
            product = self._get_or_create_service_product(extra)

            lines.append((0, 0, {
                'product_id': product.id,
                'name': extra.get('name', 'Service'),
                'product_uom_qty': extra.get('quantity', 1),
                'price_unit': extra.get('price_per_unit', 0),
            }))

        return lines

    @api.model
    def _get_or_create_room_product(self, room_data: dict):
        """Trouver ou créer un produit chambre"""
        Product = self.env['product.product'].sudo()

        room_type_id = str(room_data.get('room_type_id', ''))
        room_type_name = room_data.get('room_type_name', 'Chambre')

        # Rechercher par ID externe
        product = Product.search([
            ('x_external_room_type_id', '=', room_type_id)
        ], limit=1)

        if product:
            return product

        # Rechercher par nom
        product = Product.search([
            ('name', '=ilike', room_type_name),
            ('x_is_room', '=', True),
        ], limit=1)

        if product:
            product.x_external_room_type_id = room_type_id
            return product

        # Créer le produit
        category = self.env.ref('integration_module.product_category_rooms', raise_if_not_found=False)

        return Product.create({
            'name': room_type_name,
            'type': 'service',
            'list_price': room_data.get('price_per_night', 100),
            'categ_id': category.id if category else 1,
            'x_is_room': True,
            'x_external_room_type_id': room_type_id,
            'x_max_occupancy': room_data.get('max_occupancy', 2),
        })

    @api.model
    def _get_or_create_service_product(self, service_data: dict):
        """Trouver ou créer un produit service"""
        Product = self.env['product.product'].sudo()

        service_name = service_data.get('name', 'Service')

        product = Product.search([
            ('name', '=ilike', service_name),
            ('type', '=', 'service'),
        ], limit=1)

        if product:
            return product

        category = self.env.ref('integration_module.product_category_services', raise_if_not_found=False)

        return Product.create({
            'name': service_name,
            'type': 'service',
            'list_price': service_data.get('price_per_unit', 0),
            'categ_id': category.id if category else 1,
        })

    # === PAYMENT MAPPING ===

    @api.model
    def map_payment(self, payment_data: dict, order) -> dict:
        """Mapper un paiement externe vers account.payment Odoo"""
        # Trouver le journal
        payment_method = payment_data.get('payment_method', 'credit_card')
        journal = self._get_payment_journal(payment_method)

        return {
            'partner_id': order.partner_id.id,
            'amount': payment_data.get('amount', 0),
            'payment_type': 'inbound',
            'partner_type': 'customer',
            'journal_id': journal.id,
            'ref': f"{order.name} - {payment_data.get('transaction_id', '')}",
            'x_external_transaction_id': payment_data.get('transaction_id', ''),
            'x_payment_gateway': payment_data.get('gateway', ''),
        }

    @api.model
    def _get_payment_journal(self, payment_method: str):
        """Trouver le journal de paiement approprié"""
        Journal = self.env['account.journal'].sudo()

        method_type = self.PAYMENT_METHOD_MAPPING.get(payment_method, 'bank')

        if method_type == 'cash':
            journal = Journal.search([('type', '=', 'cash')], limit=1)
        else:
            journal = Journal.search([('type', '=', 'bank')], limit=1)

        if not journal:
            raise ValidationError(_("No payment journal found"))

        return journal

    # === UTILITAIRES ===

    def _build_name(self, guest_data: dict) -> str:
        """Construire le nom complet"""
        first_name = guest_data.get('first_name', '').strip()
        last_name = guest_data.get('last_name', '').strip()

        if first_name and last_name:
            return f"{first_name} {last_name}"
        return first_name or last_name or 'Unknown Guest'

    def _validate_email(self, email: str) -> str:
        """Valider et nettoyer l'email"""
        if not email:
            return ''

        email = email.strip().lower()
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

        if re.match(pattern, email):
            return email

        _logger.warning(f"Invalid email format: {email}")
        return ''

    def _format_phone(self, phone: str, country_code: str = 'FR') -> str:
        """Formater le numéro de téléphone"""
        if not phone:
            return ''

        # Nettoyer
        phone = re.sub(r'[^\d+]', '', phone)

        # Ajouter le préfixe si nécessaire
        if phone and not phone.startswith('+'):
            prefixes = {
                'FR': '+33',
                'US': '+1',
                'GB': '+44',
                'DE': '+49',
            }
            prefix = prefixes.get(country_code.upper(), '+33')
            if phone.startswith('0'):
                phone = prefix + phone[1:]
            else:
                phone = prefix + phone

        return phone

    def _map_language(self, lang_code: str) -> str:
        """Mapper le code langue vers Odoo"""
        mapping = {
            'fr': 'fr_FR',
            'en': 'en_US',
            'es': 'es_ES',
            'de': 'de_DE',
            'it': 'it_IT',
        }
        lang_code = (lang_code or 'fr').lower()[:2]
        odoo_lang = mapping.get(lang_code, 'en_US')

        # Vérifier que la langue existe
        if self.env['res.lang'].search([('code', '=', odoo_lang), ('active', '=', True)]):
            return odoo_lang
        return 'en_US'

    def _parse_date(self, date_str) -> date:
        """Parser une date depuis différents formats"""
        if not date_str:
            return None

        if isinstance(date_str, date):
            return date_str

        formats = ['%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y', '%Y/%m/%d']

        for fmt in formats:
            try:
                return datetime.strptime(str(date_str)[:10], fmt).date()
            except ValueError:
                continue

        _logger.warning(f"Could not parse date: {date_str}")
        return None

    def _parse_datetime(self, dt_str) -> datetime:
        """Parser une datetime depuis différents formats"""
        if not dt_str:
            return None

        if isinstance(dt_str, datetime):
            return dt_str

        formats = [
            '%Y-%m-%dT%H:%M:%S.%fZ',
            '%Y-%m-%dT%H:%M:%SZ',
            '%Y-%m-%dT%H:%M:%S',
            '%Y-%m-%d %H:%M:%S',
        ]

        for fmt in formats:
            try:
                return datetime.strptime(str(dt_str), fmt)
            except ValueError:
                continue

        _logger.warning(f"Could not parse datetime: {dt_str}")
        return None
```

## 5. Synchronisation Bidirectionnelle

### Service de Synchronisation

```python
from odoo import models, api, fields, _
from odoo.exceptions import UserError
import logging
from datetime import datetime, timedelta

_logger = logging.getLogger(__name__)


class SyncOrchestrator(models.Model):
    _name = 'integration.sync.orchestrator'
    _description = 'Sync Orchestrator'

    @api.model
    def sync_all(self, config_id: int, full_sync: bool = False):
        """
        Synchronisation complète bidirectionnelle

        Args:
            config_id: ID de la configuration
            full_sync: Si True, sync tout depuis le début
        """
        config = self.env['integration.config'].browse(config_id)
        if not config.exists() or not config.active:
            raise UserError(_("Configuration not found or inactive"))

        job = self.env['integration.sync.job'].create({
            'config_id': config_id,
            'job_type': 'full_sync' if full_sync else 'delta_sync',
            'state': 'running',
            'start_date': datetime.now(),
        })

        try:
            # 1. Import depuis système externe
            self._sync_inbound(config, job, full_sync)

            # 2. Export vers système externe
            self._sync_outbound(config, job)

            job.write({
                'state': 'completed',
                'end_date': datetime.now(),
            })

        except Exception as e:
            job.write({
                'state': 'failed',
                'end_date': datetime.now(),
                'error_details': str(e),
            })
            _logger.exception(f"Sync failed: {e}")
            raise

        return job

    def _sync_inbound(self, config, job, full_sync: bool):
        """Synchronisation entrante (externe → Odoo)"""
        api_client = self._get_api_client(config)
        mapper = self.env['integration.data.mapper']

        # Déterminer la date de début
        if full_sync:
            updated_since = None
        else:
            updated_since = config.last_sync_date or (datetime.now() - timedelta(days=30))

        # Récupérer les réservations
        bookings = api_client.get_bookings(updated_since=updated_since)
        job.total_records = len(bookings)

        for booking in bookings:
            try:
                self._process_booking(booking, mapper)
                job.success_records += 1
            except Exception as e:
                job.error_records += 1
                _logger.error(f"Failed to process booking {booking.get('id')}: {e}")

            job.processed_records += 1

        # Mettre à jour la date de dernière sync
        config.last_sync_date = datetime.now()

    def _sync_outbound(self, config, job):
        """Synchronisation sortante (Odoo → externe)"""
        api_client = self._get_api_client(config)

        # Trouver les paiements à synchroniser
        payments = self.env['account.payment'].search([
            ('x_external_synced', '=', False),
            ('state', '=', 'posted'),
            ('x_related_booking_id', '!=', False),
        ])

        for payment in payments:
            try:
                booking_id = payment.x_related_booking_id
                api_client.create_payment(booking_id, {
                    'amount': payment.amount,
                    'payment_method': 'bank_transfer',
                    'transaction_id': payment.name,
                    'paid_at': payment.date.isoformat(),
                })
                payment.x_external_synced = True
            except Exception as e:
                _logger.error(f"Failed to sync payment {payment.id}: {e}")

    def _process_booking(self, booking_data: dict, mapper):
        """Traiter une réservation individuelle"""
        external_id = str(booking_data.get('id'))

        # Chercher si existe déjà
        order = self.env['sale.order'].search([
            ('x_external_id', '=', external_id)
        ], limit=1)

        # Créer/Mettre à jour le partenaire
        partner_vals = mapper.map_guest_to_partner(booking_data.get('guest', {}))
        partner = mapper._find_or_create_partner(partner_vals)

        # Mapper la commande
        order_vals = mapper.map_booking_to_order(booking_data, partner.id)

        if order:
            # Mise à jour
            # Retirer order_line pour éviter les conflits
            order_vals.pop('order_line', None)
            order.write(order_vals)
        else:
            # Création
            order = self.env['sale.order'].create(order_vals)

        return order

    def _get_api_client(self, config):
        """Obtenir le client API configuré"""
        from .api_client import ExternalAPIClient

        return ExternalAPIClient(
            base_url=config.api_url,
            api_key=config.api_key,
            api_secret=config.api_secret,
        )

    # === CRON JOBS ===

    @api.model
    def cron_sync_bookings(self):
        """Job planifié pour synchronisation"""
        configs = self.env['integration.config'].search([
            ('active', '=', True),
            ('auto_sync_enabled', '=', True),
        ])

        for config in configs:
            try:
                self.sync_all(config.id, full_sync=False)
            except Exception as e:
                _logger.error(f"Cron sync failed for config {config.id}: {e}")

    @api.model
    def cron_retry_failed_jobs(self):
        """Réessayer les jobs échoués"""
        failed_jobs = self.env['integration.webhook.job'].search([
            ('state', '=', 'failed'),
            ('retry_count', '<', 3),
            ('completed_at', '>', datetime.now() - timedelta(hours=24)),
        ])

        processor = WebhookJobProcessor(self.env)
        for job in failed_jobs:
            job.state = 'pending'
            processor._process_job(job)
```

## 6. Gestion des Conflits

### Stratégies de Résolution

```python
class ConflictResolver:
    """Résolution des conflits de synchronisation"""

    STRATEGY_EXTERNAL_WINS = 'external_wins'
    STRATEGY_ODOO_WINS = 'odoo_wins'
    STRATEGY_LATEST_WINS = 'latest_wins'
    STRATEGY_MANUAL = 'manual'

    def __init__(self, env, strategy: str = None):
        self.env = env
        self.strategy = strategy or self.STRATEGY_EXTERNAL_WINS

    def resolve(self, odoo_record, external_data: dict, field_mapping: dict) -> dict:
        """
        Résoudre les conflits entre données Odoo et externes

        Returns:
            dict: Valeurs finales à appliquer
        """
        if self.strategy == self.STRATEGY_EXTERNAL_WINS:
            return self._external_wins(external_data, field_mapping)

        elif self.strategy == self.STRATEGY_ODOO_WINS:
            return self._odoo_wins(odoo_record, external_data, field_mapping)

        elif self.strategy == self.STRATEGY_LATEST_WINS:
            return self._latest_wins(odoo_record, external_data, field_mapping)

        elif self.strategy == self.STRATEGY_MANUAL:
            return self._create_conflict_record(odoo_record, external_data)

        return external_data

    def _external_wins(self, external_data: dict, field_mapping: dict) -> dict:
        """Les données externes l'emportent toujours"""
        return external_data

    def _odoo_wins(self, odoo_record, external_data: dict, field_mapping: dict) -> dict:
        """Les données Odoo l'emportent sauf si vides"""
        result = {}
        for ext_field, odoo_field in field_mapping.items():
            odoo_value = getattr(odoo_record, odoo_field, None)
            ext_value = external_data.get(ext_field)

            if odoo_value:
                result[odoo_field] = odoo_value
            else:
                result[odoo_field] = ext_value

        return result

    def _latest_wins(self, odoo_record, external_data: dict, field_mapping: dict) -> dict:
        """La modification la plus récente l'emporte"""
        odoo_write_date = odoo_record.write_date
        ext_updated_at = external_data.get('updated_at')

        if ext_updated_at:
            from datetime import datetime
            ext_date = datetime.fromisoformat(ext_updated_at.replace('Z', '+00:00'))
            if ext_date > odoo_write_date:
                return external_data

        # Garder les valeurs Odoo
        return {}

    def _create_conflict_record(self, odoo_record, external_data: dict) -> dict:
        """Créer un enregistrement de conflit pour résolution manuelle"""
        self.env['integration.conflict'].create({
            'model': odoo_record._name,
            'record_id': odoo_record.id,
            'external_data': json.dumps(external_data),
            'odoo_data': json.dumps(odoo_record.read()[0]),
            'state': 'pending',
        })
        return {}  # Ne pas appliquer de changements
```

## 7. Official Odoo JSON-RPC 2.0 API (External Access)

> **Nouveau** (Septembre 2025) - API officielle pour accéder à Odoo depuis des systèmes externes

### 7.1 Architecture JSON-RPC 2.0

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Système Externe (Python, JS, etc.)               │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          Odoo Server                                 │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  /jsonrpc/2.0/common  →  Authentication & Server Info       │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │  /jsonrpc/2.0/object  →  Model Operations (CRUD)            │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │  /jsonrpc/2.0/db      →  Database Operations (admin)        │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.2 Authentication

```python
import json
import requests

class OdooJSONRPC:
    """Client JSON-RPC 2.0 officiel pour Odoo"""

    def __init__(self, url: str, db: str, username: str, password: str):
        self.url = url.rstrip('/')
        self.db = db
        self.username = username
        self.password = password
        self.uid = None
        self._request_id = 0

    def _jsonrpc(self, service: str, method: str, params: list) -> dict:
        """Effectuer un appel JSON-RPC 2.0"""
        self._request_id += 1

        payload = {
            "jsonrpc": "2.0",
            "method": "call",
            "params": {
                "service": service,
                "method": method,
                "args": params
            },
            "id": self._request_id
        }

        headers = {"Content-Type": "application/json"}
        response = requests.post(
            f"{self.url}/jsonrpc",
            data=json.dumps(payload),
            headers=headers,
            timeout=30
        )
        response.raise_for_status()

        result = response.json()

        if result.get("error"):
            error = result["error"]
            raise Exception(f"Odoo Error: {error.get('message', error)}")

        return result.get("result")

    def authenticate(self) -> int:
        """
        Authentifier l'utilisateur et obtenir l'UID

        Returns:
            int: User ID (uid) pour les appels suivants
        """
        self.uid = self._jsonrpc("common", "authenticate", [
            self.db,
            self.username,
            self.password,
            {}  # user_agent_env (optionnel)
        ])

        if not self.uid:
            raise Exception("Authentication failed")

        return self.uid

    def version(self) -> dict:
        """Obtenir les informations du serveur"""
        return self._jsonrpc("common", "version", [])

    def execute_kw(self, model: str, method: str,
                   args: list = None, kwargs: dict = None) -> any:
        """
        Exécuter une méthode sur un modèle Odoo

        Args:
            model: Nom du modèle (ex: 'res.partner')
            method: Nom de la méthode (ex: 'search_read')
            args: Arguments positionnels
            kwargs: Arguments nommés

        Returns:
            Résultat de la méthode
        """
        if self.uid is None:
            self.authenticate()

        return self._jsonrpc("object", "execute_kw", [
            self.db,
            self.uid,
            self.password,
            model,
            method,
            args or [],
            kwargs or {}
        ])
```

### 7.3 Opérations CRUD

```python
# === CONNEXION ===
odoo = OdooJSONRPC(
    url="https://mycompany.odoo.com",
    db="mydb",
    username="admin",
    password="admin"
)
odoo.authenticate()

# === SEARCH ===
# Rechercher les IDs correspondant au domaine
partner_ids = odoo.execute_kw(
    'res.partner',
    'search',
    [[['is_company', '=', True], ['country_id.code', '=', 'FR']]],
    {'limit': 10, 'offset': 0, 'order': 'name ASC'}
)
# Résultat: [1, 5, 12, 23, ...]

# === SEARCH_READ (recommandé) ===
# Rechercher et lire en une seule requête
partners = odoo.execute_kw(
    'res.partner',
    'search_read',
    [[['is_company', '=', True]]],
    {
        'fields': ['name', 'email', 'phone', 'city'],
        'limit': 10,
        'order': 'name ASC'
    }
)
# Résultat: [{'id': 1, 'name': 'ACME Corp', 'email': '...', ...}, ...]

# === READ ===
# Lire des enregistrements par IDs
partner_data = odoo.execute_kw(
    'res.partner',
    'read',
    [[1, 2, 3]],  # IDs à lire
    {'fields': ['name', 'email', 'phone']}
)

# === CREATE ===
new_partner_id = odoo.execute_kw(
    'res.partner',
    'create',
    [{
        'name': 'Nouveau Client',
        'email': 'contact@nouveau.com',
        'phone': '+33123456789',
        'is_company': True,
        'country_id': 75,  # France
    }]
)
# Résultat: 42 (ID du nouveau partenaire)

# === WRITE (UPDATE) ===
success = odoo.execute_kw(
    'res.partner',
    'write',
    [
        [42],  # IDs à modifier
        {'phone': '+33987654321', 'city': 'Paris'}
    ]
)
# Résultat: True

# === UNLINK (DELETE) ===
success = odoo.execute_kw(
    'res.partner',
    'unlink',
    [[42, 43]]  # IDs à supprimer
)
# Résultat: True

# === SEARCH_COUNT ===
count = odoo.execute_kw(
    'res.partner',
    'search_count',
    [[['is_company', '=', True]]]
)
# Résultat: 156
```

### 7.4 Domaines de Recherche

```python
# === OPÉRATEURS DE COMPARAISON ===
# =, !=, >, <, >=, <=, =like, like, ilike, =ilike, in, not in

# Égalité
[['state', '=', 'done']]

# Différent
[['state', '!=', 'cancel']]

# Supérieur/Inférieur
[['amount', '>', 1000], ['date', '>=', '2025-01-01']]

# Like (pattern matching)
[['name', 'like', 'Acme%']]      # Commence par Acme
[['email', 'ilike', '%@gmail.com']]  # Insensible à la casse

# In (liste de valeurs)
[['state', 'in', ['draft', 'sent', 'sale']]]

# Not in
[['country_id.code', 'not in', ['US', 'GB', 'DE']]]

# === OPÉRATEURS LOGIQUES ===
# & (AND - implicite), | (OR), ! (NOT)

# AND (implicite entre conditions)
[['state', '=', 'sale'], ['amount_total', '>', 1000]]

# OR explicite
['|', ['state', '=', 'draft'], ['state', '=', 'sent']]

# NOT
['!', ['state', '=', 'cancel']]

# Combinaison complexe
# (state = 'sale' OR state = 'done') AND amount > 500
['|', ['state', '=', 'sale'], ['state', '=', 'done'], ['amount_total', '>', 500]]

# === CHAMPS RELATIONNELS (dot notation) ===
[['partner_id.country_id.code', '=', 'FR']]
[['order_line.product_id.categ_id.name', 'ilike', 'Service']]
```

### 7.5 Lecture de Champs Relationnels

```python
# === ONE2MANY / MANY2MANY ===
# Par défaut, retourne les IDs
orders = odoo.execute_kw(
    'sale.order',
    'search_read',
    [[]],
    {'fields': ['name', 'order_line'], 'limit': 1}
)
# Résultat: [{'id': 1, 'name': 'SO001', 'order_line': [1, 2, 3]}]

# Pour avoir les détails, lire les lignes séparément
line_ids = orders[0]['order_line']
lines = odoo.execute_kw(
    'sale.order.line',
    'read',
    [line_ids],
    {'fields': ['product_id', 'name', 'product_uom_qty', 'price_unit']}
)

# === MANY2ONE ===
# Par défaut: [id, display_name]
partners = odoo.execute_kw(
    'res.partner',
    'search_read',
    [[]],
    {'fields': ['name', 'country_id'], 'limit': 1}
)
# Résultat: [{'id': 1, 'name': 'ACME', 'country_id': [75, 'France']}]

# Pour plus de détails sur le related
country_id = partners[0]['country_id'][0]
country = odoo.execute_kw(
    'res.country',
    'read',
    [[country_id]],
    {'fields': ['name', 'code', 'currency_id']}
)
```

### 7.6 Méthodes Métier

```python
# === Confirmer une commande ===
odoo.execute_kw('sale.order', 'action_confirm', [[order_id]])

# === Créer une facture depuis commande ===
invoice_ids = odoo.execute_kw(
    'sale.order',
    '_create_invoices',
    [[order_id]]
)

# === Valider une facture ===
odoo.execute_kw('account.move', 'action_post', [[invoice_id]])

# === Méthodes personnalisées ===
# Si vous avez défini une méthode dans votre module:
# def my_custom_method(self, param1, param2):
#     ...
result = odoo.execute_kw(
    'my.model',
    'my_custom_method',
    [[record_ids], param1, param2]
)
```

### 7.7 Gestion des Erreurs

```python
from requests.exceptions import RequestException, Timeout

class OdooAPIError(Exception):
    """Erreur API Odoo"""
    def __init__(self, message: str, code: int = None, data: dict = None):
        self.message = message
        self.code = code
        self.data = data
        super().__init__(self.message)


def safe_execute_kw(odoo, model: str, method: str,
                     args: list = None, kwargs: dict = None):
    """Exécution avec gestion d'erreurs robuste"""
    try:
        return odoo.execute_kw(model, method, args, kwargs)

    except Timeout:
        raise OdooAPIError("Request timeout", code=408)

    except RequestException as e:
        raise OdooAPIError(f"Connection error: {e}", code=503)

    except Exception as e:
        error_msg = str(e)

        # Erreurs Odoo communes
        if "AccessDenied" in error_msg:
            raise OdooAPIError("Access denied - check credentials", code=401)

        if "AccessError" in error_msg:
            raise OdooAPIError("Permission denied for this operation", code=403)

        if "MissingError" in error_msg:
            raise OdooAPIError("Record not found", code=404)

        if "ValidationError" in error_msg:
            raise OdooAPIError(f"Validation failed: {error_msg}", code=400)

        raise OdooAPIError(error_msg, code=500)


# === EXEMPLE D'UTILISATION ===
try:
    partners = safe_execute_kw(
        odoo,
        'res.partner',
        'search_read',
        [[['id', '=', 99999]]],  # ID inexistant
        {'fields': ['name']}
    )
except OdooAPIError as e:
    print(f"Error {e.code}: {e.message}")
```

### 7.8 Client JavaScript (Node.js)

```javascript
const axios = require('axios');

class OdooJSONRPC {
    constructor(url, db, username, password) {
        this.url = url.replace(/\/$/, '');
        this.db = db;
        this.username = username;
        this.password = password;
        this.uid = null;
        this.requestId = 0;
    }

    async _jsonrpc(service, method, params) {
        this.requestId++;

        const payload = {
            jsonrpc: "2.0",
            method: "call",
            params: { service, method, args: params },
            id: this.requestId
        };

        const response = await axios.post(
            `${this.url}/jsonrpc`,
            payload,
            { headers: { "Content-Type": "application/json" } }
        );

        if (response.data.error) {
            throw new Error(response.data.error.message);
        }

        return response.data.result;
    }

    async authenticate() {
        this.uid = await this._jsonrpc("common", "authenticate", [
            this.db, this.username, this.password, {}
        ]);
        if (!this.uid) throw new Error("Authentication failed");
        return this.uid;
    }

    async execute_kw(model, method, args = [], kwargs = {}) {
        if (!this.uid) await this.authenticate();

        return this._jsonrpc("object", "execute_kw", [
            this.db, this.uid, this.password,
            model, method, args, kwargs
        ]);
    }
}

// === UTILISATION ===
async function main() {
    const odoo = new OdooJSONRPC(
        'https://mycompany.odoo.com',
        'mydb',
        'admin',
        'admin'
    );

    await odoo.authenticate();

    const partners = await odoo.execute_kw(
        'res.partner',
        'search_read',
        [[['is_company', '=', true]]],
        { fields: ['name', 'email'], limit: 10 }
    );

    console.log(partners);
}

main().catch(console.error);
```

### 7.9 Bonnes Pratiques API

```python
# === 1. Limiter les champs ===
# MAL: Charge TOUS les champs
partners = odoo.execute_kw('res.partner', 'search_read', [[]])

# BIEN: Seulement les champs nécessaires
partners = odoo.execute_kw(
    'res.partner', 'search_read', [[]],
    {'fields': ['name', 'email', 'phone']}
)

# === 2. Paginer les résultats ===
page_size = 100
offset = 0

while True:
    batch = odoo.execute_kw(
        'res.partner', 'search_read', [[]],
        {'fields': ['name'], 'limit': page_size, 'offset': offset}
    )
    if not batch:
        break

    for partner in batch:
        process(partner)

    offset += page_size

# === 3. Utiliser search_count avant de paginer ===
total = odoo.execute_kw('res.partner', 'search_count', [[]])
print(f"Total records: {total}, pages: {(total // page_size) + 1}")

# === 4. Batch writes ===
# MAL: Écriture un par un
for partner_id in partner_ids:
    odoo.execute_kw('res.partner', 'write', [[partner_id], {'active': False}])

# BIEN: Écriture batch
odoo.execute_kw('res.partner', 'write', [partner_ids, {'active': False}])

# === 5. Connexion réutilisable ===
# Créer une instance globale ou poolée
# Ne pas ré-authentifier à chaque appel

# === 6. Timeout approprié ===
# Pour les opérations longues, augmenter le timeout
# Ou utiliser des jobs asynchrones côté Odoo
```

---

Ce guide couvre les aspects essentiels de l'intégration API avec Odoo v19. Les patterns présentés peuvent être adaptés pour tout type d'intégration externe (PMS, CRM, ERP, etc.).
