# Odoo Security Guide

## Vue d'ensemble

Guide complet pour sécuriser les applications Odoo v19 : contrôle d'accès, OWASP, authentification, et bonnes pratiques.

---

## 1. Contrôle d'Accès (ACL)

### Fichier ir.model.access.csv

```csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_my_model_user,my.model.user,model_my_model,my_module.group_user,1,0,0,0
access_my_model_manager,my.model.manager,model_my_model,my_module.group_manager,1,1,1,0
access_my_model_admin,my.model.admin,model_my_model,my_module.group_admin,1,1,1,1
```

### Groupes de Sécurité

```xml
<!-- security/my_module_security.xml -->
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Catégorie -->
    <record id="module_category_my_module" model="ir.module.category">
        <field name="name">My Module</field>
        <field name="sequence">50</field>
    </record>

    <!-- Groupe Utilisateur -->
    <record id="group_user" model="res.groups">
        <field name="name">User</field>
        <field name="category_id" ref="module_category_my_module"/>
        <field name="implied_ids" eval="[(4, ref('base.group_user'))]"/>
    </record>

    <!-- Groupe Manager (hérite de User) -->
    <record id="group_manager" model="res.groups">
        <field name="name">Manager</field>
        <field name="category_id" ref="module_category_my_module"/>
        <field name="implied_ids" eval="[(4, ref('group_user'))]"/>
    </record>

    <!-- Groupe Admin (hérite de Manager) -->
    <record id="group_admin" model="res.groups">
        <field name="name">Administrator</field>
        <field name="category_id" ref="module_category_my_module"/>
        <field name="implied_ids" eval="[(4, ref('group_manager'))]"/>
        <field name="users" eval="[(4, ref('base.user_root')), (4, ref('base.user_admin'))]"/>
    </record>
</odoo>
```

### Record Rules

```xml
<!-- security/my_module_security.xml -->
<odoo>
    <!-- Règle: Utilisateurs voient leurs propres enregistrements -->
    <record id="rule_my_model_user_own" model="ir.rule">
        <field name="name">My Model: User sees own records</field>
        <field name="model_id" ref="model_my_model"/>
        <field name="domain_force">[('user_id', '=', user.id)]</field>
        <field name="groups" eval="[(4, ref('group_user'))]"/>
        <field name="perm_read" eval="True"/>
        <field name="perm_write" eval="True"/>
        <field name="perm_create" eval="True"/>
        <field name="perm_unlink" eval="False"/>
    </record>

    <!-- Règle: Managers voient tout de leur company -->
    <record id="rule_my_model_manager_company" model="ir.rule">
        <field name="name">My Model: Manager sees company records</field>
        <field name="model_id" ref="model_my_model"/>
        <field name="domain_force">[('company_id', 'in', company_ids)]</field>
        <field name="groups" eval="[(4, ref('group_manager'))]"/>
        <field name="perm_read" eval="True"/>
        <field name="perm_write" eval="True"/>
        <field name="perm_create" eval="True"/>
        <field name="perm_unlink" eval="True"/>
    </record>

    <!-- Règle: Multi-company -->
    <record id="rule_my_model_multi_company" model="ir.rule">
        <field name="name">My Model: Multi-company</field>
        <field name="model_id" ref="model_my_model"/>
        <field name="domain_force">
            ['|', ('company_id', '=', False), ('company_id', 'in', company_ids)]
        </field>
        <field name="global" eval="True"/>
    </record>
</odoo>
```

---

## 2. Validation des Données

### Contraintes Python

```python
from odoo import models, fields, api
from odoo.exceptions import ValidationError, UserError
import re


class SecureModel(models.Model):
    _name = 'secure.model'
    _description = 'Secure Model'

    email = fields.Char(string='Email')
    phone = fields.Char(string='Phone')
    amount = fields.Float(string='Amount')
    reference = fields.Char(string='Reference')
    content = fields.Html(string='Content', sanitize=True)  # Sanitize HTML

    @api.constrains('email')
    def _check_email(self):
        """Valide le format email"""
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        for record in self:
            if record.email and not re.match(email_pattern, record.email):
                raise ValidationError("Invalid email format!")

    @api.constrains('phone')
    def _check_phone(self):
        """Valide le format téléphone"""
        phone_pattern = r'^\+?[0-9]{10,15}$'
        for record in self:
            if record.phone:
                clean_phone = re.sub(r'[\s\-\.]', '', record.phone)
                if not re.match(phone_pattern, clean_phone):
                    raise ValidationError("Invalid phone format!")

    @api.constrains('amount')
    def _check_amount(self):
        """Valide les montants"""
        for record in self:
            if record.amount < 0:
                raise ValidationError("Amount cannot be negative!")
            if record.amount > 1000000:
                raise ValidationError("Amount exceeds maximum limit!")

    @api.constrains('reference')
    def _check_reference(self):
        """Valide la référence (pas de caractères spéciaux)"""
        for record in self:
            if record.reference:
                if not re.match(r'^[A-Z0-9\-]+$', record.reference):
                    raise ValidationError(
                        "Reference can only contain uppercase letters, numbers and dashes!"
                    )

    @api.model_create_multi
    def create(self, vals_list):
        """Sanitize inputs on create"""
        for vals in vals_list:
            self._sanitize_vals(vals)
        return super().create(vals_list)

    def write(self, vals):
        """Sanitize inputs on write"""
        self._sanitize_vals(vals)
        return super().write(vals)

    def _sanitize_vals(self, vals):
        """Nettoie les valeurs entrantes"""
        # Strip whitespace
        for field in ['email', 'phone', 'reference']:
            if field in vals and vals[field]:
                vals[field] = vals[field].strip()

        # Lowercase email
        if vals.get('email'):
            vals['email'] = vals['email'].lower()

        # Remove non-digits from phone
        if vals.get('phone'):
            vals['phone'] = re.sub(r'[^\d+]', '', vals['phone'])
```

### Contraintes SQL

```python
class SecureModel(models.Model):
    _name = 'secure.model'

    _sql_constraints = [
        ('reference_unique', 'UNIQUE(reference)',
         'Reference must be unique!'),
        ('email_unique', 'UNIQUE(email)',
         'This email is already registered!'),
        ('amount_positive', 'CHECK(amount >= 0)',
         'Amount must be positive!'),
    ]
```

---

## 3. Protection OWASP Top 10

### A01 - Broken Access Control

```python
class SecureController(http.Controller):

    @http.route('/api/document/<int:doc_id>', auth='user')
    def get_document(self, doc_id, **kwargs):
        """Accès sécurisé aux documents"""
        document = request.env['my.document'].browse(doc_id)

        # TOUJOURS vérifier les droits
        if not document.exists():
            raise NotFound()

        # Vérifier que l'utilisateur a accès
        document.check_access_rights('read')
        document.check_access_rule('read')

        return document.read()[0]

    @http.route('/api/user/<int:user_id>/data', auth='user')
    def get_user_data(self, user_id, **kwargs):
        """Éviter IDOR (Insecure Direct Object Reference)"""
        # Vérifier que l'utilisateur demande ses propres données
        if user_id != request.env.uid:
            raise AccessDenied()

        return request.env['res.users'].browse(user_id).read()[0]
```

### A02 - Cryptographic Failures

```python
from odoo import models, fields
from cryptography.fernet import Fernet
import hashlib
import secrets
import base64


class SecureData(models.Model):
    _name = 'secure.data'

    # Données sensibles - NE PAS stocker en clair
    _encrypted_data = fields.Binary(string='Encrypted Data')
    data_hash = fields.Char(string='Data Hash')

    def _get_encryption_key(self):
        """Récupère la clé de chiffrement depuis les paramètres système"""
        key = self.env['ir.config_parameter'].sudo().get_param(
            'secure_data.encryption_key'
        )
        if not key:
            # Générer et stocker une nouvelle clé
            key = Fernet.generate_key().decode()
            self.env['ir.config_parameter'].sudo().set_param(
                'secure_data.encryption_key', key
            )
        return key.encode()

    def encrypt_data(self, data):
        """Chiffre les données"""
        f = Fernet(self._get_encryption_key())
        encrypted = f.encrypt(data.encode())
        return base64.b64encode(encrypted)

    def decrypt_data(self):
        """Déchiffre les données"""
        if not self._encrypted_data:
            return None
        f = Fernet(self._get_encryption_key())
        decrypted = f.decrypt(base64.b64decode(self._encrypted_data))
        return decrypted.decode()

    def hash_password(self, password):
        """Hash sécurisé de mot de passe"""
        salt = secrets.token_hex(32)
        hash_obj = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode(),
            salt.encode(),
            100000  # iterations
        )
        return f"{salt}${hash_obj.hex()}"

    def verify_password(self, password, stored_hash):
        """Vérifie un mot de passe hashé"""
        salt, hash_value = stored_hash.split('$')
        new_hash = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode(),
            salt.encode(),
            100000
        )
        return secrets.compare_digest(new_hash.hex(), hash_value)
```

### A03 - Injection

```python
class SafeQueries(models.Model):
    _name = 'safe.queries'

    def search_by_name_UNSAFE(self, name):
        """DANGEREUX - Injection SQL possible"""
        # NE JAMAIS FAIRE CECI
        self.env.cr.execute(f"SELECT * FROM my_table WHERE name = '{name}'")

    def search_by_name_SAFE(self, name):
        """Sécurisé - Requête paramétrée"""
        self.env.cr.execute(
            "SELECT * FROM my_table WHERE name = %s",
            [name]
        )
        return self.env.cr.fetchall()

    def search_by_domain_SAFE(self, search_term):
        """Utiliser l'ORM quand possible"""
        # L'ORM échappe automatiquement
        return self.search([('name', 'ilike', search_term)])

    def build_dynamic_query_SAFE(self, filters):
        """Construction dynamique sécurisée"""
        query = "SELECT id, name FROM my_table WHERE 1=1"
        params = []

        if filters.get('name'):
            query += " AND name = %s"
            params.append(filters['name'])

        if filters.get('date_from'):
            query += " AND date >= %s"
            params.append(filters['date_from'])

        if filters.get('ids'):
            query += " AND id = ANY(%s)"
            params.append(filters['ids'])

        self.env.cr.execute(query, params)
        return self.env.cr.fetchall()
```

### A04 - Insecure Design

```python
class SecureWorkflow(models.Model):
    _name = 'secure.workflow'

    state = fields.Selection([
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ], default='draft')

    def action_submit(self):
        """Workflow sécurisé avec vérifications"""
        self.ensure_one()

        # Vérifier l'état actuel
        if self.state != 'draft':
            raise UserError("Can only submit from draft state!")

        # Vérifier les permissions
        if not self.env.user.has_group('my_module.group_user'):
            raise AccessDenied("You don't have permission to submit!")

        # Vérifier les données requises
        if not self._validate_for_submission():
            raise ValidationError("Missing required data!")

        self.write({'state': 'submitted'})
        self._notify_approvers()

    def action_approve(self):
        """Approbation avec vérification de séparation des tâches"""
        self.ensure_one()

        if self.state != 'submitted':
            raise UserError("Can only approve submitted documents!")

        # Séparation des tâches: ne peut pas approuver son propre document
        if self.create_uid == self.env.user:
            raise AccessDenied("You cannot approve your own document!")

        # Vérifier le groupe approbateur
        if not self.env.user.has_group('my_module.group_approver'):
            raise AccessDenied("You don't have approval rights!")

        self.write({
            'state': 'approved',
            'approved_by': self.env.user.id,
            'approved_date': fields.Datetime.now(),
        })
```

### A05 - Security Misconfiguration

```python
# Configuration sécurisée dans odoo.conf
"""
[options]
; Désactiver la liste des bases
list_db = False

; Mode proxy obligatoire en production
proxy_mode = True

; Admin password fort
admin_passwd = $pbkdf2-sha512$...

; Logs sécurisés (pas de données sensibles)
log_level = warn
log_handler = :WARNING

; Limites de requêtes
limit_request = 8192
limit_memory_hard = 2684354560
limit_time_cpu = 600
limit_time_real = 1200

; Désactiver les fonctions de démo
without_demo = all
"""


class SecuritySettings(models.TransientModel):
    _inherit = 'res.config.settings'

    def _check_security_settings(self):
        """Vérifie la configuration de sécurité"""
        warnings = []

        # Vérifier list_db
        if tools.config.get('list_db', True):
            warnings.append("list_db should be disabled in production")

        # Vérifier proxy_mode
        if not tools.config.get('proxy_mode'):
            warnings.append("proxy_mode should be enabled behind a reverse proxy")

        # Vérifier admin_passwd
        admin_pwd = tools.config.get('admin_passwd')
        if admin_pwd == 'admin' or len(admin_pwd or '') < 16:
            warnings.append("admin_passwd is weak or default")

        return warnings
```

### A06 - Vulnerable Components

```python
# Vérifier les dépendances dans requirements.txt
"""
# Fixer les versions et vérifier régulièrement
odoo>=17.0,<18.0
psycopg2-binary>=2.9.9
Werkzeug>=2.3.0
cryptography>=41.0.0

# Scan de vulnérabilités
# pip install safety
# safety check -r requirements.txt
"""

# Script de vérification des modules
class ModuleSecurity(models.Model):
    _name = 'module.security'

    @api.model
    def check_installed_modules(self):
        """Vérifie les modules installés"""
        warnings = []
        dangerous_modules = ['base_import_module']  # Modules à éviter en prod

        installed = self.env['ir.module.module'].search([
            ('state', '=', 'installed'),
        ])

        for module in installed:
            if module.name in dangerous_modules:
                warnings.append(f"Dangerous module installed: {module.name}")

            # Vérifier si c'est un module OCA ou officiel
            if not module.author or 'Odoo' not in module.author:
                if 'OCA' not in (module.author or ''):
                    warnings.append(f"Unverified module: {module.name}")

        return warnings
```

### A07 - Authentication Failures

```python
from odoo import http
from odoo.http import request
import time


class SecureAuth:
    # Rate limiting pour login
    _login_attempts = {}  # {ip: [(timestamp, success), ...]}

    @classmethod
    def check_rate_limit(cls, ip):
        """Vérifie les tentatives de connexion"""
        now = time.time()
        window = 300  # 5 minutes
        max_attempts = 5

        # Nettoyer les anciennes tentatives
        attempts = cls._login_attempts.get(ip, [])
        attempts = [(t, s) for t, s in attempts if now - t < window]

        # Compter les échecs récents
        failures = sum(1 for t, s in attempts if not s)

        if failures >= max_attempts:
            return False

        cls._login_attempts[ip] = attempts
        return True

    @classmethod
    def log_attempt(cls, ip, success):
        """Enregistre une tentative de connexion"""
        if ip not in cls._login_attempts:
            cls._login_attempts[ip] = []
        cls._login_attempts[ip].append((time.time(), success))


class SecureLoginController(http.Controller):

    @http.route('/web/login', type='http', auth='none')
    def web_login(self, redirect=None, **kw):
        ip = request.httprequest.remote_addr

        # Rate limiting
        if not SecureAuth.check_rate_limit(ip):
            return request.render('my_module.login_blocked', {
                'message': 'Too many login attempts. Please try again later.',
            })

        # ... logique de login normale ...

        # Logger la tentative
        SecureAuth.log_attempt(ip, success)
```

### A08 - Software and Data Integrity

```python
import hmac
import hashlib


class IntegrityCheck(models.Model):
    _name = 'integrity.check'

    data = fields.Text(string='Data')
    checksum = fields.Char(string='Checksum')

    def _compute_checksum(self, data):
        """Calcule le checksum des données"""
        secret = self.env['ir.config_parameter'].sudo().get_param(
            'integrity.secret_key'
        )
        return hmac.new(
            secret.encode(),
            data.encode(),
            hashlib.sha256
        ).hexdigest()

    @api.model_create_multi
    def create(self, vals_list):
        """Ajoute le checksum à la création"""
        for vals in vals_list:
            if vals.get('data'):
                vals['checksum'] = self._compute_checksum(vals['data'])
        return super().create(vals_list)

    def verify_integrity(self):
        """Vérifie l'intégrité des données"""
        self.ensure_one()
        expected = self._compute_checksum(self.data)
        return hmac.compare_digest(self.checksum, expected)

    @api.model
    def verify_all(self):
        """Vérifie l'intégrité de tous les enregistrements"""
        corrupted = []
        for record in self.search([]):
            if not record.verify_integrity():
                corrupted.append(record.id)
        return corrupted
```

### A09 - Security Logging

```python
import logging
from odoo import models, api

_logger = logging.getLogger(__name__)


class SecurityAudit(models.Model):
    _name = 'security.audit'
    _description = 'Security Audit Log'

    event_type = fields.Selection([
        ('login_success', 'Login Success'),
        ('login_failure', 'Login Failure'),
        ('access_denied', 'Access Denied'),
        ('data_export', 'Data Export'),
        ('sensitive_read', 'Sensitive Data Read'),
        ('admin_action', 'Admin Action'),
        ('security_change', 'Security Change'),
    ], string='Event Type', required=True)

    user_id = fields.Many2one('res.users', string='User')
    ip_address = fields.Char(string='IP Address')
    resource = fields.Char(string='Resource')
    details = fields.Text(string='Details')
    severity = fields.Selection([
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('critical', 'Critical'),
    ], string='Severity', default='info')

    @api.model
    def log_event(self, event_type, resource=None, details=None, severity='info'):
        """Enregistre un événement de sécurité"""
        return self.sudo().create({
            'event_type': event_type,
            'user_id': self.env.uid,
            'ip_address': request.httprequest.remote_addr if request else None,
            'resource': resource,
            'details': details,
            'severity': severity,
        })


# Mixin pour audit automatique
class AuditMixin(models.AbstractModel):
    _name = 'audit.mixin'

    @api.model_create_multi
    def create(self, vals_list):
        records = super().create(vals_list)
        self._log_audit('create', records)
        return records

    def write(self, vals):
        self._log_audit('write', self, vals)
        return super().write(vals)

    def unlink(self):
        self._log_audit('unlink', self)
        return super().unlink()

    def _log_audit(self, operation, records, vals=None):
        """Log des opérations pour audit"""
        _logger.info(
            f"AUDIT: {operation} on {self._name} by user {self.env.uid}, "
            f"records: {records.ids}, vals: {vals}"
        )
```

### A10 - Server-Side Request Forgery (SSRF)

```python
import requests
from urllib.parse import urlparse
import ipaddress


class SafeHTTPClient:
    """Client HTTP sécurisé contre SSRF"""

    # Liste blanche de domaines autorisés
    ALLOWED_DOMAINS = [
        'api.stripe.com',
        'api.paypal.com',
        'hooks.slack.com',
    ]

    # Plages IP interdites
    BLOCKED_RANGES = [
        ipaddress.ip_network('10.0.0.0/8'),
        ipaddress.ip_network('172.16.0.0/12'),
        ipaddress.ip_network('192.168.0.0/16'),
        ipaddress.ip_network('127.0.0.0/8'),
        ipaddress.ip_network('169.254.0.0/16'),
    ]

    @classmethod
    def is_safe_url(cls, url):
        """Vérifie si l'URL est sûre"""
        try:
            parsed = urlparse(url)

            # HTTPS obligatoire
            if parsed.scheme != 'https':
                return False

            # Vérifier le domaine
            if parsed.hostname not in cls.ALLOWED_DOMAINS:
                # Résoudre l'IP et vérifier
                import socket
                ip = socket.gethostbyname(parsed.hostname)
                ip_obj = ipaddress.ip_address(ip)

                for blocked in cls.BLOCKED_RANGES:
                    if ip_obj in blocked:
                        return False

            return True

        except Exception:
            return False

    @classmethod
    def safe_request(cls, method, url, **kwargs):
        """Effectue une requête HTTP sécurisée"""
        if not cls.is_safe_url(url):
            raise ValueError(f"URL not allowed: {url}")

        # Timeout obligatoire
        kwargs.setdefault('timeout', 30)

        # Pas de redirections vers des URL non sûres
        kwargs.setdefault('allow_redirects', False)

        return requests.request(method, url, **kwargs)
```

---

## 4. Checklist Sécurité

```markdown
## Contrôle d'Accès
- [ ] ACL définis pour tous les modèles
- [ ] Record rules pour filtrage multi-company
- [ ] Groupes de sécurité hiérarchiques
- [ ] check_access_rights/check_access_rule dans controllers

## Validation
- [ ] Contraintes Python sur données sensibles
- [ ] Contraintes SQL pour intégrité
- [ ] Sanitization des inputs HTML
- [ ] Validation des formats (email, phone, etc.)

## Authentification
- [ ] Rate limiting sur login
- [ ] Mots de passe forts requis
- [ ] 2FA activé pour admins
- [ ] Sessions avec timeout

## Configuration
- [ ] list_db = False
- [ ] proxy_mode = True
- [ ] admin_passwd fort
- [ ] HTTPS obligatoire

## Audit
- [ ] Logging des événements de sécurité
- [ ] Monitoring des accès anormaux
- [ ] Revue régulière des permissions
```

---

## 5. Patterns Sécurité Avancés

### 5.1 Dynamic ir.rule (Record Rules)

```xml
<!-- Record rule basique par utilisateur -->
<record id="sale_order_personal_rule" model="ir.rule">
    <field name="name">Personal Orders Only</field>
    <field name="model_id" ref="sale.model_sale_order"/>
    <field name="domain_force">[('user_id', '=', user.id)]</field>
    <field name="groups" eval="[(4, ref('sales_team.group_sale_salesman'))]"/>
    <field name="perm_read" eval="True"/>
    <field name="perm_write" eval="True"/>
    <field name="perm_create" eval="True"/>
    <field name="perm_unlink" eval="False"/>
</record>

<!-- Record rule multi-company -->
<record id="sale_order_company_rule" model="ir.rule">
    <field name="name">Multi-Company Orders</field>
    <field name="model_id" ref="sale.model_sale_order"/>
    <field name="domain_force">[
        '|',
        ('company_id', '=', False),
        ('company_id', 'in', company_ids)
    ]</field>
    <field name="groups" eval="[(4, ref('base.group_user'))]"/>
</record>

<!-- Record rule combinée (manager voit tout son équipe) -->
<record id="sale_order_team_rule" model="ir.rule">
    <field name="name">Team Manager Access</field>
    <field name="model_id" ref="sale.model_sale_order"/>
    <field name="domain_force">[
        '|',
        ('user_id', '=', user.id),
        ('team_id.user_id', '=', user.id)
    ]</field>
    <field name="groups" eval="[(4, ref('sales_team.group_sale_manager'))]"/>
</record>
```

### 5.2 Override check_access_rights

```python
from odoo import models
from odoo.exceptions import AccessError

class RestrictedModel(models.Model):
    _name = 'restricted.model'
    _description = 'Modèle avec accès restreint'

    def check_access_rights(self, operation, raise_exception=True):
        """Override pour restrictions personnalisées"""
        # Seuls les admins peuvent supprimer
        if operation == 'unlink':
            if not self.env.user.has_group('base.group_system'):
                if raise_exception:
                    raise AccessError(
                        "Seuls les administrateurs peuvent supprimer ces enregistrements"
                    )
                return False

        # Appeler la méthode parente pour les autres opérations
        return super().check_access_rights(operation, raise_exception)

    def check_access_rule(self, operation):
        """Override pour règles d'accès par enregistrement"""
        super().check_access_rule(operation)

        # Vérification supplémentaire: ne pas modifier les enregistrements verrouillés
        if operation in ('write', 'unlink'):
            locked = self.filtered(lambda r: r.is_locked)
            if locked:
                raise AccessError(
                    f"Les enregistrements {locked.mapped('name')} sont verrouillés"
                )


class ConfidentialData(models.Model):
    _name = 'confidential.data'
    _description = 'Données Confidentielles'

    def _check_confidential_access(self):
        """Vérifier accès aux données confidentielles"""
        if not self.env.user.has_group('module.group_confidential_access'):
            raise AccessError("Accès aux données confidentielles refusé")

    def read(self, fields=None, load='_classic_read'):
        """Restreindre la lecture"""
        if fields and 'confidential_field' in fields:
            self._check_confidential_access()
        return super().read(fields, load)

    def write(self, vals):
        """Restreindre l'écriture"""
        if 'confidential_field' in vals:
            self._check_confidential_access()
        return super().write(vals)
```

### 5.3 Field-Level Security avec groups=

```python
from odoo import fields, models

class Employee(models.Model):
    _name = 'hr.employee'
    _description = 'Employé'

    name = fields.Char('Nom')  # Visible par tous

    # Champs visibles uniquement par HR
    salary = fields.Float(
        'Salaire',
        groups='hr.group_hr_manager'
    )

    social_security_number = fields.Char(
        'Numéro SS',
        groups='hr.group_hr_user'
    )

    # Champs visibles par plusieurs groupes
    performance_rating = fields.Float(
        'Note Performance',
        groups='hr.group_hr_manager,hr.group_hr_user'
    )

    # Champs confidentiels (admins seulement)
    medical_info = fields.Text(
        'Informations Médicales',
        groups='base.group_system'
    )

    # Lecture seule pour certains groupes via readonly
    bank_account = fields.Char(
        'Compte Bancaire',
        groups='hr.group_hr_user'
    )
```

### 5.4 sudo() Sécurisé

```python
from odoo import models, api
from odoo.exceptions import AccessError

class SecureModel(models.Model):
    _name = 'secure.model'

    def action_with_sudo(self):
        """Utilisation sécurisée de sudo()"""
        # MAUVAIS: sudo() sans contrôle
        # self.sudo().write({'field': value})

        # BON: Vérifier d'abord les permissions
        self.check_access_rights('write')
        self.check_access_rule('write')

        # Puis utiliser sudo() pour une opération spécifique
        self.sudo().message_post(body="Action effectuée")

        # Revenir immédiatement au contexte normal
        return True

    def safe_sudo_search(self, domain):
        """Recherche sécurisée avec sudo()"""
        # Rechercher avec les droits de l'utilisateur
        allowed_ids = self.search(domain).ids

        # Puis lire les données en sudo si nécessaire
        return self.sudo().browse(allowed_ids)

    @api.model
    def _get_system_value(self):
        """Lecture valeur système (lecture seule)"""
        # OK pour lecture seule de config
        return self.env['ir.config_parameter'].sudo().get_param('key')
```

---

*Guide Sécurité Odoo - ULTRA-CREATE v24.1 - Mis à jour le 27 Décembre 2025*
