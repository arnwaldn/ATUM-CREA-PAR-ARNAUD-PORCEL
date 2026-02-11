---
description: Migration module Odoo entre versions (user)
---

# /odoo-migrate - Odoo Version Migration

## USAGE
```
/odoo-migrate "module" --from=14 --to=16
/odoo-migrate "module" --from=15 --to=17
/odoo-migrate "module" --analyze
```

## DESCRIPTION
Migration de modules Odoo entre versions majeures
avec detection et correction des breaking changes.

## MIGRATIONS SUPPORTEES

| Source | Cible | Complexite |
|--------|-------|------------|
| 14.0 | 15.0 | Moyenne |
| 14.0 | 16.0 | Haute |
| 15.0 | 16.0 | Moyenne |
| 15.0 | 17.0 | Haute |
| 16.0 | 17.0 | Faible |

## WORKFLOW

### 1. Analyse
```
/odoo-migrate "module" --analyze
```

```yaml
migration_analysis:
  module: custom_inventory
  source_version: 14.0
  target_version: 16.0

  breaking_changes:
    critical: 3
    major: 8
    minor: 15

  changes:
    - type: API_CHANGE
      old: "self.pool.get('model')"
      new: "self.env['model']"
      files: [models/sale.py:12, models/purchase.py:45]

    - type: FIELD_CHANGE
      old: "fields.related"
      new: "fields.Many2one + related='...'"
      files: [models/product.py:23]

    - type: VIEW_CHANGE
      old: "<tree string='...'>"
      new: "<tree>"
      files: [views/sale_views.xml:15]
```

### 2. Plan migration
```yaml
migration_plan:
  phase_1_manifest:
    - Update version in __manifest__.py
    - Update depends versions

  phase_2_models:
    - Replace deprecated API calls
    - Update field definitions
    - Fix compute methods signatures

  phase_3_views:
    - Update view syntax
    - Fix deprecated attributes
    - Update action definitions

  phase_4_security:
    - Update group references
    - Check record rules syntax

  phase_5_tests:
    - Update test imports
    - Fix deprecated test methods
```

### 3. Execution
```javascript
// Appliquer migrations par phase
for (phase of migrationPlan) {
  for (change of phase.changes) {
    Edit({
      file_path: change.file,
      old_string: change.old,
      new_string: change.new
    })
  }
}
```

### 4. Verification
```bash
# Tester le module
./odoo-bin -d test_db -i module_name --test-enable
```

## CHANGES COMMUNS

### 14 → 16
```python
# API
self.pool.get('model')  →  self.env['model']
self.pool['model']      →  self.env['model']

# Fields
fields.related('x', 'y', type='char')
→ y = fields.Char(related='x.y')

# Compute
@api.one
def _compute_x(self):
→
def _compute_x(self):
    for rec in self:
```

### 16 → 17
```python
# Views
<tree string="Title">
→ <tree>

# Actions
<act_window ... />
→ <record model="ir.actions.act_window">
```

## OPTIONS
| Option | Description |
|--------|-------------|
| --from=X | Version source |
| --to=Y | Version cible |
| --analyze | Analyse seulement |
| --dry-run | Preview |
| --backup | Backup avant |

## MCP UTILISES
- Read/Edit (modifications)
- Context7 (migration guides)
- Hindsight (patterns migration)
