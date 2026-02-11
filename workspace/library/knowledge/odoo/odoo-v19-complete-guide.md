# Guide Complet Odoo v19 pour Développeurs

## 1. Introduction à Odoo v19

### Nouveautés Odoo v19
- **Python 3.10+** requis (minimum)
- **PostgreSQL 15+** recommandé
- Améliorations performances ORM
- Nouveau système de vues dynamiques
- Meilleure gestion du multi-company
- API REST native améliorée
- Support WebSocket pour temps réel

### Architecture Odoo

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Web UI    │  │  REST API   │  │  External Systems   │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
└─────────┼────────────────┼─────────────────────┼────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Odoo Server                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    HTTP Layer                            ││
│  │  Werkzeug + Controllers + JSON-RPC + XML-RPC            ││
│  └────────────────────────┬────────────────────────────────┘│
│                           │                                  │
│  ┌────────────────────────▼────────────────────────────────┐│
│  │                   Business Logic                         ││
│  │  Models + Views + Actions + Wizards + Reports           ││
│  └────────────────────────┬────────────────────────────────┘│
│                           │                                  │
│  ┌────────────────────────▼────────────────────────────────┐│
│  │                      ORM Layer                           ││
│  │  Fields + Methods + Constraints + Computed + Related    ││
│  └────────────────────────┬────────────────────────────────┘│
│                           │                                  │
│  ┌────────────────────────▼────────────────────────────────┐│
│  │                   Database Layer                         ││
│  │  PostgreSQL + Queries + Indexes + Transactions          ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 2. Structure d'un Module Odoo

### Structure de Fichiers Standard

```
mon_module/
├── __init__.py                 # Import des packages Python
├── __manifest__.py             # Métadonnées du module
├── models/                     # Modèles de données (ORM)
│   ├── __init__.py
│   ├── mon_modele.py
│   └── res_partner.py          # Extension modèle existant
├── views/                      # Vues XML
│   ├── mon_modele_views.xml
│   ├── res_partner_views.xml
│   └── menus.xml
├── security/                   # Sécurité et permissions
│   ├── ir.model.access.csv     # ACL
│   └── security.xml            # Groupes et règles
├── data/                       # Données initiales
│   ├── data.xml
│   └── sequences.xml
├── demo/                       # Données de démonstration
│   └── demo.xml
├── controllers/                # Controllers HTTP
│   ├── __init__.py
│   └── main.py
├── wizards/                    # Assistants (transient models)
│   ├── __init__.py
│   └── mon_wizard.py
├── reports/                    # Rapports QWeb
│   ├── report_templates.xml
│   └── report_actions.xml
├── static/                     # Fichiers statiques
│   ├── description/
│   │   ├── icon.png            # Icône du module (128x128)
│   │   └── index.html          # Description HTML
│   └── src/
│       ├── js/
│       ├── css/
│       └── xml/
├── i18n/                       # Traductions
│   └── fr.po
├── tests/                      # Tests unitaires
│   ├── __init__.py
│   └── test_mon_modele.py
└── README.md                   # Documentation
```

### Manifest (__manifest__.py)

```python
{
    'name': 'Mon Module',
    'version': '19.0.1.0.0',
    'category': 'Sales/CRM',
    'summary': 'Description courte du module',
    'description': '''
        Description Longue
        ==================
        * Fonctionnalité 1
        * Fonctionnalité 2
    ''',
    'author': 'Mon Entreprise',
    'website': 'https://www.monentreprise.com',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'sale',
        'account',
        'mail',
    ],
    'external_dependencies': {
        'python': ['requests', 'pydantic'],
    },
    'data': [
        # Sécurité en premier
        'security/security.xml',
        'security/ir.model.access.csv',
        # Puis les données
        'data/sequences.xml',
        'data/data.xml',
        # Puis les vues
        'views/mon_modele_views.xml',
        'views/menus.xml',
        # Wizards
        'wizards/mon_wizard_views.xml',
        # Reports
        'reports/report_templates.xml',
    ],
    'demo': [
        'demo/demo.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'mon_module/static/src/js/**/*',
            'mon_module/static/src/css/**/*',
            'mon_module/static/src/xml/**/*',
        ],
    },
    'installable': True,
    'application': True,
    'auto_install': False,
    'post_init_hook': 'post_init_hook',
    'uninstall_hook': 'uninstall_hook',
}
```

## 3. ORM Odoo - Référence Complète

### Types de Modèles

```python
from odoo import models, fields, api

# Model standard (persistant en base)
class MonModele(models.Model):
    _name = 'mon.modele'
    _description = 'Description'

# Model transient (temporaire, pour wizards)
class MonWizard(models.TransientModel):
    _name = 'mon.wizard'
    _description = 'Assistant'

# Model abstrait (pas de table, pour héritage)
class MonMixin(models.AbstractModel):
    _name = 'mon.mixin'
    _description = 'Mixin'
```

### Types de Champs Complets

```python
from odoo import models, fields, api
from odoo.exceptions import ValidationError, UserError

class ExempleComplet(models.Model):
    _name = 'exemple.complet'
    _description = 'Exemple de tous les types de champs'
    _order = 'sequence, name'
    _rec_name = 'display_name'

    # === CHAMPS SIMPLES ===

    # Char - Chaîne courte
    name = fields.Char(
        string='Nom',
        required=True,
        index=True,
        translate=True,
        size=100,  # Limite de caractères
        trim=True,  # Supprime espaces
        tracking=True,  # Historique modifications
    )

    # Text - Texte long
    description = fields.Text(
        string='Description',
        translate=True,
    )

    # Html - Contenu HTML
    content = fields.Html(
        string='Contenu',
        sanitize=True,
        sanitize_attributes=True,
        sanitize_style=True,
        strip_classes=True,
    )

    # Boolean
    active = fields.Boolean(
        string='Actif',
        default=True,
    )

    # Integer
    sequence = fields.Integer(
        string='Séquence',
        default=10,
    )

    # Float
    amount = fields.Float(
        string='Montant',
        digits=(16, 2),  # Précision
        default=0.0,
    )

    # Monetary (avec devise)
    price = fields.Monetary(
        string='Prix',
        currency_field='currency_id',
    )
    currency_id = fields.Many2one(
        'res.currency',
        string='Devise',
        default=lambda self: self.env.company.currency_id,
    )

    # Date
    date = fields.Date(
        string='Date',
        default=fields.Date.today,
        # default=fields.Date.context_today,  # Avec timezone
    )

    # Datetime
    datetime = fields.Datetime(
        string='Date et Heure',
        default=fields.Datetime.now,
    )

    # Selection
    state = fields.Selection(
        selection=[
            ('draft', 'Brouillon'),
            ('confirmed', 'Confirmé'),
            ('done', 'Terminé'),
            ('cancelled', 'Annulé'),
        ],
        string='État',
        default='draft',
        required=True,
        copy=False,
        tracking=True,
    )

    # Binary (fichiers, images)
    image = fields.Binary(
        string='Image',
        attachment=True,  # Stocké comme pièce jointe
    )
    image_filename = fields.Char(string='Nom du fichier')

    # Image avec redimensionnement
    image_1920 = fields.Image(
        string='Image HD',
        max_width=1920,
        max_height=1920,
    )
    image_128 = fields.Image(
        string='Thumbnail',
        related='image_1920',
        max_width=128,
        max_height=128,
        store=True,
    )

    # === CHAMPS RELATIONNELS ===

    # Many2one (FK)
    partner_id = fields.Many2one(
        comodel_name='res.partner',
        string='Client',
        required=True,
        ondelete='restrict',  # restrict, cascade, set null
        index=True,
        domain="[('is_company', '=', True)]",
        context={'show_email': True},
        check_company=True,
    )

    # One2many (reverse FK)
    line_ids = fields.One2many(
        comodel_name='exemple.complet.line',
        inverse_name='parent_id',
        string='Lignes',
        copy=True,
    )

    # Many2many
    tag_ids = fields.Many2many(
        comodel_name='exemple.tag',
        relation='exemple_complet_tag_rel',  # Table pivot
        column1='exemple_id',
        column2='tag_id',
        string='Tags',
    )

    # === CHAMPS CALCULÉS ===

    # Computed (calculé à la volée)
    total = fields.Float(
        string='Total',
        compute='_compute_total',
        store=True,  # Stocké en base (recalculé si dépendances changent)
        readonly=True,
    )

    # Computed inverse (modifiable)
    total_with_tax = fields.Float(
        string='Total TTC',
        compute='_compute_total_with_tax',
        inverse='_inverse_total_with_tax',
        store=True,
    )

    # Related (champ d'un modèle lié)
    partner_email = fields.Char(
        string='Email client',
        related='partner_id.email',
        readonly=True,  # False si on veut pouvoir modifier
        store=False,  # True pour indexer/rechercher
    )

    # === CHAMPS SPÉCIAUX ===

    # Company (multi-société)
    company_id = fields.Many2one(
        'res.company',
        string='Société',
        required=True,
        default=lambda self: self.env.company,
        index=True,
    )

    # User
    user_id = fields.Many2one(
        'res.users',
        string='Responsable',
        default=lambda self: self.env.user,
        tracking=True,
    )

    # Reference (lien polymorphique)
    ref = fields.Reference(
        selection=[
            ('sale.order', 'Commande'),
            ('account.move', 'Facture'),
        ],
        string='Référence',
    )

    # === MÉTHODES COMPUTE ===

    @api.depends('line_ids.subtotal')
    def _compute_total(self):
        for record in self:
            record.total = sum(record.line_ids.mapped('subtotal'))

    @api.depends('total')
    def _compute_total_with_tax(self):
        for record in self:
            record.total_with_tax = record.total * 1.20  # TVA 20%

    def _inverse_total_with_tax(self):
        for record in self:
            record.total = record.total_with_tax / 1.20

    # === CONTRAINTES ===

    _sql_constraints = [
        ('name_unique', 'UNIQUE(name, company_id)', 'Le nom doit être unique!'),
        ('amount_positive', 'CHECK(amount >= 0)', 'Le montant doit être positif!'),
    ]

    @api.constrains('date', 'datetime')
    def _check_dates(self):
        for record in self:
            if record.date and record.datetime:
                if record.date > record.datetime.date():
                    raise ValidationError("La date ne peut pas être après la date/heure!")

    # === ONCHANGE ===

    @api.onchange('partner_id')
    def _onchange_partner_id(self):
        if self.partner_id:
            self.currency_id = self.partner_id.currency_id
            return {
                'warning': {
                    'title': 'Attention',
                    'message': 'Client sélectionné: %s' % self.partner_id.name,
                },
                'domain': {
                    'user_id': [('company_id', '=', self.partner_id.company_id.id)],
                },
            }

    # === MÉTHODES CRUD ===

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', 'New') == 'New':
                vals['name'] = self.env['ir.sequence'].next_by_code('exemple.complet')
        return super().create(vals_list)

    def write(self, vals):
        # Vérifications avant écriture
        if 'state' in vals and vals['state'] == 'done':
            for record in self:
                if not record.line_ids:
                    raise UserError("Impossible de terminer sans lignes!")
        return super().write(vals)

    def unlink(self):
        for record in self:
            if record.state not in ('draft', 'cancelled'):
                raise UserError("Suppression interdite pour les enregistrements confirmés!")
        return super().unlink()

    def copy(self, default=None):
        default = dict(default or {})
        default['name'] = '%s (copie)' % self.name
        return super().copy(default)

    # === MÉTHODES MÉTIER ===

    def action_confirm(self):
        for record in self:
            if record.state != 'draft':
                raise UserError("Seuls les brouillons peuvent être confirmés!")
            record.state = 'confirmed'
        return True

    def action_done(self):
        self.write({'state': 'done'})

    def action_cancel(self):
        self.write({'state': 'cancelled'})

    def action_draft(self):
        self.write({'state': 'draft'})
```

### Méthodes de Recherche

```python
# search() - Retourne des recordsets
records = self.env['res.partner'].search([
    ('is_company', '=', True),
    ('country_id.code', '=', 'FR'),
    '|',
    ('email', 'ilike', '@gmail.com'),
    ('email', 'ilike', '@outlook.com'),
], order='name ASC', limit=100, offset=0)

# search_count() - Compte uniquement
count = self.env['res.partner'].search_count([('active', '=', True)])

# search_read() - Search + Read en une requête
data = self.env['res.partner'].search_read(
    domain=[('is_company', '=', True)],
    fields=['name', 'email', 'phone'],
    limit=10,
)

# read_group() - Agrégation (GROUP BY)
results = self.env['sale.order'].read_group(
    domain=[('state', '=', 'sale')],
    fields=['partner_id', 'amount_total:sum'],
    groupby=['partner_id'],
    orderby='amount_total DESC',
    limit=10,
)

# browse() - Récupérer par IDs
records = self.env['res.partner'].browse([1, 2, 3])

# name_search() - Recherche par nom (autocomplete)
results = self.env['res.partner'].name_search(
    name='Dupont',
    args=[('is_company', '=', False)],
    operator='ilike',
    limit=10,
)
```

### Opérateurs de Domaine

| Opérateur | Description | Exemple |
|-----------|-------------|---------|
| `=` | Égal | `('state', '=', 'draft')` |
| `!=` | Différent | `('state', '!=', 'cancelled')` |
| `>`, `>=`, `<`, `<=` | Comparaison | `('amount', '>', 100)` |
| `like` | Contient (sensible casse) | `('name', 'like', 'test')` |
| `ilike` | Contient (insensible casse) | `('email', 'ilike', '@gmail')` |
| `=like` | Pattern SQL | `('code', '=like', 'SO%')` |
| `=ilike` | Pattern SQL (insensible) | `('code', '=ilike', 'so%')` |
| `in` | Dans la liste | `('state', 'in', ['draft', 'sent'])` |
| `not in` | Pas dans la liste | `('state', 'not in', ['cancelled'])` |
| `child_of` | Enfant de (hiérarchie) | `('parent_id', 'child_of', 5)` |
| `parent_of` | Parent de | `('id', 'parent_of', [10, 11])` |
| `&` | ET (implicite) | `('a', '=', 1), ('b', '=', 2)` |
| `\|` | OU | `'\|', ('a', '=', 1), ('b', '=', 2)` |
| `!` | NON | `'!', ('active', '=', True)` |

## 4. Sécurité Odoo

### Groupes d'Utilisateurs

```xml
<!-- security/security.xml -->
<odoo>
    <!-- Catégorie -->
    <record id="module_category_mon_module" model="ir.module.category">
        <field name="name">Mon Module</field>
        <field name="sequence">100</field>
    </record>

    <!-- Groupe Utilisateur -->
    <record id="group_user" model="res.groups">
        <field name="name">Utilisateur</field>
        <field name="category_id" ref="module_category_mon_module"/>
    </record>

    <!-- Groupe Manager (inclut Utilisateur) -->
    <record id="group_manager" model="res.groups">
        <field name="name">Manager</field>
        <field name="category_id" ref="module_category_mon_module"/>
        <field name="implied_ids" eval="[(4, ref('group_user'))]"/>
        <field name="users" eval="[(4, ref('base.user_root')), (4, ref('base.user_admin'))]"/>
    </record>
</odoo>
```

### Access Control Lists (ACL)

```csv
# security/ir.model.access.csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_mon_modele_user,mon.modele.user,model_mon_modele,group_user,1,0,0,0
access_mon_modele_manager,mon.modele.manager,model_mon_modele,group_manager,1,1,1,1
access_mon_modele_line_user,mon.modele.line.user,model_mon_modele_line,group_user,1,0,0,0
access_mon_modele_line_manager,mon.modele.line.manager,model_mon_modele_line,group_manager,1,1,1,1
```

### Record Rules (Row-Level Security)

```xml
<!-- security/security.xml -->
<odoo>
    <!-- Règle multi-société -->
    <record id="rule_mon_modele_company" model="ir.rule">
        <field name="name">Mon Modèle: Multi-Société</field>
        <field name="model_id" ref="model_mon_modele"/>
        <field name="domain_force">[
            '|',
            ('company_id', '=', False),
            ('company_id', 'in', company_ids)
        ]</field>
    </record>

    <!-- Règle: Utilisateur voit ses propres enregistrements -->
    <record id="rule_mon_modele_user_own" model="ir.rule">
        <field name="name">Mon Modèle: Propres enregistrements</field>
        <field name="model_id" ref="model_mon_modele"/>
        <field name="groups" eval="[(4, ref('group_user'))]"/>
        <field name="domain_force">[('user_id', '=', user.id)]</field>
        <field name="perm_read" eval="True"/>
        <field name="perm_write" eval="True"/>
        <field name="perm_create" eval="True"/>
        <field name="perm_unlink" eval="False"/>
    </record>

    <!-- Règle: Manager voit tout -->
    <record id="rule_mon_modele_manager_all" model="ir.rule">
        <field name="name">Mon Modèle: Manager - Tout</field>
        <field name="model_id" ref="model_mon_modele"/>
        <field name="groups" eval="[(4, ref('group_manager'))]"/>
        <field name="domain_force">[(1, '=', 1)]</field>
    </record>
</odoo>
```

## 5. Tests Odoo

### Structure des Tests

```python
# tests/__init__.py
from . import test_mon_modele
from . import test_integration

# tests/test_mon_modele.py
from odoo.tests.common import TransactionCase, tagged
from odoo.exceptions import ValidationError, UserError
from unittest.mock import patch, MagicMock

@tagged('post_install', '-at_install')
class TestMonModele(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # Création données de test
        cls.partner = cls.env['res.partner'].create({
            'name': 'Test Partner',
            'email': 'test@example.com',
        })
        cls.product = cls.env['product.product'].create({
            'name': 'Test Product',
            'list_price': 100.0,
        })

    def test_create_record(self):
        """Test création d'enregistrement"""
        record = self.env['mon.modele'].create({
            'name': 'Test',
            'partner_id': self.partner.id,
        })
        self.assertTrue(record.id)
        self.assertEqual(record.state, 'draft')

    def test_compute_total(self):
        """Test calcul du total"""
        record = self.env['mon.modele'].create({
            'name': 'Test',
            'partner_id': self.partner.id,
            'line_ids': [
                (0, 0, {'product_id': self.product.id, 'quantity': 2, 'price_unit': 100}),
                (0, 0, {'product_id': self.product.id, 'quantity': 1, 'price_unit': 50}),
            ],
        })
        self.assertEqual(record.total, 250.0)

    def test_action_confirm(self):
        """Test confirmation"""
        record = self.env['mon.modele'].create({
            'name': 'Test',
            'partner_id': self.partner.id,
        })
        record.action_confirm()
        self.assertEqual(record.state, 'confirmed')

    def test_constraint_amount_positive(self):
        """Test contrainte montant positif"""
        with self.assertRaises(ValidationError):
            self.env['mon.modele'].create({
                'name': 'Test',
                'partner_id': self.partner.id,
                'amount': -100,
            })

    def test_unlink_confirmed_raises_error(self):
        """Test suppression enregistrement confirmé"""
        record = self.env['mon.modele'].create({
            'name': 'Test',
            'partner_id': self.partner.id,
        })
        record.action_confirm()
        with self.assertRaises(UserError):
            record.unlink()

    @patch('odoo.addons.mon_module.models.mon_modele.requests.get')
    def test_api_call(self, mock_get):
        """Test appel API avec mock"""
        mock_response = MagicMock()
        mock_response.json.return_value = {'data': [{'id': 1}]}
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        record = self.env['mon.modele'].create({
            'name': 'Test',
            'partner_id': self.partner.id,
        })
        result = record.fetch_external_data()

        mock_get.assert_called_once()
        self.assertEqual(len(result), 1)
```

### Exécution des Tests

```bash
# Tous les tests du module
./odoo-bin -c odoo.conf -d test_db --test-enable -i mon_module --stop-after-init

# Tests spécifiques
./odoo-bin -c odoo.conf -d test_db --test-tags /mon_module

# Tests avec couverture
coverage run ./odoo-bin -c odoo.conf -d test_db --test-enable -i mon_module --stop-after-init
coverage report -m
coverage html
```

## 6. Déploiement Odoo SH

### Structure pour Odoo.sh

```
mon-projet/
├── .gitignore
├── requirements.txt          # Dépendances Python
├── mon_module/               # Module principal
│   ├── __init__.py
│   ├── __manifest__.py
│   └── ...
├── autre_module/             # Autres modules
└── .odoo.sh/                 # Configuration Odoo.sh (optionnel)
    └── config.yml
```

### Configuration requirements.txt

```txt
# requirements.txt
requests>=2.28.0
pydantic>=2.0.0
python-dateutil>=2.8.0
pytz>=2023.3
```

### Variables d'Environnement Odoo.sh

```python
import os

# Récupérer les variables d'environnement
API_KEY = os.environ.get('OCTORATE_API_KEY', '')
API_SECRET = os.environ.get('OCTORATE_API_SECRET', '')
WEBHOOK_SECRET = os.environ.get('OCTORATE_WEBHOOK_SECRET', '')
```

## 7. Bonnes Pratiques

### Performance
1. **Éviter N+1 queries** : Utiliser `prefetch_fields` ou `mapped()`
2. **Stocker les computed fields** si utilisés dans les recherches/filtres
3. **Utiliser `read_group()`** pour les agrégations
4. **Limiter les `search()`** avec `limit` quand possible
5. **Utiliser `with_context(prefetch_fields=False)`** pour les gros volumes

### Sécurité
1. **Toujours définir les ACL** pour chaque modèle
2. **Utiliser `sudo()` avec parcimonie** et revenir au contexte normal
3. **Valider les webhooks** avec HMAC
4. **Ne jamais logger** les données sensibles
5. **Utiliser `escape()`** pour le contenu HTML

### Maintenabilité
1. **Un modèle par fichier**
2. **Préfixer les champs custom** avec `x_`
3. **Documenter les méthodes** avec docstrings
4. **Écrire des tests** pour chaque fonctionnalité critique
5. **Suivre les conventions** de nommage Odoo

### Code Style
```python
# Imports groupés
from odoo import api, fields, models, _
from odoo.exceptions import UserError, ValidationError
from odoo.tools import float_compare, float_is_zero

# Puis imports standards
import logging
import json
from datetime import datetime, timedelta

_logger = logging.getLogger(__name__)
```

---

## 8. Controllers & REST APIs

### 8.1 Portal Controllers

```python
# Contrôleur Portal avec access_token
from odoo import http
from odoo.http import request
from odoo.addons.portal.controllers.portal import CustomerPortal, pager

class MyPortal(CustomerPortal):

    def _prepare_home_portal_values(self, counters):
        """Ajouter des compteurs au portail"""
        values = super()._prepare_home_portal_values(counters)
        if 'order_count' in counters:
            values['order_count'] = request.env['sale.order'].search_count([
                ('partner_id', '=', request.env.user.partner_id.id)
            ])
        return values

    @http.route(['/my/orders', '/my/orders/page/<int:page>'],
                type='http', auth="user", website=True)
    def portal_my_orders(self, page=1, sortby=None, **kw):
        values = self._prepare_portal_layout_values()
        Order = request.env['sale.order']

        domain = [('partner_id', '=', request.env.user.partner_id.id)]

        # Pagination
        order_count = Order.search_count(domain)
        pager_values = pager(
            url="/my/orders",
            total=order_count,
            page=page,
            step=10
        )

        orders = Order.search(domain, limit=10, offset=pager_values['offset'])

        values.update({
            'orders': orders,
            'pager': pager_values,
            'page_name': 'orders',
        })
        return request.render("module.portal_my_orders", values)

    @http.route(['/my/orders/<int:order_id>'], type='http', auth="public", website=True)
    def portal_order_page(self, order_id, access_token=None, **kw):
        """Page détail commande avec validation access_token"""
        try:
            order_sudo = self._document_check_access(
                'sale.order', order_id, access_token=access_token
            )
        except (AccessError, MissingError):
            return request.redirect('/my')

        values = {
            'order': order_sudo,
            'page_name': 'order',
        }
        return request.render("module.portal_order_page", values)
```

### 8.2 API JSONRPC

```python
from odoo import http
from odoo.http import request
import json

class APIController(http.Controller):

    @http.route('/api/v1/orders', type='json', auth='user', methods=['POST'])
    def create_order(self, **kwargs):
        """Créer une commande via API JSON"""
        try:
            order = request.env['sale.order'].create({
                'partner_id': kwargs.get('partner_id'),
                'date_order': kwargs.get('date_order'),
            })
            return {'success': True, 'id': order.id, 'name': order.name}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @http.route('/api/v1/orders/<int:order_id>', type='json', auth='user', methods=['GET'])
    def get_order(self, order_id):
        """Récupérer une commande"""
        order = request.env['sale.order'].browse(order_id)
        if not order.exists():
            return {'error': 'Order not found'}
        return {
            'id': order.id,
            'name': order.name,
            'state': order.state,
            'amount_total': order.amount_total,
            'partner': {'id': order.partner_id.id, 'name': order.partner_id.name},
        }

    @http.route('/api/v1/webhook', type='json', auth='public', methods=['POST'], csrf=False)
    def webhook_handler(self, **post):
        """Handler webhook externe"""
        # Validation signature
        signature = request.httprequest.headers.get('X-Signature')
        if not self._verify_signature(signature, request.httprequest.data):
            return {'error': 'Invalid signature'}, 401

        event_type = post.get('event_type')
        if event_type == 'order.created':
            self._handle_order_created(post.get('data'))

        return {'status': 'ok'}

    def _verify_signature(self, signature, payload):
        """Vérifier HMAC signature"""
        import hmac
        import hashlib
        secret = request.env['ir.config_parameter'].sudo().get_param('webhook.secret')
        expected = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
        return hmac.compare_digest(signature or '', expected)
```

### 8.3 Routes HTTP Publiques

```python
class PublicController(http.Controller):

    @http.route('/page/<string:page_slug>', type='http', auth='public', website=True)
    def public_page(self, page_slug, **kw):
        """Page publique avec slug"""
        page = request.env['cms.page'].sudo().search([('slug', '=', page_slug)], limit=1)
        if not page:
            raise werkzeug.exceptions.NotFound()
        return request.render("module.public_page", {'page': page})

    @http.route('/download/<int:doc_id>', type='http', auth='public')
    def download_document(self, doc_id, access_token=None):
        """Téléchargement fichier avec token"""
        doc = request.env['ir.attachment'].sudo().browse(doc_id)
        if doc.access_token != access_token:
            raise werkzeug.exceptions.Forbidden()

        return request.make_response(
            doc.datas,
            headers=[
                ('Content-Type', doc.mimetype),
                ('Content-Disposition', f'attachment; filename="{doc.name}"'),
            ]
        )
```

---

## 9. Wizards Avancés (TransientModel)

### 9.1 Pattern default_get avec Contexte

```python
from odoo import api, fields, models

class SaleAdvancePaymentInv(models.TransientModel):
    _name = 'sale.advance.payment.inv'
    _description = 'Sales Advance Payment Invoice'

    advance_payment_method = fields.Selection([
        ('delivered', 'Facture régulière'),
        ('percentage', 'Acompte (pourcentage)'),
        ('fixed', 'Acompte (montant fixe)')
    ], string='Méthode', default='delivered', required=True)

    amount = fields.Float('Montant acompte')
    order_ids = fields.Many2many('sale.order', string='Commandes')

    @api.model
    def default_get(self, fields_list):
        """Pré-remplir depuis le contexte actif"""
        res = super().default_get(fields_list)

        # Récupérer les IDs depuis le contexte
        if self._context.get('active_model') == 'sale.order':
            order_ids = self._context.get('active_ids', [])
            orders = self.env['sale.order'].browse(order_ids)

            res['order_ids'] = [(6, 0, orders.ids)]

            # Calculer montant par défaut
            if len(orders) == 1:
                res['amount'] = orders.amount_total * 0.3  # 30% par défaut

        return res
```

### 9.2 Wizard Multi-Étapes

```python
class MultiStepWizard(models.TransientModel):
    _name = 'multi.step.wizard'
    _description = 'Wizard Multi-Étapes'

    state = fields.Selection([
        ('step1', 'Configuration'),
        ('step2', 'Validation'),
        ('step3', 'Confirmation'),
    ], default='step1')

    # Champs étape 1
    name = fields.Char('Nom')
    partner_id = fields.Many2one('res.partner', 'Client')

    # Champs étape 2
    product_ids = fields.Many2many('product.product', string='Produits')

    # Champs étape 3
    notes = fields.Text('Notes')

    def action_next_step(self):
        """Passer à l'étape suivante"""
        steps = ['step1', 'step2', 'step3']
        current_index = steps.index(self.state)

        if current_index < len(steps) - 1:
            self.state = steps[current_index + 1]

        # Retourner le même wizard (rafraîchir)
        return {
            'type': 'ir.actions.act_window',
            'res_model': self._name,
            'res_id': self.id,
            'view_mode': 'form',
            'target': 'new',
        }

    def action_previous_step(self):
        """Revenir à l'étape précédente"""
        steps = ['step1', 'step2', 'step3']
        current_index = steps.index(self.state)

        if current_index > 0:
            self.state = steps[current_index - 1]

        return {
            'type': 'ir.actions.act_window',
            'res_model': self._name,
            'res_id': self.id,
            'view_mode': 'form',
            'target': 'new',
        }

    def action_confirm(self):
        """Action finale - créer l'enregistrement réel"""
        order = self.env['sale.order'].create({
            'partner_id': self.partner_id.id,
            'note': self.notes,
            'order_line': [(0, 0, {
                'product_id': p.id,
                'product_uom_qty': 1,
            }) for p in self.product_ids],
        })

        # Rediriger vers l'enregistrement créé
        return {
            'type': 'ir.actions.act_window',
            'res_model': 'sale.order',
            'res_id': order.id,
            'view_mode': 'form',
            'target': 'current',
        }
```

### 9.3 Actions Return Patterns

```python
class WizardActions(models.TransientModel):
    _name = 'wizard.actions'
    _description = 'Exemples Actions Wizard'

    def action_open_form(self):
        """Ouvrir un formulaire"""
        return {
            'type': 'ir.actions.act_window',
            'res_model': 'res.partner',
            'res_id': self.partner_id.id,
            'view_mode': 'form',
            'target': 'current',  # 'new' pour popup
        }

    def action_open_list(self):
        """Ouvrir une liste filtrée"""
        return {
            'type': 'ir.actions.act_window',
            'name': 'Produits sélectionnés',
            'res_model': 'product.product',
            'view_mode': 'tree,form',
            'domain': [('id', 'in', self.product_ids.ids)],
            'target': 'current',
        }

    def action_download_report(self):
        """Télécharger un rapport PDF"""
        return self.env.ref('module.report_action_id').report_action(self.order_ids)

    def action_url_redirect(self):
        """Rediriger vers URL externe"""
        return {
            'type': 'ir.actions.act_url',
            'url': 'https://www.example.com',
            'target': 'new',
        }

    def action_client_action(self):
        """Exécuter action client (JS)"""
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': 'Succès',
                'message': 'Opération terminée',
                'type': 'success',
                'sticky': False,
            }
        }

    def action_close_wizard(self):
        """Fermer le wizard et rafraîchir la vue"""
        return {'type': 'ir.actions.act_window_close'}
```

---

## 10. Reports QWeb

### 10.1 Pattern _get_report_values

```python
from odoo import api, models

class SaleOrderReport(models.AbstractModel):
    _name = 'report.module.report_saleorder'
    _description = 'Sale Order Report'

    @api.model
    def _get_report_values(self, docids, data=None):
        """Préparer les données pour le rapport"""
        docs = self.env['sale.order'].browse(docids)

        return {
            'doc_ids': docids,
            'doc_model': 'sale.order',
            'docs': docs,
            'data': data,
            'company': self.env.company,
            # Données calculées
            'get_totals': self._get_totals,
            'format_date': self._format_date,
        }

    def _get_totals(self, orders):
        """Calculer totaux pour groupe de commandes"""
        return {
            'count': len(orders),
            'total_amount': sum(o.amount_total for o in orders),
            'avg_amount': sum(o.amount_total for o in orders) / len(orders) if orders else 0,
        }

    def _format_date(self, date, format='%d/%m/%Y'):
        """Formater une date"""
        return date.strftime(format) if date else ''
```

### 10.2 Template QWeb Report

```xml
<?xml version="1.0" encoding="UTF-8"?>
<odoo>
    <!-- Définition du rapport -->
    <record id="action_report_saleorder" model="ir.actions.report">
        <field name="name">Devis / Commande</field>
        <field name="model">sale.order</field>
        <field name="report_type">qweb-pdf</field>
        <field name="report_name">module.report_saleorder</field>
        <field name="report_file">module.report_saleorder</field>
        <field name="print_report_name">'Commande - %s' % object.name</field>
        <field name="binding_model_id" ref="sale.model_sale_order"/>
        <field name="binding_type">report</field>
        <field name="paperformat_id" ref="base.paperformat_euro"/>
    </record>

    <!-- Template principal -->
    <template id="report_saleorder">
        <t t-call="web.html_container">
            <t t-foreach="docs" t-as="doc">
                <t t-call="module.report_saleorder_document"/>
            </t>
        </t>
    </template>

    <!-- Template document -->
    <template id="report_saleorder_document">
        <t t-call="web.external_layout">
            <t t-set="doc" t-value="doc"/>

            <div class="page">
                <!-- En-tête -->
                <div class="row">
                    <div class="col-6">
                        <h2>
                            <span t-if="doc.state == 'draft'">Devis</span>
                            <span t-else="">Commande</span>
                            <span t-field="doc.name"/>
                        </h2>
                    </div>
                    <div class="col-6 text-end">
                        <strong>Date:</strong>
                        <span t-field="doc.date_order" t-options="{'widget': 'date'}"/>
                    </div>
                </div>

                <!-- Adresse client -->
                <div class="row mt-4">
                    <div class="col-6">
                        <strong>Client:</strong>
                        <div t-field="doc.partner_id"
                             t-options='{"widget": "contact", "fields": ["address", "name", "phone"]}'/>
                    </div>
                </div>

                <!-- Tableau lignes -->
                <table class="table table-sm mt-4">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th class="text-end">Quantité</th>
                            <th class="text-end">Prix unit.</th>
                            <th class="text-end">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <t t-foreach="doc.order_line" t-as="line">
                            <tr>
                                <td>
                                    <span t-field="line.product_id.name"/>
                                    <small t-if="line.name != line.product_id.name" class="text-muted">
                                        <br/><span t-field="line.name"/>
                                    </small>
                                </td>
                                <td class="text-end">
                                    <span t-field="line.product_uom_qty"/>
                                    <span t-field="line.product_uom"/>
                                </td>
                                <td class="text-end">
                                    <span t-field="line.price_unit" t-options="{'widget': 'monetary', 'display_currency': doc.currency_id}"/>
                                </td>
                                <td class="text-end">
                                    <span t-field="line.price_subtotal" t-options="{'widget': 'monetary', 'display_currency': doc.currency_id}"/>
                                </td>
                            </tr>
                        </t>
                    </tbody>
                </table>

                <!-- Totaux -->
                <div class="row">
                    <div class="col-6 offset-6">
                        <table class="table table-sm">
                            <tr>
                                <td><strong>Sous-total HT</strong></td>
                                <td class="text-end">
                                    <span t-field="doc.amount_untaxed" t-options="{'widget': 'monetary', 'display_currency': doc.currency_id}"/>
                                </td>
                            </tr>
                            <tr>
                                <td>Taxes</td>
                                <td class="text-end">
                                    <span t-field="doc.amount_tax" t-options="{'widget': 'monetary', 'display_currency': doc.currency_id}"/>
                                </td>
                            </tr>
                            <tr class="border-top">
                                <td><strong>Total TTC</strong></td>
                                <td class="text-end">
                                    <strong>
                                        <span t-field="doc.amount_total" t-options="{'widget': 'monetary', 'display_currency': doc.currency_id}"/>
                                    </strong>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>

                <!-- Notes -->
                <div t-if="doc.note" class="mt-4">
                    <strong>Notes:</strong>
                    <p t-field="doc.note"/>
                </div>
            </div>
        </t>
    </template>
</odoo>
```

### 10.3 Custom Paper Format

```xml
<record id="paperformat_custom" model="report.paperformat">
    <field name="name">Format Personnalisé</field>
    <field name="default" eval="False"/>
    <field name="format">custom</field>
    <field name="page_height">297</field>
    <field name="page_width">210</field>
    <field name="orientation">Portrait</field>
    <field name="margin_top">40</field>
    <field name="margin_bottom">20</field>
    <field name="margin_left">7</field>
    <field name="margin_right">7</field>
    <field name="header_line" eval="False"/>
    <field name="header_spacing">35</field>
    <field name="dpi">90</field>
</record>
```

---

## 11. Mail Integration

### 11.1 mail.thread et mail.activity.mixin

```python
from odoo import api, fields, models

class SaleOrder(models.Model):
    _name = 'sale.order'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _description = 'Commande'

    name = fields.Char(tracking=True)
    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('sent', 'Envoyé'),
        ('sale', 'Confirmé'),
        ('done', 'Terminé'),
        ('cancel', 'Annulé'),
    ], default='draft', tracking=True)

    partner_id = fields.Many2one('res.partner', tracking=True)
    user_id = fields.Many2one('res.users', tracking=True)
    amount_total = fields.Monetary(tracking=True)
    date_order = fields.Datetime(tracking=True)

    # Champs sans tracking (trop verbeux)
    note = fields.Text()
    order_line = fields.One2many('sale.order.line', 'order_id')
```

### 11.2 message_post Patterns

```python
class SaleOrder(models.Model):
    _inherit = 'sale.order'

    def action_confirm(self):
        """Confirmer la commande avec notification"""
        res = super().action_confirm()

        # Message simple
        self.message_post(
            body="La commande a été confirmée",
            subject="Confirmation",
            message_type='notification',
            subtype_xmlid='mail.mt_note',
        )
        return res

    def action_send_email(self):
        """Envoyer email avec template"""
        template = self.env.ref('sale.email_template_edi_sale')
        self.message_post_with_source(
            template,
            email_layout_xmlid='mail.mail_notification_layout_with_responsible_signature',
            subtype_xmlid='mail.mt_comment',
        )

    def action_log_with_attachment(self):
        """Log avec pièce jointe"""
        attachment = self.env['ir.attachment'].create({
            'name': 'rapport.pdf',
            'type': 'binary',
            'datas': base64.b64encode(pdf_content),
            'res_model': self._name,
            'res_id': self.id,
        })

        self.message_post(
            body="Rapport généré",
            attachment_ids=[attachment.id],
            message_type='comment',
        )

    def action_notify_partner(self):
        """Notifier un partenaire spécifique"""
        self.message_post(
            body="Message pour le client",
            partner_ids=[self.partner_id.id],
            message_type='comment',
            subtype_xmlid='mail.mt_comment',
        )

    def action_internal_note(self):
        """Note interne (non visible par le client)"""
        self.message_post(
            body="Note interne pour l'équipe",
            message_type='comment',
            subtype_xmlid='mail.mt_note',  # Note interne
        )
```

### 11.3 activity_schedule Patterns

```python
from datetime import timedelta
from odoo import fields

class SaleOrder(models.Model):
    _inherit = 'sale.order'

    def action_create_followup_activity(self):
        """Créer une activité de suivi"""
        self.activity_schedule(
            'mail.mail_activity_data_todo',
            user_id=self.user_id.id,
            summary="Faire le suivi de la commande",
            note=f"Vérifier la commande {self.name}",
            date_deadline=fields.Date.today() + timedelta(days=7),
        )

    def action_schedule_call(self):
        """Planifier un appel"""
        self.activity_schedule(
            'mail.mail_activity_data_call',
            user_id=self.user_id.id,
            summary=f"Appeler {self.partner_id.name}",
            date_deadline=fields.Date.today() + timedelta(days=1),
        )

    def action_create_meeting(self):
        """Créer une réunion"""
        self.activity_schedule(
            'mail.mail_activity_data_meeting',
            user_id=self.user_id.id,
            summary="Réunion de lancement projet",
            date_deadline=fields.Date.today() + timedelta(days=3),
        )

    def action_complete_activities(self):
        """Marquer activités comme terminées"""
        activities = self.activity_ids.filtered(
            lambda a: a.activity_type_id.name == 'To Do'
        )
        activities.action_done()

    def action_cancel_activities(self):
        """Annuler toutes les activités"""
        self.activity_ids.unlink()
```

### 11.4 Mail Templates

```xml
<record id="email_template_sale_confirmation" model="mail.template">
    <field name="name">Confirmation Commande</field>
    <field name="model_id" ref="sale.model_sale_order"/>
    <field name="subject">Confirmation de votre commande {{ object.name }}</field>
    <field name="email_from">{{ (object.company_id.email or user.email) }}</field>
    <field name="email_to">{{ object.partner_id.email }}</field>
    <field name="body_html" type="html">
        <div style="margin: 0px; padding: 0px;">
            <p>Bonjour {{ object.partner_id.name }},</p>
            <p>Nous vous confirmons votre commande <strong>{{ object.name }}</strong>.</p>
            <p>
                <strong>Montant total:</strong> {{ object.amount_total }} {{ object.currency_id.symbol }}
            </p>
            <p>Cordialement,<br/>{{ object.user_id.name or 'L\'équipe commerciale' }}</p>
        </div>
    </field>
    <field name="report_template_ids" eval="[(4, ref('sale.action_report_saleorder'))]"/>
    <field name="auto_delete" eval="True"/>
</record>
```

### 11.5 Chatter Widget XML

```xml
<!-- Vue Form avec chatter -->
<record id="view_order_form" model="ir.ui.view">
    <field name="name">sale.order.form</field>
    <field name="model">sale.order</field>
    <field name="arch" type="xml">
        <form>
            <header>
                <button name="action_confirm" string="Confirmer" type="object"/>
            </header>
            <sheet>
                <group>
                    <field name="name"/>
                    <field name="partner_id"/>
                    <field name="amount_total"/>
                </group>
            </sheet>
            <!-- Chatter -->
            <chatter/>
        </form>
    </field>
</record>

<!-- Alternative avec composants explicites -->
<record id="view_order_form_explicit" model="ir.ui.view">
    <field name="name">sale.order.form.explicit</field>
    <field name="model">sale.order</field>
    <field name="arch" type="xml">
        <form>
            <sheet>
                <!-- Contenu -->
            </sheet>
            <div class="oe_chatter">
                <field name="message_follower_ids"/>
                <field name="activity_ids"/>
                <field name="message_ids"/>
            </div>
        </form>
    </field>
</record>
```

---

## 12. Importable Modules (XML-Only)

### 12.1 Concept

Les **Importable Modules** permettent de créer des modules Odoo **sans code Python**, uniquement avec des fichiers XML. Idéal pour :

- Personnalisations légères par consultants fonctionnels
- Configurations métier sans développeur
- Prototypage rapide

### 12.2 Structure Minimale

```
mon_module_xml/
├── __manifest__.py
├── data/
│   ├── server_actions.xml
│   ├── automated_actions.xml
│   └── config_data.xml
├── security/
│   └── ir.model.access.csv
└── views/
    └── views.xml
```

**Manifest minimal (sans __init__.py):**

```python
# __manifest__.py
{
    'name': 'Mon Module XML',
    'version': '19.0.1.0.0',
    'category': 'Customizations',
    'summary': 'Personnalisations sans code Python',
    'depends': ['base', 'sale', 'mail'],
    'data': [
        'security/ir.model.access.csv',
        'data/server_actions.xml',
        'data/automated_actions.xml',
        'views/views.xml',
    ],
    'installable': True,
    'application': False,
}
```

### 12.3 Server Actions (Logique Métier)

```xml
<!-- data/server_actions.xml -->
<odoo>
    <!-- Action: Mettre à jour un champ -->
    <record id="action_set_priority_high" model="ir.actions.server">
        <field name="name">Définir Priorité Haute</field>
        <field name="model_id" ref="sale.model_sale_order"/>
        <field name="state">code</field>
        <field name="code">
for record in records:
    record.priority = '3'
    record.message_post(body="Priorité définie comme Haute")
        </field>
    </record>

    <!-- Action: Créer un enregistrement lié -->
    <record id="action_create_task_from_order" model="ir.actions.server">
        <field name="name">Créer Tâche depuis Commande</field>
        <field name="model_id" ref="sale.model_sale_order"/>
        <field name="state">code</field>
        <field name="code">
for record in records:
    if record.state == 'sale':
        env['project.task'].create({
            'name': f'Suivi commande {record.name}',
            'partner_id': record.partner_id.id,
            'description': f'Commande: {record.name}\nMontant: {record.amount_total}',
        })
        </field>
    </record>

    <!-- Action: Envoyer un email -->
    <record id="action_send_reminder_email" model="ir.actions.server">
        <field name="name">Envoyer Rappel</field>
        <field name="model_id" ref="sale.model_sale_order"/>
        <field name="state">email</field>
        <field name="email_template_id" ref="module.email_template_reminder"/>
    </record>

    <!-- Action: Ajouter un follower -->
    <record id="action_add_manager_follower" model="ir.actions.server">
        <field name="name">Ajouter Manager comme Follower</field>
        <field name="model_id" ref="sale.model_sale_order"/>
        <field name="state">code</field>
        <field name="code">
for record in records:
    manager = env.ref('base.user_admin').partner_id
    record.message_subscribe(partner_ids=[manager.id])
        </field>
    </record>

    <!-- Action: Multi-actions -->
    <record id="action_process_order_complete" model="ir.actions.server">
        <field name="name">Traitement Complet Commande</field>
        <field name="model_id" ref="sale.model_sale_order"/>
        <field name="state">multi</field>
        <field name="child_ids" eval="[
            (4, ref('action_set_priority_high')),
            (4, ref('action_create_task_from_order')),
            (4, ref('action_add_manager_follower')),
        ]"/>
    </record>
</odoo>
```

### 12.4 Automated Actions (Triggers)

```xml
<!-- data/automated_actions.xml -->
<odoo>
    <!-- Trigger: À la création -->
    <record id="rule_on_order_create" model="base.automation">
        <field name="name">À la création de commande</field>
        <field name="model_id" ref="sale.model_sale_order"/>
        <field name="trigger">on_create</field>
        <field name="action_server_ids" eval="[(4, ref('action_add_manager_follower'))]"/>
    </record>

    <!-- Trigger: À la modification d'un champ -->
    <record id="rule_on_state_change" model="base.automation">
        <field name="name">Changement d'état vers Confirmé</field>
        <field name="model_id" ref="sale.model_sale_order"/>
        <field name="trigger">on_state_set</field>
        <field name="trg_selection_field_id" ref="sale.field_sale_order__state"/>
        <field name="trg_field_ref_display_names">sale</field>
        <field name="action_server_ids" eval="[(4, ref('action_create_task_from_order'))]"/>
    </record>

    <!-- Trigger: Condition sur un champ -->
    <record id="rule_high_value_order" model="base.automation">
        <field name="name">Commande Haute Valeur</field>
        <field name="model_id" ref="sale.model_sale_order"/>
        <field name="trigger">on_write</field>
        <field name="trigger_field_ids" eval="[(4, ref('sale.field_sale_order__amount_total'))]"/>
        <field name="filter_domain">[('amount_total', '>=', 10000)]</field>
        <field name="action_server_ids" eval="[(4, ref('action_set_priority_high'))]"/>
    </record>

    <!-- Trigger: Basé sur le temps (cron) -->
    <record id="rule_overdue_reminder" model="base.automation">
        <field name="name">Rappel Devis Expirés</field>
        <field name="model_id" ref="sale.model_sale_order"/>
        <field name="trigger">on_time</field>
        <field name="trg_date_id" ref="sale.field_sale_order__validity_date"/>
        <field name="trg_date_range">-1</field>
        <field name="trg_date_range_type">day</field>
        <field name="filter_domain">[('state', '=', 'draft')]</field>
        <field name="action_server_ids" eval="[(4, ref('action_send_reminder_email'))]"/>
    </record>

    <!-- Trigger: À la suppression -->
    <record id="rule_on_delete_log" model="base.automation">
        <field name="name">Log à la suppression</field>
        <field name="model_id" ref="sale.model_sale_order"/>
        <field name="trigger">on_unlink</field>
        <field name="action_server_ids" eval="[(4, ref('action_log_deletion'))]"/>
    </record>
</odoo>
```

### 12.5 Données de Configuration

```xml
<!-- data/config_data.xml -->
<odoo>
    <!-- Séquence personnalisée -->
    <record id="seq_custom_ref" model="ir.sequence">
        <field name="name">Référence Personnalisée</field>
        <field name="code">custom.reference</field>
        <field name="prefix">CUST/%(year)s/</field>
        <field name="padding">5</field>
    </record>

    <!-- Email Template -->
    <record id="email_template_reminder" model="mail.template">
        <field name="name">Rappel Devis</field>
        <field name="model_id" ref="sale.model_sale_order"/>
        <field name="subject">Rappel: Votre devis {{ object.name }} expire bientôt</field>
        <field name="email_to">{{ object.partner_id.email }}</field>
        <field name="body_html" type="html">
            <p>Bonjour {{ object.partner_id.name }},</p>
            <p>Votre devis <strong>{{ object.name }}</strong> d'un montant de
               {{ object.amount_total }} {{ object.currency_id.symbol }}
               arrive à expiration.</p>
            <p>N'hésitez pas à nous contacter.</p>
        </field>
    </record>

    <!-- Paramètre système -->
    <record id="config_custom_threshold" model="ir.config_parameter">
        <field name="key">custom.high_value_threshold</field>
        <field name="value">10000</field>
    </record>

    <!-- Groupe de données (noupdate) -->
    <data noupdate="1">
        <record id="default_note" model="ir.default">
            <field name="field_id" ref="sale.field_sale_order__note"/>
            <field name="json_value">"Conditions générales de vente applicables."</field>
        </record>
    </data>
</odoo>
```

### 12.6 Ajout de Champs via XML

```xml
<!-- data/custom_fields.xml -->
<odoo>
    <!-- Ajouter un champ Selection -->
    <record id="field_sale_order_x_urgency" model="ir.model.fields">
        <field name="name">x_urgency</field>
        <field name="field_description">Urgence</field>
        <field name="model_id" ref="sale.model_sale_order"/>
        <field name="ttype">selection</field>
        <field name="selection">[('low', 'Basse'), ('normal', 'Normale'), ('high', 'Haute'), ('critical', 'Critique')]</field>
        <field name="tracking" eval="True"/>
    </record>

    <!-- Ajouter un champ Many2one -->
    <record id="field_sale_order_x_project_id" model="ir.model.fields">
        <field name="name">x_project_id</field>
        <field name="field_description">Projet Associé</field>
        <field name="model_id" ref="sale.model_sale_order"/>
        <field name="ttype">many2one</field>
        <field name="relation">project.project</field>
    </record>

    <!-- Ajouter un champ Boolean -->
    <record id="field_sale_order_x_is_vip" model="ir.model.fields">
        <field name="name">x_is_vip</field>
        <field name="field_description">Client VIP</field>
        <field name="model_id" ref="sale.model_sale_order"/>
        <field name="ttype">boolean</field>
    </record>
</odoo>
```

### 12.7 Extension de Vues via XML

```xml
<!-- views/views.xml -->
<odoo>
    <!-- Étendre le formulaire de commande -->
    <record id="view_order_form_custom" model="ir.ui.view">
        <field name="name">sale.order.form.custom</field>
        <field name="model">sale.order</field>
        <field name="inherit_id" ref="sale.view_order_form"/>
        <field name="arch" type="xml">
            <!-- Ajouter un champ après partner_id -->
            <xpath expr="//field[@name='partner_id']" position="after">
                <field name="x_urgency"/>
                <field name="x_is_vip"/>
            </xpath>

            <!-- Ajouter un bouton dans le header -->
            <xpath expr="//header" position="inside">
                <button name="%(action_process_order_complete)d"
                        string="Traitement Complet"
                        type="action"
                        class="btn-primary"/>
            </xpath>

            <!-- Ajouter un groupe dans la sheet -->
            <xpath expr="//sheet//group" position="after">
                <group string="Informations Personnalisées">
                    <field name="x_project_id"/>
                </group>
            </xpath>
        </field>
    </record>

    <!-- Ajouter colonnes à la vue liste -->
    <record id="view_order_tree_custom" model="ir.ui.view">
        <field name="name">sale.order.tree.custom</field>
        <field name="model">sale.order</field>
        <field name="inherit_id" ref="sale.view_quotation_tree"/>
        <field name="arch" type="xml">
            <xpath expr="//field[@name='state']" position="before">
                <field name="x_urgency"/>
            </xpath>
        </field>
    </record>

    <!-- Ajouter filtre de recherche -->
    <record id="view_order_search_custom" model="ir.ui.view">
        <field name="name">sale.order.search.custom</field>
        <field name="model">sale.order</field>
        <field name="inherit_id" ref="sale.sale_order_view_search_inherit_sale"/>
        <field name="arch" type="xml">
            <xpath expr="//filter[@name='my_quotation']" position="after">
                <separator/>
                <filter name="vip_orders" string="Clients VIP" domain="[('x_is_vip', '=', True)]"/>
                <filter name="critical_urgency" string="Urgence Critique" domain="[('x_urgency', '=', 'critical')]"/>
            </xpath>
        </field>
    </record>
</odoo>
```

### 12.8 Use Cases Typiques

| Use Case | Solution XML |
|----------|-------------|
| Ajouter un champ | `ir.model.fields` record |
| Notification automatique | `base.automation` + `ir.actions.server` (email) |
| Workflow automatisé | `base.automation` triggers |
| Créer enregistrement lié | Server Action avec code Python inline |
| Modifier valeur à la création | Automated Action `on_create` |
| Rappel programmé | Automated Action `on_time` |
| Valeur par défaut | `ir.default` record |
| Séquence personnalisée | `ir.sequence` record |

### 12.9 Bonnes Pratiques Importable Modules

1. **Préfixer les champs** avec `x_` (obligatoire pour champs via XML)
2. **Utiliser noupdate="1"** pour données qui ne doivent pas être écrasées
3. **Documenter le code** Python inline dans les Server Actions
4. **Tester les domaines** avant de créer les Automated Actions
5. **Limiter le code Python** - si trop complexe, créer un vrai module Python

---

*Guide Odoo v19 Complete - ULTRA-CREATE v24.1 - Mis à jour le 27 Décembre 2025*
