# ITPP-Labs Patterns pour Odoo v18/v19

> Patterns extraits de `github.com/itpp-labs/misc-addons` (325 stars, 577 forks)
> Adaptes pour Odoo v18/v19 | ULTRA-CREATE v24.1

---

## Vue d'Ensemble

| Pattern | Module Source | Cas d'Usage |
|---------|---------------|-------------|
| Large Object Storage | `attachment_large_object` | Gros fichiers PostgreSQL |
| White-Label/Debranding | `web_debranding` | Solutions marque blanche |
| URL Attachments | `ir_attachment_url` | CDN, lazy-loading |
| Website-Dependent Fields | `web_website` | Multi-site e-commerce |
| External ID Sync | `sync-addons/base_api` | Sync systeme-a-systeme |
| Pre-commit Avance | `.pre-commit-config.yaml` | CI/CD gradue |

---

## 1. Storage Patterns

### 1.1 Large Object Storage (PostgreSQL)

**Probleme**: Les fichiers volumineux (PDF, images HD) encombrent le filesystem et compliquent les backups.

**Solution**: Utiliser PostgreSQL Large Objects pour stocker les attachments directement en base.

```python
# models/ir_attachment.py
from odoo import api, models
import base64

LARGE_OBJECT_LOCATION = "postgresql:lobject"

class IrAttachment(models.Model):
    _inherit = "ir.attachment"

    @api.model
    def _file_write(self, value, checksum):
        """Override pour rediriger vers PostgreSQL Large Objects"""
        location = self._storage()
        if location != LARGE_OBJECT_LOCATION:
            return super()._file_write(value, checksum)

        # Creer un Large Object PostgreSQL
        cr = self.env.cr
        lobj = cr.connection.lobject(0, "wb")
        lobj.write(base64.b64decode(value))
        lobj.close()
        return str(lobj.oid)

    @api.model
    def _file_read(self, fname):
        """Lire depuis PostgreSQL Large Object"""
        location = self._storage()
        if location != LARGE_OBJECT_LOCATION:
            return super()._file_read(fname)

        try:
            cr = self.env.cr
            lobj = cr.connection.lobject(int(fname), "rb")
            data = lobj.read()
            lobj.close()
            return base64.b64encode(data)
        except Exception:
            return b""

    @api.model
    def _file_delete(self, fname):
        """Supprimer le Large Object"""
        location = self._storage()
        if location != LARGE_OBJECT_LOCATION:
            return super()._file_delete(fname)

        try:
            cr = self.env.cr
            cr.connection.lobject(int(fname), "rb").unlink()
        except Exception:
            pass
```

**Configuration**:
```python
# res.config.settings
self.env["ir.config_parameter"].set_param(
    "ir_attachment.location",
    "postgresql:lobject"
)
```

**Avantages**:
- Backup unifie (pg_dump inclut les fichiers)
- Pas de filesystem externe a gerer
- Transactions ACID sur les fichiers
- Ideal pour deployments Docker/Kubernetes

---

### 1.2 URL Attachments (Lazy Loading)

**Probleme**: Stocker des fichiers deja disponibles sur un CDN ou serveur externe.

**Solution**: Stocker l'URL et charger le contenu a la demande.

```python
# models/ir_attachment.py
import requests
import base64
from odoo import api, fields, models

class IrAttachment(models.Model):
    _inherit = "ir.attachment"

    @api.depends("store_fname", "db_datas", "url")
    def _compute_datas(self):
        """Lazy loading depuis URL si type='url'"""
        bin_size = self._context.get("bin_size")
        url_records = self.filtered(lambda r: r.type == "url" and r.url)

        for attach in url_records:
            if not bin_size:
                try:
                    response = requests.get(attach.url, timeout=10)
                    response.raise_for_status()
                    attach.datas = base64.b64encode(response.content)
                except Exception:
                    attach.datas = False
            else:
                # Mode bin_size: retourner taille estimee
                attach.datas = "1.00 Kb"

        # Traiter les records non-URL avec la methode parent
        super(IrAttachment, self - url_records)._compute_datas()
```

**Usage**:
```python
# Creer un attachment URL
attachment = self.env["ir.attachment"].create({
    "name": "Image CDN",
    "type": "url",
    "url": "https://cdn.example.com/images/product.jpg",
    "res_model": "product.template",
    "res_id": product.id,
})
```

**Cas d'usage**:
- Integration CDN (Cloudinary, AWS CloudFront)
- Fichiers externes (Google Drive, Dropbox)
- Economie de stockage serveur

---

### 1.3 S3 Storage Integration

**Pattern**: Stockage conditionnel vers AWS S3 selon regles configurables.

```python
# models/ir_attachment.py
import boto3
from odoo import api, models
from odoo.tools.safe_eval import safe_eval

class IrAttachment(models.Model):
    _inherit = "ir.attachment"

    def _inverse_datas(self):
        """Rediriger vers S3 selon condition configurable"""
        s3_condition = self.env["ir.config_parameter"].sudo().get_param(
            "ir_attachment_s3.condition",
            default="[('res_model', 'in', ['product.template', 'product.product'])]"
        )

        condition = safe_eval(s3_condition)
        s3_records = self.search([("id", "in", self.ids)] + condition)
        s3_records = s3_records._filter_protected_attachments()

        if s3_records:
            bucket = self._get_s3_bucket()
            s3_records._write_to_s3(bucket)

        # Traiter le reste avec la methode parent
        return super(IrAttachment, self - s3_records)._inverse_datas()

    def _filter_protected_attachments(self):
        """Exclure les attachments systeme critiques"""
        return self.filtered(
            lambda r: r.res_model not in ["ir.ui.view", "ir.ui.menu"]
            and not r.name.startswith("/web/content/")
            and not r.name.startswith("/web/static/")
        )

    def _get_s3_bucket(self):
        """Obtenir le bucket S3 configure"""
        ICP = self.env["ir.config_parameter"].sudo()
        return boto3.resource(
            "s3",
            aws_access_key_id=ICP.get_param("ir_attachment_s3.access_key"),
            aws_secret_access_key=ICP.get_param("ir_attachment_s3.secret_key"),
            region_name=ICP.get_param("ir_attachment_s3.region", "eu-west-1"),
        ).Bucket(ICP.get_param("ir_attachment_s3.bucket"))
```

---

## 2. White-Label & Customization

### 2.1 Debranding Pattern

**Objectif**: Supprimer toute reference a "Odoo" pour solutions marque blanche.

**Structure Module**:
```
web_debranding/
├── __manifest__.py
├── models/
│   └── res_config_settings.py
├── views/
│   └── res_config_settings_views.xml
├── static/
│   └── src/
│       ├── js/
│       │   └── debranding.js
│       └── xml/
│           └── debranding.xml
└── data/
    └── ir_config_parameter.xml
```

**Parametres de Configuration**:
```python
# models/res_config_settings.py
from odoo import fields, models

class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    # Branding personnalise
    debranding_new_name = fields.Char(
        string="Nom Application",
        config_parameter="web_debranding.new_name",
        default="My ERP"
    )
    debranding_new_title = fields.Char(
        string="Titre Onglet",
        config_parameter="web_debranding.new_title",
        default="My ERP"
    )
    debranding_new_website = fields.Char(
        string="URL Documentation",
        config_parameter="web_debranding.new_website",
        default="https://docs.myerp.com"
    )
    debranding_favicon = fields.Binary(
        string="Favicon Personnalise",
        config_parameter="web_debranding.favicon"
    )
```

**Override JavaScript (OWL v18+)**:
```javascript
/** @odoo-module */
import { patch } from "@web/core/utils/patch";
import { WebClient } from "@web/webclient/webclient";

patch(WebClient.prototype, {
    setup() {
        super.setup();
        // Remplacer le titre
        const newTitle = this.env.services.company.currentCompany.name || "My ERP";
        document.title = newTitle;
    }
});
```

**Override Template QWeb**:
```xml
<!-- static/src/xml/debranding.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">

    <!-- Supprimer "Odoo" du footer -->
    <t t-inherit="web.DebugMenu" t-inherit-mode="replace">
        <xpath expr="//span[contains(text(), 'Odoo')]" position="replace">
            <span>Powered by My ERP</span>
        </xpath>
    </t>

</templates>
```

---

### 2.2 Theme Kit Integration

**Pattern**: Theming dynamique via variables CSS personnalisables.

```python
# models/res_config_settings.py
class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    theme_primary_color = fields.Char(
        string="Couleur Primaire",
        config_parameter="web_theme.primary_color",
        default="#714B67"
    )
    theme_secondary_color = fields.Char(
        string="Couleur Secondaire",
        config_parameter="web_theme.secondary_color",
        default="#017E84"
    )
    theme_font_family = fields.Selection([
        ("roboto", "Roboto"),
        ("opensans", "Open Sans"),
        ("lato", "Lato"),
        ("montserrat", "Montserrat"),
    ], string="Police", config_parameter="web_theme.font_family", default="roboto")
```

**Injection CSS Dynamique**:
```python
# controllers/main.py
from odoo import http
from odoo.http import request

class ThemeController(http.Controller):

    @http.route("/web/theme/variables.css", type="http", auth="public")
    def theme_variables(self):
        ICP = request.env["ir.config_parameter"].sudo()
        css = f"""
        :root {{
            --o-brand-odoo: {ICP.get_param("web_theme.primary_color", "#714B67")};
            --o-brand-primary: {ICP.get_param("web_theme.primary_color", "#714B67")};
            --o-brand-secondary: {ICP.get_param("web_theme.secondary_color", "#017E84")};
            --o-font-family: "{ICP.get_param("web_theme.font_family", "Roboto")}", sans-serif;
        }}
        """
        return request.make_response(
            css,
            headers=[("Content-Type", "text/css")]
        )
```

---

## 3. Multi-Site Patterns

### 3.1 Website-Dependent Mixin

**Probleme**: Avoir des valeurs differentes par website (prix, descriptions, etc.).

**Solution**: Mixin reutilisable utilisant `ir.property` avec contexte website.

```python
# models/website_dependent_mixin.py
from odoo import api, models, tools

class WebsiteDependentMixin(models.AbstractModel):
    _name = "website.dependent.mixin"
    _description = "Mixin pour champs dependants du website"

    def _get_website_dependent_value(self, field_name):
        """Recuperer la valeur pour le website courant"""
        website = self.env["website"].get_current_website()
        if not website:
            return getattr(self, f"_{field_name}_default", False)

        # Chercher dans ir.property
        IrProperty = self.env["ir.property"]
        prop = IrProperty._get(
            field_name,
            self._name,
            f"{self._name},{self.id}",
        )
        return prop or getattr(self, f"_{field_name}_default", False)

    def _set_website_dependent_value(self, field_name, value):
        """Definir la valeur pour le website courant"""
        website = self.env["website"].get_current_website()
        if not website:
            return

        IrProperty = self.env["ir.property"]
        IrProperty._set_multi(
            field_name,
            self._name,
            {self.id: value},
            default_value=getattr(self, f"_{field_name}_default", False),
        )

    @api.model
    @tools.ormcache_context("self._uid", "field_name", keys=("website_id",))
    def _get_cached_website_value(self, field_name, record_id):
        """Version cache avec invalidation par website"""
        return self.browse(record_id)._get_website_dependent_value(field_name)
```

**Usage**:
```python
# models/product_template.py
class ProductTemplate(models.Model):
    _inherit = ["product.template", "website.dependent.mixin"]

    website_description = fields.Html(
        compute="_compute_website_description",
        inverse="_inverse_website_description",
        string="Description Site"
    )

    def _compute_website_description(self):
        for product in self:
            product.website_description = product._get_website_dependent_value(
                "website_description"
            )

    def _inverse_website_description(self):
        for product in self:
            product._set_website_dependent_value(
                "website_description",
                product.website_description
            )
```

---

### 3.2 Config Parameter Multi-Company/Website

**Pattern**: Etendre `ir.config_parameter` pour supporter multi-company ET multi-website.

```python
# models/ir_config_parameter.py
from odoo import api, models, tools

class IrConfigParameter(models.Model):
    _inherit = "ir.config_parameter"

    @api.model
    @tools.ormcache_context("self._uid", "key", keys=("force_company", "website_id"))
    def _get_param(self, key):
        """Override avec cache contexte company/website"""
        # Essayer d'abord avec prefixe website
        website_id = self.env.context.get("website_id")
        if website_id:
            website_key = f"website_{website_id}.{key}"
            value = self._get_param_base(website_key)
            if value:
                return value

        # Puis avec prefixe company
        company_id = self.env.context.get("force_company") or self.env.company.id
        company_key = f"company_{company_id}.{key}"
        value = self._get_param_base(company_key)
        if value:
            return value

        # Fallback sur valeur globale
        return self._get_param_base(key)

    def _get_param_base(self, key):
        """Recuperation basique sans contexte"""
        params = self.search_read(
            [("key", "=", key)],
            ["value"],
            limit=1
        )
        return params[0]["value"] if params else False
```

---

## 4. Synchronization Patterns

### 4.1 External ID Management

**Probleme**: Synchroniser des donnees entre systemes en gardant la correspondance des IDs.

**Solution**: Utiliser `ir.model.data` comme table de mapping.

```python
# models/base.py
from odoo import api, models

SYNC_PREFIX = "sync"  # Prefixe pour les external IDs de sync

class Base(models.AbstractModel):
    _inherit = "base"

    @api.model
    def create_or_update_by_external_id(self, external_id, vals):
        """
        Upsert par external ID pour synchronisation.

        :param external_id: ID externe unique (ex: "CRM_12345")
        :param vals: Valeurs a creer/mettre a jour
        :return: (is_new, record_id)
        """
        IrModelData = self.env["ir.model.data"]
        full_xmlid = f"{SYNC_PREFIX}.{external_id}"

        try:
            # Chercher l'enregistrement existant
            record = self.env.ref(full_xmlid)
            record.write(vals)
            return (False, record.id)
        except ValueError:
            # Creer nouvel enregistrement + external ID
            record = self.create(vals)
            IrModelData.create({
                "name": external_id,
                "module": SYNC_PREFIX,
                "model": self._name,
                "res_id": record.id,
                "noupdate": True,
            })
            return (True, record.id)

    @api.model
    def search_by_external_id(self, external_id):
        """Rechercher par external ID"""
        try:
            return self.env.ref(f"{SYNC_PREFIX}.{external_id}")
        except ValueError:
            return self.browse()

    @api.model
    def get_external_id(self, record_id):
        """Obtenir l'external ID d'un enregistrement"""
        IrModelData = self.env["ir.model.data"]
        data = IrModelData.search([
            ("model", "=", self._name),
            ("res_id", "=", record_id),
            ("module", "=", SYNC_PREFIX),
        ], limit=1)
        return data.name if data else False
```

---

### 4.2 Search-or-Create Pattern

**Pattern**: Recherche atomique avec creation si inexistant.

```python
# models/base.py
class Base(models.AbstractModel):
    _inherit = "base"

    @api.model
    def search_or_create(self, vals, search_fields=None, active_test=True):
        """
        Rechercher ou creer un enregistrement.

        :param vals: Valeurs pour recherche ET creation
        :param search_fields: Champs a utiliser pour la recherche (defaut: tous)
        :param active_test: Inclure les enregistrements archives
        :return: (is_new, records)
        """
        if search_fields is None:
            # Utiliser tous les champs scalaires
            search_fields = [
                k for k, v in vals.items()
                if not self._fields.get(k, False)
                or self._fields[k].type not in ("one2many", "many2many")
            ]

        # Construire le domaine de recherche
        domain = [(k, "=", vals[k]) for k in search_fields if k in vals]

        # Rechercher
        records = self.with_context(active_test=active_test).search(domain)

        if records:
            return (False, records)
        else:
            return (True, self.create(vals))
```

**Usage**:
```python
# Synchroniser un partenaire depuis un systeme externe
is_new, partner = self.env["res.partner"].search_or_create({
    "email": "john@example.com",
    "name": "John Doe",
    "phone": "+33123456789",
}, search_fields=["email"])

if is_new:
    _logger.info("Nouveau partenaire cree: %s", partner.name)
else:
    partner.write({"phone": "+33123456789"})  # Mise a jour
```

---

## 5. Quality & CI/CD

### 5.1 Pre-commit Configuration Avancee

**Pattern**: Configuration pre-commit avec linting graduee (optional vs mandatory).

```yaml
# .pre-commit-config.yaml
repos:
  # Formatters (auto-fix)
  - repo: https://github.com/psf/black
    rev: 24.1.0
    hooks:
      - id: black

  - repo: https://github.com/pycqa/isort
    rev: 5.13.2
    hooks:
      - id: isort
        args: ["--profile", "black"]

  # Linters - MANDATORY (bloquants)
  - repo: https://github.com/OCA/pylint-odoo
    rev: v9.0.4
    hooks:
      - id: pylint_odoo
        args: ["--rcfile=.pylintrc-mandatory"]
        name: "pylint-odoo (mandatory)"

  # Linters - OPTIONAL (warnings seulement)
  - repo: https://github.com/OCA/pylint-odoo
    rev: v9.0.4
    hooks:
      - id: pylint_odoo
        args: ["--rcfile=.pylintrc", "--exit-zero"]
        name: "pylint-odoo (optional)"
        verbose: true

  # XML Validation
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: check-xml

  # Security checks
  - repo: https://github.com/PyCQA/bandit
    rev: 1.7.7
    hooks:
      - id: bandit
        args: ["-c", "pyproject.toml"]
        additional_dependencies: ["bandit[toml]"]
```

---

### 5.2 Pylint Configuration Graduee

**Fichier `.pylintrc-mandatory`** (bloque le CI):
```ini
[MASTER]
load-plugins=pylint_odoo

[ODOOLINT]
manifest_required_keys = license,author
license_allowed = AGPL-3,LGPL-3,GPL-3

[MESSAGES CONTROL]
enable=
    syntax-error,
    undefined-variable,
    dangerous-default-value,
    duplicate-key,
    missing-return,
    redefined-builtin,
    sql-injection,
    eval-used,
```

**Fichier `.pylintrc`** (warnings, non-bloquant):
```ini
[MASTER]
load-plugins=pylint_odoo

[ODOOLINT]
manifest_required_authors = IT Projects Labs,Odoo Community Association (OCA)
valid_odoo_versions = 18.0

[MESSAGES CONTROL]
enable=
    missing-docstring,
    line-too-long,
    too-many-arguments,
    too-many-locals,
    duplicate-code,
    consider-using-f-string,
```

---

### 5.3 Manifest Best Practices

**Template `__manifest__.py`**:
```python
{
    "name": "Module Name",
    "version": "18.0.1.0.0",  # Format: odoo_version.major.minor.patch.hotfix
    "category": "Category/Subcategory",
    "summary": "Description courte (max 80 caracteres)",
    "author": "Your Company, Odoo Community Association (OCA)",
    "website": "https://github.com/your-org/your-repo",
    "license": "AGPL-3",  # ou LGPL-3
    "depends": [
        "base",
        "web",
    ],
    "data": [
        # 1. Security (toujours en premier)
        "security/ir_module_category.xml",
        "security/res_groups.xml",
        "security/ir.model.access.csv",
        "security/ir_rules.xml",
        # 2. Data
        "data/ir_sequence.xml",
        "data/ir_cron.xml",
        # 3. Views
        "views/menu.xml",
        "views/model_views.xml",
        # 4. Reports
        "report/report_templates.xml",
        # 5. Wizards
        "wizard/wizard_views.xml",
    ],
    "demo": [
        "demo/demo_data.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "module_name/static/src/**/*",
        ],
    },
    "installable": True,
    "auto_install": False,
    "application": False,
}
```

---

## 6. Related Repositories

### Ecosysteme ITPP-Labs

| Repository | Focus | Stars |
|------------|-------|-------|
| `misc-addons` | Utilitaires generaux | 325 |
| `pos-addons` | Point of Sale | ~200 |
| `mail-addons` | Email/Messaging | ~150 |
| `sync-addons` | Synchronisation | ~100 |
| `access-addons` | Security & ACL | ~100 |
| `website-addons` | E-commerce | ~100 |

### Patterns Complementaires (sync-addons)

**OpenAPI/Swagger Integration**:
```python
# Exposer une API REST documentee
from odoo import http

class OpenAPIController(http.Controller):
    @http.route("/api/v1/partners", type="json", auth="api_key", methods=["GET"])
    def get_partners(self, domain=None, limit=100):
        """
        Lister les partenaires.

        :param domain: Filtre Odoo (optionnel)
        :param limit: Nombre max de resultats
        :return: Liste de partenaires
        """
        Partner = http.request.env["res.partner"]
        partners = Partner.search(domain or [], limit=limit)
        return partners.read(["name", "email", "phone"])
```

**Webhook Outgoing**:
```python
# Envoyer des webhooks sur evenements
class ResPartner(models.Model):
    _inherit = "res.partner"

    @api.model_create_multi
    def create(self, vals_list):
        records = super().create(vals_list)
        for record in records:
            record._trigger_webhook("partner.created")
        return records

    def _trigger_webhook(self, event_type):
        """Declencher webhook configures"""
        webhooks = self.env["webhook.config"].search([
            ("event_type", "=", event_type),
            ("active", "=", True),
        ])
        for webhook in webhooks:
            webhook.send(self)
```

---

## Resume

| Pattern | Fichier | Ligne Cle |
|---------|---------|-----------|
| Large Object | `ir_attachment.py` | `cr.connection.lobject()` |
| URL Attachments | `ir_attachment.py` | `requests.get(url)` |
| Website Mixin | `mixin.py` | `@tools.ormcache_context` |
| External ID Sync | `base.py` | `ir.model.data.create()` |
| Search-or-Create | `base.py` | Atomic search + create |
| Pre-commit | `.pre-commit-config.yaml` | Graduated linting |

---

*ITPP-Labs Patterns v24.1 - Adapte pour Odoo v18/v19 | Source: github.com/itpp-labs/misc-addons*
