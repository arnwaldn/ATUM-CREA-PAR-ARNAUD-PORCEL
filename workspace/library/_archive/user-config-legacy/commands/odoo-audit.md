---
description: Audit module Odoo (user)
---

# /odoo-audit - Odoo Module Audit

## USAGE
```
/odoo-audit "path/to/module"
/odoo-audit "module_name" --focus=security
/odoo-audit "module_name" --full
```

## DESCRIPTION
Audit complet d'un module Odoo pour identifier
les problemes de qualite, securite et performance.

## CATEGORIES AUDIT

### 1. Structure
```yaml
structure_check:
  manifest: OK/MISSING
  init_files: OK/INCOMPLETE
  security_folder: OK/MISSING
  tests_folder: OK/MISSING
  static_folder: OK/MISSING
```

### 2. Security
```yaml
security_issues:
  - issue: "Missing access rights for model"
    model: custom.model
    severity: HIGH

  - issue: "No record rules defined"
    model: custom.model
    severity: MEDIUM

  - issue: "SQL injection risk"
    file: models/report.py
    line: 45
    severity: CRITICAL
```

### 3. Performance
```yaml
performance_issues:
  - issue: "N+1 query in loop"
    file: models/sale.py
    line: 78
    fix: "Use mapped() or prefetch"

  - issue: "Heavy compute without store"
    field: total_amount
    fix: "Add store=True"
```

### 4. Code Quality
```yaml
quality_issues:
  - issue: "Deprecated API usage"
    old: "self.pool.get('res.partner')"
    new: "self.env['res.partner']"

  - issue: "Missing string on field"
    field: custom_field
```

### 5. Best Practices
```yaml
best_practices:
  - issue: "No tests found"
    recommendation: "Add tests/test_*.py"

  - issue: "No documentation"
    recommendation: "Add README.rst"
```

## RAPPORT AUDIT

```yaml
audit_report:
  module: custom_inventory
  version: 16.0.1.0.0

  score: 72/100

  summary:
    structure: 90%
    security: 60%
    performance: 75%
    quality: 70%
    best_practices: 65%

  critical_issues: 2
  high_issues: 5
  medium_issues: 8
  low_issues: 12

  recommendations:
    priority_1:
      - "Fix SQL injection in report.py"
      - "Add access rights for custom.model"

    priority_2:
      - "Optimize N+1 queries"
      - "Add store=True to computed fields"

    priority_3:
      - "Add unit tests"
      - "Update deprecated API calls"
```

## OPTIONS
| Option | Description |
|--------|-------------|
| --focus=X | security, perf, quality |
| --full | Audit complet |
| --fix | Auto-fix issues simples |
| --report | Generer rapport PDF |

## WORKFLOW

### 1. Scan structure
Verifier presence fichiers requis

### 2. Analyse statique
Parser Python et XML

### 3. Detection patterns
- Security anti-patterns
- Performance issues
- Deprecated APIs

### 4. Scoring
Calculer score global

### 5. Recommendations
Prioriser les corrections

## CHECKS SPECIFIQUES

| Check | Description |
|-------|-------------|
| ACL | ir.model.access.csv complet |
| Rules | Record rules definies |
| SQL | Pas de raw SQL |
| API | Pas d'API deprecated |
| Fields | Tous avec string |
| Compute | store si heavy |
