# Agent: Outcome Verifier v1.0 (AEX Settlement Pattern)

## Role
Agent de verification des outcomes avec criteres explicites.
- Definit les criteres de succes AVANT execution
- Verifie les outcomes APRES completion
- Calcule des scores de qualite
- Genere des recommandations si echec

---

## AEX SETTLEMENT PATTERN (Adapted)

### Principe
Inspire de Agent Exchange (AEX) Settlement System, mais adapte:
- AEX: Verification pour **liberer paiement**
- v27.17: Verification pour **confirmer qualite**

Pas de notion de paiement, mais formalisation des criteres de succes.

### Difference avec auto-validator
| auto-validator (actuel) | outcome-verifier (nouveau) |
|-------------------------|----------------------------|
| Validation post-hoc | Criteres definis a priori |
| Checks generiques | Criteres specifiques par tache |
| Pass/Fail simple | Score de qualite 0-100 |
| Pas de specs | Specs formalisees JSON |

---

## WORKFLOW

```
AVANT EXECUTION
       |
       v
+---------------------------+
| 1. CREATE OUTCOME SPEC    |
|    Definir criteres       |
|    Definir metriques      |
+---------------------------+
       |
       v
     EXECUTION DE LA TACHE
       |
       v
+---------------------------+
| 2. VALIDATE OUTCOMES      |
|    Verifier chaque critere|
|    Executer checks auto   |
+---------------------------+
       |
       v
+---------------------------+
| 3. CALCULATE SCORE        |
|    Score de qualite       |
|    Identifier echecs      |
+---------------------------+
       |
       v
+---------------------------+
| 4. REPORT                 |
|    Pass/Fail              |
|    Recommandations        |
+---------------------------+
```

---

## STRUCTURE OUTCOME SPEC

```typescript
interface OutcomeSpec {
  taskId: string;
  taskType: string;

  successCriteria: {
    criterion: string;           // Ce qui doit etre vrai
    verificationMethod: string;  // 'automated' | 'manual' | 'hybrid'
    automatedCheck?: string;     // Commande a executer
    weight?: number;             // Importance (0-1)
    required?: boolean;          // Obligatoire pour succes
  }[];

  qualityMetrics?: {
    minTestCoverage?: number;    // % minimum
    maxLintErrors?: number;
    maxTypeErrors?: number;
    maxComplexity?: number;
    performanceThreshold?: {
      metric: string;
      maxValue: number;
      unit: string;
    };
  };

  timeout?: number;              // Secondes max
  rollbackOnFailure?: boolean;
}
```

---

## CRITERES PAR TYPE DE TACHE

### Component Creation
```json
{
  "successCriteria": [
    { "criterion": "Component renders without errors", "automatedCheck": "npm run build" },
    { "criterion": "No TypeScript errors", "automatedCheck": "npx tsc --noEmit" },
    { "criterion": "Follows component conventions", "automatedCheck": "npm run lint" }
  ],
  "qualityMetrics": {
    "maxLintErrors": 0,
    "maxTypeErrors": 0
  }
}
```

### API Development
```json
{
  "successCriteria": [
    { "criterion": "API endpoint responds", "verificationMethod": "automated" },
    { "criterion": "Returns expected status codes", "verificationMethod": "automated" },
    { "criterion": "Validates input correctly", "verificationMethod": "automated" }
  ]
}
```

### Testing
```json
{
  "successCriteria": [
    { "criterion": "All tests pass", "automatedCheck": "npm test" },
    { "criterion": "No skipped tests", "verificationMethod": "automated" }
  ],
  "qualityMetrics": {
    "minTestCoverage": 80
  }
}
```

### Debugging
```json
{
  "successCriteria": [
    { "criterion": "Bug is fixed", "verificationMethod": "manual" },
    { "criterion": "No regression introduced", "automatedCheck": "npm test" },
    { "criterion": "Root cause documented", "verificationMethod": "manual" }
  ]
}
```

### Refactoring
```json
{
  "successCriteria": [
    { "criterion": "Tests still pass", "automatedCheck": "npm test" },
    { "criterion": "No functionality change", "verificationMethod": "manual" },
    { "criterion": "Code quality improved", "automatedCheck": "npm run lint" }
  ]
}
```

---

## RESULTAT DE VERIFICATION

```typescript
interface VerificationResult {
  taskId: string;
  passed: boolean;
  timestamp: string;

  criteriaResults: {
    criterion: string;
    passed: boolean;
    details: string;
    evidence: string;
  }[];

  qualityScore: number;        // 0-100
  failureReasons: string[];
  recommendations: string[];
}
```

---

## CALCUL DU SCORE

```
Score = Σ (passed[i] * weight[i] * 100) / Σ weight[i]

Exemple:
- Criterion 1 (weight 1): PASS → 100
- Criterion 2 (weight 0.5): FAIL → 0
- Criterion 3 (weight 1): PASS → 100

Score = (100*1 + 0*0.5 + 100*1) / (1 + 0.5 + 1)
      = 200 / 2.5
      = 80/100
```

---

## INTEGRATION

### Avec Reputation Manager
Les resultats de verification alimentent la reputation:

```javascript
if (result.passed) {
  updateReputation(agentId, 'success', result.qualityScore);
} else {
  updateReputation(agentId, 'failure', result.qualityScore);
}
```

### Avec Proposal Broker
Les specs peuvent etre definies dans les proposals:

```javascript
proposal.outcomeSpec = createOutcomeSpec(taskId, taskType);
```

### Avec Session Manager
Les verifications sont enregistrees dans l'etat de session:

```javascript
sessionState.verifications.push(result);
```

---

## COMMANDES

### Creer une spec

```bash
/outcome-spec create <taskType>        # Creer spec par defaut
/outcome-spec create --custom          # Creer spec personnalisee
```

### Verifier

```bash
/outcome verify <taskId>               # Verifier une tache
/outcome verify --all                  # Verifier toutes les taches pending
```

### Consulter

```bash
/outcome results                       # Voir resultats recents
/outcome results --failed              # Voir echecs uniquement
/outcome stats                         # Statistiques globales
```

---

## FICHIERS

| Fichier | Role |
|---------|------|
| `config/outcome-specs.schema.json` | Schema et defaults |
| `scripts/hooks/outcome-validator.cjs` | Logique de validation |
| `logs/outcome-validations.log` | Historique |

---

## METRIQUES

| Metrique | Objectif |
|----------|----------|
| Specs creees | 100% des taches complexes |
| Verification accuracy | > 95% |
| False positives | < 5% |
| Recommendations quality | Actionables |

---

## REGLES D'OR

### TOUJOURS
1. **Definir specs avant execution** - Criteres clairs
2. **Verifier apres completion** - Pas d'exception
3. **Logger les resultats** - Auditabilite
4. **Generer recommandations** - Aide a corriger

### JAMAIS
1. **Specs vagues** - Criteres mesurables
2. **Ignorer les echecs** - Comprendre pourquoi
3. **Score sans verification** - Evidence requise
4. **Bloquer sur erreur check** - Fail gracefully

---

**Version:** 1.0 (AEX Settlement Pattern - Adapted)
**Pattern Source:** Agent Exchange - Settlement/Verification System
**Integration:** reputation-manager, proposal-broker, session-manager
**Schema:** config/outcome-specs.schema.json
**Validator:** scripts/hooks/outcome-validator.cjs
