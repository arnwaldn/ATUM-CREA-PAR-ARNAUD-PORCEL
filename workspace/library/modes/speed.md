# Mode Speed v25.0

**Type**: performance
**Activation**: `/mode speed` ou `/turbo`
**Usage**: Quand la vitesse est prioritaire

---

## Configuration Comportementale v25.0

```json
{
  "mode": "speed",
  "version": "25.0",

  "execution": {
    "parallelism": "maximum",
    "maxConcurrentAgents": 25,
    "confidenceThreshold": 50,
    "autoFix": true,
    "checkpointFrequency": "async",
    "skipClarify": true
  },

  "validation": {
    "lint": false,
    "typeCheck": false,
    "testCoverage": 0,
    "securityScan": "none",
    "performanceCheck": false,
    "batchValidation": true
  },

  "tokens": {
    "optimization": "aggressive",
    "maxResponseLength": "short",
    "compressionLevel": 3,
    "skipComments": true
  },

  "agents": {
    "priority": ["parallel-executor-v18", "task-decomposer", "token-optimizer"],
    "optional": [],
    "disabled": ["confidence-checker", "security-auditor", "self-reflection-loop"]
  },

  "mcps": {
    "required": ["hindsight"],
    "preferred": [],
    "fallbackEnabled": false,
    "skipContext7": true
  },

  "hooks": {
    "enabled": ["memory-first"],
    "blocking": [],
    "skipNonCritical": true
  },

  "memory": {
    "recallBefore": true,
    "retainAfter": false,
    "banks": ["patterns"]
  },

  "workflow": {
    "skipArchitectureReview": true,
    "skipDocumentation": true,
    "skipTests": true,
    "parallelBuild": true
  }
}
```

---

## Description

Mode optimisé pour une exécution rapide. Réduit les validations
et parallélise au maximum. Idéal pour prototypage et itérations rapides.

---

## Caractéristiques

| Aspect | Comportement |
|--------|--------------|
| **Vitesse** | Maximale |
| **Qualité** | Suffisante |
| **Coût tokens** | Réduit 40% |
| **Validation** | Minimale |
| **Parallélisation** | Maximale (25 agents) |

---

## Optimisations

1. **Skip validations non-critiques**
   - Pas de lint intermédiaire
   - Tests différés
   - Security check en batch final

2. **Parallélisation agressive**
   - 25 agents simultanés
   - Files non-bloquantes
   - Checkpoints async

3. **Réduction tokens**
   - Mode TOON actif
   - Réponses concises
   - Moins de commentaires

---

## Workflow Accéléré

```
1. Intent → Exécution directe (skip clarify si >60% confidence)
2. Parallel build (UI + Backend + DB simultanés)
3. Validation batch finale
```

---

## Quand l'utiliser

- Prototypes rapides
- Hackathons
- POC (Proof of Concept)
- Itérations de design

---

## Agents Activés

- Parallel Executor v18 (priorité MAX)
- Task Decomposer (granularité fine)
- Token Optimizer (mode agressif)

---

## Risques

⚠️ Moins de vérifications = plus d'erreurs potentielles
⚠️ À utiliser pour du code non-production
⚠️ Revenir en mode Standard avant deploy

---

*ATUM CREA - Mode Speed*
