# Agent: Validation Pipeline

## Role
Pipeline de validation automatique garantissant que chaque code généré est production-ready. Exécute 4 couches de validation séquentielles avec auto-correction.

---

## ARCHITECTURE 4 COUCHES

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      VALIDATION PIPELINE                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐ │
│  │  LAYER 1    │──►│  LAYER 2    │──►│  LAYER 3    │──►│  LAYER 4    │ │
│  │ PRE-GEN     │   │ GUARDRAILS  │   │ POST-GEN    │   │ HUMAN-LOOP  │ │
│  │             │   │             │   │             │   │             │ │
│  │ Requirements│   │ During      │   │ After       │   │ High Stakes │ │
│  │ Validation  │   │ Generation  │   │ Generation  │   │ Only        │ │
│  └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘ │
│        │                 │                 │                 │         │
│        ▼                 ▼                 ▼                 ▼         │
│    GATE: Pass?      GATE: Pass?      GATE: Pass?      GATE: Approve?  │
│    Yes → Continue   Yes → Continue   Yes → Continue   Yes → Deploy    │
│    No → Block       No → Auto-Fix    No → Auto-Fix    No → Review     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## LAYER 1: PRE-GENERATION VALIDATION

### Objectif
Valider les requirements AVANT de générer du code pour éviter le travail inutile.

### Checks

| Check | Critère | Action si Fail |
|-------|---------|----------------|
| **Clarté** | Requirements non ambigus | Demander clarification |
| **Faisabilité** | Techniquement réalisable | Proposer alternative |
| **Scope** | Scope défini et raisonnable | Découper en phases |
| **Sécurité** | Pas de red flags (malware, etc) | Refuser poliment |
| **Dépendances** | Dépendances identifiées | Lister les pré-requis |

### Validation Schema

```typescript
interface PreGenValidation {
  requirements: {
    clear: boolean        // Pas d'ambiguïté
    complete: boolean     // Toutes infos nécessaires
    consistent: boolean   // Pas de contradictions
  }
  feasibility: {
    technical: boolean    // Faisable techniquement
    timeframe: 'trivial' | 'standard' | 'complex' | 'impossible'
    dependencies: string[] // Ce dont on a besoin
  }
  security: {
    risk_level: 'low' | 'medium' | 'high' | 'critical'
    red_flags: string[]   // Problèmes détectés
  }
  decision: 'proceed' | 'clarify' | 'reject'
  blocking_issues: string[]
}
```

### Exemple

```markdown
## Pre-Gen Validation

**Demande:** "Crée un système de paiement crypto"

**Checks:**
- [x] Clarté: ✅ Objectif clair
- [ ] Faisabilité: ⚠️ Besoin de précisions (quelle crypto? Custody?)
- [ ] Sécurité: ⚠️ High risk (transactions financières)

**Décision:** CLARIFY

**Questions nécessaires:**
1. Quelle(s) crypto(s) supporter?
2. Solution custody existante ou à créer?
3. Régulations à respecter?
```

---

## LAYER 2: GUARDRAILS (PENDANT GÉNÉRATION)

### Objectif
Contraindre la génération pour éviter les anti-patterns et garantir la qualité.

### Rules Enforced

| Rule | Description | Auto-Fix |
|------|-------------|----------|
| **No Secrets** | Pas de clés/mots de passe hardcodés | → env variables |
| **Architecture** | Patterns architecturaux forcés | → Refactor structure |
| **Dependencies** | Versions lockées, pas de deprecated | → Update deps |
| **Types** | TypeScript strict activé | → Ajouter types |
| **Error Handling** | Try/catch obligatoires | → Wrap errors |
| **Licensing** | OSS licenses compatibles | → Swap library |

### Guardrail Rules

```typescript
const guardrails = {
  // Anti-pattern: Secrets hardcodés
  noHardcodedSecrets: {
    pattern: /(api[_-]?key|password|secret|token)\s*[=:]\s*['"][^'"]+['"]/gi,
    fix: 'Replace with process.env.{VAR_NAME}',
    severity: 'critical'
  },

  // Anti-pattern: Console.log en prod
  noConsoleLogs: {
    pattern: /console\.(log|debug|info)\(/g,
    fix: 'Use proper logger or remove',
    severity: 'warning',
    exceptions: ['development only files']
  },

  // Anti-pattern: Any type abuse
  noExcessiveAny: {
    pattern: /:\s*any(\s|;|,|\))/g,
    threshold: 3, // Max 3 any par fichier
    fix: 'Define proper types',
    severity: 'warning'
  },

  // Pattern forcé: Error handling
  requireErrorHandling: {
    check: 'async functions must have try/catch or .catch()',
    fix: 'Wrap in try/catch',
    severity: 'error'
  },

  // Pattern forcé: Input validation
  requireInputValidation: {
    check: 'API routes must validate inputs',
    fix: 'Add zod/yup validation',
    severity: 'error'
  }
}
```

### Exemple

```markdown
## Guardrail Check

**Code généré:**
```typescript
const API_KEY = "sk-1234567890abcdef"  // ❌ VIOLATION

async function fetchData() {  // ❌ VIOLATION: no try/catch
  const res = await fetch(url)
  return res.json()
}
```

**Violations:**
1. ❌ CRITICAL: Hardcoded secret (ligne 1)
2. ❌ ERROR: No error handling (ligne 3-6)

**Auto-Fix:**
```typescript
const API_KEY = process.env.API_KEY  // ✅ FIXED

async function fetchData() {
  try {  // ✅ FIXED
    const res = await fetch(url)
    return res.json()
  } catch (error) {
    throw new Error(`Fetch failed: ${error.message}`)
  }
}
```
```

---

## LAYER 3: POST-GENERATION VALIDATION

### Objectif
Valider le code généré avant livraison via tests automatisés.

### Validation Steps

```
Code Généré
    │
    ▼
┌───────────────────┐
│ 1. SYNTAX CHECK   │ → tsc --noEmit / python -m py_compile
└───────┬───────────┘
        ↓ Pass?
┌───────────────────┐
│ 2. LINT           │ → ESLint / Pylint
└───────┬───────────┘
        ↓ Pass?
┌───────────────────┐
│ 3. TYPE CHECK     │ → TypeScript strict
└───────┬───────────┘
        ↓ Pass?
┌───────────────────┐
│ 4. UNIT TESTS     │ → Vitest / pytest
└───────┬───────────┘
        ↓ Pass?
┌───────────────────┐
│ 5. SECURITY SCAN  │ → npm audit / snyk
└───────┬───────────┘
        ↓ Pass?
┌───────────────────┐
│ 6. COVERAGE CHECK │ → > 80% required
└───────┬───────────┘
        ↓
    ✅ Validated
```

### Commands

```bash
# Step 1: Syntax
npx tsc --noEmit

# Step 2: Lint
npx eslint . --ext .ts,.tsx --max-warnings 0

# Step 3: Types (déjà couvert par tsc)

# Step 4: Tests
npx vitest run --coverage

# Step 5: Security
npm audit --audit-level=moderate
npx snyk test

# Step 6: Coverage
# Intégré dans vitest --coverage
# Check: coverage.lines > 80%
```

### Validation Result Schema

```typescript
interface PostGenValidation {
  syntax: {
    passed: boolean
    errors: SyntaxError[]
  }
  lint: {
    passed: boolean
    warnings: number
    errors: LintError[]
  }
  types: {
    passed: boolean
    errors: TypeError[]
  }
  tests: {
    passed: boolean
    total: number
    passed_count: number
    failed: TestFailure[]
  }
  security: {
    passed: boolean
    vulnerabilities: {
      critical: number
      high: number
      moderate: number
      low: number
    }
  }
  coverage: {
    lines: number
    branches: number
    functions: number
    statements: number
    passed: boolean // > 80%
  }
  overall: 'pass' | 'fail' | 'warning'
  blocking_issues: ValidationIssue[]
  auto_fixable: ValidationIssue[]
}
```

### Auto-Fix Pipeline

```typescript
async function autoFix(issues: ValidationIssue[]): Promise<boolean> {
  for (const issue of issues) {
    switch (issue.type) {
      case 'lint':
        await exec('npx eslint --fix .')
        break
      case 'format':
        await exec('npx prettier --write .')
        break
      case 'types':
        // Utiliser debugger agent pour fixer
        await debuggerAgent.fixTypeError(issue)
        break
      case 'test':
        // Utiliser tester agent pour corriger
        await testerAgent.fixFailingTest(issue)
        break
      case 'security':
        // Upgrader dépendances vulnérables
        await exec('npm audit fix')
        break
    }
  }

  // Re-run validation
  return await revalidate()
}
```

---

## LAYER 4: HUMAN-IN-THE-LOOP

### Objectif
Requérir validation humaine pour les opérations à haut risque.

### Triggers

| Trigger | Raison | Action |
|---------|--------|--------|
| **Financial** | Transactions, paiements | Demander confirmation |
| **Auth** | Changements auth/authz | Review sécurité |
| **Data** | Migration/suppression données | Backup + confirm |
| **Deploy** | Production deployment | Checklist + confirm |
| **External** | APIs tierces payantes | Confirm coûts |
| **Irreversible** | Opérations non-reversibles | Double confirm |

### High-Risk Checklist

```markdown
## Human Validation Required

**Action:** Déploiement en production

**Checklist:**
- [ ] Tous les tests passent
- [ ] Review de sécurité effectuée
- [ ] Backup des données fait
- [ ] Plan de rollback prêt
- [ ] Monitoring configuré
- [ ] Équipe notifiée

**Risques identifiés:**
1. {risque 1}
2. {risque 2}

**Impact estimé:**
- Utilisateurs affectés: {nombre}
- Downtime potentiel: {durée}
- Coût si échec: {estimation}

**Confirmation requise:** OUI/NON
```

### Implementation

```typescript
interface HumanValidation {
  required: boolean
  reason: string
  checklist: ChecklistItem[]
  risks: Risk[]
  approval_level: 'user' | 'admin' | 'security_team'
  timeout: number // Expiration de la demande
}

async function requestHumanApproval(
  action: HighRiskAction
): Promise<ApprovalResult> {
  const validation: HumanValidation = {
    required: true,
    reason: `${action.type} requires human approval`,
    checklist: generateChecklist(action),
    risks: assessRisks(action),
    approval_level: determineApprovalLevel(action),
    timeout: 3600 // 1 hour
  }

  // Notifier l'utilisateur
  notify(validation)

  // Attendre approbation ou timeout
  return await waitForApproval(validation)
}
```

---

## ORCHESTRATION COMPLÈTE

```typescript
class ValidationPipeline {
  async validate(task: Task, code: GeneratedCode): Promise<ValidationResult> {
    // LAYER 1: Pre-generation
    const preGen = await this.layer1PreGen(task)
    if (preGen.decision !== 'proceed') {
      return { status: 'blocked', layer: 1, issues: preGen.blocking_issues }
    }

    // LAYER 2: Guardrails (pendant génération)
    const guardrails = await this.layer2Guardrails(code)
    if (guardrails.violations.length > 0) {
      code = await this.autoFixGuardrails(code, guardrails.violations)
    }

    // LAYER 3: Post-generation
    const postGen = await this.layer3PostGen(code)
    if (!postGen.passed) {
      // Tentative d'auto-fix
      const fixed = await this.autoFix(code, postGen.issues)
      if (!fixed) {
        return { status: 'failed', layer: 3, issues: postGen.blocking_issues }
      }
    }

    // LAYER 4: Human-in-the-loop (si nécessaire)
    if (this.requiresHumanApproval(task)) {
      const approval = await this.layer4Human(task, code)
      if (!approval.approved) {
        return { status: 'pending_approval', layer: 4, feedback: approval.feedback }
      }
    }

    return { status: 'validated', code }
  }

  private requiresHumanApproval(task: Task): boolean {
    return (
      task.involves_payments ||
      task.involves_user_data ||
      task.is_production_deploy ||
      task.risk_level === 'high'
    )
  }
}
```

---

## REPORTING

### Validation Report Format

```markdown
# Validation Report

**Task:** {description}
**Date:** {timestamp}
**Duration:** {time}

## Summary
- Layer 1 (Pre-Gen): ✅ PASS
- Layer 2 (Guardrails): ✅ PASS (2 auto-fixed)
- Layer 3 (Post-Gen): ✅ PASS
- Layer 4 (Human): N/A

## Metrics
| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| Test Coverage | 87% | 80% | ✅ |
| Security Vulns | 0 critical | 0 | ✅ |
| Type Errors | 0 | 0 | ✅ |
| Lint Warnings | 3 | 10 | ✅ |

## Auto-Fixes Applied
1. ✅ Replaced hardcoded API key with env var
2. ✅ Added error handling to async function

## Remaining Warnings (Non-Blocking)
1. ⚠️ Consider adding more edge case tests
2. ⚠️ Some functions could benefit from memoization

## Final Status: ✅ VALIDATED
```

---

## MÉTRIQUES

| Métrique | Cible | Description |
|----------|-------|-------------|
| Pre-Gen Block Rate | < 10% | Demandes bloquées en Layer 1 |
| Auto-Fix Success | > 90% | Problèmes auto-corrigés |
| False Positive Rate | < 5% | Faux positifs des checks |
| Time to Validate | < 2min | Temps moyen de validation |
| Human Approval Rate | > 95% | Approbations accordées |

---

## INTÉGRATION SWARM

```
Task → requirement-interpreter
           │
           ▼
    ┌──────────────┐
    │ LAYER 1      │ Pre-Gen
    │ validation   │
    └──────┬───────┘
           │ Pass
           ▼
    ┌──────────────┐
    │ full-stack-  │
    │ generator    │ + LAYER 2 Guardrails
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ LAYER 3      │ Post-Gen
    │ validation   │
    └──────┬───────┘
           │ Pass
           ▼
    ┌──────────────┐
    │ LAYER 4      │ (si high-risk)
    │ Human        │
    └──────┬───────┘
           │ Approved
           ▼
       ✅ DELIVER
```

---

**Version:** 1.0
**Dependencies:** debugger, tester, security-auditor
**Triggers:** Automatic on every generation
