# Odoo Performance Guide

## Vue d'ensemble

Guide complet pour optimiser les performances des applications Odoo v19 : PostgreSQL, ORM, caching, et bonnes pratiques.

---

## 1. Optimisation PostgreSQL

### Configuration postgresql.conf

```ini
# Mémoire
shared_buffers = 4GB              # 25% de la RAM
effective_cache_size = 12GB       # 75% de la RAM
work_mem = 256MB                  # RAM / max_connections / 2
maintenance_work_mem = 1GB        # Pour VACUUM, CREATE INDEX

# Connexions
max_connections = 200
max_prepared_transactions = 200

# WAL & Checkpoints
wal_buffers = 64MB
checkpoint_completion_target = 0.9
checkpoint_timeout = 15min
max_wal_size = 2GB
min_wal_size = 1GB

# Planner
random_page_cost = 1.1            # SSD
effective_io_concurrency = 200    # SSD
default_statistics_target = 100

# Parallelism
max_worker_processes = 8
max_parallel_workers_per_gather = 4
max_parallel_workers = 8

# Logging
log_min_duration_statement = 1000  # Log queries > 1s
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
```

### Maintenance PostgreSQL

```sql
-- Analyser les tables
ANALYZE VERBOSE;

-- Vacuum et Analyze
VACUUM (VERBOSE, ANALYZE);

-- Réindexer
REINDEX DATABASE mydb CONCURRENTLY;

-- Identifier les requêtes lentes
SELECT
    query,
    calls,
    total_exec_time / 1000 as total_seconds,
    mean_exec_time / 1000 as mean_seconds,
    rows
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 20;

-- Tables les plus volumineuses
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;

-- Index non utilisés
SELECT
    schemaname || '.' || relname AS table,
    indexrelname AS index,
    pg_size_pretty(pg_relation_size(i.indexrelid)) AS index_size,
    idx_scan as index_scans
FROM pg_stat_user_indexes ui
JOIN pg_index i ON ui.indexrelid = i.indexrelid
WHERE idx_scan < 50
AND pg_relation_size(i.indexrelid) > 5000000
ORDER BY pg_relation_size(i.indexrelid) DESC;

-- Index manquants potentiels
SELECT
    schemaname,
    relname,
    seq_scan,
    seq_tup_read,
    idx_scan,
    seq_tup_read / seq_scan AS avg_seq_tup_read
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 20;
```

---

## 2. Optimisation ORM Odoo

### Éviter les N+1 Queries

```python
# MAUVAIS - N+1 queries
for order in self.env['sale.order'].search([]):
    print(order.partner_id.name)  # 1 query par order!

# BON - Prefetch
orders = self.env['sale.order'].search([])
orders.mapped('partner_id')  # Prefetch en 1 query
for order in orders:
    print(order.partner_id.name)  # Pas de query supplémentaire

# BON - search_read avec champs spécifiques
orders = self.env['sale.order'].search_read(
    domain=[],
    fields=['name', 'partner_id', 'amount_total'],
    limit=100,
)
```

### Optimiser les Domaines de Recherche

```python
# MAUVAIS - Calcul Python
partners = self.env['res.partner'].search([])
big_partners = [p for p in partners if p.credit_limit > 10000]

# BON - Filtrage SQL via domaine
big_partners = self.env['res.partner'].search([
    ('credit_limit', '>', 10000),
])

# MAUVAIS - OR avec nombreux IDs
partner_ids = [1, 2, 3, ..., 1000]
partners = self.env['res.partner'].search([
    ('id', 'in', partner_ids),
])

# BON - Pour très nombreux IDs, utiliser SQL directement
self.env.cr.execute("""
    SELECT id, name FROM res_partner
    WHERE id = ANY(%s)
""", [partner_ids])

# Utiliser EXISTS pour les sous-requêtes
# MAUVAIS
order_ids = self.env['sale.order'].search([
    ('partner_id', '=', partner.id)
]).ids
invoices = self.env['account.move'].search([
    ('invoice_origin', 'in', [o.name for o in orders])
])

# BON - Sous-requête
invoices = self.env['account.move'].search([
    ('partner_id', '=', partner.id),
    ('move_type', '=', 'out_invoice'),
])
```

### Champs Calculés Optimisés

```python
class SaleOrder(models.Model):
    _inherit = 'sale.order'

    # MAUVAIS - Calcul sur tous les enregistrements
    order_count = fields.Integer(compute='_compute_order_count')

    def _compute_order_count(self):
        for record in self:
            record.order_count = len(self.search([
                ('partner_id', '=', record.partner_id.id)
            ]))

    # BON - Utiliser read_group
    def _compute_order_count(self):
        # Une seule requête groupée
        data = self.env['sale.order'].read_group(
            domain=[('partner_id', 'in', self.mapped('partner_id').ids)],
            fields=['partner_id'],
            groupby=['partner_id'],
        )
        counts = {d['partner_id'][0]: d['partner_id_count'] for d in data}

        for record in self:
            record.order_count = counts.get(record.partner_id.id, 0)

    # STOCKER les champs calculés coûteux
    total_orders = fields.Integer(
        compute='_compute_total_orders',
        store=True,  # Stocké en DB, recalculé sur trigger
    )

    @api.depends('order_line.price_total')
    def _compute_total_orders(self):
        for order in self:
            order.total_orders = sum(order.order_line.mapped('price_total'))
```

### Batch Processing

```python
# MAUVAIS - Un commit par enregistrement
for vals in vals_list:
    self.env['product.product'].create(vals)

# BON - Création batch
self.env['product.product'].create(vals_list)

# Pour les très gros volumes, utiliser des chunks
def process_in_chunks(records, chunk_size=1000):
    for i in range(0, len(records), chunk_size):
        chunk = records[i:i + chunk_size]
        yield chunk
        # Commit intermédiaire si nécessaire
        self.env.cr.commit()

# Exemple avec mise à jour
for chunk in process_in_chunks(all_products, 500):
    chunk.write({'active': False})
    self.env.cr.commit()
```

---

## 3. Caching

### Cache ORM Natif

```python
# Le cache ORM est automatique pour les champs
# Invalider le cache si nécessaire
record.invalidate_recordset()  # Invalide ce recordset
record.invalidate_recordset(['field_name'])  # Champ spécifique

# Invalider tout le cache du modèle
self.env['model.name'].invalidate_model()

# Éviter de casser le cache
# MAUVAIS - SQL direct sans invalidation
self.env.cr.execute("UPDATE res_partner SET name = 'New' WHERE id = %s", [id])

# BON - Si SQL nécessaire, invalider
self.env.cr.execute("UPDATE res_partner SET name = 'New' WHERE id = %s", [id])
self.env['res.partner'].invalidate_model(['name'])
```

### Ormcache Decorator

```python
from odoo import tools


class MyModel(models.Model):
    _name = 'my.model'

    # Cache simple - clé basée sur les arguments
    @tools.ormcache('self.env.uid', 'key')
    def get_config_value(self, key):
        """Valeur mise en cache par utilisateur et clé"""
        param = self.env['ir.config_parameter'].sudo().get_param(key)
        return param

    # Cache avec skiparg pour ignorer self
    @tools.ormcache_context('self.env.uid', keys=('lang',))
    def get_translated_name(self):
        """Cache par utilisateur et langue"""
        return self.with_context(lang=self.env.lang).name

    # Invalider le cache
    def write(self, vals):
        result = super().write(vals)
        if 'name' in vals:
            self.clear_caches()
        return result

    @classmethod
    def clear_caches(cls):
        """Nettoyer les caches de cette classe"""
        cls.get_config_value.clear_cache(cls)
        cls.get_translated_name.clear_cache(cls)
```

### Cache Redis (externe)

```python
# models/redis_cache.py
import redis
import json
import pickle
from functools import wraps


class RedisCache:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.client = redis.Redis(
                host='localhost',
                port=6379,
                db=0,
                decode_responses=False,
            )
        return cls._instance

    def get(self, key):
        value = self.client.get(key)
        return pickle.loads(value) if value else None

    def set(self, key, value, ttl=3600):
        self.client.setex(key, ttl, pickle.dumps(value))

    def delete(self, key):
        self.client.delete(key)

    def clear_pattern(self, pattern):
        for key in self.client.scan_iter(pattern):
            self.client.delete(key)


def redis_cache(ttl=3600, key_prefix=''):
    """Décorateur de cache Redis"""
    def decorator(func):
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            cache = RedisCache()
            cache_key = f"{key_prefix}:{func.__name__}:{args}:{kwargs}"

            # Essayer le cache
            cached = cache.get(cache_key)
            if cached is not None:
                return cached

            # Calculer et cacher
            result = func(self, *args, **kwargs)
            cache.set(cache_key, result, ttl)
            return result

        return wrapper
    return decorator


# Utilisation
class ProductProduct(models.Model):
    _inherit = 'product.product'

    @redis_cache(ttl=1800, key_prefix='product')
    def get_complex_pricing(self, pricelist_id, quantity):
        """Calcul de prix complexe mis en cache"""
        # ... calcul coûteux ...
        return computed_price
```

---

## 4. Index de Base de Données

### Créer des Index

```python
class MyModel(models.Model):
    _name = 'my.model'

    # Index simple via attribut
    reference = fields.Char(index=True)

    # Index via contrainte SQL
    _sql_constraints = [
        ('reference_uniq', 'UNIQUE(reference)', 'Reference must be unique!'),
    ]

    def init(self):
        """Créer des index personnalisés"""
        # Index composé
        tools.create_index(
            self._cr,
            'my_model_partner_date_idx',
            self._table,
            ['partner_id', 'date DESC'],
        )

        # Index partiel
        self._cr.execute("""
            CREATE INDEX IF NOT EXISTS my_model_active_idx
            ON my_model (name)
            WHERE active = true
        """)

        # Index GIN pour recherche full-text
        self._cr.execute("""
            CREATE INDEX IF NOT EXISTS my_model_name_gin_idx
            ON my_model USING gin (to_tsvector('french', name))
        """)
```

### Analyser les Requêtes

```python
# Dans un shell Odoo
from odoo.tools import profiler

# Profiler les requêtes SQL
with profiler.Profiler():
    records = self.env['sale.order'].search([
        ('state', '=', 'sale'),
        ('date_order', '>=', '2024-01-01'),
    ])

# Voir le plan d'exécution
self.env.cr.execute("""
    EXPLAIN ANALYZE
    SELECT * FROM sale_order
    WHERE state = 'sale'
    AND date_order >= '2024-01-01'
""")
print(self.env.cr.fetchall())
```

---

## 5. Configuration Odoo

### odoo.conf optimisé

```ini
[options]
; Workers
workers = 4
max_cron_threads = 2

; Limites
limit_memory_hard = 2684354560
limit_memory_soft = 2147483648
limit_request = 8192
limit_time_cpu = 600
limit_time_real = 1200
limit_time_real_cron = 3600

; Base de données
db_maxconn = 64
db_host = localhost
db_port = 5432
db_user = odoo
db_password = odoo
db_name = production

; Performance
proxy_mode = True
list_db = False
unaccent = True

; Log
logfile = /var/log/odoo/odoo.log
log_level = warn
log_db = False

; Assets
x_sendfile = True

; Cache
osv_memory_age_limit = 1.0
osv_memory_count_limit = False
```

### Proxy Nginx

```nginx
upstream odoo {
    server 127.0.0.1:8069;
}

upstream odoochat {
    server 127.0.0.1:8072;
}

server {
    listen 443 ssl http2;
    server_name odoo.example.com;

    ssl_certificate /etc/ssl/certs/odoo.crt;
    ssl_certificate_key /etc/ssl/private/odoo.key;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    # Cache static files
    location ~* /web/static/ {
        proxy_cache_valid 200 90d;
        proxy_buffering on;
        expires 90d;
        proxy_pass http://odoo;
    }

    # Longpolling
    location /longpolling {
        proxy_pass http://odoochat;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Main
    location / {
        proxy_pass http://odoo;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_read_timeout 720s;
        proxy_connect_timeout 720s;
        proxy_send_timeout 720s;

        # Buffer
        proxy_buffers 16 64k;
        proxy_buffer_size 128k;
    }

    # File upload limit
    client_max_body_size 200m;
}
```

---

## 6. Monitoring

### Métriques Prometheus

```python
# models/metrics.py
from prometheus_client import Counter, Histogram, Gauge
import time

# Métriques
REQUEST_COUNT = Counter(
    'odoo_requests_total',
    'Total requests',
    ['method', 'endpoint', 'status'],
)

REQUEST_LATENCY = Histogram(
    'odoo_request_duration_seconds',
    'Request latency',
    ['method', 'endpoint'],
)

ACTIVE_USERS = Gauge(
    'odoo_active_users',
    'Number of active users',
)

DB_CONNECTIONS = Gauge(
    'odoo_db_connections',
    'Database connections',
    ['state'],
)


class MetricsMiddleware:
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        method = environ['REQUEST_METHOD']
        path = environ['PATH_INFO']

        start_time = time.time()

        def custom_start_response(status, headers, exc_info=None):
            REQUEST_COUNT.labels(
                method=method,
                endpoint=path,
                status=status.split()[0],
            ).inc()
            return start_response(status, headers, exc_info)

        try:
            return self.app(environ, custom_start_response)
        finally:
            REQUEST_LATENCY.labels(
                method=method,
                endpoint=path,
            ).observe(time.time() - start_time)
```

### Dashboard Grafana

```json
{
  "dashboard": {
    "title": "Odoo Performance",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(odoo_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Response Time (p95)",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(odoo_request_duration_seconds_bucket[5m]))"
          }
        ]
      },
      {
        "title": "Database Connections",
        "type": "gauge",
        "targets": [
          {
            "expr": "odoo_db_connections"
          }
        ]
      }
    ]
  }
}
```

---

## 7. Checklist Performance

```markdown
## Base de données
- [ ] PostgreSQL configuré (shared_buffers, work_mem)
- [ ] Maintenance régulière (VACUUM ANALYZE)
- [ ] Index sur colonnes fréquemment filtrées
- [ ] Monitoring des requêtes lentes

## Code Odoo
- [ ] Pas de N+1 queries
- [ ] Utilisation de search_read avec fields
- [ ] Champs calculés stockés si coûteux
- [ ] Batch processing pour gros volumes

## Infrastructure
- [ ] Workers configurés (règle: 2 * CPU + 1)
- [ ] Proxy avec cache statique (Nginx)
- [ ] Gzip activé
- [ ] SSL/TLS optimisé

## Monitoring
- [ ] Logs d'erreur configurés
- [ ] Métriques de performance
- [ ] Alertes sur latence/erreurs
- [ ] Profiling périodique
```
