# -*- coding: utf-8 -*-
"""
API Connector Framework Models
==============================
Reusable framework for building API integrations.
"""

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError, UserError
from odoo.http import request, Response
import requests
import json
import hmac
import hashlib
import secrets
import time
import logging
from datetime import datetime, timedelta
from functools import wraps

_logger = logging.getLogger(__name__)


class APIKey(models.Model):
    """API Key Management"""
    _name = 'api.key'
    _description = 'API Key'
    _inherit = ['mail.thread']

    name = fields.Char(required=True, tracking=True)
    key = fields.Char(readonly=True, copy=False)
    user_id = fields.Many2one('res.users', required=True, tracking=True)
    active = fields.Boolean(default=True)

    # Permissions
    allowed_models = fields.Char(help='Comma-separated list of models (empty = all)')
    read_only = fields.Boolean(default=False)

    # Rate limiting
    rate_limit = fields.Integer(string='Rate Limit (requests/hour)', default=1000)
    requests_count = fields.Integer(default=0)
    requests_reset = fields.Datetime()

    # Audit
    last_used = fields.Datetime()
    created_date = fields.Datetime(default=fields.Datetime.now)
    expires_date = fields.Datetime()

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not vals.get('key'):
                vals['key'] = secrets.token_urlsafe(32)
        return super().create(vals_list)

    def regenerate_key(self):
        self.key = secrets.token_urlsafe(32)

    def check_rate_limit(self):
        """Check and update rate limit, returns True if allowed"""
        self.ensure_one()
        now = datetime.now()

        if not self.requests_reset or self.requests_reset < now:
            self.write({
                'requests_count': 1,
                'requests_reset': now + timedelta(hours=1),
                'last_used': now,
            })
            return True

        if self.requests_count >= self.rate_limit:
            return False

        self.write({
            'requests_count': self.requests_count + 1,
            'last_used': now,
        })
        return True

    def check_model_access(self, model):
        """Check if API key has access to model"""
        if not self.allowed_models:
            return True
        allowed = [m.strip() for m in self.allowed_models.split(',')]
        return model in allowed


class APIConnector(models.Model):
    """External API Connector"""
    _name = 'api.connector'
    _description = 'API Connector'
    _inherit = ['mail.thread']

    name = fields.Char(required=True)
    code = fields.Char(required=True, size=20)
    active = fields.Boolean(default=True)

    # Connection
    base_url = fields.Char(required=True)
    auth_type = fields.Selection([
        ('none', 'No Auth'),
        ('api_key', 'API Key'),
        ('bearer', 'Bearer Token'),
        ('basic', 'Basic Auth'),
        ('oauth2', 'OAuth 2.0'),
    ], default='api_key', required=True)

    api_key = fields.Char(string='API Key / Token')
    api_secret = fields.Char(string='API Secret')
    username = fields.Char()
    password = fields.Char()

    # OAuth2
    oauth_client_id = fields.Char()
    oauth_client_secret = fields.Char()
    oauth_token_url = fields.Char()
    oauth_access_token = fields.Char()
    oauth_refresh_token = fields.Char()
    oauth_expires = fields.Datetime()

    # Settings
    timeout = fields.Integer(default=30)
    retry_count = fields.Integer(default=3)
    retry_delay = fields.Integer(default=5, help='Delay between retries in seconds')

    # Status
    state = fields.Selection([
        ('draft', 'Draft'),
        ('connected', 'Connected'),
        ('error', 'Error'),
    ], default='draft')
    last_sync = fields.Datetime()
    error_message = fields.Text()

    def _get_headers(self):
        """Build request headers"""
        headers = {'Content-Type': 'application/json'}

        if self.auth_type == 'api_key':
            headers['X-API-Key'] = self.api_key
        elif self.auth_type == 'bearer':
            headers['Authorization'] = f'Bearer {self.api_key}'
        elif self.auth_type == 'basic':
            import base64
            credentials = base64.b64encode(
                f'{self.username}:{self.password}'.encode()
            ).decode()
            headers['Authorization'] = f'Basic {credentials}'
        elif self.auth_type == 'oauth2':
            self._refresh_oauth_token()
            headers['Authorization'] = f'Bearer {self.oauth_access_token}'

        return headers

    def _refresh_oauth_token(self):
        """Refresh OAuth2 token if expired"""
        if self.oauth_expires and self.oauth_expires > datetime.now():
            return

        response = requests.post(self.oauth_token_url, data={
            'grant_type': 'refresh_token',
            'refresh_token': self.oauth_refresh_token,
            'client_id': self.oauth_client_id,
            'client_secret': self.oauth_client_secret,
        })
        response.raise_for_status()
        data = response.json()

        self.write({
            'oauth_access_token': data['access_token'],
            'oauth_refresh_token': data.get('refresh_token', self.oauth_refresh_token),
            'oauth_expires': datetime.now() + timedelta(seconds=data.get('expires_in', 3600)),
        })

    def api_call(self, method, endpoint, data=None, params=None):
        """Make API call with retry logic"""
        self.ensure_one()
        url = f"{self.base_url.rstrip('/')}/{endpoint.lstrip('/')}"
        headers = self._get_headers()

        for attempt in range(self.retry_count):
            try:
                response = requests.request(
                    method,
                    url,
                    headers=headers,
                    json=data,
                    params=params,
                    timeout=self.timeout,
                )

                # Log the call
                self._log_api_call(method, url, data, response)

                response.raise_for_status()
                self.state = 'connected'
                self.error_message = False
                return response.json()

            except requests.exceptions.RequestException as e:
                _logger.warning(f"API call failed (attempt {attempt + 1}): {e}")
                if attempt == self.retry_count - 1:
                    self.state = 'error'
                    self.error_message = str(e)
                    raise
                time.sleep(self.retry_delay * (attempt + 1))

    def _log_api_call(self, method, url, data, response):
        """Log API call for audit"""
        self.env['api.log'].create({
            'connector_id': self.id,
            'method': method,
            'url': url,
            'request_body': json.dumps(data) if data else False,
            'response_code': response.status_code,
            'response_body': response.text[:5000],
        })

    def action_test_connection(self):
        """Test the API connection"""
        self.ensure_one()
        try:
            self.api_call('GET', '/')
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'message': 'Connection successful!',
                    'type': 'success',
                }
            }
        except Exception as e:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'message': f'Connection failed: {e}',
                    'type': 'danger',
                }
            }


class WebhookOutgoing(models.Model):
    """Outgoing Webhook Configuration"""
    _name = 'webhook.outgoing'
    _description = 'Outgoing Webhook'
    _order = 'sequence'

    name = fields.Char(required=True)
    sequence = fields.Integer(default=10)
    active = fields.Boolean(default=True)

    url = fields.Char(required=True)
    secret = fields.Char()

    model_id = fields.Many2one('ir.model', required=True, ondelete='cascade')
    model_name = fields.Char(related='model_id.model')

    trigger_on_create = fields.Boolean(default=True)
    trigger_on_write = fields.Boolean(default=True)
    trigger_on_unlink = fields.Boolean(default=False)

    domain = fields.Char(default='[]')
    field_ids = fields.Many2many('ir.model.fields', domain="[('model_id', '=', model_id)]")

    async_mode = fields.Boolean(default=True)

    success_count = fields.Integer()
    failure_count = fields.Integer()
    last_triggered = fields.Datetime()

    def trigger(self, records, event, changed_fields=None):
        """Trigger the webhook"""
        self.ensure_one()

        if self.domain and self.domain != '[]':
            domain = eval(self.domain)
            records = records.filtered_domain(domain)

        if not records:
            return

        payload = self._prepare_payload(records, event, changed_fields)

        if self.async_mode:
            self.env['webhook.queue'].create({
                'webhook_id': self.id,
                'payload': json.dumps(payload),
            })
        else:
            self._send(payload)

        self.last_triggered = fields.Datetime.now()

    def _prepare_payload(self, records, event, changed_fields):
        if self.field_ids:
            fields_list = self.field_ids.mapped('name')
        else:
            fields_list = None

        data = records.read(fields_list)

        return {
            'event': event,
            'model': self.model_name,
            'timestamp': datetime.utcnow().isoformat(),
            'data': data if len(data) > 1 else data[0],
            'changed_fields': changed_fields,
        }

    def _send(self, payload):
        """Send webhook"""
        timestamp = str(int(time.time()))
        body = json.dumps(payload)

        headers = {
            'Content-Type': 'application/json',
            'X-Timestamp': timestamp,
            'X-Webhook-Event': payload['event'],
        }

        if self.secret:
            signature = hmac.new(
                self.secret.encode(),
                f"{timestamp}{body}".encode(),
                hashlib.sha256,
            ).hexdigest()
            headers['X-Signature'] = signature

        try:
            response = requests.post(self.url, data=body, headers=headers, timeout=30)
            response.raise_for_status()
            self.success_count += 1
        except Exception as e:
            self.failure_count += 1
            _logger.error(f"Webhook failed: {e}")
            raise


class WebhookQueue(models.Model):
    """Webhook Queue for async processing"""
    _name = 'webhook.queue'
    _description = 'Webhook Queue'
    _order = 'create_date'

    webhook_id = fields.Many2one('webhook.outgoing', required=True, ondelete='cascade')
    payload = fields.Text()
    retry_count = fields.Integer(default=0)
    state = fields.Selection([
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('done', 'Done'),
        ('failed', 'Failed'),
    ], default='pending')
    error_message = fields.Text()

    @api.model
    def _cron_process_queue(self):
        """Process pending webhooks"""
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
                item.state = 'failed' if item.retry_count >= 3 else 'pending'


class SyncOrchestrator(models.Model):
    """Data Sync Orchestrator"""
    _name = 'sync.orchestrator'
    _description = 'Sync Orchestrator'

    name = fields.Char(required=True)
    active = fields.Boolean(default=True)

    connector_id = fields.Many2one('api.connector', required=True)

    sync_type = fields.Selection([
        ('full', 'Full Sync'),
        ('incremental', 'Incremental'),
    ], default='incremental')

    source_model = fields.Char(required=True)
    target_model = fields.Char(required=True)
    direction = fields.Selection([
        ('import', 'Import to Odoo'),
        ('export', 'Export from Odoo'),
        ('bidirectional', 'Bidirectional'),
    ], default='import')

    field_mapping_ids = fields.One2many('sync.field.mapping', 'orchestrator_id')

    schedule = fields.Selection([
        ('manual', 'Manual'),
        ('hourly', 'Hourly'),
        ('daily', 'Daily'),
    ], default='manual')

    last_sync = fields.Datetime()
    last_status = fields.Selection([
        ('success', 'Success'),
        ('partial', 'Partial'),
        ('failed', 'Failed'),
    ])
    records_synced = fields.Integer()
    records_failed = fields.Integer()

    def action_sync(self):
        """Execute sync"""
        self.ensure_one()
        try:
            if self.direction in ('import', 'bidirectional'):
                self._import_data()
            if self.direction in ('export', 'bidirectional'):
                self._export_data()

            self.last_sync = fields.Datetime.now()
            self.last_status = 'success'
        except Exception as e:
            self.last_status = 'failed'
            raise

    def _import_data(self):
        """Import data from external system"""
        data = self.connector_id.api_call('GET', self.source_model)
        synced = 0
        failed = 0

        for record in data:
            try:
                mapped = self._map_data(record, 'import')
                self.env[self.target_model].create(mapped)
                synced += 1
            except Exception as e:
                _logger.error(f"Import failed for record: {e}")
                failed += 1

        self.records_synced = synced
        self.records_failed = failed

    def _export_data(self):
        """Export data to external system"""
        records = self.env[self.target_model].search([])
        synced = 0

        for record in records:
            mapped = self._map_data(record.read()[0], 'export')
            self.connector_id.api_call('POST', self.source_model, data=mapped)
            synced += 1

        self.records_synced = synced

    def _map_data(self, data, direction):
        """Map data according to field mappings"""
        result = {}
        for mapping in self.field_mapping_ids:
            source = mapping.source_field if direction == 'import' else mapping.target_field
            target = mapping.target_field if direction == 'import' else mapping.source_field

            if source in data:
                value = data[source]
                if mapping.transform:
                    value = self._apply_transform(value, mapping.transform)
                result[target] = value
            elif mapping.default_value:
                result[target] = mapping.default_value

        return result

    def _apply_transform(self, value, transform):
        transforms = {
            'uppercase': lambda v: v.upper() if isinstance(v, str) else v,
            'lowercase': lambda v: v.lower() if isinstance(v, str) else v,
            'strip': lambda v: v.strip() if isinstance(v, str) else v,
        }
        return transforms.get(transform, lambda v: v)(value)


class SyncFieldMapping(models.Model):
    """Field Mapping for Sync"""
    _name = 'sync.field.mapping'
    _description = 'Sync Field Mapping'
    _order = 'sequence'

    orchestrator_id = fields.Many2one('sync.orchestrator', required=True, ondelete='cascade')
    sequence = fields.Integer(default=10)

    source_field = fields.Char(required=True)
    target_field = fields.Char(required=True)
    transform = fields.Selection([
        ('uppercase', 'Uppercase'),
        ('lowercase', 'Lowercase'),
        ('strip', 'Strip Whitespace'),
    ])
    is_key = fields.Boolean(help='Used to match existing records')
    required = fields.Boolean()
    default_value = fields.Char()


class APILog(models.Model):
    """API Call Log"""
    _name = 'api.log'
    _description = 'API Log'
    _order = 'create_date desc'

    connector_id = fields.Many2one('api.connector', ondelete='cascade')
    method = fields.Char()
    url = fields.Char()
    request_body = fields.Text()
    response_code = fields.Integer()
    response_body = fields.Text()
    duration = fields.Float()
    create_date = fields.Datetime()


class IntegrationError(models.Model):
    """Integration Error Log"""
    _name = 'integration.error'
    _description = 'Integration Error'
    _order = 'create_date desc'

    name = fields.Char(readonly=True)
    error_type = fields.Selection([
        ('api', 'API Error'),
        ('webhook', 'Webhook Error'),
        ('sync', 'Sync Error'),
    ])
    model = fields.Char()
    record_id = fields.Integer()
    operation = fields.Char()
    error_message = fields.Text()
    stack_trace = fields.Text()

    state = fields.Selection([
        ('new', 'New'),
        ('retrying', 'Retrying'),
        ('resolved', 'Resolved'),
        ('ignored', 'Ignored'),
    ], default='new')

    retry_count = fields.Integer(default=0)

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not vals.get('name'):
                vals['name'] = self.env['ir.sequence'].next_by_code('integration.error') or 'ERR'
        return super().create(vals_list)

    def action_retry(self):
        self.retry_count += 1
        self.state = 'retrying'
        # Implement retry logic based on error_type

    def action_ignore(self):
        self.state = 'ignored'

    def action_resolve(self):
        self.state = 'resolved'
