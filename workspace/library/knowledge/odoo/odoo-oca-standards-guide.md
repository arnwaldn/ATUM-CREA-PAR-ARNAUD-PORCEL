# Odoo OCA Standards Guide

## Vue d'ensemble

Guide complet des standards OCA (Odoo Community Association) pour développer des modules de qualité professionnelle.

---

## 1. Pre-commit Hooks OCA

### Installation

```bash
# Installer pre-commit
pip install pre-commit

# Initialiser dans le projet
cd my-odoo-project
pre-commit install
```

### Configuration .pre-commit-config.yaml

```yaml
# .pre-commit-config.yaml
exclude: |
  (?x)^(
    setup/.*/odoo/addons/.*|
    .*/static/lib/.*
  )$

repos:
  # Standard hooks
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
        exclude: \.pot?$
      - id: end-of-file-fixer
        exclude: \.pot?$
      - id: check-yaml
      - id: check-xml
        files: \.xml$
      - id: check-json
      - id: check-added-large-files
      - id: check-merge-conflict
      - id: debug-statements
      - id: mixed-line-ending
        args: ['--fix=lf']

  # Python formatting
  - repo: https://github.com/psf/black
    rev: 23.12.1
    hooks:
      - id: black
        args: [--line-length=120, --target-version=py311]

  # Import sorting
  - repo: https://github.com/pycqa/isort
    rev: 5.13.2
    hooks:
      - id: isort
        args: [--profile=black, --line-length=120]

  # Flake8
  - repo: https://github.com/pycqa/flake8
    rev: 7.0.0
    hooks:
      - id: flake8
        args: [--max-line-length=120, --extend-ignore=E203]
        additional_dependencies:
          - flake8-bugbear
          - flake8-comprehensions

  # Pylint Odoo
  - repo: https://github.com/OCA/pylint-odoo
    rev: v9.0.5
    hooks:
      - id: pylint_odoo
        args:
          - --rcfile=.pylintrc

  # ESLint for JavaScript
  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.56.0
    hooks:
      - id: eslint
        files: \.(js|jsx)$
        types: [file]
        args: ['--fix']
        additional_dependencies:
          - eslint@8.56.0
          - eslint-config-prettier@9.1.0

  # Prettier for CSS/SCSS
  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v3.1.0
    hooks:
      - id: prettier
        types_or: [css, scss]
```

### Configuration Pylint (.pylintrc)

```ini
[MASTER]
load-plugins=pylint_odoo

[ODOOLINT]
# Messages actifs OCA
valid_odoo_versions=17.0

# Manifest checks
manifest_required_authors=My Company
manifest_required_keys=license,version
manifest_deprecated_keys=

# Version format
manifest_version_format=17.0.\d+.\d+.\d+

[MESSAGES CONTROL]
disable=
    missing-docstring,
    consider-using-f-string,

enable=
    # OCA specific
    attribute-deprecated,
    attribute-string-redundant,
    consider-merging-classes-inherited,
    context-overridden,
    copy-wo-api-one,
    create-user-wo-reset-password,
    dangerous-filter-wo-user,
    dangerous-qweb-replace-wo-priority,
    deprecated-openerp-xml-node,
    development-status-allowed,
    duplicate-id-csv,
    duplicate-po-message-definition,
    duplicate-xml-fields,
    duplicate-xml-record-id,
    external-request-timeout,
    file-not-used,
    invalid-commit,
    license-allowed,
    manifest-author-string,
    manifest-deprecated-key,
    manifest-required-author,
    manifest-required-key,
    manifest-version-format,
    method-compute,
    method-inverse,
    method-required-super,
    method-search,
    missing-newline-extrafiles,
    missing-readme,
    missing-return,
    no-utf8-coding-comment,
    odoo-addons-relative-import,
    odoo-exception-warning,
    po-msgstr-variables,
    po-syntax-error,
    print-used,
    redundant-modulename-xml,
    renamed-field-parameter,
    resource-not-exist,
    sql-injection,
    translation-field,
    translation-positional-used,
    translation-required,
    use-vim-comment,
    website-manifest-key-not-valid-uri,
    xml-attribute-translatable,
    xml-deprecated-qweb-directive,
    xml-deprecated-tree-attribute,

[FORMAT]
max-line-length=120

[SIMILARITIES]
min-similarity-lines=8
ignore-comments=yes
ignore-docstrings=yes
```

---

## 2. Structure Module OCA

### Arborescence Standard

```
my_module/
├── __init__.py
├── __manifest__.py
├── README.rst                    # Documentation obligatoire
├── static/
│   └── description/
│       ├── icon.png             # Icône 128x128 ou SVG
│       └── index.html           # Description HTML
├── security/
│   ├── ir.model.access.csv
│   └── security.xml
├── data/
│   └── data.xml
├── demo/
│   └── demo.xml
├── models/
│   ├── __init__.py
│   └── my_model.py
├── views/
│   ├── my_model_views.xml
│   └── menu_views.xml
├── wizards/
│   ├── __init__.py
│   └── my_wizard.py
├── reports/
│   └── my_report.xml
├── controllers/
│   ├── __init__.py
│   └── main.py
├── tests/
│   ├── __init__.py
│   └── test_my_module.py
└── i18n/
    ├── my_module.pot
    └── fr.po
```

### Manifest Standard OCA

```python
# __manifest__.py
{
    "name": "My Module",
    "version": "17.0.1.0.0",
    "category": "Tools",
    "summary": "Short description of the module",
    "author": "My Company, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/my-repo",
    "license": "AGPL-3",
    "depends": [
        "base",
    ],
    "data": [
        "security/ir.model.access.csv",
        "views/my_model_views.xml",
    ],
    "demo": [
        "demo/demo.xml",
    ],
    "installable": True,
    "application": False,
    "auto_install": False,
    "development_status": "Beta",  # Alpha, Beta, Production/Stable, Mature
    "maintainers": ["github_username"],
}
```

### README.rst Standard

```rst
===========
My Module
===========

.. |badge1| image:: https://img.shields.io/badge/maturity-Beta-yellow.png
    :target: https://odoo-community.org/page/development-status
    :alt: Beta

.. |badge2| image:: https://img.shields.io/badge/licence-AGPL--3-blue.png
    :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
    :alt: License: AGPL-3

.. |badge3| image:: https://img.shields.io/badge/github-OCA%2Fmy--repo-lightgray.png?logo=github
    :target: https://github.com/OCA/my-repo/tree/17.0/my_module
    :alt: OCA/my-repo

|badge1| |badge2| |badge3|

Short description of what the module does.

**Table of contents**

.. contents::
   :local:

Configuration
=============

To configure this module, you need to:

#. Go to Settings > ...
#. Configure ...

Usage
=====

To use this module, you need to:

#. Go to ...
#. Click on ...

Known issues / Roadmap
======================

* Feature 1 planned
* Bug to fix

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/my-repo/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed
`feedback <https://github.com/OCA/my-repo/issues/new?body=module:%20my_module%0Aversion:%2017.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.

Do not contact contributors directly about support or help with technical issues.

Credits
=======

Authors
~~~~~~~

* My Company

Contributors
~~~~~~~~~~~~

* First Last <email@example.com>

Maintainers
~~~~~~~~~~~

This module is maintained by the OCA.

.. image:: https://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: https://odoo-community.org

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

This module is part of the `OCA/my-repo <https://github.com/OCA/my-repo/tree/17.0/my_module>`_ project on GitHub.

You are welcome to contribute. To learn how please visit https://odoo-community.org/page/Contribute.
```

---

## 3. Conventions de Code OCA

### Python

```python
# -*- coding: utf-8 -*-
# Copyright 2024 My Company
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import _, api, fields, models
from odoo.exceptions import UserError, ValidationError

# Ordre des imports:
# 1. Standard library
# 2. Third-party (requests, etc.)
# 3. Odoo (odoo, odoo.*)
# 4. Odoo addons (odoo.addons.*)


class MyModel(models.Model):
    """Description of the model.

    Longer description if needed.
    """

    _name = "my.model"
    _description = "My Model"
    _inherit = ["mail.thread", "mail.activity.mixin"]
    _order = "sequence, name"

    # Ordre des attributs de classe:
    # 1. _name, _description, _inherit, _inherits
    # 2. _rec_name, _order, _table, _auto
    # 3. _sql_constraints
    # 4. Champs (order: default fields, relational, computed)
    # 5. Constrains et onchange
    # 6. CRUD methods
    # 7. Action methods
    # 8. Business methods

    # === DEFAULT FIELDS ===
    name = fields.Char(
        string="Name",
        required=True,
        index=True,
        tracking=True,
    )
    sequence = fields.Integer(
        string="Sequence",
        default=10,
    )
    active = fields.Boolean(
        string="Active",
        default=True,
    )
    state = fields.Selection(
        selection=[
            ("draft", "Draft"),
            ("confirmed", "Confirmed"),
            ("done", "Done"),
        ],
        string="Status",
        default="draft",
        required=True,
        tracking=True,
    )

    # === RELATIONAL FIELDS ===
    company_id = fields.Many2one(
        comodel_name="res.company",
        string="Company",
        required=True,
        default=lambda self: self.env.company,
    )
    partner_id = fields.Many2one(
        comodel_name="res.partner",
        string="Partner",
        ondelete="restrict",
    )
    tag_ids = fields.Many2many(
        comodel_name="my.tag",
        string="Tags",
    )
    line_ids = fields.One2many(
        comodel_name="my.model.line",
        inverse_name="model_id",
        string="Lines",
    )

    # === COMPUTED FIELDS ===
    total = fields.Float(
        string="Total",
        compute="_compute_total",
        store=True,
    )
    partner_name = fields.Char(
        string="Partner Name",
        related="partner_id.name",
        readonly=True,
    )

    # === SQL CONSTRAINTS ===
    _sql_constraints = [
        (
            "name_uniq",
            "UNIQUE(name, company_id)",
            "Name must be unique per company!",
        ),
    ]

    # === COMPUTE METHODS ===
    @api.depends("line_ids.subtotal")
    def _compute_total(self):
        for record in self:
            record.total = sum(record.line_ids.mapped("subtotal"))

    # === CONSTRAINS ===
    @api.constrains("name")
    def _check_name(self):
        for record in self:
            if record.name and len(record.name) < 3:
                raise ValidationError(_("Name must be at least 3 characters!"))

    # === ONCHANGE ===
    @api.onchange("partner_id")
    def _onchange_partner_id(self):
        if self.partner_id:
            self.name = self.partner_id.name

    # === CRUD METHODS ===
    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not vals.get("name"):
                vals["name"] = self.env["ir.sequence"].next_by_code("my.model")
        return super().create(vals_list)

    def write(self, vals):
        if "state" in vals and vals["state"] == "done":
            self._check_can_complete()
        return super().write(vals)

    def unlink(self):
        for record in self:
            if record.state != "draft":
                raise UserError(_("Cannot delete a non-draft record!"))
        return super().unlink()

    def copy(self, default=None):
        default = dict(default or {})
        default["name"] = _("%s (Copy)") % self.name
        return super().copy(default)

    # === ACTION METHODS ===
    def action_confirm(self):
        """Confirm the record."""
        for record in self:
            if record.state != "draft":
                raise UserError(_("Only draft records can be confirmed!"))
            record.state = "confirmed"
        return True

    def action_done(self):
        """Mark the record as done."""
        self.write({"state": "done"})
        return True

    def action_cancel(self):
        """Cancel the record."""
        self.write({"state": "draft"})
        return True

    # === BUSINESS METHODS ===
    def _check_can_complete(self):
        """Check if the record can be completed."""
        for record in self:
            if not record.line_ids:
                raise ValidationError(
                    _("Cannot complete record %s without lines!") % record.name
                )

    def get_report_data(self):
        """Prepare data for reporting."""
        self.ensure_one()
        return {
            "name": self.name,
            "total": self.total,
            "lines": self.line_ids.read(["name", "quantity", "subtotal"]),
        }
```

### XML Views

```xml
<?xml version="1.0" encoding="utf-8"?>
<!-- Copyright 2024 My Company
     License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). -->
<odoo>
    <!-- Form View -->
    <record id="my_model_view_form" model="ir.ui.view">
        <field name="name">my.model.view.form</field>
        <field name="model">my.model</field>
        <field name="arch" type="xml">
            <form>
                <header>
                    <button
                        name="action_confirm"
                        string="Confirm"
                        type="object"
                        class="btn-primary"
                        invisible="state != 'draft'"
                    />
                    <button
                        name="action_done"
                        string="Done"
                        type="object"
                        invisible="state != 'confirmed'"
                    />
                    <button
                        name="action_cancel"
                        string="Cancel"
                        type="object"
                        invisible="state == 'draft'"
                    />
                    <field name="state" widget="statusbar" statusbar_visible="draft,confirmed,done"/>
                </header>
                <sheet>
                    <div class="oe_button_box" name="button_box">
                        <button
                            name="action_view_related"
                            type="object"
                            class="oe_stat_button"
                            icon="fa-list"
                        >
                            <field name="related_count" widget="statinfo" string="Related"/>
                        </button>
                    </div>
                    <widget name="web_ribbon" title="Archived" bg_color="text-bg-danger" invisible="active"/>
                    <div class="oe_title">
                        <label for="name"/>
                        <h1>
                            <field name="name" placeholder="Name"/>
                        </h1>
                    </div>
                    <group>
                        <group name="left">
                            <field name="partner_id"/>
                            <field name="company_id" groups="base.group_multi_company"/>
                        </group>
                        <group name="right">
                            <field name="date"/>
                            <field name="total"/>
                        </group>
                    </group>
                    <notebook>
                        <page string="Lines" name="lines">
                            <field name="line_ids">
                                <tree editable="bottom">
                                    <field name="sequence" widget="handle"/>
                                    <field name="name"/>
                                    <field name="quantity"/>
                                    <field name="price"/>
                                    <field name="subtotal"/>
                                </tree>
                            </field>
                        </page>
                        <page string="Notes" name="notes">
                            <field name="notes" placeholder="Add notes here..."/>
                        </page>
                    </notebook>
                </sheet>
                <div class="oe_chatter">
                    <field name="message_follower_ids"/>
                    <field name="activity_ids"/>
                    <field name="message_ids"/>
                </div>
            </form>
        </field>
    </record>

    <!-- Tree View -->
    <record id="my_model_view_tree" model="ir.ui.view">
        <field name="name">my.model.view.tree</field>
        <field name="model">my.model</field>
        <field name="arch" type="xml">
            <tree decoration-info="state == 'draft'" decoration-success="state == 'done'">
                <field name="sequence" widget="handle"/>
                <field name="name"/>
                <field name="partner_id"/>
                <field name="date"/>
                <field name="total" sum="Total"/>
                <field name="state" widget="badge" decoration-info="state == 'draft'" decoration-success="state == 'done'"/>
                <field name="company_id" groups="base.group_multi_company"/>
            </tree>
        </field>
    </record>

    <!-- Search View -->
    <record id="my_model_view_search" model="ir.ui.view">
        <field name="name">my.model.view.search</field>
        <field name="model">my.model</field>
        <field name="arch" type="xml">
            <search>
                <field name="name"/>
                <field name="partner_id"/>
                <filter name="filter_draft" string="Draft" domain="[('state', '=', 'draft')]"/>
                <filter name="filter_confirmed" string="Confirmed" domain="[('state', '=', 'confirmed')]"/>
                <separator/>
                <filter name="filter_my" string="My Records" domain="[('create_uid', '=', uid)]"/>
                <separator/>
                <filter name="filter_archived" string="Archived" domain="[('active', '=', False)]"/>
                <group expand="0" string="Group By">
                    <filter name="groupby_state" string="Status" context="{'group_by': 'state'}"/>
                    <filter name="groupby_partner" string="Partner" context="{'group_by': 'partner_id'}"/>
                    <filter name="groupby_date" string="Date" context="{'group_by': 'date:month'}"/>
                </group>
            </search>
        </field>
    </record>

    <!-- Action -->
    <record id="my_model_action" model="ir.actions.act_window">
        <field name="name">My Models</field>
        <field name="res_model">my.model</field>
        <field name="view_mode">tree,form</field>
        <field name="search_view_id" ref="my_model_view_search"/>
        <field name="context">{'search_default_filter_my': 1}</field>
        <field name="help" type="html">
            <p class="o_view_nocontent_smiling_face">
                Create your first record
            </p>
            <p>
                Click the button to create a new record.
            </p>
        </field>
    </record>

    <!-- Menu -->
    <menuitem
        id="my_module_menu_root"
        name="My Module"
        sequence="50"
    />
    <menuitem
        id="my_module_menu_main"
        name="My Models"
        parent="my_module_menu_root"
        action="my_model_action"
        sequence="10"
    />
</odoo>
```

---

## 4. Tests OCA

```python
# tests/test_my_module.py
# Copyright 2024 My Company
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.exceptions import UserError, ValidationError
from odoo.tests import Form, tagged
from odoo.tests.common import TransactionCase


@tagged("post_install", "-at_install")
class TestMyModel(TransactionCase):
    """Test cases for my.model."""

    @classmethod
    def setUpClass(cls):
        """Set up test data."""
        super().setUpClass()
        cls.partner = cls.env["res.partner"].create({"name": "Test Partner"})
        cls.model = cls.env["my.model"].create({
            "name": "Test Record",
            "partner_id": cls.partner.id,
        })

    def test_create(self):
        """Test record creation."""
        self.assertTrue(self.model.id)
        self.assertEqual(self.model.state, "draft")

    def test_confirm(self):
        """Test confirmation workflow."""
        self.model.action_confirm()
        self.assertEqual(self.model.state, "confirmed")

    def test_confirm_not_draft_raises_error(self):
        """Test that confirming non-draft record raises error."""
        self.model.action_confirm()
        with self.assertRaises(UserError):
            self.model.action_confirm()

    def test_name_constraint(self):
        """Test name length constraint."""
        with self.assertRaises(ValidationError):
            self.env["my.model"].create({"name": "AB"})  # Too short

    def test_form_view(self):
        """Test form view using Form helper."""
        with Form(self.env["my.model"]) as form:
            form.name = "Form Test"
            form.partner_id = self.partner
        record = form.save()
        self.assertEqual(record.name, "Form Test")

    def test_compute_total(self):
        """Test total computation."""
        self.env["my.model.line"].create({
            "model_id": self.model.id,
            "name": "Line 1",
            "quantity": 2,
            "price": 10.0,
        })
        self.assertEqual(self.model.total, 20.0)
```

---

## 5. Commandes OCA

```bash
# Vérifier la qualité avant commit
pre-commit run --all-files

# Générer les fichiers de traduction
./odoo-bin -d mydb -l fr_FR --i18n-export=addons/my_module/i18n/fr.po -m my_module

# Mettre à jour les traductions
./odoo-bin -d mydb -l fr_FR --i18n-import=addons/my_module/i18n/fr.po -m my_module

# Lancer les tests
./odoo-bin -d test_db -i my_module --test-tags /my_module --stop-after-init
```

---

## 6. Checklist OCA

```markdown
## Structure
- [ ] README.rst complet avec badges
- [ ] Icône dans static/description/
- [ ] Manifest avec tous les champs requis
- [ ] License AGPL-3 ou LGPL-3

## Code
- [ ] Copyright headers sur tous les fichiers
- [ ] Imports triés (isort)
- [ ] Code formaté (black)
- [ ] Pas d'erreurs pylint-odoo
- [ ] Tests unitaires

## Documentation
- [ ] Docstrings sur les classes et méthodes publiques
- [ ] README avec Configuration et Usage
- [ ] Changelog maintenu (HISTORY.rst)
```
