# Odoo Migration Guide

## Vue d'ensemble

Guide complet pour migrer des modules et bases de données Odoo entre versions.

---

## 1. Types de Migration

### Migration de Version Majeure

```
Odoo 16 → Odoo 17 → Odoo 18 → Odoo 19
```

### Migration de Module

```python
# Migration du code source d'un module
# - Modèles et champs
# - Vues XML
# - JavaScript/OWL
# - API changes
```

### Migration de Données

```python
# Migration des données en base
# - Colonnes ajoutées/supprimées
# - Types de données changés
# - Relations modifiées
```

---

## 2. Scripts de Migration

### Structure des Migrations

```
my_module/
├── migrations/
│   ├── 17.0.1.0.0/
│   │   ├── pre-migrate.py
│   │   ├── post-migrate.py
│   │   └── end-migrate.py
│   └── 18.0.1.0.0/
│       └── post-migrate.py
└── __manifest__.py  # version: '19.0.1.0.0'
```

### Pre-Migration

```python
# migrations/17.0.1.0.0/pre-migrate.py
"""
Exécuté AVANT la mise à jour du module.
Utiliser pour:
- Sauvegarder des données
- Renommer des colonnes/tables
- Supprimer des contraintes
"""
from odoo import SUPERUSER_ID
from odoo.api import Environment
import logging

_logger = logging.getLogger(__name__)


def migrate(cr, version):
    """Pre-migration script"""
    if not version:
        return

    _logger.info("Pre-migrating my_module from version %s", version)

    # Renommer une colonne avant que le nouveau modèle soit chargé
    cr.execute("""
        ALTER TABLE my_model
        RENAME COLUMN old_field TO old_field_backup
    """)

    # Sauvegarder des données avant suppression
    cr.execute("""
        CREATE TABLE IF NOT EXISTS my_model_backup AS
        SELECT id, old_field_backup, other_field
        FROM my_model
    """)

    # Supprimer une contrainte qui sera changée
    cr.execute("""
        ALTER TABLE my_model
        DROP CONSTRAINT IF EXISTS my_model_unique_constraint
    """)

    _logger.info("Pre-migration completed")
```

### Post-Migration

```python
# migrations/17.0.1.0.0/post-migrate.py
"""
Exécuté APRÈS la mise à jour du module.
Utiliser pour:
- Migrer les données vers les nouveaux champs
- Calculer les valeurs par défaut
- Mettre à jour les relations
"""
from odoo import SUPERUSER_ID
from odoo.api import Environment
import logging

_logger = logging.getLogger(__name__)


def migrate(cr, version):
    """Post-migration script"""
    if not version:
        return

    env = Environment(cr, SUPERUSER_ID, {})

    _logger.info("Post-migrating my_module from version %s", version)

    # Migrer les données de l'ancien champ vers le nouveau
    cr.execute("""
        UPDATE my_model
        SET new_field = old_field_backup
        WHERE new_field IS NULL AND old_field_backup IS NOT NULL
    """)

    # Utiliser l'ORM pour des migrations complexes
    records = env['my.model'].search([('state', '=', 'old_state')])
    for record in records:
        try:
            record.write({
                'state': 'new_state',
                'migrated': True,
            })
        except Exception as e:
            _logger.error("Failed to migrate record %s: %s", record.id, e)

    # Calculer des valeurs pour un nouveau champ obligatoire
    env['my.model'].search([
        ('computed_field', '=', False)
    ])._compute_computed_field()

    # Nettoyer les données temporaires
    cr.execute("""
        DROP TABLE IF EXISTS my_model_backup
    """)

    # Invalider le cache
    env.registry.clear_cache()

    _logger.info("Post-migration completed")


def migrate_m2m_relation(env):
    """Migrer une relation Many2many"""
    cr = env.cr

    # Ancienne table de relation
    cr.execute("""
        SELECT model_id, old_related_id
        FROM my_model_old_related_rel
    """)

    for model_id, old_related_id in cr.fetchall():
        # Trouver le nouvel enregistrement correspondant
        new_related = env['new.related'].search([
            ('legacy_id', '=', old_related_id)
        ], limit=1)

        if new_related:
            cr.execute("""
                INSERT INTO my_model_new_related_rel (model_id, new_related_id)
                VALUES (%s, %s)
                ON CONFLICT DO NOTHING
            """, [model_id, new_related.id])
```

### End-Migration

```python
# migrations/17.0.1.0.0/end-migrate.py
"""
Exécuté à la FIN de toute la mise à jour.
Utiliser pour:
- Nettoyage final
- Vérifications
- Régénération de données
"""

def migrate(cr, version):
    """End-migration script"""
    if not version:
        return

    # Régénérer les séquences
    cr.execute("""
        SELECT setval('my_model_id_seq',
            (SELECT MAX(id) FROM my_model) + 1)
    """)

    # Forcer le recalcul des champs stored
    cr.execute("""
        UPDATE my_model SET write_date = NOW()
    """)
```

---

## 3. Migrations Courantes

### Renommer un Modèle

```python
# pre-migrate.py
def migrate(cr, version):
    # Renommer la table
    cr.execute("""
        ALTER TABLE old_model_name RENAME TO new_model_name
    """)

    # Mettre à jour ir_model_data
    cr.execute("""
        UPDATE ir_model_data
        SET model = 'new.model.name'
        WHERE model = 'old.model.name'
    """)

    # Mettre à jour les références dans ir_model
    cr.execute("""
        UPDATE ir_model
        SET model = 'new.model.name'
        WHERE model = 'old.model.name'
    """)

    # Renommer les séquences
    cr.execute("""
        ALTER SEQUENCE IF EXISTS old_model_name_id_seq
        RENAME TO new_model_name_id_seq
    """)
```

### Renommer un Champ

```python
# pre-migrate.py
def migrate(cr, version):
    # Vérifier si la colonne existe
    cr.execute("""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'my_model' AND column_name = 'old_field'
    """)

    if cr.fetchone():
        cr.execute("""
            ALTER TABLE my_model
            RENAME COLUMN old_field TO new_field
        """)
```

### Changer le Type d'un Champ

```python
# pre-migrate.py
def migrate(cr, version):
    # Integer → Float
    cr.execute("""
        ALTER TABLE my_model
        ALTER COLUMN amount TYPE NUMERIC USING amount::numeric
    """)

    # Char → Selection (sauvegarder d'abord)
    cr.execute("""
        ALTER TABLE my_model
        ADD COLUMN state_backup VARCHAR
    """)
    cr.execute("""
        UPDATE my_model SET state_backup = state
    """)

# post-migrate.py
def migrate(cr, version):
    # Convertir les anciennes valeurs
    mapping = {
        'ancien_etat': 'new_state',
        'autre_etat': 'other_state',
    }

    for old, new in mapping.items():
        cr.execute("""
            UPDATE my_model
            SET state = %s
            WHERE state_backup = %s
        """, [new, old])
```

### Migration Many2one → Many2many

```python
# pre-migrate.py
def migrate(cr, version):
    # Sauvegarder la relation existante
    cr.execute("""
        CREATE TABLE my_model_tag_rel AS
        SELECT id as model_id, tag_id
        FROM my_model
        WHERE tag_id IS NOT NULL
    """)

# post-migrate.py
def migrate(cr, version):
    # Créer les relations many2many
    cr.execute("""
        INSERT INTO my_model_tag_ids_rel (my_model_id, tag_id)
        SELECT model_id, tag_id FROM my_model_tag_rel
    """)

    # Nettoyer
    cr.execute("DROP TABLE my_model_tag_rel")
```

### Fusionner des Champs

```python
# post-migrate.py
def migrate(cr, version):
    env = Environment(cr, SUPERUSER_ID, {})

    # Fusionner street + street2 dans address
    for partner in env['res.partner'].search([]):
        address_parts = filter(None, [partner.street, partner.street2])
        partner.address = '\n'.join(address_parts)
```

---

## 4. Outils de Migration

### OpenUpgrade

```bash
# Installation
pip install openupgrade

# Lancer la migration
./odoo-bin -d mydb --update=all --load=base,openupgrade_framework

# Avec OpenUpgrade scripts
./odoo-bin -d mydb -u all \
    --upgrade-path=/path/to/openupgrade/scripts
```

### Script d'Analyse

```python
# analyze_migration.py
"""Script pour analyser les changements entre versions"""

def analyze_model_changes(cr, model_name):
    """Analyse les changements d'un modèle"""
    # Colonnes actuelles
    cr.execute("""
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = %s
        ORDER BY column_name
    """, [model_name.replace('.', '_')])

    columns = {row[0]: row[1:] for row in cr.fetchall()}

    # Contraintes
    cr.execute("""
        SELECT constraint_name, constraint_type
        FROM information_schema.table_constraints
        WHERE table_name = %s
    """, [model_name.replace('.', '_')])

    constraints = cr.fetchall()

    return {
        'columns': columns,
        'constraints': constraints,
    }


def compare_schemas(old_schema, new_schema):
    """Compare deux schémas"""
    added = set(new_schema['columns']) - set(old_schema['columns'])
    removed = set(old_schema['columns']) - set(new_schema['columns'])
    modified = []

    for col in set(old_schema['columns']) & set(new_schema['columns']):
        if old_schema['columns'][col] != new_schema['columns'][col]:
            modified.append(col)

    return {
        'added': added,
        'removed': removed,
        'modified': modified,
    }
```

### Validation Post-Migration

```python
# validate_migration.py

def validate_migration(env):
    """Valide que la migration s'est bien passée"""
    errors = []

    # Vérifier les champs obligatoires
    null_required = env['my.model'].search([
        ('required_field', '=', False),
    ])
    if null_required:
        errors.append(f"Found {len(null_required)} records with null required_field")

    # Vérifier les relations
    orphans = env.cr.execute("""
        SELECT id FROM my_model m
        WHERE m.partner_id IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM res_partner p WHERE p.id = m.partner_id
        )
    """)
    if orphans:
        errors.append(f"Found {len(orphans)} orphan records")

    # Vérifier les contraintes
    try:
        env.cr.execute("SELECT 1 FROM my_model LIMIT 1")
    except Exception as e:
        errors.append(f"Table access error: {e}")

    # Vérifier les vues
    invalid_views = env['ir.ui.view'].search([
        ('model', '=', 'my.model'),
    ]).filtered(lambda v: not v._check_xml())
    if invalid_views:
        errors.append(f"Found {len(invalid_views)} invalid views")

    return errors
```

---

## 5. Migration JavaScript/OWL

### Owl 1.x → Owl 2.x (Odoo 16 → 17)

```javascript
// Avant (Owl 1.x - Odoo 16)
const { Component, useState } = owl;
const { useRef } = owl.hooks;

class MyComponent extends Component {
    setup() {
        this.state = useState({ count: 0 });
    }
}
MyComponent.template = 'my_module.MyComponent';

// Après (Owl 2.x - Odoo 17+)
import { Component, useState, useRef } from "@odoo/owl";

export class MyComponent extends Component {
    static template = "my_module.MyComponent";

    setup() {
        this.state = useState({ count: 0 });
    }
}
```

### Legacy Widgets → OWL

```javascript
// Avant: Widget legacy
odoo.define('my_module.MyWidget', function (require) {
    var Widget = require('web.Widget');

    var MyWidget = Widget.extend({
        template: 'MyWidget',
        events: {
            'click .btn': '_onClick',
        },
        init: function (parent, options) {
            this._super.apply(this, arguments);
            this.data = options.data;
        },
        _onClick: function (ev) {
            this.trigger_up('widget_clicked');
        },
    });

    return MyWidget;
});

// Après: Composant OWL
/** @odoo-module **/
import { Component, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class MyComponent extends Component {
    static template = "my_module.MyComponent";
    static props = {
        data: Object,
    };

    setup() {
        this.notification = useService("notification");
    }

    onClick() {
        this.props.onClicked?.();
    }
}
```

---

## 6. Procédure de Migration

### Checklist Pre-Migration

```markdown
## Préparation
- [ ] Backup complet de la base de données
- [ ] Backup des fichiers (filestore)
- [ ] Liste des modules installés
- [ ] Tests de la version actuelle passent

## Analyse
- [ ] Changelog Odoo pour les breaking changes
- [ ] Analyse des modèles modifiés
- [ ] Vérification des dépendances externes
- [ ] Plan de rollback documenté
```

### Checklist Post-Migration

```markdown
## Validation
- [ ] Tous les modules installés
- [ ] Pas d'erreurs dans les logs
- [ ] Tests automatiques passent
- [ ] Tests manuels des fonctionnalités critiques

## Nettoyage
- [ ] Suppression des backups temporaires
- [ ] Mise à jour de la documentation
- [ ] Communication aux utilisateurs
```

### Commandes de Migration

```bash
# 1. Backup
pg_dump -Fc mydb > mydb_backup.dump
cp -r ~/.local/share/Odoo/filestore/mydb ./filestore_backup

# 2. Mettre à jour Odoo
cd /opt/odoo
git fetch origin
git checkout 19.0

# 3. Mettre à jour les dépendances
pip install -r requirements.txt

# 4. Lancer la migration
./odoo-bin -d mydb -u all --stop-after-init

# 5. Vérifier les logs
tail -f /var/log/odoo/odoo.log | grep -E "(ERROR|WARNING|migration)"

# 6. En cas d'échec - Rollback
pg_restore -d mydb mydb_backup.dump
rm -rf ~/.local/share/Odoo/filestore/mydb
cp -r ./filestore_backup ~/.local/share/Odoo/filestore/mydb
```
