# Odoo Integration Expert Agent

## Role
Expert Odoo pour les intégrations système, APIs REST/JSON-RPC, webhooks, connecteurs tiers, synchronisation de données et orchestration des flux.

## Expertise Domains
- Odoo External API (XML-RPC, JSON-RPC)
- REST API Development
- Webhooks (entrantes et sortantes)
- Connecteurs tiers (Stripe, Shopify, WooCommerce, Zapier)
- Data Mapping & Transformation
- Sync Orchestration & Queue Management
- Error Handling & Retry Logic

---

## 1. Odoo External API

### XML-RPC Client

```python
# external_scripts/odoo_xmlrpc_client.py
import xmlrpc.client
from functools import wraps
import logging

_logger = logging.getLogger(__name__)


class OdooXMLRPCClient:
    """Client XML-RPC pour Odoo"""

    def __init__(self, url, db, username, password):
        self.url = url
        self.db = db
        self.username = username
        self.password = password
        self.uid = None
        self._connect()

    def _connect(self):
        """Authentification"""
        common = xmlrpc.client.ServerProxy(
            f'{self.url}/xmlrpc/2/common'
        )
        self.uid = common.authenticate(
            self.db, self.username, self.password, {}
        )
        if not self.uid:
            raise Exception("Authentication failed")

        self.models = xmlrpc.client.ServerProxy(
            f'{self.url}/xmlrpc/2/object'
        )

    def execute(self, model, method, *args, **kwargs):
        """Exécute une méthode sur un modèle"""
        return self.models.execute_kw(
            self.db, self.uid, self.password,
            model, method, args, kwargs
        )

    def search(self, model, domain, **kwargs):
        """Recherche d'enregistrements"""
        return self.execute(model, 'search', domain, **kwargs)

    def read(self, model, ids, fields=None):
        """Lecture d'enregistrements"""
        return self.execute(model, 'read', ids, fields or [])

    def search_read(self, model, domain, fields=None, **kwargs):
        """Recherche et lecture combinées"""
        return self.execute(
            model, 'search_read',
            domain,
            fields=fields or [],
            **kwargs
        )

    def create(self, model, vals):
        """Création d'enregistrement"""
        return self.execute(model, 'create', vals)

    def write(self, model, ids, vals):
        """Mise à jour d'enregistrements"""
        return self.execute(model, 'write', ids, vals)

    def unlink(self, model, ids):
        """Suppression d'enregistrements"""
        return self.execute(model, 'unlink', ids)


# Usage
if __name__ == '__main__':
    client = OdooXMLRPCClient(
        url='https://mycompany.odoo.com',
        db='mycompany',
        username='admin',
        password='admin_password',
    )

    # Lire les partenaires
    partners = client.search_read(
        'res.partner',
        [('is_company', '=', True)],
        fields=['name', 'email', 'phone'],
        limit=10,
    )
    print(partners)

    # Créer un partenaire
    new_partner_id = client.create('res.partner', {
        'name': 'New Company',
        'email': 'contact@newcompany.com',
        'is_company': True,
    })
```

### JSON-RPC Client

```python
# external_scripts/odoo_jsonrpc_client.py
import requests
import json


class OdooJSONRPCClient:
    """Client JSON-RPC pour Odoo"""

    def __init__(self, url, db, username, password):
        self.url = url
        self.db = db
        self.username = username
        self.password = password
        self.uid = None
        self.session = requests.Session()
        self._authenticate()

    def _call(self, service, method, args):
        """Appel JSON-RPC"""
        payload = {
            'jsonrpc': '2.0',
            'method': 'call',
            'params': {
                'service': service,
                'method': method,
                'args': args,
            },
            'id': 1,
        }

        response = self.session.post(
            f'{self.url}/jsonrpc',
            json=payload,
            headers={'Content-Type': 'application/json'},
        )
        result = response.json()

        if 'error' in result:
            raise Exception(result['error'])

        return result.get('result')

    def _authenticate(self):
        """Authentification"""
        self.uid = self._call('common', 'authenticate', [
            self.db, self.username, self.password, {}
        ])
        if not self.uid:
            raise Exception("Authentication failed")

    def execute(self, model, method, *args, **kwargs):
        """Exécute une méthode sur un modèle"""
        return self._call('object', 'execute_kw', [
            self.db, self.uid, self.password,
            model, method, args, kwargs
        ])

    def search_read(self, model, domain, fields=None, **kwargs):
        return self.execute(
            model, 'search_read',
            domain,
            fields=fields or [],
            **kwargs
        )

    def create(self, model, vals):
        return self.execute(model, 'create', vals)

    def write(self, model, ids, vals):
        return self.execute(model, 'write', ids, vals)
```

---

## 2. REST API Development

### Contrôleur REST Complet

```python
# controllers/api_controller.py
from odoo import http
from odoo.http import request, Response
import json
import logging
from functools import wraps
import hmac
import hashlib
import time

_logger = logging.getLogger(__name__)


def api_response(data=None, status=200, error=None):
    """Helper pour formater les réponses API"""
    response_data = {
        'success': error is None,
        'timestamp': time.time(),
    }

    if data is not None:
        response_data['data'] = data
    if error:
        response_data['error'] = error

    return Response(
        json.dumps(response_data),
        status=status,
        content_type='application/json',
    )


def require_api_key(func):
    """Décorateur pour authentification API Key"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        api_key = request.httprequest.headers.get('X-API-Key')

        if not api_key:
            return api_response(
                error='API key required',
                status=401,
            )

        # Valider la clé API
        key_record = request.env['api.key'].sudo().search([
            ('key', '=', api_key),
            ('active', '=', True),
        ], limit=1)

        if not key_record:
            return api_response(
                error='Invalid API key',
                status=401,
            )

        # Vérifier les permissions
        if not key_record.check_rate_limit():
            return api_response(
                error='Rate limit exceeded',
                status=429,
            )

        # Ajouter le user au contexte
        request.update_env(user=key_record.user_id.id)

        return func(*args, **kwargs)

    return wrapper


def validate_signature(func):
    """Décorateur pour valider les signatures webhook"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        signature = request.httprequest.headers.get('X-Signature')
        timestamp = request.httprequest.headers.get('X-Timestamp')

        if not signature or not timestamp:
            return api_response(
                error='Missing signature',
                status=401,
            )

        # Vérifier le timestamp (anti-replay)
        if abs(time.time() - float(timestamp)) > 300:  # 5 minutes
            return api_response(
                error='Request expired',
                status=401,
            )

        # Calculer et vérifier la signature
        secret = request.env['ir.config_parameter'].sudo().get_param(
            'api.webhook_secret'
        )
        body = request.httprequest.get_data()
        expected = hmac.new(
            secret.encode(),
            f"{timestamp}{body.decode()}".encode(),
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(signature, expected):
            return api_response(
                error='Invalid signature',
                status=401,
            )

        return func(*args, **kwargs)

    return wrapper


class RestAPIController(http.Controller):
    """Contrôleur REST API"""

    # ============ PRODUCTS ============

    @http.route(
        '/api/v1/products',
        type='http',
        auth='none',
        methods=['GET'],
        csrf=False,
    )
    @require_api_key
    def get_products(self, **kwargs):
        """Liste des produits"""
        try:
            domain = []

            # Filtres
            if kwargs.get('category_id'):
                domain.append(
                    ('categ_id', '=', int(kwargs['category_id']))
                )
            if kwargs.get('active') is not None:
                domain.append(
                    ('active', '=', kwargs['active'] == 'true')
                )
            if kwargs.get('search'):
                domain.append(
                    ('name', 'ilike', kwargs['search'])
                )

            # Pagination
            limit = min(int(kwargs.get('limit', 50)), 100)
            offset = int(kwargs.get('offset', 0))

            products = request.env['product.product'].search(
                domain,
                limit=limit,
                offset=offset,
            )

            data = [{
                'id': p.id,
                'name': p.name,
                'default_code': p.default_code,
                'barcode': p.barcode,
                'list_price': p.list_price,
                'qty_available': p.qty_available,
                'category': {
                    'id': p.categ_id.id,
                    'name': p.categ_id.name,
                } if p.categ_id else None,
            } for p in products]

            return api_response(data={
                'products': data,
                'total': request.env['product.product'].search_count(domain),
                'limit': limit,
                'offset': offset,
            })

        except Exception as e:
            _logger.exception("Error getting products")
            return api_response(error=str(e), status=500)

    @http.route(
        '/api/v1/products/<int:product_id>',
        type='http',
        auth='none',
        methods=['GET'],
        csrf=False,
    )
    @require_api_key
    def get_product(self, product_id, **kwargs):
        """Détail d'un produit"""
        product = request.env['product.product'].browse(product_id)

        if not product.exists():
            return api_response(
                error='Product not found',
                status=404,
            )

        return api_response(data={
            'id': product.id,
            'name': product.name,
            'default_code': product.default_code,
            'barcode': product.barcode,
            'list_price': product.list_price,
            'standard_price': product.standard_price,
            'qty_available': product.qty_available,
            'virtual_available': product.virtual_available,
            'description': product.description,
            'category': {
                'id': product.categ_id.id,
                'name': product.categ_id.name,
            } if product.categ_id else None,
            'attributes': [{
                'name': line.attribute_id.name,
                'value': line.product_template_value_ids[0].name,
            } for line in product.product_template_attribute_value_ids],
        })

    @http.route(
        '/api/v1/products',
        type='json',
        auth='none',
        methods=['POST'],
        csrf=False,
    )
    @require_api_key
    def create_product(self, **kwargs):
        """Création d'un produit"""
        try:
            data = request.jsonrequest

            # Validation
            if not data.get('name'):
                return {'error': 'Name is required'}

            vals = {
                'name': data['name'],
                'default_code': data.get('default_code'),
                'barcode': data.get('barcode'),
                'list_price': data.get('list_price', 0),
                'standard_price': data.get('standard_price', 0),
                'type': data.get('type', 'consu'),
            }

            if data.get('category_id'):
                vals['categ_id'] = data['category_id']

            product = request.env['product.product'].create(vals)

            return {
                'success': True,
                'id': product.id,
            }

        except Exception as e:
            _logger.exception("Error creating product")
            return {'error': str(e)}

    @http.route(
        '/api/v1/products/<int:product_id>',
        type='json',
        auth='none',
        methods=['PUT'],
        csrf=False,
    )
    @require_api_key
    def update_product(self, product_id, **kwargs):
        """Mise à jour d'un produit"""
        product = request.env['product.product'].browse(product_id)

        if not product.exists():
            return {'error': 'Product not found'}

        data = request.jsonrequest
        vals = {}

        # Mise à jour sélective
        updatable_fields = [
            'name', 'default_code', 'barcode', 'list_price',
            'standard_price', 'description',
        ]

        for field in updatable_fields:
            if field in data:
                vals[field] = data[field]

        product.write(vals)

        return {'success': True, 'id': product.id}

    # ============ ORDERS ============

    @http.route(
        '/api/v1/orders',
        type='json',
        auth='none',
        methods=['POST'],
        csrf=False,
    )
    @require_api_key
    def create_order(self, **kwargs):
        """Création d'une commande"""
        data = request.jsonrequest

        # Validation
        if not data.get('partner_id'):
            return {'error': 'partner_id is required'}
        if not data.get('lines'):
            return {'error': 'Order lines are required'}

        # Préparer les lignes
        order_lines = []
        for line in data['lines']:
            product = request.env['product.product'].browse(
                line['product_id']
            )
            if not product.exists():
                return {
                    'error': f"Product {line['product_id']} not found"
                }

            order_lines.append((0, 0, {
                'product_id': product.id,
                'product_uom_qty': line.get('quantity', 1),
                'price_unit': line.get('price_unit', product.list_price),
            }))

        # Créer la commande
        order = request.env['sale.order'].create({
            'partner_id': data['partner_id'],
            'client_order_ref': data.get('external_ref'),
            'order_line': order_lines,
        })

        # Confirmer si demandé
        if data.get('confirm', False):
            order.action_confirm()

        return {
            'success': True,
            'id': order.id,
            'name': order.name,
        }

    # ============ CUSTOMERS ============

    @http.route(
        '/api/v1/customers',
        type='http',
        auth='none',
        methods=['GET'],
        csrf=False,
    )
    @require_api_key
    def get_customers(self, **kwargs):
        """Liste des clients"""
        domain = [('customer_rank', '>', 0)]

        if kwargs.get('search'):
            domain.append('|')
            domain.append(('name', 'ilike', kwargs['search']))
            domain.append(('email', 'ilike', kwargs['search']))

        limit = min(int(kwargs.get('limit', 50)), 100)
        offset = int(kwargs.get('offset', 0))

        partners = request.env['res.partner'].search(
            domain,
            limit=limit,
            offset=offset,
        )

        data = [{
            'id': p.id,
            'name': p.name,
            'email': p.email,
            'phone': p.phone,
            'city': p.city,
            'country': p.country_id.name if p.country_id else None,
        } for p in partners]

        return api_response(data={
            'customers': data,
            'total': request.env['res.partner'].search_count(domain),
        })

    @http.route(
        '/api/v1/customers',
        type='json',
        auth='none',
        methods=['POST'],
        csrf=False,
    )
    @require_api_key
    def create_customer(self, **kwargs):
        """Création d'un client"""
        data = request.jsonrequest

        if not data.get('name'):
            return {'error': 'Name is required'}

        # Vérifier email unique
        if data.get('email'):
            existing = request.env['res.partner'].search([
                ('email', '=', data['email']),
            ], limit=1)
            if existing:
                return {
                    'error': 'Email already exists',
                    'existing_id': existing.id,
                }

        partner = request.env['res.partner'].create({
            'name': data['name'],
            'email': data.get('email'),
            'phone': data.get('phone'),
            'street': data.get('street'),
            'city': data.get('city'),
            'zip': data.get('zip'),
            'country_id': data.get('country_id'),
            'customer_rank': 1,
        })

        return {
            'success': True,
            'id': partner.id,
        }
```

### Modèle API Key

```python
# models/api_key.py
import secrets
from datetime import datetime, timedelta


class APIKey(models.Model):
    _name = 'api.key'
    _description = 'API Key'

    name = fields.Char(string='Name', required=True)
    key = fields.Char(
        string='API Key',
        readonly=True,
        copy=False,
    )
    user_id = fields.Many2one(
        'res.users',
        string='User',
        required=True,
        help='User whose permissions will be used',
    )
    active = fields.Boolean(default=True)

    # Permissions
    allowed_models = fields.Char(
        string='Allowed Models',
        help='Comma-separated list of models (empty = all)',
    )
    read_only = fields.Boolean(
        string='Read Only',
        default=False,
    )

    # Rate Limiting
    rate_limit = fields.Integer(
        string='Rate Limit (requests/hour)',
        default=1000,
    )
    requests_count = fields.Integer(
        string='Requests Count',
        default=0,
    )
    requests_reset = fields.Datetime(
        string='Reset Time',
    )

    # Audit
    last_used = fields.Datetime(string='Last Used')
    created_date = fields.Datetime(
        string='Created',
        default=fields.Datetime.now,
    )
    expires_date = fields.Datetime(string='Expires')

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not vals.get('key'):
                vals['key'] = secrets.token_urlsafe(32)
        return super().create(vals_list)

    def check_rate_limit(self):
        """Vérifie et met à jour le rate limit"""
        self.ensure_one()
        now = datetime.now()

        # Reset si nécessaire
        if not self.requests_reset or self.requests_reset < now:
            self.write({
                'requests_count': 1,
                'requests_reset': now + timedelta(hours=1),
                'last_used': now,
            })
            return True

        # Vérifier la limite
        if self.requests_count >= self.rate_limit:
            return False

        # Incrémenter
        self.write({
            'requests_count': self.requests_count + 1,
            'last_used': now,
        })
        return True

    def regenerate_key(self):
        """Régénère la clé API"""
        self.key = secrets.token_urlsafe(32)
```

---

## 3. Webhooks

### Webhooks Sortants (Odoo → Externe)

```python
# models/webhook_outgoing.py
import requests
import json
import hmac
import hashlib
import time
from datetime import datetime
import logging

_logger = logging.getLogger(__name__)


class WebhookOutgoing(models.Model):
    _name = 'webhook.outgoing'
    _description = 'Outgoing Webhook'
    _order = 'sequence'

    name = fields.Char(string='Name', required=True)
    sequence = fields.Integer(default=10)
    active = fields.Boolean(default=True)

    # Configuration
    url = fields.Char(string='Webhook URL', required=True)
    secret = fields.Char(string='Secret Key')

    # Déclencheur
    model_id = fields.Many2one(
        'ir.model',
        string='Model',
        required=True,
        ondelete='cascade',
    )
    trigger_on_create = fields.Boolean(string='On Create', default=True)
    trigger_on_write = fields.Boolean(string='On Update', default=True)
    trigger_on_unlink = fields.Boolean(string='On Delete', default=False)

    # Filtres
    domain = fields.Char(
        string='Filter Domain',
        default='[]',
        help='Odoo domain to filter records',
    )
    field_ids = fields.Many2many(
        'ir.model.fields',
        string='Fields to Send',
        domain="[('model_id', '=', model_id)]",
    )

    # Options
    send_full_record = fields.Boolean(
        string='Send Full Record',
        default=True,
    )
    send_changed_fields = fields.Boolean(
        string='Include Changed Fields',
        default=True,
    )
    async_mode = fields.Boolean(
        string='Async Mode',
        default=True,
        help='Send via queue for better performance',
    )

    # Stats
    success_count = fields.Integer(string='Success Count')
    failure_count = fields.Integer(string='Failure Count')
    last_triggered = fields.Datetime(string='Last Triggered')

    # Logs
    log_ids = fields.One2many(
        'webhook.outgoing.log',
        'webhook_id',
        string='Logs',
    )

    def trigger(self, records, event, changed_fields=None):
        """Déclenche le webhook"""
        self.ensure_one()

        # Filtrer selon le domaine
        if self.domain and self.domain != '[]':
            domain = eval(self.domain)
            records = records.filtered_domain(domain)

        if not records:
            return

        # Préparer le payload
        payload = self._prepare_payload(records, event, changed_fields)

        if self.async_mode:
            # Envoyer via queue
            self.env['webhook.queue'].create({
                'webhook_id': self.id,
                'payload': json.dumps(payload),
            })
        else:
            # Envoyer directement
            self._send(payload)

        self.last_triggered = fields.Datetime.now()

    def _prepare_payload(self, records, event, changed_fields):
        """Prépare le payload du webhook"""
        # Champs à inclure
        if self.field_ids:
            fields_list = self.field_ids.mapped('name')
        else:
            fields_list = None  # Tous les champs

        data = []
        for record in records:
            if self.send_full_record:
                record_data = record.read(fields_list)[0]
            else:
                record_data = {'id': record.id}

            data.append(record_data)

        payload = {
            'event': event,
            'model': self.model_id.model,
            'timestamp': datetime.utcnow().isoformat(),
            'data': data if len(data) > 1 else data[0],
        }

        if self.send_changed_fields and changed_fields:
            payload['changed_fields'] = changed_fields

        return payload

    def _send(self, payload):
        """Envoie le webhook"""
        timestamp = str(int(time.time()))
        body = json.dumps(payload)

        headers = {
            'Content-Type': 'application/json',
            'X-Timestamp': timestamp,
            'X-Webhook-Event': payload['event'],
        }

        # Signature
        if self.secret:
            signature = hmac.new(
                self.secret.encode(),
                f"{timestamp}{body}".encode(),
                hashlib.sha256,
            ).hexdigest()
            headers['X-Signature'] = signature

        try:
            response = requests.post(
                self.url,
                data=body,
                headers=headers,
                timeout=30,
            )
            response.raise_for_status()

            self._log_success(payload, response)
            self.success_count += 1

        except Exception as e:
            self._log_failure(payload, str(e))
            self.failure_count += 1
            raise

    def _log_success(self, payload, response):
        """Log un succès"""
        self.env['webhook.outgoing.log'].create({
            'webhook_id': self.id,
            'status': 'success',
            'request_body': json.dumps(payload)[:5000],
            'response_code': response.status_code,
            'response_body': response.text[:5000],
        })

    def _log_failure(self, payload, error):
        """Log un échec"""
        self.env['webhook.outgoing.log'].create({
            'webhook_id': self.id,
            'status': 'failure',
            'request_body': json.dumps(payload)[:5000],
            'error_message': error,
        })


class WebhookOutgoingLog(models.Model):
    _name = 'webhook.outgoing.log'
    _description = 'Webhook Log'
    _order = 'create_date desc'

    webhook_id = fields.Many2one(
        'webhook.outgoing',
        required=True,
        ondelete='cascade',
    )
    status = fields.Selection([
        ('success', 'Success'),
        ('failure', 'Failure'),
    ], string='Status')
    request_body = fields.Text(string='Request Body')
    response_code = fields.Integer(string='Response Code')
    response_body = fields.Text(string='Response Body')
    error_message = fields.Text(string='Error')
    create_date = fields.Datetime(string='Date')


class WebhookQueue(models.Model):
    _name = 'webhook.queue'
    _description = 'Webhook Queue'
    _order = 'create_date'

    webhook_id = fields.Many2one(
        'webhook.outgoing',
        required=True,
        ondelete='cascade',
    )
    payload = fields.Text(string='Payload')
    retry_count = fields.Integer(default=0)
    state = fields.Selection([
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('done', 'Done'),
        ('failed', 'Failed'),
    ], default='pending')
    error_message = fields.Text(string='Error')

    @api.model
    def _cron_process_queue(self):
        """Traite la queue de webhooks"""
        items = self.search([
            ('state', '=', 'pending'),
            ('retry_count', '<', 3),
        ], limit=100)

        for item in items:
            item.state = 'processing'
            try:
                payload = json.loads(item.payload)
                item.webhook_id._send(payload)
                item.state = 'done'
            except Exception as e:
                item.retry_count += 1
                item.error_message = str(e)
                if item.retry_count >= 3:
                    item.state = 'failed'
                else:
                    item.state = 'pending'


# Mixin pour déclencher les webhooks automatiquement
class WebhookTriggerMixin(models.AbstractModel):
    _name = 'webhook.trigger.mixin'
    _description = 'Webhook Trigger Mixin'

    def _get_webhooks(self, event):
        """Récupère les webhooks applicables"""
        model = self.env['ir.model'].search([
            ('model', '=', self._name)
        ], limit=1)

        if not model:
            return self.env['webhook.outgoing']

        domain = [
            ('model_id', '=', model.id),
            ('active', '=', True),
        ]

        if event == 'create':
            domain.append(('trigger_on_create', '=', True))
        elif event == 'write':
            domain.append(('trigger_on_write', '=', True))
        elif event == 'unlink':
            domain.append(('trigger_on_unlink', '=', True))

        return self.env['webhook.outgoing'].search(domain)

    @api.model_create_multi
    def create(self, vals_list):
        records = super().create(vals_list)

        for webhook in self._get_webhooks('create'):
            try:
                webhook.trigger(records, 'create')
            except Exception as e:
                _logger.error(f"Webhook error: {e}")

        return records

    def write(self, vals):
        result = super().write(vals)

        for webhook in self._get_webhooks('write'):
            try:
                webhook.trigger(self, 'write', list(vals.keys()))
            except Exception as e:
                _logger.error(f"Webhook error: {e}")

        return result

    def unlink(self):
        for webhook in self._get_webhooks('unlink'):
            try:
                webhook.trigger(self, 'unlink')
            except Exception as e:
                _logger.error(f"Webhook error: {e}")

        return super().unlink()
```

### Webhooks Entrants (Externe → Odoo)

```python
# controllers/webhook_incoming.py
class WebhookIncomingController(http.Controller):

    @http.route(
        '/webhook/stripe',
        type='json',
        auth='public',
        methods=['POST'],
        csrf=False,
    )
    def webhook_stripe(self, **kwargs):
        """Webhook Stripe"""
        import stripe

        payload = request.httprequest.get_data()
        sig_header = request.httprequest.headers.get('Stripe-Signature')

        webhook_secret = request.env['ir.config_parameter'].sudo().get_param(
            'stripe.webhook_secret'
        )

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        except stripe.error.SignatureVerificationError:
            return {'error': 'Invalid signature'}

        # Traiter l'événement
        handler = StripeWebhookHandler(request.env)
        handler.handle(event)

        return {'success': True}

    @http.route(
        '/webhook/shopify',
        type='json',
        auth='public',
        methods=['POST'],
        csrf=False,
    )
    def webhook_shopify(self, **kwargs):
        """Webhook Shopify"""
        # Vérifier HMAC
        hmac_header = request.httprequest.headers.get('X-Shopify-Hmac-Sha256')
        topic = request.httprequest.headers.get('X-Shopify-Topic')

        secret = request.env['ir.config_parameter'].sudo().get_param(
            'shopify.webhook_secret'
        )

        body = request.httprequest.get_data()
        computed_hmac = hmac.new(
            secret.encode(),
            body,
            hashlib.sha256,
        ).digest()

        import base64
        if not hmac.compare_digest(
            base64.b64encode(computed_hmac).decode(),
            hmac_header
        ):
            return {'error': 'Invalid signature'}

        # Traiter selon le topic
        data = request.jsonrequest
        handler = ShopifyWebhookHandler(request.env)

        if topic == 'orders/create':
            handler.handle_order_create(data)
        elif topic == 'orders/updated':
            handler.handle_order_update(data)
        elif topic == 'products/create':
            handler.handle_product_create(data)

        return {'success': True}
```

---

## 4. Connecteurs Tiers

### Stripe Connector

```python
# models/stripe_connector.py
import stripe
from odoo import models, fields, api
from odoo.exceptions import UserError


class StripeConnector(models.Model):
    _name = 'stripe.connector'
    _description = 'Stripe Connector'

    name = fields.Char(default='Stripe')
    active = fields.Boolean(default=True)

    # Configuration
    api_key = fields.Char(string='Secret Key')
    publishable_key = fields.Char(string='Publishable Key')
    webhook_secret = fields.Char(string='Webhook Secret')
    test_mode = fields.Boolean(string='Test Mode', default=True)

    # Mapping
    product_mapping_ids = fields.One2many(
        'stripe.product.mapping',
        'connector_id',
        string='Product Mappings',
    )

    def _get_stripe(self):
        """Retourne le client Stripe configuré"""
        stripe.api_key = self.api_key
        return stripe

    def sync_products_to_stripe(self):
        """Synchronise les produits vers Stripe"""
        self.ensure_one()
        s = self._get_stripe()

        products = self.env['product.product'].search([
            ('sale_ok', '=', True),
            ('type', '=', 'service'),
        ])

        for product in products:
            mapping = self.product_mapping_ids.filtered(
                lambda m: m.product_id == product
            )

            if mapping:
                # Update
                s.Product.modify(
                    mapping.stripe_product_id,
                    name=product.name,
                    description=product.description_sale or '',
                )

                # Update price
                s.Price.create(
                    product=mapping.stripe_product_id,
                    unit_amount=int(product.list_price * 100),
                    currency=product.currency_id.name.lower(),
                )
            else:
                # Create
                stripe_product = s.Product.create(
                    name=product.name,
                    description=product.description_sale or '',
                )

                stripe_price = s.Price.create(
                    product=stripe_product.id,
                    unit_amount=int(product.list_price * 100),
                    currency=product.currency_id.name.lower(),
                )

                self.env['stripe.product.mapping'].create({
                    'connector_id': self.id,
                    'product_id': product.id,
                    'stripe_product_id': stripe_product.id,
                    'stripe_price_id': stripe_price.id,
                })

    def create_checkout_session(self, order):
        """Crée une session de paiement Stripe"""
        self.ensure_one()
        s = self._get_stripe()

        line_items = []
        for line in order.order_line:
            mapping = self.product_mapping_ids.filtered(
                lambda m: m.product_id == line.product_id
            )

            if mapping:
                line_items.append({
                    'price': mapping.stripe_price_id,
                    'quantity': int(line.product_uom_qty),
                })
            else:
                # Prix dynamique
                line_items.append({
                    'price_data': {
                        'currency': order.currency_id.name.lower(),
                        'product_data': {
                            'name': line.name,
                        },
                        'unit_amount': int(line.price_unit * 100),
                    },
                    'quantity': int(line.product_uom_qty),
                })

        session = s.checkout.Session.create(
            line_items=line_items,
            mode='payment',
            success_url=f"{self._get_base_url()}/shop/confirmation",
            cancel_url=f"{self._get_base_url()}/shop/cart",
            metadata={
                'odoo_order_id': order.id,
                'odoo_order_name': order.name,
            },
        )

        return session

    def _get_base_url(self):
        return self.env['ir.config_parameter'].sudo().get_param('web.base.url')


class StripeProductMapping(models.Model):
    _name = 'stripe.product.mapping'
    _description = 'Stripe Product Mapping'

    connector_id = fields.Many2one(
        'stripe.connector',
        required=True,
        ondelete='cascade',
    )
    product_id = fields.Many2one(
        'product.product',
        required=True,
    )
    stripe_product_id = fields.Char(string='Stripe Product ID')
    stripe_price_id = fields.Char(string='Stripe Price ID')


class StripeWebhookHandler:
    """Handler pour les webhooks Stripe"""

    def __init__(self, env):
        self.env = env

    def handle(self, event):
        event_type = event['type']
        data = event['data']['object']

        handlers = {
            'checkout.session.completed': self._handle_checkout_completed,
            'payment_intent.succeeded': self._handle_payment_succeeded,
            'payment_intent.payment_failed': self._handle_payment_failed,
            'invoice.paid': self._handle_invoice_paid,
            'customer.subscription.created': self._handle_subscription_created,
            'customer.subscription.deleted': self._handle_subscription_deleted,
        }

        handler = handlers.get(event_type)
        if handler:
            handler(data)

    def _handle_checkout_completed(self, data):
        """Traite une session de checkout complétée"""
        order_id = data.get('metadata', {}).get('odoo_order_id')

        if order_id:
            order = self.env['sale.order'].browse(int(order_id))
            if order.exists():
                order.action_confirm()

                # Créer le paiement
                self.env['account.payment'].create({
                    'partner_id': order.partner_id.id,
                    'amount': data['amount_total'] / 100,
                    'payment_type': 'inbound',
                    'ref': data['payment_intent'],
                })

    def _handle_payment_succeeded(self, data):
        """Traite un paiement réussi"""
        pass

    def _handle_payment_failed(self, data):
        """Traite un paiement échoué"""
        pass
```

### Shopify Connector

```python
# models/shopify_connector.py
import requests
from datetime import datetime


class ShopifyConnector(models.Model):
    _name = 'shopify.connector'
    _description = 'Shopify Connector'

    name = fields.Char(string='Store Name', required=True)
    active = fields.Boolean(default=True)

    # Configuration
    shop_url = fields.Char(
        string='Shop URL',
        required=True,
        help='yourstore.myshopify.com',
    )
    api_key = fields.Char(string='API Key')
    api_secret = fields.Char(string='API Secret')
    access_token = fields.Char(string='Access Token')
    api_version = fields.Char(
        string='API Version',
        default='2024-01',
    )

    # Sync settings
    sync_products = fields.Boolean(
        string='Sync Products',
        default=True,
    )
    sync_orders = fields.Boolean(
        string='Sync Orders',
        default=True,
    )
    sync_customers = fields.Boolean(
        string='Sync Customers',
        default=True,
    )
    sync_inventory = fields.Boolean(
        string='Sync Inventory',
        default=True,
    )

    # Mappings
    product_mapping_ids = fields.One2many(
        'shopify.product.mapping',
        'connector_id',
        string='Product Mappings',
    )
    customer_mapping_ids = fields.One2many(
        'shopify.customer.mapping',
        'connector_id',
        string='Customer Mappings',
    )

    # Stats
    last_sync_date = fields.Datetime(string='Last Sync')
    orders_synced = fields.Integer(string='Orders Synced')
    products_synced = fields.Integer(string='Products Synced')

    def _api_call(self, endpoint, method='GET', data=None):
        """Effectue un appel API Shopify"""
        url = f"https://{self.shop_url}/admin/api/{self.api_version}/{endpoint}"

        headers = {
            'X-Shopify-Access-Token': self.access_token,
            'Content-Type': 'application/json',
        }

        response = requests.request(
            method,
            url,
            headers=headers,
            json=data,
            timeout=30,
        )
        response.raise_for_status()

        return response.json()

    def sync_products_from_shopify(self):
        """Importe les produits depuis Shopify"""
        self.ensure_one()

        result = self._api_call('products.json')

        for shopify_product in result.get('products', []):
            self._process_shopify_product(shopify_product)

        self.last_sync_date = fields.Datetime.now()

    def _process_shopify_product(self, data):
        """Traite un produit Shopify"""
        # Chercher mapping existant
        mapping = self.product_mapping_ids.filtered(
            lambda m: m.shopify_id == str(data['id'])
        )

        vals = {
            'name': data['title'],
            'description_sale': data.get('body_html', ''),
            'default_code': data.get('variants', [{}])[0].get('sku'),
            'list_price': float(data.get('variants', [{}])[0].get('price', 0)),
            'barcode': data.get('variants', [{}])[0].get('barcode'),
        }

        if mapping:
            # Update
            mapping.product_id.write(vals)
        else:
            # Create
            product = self.env['product.product'].create(vals)

            self.env['shopify.product.mapping'].create({
                'connector_id': self.id,
                'product_id': product.id,
                'shopify_id': str(data['id']),
                'shopify_variant_id': str(data['variants'][0]['id']),
            })

    def sync_orders_from_shopify(self, since=None):
        """Importe les commandes depuis Shopify"""
        self.ensure_one()

        params = 'status=any'
        if since:
            params += f"&created_at_min={since.isoformat()}"

        result = self._api_call(f'orders.json?{params}')

        for shopify_order in result.get('orders', []):
            self._process_shopify_order(shopify_order)

    def _process_shopify_order(self, data):
        """Traite une commande Shopify"""
        # Vérifier si déjà importée
        existing = self.env['sale.order'].search([
            ('shopify_order_id', '=', str(data['id'])),
        ], limit=1)

        if existing:
            return existing

        # Trouver ou créer le client
        partner = self._get_or_create_partner(data.get('customer', {}))

        # Créer les lignes
        order_lines = []
        for item in data.get('line_items', []):
            product_mapping = self.product_mapping_ids.filtered(
                lambda m: m.shopify_variant_id == str(item['variant_id'])
            )

            if product_mapping:
                product = product_mapping.product_id
            else:
                # Créer un produit générique
                product = self.env['product.product'].create({
                    'name': item['title'],
                    'list_price': float(item['price']),
                })

            order_lines.append((0, 0, {
                'product_id': product.id,
                'product_uom_qty': item['quantity'],
                'price_unit': float(item['price']),
            }))

        # Créer la commande
        order = self.env['sale.order'].create({
            'partner_id': partner.id,
            'shopify_order_id': str(data['id']),
            'shopify_order_name': data['name'],
            'client_order_ref': data['name'],
            'order_line': order_lines,
        })

        # Confirmer si payée
        if data.get('financial_status') == 'paid':
            order.action_confirm()

        return order

    def _get_or_create_partner(self, customer_data):
        """Trouve ou crée un partenaire"""
        if not customer_data:
            return self.env.ref('base.public_partner')

        email = customer_data.get('email')
        if email:
            partner = self.env['res.partner'].search([
                ('email', '=', email)
            ], limit=1)
            if partner:
                return partner

        return self.env['res.partner'].create({
            'name': f"{customer_data.get('first_name', '')} {customer_data.get('last_name', '')}".strip() or 'Shopify Customer',
            'email': email,
            'phone': customer_data.get('phone'),
        })

    def push_inventory_to_shopify(self, products=None):
        """Met à jour le stock sur Shopify"""
        self.ensure_one()

        if products is None:
            mappings = self.product_mapping_ids
        else:
            mappings = self.product_mapping_ids.filtered(
                lambda m: m.product_id in products
            )

        for mapping in mappings:
            if mapping.shopify_inventory_item_id:
                # Obtenir la location
                locations = self._api_call('locations.json')
                location_id = locations['locations'][0]['id']

                self._api_call(
                    'inventory_levels/set.json',
                    method='POST',
                    data={
                        'location_id': location_id,
                        'inventory_item_id': int(mapping.shopify_inventory_item_id),
                        'available': int(mapping.product_id.qty_available),
                    },
                )


class ShopifyProductMapping(models.Model):
    _name = 'shopify.product.mapping'
    _description = 'Shopify Product Mapping'

    connector_id = fields.Many2one(
        'shopify.connector',
        required=True,
        ondelete='cascade',
    )
    product_id = fields.Many2one(
        'product.product',
        required=True,
    )
    shopify_id = fields.Char(string='Shopify Product ID')
    shopify_variant_id = fields.Char(string='Shopify Variant ID')
    shopify_inventory_item_id = fields.Char(string='Inventory Item ID')


class ShopifyWebhookHandler:
    """Handler pour les webhooks Shopify"""

    def __init__(self, env):
        self.env = env

    def handle_order_create(self, data):
        """Nouvelle commande Shopify"""
        connector = self.env['shopify.connector'].search([
            ('active', '=', True),
        ], limit=1)

        if connector:
            connector._process_shopify_order(data)

    def handle_order_update(self, data):
        """Mise à jour commande Shopify"""
        order = self.env['sale.order'].search([
            ('shopify_order_id', '=', str(data['id'])),
        ], limit=1)

        if order and data.get('cancelled_at'):
            order.action_cancel()

    def handle_product_create(self, data):
        """Nouveau produit Shopify"""
        connector = self.env['shopify.connector'].search([
            ('active', '=', True),
        ], limit=1)

        if connector and connector.sync_products:
            connector._process_shopify_product(data)
```

---

## 5. Data Sync Orchestrator

### Orchestrateur de Synchronisation

```python
# models/sync_orchestrator.py
from datetime import datetime, timedelta
import logging

_logger = logging.getLogger(__name__)


class SyncOrchestrator(models.Model):
    _name = 'sync.orchestrator'
    _description = 'Data Sync Orchestrator'

    name = fields.Char(string='Name', required=True)
    active = fields.Boolean(default=True)

    # Configuration
    sync_type = fields.Selection([
        ('full', 'Full Sync'),
        ('incremental', 'Incremental Sync'),
        ('bidirectional', 'Bidirectional'),
    ], string='Sync Type', default='incremental')

    source_system = fields.Selection([
        ('odoo', 'Odoo'),
        ('shopify', 'Shopify'),
        ('woocommerce', 'WooCommerce'),
        ('external_api', 'External API'),
        ('csv', 'CSV Import'),
    ], string='Source System', required=True)

    target_system = fields.Selection([
        ('odoo', 'Odoo'),
        ('shopify', 'Shopify'),
        ('woocommerce', 'WooCommerce'),
        ('external_api', 'External API'),
    ], string='Target System', required=True)

    # Modèles à synchroniser
    sync_model = fields.Selection([
        ('product', 'Products'),
        ('customer', 'Customers'),
        ('order', 'Orders'),
        ('inventory', 'Inventory'),
        ('price', 'Prices'),
    ], string='Data Type', required=True)

    # Planification
    schedule_type = fields.Selection([
        ('manual', 'Manual'),
        ('interval', 'Interval'),
        ('cron', 'Scheduled'),
    ], string='Schedule', default='manual')

    interval_number = fields.Integer(
        string='Interval',
        default=15,
    )
    interval_type = fields.Selection([
        ('minutes', 'Minutes'),
        ('hours', 'Hours'),
        ('days', 'Days'),
    ], string='Interval Type', default='minutes')

    cron_id = fields.Many2one(
        'ir.cron',
        string='Scheduled Action',
    )

    # Mapping
    field_mapping_ids = fields.One2many(
        'sync.field.mapping',
        'orchestrator_id',
        string='Field Mappings',
    )

    # Conflict Resolution
    conflict_resolution = fields.Selection([
        ('source_wins', 'Source Wins'),
        ('target_wins', 'Target Wins'),
        ('newest_wins', 'Newest Wins'),
        ('manual', 'Manual Resolution'),
    ], string='Conflict Resolution', default='source_wins')

    # Stats
    last_sync_date = fields.Datetime(string='Last Sync')
    last_sync_status = fields.Selection([
        ('success', 'Success'),
        ('partial', 'Partial Success'),
        ('failed', 'Failed'),
    ], string='Last Status')
    records_synced = fields.Integer(string='Records Synced')
    records_failed = fields.Integer(string='Records Failed')

    # Logs
    log_ids = fields.One2many(
        'sync.log',
        'orchestrator_id',
        string='Sync Logs',
    )

    def action_sync(self):
        """Lance la synchronisation"""
        self.ensure_one()

        log = self.env['sync.log'].create({
            'orchestrator_id': self.id,
            'started_at': fields.Datetime.now(),
            'status': 'running',
        })

        try:
            if self.sync_type == 'full':
                result = self._full_sync()
            elif self.sync_type == 'incremental':
                result = self._incremental_sync()
            else:
                result = self._bidirectional_sync()

            log.write({
                'ended_at': fields.Datetime.now(),
                'status': 'success' if result['failed'] == 0 else 'partial',
                'records_synced': result['synced'],
                'records_failed': result['failed'],
            })

            self.write({
                'last_sync_date': fields.Datetime.now(),
                'last_sync_status': log.status,
                'records_synced': result['synced'],
                'records_failed': result['failed'],
            })

        except Exception as e:
            _logger.exception("Sync error")
            log.write({
                'ended_at': fields.Datetime.now(),
                'status': 'failed',
                'error_message': str(e),
            })
            self.last_sync_status = 'failed'

    def _full_sync(self):
        """Synchronisation complète"""
        synced = 0
        failed = 0

        # Récupérer les données source
        source_data = self._fetch_source_data()

        for record in source_data:
            try:
                self._sync_record(record)
                synced += 1
            except Exception as e:
                _logger.error(f"Sync error for record: {e}")
                failed += 1

        return {'synced': synced, 'failed': failed}

    def _incremental_sync(self):
        """Synchronisation incrémentale"""
        synced = 0
        failed = 0

        # Récupérer uniquement les changements depuis la dernière sync
        since = self.last_sync_date or datetime.now() - timedelta(days=30)
        source_data = self._fetch_source_data(since=since)

        for record in source_data:
            try:
                self._sync_record(record)
                synced += 1
            except Exception as e:
                _logger.error(f"Sync error: {e}")
                failed += 1

        return {'synced': synced, 'failed': failed}

    def _bidirectional_sync(self):
        """Synchronisation bidirectionnelle"""
        # Sync source -> target
        result1 = self._incremental_sync()

        # Inverser et sync target -> source
        self.source_system, self.target_system = self.target_system, self.source_system
        result2 = self._incremental_sync()
        self.source_system, self.target_system = self.target_system, self.source_system

        return {
            'synced': result1['synced'] + result2['synced'],
            'failed': result1['failed'] + result2['failed'],
        }

    def _fetch_source_data(self, since=None):
        """Récupère les données de la source"""
        if self.source_system == 'odoo':
            return self._fetch_odoo_data(since)
        elif self.source_system == 'shopify':
            return self._fetch_shopify_data(since)
        elif self.source_system == 'external_api':
            return self._fetch_api_data(since)
        return []

    def _fetch_odoo_data(self, since=None):
        """Récupère les données Odoo"""
        model_mapping = {
            'product': 'product.product',
            'customer': 'res.partner',
            'order': 'sale.order',
        }

        model = model_mapping.get(self.sync_model)
        domain = []

        if since:
            domain.append(('write_date', '>=', since))

        if self.sync_model == 'customer':
            domain.append(('customer_rank', '>', 0))

        records = self.env[model].search(domain)

        return [self._map_odoo_record(r) for r in records]

    def _map_odoo_record(self, record):
        """Mappe un enregistrement Odoo selon le mapping configuré"""
        result = {'_odoo_id': record.id}

        for mapping in self.field_mapping_ids:
            value = record
            for part in mapping.source_field.split('.'):
                value = getattr(value, part, None)
                if value is None:
                    break

            # Transformer si nécessaire
            if mapping.transform_function:
                value = self._apply_transform(value, mapping.transform_function)

            result[mapping.target_field] = value

        return result

    def _sync_record(self, record):
        """Synchronise un enregistrement vers la cible"""
        if self.target_system == 'odoo':
            self._sync_to_odoo(record)
        elif self.target_system == 'shopify':
            self._sync_to_shopify(record)
        elif self.target_system == 'external_api':
            self._sync_to_api(record)

    def _apply_transform(self, value, function):
        """Applique une transformation"""
        transforms = {
            'uppercase': lambda v: v.upper() if isinstance(v, str) else v,
            'lowercase': lambda v: v.lower() if isinstance(v, str) else v,
            'float_to_int': lambda v: int(v) if v else 0,
            'bool_to_yesno': lambda v: 'Yes' if v else 'No',
            'date_to_iso': lambda v: v.isoformat() if v else None,
        }

        transform = transforms.get(function)
        return transform(value) if transform else value


class SyncFieldMapping(models.Model):
    _name = 'sync.field.mapping'
    _description = 'Sync Field Mapping'
    _order = 'sequence'

    orchestrator_id = fields.Many2one(
        'sync.orchestrator',
        required=True,
        ondelete='cascade',
    )
    sequence = fields.Integer(default=10)

    source_field = fields.Char(
        string='Source Field',
        required=True,
        help='Use dot notation for related fields: partner_id.name',
    )
    target_field = fields.Char(
        string='Target Field',
        required=True,
    )
    transform_function = fields.Selection([
        ('uppercase', 'Uppercase'),
        ('lowercase', 'Lowercase'),
        ('float_to_int', 'Float to Integer'),
        ('bool_to_yesno', 'Boolean to Yes/No'),
        ('date_to_iso', 'Date to ISO Format'),
    ], string='Transform')

    is_key = fields.Boolean(
        string='Is Key Field',
        help='Used to match existing records',
    )
    required = fields.Boolean(string='Required')
    default_value = fields.Char(string='Default Value')


class SyncLog(models.Model):
    _name = 'sync.log'
    _description = 'Sync Log'
    _order = 'started_at desc'

    orchestrator_id = fields.Many2one(
        'sync.orchestrator',
        required=True,
        ondelete='cascade',
    )
    started_at = fields.Datetime(string='Started')
    ended_at = fields.Datetime(string='Ended')
    duration = fields.Float(
        string='Duration (s)',
        compute='_compute_duration',
    )
    status = fields.Selection([
        ('running', 'Running'),
        ('success', 'Success'),
        ('partial', 'Partial Success'),
        ('failed', 'Failed'),
    ], string='Status')
    records_synced = fields.Integer(string='Synced')
    records_failed = fields.Integer(string='Failed')
    error_message = fields.Text(string='Error')

    @api.depends('started_at', 'ended_at')
    def _compute_duration(self):
        for rec in self:
            if rec.started_at and rec.ended_at:
                delta = rec.ended_at - rec.started_at
                rec.duration = delta.total_seconds()
            else:
                rec.duration = 0
```

---

## 6. Error Handling & Retry

### Gestion des Erreurs

```python
# models/integration_error.py
import traceback
from datetime import datetime, timedelta


class IntegrationError(models.Model):
    _name = 'integration.error'
    _description = 'Integration Error'
    _order = 'create_date desc'

    name = fields.Char(string='Reference', readonly=True)
    integration_type = fields.Selection([
        ('api', 'API Call'),
        ('webhook', 'Webhook'),
        ('sync', 'Data Sync'),
        ('connector', 'Connector'),
    ], string='Type')

    # Contexte
    model = fields.Char(string='Model')
    record_id = fields.Integer(string='Record ID')
    operation = fields.Char(string='Operation')

    # Erreur
    error_type = fields.Char(string='Error Type')
    error_message = fields.Text(string='Error Message')
    stack_trace = fields.Text(string='Stack Trace')

    # Request details
    request_url = fields.Char(string='Request URL')
    request_method = fields.Char(string='Method')
    request_headers = fields.Text(string='Request Headers')
    request_body = fields.Text(string='Request Body')
    response_code = fields.Integer(string='Response Code')
    response_body = fields.Text(string='Response Body')

    # Status
    state = fields.Selection([
        ('new', 'New'),
        ('retrying', 'Retrying'),
        ('resolved', 'Resolved'),
        ('ignored', 'Ignored'),
    ], string='Status', default='new')

    retry_count = fields.Integer(string='Retry Count', default=0)
    max_retries = fields.Integer(string='Max Retries', default=3)
    next_retry = fields.Datetime(string='Next Retry')
    resolved_date = fields.Datetime(string='Resolved Date')

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not vals.get('name'):
                vals['name'] = self.env['ir.sequence'].next_by_code(
                    'integration.error'
                )
        return super().create(vals_list)

    def action_retry(self):
        """Retente l'opération"""
        self.ensure_one()

        if self.retry_count >= self.max_retries:
            raise UserError("Maximum retry attempts reached!")

        self.retry_count += 1
        self.state = 'retrying'

        try:
            # Réexécuter l'opération selon le type
            if self.integration_type == 'webhook':
                self._retry_webhook()
            elif self.integration_type == 'sync':
                self._retry_sync()
            elif self.integration_type == 'api':
                self._retry_api_call()

            self.write({
                'state': 'resolved',
                'resolved_date': fields.Datetime.now(),
            })

        except Exception as e:
            self.write({
                'error_message': str(e),
                'stack_trace': traceback.format_exc(),
                'state': 'new',
                'next_retry': datetime.now() + timedelta(
                    minutes=5 * (2 ** self.retry_count)  # Exponential backoff
                ),
            })

    def action_ignore(self):
        """Ignore l'erreur"""
        self.write({'state': 'ignored'})

    @api.model
    def _cron_auto_retry(self):
        """Cron pour retry automatique"""
        errors = self.search([
            ('state', '=', 'new'),
            ('retry_count', '<', 3),
            '|',
            ('next_retry', '=', False),
            ('next_retry', '<=', fields.Datetime.now()),
        ], limit=50)

        for error in errors:
            try:
                error.action_retry()
            except Exception:
                pass  # Déjà logué dans action_retry

    @api.model
    def log_error(self, error_type, operation, exception, **kwargs):
        """Helper pour logger une erreur"""
        return self.create({
            'integration_type': error_type,
            'operation': operation,
            'error_type': type(exception).__name__,
            'error_message': str(exception),
            'stack_trace': traceback.format_exc(),
            **kwargs,
        })
```

---

## 7. Bonnes Pratiques Intégration

### Checklist Sécurité API

```markdown
## Authentication
- [ ] API Keys avec rotation régulière
- [ ] OAuth2 pour intégrations tierces
- [ ] Tokens JWT avec expiration courte
- [ ] HTTPS obligatoire

## Validation
- [ ] Validation des signatures webhook
- [ ] Timestamps anti-replay
- [ ] Rate limiting par API key
- [ ] Validation des données entrantes

## Monitoring
- [ ] Logging de toutes les requêtes
- [ ] Alertes sur taux d'erreur élevé
- [ ] Métriques de performance
- [ ] Audit trail des modifications

## Resilience
- [ ] Retry avec backoff exponentiel
- [ ] Circuit breaker pattern
- [ ] Queue pour opérations async
- [ ] Fallback pour services indisponibles
```

### Pattern Circuit Breaker

```python
# utils/circuit_breaker.py
from datetime import datetime, timedelta


class CircuitBreaker:
    """Pattern Circuit Breaker pour appels externes"""

    def __init__(self, failure_threshold=5, recovery_timeout=60):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = 'closed'  # closed, open, half-open

    def call(self, func, *args, **kwargs):
        if self.state == 'open':
            if self._should_attempt_reset():
                self.state = 'half-open'
            else:
                raise CircuitBreakerOpen("Circuit breaker is open")

        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise

    def _on_success(self):
        self.failure_count = 0
        self.state = 'closed'

    def _on_failure(self):
        self.failure_count += 1
        self.last_failure_time = datetime.now()

        if self.failure_count >= self.failure_threshold:
            self.state = 'open'

    def _should_attempt_reset(self):
        if self.last_failure_time is None:
            return True
        return datetime.now() > self.last_failure_time + timedelta(
            seconds=self.recovery_timeout
        )


class CircuitBreakerOpen(Exception):
    pass
```

---

## Usage de cet Agent

Pour utiliser cet agent intégration expert :

```
/agent odoo-integration-expert
```

Puis demandez :
- "Créer une API REST complète"
- "Implémenter l'intégration Stripe"
- "Configurer les webhooks Shopify"
- "Créer un orchestrateur de sync"
- "Implémenter le pattern circuit breaker"
