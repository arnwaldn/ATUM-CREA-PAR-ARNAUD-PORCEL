# Odoo OCA Server Tools Guide

> Patterns réutilisables depuis OCA/server-tools
> Source: github.com/OCA/server-tools (843+ stars, 51+ modules)
> ULTRA-CREATE v24.1 - 27 Décembre 2025

---

## Vue d'Ensemble

Le dépôt OCA/server-tools contient des outils serveur production-ready pour Odoo. Ce guide documente les 10 patterns les plus utiles pour le développement professionnel.

| Section | Patterns | Use Case |
|---------|----------|----------|
| 1 | Audit Trail, Change Tracking | Traçabilité, RGPD |
| 2 | Exception Management | Règles métier externes |
| 3 | Database Optimization | Maintenance, performance |
| 4 | Fuzzy Search | UX améliorée |
| 5 | Time Window | Planification |
| 6 | Session & Multi-tenancy | SaaS, scalabilité |
| 7 | Error Recovery | Monitoring production |
| 8 | Module Introspection | Audit technique |

---

## Section 1: Audit & Tracking

### 1.1 Audit Trail Pattern (auditlog)

Pattern universel de logging des opérations CRUD via model patching dynamique.

```python
# models/auditlog_rule.py
from odoo import models, fields, api

class AuditlogRule(models.Model):
    _name = 'auditlog.rule'
    _description = 'Audit Log Rule'

    name = fields.Char(required=True)
    model_id = fields.Many2one('ir.model', string='Model', required=True)
    log_type = fields.Selection([
        ('full', 'Full - Log all field values'),
        ('fast', 'Fast - Log only changed fields')
    ], default='full', required=True)
    log_read = fields.Boolean('Log Reads', default=False)
    log_write = fields.Boolean('Log Writes', default=True)
    log_unlink = fields.Boolean('Log Deletes', default=True)
    log_create = fields.Boolean('Log Creates', default=True)
    state = fields.Selection([
        ('draft', 'Draft'),
        ('subscribed', 'Subscribed')
    ], default='draft')

    def subscribe(self):
        """Activate audit logging for this rule"""
        self._register_hook()
        self.state = 'subscribed'

    def _register_hook(self):
        """Patch model CRUD methods dynamically"""
        model = self.env[self.model_id.model]

        # Store original methods
        if not hasattr(model, '_auditlog_original_create'):
            model._auditlog_original_create = model.create
            model._auditlog_original_write = model.write
            model._auditlog_original_unlink = model.unlink

        # Wrap methods
        def create_with_audit(vals_list):
            records = model._auditlog_original_create(vals_list)
            self._log_operation('create', records, vals_list)
            return records

        def write_with_audit(self_records, vals):
            old_values = self._get_old_values(self_records, vals.keys())
            result = model._auditlog_original_write(self_records, vals)
            self._log_operation('write', self_records, vals, old_values)
            return result

        def unlink_with_audit(self_records):
            self._log_operation('unlink', self_records)
            return model._auditlog_original_unlink(self_records)

        # Apply patches
        model.create = create_with_audit
        model.write = write_with_audit
        model.unlink = unlink_with_audit

    def _log_operation(self, method, records, new_vals=None, old_vals=None):
        """Create audit log entry"""
        for record in records:
            self.env['auditlog.log'].sudo().create({
                'model_id': self.model_id.id,
                'res_id': record.id,
                'method': method,
                'user_id': self.env.uid,
                'log_date': fields.Datetime.now(),
            })


class AuditlogLog(models.Model):
    _name = 'auditlog.log'
    _description = 'Audit Log'
    _order = 'log_date desc'

    model_id = fields.Many2one('ir.model', string='Model', index=True)
    res_id = fields.Integer('Resource ID', index=True)
    method = fields.Selection([
        ('create', 'Create'),
        ('write', 'Write'),
        ('unlink', 'Delete'),
        ('read', 'Read')
    ], required=True)
    user_id = fields.Many2one('res.users', string='User')
    log_date = fields.Datetime('Date', default=fields.Datetime.now)
    line_ids = fields.One2many('auditlog.log.line', 'log_id', string='Changes')


class AuditlogLogLine(models.Model):
    _name = 'auditlog.log.line'
    _description = 'Audit Log Line'

    log_id = fields.Many2one('auditlog.log', ondelete='cascade')
    field_id = fields.Many2one('ir.model.fields', string='Field')
    field_name = fields.Char('Field Name')
    old_value = fields.Text('Old Value')
    new_value = fields.Text('New Value')
```

**Use cases**: Conformité RGPD, audit sécurité, historique modifications

---

### 1.2 Change Tracking Pattern (tracking_manager)

Pattern de subscription aux changements de champs avec callbacks.

```python
# models/tracking_field.py
from odoo import models, fields, api

class TrackingField(models.Model):
    _name = 'tracking.field'
    _description = 'Field Change Tracking'

    name = fields.Char(compute='_compute_name', store=True)
    model_id = fields.Many2one('ir.model', required=True, ondelete='cascade')
    field_id = fields.Many2one('ir.model.fields', required=True, ondelete='cascade')
    callback_model = fields.Char('Callback Model')
    callback_method = fields.Char('Callback Method')
    active = fields.Boolean(default=True)

    @api.depends('model_id', 'field_id')
    def _compute_name(self):
        for rec in self:
            rec.name = f"{rec.model_id.model}.{rec.field_id.name}"

    def notify_change(self, record, old_value, new_value):
        """Notifie les subscribers du changement"""
        if self.callback_model and self.callback_method:
            callback_model = self.env[self.callback_model]
            if hasattr(callback_model, self.callback_method):
                getattr(callback_model, self.callback_method)(
                    record,
                    self.field_id.name,
                    old_value,
                    new_value
                )

    @api.model
    def get_tracked_fields(self, model_name):
        """Retourne les champs trackés pour un modèle"""
        return self.search([
            ('model_id.model', '=', model_name),
            ('active', '=', True)
        ])


class TrackingMixin(models.AbstractModel):
    _name = 'tracking.mixin'
    _description = 'Tracking Mixin'

    def write(self, vals):
        """Override write to track field changes"""
        tracking_obj = self.env['tracking.field']
        tracked_fields = tracking_obj.get_tracked_fields(self._name)

        # Capture old values
        old_values = {}
        for tf in tracked_fields:
            if tf.field_id.name in vals:
                old_values[tf.id] = {
                    'tracking': tf,
                    'records': {r.id: r[tf.field_id.name] for r in self}
                }

        result = super().write(vals)

        # Notify changes
        for tf_id, data in old_values.items():
            tf = data['tracking']
            for record in self:
                old_val = data['records'].get(record.id)
                new_val = record[tf.field_id.name]
                if old_val != new_val:
                    tf.notify_change(record, old_val, new_val)

        return result
```

**Use cases**: Synchronisation externe, event-driven architecture, notifications

---

## Section 2: Exception & Validation

### 2.1 Exception Management Pattern (base_exception)

Pattern de gestion des exceptions métier avec règles externalisées.

```python
# models/exception_rule.py
from odoo import models, fields, api
from odoo.exceptions import UserError
from odoo.tools.safe_eval import safe_eval

class ExceptionRule(models.Model):
    _name = 'exception.rule'
    _description = 'Exception Rule'
    _order = 'sequence, id'

    name = fields.Char(required=True, translate=True)
    description = fields.Text(translate=True)
    sequence = fields.Integer(default=10)
    model = fields.Selection([], string='Model')  # Override in subclass
    code = fields.Text('Python Code', required=True,
        help="Python expression returning True if exception applies")
    exception_type = fields.Selection([
        ('warning', 'Warning'),
        ('error', 'Blocking Error')
    ], default='error', required=True)
    active = fields.Boolean(default=True)

    @api.model
    def _get_eval_context(self, record):
        """Context for safe_eval"""
        return {
            'record': record,
            'records': record,
            'env': self.env,
            'user': self.env.user,
            'datetime': __import__('datetime'),
            'time': __import__('time'),
        }

    def _check_exception(self, records):
        """Evaluate exception rules on records"""
        exceptions = []

        for rule in self.search([('model', '=', records._name)], order='sequence'):
            for record in records:
                try:
                    ctx = rule._get_eval_context(record)
                    if safe_eval(rule.code, ctx):
                        if rule.exception_type == 'error':
                            raise UserError(f"Exception: {rule.name}\n{rule.description or ''}")
                        else:
                            exceptions.append({
                                'rule': rule,
                                'record': record,
                                'type': 'warning'
                            })
                except UserError:
                    raise
                except Exception as e:
                    # Log eval error but don't block
                    pass

        return exceptions


# Example: Sale Order Exceptions
class SaleExceptionRule(models.Model):
    _inherit = 'exception.rule'

    model = fields.Selection(
        selection_add=[('sale.order', 'Sale Order')],
        ondelete={'sale.order': 'cascade'}
    )


class SaleOrder(models.Model):
    _inherit = 'sale.order'

    exception_ids = fields.Many2many('exception.rule', string='Exceptions')
    ignore_exceptions = fields.Boolean('Ignore Exceptions')

    def action_confirm(self):
        if not self.ignore_exceptions:
            exceptions = self.env['exception.rule']._check_exception(self)
            if exceptions:
                # Handle warnings
                for exc in exceptions:
                    self.message_post(body=f"Warning: {exc['rule'].name}")
        return super().action_confirm()
```

**Use cases**: Règles métier configurables, validation sans code, compliance

---

## Section 3: Database Optimization

### 3.1 Database Cleanup Pattern (database_cleanup)

Pattern de nettoyage et maintenance de base de données.

```python
# wizard/database_cleanup.py
from odoo import models, fields, api
from datetime import timedelta

class DatabaseCleanupWizard(models.TransientModel):
    _name = 'database.cleanup.wizard'
    _description = 'Database Cleanup Wizard'

    purge_orphan_models = fields.Boolean('Purge Orphan Models')
    purge_unused_columns = fields.Boolean('Purge Unused Columns')
    purge_old_attachments = fields.Boolean('Purge Old Attachments')
    attachment_age_days = fields.Integer('Attachment Age (days)', default=365)
    purge_old_logs = fields.Boolean('Purge Old Logs')
    log_age_days = fields.Integer('Log Age (days)', default=90)
    vacuum_tables = fields.Boolean('Vacuum Tables')

    def cleanup(self):
        """Execute selected cleanup operations"""
        results = []

        if self.purge_orphan_models:
            count = self._purge_orphan_models()
            results.append(f"Purged {count} orphan models")

        if self.purge_unused_columns:
            count = self._purge_unused_columns()
            results.append(f"Purged {count} unused columns")

        if self.purge_old_attachments:
            count = self._purge_old_attachments()
            results.append(f"Purged {count} old attachments")

        if self.purge_old_logs:
            count = self._purge_old_logs()
            results.append(f"Purged {count} old log entries")

        if self.vacuum_tables:
            self._vacuum_tables()
            results.append("Vacuum completed")

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': 'Cleanup Complete',
                'message': '\n'.join(results),
                'type': 'success',
            }
        }

    def _purge_orphan_models(self):
        """Supprime les modèles sans module installé"""
        self.env.cr.execute("""
            DELETE FROM ir_model
            WHERE id NOT IN (
                SELECT DISTINCT res_id
                FROM ir_model_data
                WHERE model = 'ir.model'
                AND module IN (
                    SELECT name FROM ir_module_module
                    WHERE state = 'installed'
                )
            )
            RETURNING id
        """)
        return len(self.env.cr.fetchall())

    def _purge_unused_columns(self):
        """Supprime les colonnes x_ orphelines"""
        count = 0
        for model in self.env['ir.model'].search([]):
            try:
                obj = self.env[model.model]
                table = obj._table

                self.env.cr.execute("""
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_name = %s
                    AND column_name LIKE 'x_%%'
                """, (table,))

                for (col,) in self.env.cr.fetchall():
                    if col not in obj._fields:
                        self.env.cr.execute(f'ALTER TABLE "{table}" DROP COLUMN "{col}"')
                        count += 1
            except Exception:
                continue
        return count

    def _purge_old_attachments(self):
        """Supprime les pièces jointes anciennes"""
        cutoff = fields.Date.today() - timedelta(days=self.attachment_age_days)
        attachments = self.env['ir.attachment'].search([
            ('create_date', '<', cutoff),
            ('res_model', '!=', False),
            ('res_model', 'not in', ['ir.ui.view', 'ir.module.module'])
        ])
        count = len(attachments)
        attachments.unlink()
        return count

    def _purge_old_logs(self):
        """Supprime les anciens logs"""
        cutoff = fields.Date.today() - timedelta(days=self.log_age_days)
        count = 0

        # Audit logs
        if 'auditlog.log' in self.env:
            logs = self.env['auditlog.log'].search([('log_date', '<', cutoff)])
            count += len(logs)
            logs.unlink()

        # HTTP logs
        self.env.cr.execute("""
            DELETE FROM ir_logging WHERE create_date < %s
            RETURNING id
        """, (cutoff,))
        count += len(self.env.cr.fetchall())

        return count

    def _vacuum_tables(self):
        """Vacuum les tables principales"""
        tables = ['ir_attachment', 'mail_message', 'mail_mail', 'ir_logging']
        for table in tables:
            try:
                self.env.cr.execute(f'VACUUM ANALYZE "{table}"')
            except Exception:
                continue
```

**Use cases**: Maintenance base, performance, réduction stockage

---

## Section 4: Search Enhancement

### 4.1 Fuzzy Search Pattern (base_search_fuzzy)

Pattern de recherche floue avec PostgreSQL pg_trgm.

```python
# models/fuzzy_search.py
from odoo import models, fields, api

class FuzzySearchMixin(models.AbstractModel):
    _name = 'fuzzy.search.mixin'
    _description = 'Fuzzy Search Mixin'

    @api.model
    def _register_hook(self):
        """Installe l'extension pg_trgm et les indexes"""
        super()._register_hook()
        self.env.cr.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")

    @api.model
    def fuzzy_search(self, field_name, search_term, threshold=0.3, limit=50):
        """
        Recherche floue sur un champ texte

        :param field_name: Nom du champ à chercher
        :param search_term: Terme de recherche
        :param threshold: Seuil de similarité (0.0 à 1.0)
        :param limit: Nombre max de résultats
        :return: Liste de tuples (id, score)
        """
        if not search_term:
            return []

        query = """
            SELECT id, similarity({field}, %s) as score
            FROM {table}
            WHERE similarity({field}, %s) > %s
            ORDER BY score DESC
            LIMIT %s
        """.format(field=field_name, table=self._table)

        self.env.cr.execute(query, (search_term, search_term, threshold, limit))
        return self.env.cr.fetchall()

    @api.model
    def fuzzy_search_multi(self, fields_list, search_term, threshold=0.3, limit=50):
        """
        Recherche floue sur plusieurs champs

        :param fields_list: Liste des champs à chercher
        :param search_term: Terme de recherche
        :return: Records ordonnés par score
        """
        if not search_term or not fields_list:
            return self.browse()

        # Calcul score combiné
        similarity_parts = " + ".join([
            f"COALESCE(similarity({f}, %s), 0)" for f in fields_list
        ])

        query = f"""
            SELECT id, ({similarity_parts}) / {len(fields_list)} as avg_score
            FROM {self._table}
            WHERE {" OR ".join([f"similarity({f}, %s) > %s" for f in fields_list])}
            ORDER BY avg_score DESC
            LIMIT %s
        """

        params = []
        # Pour similarity_parts
        params.extend([search_term] * len(fields_list))
        # Pour WHERE clause
        for _ in fields_list:
            params.extend([search_term, threshold])
        params.append(limit)

        self.env.cr.execute(query, tuple(params))
        ids = [r[0] for r in self.env.cr.fetchall()]
        return self.browse(ids)

    @api.model
    def create_fuzzy_index(self, field_name):
        """Crée un index GIN pour recherche rapide"""
        index_name = f"{self._table}_{field_name}_trgm_idx"
        self.env.cr.execute(f"""
            CREATE INDEX IF NOT EXISTS {index_name}
            ON {self._table}
            USING gin ({field_name} gin_trgm_ops)
        """)


# Example usage
class ResPartner(models.Model):
    _name = 'res.partner'
    _inherit = ['res.partner', 'fuzzy.search.mixin']

    @api.model
    def search_fuzzy_name(self, name, threshold=0.4):
        """Recherche partenaires par nom avec tolérance typos"""
        results = self.fuzzy_search('name', name, threshold=threshold)
        return self.browse([r[0] for r in results])

    @api.model
    def search_fuzzy_all(self, term):
        """Recherche sur nom, email, téléphone"""
        return self.fuzzy_search_multi(
            ['name', 'email', 'phone'],
            term,
            threshold=0.3
        )
```

**Use cases**: UX améliorée, tolérance typos, recherche intelligente

---

## Section 5: Time & Scheduling

### 5.1 Time Window Pattern (base_time_window)

Mixin pour gérer les fenêtres temporelles (heures d'ouverture, disponibilité).

```python
# models/time_window.py
from odoo import models, fields, api
from datetime import datetime, time

class TimeWindow(models.Model):
    _name = 'time.window'
    _description = 'Time Window'
    _order = 'weekday, time_from'

    name = fields.Char(compute='_compute_name', store=True)
    res_model = fields.Char('Model', required=True, index=True)
    res_id = fields.Integer('Resource ID', required=True, index=True)
    weekday = fields.Selection([
        ('0', 'Monday'),
        ('1', 'Tuesday'),
        ('2', 'Wednesday'),
        ('3', 'Thursday'),
        ('4', 'Friday'),
        ('5', 'Saturday'),
        ('6', 'Sunday')
    ], required=True)
    time_from = fields.Float('From', required=True)
    time_to = fields.Float('To', required=True)

    @api.depends('weekday', 'time_from', 'time_to')
    def _compute_name(self):
        weekday_names = dict(self._fields['weekday'].selection)
        for rec in self:
            from_str = f"{int(rec.time_from)}:{int((rec.time_from % 1) * 60):02d}"
            to_str = f"{int(rec.time_to)}:{int((rec.time_to % 1) * 60):02d}"
            rec.name = f"{weekday_names.get(rec.weekday)} {from_str}-{to_str}"

    @api.constrains('time_from', 'time_to')
    def _check_times(self):
        for rec in self:
            if rec.time_from >= rec.time_to:
                raise ValidationError("End time must be after start time")


class TimeWindowMixin(models.AbstractModel):
    _name = 'time.window.mixin'
    _description = 'Time Window Mixin'

    time_window_ids = fields.One2many(
        'time.window',
        compute='_compute_time_windows',
        inverse='_inverse_time_windows',
        string='Time Windows'
    )

    def _compute_time_windows(self):
        TimeWindow = self.env['time.window']
        for record in self:
            record.time_window_ids = TimeWindow.search([
                ('res_model', '=', self._name),
                ('res_id', '=', record.id)
            ])

    def _inverse_time_windows(self):
        for record in self:
            for tw in record.time_window_ids:
                tw.res_model = self._name
                tw.res_id = record.id

    def is_open_at(self, dt=None):
        """
        Vérifie si ouvert à un moment donné

        :param dt: datetime à vérifier (défaut: maintenant)
        :return: True si dans une fenêtre horaire
        """
        dt = dt or fields.Datetime.now()
        if isinstance(dt, str):
            dt = fields.Datetime.from_string(dt)

        weekday = str(dt.weekday())
        time_of_day = dt.hour + dt.minute / 60.0

        for window in self.time_window_ids:
            if window.weekday == weekday:
                if window.time_from <= time_of_day <= window.time_to:
                    return True
        return False

    def get_next_open_time(self, from_dt=None):
        """
        Trouve la prochaine ouverture

        :param from_dt: datetime de départ
        :return: datetime de prochaine ouverture
        """
        from_dt = from_dt or fields.Datetime.now()
        if isinstance(from_dt, str):
            from_dt = fields.Datetime.from_string(from_dt)

        # Chercher dans les 7 prochains jours
        for day_offset in range(7):
            check_date = from_dt + timedelta(days=day_offset)
            weekday = str(check_date.weekday())

            for window in self.time_window_ids.filtered(
                lambda w: w.weekday == weekday
            ).sorted('time_from'):
                open_time = check_date.replace(
                    hour=int(window.time_from),
                    minute=int((window.time_from % 1) * 60),
                    second=0
                )
                if open_time > from_dt:
                    return open_time

        return None
```

**Use cases**: Heures d'ouverture, disponibilité ressources, planification

---

## Section 6: Session & Multi-tenancy

### 6.1 Session Database Pattern (session_db)

Stockage des sessions HTTP en base de données pour scalabilité horizontale.

```python
# models/http_session.py
import json
from odoo import models, fields, api
from datetime import timedelta

class HttpSession(models.Model):
    _name = 'http.session'
    _description = 'HTTP Session'

    session_id = fields.Char('Session ID', index=True, required=True)
    user_id = fields.Many2one('res.users', string='User', index=True)
    data = fields.Text('Session Data')  # JSON serialized
    expiration = fields.Datetime('Expiration', index=True)
    last_activity = fields.Datetime('Last Activity')
    ip_address = fields.Char('IP Address')
    user_agent = fields.Char('User Agent')

    _sql_constraints = [
        ('session_id_unique', 'UNIQUE(session_id)', 'Session ID must be unique')
    ]

    @api.model
    def gc_sessions(self):
        """Garbage collect expired sessions - run via cron"""
        expired = self.search([
            ('expiration', '<', fields.Datetime.now())
        ])
        count = len(expired)
        expired.unlink()
        return count

    @api.model
    def create_session(self, session_id, user_id, data=None, ttl_hours=24):
        """Crée une nouvelle session"""
        return self.create({
            'session_id': session_id,
            'user_id': user_id,
            'data': json.dumps(data or {}),
            'expiration': fields.Datetime.now() + timedelta(hours=ttl_hours),
            'last_activity': fields.Datetime.now(),
        })

    @api.model
    def get_session(self, session_id):
        """Récupère les données de session"""
        session = self.search([
            ('session_id', '=', session_id)
        ], limit=1)

        if session and session.expiration > fields.Datetime.now():
            session.last_activity = fields.Datetime.now()
            return json.loads(session.data or '{}')
        return None

    @api.model
    def update_session(self, session_id, data):
        """Met à jour les données de session"""
        session = self.search([('session_id', '=', session_id)], limit=1)
        if session:
            session.write({
                'data': json.dumps(data),
                'last_activity': fields.Datetime.now()
            })
            return True
        return False

    @api.model
    def delete_session(self, session_id):
        """Supprime une session"""
        session = self.search([('session_id', '=', session_id)], limit=1)
        if session:
            session.unlink()
            return True
        return False
```

**Use cases**: Load balancing, scalabilité horizontale, sessions persistantes

---

### 6.2 Multi-Tenancy Header Pattern (dbfilter_from_header)

Sélection de base de données via header HTTP pour SaaS multi-tenant.

```python
# Configuration dans odoo.conf
# dbfilter_from_header = X-Odoo-Database

# http.py - Middleware de filtrage
from odoo import http
from odoo.http import request

class DBFilterMiddleware:
    """Middleware pour filtrer DB depuis header HTTP"""

    @staticmethod
    def get_db_from_header():
        """Extrait le nom de la DB depuis le header HTTP"""
        if hasattr(request, 'httprequest'):
            # Priorité 1: Header explicite
            header = request.httprequest.headers.get('X-Odoo-Database')
            if header:
                return header

            # Priorité 2: Extraction depuis subdomain
            host = request.httprequest.host
            if '.' in host:
                subdomain = host.split('.')[0]
                if subdomain and subdomain not in ('www', 'app', 'api'):
                    return subdomain

        return None

    @staticmethod
    def get_db_from_host():
        """Mapping host -> database"""
        host = request.httprequest.host.split(':')[0]

        # Table de mapping (pourrait être en DB)
        host_db_map = {
            'client1.saas.com': 'client1_db',
            'client2.saas.com': 'client2_db',
        }

        return host_db_map.get(host)


# Configuration Nginx pour injection header
"""
server {
    listen 80;
    server_name ~^(?<subdomain>.+)\.saas\.example\.com$;

    location / {
        proxy_pass http://odoo;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Odoo-Database $subdomain;
    }
}
"""
```

**Use cases**: SaaS multi-tenant, isolation clients, routing dynamique

---

## Section 7: Error Recovery

### 7.1 Sentry Integration Pattern (sentry)

Intégration Sentry.io pour monitoring des erreurs production.

```python
# models/sentry_config.py
import sentry_sdk
from sentry_sdk.integrations.wsgi import SentryWsgiMiddleware
from odoo import models, fields, api

class SentryConfig(models.Model):
    _name = 'sentry.config'
    _description = 'Sentry Configuration'

    name = fields.Char(default='Production')
    dsn = fields.Char('Sentry DSN', required=True)
    environment = fields.Char('Environment', default='production')
    release = fields.Char('Release Version')
    enabled = fields.Boolean('Enabled', default=True)
    sample_rate = fields.Float('Sample Rate', default=1.0)
    traces_sample_rate = fields.Float('Traces Sample Rate', default=0.1)

    def init_sentry(self):
        """Initialise Sentry SDK"""
        if self.enabled and self.dsn:
            sentry_sdk.init(
                dsn=self.dsn,
                environment=self.environment,
                release=self.release,
                sample_rate=self.sample_rate,
                traces_sample_rate=self.traces_sample_rate,
                integrations=[],
                send_default_pii=False,
            )
            return True
        return False

    @api.model
    def capture_exception(self, exception, context=None):
        """Capture une exception dans Sentry"""
        with sentry_sdk.push_scope() as scope:
            if context:
                for key, value in context.items():
                    scope.set_extra(key, value)

            # Ajouter contexte Odoo
            scope.set_tag('odoo.db', self.env.cr.dbname)
            scope.set_user({'id': self.env.uid, 'username': self.env.user.login})

            sentry_sdk.capture_exception(exception)

    @api.model
    def capture_message(self, message, level='info'):
        """Capture un message dans Sentry"""
        sentry_sdk.capture_message(message, level=level)
```

---

### 7.2 Scheduler Error Mailer Pattern (scheduler_error_mailer)

Notification email des erreurs de cron.

```python
# models/ir_cron.py
from odoo import models, fields, api
import traceback

class IrCron(models.Model):
    _inherit = 'ir.cron'

    error_mailer_ids = fields.Many2many(
        'res.users',
        string='Notify on Error'
    )
    last_error = fields.Text('Last Error', readonly=True)
    last_error_date = fields.Datetime('Last Error Date', readonly=True)
    error_count = fields.Integer('Error Count', default=0)

    def _callback(self, cron_name, server_action_id, job_id):
        """Override pour capturer les erreurs"""
        try:
            return super()._callback(cron_name, server_action_id, job_id)
        except Exception as e:
            self._handle_cron_error(e)
            raise

    def _handle_cron_error(self, exception):
        """Gère une erreur de cron"""
        error_msg = traceback.format_exc()

        self.write({
            'last_error': error_msg,
            'last_error_date': fields.Datetime.now(),
            'error_count': self.error_count + 1,
        })

        # Envoyer notifications
        if self.error_mailer_ids:
            self._send_error_notification(exception, error_msg)

    def _send_error_notification(self, exception, error_msg):
        """Envoie email de notification"""
        template = self.env.ref(
            'scheduler_error_mailer.cron_error_email_template',
            raise_if_not_found=False
        )

        if template:
            for user in self.error_mailer_ids:
                template.with_context(
                    error_message=str(exception),
                    traceback=error_msg
                ).send_mail(self.id, email_values={
                    'email_to': user.email
                })
        else:
            # Fallback: message interne
            for user in self.error_mailer_ids:
                self.env['mail.message'].create({
                    'subject': f'Cron Error: {self.name}',
                    'body': f'<pre>{error_msg}</pre>',
                    'partner_ids': [(4, user.partner_id.id)],
                })
```

**Use cases**: Monitoring production, alerting, debugging rapide

---

## Section 8: Module Introspection

### 8.1 Module Analysis Pattern (module_analysis)

Pattern d'analyse et catégorisation des modules installés.

```python
# models/module_analysis.py
import os
from odoo import models, fields, api
from odoo.modules.module import get_module_path

class ModuleAnalysis(models.Model):
    _name = 'module.analysis'
    _description = 'Module Analysis'

    module_id = fields.Many2one('ir.module.module', required=True)
    category = fields.Selection([
        ('core', 'Odoo Core'),
        ('oca', 'OCA Community'),
        ('custom', 'Custom Development'),
        ('third_party', 'Third Party')
    ], compute='_compute_category', store=True)
    lines_of_code = fields.Integer('Lines of Code', compute='_compute_metrics')
    python_files = fields.Integer('Python Files', compute='_compute_metrics')
    xml_files = fields.Integer('XML Files', compute='_compute_metrics')
    model_count = fields.Integer('Models', compute='_compute_metrics')
    view_count = fields.Integer('Views', compute='_compute_metrics')

    @api.depends('module_id', 'module_id.author')
    def _compute_category(self):
        for rec in self:
            author = rec.module_id.author or ''
            if 'Odoo S.A.' in author or 'Odoo SA' in author:
                rec.category = 'core'
            elif 'OCA' in author or 'Odoo Community Association' in author:
                rec.category = 'oca'
            elif author:
                rec.category = 'third_party'
            else:
                rec.category = 'custom'

    @api.depends('module_id')
    def _compute_metrics(self):
        for rec in self:
            module_path = get_module_path(rec.module_id.name)
            if not module_path:
                rec.lines_of_code = 0
                rec.python_files = 0
                rec.xml_files = 0
                rec.model_count = 0
                rec.view_count = 0
                continue

            # Compter fichiers et lignes
            py_count, py_lines = 0, 0
            xml_count = 0

            for root, dirs, files in os.walk(module_path):
                # Ignorer certains dossiers
                dirs[:] = [d for d in dirs if d not in ('static', '.git', '__pycache__')]

                for f in files:
                    if f.endswith('.py'):
                        py_count += 1
                        try:
                            with open(os.path.join(root, f), 'r') as fp:
                                py_lines += sum(1 for line in fp if line.strip())
                        except Exception:
                            pass
                    elif f.endswith('.xml'):
                        xml_count += 1

            rec.python_files = py_count
            rec.xml_files = xml_count
            rec.lines_of_code = py_lines

            # Compter modèles
            rec.model_count = self.env['ir.model'].search_count([
                ('model', 'like', rec.module_id.name.replace('_', '.') + '%')
            ])

            # Compter vues
            rec.view_count = self.env['ir.ui.view'].search_count([
                ('model', 'like', rec.module_id.name.replace('_', '.') + '%')
            ])

    @api.model
    def analyze_all_modules(self):
        """Analyse tous les modules installés"""
        installed = self.env['ir.module.module'].search([
            ('state', '=', 'installed')
        ])

        for module in installed:
            existing = self.search([('module_id', '=', module.id)])
            if not existing:
                self.create({'module_id': module.id})

    @api.model
    def get_summary(self):
        """Retourne un résumé de l'analyse"""
        self.analyze_all_modules()

        return {
            'core': self.search_count([('category', '=', 'core')]),
            'oca': self.search_count([('category', '=', 'oca')]),
            'custom': self.search_count([('category', '=', 'custom')]),
            'third_party': self.search_count([('category', '=', 'third_party')]),
            'total_loc': sum(self.search([]).mapped('lines_of_code')),
        }
```

**Use cases**: Audit technique, qualité code, inventaire modules

---

## Quick Reference

### Installation des Patterns

```bash
# Installer les extensions PostgreSQL requises
sudo -u postgres psql -d your_db -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
```

### Intégration dans un Module

```python
# __manifest__.py
{
    'name': 'My Module',
    'depends': ['base'],
    # Pour utiliser les mixins:
    # 'depends': ['auditlog', 'base_time_window', 'base_search_fuzzy'],
}

# models/my_model.py
class MyModel(models.Model):
    _name = 'my.model'
    _inherit = ['mail.thread', 'time.window.mixin', 'fuzzy.search.mixin']
```

---

## Références

| Ressource | URL |
|-----------|-----|
| Repository OCA | https://github.com/OCA/server-tools |
| Documentation OCA | https://odoo-community.org |
| PostgreSQL pg_trgm | https://www.postgresql.org/docs/current/pgtrgm.html |
| Sentry Python SDK | https://docs.sentry.io/platforms/python |

---

*ULTRA-CREATE v24.1 - OCA Server Tools Guide - 27 Décembre 2025*
