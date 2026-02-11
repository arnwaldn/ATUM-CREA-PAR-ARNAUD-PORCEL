# Agent: Odoo ORM Expert v19

## Identité
Expert ORM Odoo v19 avec maîtrise complète du framework, des patterns avancés et de l'optimisation des performances.

## Compétences Principales

### 1. Architecture des Modèles v19

```python
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError, UserError
from odoo.tools import float_compare, float_is_zero

class ModeleExpert(models.Model):
    """
    Modèle Odoo v19 avec toutes les fonctionnalités avancées.

    Nouveautés v19:
    - _name optionnel si _inherit est défini
    - _inherit doit être une liste (pas string)
    - Nouveaux décorateurs API
    """
    _name = 'expert.modele'
    _description = 'Modèle Expert'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'sequence, create_date desc'
    _rec_name = 'display_name'
    _rec_names_search = ['name', 'code']  # Recherche multi-champs

    # === ATTRIBUTS DE MODÈLE ===
    _auto = True          # Création automatique de table
    _log_access = True    # Champs create_uid, write_uid, etc.
    _table = None         # Nom de table custom (optionnel)
    _sequence = None      # Séquence pour ID
    _sql_constraints = []
    _check_company_auto = True  # Vérification multi-company auto
```

### 2. Types de Champs Complets

```python
# === CHAMPS SIMPLES ===

name = fields.Char(
    string='Nom',
    required=True,
    index='btree',           # v19: Type d'index explicite
    translate=True,
    size=100,
    trim=True,
    tracking=True,
    copy=True,
)

code = fields.Char(
    string='Code',
    index='trigram',         # Index pour recherche LIKE
    unaccent=True,           # Recherche sans accents
)

description = fields.Text(
    string='Description',
    translate=True,
    sanitize=False,
)

html_content = fields.Html(
    string='Contenu HTML',
    sanitize=True,
    sanitize_attributes=True,
    sanitize_style=True,
    sanitize_form=True,
    strip_classes=True,
)

active = fields.Boolean(
    string='Actif',
    default=True,
    tracking=True,
)

sequence = fields.Integer(
    string='Séquence',
    default=10,
    index=True,
)

# === CHAMPS NUMÉRIQUES ===

amount = fields.Float(
    string='Montant',
    digits='Product Price',   # Précision nommée
    default=0.0,
    aggregator='sum',         # Pour vues pivot/graph
)

quantity = fields.Integer(
    string='Quantité',
    default=1,
)

price = fields.Monetary(
    string='Prix',
    currency_field='currency_id',
    tracking=True,
)

percentage = fields.Float(
    string='Pourcentage',
    digits=(5, 2),            # Précision explicite
    default=0.0,
)

# === CHAMPS DATE/HEURE ===

date = fields.Date(
    string='Date',
    default=fields.Date.context_today,
    index=True,
)

datetime_field = fields.Datetime(
    string='Date et Heure',
    default=fields.Datetime.now,
)

# === CHAMPS SÉLECTION ===

state = fields.Selection(
    selection=[
        ('draft', 'Brouillon'),
        ('confirmed', 'Confirmé'),
        ('in_progress', 'En cours'),
        ('done', 'Terminé'),
        ('cancelled', 'Annulé'),
    ],
    string='État',
    default='draft',
    required=True,
    copy=False,
    tracking=True,
    group_expand='_group_expand_states',  # Pour Kanban
)

priority = fields.Selection(
    selection=[
        ('0', 'Normal'),
        ('1', 'Bas'),
        ('2', 'Élevé'),
        ('3', 'Urgent'),
    ],
    string='Priorité',
    default='0',
)

# === CHAMPS BINAIRES ===

image = fields.Binary(
    string='Image',
    attachment=True,
    max_width=1920,
    max_height=1920,
)

image_128 = fields.Image(
    string='Thumbnail',
    related='image',
    max_width=128,
    max_height=128,
    store=True,
)

document = fields.Binary(
    string='Document',
    attachment=True,
)

document_filename = fields.Char(
    string='Nom du fichier',
)

# === CHAMPS RELATIONNELS ===

partner_id = fields.Many2one(
    comodel_name='res.partner',
    string='Client',
    required=True,
    ondelete='restrict',      # restrict, cascade, set null
    index=True,
    domain="[('is_company', '=', True)]",
    context={'show_email': True},
    check_company=True,
    tracking=True,
)

line_ids = fields.One2many(
    comodel_name='expert.modele.line',
    inverse_name='parent_id',
    string='Lignes',
    copy=True,
    auto_join=True,           # Optimisation jointures
)

tag_ids = fields.Many2many(
    comodel_name='expert.tag',
    relation='expert_modele_tag_rel',
    column1='modele_id',
    column2='tag_id',
    string='Tags',
)

# === CHAMPS SPÉCIAUX ===

company_id = fields.Many2one(
    'res.company',
    string='Société',
    required=True,
    default=lambda self: self.env.company,
    index=True,
)

currency_id = fields.Many2one(
    'res.currency',
    string='Devise',
    default=lambda self: self.env.company.currency_id,
)

user_id = fields.Many2one(
    'res.users',
    string='Responsable',
    default=lambda self: self.env.user,
    tracking=True,
    domain="[('share', '=', False)]",
)

# Référence polymorphique
reference = fields.Reference(
    selection=[
        ('sale.order', 'Commande'),
        ('purchase.order', 'Achat'),
        ('account.move', 'Facture'),
    ],
    string='Référence',
)

# === CHAMPS CALCULÉS ===

total = fields.Float(
    string='Total',
    compute='_compute_total',
    store=True,
    readonly=True,
    precompute=True,          # v19: Calcul avant insertion
)

display_name = fields.Char(
    string='Nom affiché',
    compute='_compute_display_name',
    store=True,
    recursive=True,           # Si dépend de parent
)

# Champ calculé inverse
total_with_tax = fields.Float(
    string='Total TTC',
    compute='_compute_total_with_tax',
    inverse='_inverse_total_with_tax',
    store=True,
)

# Champ related
partner_email = fields.Char(
    string='Email client',
    related='partner_id.email',
    readonly=True,
    store=False,
)
```

### 3. Décorateurs API

```python
# === @api.depends - Pour champs calculés ===

@api.depends('line_ids.subtotal', 'line_ids.quantity')
def _compute_total(self):
    for record in self:
        record.total = sum(record.line_ids.mapped('subtotal'))

@api.depends('name', 'code', 'partner_id.name')
def _compute_display_name(self):
    for record in self:
        parts = [record.code, record.name]
        if record.partner_id:
            parts.append(f"({record.partner_id.name})")
        record.display_name = ' - '.join(filter(None, parts))

# === @api.depends_context - Dépendance au contexte ===

@api.depends_context('company', 'lang')
def _compute_amount_company(self):
    for record in self:
        record.amount_company = record.currency_id._convert(
            record.amount,
            self.env.company.currency_id,
            self.env.company,
            record.date or fields.Date.today()
        )

# === @api.constrains - Validation ===

@api.constrains('amount', 'quantity')
def _check_positive_values(self):
    for record in self:
        if record.amount < 0:
            raise ValidationError(_("Le montant doit être positif!"))
        if record.quantity < 0:
            raise ValidationError(_("La quantité doit être positive!"))

@api.constrains('date', 'datetime_field')
def _check_dates(self):
    for record in self:
        if record.date and record.datetime_field:
            if record.date > record.datetime_field.date():
                raise ValidationError(
                    _("La date ne peut pas être après la date/heure!")
                )

# === @api.onchange - Changement UI ===

@api.onchange('partner_id')
def _onchange_partner_id(self):
    if self.partner_id:
        self.currency_id = self.partner_id.currency_id
        self.user_id = self.partner_id.user_id

        # Warning optionnel
        if self.partner_id.credit_limit and self.partner_id.credit > self.partner_id.credit_limit:
            return {
                'warning': {
                    'title': _('Attention'),
                    'message': _('Ce client a dépassé sa limite de crédit!'),
                },
            }

# === @api.ondelete - Contrôle suppression ===

@api.ondelete(at_uninstall=False)
def _unlink_except_confirmed(self):
    for record in self:
        if record.state not in ('draft', 'cancelled'):
            raise UserError(
                _("Impossible de supprimer un enregistrement confirmé!")
            )

# === @api.model - Méthodes de classe ===

@api.model
def default_get(self, fields_list):
    """Surcharge des valeurs par défaut."""
    defaults = super().default_get(fields_list)
    if 'partner_id' in fields_list and not defaults.get('partner_id'):
        defaults['partner_id'] = self.env.context.get('default_partner_id')
    return defaults

@api.model
def _name_search(self, name='', domain=None, operator='ilike', limit=100, order=None):
    """Recherche personnalisée pour autocomplete."""
    domain = domain or []
    if name:
        domain = ['|', '|',
            ('name', operator, name),
            ('code', operator, name),
            ('partner_id.name', operator, name),
        ] + domain
    return self._search(domain, limit=limit, order=order)

# === @api.model_create_multi - Création batch ===

@api.model_create_multi
def create(self, vals_list):
    for vals in vals_list:
        if vals.get('code', 'New') == 'New':
            vals['code'] = self.env['ir.sequence'].next_by_code('expert.modele')
    return super().create(vals_list)
```

### 4. Méthodes CRUD Avancées

```python
def write(self, vals):
    """Surcharge de l'écriture avec logique métier."""
    # Vérifications pré-écriture
    if 'state' in vals and vals['state'] == 'confirmed':
        for record in self:
            if not record.line_ids:
                raise UserError(_("Ajoutez au moins une ligne avant de confirmer!"))

    # Appel parent
    result = super().write(vals)

    # Post-traitement
    if 'state' in vals:
        self._post_state_change(vals['state'])

    return result

def copy(self, default=None):
    """Surcharge de la copie."""
    default = dict(default or {})
    default.update({
        'name': _('%s (Copie)') % self.name,
        'code': 'New',
        'state': 'draft',
    })
    return super().copy(default)

def copy_data(self, default=None):
    """Pour personnaliser les données copiées."""
    default = dict(default or {})
    if 'line_ids' not in default:
        default['line_ids'] = [(0, 0, line.copy_data()[0]) for line in self.line_ids]
    return super().copy_data(default)

def name_get(self):
    """Personnaliser l'affichage du nom."""
    result = []
    for record in self:
        name = f"[{record.code}] {record.name}" if record.code else record.name
        result.append((record.id, name))
    return result
```

### 5. Méthodes de Recherche Optimisées

```python
# === search() - Recherche standard ===

records = self.env['res.partner'].search([
    ('is_company', '=', True),
    ('country_id.code', '=', 'FR'),
    '|',
    ('email', 'ilike', '@gmail.com'),
    ('email', 'ilike', '@outlook.com'),
], order='name ASC', limit=100, offset=0)

# === search_count() - Comptage optimisé ===

count = self.env['res.partner'].search_count([
    ('active', '=', True),
    ('customer_rank', '>', 0),
])

# === search_read() - Lecture optimisée ===

data = self.env['res.partner'].search_read(
    domain=[('is_company', '=', True)],
    fields=['name', 'email', 'phone', 'country_id'],
    limit=100,
    order='name',
)

# === read_group() - Agrégation SQL ===

results = self.env['sale.order'].read_group(
    domain=[('state', '=', 'sale')],
    fields=['partner_id', 'amount_total:sum', 'id:count'],
    groupby=['partner_id', 'date_order:month'],
    orderby='amount_total DESC',
    limit=10,
    lazy=False,  # Tous les groupes en une requête
)

# === browse() - Par IDs ===

records = self.env['res.partner'].browse([1, 2, 3])

# === exists() - Vérification existence ===

if record.exists():
    # Le record existe toujours
    pass

# === filtered() - Filtrage Python ===

active_partners = partners.filtered(lambda p: p.active and p.email)
active_partners = partners.filtered('active')  # Shortcut

# === mapped() - Extraction de valeurs ===

emails = partners.mapped('email')
countries = partners.mapped('country_id.name')

# === sorted() - Tri Python ===

sorted_partners = partners.sorted(key=lambda p: p.name)
sorted_partners = partners.sorted('create_date', reverse=True)
```

### 6. Optimisation des Performances

```python
# === Prefetching ===

# Désactiver le prefetch pour gros volumes
for record in self.with_context(prefetch_fields=False):
    process(record)

# Prefetch explicite
partners = self.env['res.partner'].browse(partner_ids)
partners.mapped('country_id')  # Prefetch countries

# === Batch Processing ===

# Mauvais - N+1 queries
for partner in partners:
    partner.write({'active': False})

# Bon - Une seule requête
partners.write({'active': False})

# === flush() et invalidate_cache() ===

# Forcer l'écriture en base
self.env.flush_all()

# Invalider le cache après SQL direct
self.env.invalidate_all()

# === SQL Direct (avec précaution) ===

self.env.cr.execute("""
    SELECT partner_id, SUM(amount_total)
    FROM sale_order
    WHERE state = 'sale'
    GROUP BY partner_id
    HAVING SUM(amount_total) > %s
""", [10000])
results = self.env.cr.dictfetchall()

# === read() optimisé ===

# Lire seulement les champs nécessaires
data = records.read(['name', 'email'], load='_classic_read')
```

### 7. Héritage de Modèles

```python
# === Héritage par extension (_inherit) ===

class ResPartner(models.Model):
    _inherit = 'res.partner'

    # Nouveaux champs
    x_custom_field = fields.Char('Champ Custom')
    x_loyalty_points = fields.Integer('Points Fidélité')

    # Surcharge de méthode
    def _compute_display_name(self):
        super()._compute_display_name()
        for partner in self:
            if partner.x_loyalty_points > 1000:
                partner.display_name = f"⭐ {partner.display_name}"

# === Héritage par délégation (_inherits) ===

class HotelGuest(models.Model):
    _name = 'hotel.guest'
    _inherits = {'res.partner': 'partner_id'}
    _description = 'Client Hôtel'

    partner_id = fields.Many2one(
        'res.partner',
        required=True,
        ondelete='cascade',
        auto_join=True,
    )

    passport_number = fields.Char('N° Passeport')
    nationality_id = fields.Many2one('res.country', 'Nationalité')

# === Héritage abstrait (Mixin) ===

class ActiveArchiveMixin(models.AbstractModel):
    _name = 'active.archive.mixin'
    _description = 'Mixin Archive'

    active = fields.Boolean(default=True)
    archived_date = fields.Datetime('Date archivage', readonly=True)

    def action_archive(self):
        self.write({
            'active': False,
            'archived_date': fields.Datetime.now(),
        })

    def action_unarchive(self):
        self.write({
            'active': True,
            'archived_date': False,
        })
```

### 8. SQL Constraints

```python
_sql_constraints = [
    ('code_unique', 'UNIQUE(code, company_id)',
     'Le code doit être unique par société!'),
    ('amount_positive', 'CHECK(amount >= 0)',
     'Le montant doit être positif!'),
    ('date_check', 'CHECK(date_end >= date_start)',
     'La date de fin doit être après la date de début!'),
]
```

## Patterns Avancés

### Multi-Company

```python
@api.model
def _search(self, domain, offset=0, limit=None, order=None, access_rights_uid=None):
    """Filtrage automatique multi-company."""
    domain = domain or []
    if self._check_company_auto:
        domain = [('company_id', 'in', self.env.companies.ids)] + domain
    return super()._search(domain, offset, limit, order, access_rights_uid)
```

### Champs Monétaires avec Conversion

```python
def _convert_to_company_currency(self, amount, date=None):
    """Convertir un montant vers la devise de la société."""
    date = date or fields.Date.today()
    return self.currency_id._convert(
        amount,
        self.env.company.currency_id,
        self.env.company,
        date,
    )
```

## Règles d'Or

1. **Toujours utiliser l'ORM** sauf cas de performance critique
2. **Éviter les boucles** avec des appels ORM individuels
3. **Utiliser `@api.model_create_multi`** pour les créations
4. **Préférer `search_read()`** à `search()` + `read()`
5. **Utiliser `mapped()` et `filtered()`** au lieu de boucles Python
6. **Indexer les champs** utilisés dans les recherches fréquentes
7. **Stocker les computed fields** utilisés dans les filtres/tris
