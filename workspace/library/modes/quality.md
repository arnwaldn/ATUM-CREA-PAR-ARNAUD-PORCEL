# Mode Quality v25.0

**Type**: precision
**Activation**: `/mode quality` ou `/careful`
**Usage**: Code production-ready, systèmes critiques

---

## Configuration Comportementale v25.0

```json
{
  "mode": "quality",
  "version": "25.0",

  "execution": {
    "parallelism": "limited",
    "maxConcurrentAgents": 5,
    "confidenceThreshold": 90,
    "autoFix": false,
    "checkpointFrequency": "each_step",
    "requireApproval": true
  },

  "validation": {
    "lint": true,
    "lintStrict": true,
    "typeCheck": true,
    "typeCheckStrict": true,
    "testCoverage": 80,
    "testTypes": ["unit", "integration", "e2e"],
    "securityScan": "comprehensive",
    "securityTools": ["npm-audit", "semgrep", "secrets-detection"],
    "performanceCheck": true,
    "performanceMetrics": ["bundle-size", "lighthouse", "web-vitals"],
    "webVitals": {
      "LCP": 2500,
      "INP": 200,
      "CLS": 0.1
    }
  },

  "tokens": {
    "optimization": "none",
    "maxResponseLength": "full",
    "compressionLevel": 0,
    "includeComments": true,
    "includeDocumentation": true
  },

  "agents": {
    "priority": ["quality-super", "security-auditor", "auto-validator", "validation-pipeline"],
    "optional": ["self-healer"],
    "disabled": ["token-optimizer"],
    "required": ["self-reflection-loop", "tree-of-thoughts"]
  },

  "mcps": {
    "required": ["context7", "hindsight", "shadcn"],
    "preferred": ["supabase", "github"],
    "fallbackEnabled": true,
    "validateAllCalls": true
  },

  "hooks": {
    "enabled": ["memory-first", "enforce-v25-rules", "knowledge-auto-load", "pre-edit-check", "post-edit-learn"],
    "blocking": ["enforce-v25-rules", "pre-edit-check"]
  },

  "memory": {
    "recallBefore": true,
    "retainAfter": true,
    "banks": ["ultra-dev-memory", "patterns", "errors"]
  },

  "outputs": {
    "testReport": true,
    "securityReport": true,
    "coverageReport": true,
    "changelog": true,
    "apiDocumentation": true
  }
}
```

---

## Description

Mode focalisé sur la qualité maximale. Validations exhaustives,
tests complets, security scan. Pour du code destiné à la production.

---

## Caractéristiques

| Aspect | Comportement |
|--------|--------------|
| **Vitesse** | Réduite (2-3x standard) |
| **Qualité** | Maximale |
| **Coût tokens** | Élevé (+50%) |
| **Validation** | Exhaustive |
| **Parallélisation** | Limitée (sécurité) |

---

## Validations Activées

### Code Quality
- [ ] ESLint/Biome strict mode
- [ ] TypeScript strict
- [ ] Prettier formatting
- [ ] Complexity analysis

### Tests
- [ ] Unit tests coverage >80%
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] Regression tests

### Security
- [ ] npm audit
- [ ] Semgrep scan
- [ ] OWASP top 10 check
- [ ] Secrets detection
- [ ] Dependency vulnerabilities

### Performance
- [ ] Bundle size analysis
- [ ] Lighthouse audit
- [ ] Memory profiling
- [ ] **Web Vitals monitoring actif** (templates saas/landing/ecommerce)
- [ ] **INP < 200ms** (remplace FID depuis mars 2024)
- [ ] **LCP < 2.5s, CLS < 0.1**

---

## Workflow Approfondi

```
1. Intent → Clarify si <90% confidence
2. Architecture review
3. Code generation avec TDD
4. Multi-pass validation
5. Security audit
6. Performance profiling
7. Documentation auto-générée
```

---

## Quand l'utiliser

- Déploiement production
- Systèmes critiques (paiements, santé)
- Code open-source public
- Audits de sécurité
- Refactoring majeur

---

## Agents Activés

- Quality Super (orchestration)
- Security Auditor
- Auto Validator
- Self-Healer
- Validation Pipeline

---

## Outputs Additionnels

- Rapport de couverture tests
- Rapport sécurité
- Changelog détaillé
- Documentation API

---

*ATUM CREA - Mode Quality*
