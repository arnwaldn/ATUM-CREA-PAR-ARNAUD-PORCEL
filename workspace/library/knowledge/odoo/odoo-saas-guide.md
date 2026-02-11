# Odoo SaaS Guide

> Patterns pour construire un SaaS multi-tenant avec Odoo
> Source: it-projects-llc/odoo-saas-tools (613 stars, 594 forks)
> ULTRA-CREATE v24.1 - 27 Decembre 2025

---

## Table des Matieres

1. [Multi-Tenancy Core](#section-1-multi-tenancy-core)
2. [OAuth 2.0 Integration](#section-2-oauth-20-integration)
3. [Subscription & Billing](#section-3-subscription--billing)
4. [Cloud Backup](#section-4-cloud-backup)
5. [Infrastructure Automation](#section-5-infrastructure-automation)
6. [Portal Management](#section-6-portal-management)

---

## Section 1: Multi-Tenancy Core

### 1.1 SaaS Client Model

```python
from odoo import models, fields, api
from odoo.exceptions import ValidationError

class SaasClient(models.Model):
    _name = 'saas.client'
    _description = 'SaaS Client (Tenant)'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char('Client Name', required=True, tracking=True)
    domain = fields.Char('Subdomain', required=True, tracking=True)
    # Format: subdomain.yoursaas.com

    state = fields.Selection([
        ('draft', 'Draft'),
        ('pending', 'Pending Setup'),
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('deleted', 'Deleted')
    ], default='draft', tracking=True)

    plan_id = fields.Many2one('saas.plan', 'Subscription Plan', required=True)
    server_id = fields.Many2one('saas.server', 'Assigned Server')

    # Database info
    db_name = fields.Char('Database Name', readonly=True)
    db_created = fields.Boolean('Database Created', default=False)

    # Limits
    max_users = fields.Integer(related='plan_id.max_users', readonly=True)
    max_storage_mb = fields.Integer(related='plan_id.max_storage_mb', readonly=True)
    current_users = fields.Integer('Current Users', compute='_compute_usage')
    current_storage_mb = fields.Float('Storage Used (MB)', compute='_compute_usage')

    # Dates
    creation_date = fields.Date('Created', default=fields.Date.today)
    expiration_date = fields.Date('Expires', tracking=True)
    last_login = fields.Datetime('Last Login')

    # Contact
    partner_id = fields.Many2one('res.partner', 'Contact', required=True)
    admin_email = fields.Char(related='partner_id.email', readonly=True)

    _sql_constraints = [
        ('domain_unique', 'unique(domain)', 'This subdomain is already taken!')
    ]

    @api.constrains('domain')
    def _check_domain(self):
        for client in self:
            if not client.domain.isalnum():
                raise ValidationError("Subdomain must be alphanumeric only")
            if len(client.domain) < 3:
                raise ValidationError("Subdomain must be at least 3 characters")

    def _compute_usage(self):
        for client in self:
            # Query client database for actual usage
            client.current_users = self._get_client_user_count(client.db_name)
            client.current_storage_mb = self._get_client_storage(client.db_name)

    def action_provision(self):
        """Create database and configure tenant"""
        self.ensure_one()
        if self.state != 'draft':
            raise ValidationError("Can only provision from draft state")

        # Generate unique database name
        self.db_name = f"saas_{self.domain}_{fields.Date.today().strftime('%Y%m%d')}"

        # Clone template database
        self.plan_id.create_client_db(self)

        # Setup DNS
        self.env['saas.dns'].create_subdomain(self.domain, self.server_id.ip)

        # Send welcome email
        self.env['saas.mailgun'].send_welcome_email(self)

        self.db_created = True
        self.state = 'active'

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': 'Success',
                'message': f'Tenant {self.domain} provisioned successfully!',
                'type': 'success',
            }
        }

    def action_suspend(self):
        """Suspend tenant (non-payment, abuse, etc.)"""
        self.ensure_one()
        self.state = 'suspended'
        # Optionally: Revoke OAuth tokens, block logins

    def action_delete(self):
        """Soft delete - mark as deleted, keep data for retention period"""
        self.ensure_one()
        self.state = 'deleted'
        # Schedule actual deletion after retention period (e.g., 30 days)
```

### 1.2 SaaS Server Model

```python
class SaasServer(models.Model):
    _name = 'saas.server'
    _description = 'SaaS Server Instance'

    name = fields.Char('Server Name', required=True)
    ip = fields.Char('IP Address', required=True)
    hostname = fields.Char('Hostname')

    state = fields.Selection([
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('maintenance', 'Maintenance'),
        ('offline', 'Offline')
    ], default='draft')

    # Capacity
    max_clients = fields.Integer('Max Clients', default=50)
    current_clients = fields.Integer('Current Clients', compute='_compute_clients')

    # Resources
    cpu_cores = fields.Integer('CPU Cores')
    ram_gb = fields.Integer('RAM (GB)')
    disk_gb = fields.Integer('Disk (GB)')

    client_ids = fields.One2many('saas.client', 'server_id', 'Clients')

    def _compute_clients(self):
        for server in self:
            server.current_clients = len(server.client_ids.filtered(
                lambda c: c.state == 'active'
            ))

    def _clone_database(self, template_db, target_db):
        """Clone a template database to create new tenant"""
        import subprocess

        # Stop connections to template
        self.env.cr.execute(f"""
            SELECT pg_terminate_backend(pid)
            FROM pg_stat_activity
            WHERE datname = %s
        """, [template_db])

        # Clone database
        subprocess.run([
            'createdb', '-T', template_db, target_db
        ], check=True)

        return True

    def get_available_server(self):
        """Find server with capacity for new client"""
        return self.search([
            ('state', '=', 'active'),
            ('current_clients', '<', 'max_clients')
        ], limit=1, order='current_clients asc')
```

### 1.3 Tenant Isolation Security

```xml
<!-- security/ir_rules.xml -->
<odoo>
    <!-- Each client only sees their own data -->
    <record id="saas_client_rule" model="ir.rule">
        <field name="name">SaaS Client: Own Records Only</field>
        <field name="model_id" ref="model_saas_client"/>
        <field name="domain_force">[('id', '=', user.saas_client_id.id)]</field>
        <field name="groups" eval="[(4, ref('saas_base.group_saas_user'))]"/>
    </record>
</odoo>
```

---

## Section 2: OAuth 2.0 Integration

### 2.1 OAuth Provider Model

```python
class OAuthProvider(models.Model):
    _name = 'oauth.provider'
    _description = 'OAuth 2.0 Provider'

    name = fields.Char('Provider Name', required=True)
    client_id = fields.Char('Client ID', required=True)
    client_secret = fields.Char('Client Secret', required=True)

    # Endpoints
    auth_endpoint = fields.Char('Authorization Endpoint', required=True)
    token_endpoint = fields.Char('Token Endpoint', required=True)
    validation_endpoint = fields.Char('Validation Endpoint')
    userinfo_endpoint = fields.Char('User Info Endpoint')

    # Configuration
    scope = fields.Char('Scope', default='openid profile email')
    enabled = fields.Boolean('Enabled', default=True)

    # For multi-tenant SSO
    saas_client_id = fields.Many2one('saas.client', 'SaaS Client')

    def get_auth_url(self, redirect_uri, state=None):
        """Generate OAuth authorization URL"""
        import urllib.parse

        params = {
            'client_id': self.client_id,
            'redirect_uri': redirect_uri,
            'scope': self.scope,
            'response_type': 'code',
            'state': state or self._generate_state(),
        }
        return f"{self.auth_endpoint}?{urllib.parse.urlencode(params)}"

    def exchange_code(self, code, redirect_uri):
        """Exchange authorization code for access token"""
        import requests

        response = requests.post(self.token_endpoint, data={
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'code': code,
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code',
        })

        if response.status_code != 200:
            raise ValidationError(f"OAuth error: {response.text}")

        return response.json()

    def get_user_info(self, access_token):
        """Fetch user info from OAuth provider"""
        import requests

        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(self.userinfo_endpoint, headers=headers)

        return response.json()
```

### 2.2 OAuth Controller

```python
from odoo import http
from odoo.http import request

class OAuthController(http.Controller):

    @http.route('/oauth/authorize', type='http', auth='public')
    def oauth_authorize(self, provider_id, redirect_uri, **kw):
        """Initiate OAuth flow"""
        provider = request.env['oauth.provider'].sudo().browse(int(provider_id))

        if not provider.exists() or not provider.enabled:
            return request.redirect('/web/login?error=provider_disabled')

        state = request.env['oauth.state'].create({
            'redirect_uri': redirect_uri,
            'provider_id': provider.id,
        })

        auth_url = provider.get_auth_url(
            redirect_uri=f"{request.httprequest.host_url}oauth/callback",
            state=state.token
        )

        return request.redirect(auth_url)

    @http.route('/oauth/callback', type='http', auth='public')
    def oauth_callback(self, code=None, state=None, error=None, **kw):
        """Handle OAuth callback"""
        if error:
            return request.redirect(f'/web/login?error={error}')

        # Validate state
        oauth_state = request.env['oauth.state'].sudo().search([
            ('token', '=', state),
            ('used', '=', False)
        ], limit=1)

        if not oauth_state:
            return request.redirect('/web/login?error=invalid_state')

        oauth_state.used = True
        provider = oauth_state.provider_id

        # Exchange code for token
        token_data = provider.exchange_code(
            code,
            f"{request.httprequest.host_url}oauth/callback"
        )

        # Get user info
        user_info = provider.get_user_info(token_data['access_token'])

        # Find or create user
        user = request.env['res.users'].sudo()._oauth_login(
            provider.id,
            user_info,
            token_data
        )

        if user:
            request.session.authenticate(request.db, user.login, token_data)
            return request.redirect(oauth_state.redirect_uri or '/web')

        return request.redirect('/web/login?error=user_not_found')
```

---

## Section 3: Subscription & Billing

### 3.1 SaaS Plan Model

```python
class SaasPlan(models.Model):
    _name = 'saas.plan'
    _description = 'SaaS Subscription Plan'
    _order = 'monthly_price asc'

    name = fields.Char('Plan Name', required=True)
    code = fields.Char('Code', required=True)  # e.g., 'starter', 'pro', 'enterprise'

    # Pricing
    monthly_price = fields.Float('Monthly Price', required=True)
    yearly_price = fields.Float('Yearly Price')  # Typically with discount
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)

    # Limits
    max_users = fields.Integer('Max Users', default=5)
    max_storage_mb = fields.Integer('Max Storage (MB)', default=1024)
    max_records = fields.Integer('Max Records', default=10000)

    # Features (JSON field for flexibility)
    features = fields.Text('Features (JSON)', default='[]')

    # Template
    template_db = fields.Char('Template Database', required=True)
    # Database to clone when creating new tenant

    # Product link for invoicing
    product_id = fields.Many2one('product.product', 'Billing Product')

    def get_features_list(self):
        """Parse features JSON"""
        import json
        try:
            return json.loads(self.features or '[]')
        except:
            return []

    def create_client_db(self, client):
        """Clone template database for new client"""
        server = client.server_id or self.env['saas.server'].get_available_server()

        if not server:
            raise ValidationError("No available server for new client")

        server._clone_database(self.template_db, client.db_name)
        client.server_id = server

        # Initialize client database
        self._initialize_client_db(client)

        return True

    def _initialize_client_db(self, client):
        """Configure new client database"""
        # Connect to client DB and set initial data
        # Set company name, admin user, etc.
        pass
```

### 3.2 SaaS Subscription Model

```python
class SaasSubscription(models.Model):
    _name = 'saas.subscription'
    _description = 'SaaS Subscription'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char('Reference', required=True, default='New')

    client_id = fields.Many2one('saas.client', 'Client', required=True, ondelete='cascade')
    plan_id = fields.Many2one('saas.plan', 'Plan', required=True)
    partner_id = fields.Many2one(related='client_id.partner_id', store=True)

    # Dates
    start_date = fields.Date('Start Date', required=True, default=fields.Date.today)
    end_date = fields.Date('End Date')
    next_invoice_date = fields.Date('Next Invoice Date')

    # Billing
    billing_period = fields.Selection([
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly')
    ], default='monthly', required=True)

    recurring_price = fields.Float('Recurring Price', compute='_compute_price', store=True)

    state = fields.Selection([
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled')
    ], default='draft', tracking=True)

    # Invoicing
    invoice_ids = fields.One2many('account.move', 'saas_subscription_id', 'Invoices')
    invoice_count = fields.Integer(compute='_compute_invoice_count')

    @api.depends('plan_id', 'billing_period')
    def _compute_price(self):
        for sub in self:
            if sub.billing_period == 'yearly':
                sub.recurring_price = sub.plan_id.yearly_price or (sub.plan_id.monthly_price * 12 * 0.8)
            else:
                sub.recurring_price = sub.plan_id.monthly_price

    def _compute_invoice_count(self):
        for sub in self:
            sub.invoice_count = len(sub.invoice_ids)

    @api.model
    def create(self, vals):
        if vals.get('name', 'New') == 'New':
            vals['name'] = self.env['ir.sequence'].next_by_code('saas.subscription')
        return super().create(vals)

    def action_activate(self):
        """Activate subscription and provision client"""
        self.ensure_one()
        self.state = 'active'
        self.next_invoice_date = self.start_date

        # Provision client if not done
        if self.client_id.state == 'draft':
            self.client_id.action_provision()

    def action_cancel(self):
        """Cancel subscription"""
        self.ensure_one()
        self.state = 'cancelled'
        self.client_id.action_suspend()

    @api.model
    def _cron_check_expiration(self):
        """Cron job: Check and handle expired subscriptions"""
        today = fields.Date.today()

        # Find subscriptions expiring today
        expiring = self.search([
            ('state', '=', 'active'),
            ('end_date', '<=', today)
        ])

        for sub in expiring:
            sub.state = 'expired'
            sub.client_id.action_suspend()

            # Send expiration notification
            sub.message_post(
                body="Subscription has expired",
                subject="Subscription Expired",
                message_type='notification'
            )

    @api.model
    def _cron_generate_invoices(self):
        """Cron job: Generate recurring invoices"""
        today = fields.Date.today()

        to_invoice = self.search([
            ('state', '=', 'active'),
            ('next_invoice_date', '<=', today)
        ])

        for sub in to_invoice:
            sub._generate_invoice()

    def _generate_invoice(self):
        """Generate invoice for subscription period"""
        self.ensure_one()

        invoice = self.env['account.move'].create({
            'partner_id': self.partner_id.id,
            'move_type': 'out_invoice',
            'saas_subscription_id': self.id,
            'invoice_line_ids': [(0, 0, {
                'product_id': self.plan_id.product_id.id,
                'name': f"SaaS Subscription: {self.plan_id.name} ({self.billing_period})",
                'quantity': 1,
                'price_unit': self.recurring_price,
            })]
        })

        # Update next invoice date
        if self.billing_period == 'monthly':
            self.next_invoice_date = self.next_invoice_date + relativedelta(months=1)
        else:
            self.next_invoice_date = self.next_invoice_date + relativedelta(years=1)

        return invoice
```

---

## Section 4: Cloud Backup

### 4.1 AWS S3 Backup

```python
import boto3
from datetime import datetime
from odoo import models, fields, api
from odoo.exceptions import UserError

class SaasBackupS3(models.Model):
    _name = 'saas.backup.s3'
    _description = 'SaaS AWS S3 Backup Configuration'

    name = fields.Char('Configuration Name', required=True)

    # AWS Credentials
    aws_access_key = fields.Char('AWS Access Key', required=True)
    aws_secret_key = fields.Char('AWS Secret Key', required=True)
    region = fields.Char('AWS Region', default='eu-west-1', required=True)
    bucket_name = fields.Char('S3 Bucket', required=True)

    # Backup settings
    prefix = fields.Char('Key Prefix', default='odoo-backups/')
    retention_days = fields.Integer('Retention (days)', default=30)

    # Status
    last_backup = fields.Datetime('Last Backup')
    last_status = fields.Selection([
        ('success', 'Success'),
        ('failed', 'Failed')
    ])
    last_error = fields.Text('Last Error')

    def _get_s3_client(self):
        """Create boto3 S3 client"""
        return boto3.client(
            's3',
            aws_access_key_id=self.aws_access_key,
            aws_secret_access_key=self.aws_secret_key,
            region_name=self.region
        )

    def test_connection(self):
        """Test S3 connection"""
        try:
            s3 = self._get_s3_client()
            s3.head_bucket(Bucket=self.bucket_name)

            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': 'Success',
                    'message': 'S3 connection successful!',
                    'type': 'success',
                }
            }
        except Exception as e:
            raise UserError(f"S3 connection failed: {str(e)}")

    def backup_database(self, db_name, client=None):
        """Backup a database to S3"""
        import subprocess
        import tempfile
        import os

        try:
            # Create backup file
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_filename = f"{db_name}_{timestamp}.zip"

            with tempfile.TemporaryDirectory() as tmpdir:
                backup_path = os.path.join(tmpdir, backup_filename)

                # Create PostgreSQL dump
                dump_path = os.path.join(tmpdir, 'dump.sql')
                subprocess.run([
                    'pg_dump', '-Fc', '-f', dump_path, db_name
                ], check=True)

                # Also backup filestore
                filestore_path = f"/var/lib/odoo/filestore/{db_name}"

                # Create zip with dump + filestore
                subprocess.run([
                    'zip', '-r', backup_path, dump_path, filestore_path
                ], check=True, cwd=tmpdir)

                # Upload to S3
                s3 = self._get_s3_client()
                key = f"{self.prefix}{db_name}/{backup_filename}"

                s3.upload_file(backup_path, self.bucket_name, key)

            self.last_backup = fields.Datetime.now()
            self.last_status = 'success'
            self.last_error = False

            # Log backup for client
            if client:
                self.env['saas.backup.log'].create({
                    'client_id': client.id,
                    's3_key': key,
                    'size_mb': os.path.getsize(backup_path) / (1024 * 1024),
                    'status': 'success',
                })

            return key

        except Exception as e:
            self.last_status = 'failed'
            self.last_error = str(e)
            raise UserError(f"Backup failed: {str(e)}")

    def restore_database(self, db_name, s3_key, target_db=None):
        """Restore database from S3 backup"""
        import subprocess
        import tempfile
        import os

        target_db = target_db or db_name

        try:
            s3 = self._get_s3_client()

            with tempfile.TemporaryDirectory() as tmpdir:
                # Download backup
                backup_path = os.path.join(tmpdir, 'backup.zip')
                s3.download_file(self.bucket_name, s3_key, backup_path)

                # Extract
                subprocess.run(['unzip', backup_path, '-d', tmpdir], check=True)

                # Restore dump
                dump_path = os.path.join(tmpdir, 'dump.sql')
                subprocess.run([
                    'pg_restore', '-d', target_db, '-c', dump_path
                ], check=True)

            return True

        except Exception as e:
            raise UserError(f"Restore failed: {str(e)}")

    @api.model
    def _cron_backup_all_clients(self):
        """Cron: Backup all active client databases"""
        config = self.search([('name', '=', 'production')], limit=1)
        if not config:
            return

        clients = self.env['saas.client'].search([('state', '=', 'active')])

        for client in clients:
            try:
                config.backup_database(client.db_name, client)
            except Exception as e:
                # Log error but continue with other clients
                _logger.error(f"Backup failed for {client.db_name}: {e}")

    @api.model
    def _cron_cleanup_old_backups(self):
        """Cron: Delete backups older than retention period"""
        config = self.search([('name', '=', 'production')], limit=1)
        if not config:
            return

        s3 = config._get_s3_client()
        cutoff = datetime.now() - timedelta(days=config.retention_days)

        # List and delete old objects
        paginator = s3.get_paginator('list_objects_v2')

        for page in paginator.paginate(Bucket=config.bucket_name, Prefix=config.prefix):
            for obj in page.get('Contents', []):
                if obj['LastModified'].replace(tzinfo=None) < cutoff:
                    s3.delete_object(Bucket=config.bucket_name, Key=obj['Key'])
```

### 4.2 FTP Backup Alternative

```python
class SaasBackupFTP(models.Model):
    _name = 'saas.backup.ftp'
    _description = 'SaaS FTP Backup Configuration'

    name = fields.Char('Configuration Name', required=True)

    # FTP Settings
    host = fields.Char('FTP Host', required=True)
    port = fields.Integer('Port', default=21)
    username = fields.Char('Username', required=True)
    password = fields.Char('Password', required=True)
    use_sftp = fields.Boolean('Use SFTP', default=True)

    remote_path = fields.Char('Remote Path', default='/backups/')
    retention_days = fields.Integer('Retention (days)', default=30)

    def _get_ftp_connection(self):
        """Create FTP/SFTP connection"""
        if self.use_sftp:
            import paramiko

            transport = paramiko.Transport((self.host, self.port or 22))
            transport.connect(username=self.username, password=self.password)
            return paramiko.SFTPClient.from_transport(transport)
        else:
            from ftplib import FTP

            ftp = FTP()
            ftp.connect(self.host, self.port)
            ftp.login(self.username, self.password)
            return ftp

    def backup_database(self, db_name, client=None):
        """Backup database to FTP server"""
        # Similar logic to S3, but upload via FTP
        pass
```

---

## Section 5: Infrastructure Automation

### 5.1 AWS Route53 DNS Management

```python
import boto3

class SaasDNSRoute53(models.Model):
    _name = 'saas.dns.route53'
    _description = 'AWS Route53 DNS Management'

    name = fields.Char('Configuration Name', required=True)

    # AWS Credentials
    aws_access_key = fields.Char('AWS Access Key', required=True)
    aws_secret_key = fields.Char('AWS Secret Key', required=True)
    region = fields.Char('AWS Region', default='us-east-1')

    # Route53 Settings
    hosted_zone_id = fields.Char('Hosted Zone ID', required=True)
    base_domain = fields.Char('Base Domain', required=True)
    # e.g., 'yoursaas.com' - subdomains will be client.yoursaas.com

    def _get_route53_client(self):
        """Create Route53 client"""
        return boto3.client(
            'route53',
            aws_access_key_id=self.aws_access_key,
            aws_secret_access_key=self.aws_secret_key,
            region_name=self.region
        )

    def create_subdomain(self, subdomain, target_ip):
        """Create A record for new subdomain"""
        route53 = self._get_route53_client()

        full_domain = f"{subdomain}.{self.base_domain}"

        route53.change_resource_record_sets(
            HostedZoneId=self.hosted_zone_id,
            ChangeBatch={
                'Comment': f'SaaS subdomain for {subdomain}',
                'Changes': [{
                    'Action': 'CREATE',
                    'ResourceRecordSet': {
                        'Name': full_domain,
                        'Type': 'A',
                        'TTL': 300,
                        'ResourceRecords': [{'Value': target_ip}]
                    }
                }]
            }
        )

        return full_domain

    def delete_subdomain(self, subdomain, target_ip):
        """Delete A record for subdomain"""
        route53 = self._get_route53_client()

        full_domain = f"{subdomain}.{self.base_domain}"

        route53.change_resource_record_sets(
            HostedZoneId=self.hosted_zone_id,
            ChangeBatch={
                'Changes': [{
                    'Action': 'DELETE',
                    'ResourceRecordSet': {
                        'Name': full_domain,
                        'Type': 'A',
                        'TTL': 300,
                        'ResourceRecords': [{'Value': target_ip}]
                    }
                }]
            }
        )

    def create_wildcard_ssl(self):
        """Request wildcard SSL certificate via ACM"""
        acm = boto3.client(
            'acm',
            aws_access_key_id=self.aws_access_key,
            aws_secret_access_key=self.aws_secret_key,
            region_name='us-east-1'  # ACM must be in us-east-1 for CloudFront
        )

        response = acm.request_certificate(
            DomainName=f"*.{self.base_domain}",
            ValidationMethod='DNS',
            SubjectAlternativeNames=[
                self.base_domain,
                f"*.{self.base_domain}"
            ]
        )

        return response['CertificateArn']
```

### 5.2 Mailgun Email Integration

```python
import requests

class SaasMailgun(models.Model):
    _name = 'saas.mailgun'
    _description = 'Mailgun Email Integration'

    name = fields.Char('Configuration Name', required=True)

    api_key = fields.Char('API Key', required=True)
    domain = fields.Char('Sending Domain', required=True)
    # e.g., 'mail.yoursaas.com'

    from_email = fields.Char('From Email', default='noreply@yoursaas.com')
    from_name = fields.Char('From Name', default='Your SaaS')

    def send_email(self, to, subject, template, variables=None):
        """Send email via Mailgun"""
        variables = variables or {}

        response = requests.post(
            f"https://api.mailgun.net/v3/{self.domain}/messages",
            auth=("api", self.api_key),
            data={
                "from": f"{self.from_name} <{self.from_email}>",
                "to": to,
                "subject": subject,
                "template": template,
                "h:X-Mailgun-Variables": json.dumps(variables)
            }
        )

        if response.status_code != 200:
            raise UserError(f"Email failed: {response.text}")

        return response.json()

    def send_welcome_email(self, client):
        """Send welcome email to new client"""
        return self.send_email(
            to=client.admin_email,
            subject=f"Welcome to {self.from_name}!",
            template="welcome",
            variables={
                "client_name": client.name,
                "login_url": f"https://{client.domain}.{self.env['saas.dns.route53'].search([], limit=1).base_domain}",
                "plan_name": client.plan_id.name,
            }
        )

    def send_expiration_warning(self, client, days_left):
        """Send subscription expiration warning"""
        return self.send_email(
            to=client.admin_email,
            subject=f"Your subscription expires in {days_left} days",
            template="expiration_warning",
            variables={
                "client_name": client.name,
                "days_left": days_left,
                "renewal_url": f"https://portal.yoursaas.com/renew/{client.id}",
            }
        )

    def send_invoice(self, subscription, invoice):
        """Send invoice notification"""
        return self.send_email(
            to=subscription.partner_id.email,
            subject=f"Invoice {invoice.name} from {self.from_name}",
            template="invoice",
            variables={
                "invoice_number": invoice.name,
                "amount": invoice.amount_total,
                "currency": invoice.currency_id.symbol,
                "payment_url": invoice.get_portal_url(),
            }
        )
```

---

## Section 6: Portal Management

### 6.1 Client Self-Service Portal Controller

```python
from odoo import http
from odoo.http import request

class SaasPortalController(http.Controller):

    @http.route('/my/saas', type='http', auth='user', website=True)
    def portal_saas_home(self, **kw):
        """Client dashboard"""
        client = request.env['saas.client'].sudo().search([
            ('partner_id', '=', request.env.user.partner_id.id)
        ], limit=1)

        if not client:
            return request.redirect('/my')

        subscription = request.env['saas.subscription'].sudo().search([
            ('client_id', '=', client.id),
            ('state', '=', 'active')
        ], limit=1)

        values = {
            'client': client,
            'subscription': subscription,
            'usage': {
                'users': client.current_users,
                'users_max': client.max_users,
                'storage': client.current_storage_mb,
                'storage_max': client.max_storage_mb,
            },
            'invoices': request.env['account.move'].sudo().search([
                ('partner_id', '=', request.env.user.partner_id.id),
                ('saas_subscription_id', '!=', False)
            ], order='date desc', limit=5)
        }

        return request.render('saas_portal.portal_dashboard', values)

    @http.route('/my/saas/plans', type='http', auth='user', website=True)
    def portal_plans(self, **kw):
        """Available plans for upgrade"""
        plans = request.env['saas.plan'].sudo().search([])

        current_client = request.env['saas.client'].sudo().search([
            ('partner_id', '=', request.env.user.partner_id.id)
        ], limit=1)

        return request.render('saas_portal.portal_plans', {
            'plans': plans,
            'current_plan': current_client.plan_id if current_client else None,
        })

    @http.route('/my/saas/upgrade', type='http', auth='user', website=True, methods=['POST'])
    def portal_upgrade(self, plan_id, **kw):
        """Process plan upgrade"""
        plan = request.env['saas.plan'].sudo().browse(int(plan_id))

        client = request.env['saas.client'].sudo().search([
            ('partner_id', '=', request.env.user.partner_id.id)
        ], limit=1)

        if not client or not plan:
            return request.redirect('/my/saas?error=invalid')

        # Create upgrade order
        subscription = request.env['saas.subscription'].sudo().search([
            ('client_id', '=', client.id),
            ('state', '=', 'active')
        ], limit=1)

        if subscription:
            # Prorate and upgrade
            subscription.plan_id = plan.id
            subscription._generate_invoice()  # Prorated invoice

        return request.redirect('/my/saas?success=upgraded')

    @http.route('/signup/saas', type='http', auth='public', website=True)
    def signup_page(self, **kw):
        """New client signup page"""
        plans = request.env['saas.plan'].sudo().search([])
        return request.render('saas_portal.signup_page', {'plans': plans})

    @http.route('/signup/saas/process', type='http', auth='public', website=True, methods=['POST'])
    def signup_process(self, name, email, subdomain, plan_id, **kw):
        """Process new signup"""
        # Validate subdomain availability
        existing = request.env['saas.client'].sudo().search([
            ('domain', '=', subdomain)
        ])

        if existing:
            return request.redirect(f'/signup/saas?error=subdomain_taken&subdomain={subdomain}')

        # Create partner
        partner = request.env['res.partner'].sudo().create({
            'name': name,
            'email': email,
        })

        # Create client
        plan = request.env['saas.plan'].sudo().browse(int(plan_id))

        client = request.env['saas.client'].sudo().create({
            'name': name,
            'domain': subdomain,
            'plan_id': plan.id,
            'partner_id': partner.id,
        })

        # Create subscription
        subscription = request.env['saas.subscription'].sudo().create({
            'client_id': client.id,
            'plan_id': plan.id,
            'billing_period': 'monthly',
        })

        # Generate first invoice (trial or paid)
        subscription.action_activate()

        # Send welcome email
        request.env['saas.mailgun'].sudo().search([], limit=1).send_welcome_email(client)

        return request.redirect(f'/signup/saas/success?domain={subdomain}')
```

### 6.2 Portal Templates

```xml
<!-- views/portal_templates.xml -->
<odoo>
    <template id="portal_dashboard" name="SaaS Dashboard">
        <t t-call="website.layout">
            <div class="container py-4">
                <h1>Your SaaS Dashboard</h1>

                <!-- Status Card -->
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">
                            <t t-esc="client.name"/>
                            <span t-attf-class="badge bg-#{client.state == 'active' and 'success' or 'warning'}">
                                <t t-esc="client.state"/>
                            </span>
                        </h5>
                        <p class="card-text">
                            Domain: <a t-attf-href="https://#{client.domain}" target="_blank">
                                <t t-esc="client.domain"/>
                            </a>
                        </p>
                        <p class="card-text">
                            Plan: <strong><t t-esc="subscription.plan_id.name"/></strong>
                        </p>
                    </div>
                </div>

                <!-- Usage Stats -->
                <div class="row">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-body">
                                <h5>Users</h5>
                                <div class="progress">
                                    <div class="progress-bar"
                                         t-attf-style="width: #{int(usage['users'] / usage['users_max'] * 100)}%">
                                    </div>
                                </div>
                                <small><t t-esc="usage['users']"/> / <t t-esc="usage['users_max']"/></small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-body">
                                <h5>Storage</h5>
                                <div class="progress">
                                    <div class="progress-bar"
                                         t-attf-style="width: #{int(usage['storage'] / usage['storage_max'] * 100)}%">
                                    </div>
                                </div>
                                <small><t t-esc="int(usage['storage'])"/> MB / <t t-esc="usage['storage_max']"/> MB</small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Invoices -->
                <div class="card mt-4">
                    <div class="card-header">Recent Invoices</div>
                    <ul class="list-group list-group-flush">
                        <t t-foreach="invoices" t-as="invoice">
                            <li class="list-group-item d-flex justify-content-between">
                                <span><t t-esc="invoice.name"/></span>
                                <span><t t-esc="invoice.amount_total"/> <t t-esc="invoice.currency_id.symbol"/></span>
                                <a t-att-href="invoice.get_portal_url()">View</a>
                            </li>
                        </t>
                    </ul>
                </div>
            </div>
        </t>
    </template>
</odoo>
```

---

## Docker Deployment

### docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: postgres:16
    container_name: saas-db
    environment:
      POSTGRES_USER: odoo
      POSTGRES_PASSWORD: odoo_secure_password
      POSTGRES_DB: postgres
    volumes:
      - saas-db-data:/var/lib/postgresql/data
    networks:
      - saas-network

  odoo:
    image: odoo:17.0
    container_name: saas-odoo
    depends_on:
      - db
    environment:
      HOST: db
      USER: odoo
      PASSWORD: odoo_secure_password
    volumes:
      - saas-odoo-data:/var/lib/odoo
      - ./addons:/mnt/extra-addons
      - ./config/odoo.conf:/etc/odoo/odoo.conf:ro
    networks:
      - saas-network

  nginx:
    image: nginx:alpine
    container_name: saas-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - odoo
    networks:
      - saas-network

networks:
  saas-network:
    driver: bridge

volumes:
  saas-db-data:
  saas-odoo-data:
```

---

## Integration avec ULTRA-CREATE

### Keywords pour tool-registry.yaml

```yaml
"saas odoo":
  agent: odoo-expert
  knowledge: ["knowledge/odoo/odoo-saas-guide.md"]

"multi-tenant odoo":
  agent: odoo-expert
  knowledge: ["knowledge/odoo/odoo-saas-guide.md#section-1"]

"oauth odoo":
  agent: odoo-integration-expert
  knowledge: ["knowledge/odoo/odoo-saas-guide.md#section-2"]

"subscription odoo":
  agent: odoo-expert
  knowledge: ["knowledge/odoo/odoo-saas-guide.md#section-3"]

"backup s3 odoo":
  agent: odoo-expert
  knowledge: ["knowledge/odoo/odoo-saas-guide.md#section-4"]

"route53 odoo":
  agent: odoo-integration-expert
  knowledge: ["knowledge/odoo/odoo-saas-guide.md#section-5"]

"mailgun odoo":
  agent: odoo-integration-expert
  knowledge: ["knowledge/odoo/odoo-saas-guide.md#section-5"]
```

---

*ULTRA-CREATE Odoo SaaS Guide v24.1 - 27 Decembre 2025*
*Source: it-projects-llc/odoo-saas-tools (613 stars)*
