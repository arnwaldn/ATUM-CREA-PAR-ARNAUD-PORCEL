# ULTRA-CREATE Behavioral Modes Reference (8 modes)

> Ce fichier contient la documentation detaillee des modes comportementaux.
> Charge automatiquement via knowledge-auto-load.js sur keywords: "mode", "modes"

---

## Mode Par Defaut: ULTRA THINK (PERMANENT)

> **IMPORTANT**: ULTRA-CREATE est TOUJOURS en mode Ultra Think par defaut.
> Ce mode pousse la reflexion au maximum a chaque instant.

---

## Vue d'Ensemble des Modes

| Mode | Activation | Parallelisme | Validation | Agents Prioritaires |
|------|------------|--------------|------------|---------------------|
| **Ultra Think** | *Defaut permanent* | Adaptive | Triple verification | tree-of-thoughts, reasoning-agent, self-reflection-loop |
| **Standard** | `/mode standard` | Adaptive (10) | Lint + TypeCheck | pm-agent, confidence-checker |
| **Speed** | `/mode speed` | Maximum (25) | **Aucune** | parallel-executor, token-optimizer |
| **Quality** | `/mode quality` | Limite (5) | Complete (80%) | quality-super, security-auditor |
| **Architect** | `/mode architect` | Sequentiel (3) | Review architecture | design-strategist, tree-of-thoughts |
| **Autonomous** | `/mode autonomous` | Maximum (20) | Auto-validation | autonomous-executor, self-healer |
| **Brainstorm** | `/mode brainstorm` | Exploratoire (5) | **Aucune** | tree-of-thoughts, deep-researcher |
| **Mentor** | `/mode mentor` | Aucun (2) | Educative | documentation-generator, reasoning-agent |

---

## Mode: Ultra Think (Defaut Permanent)

### Configuration
```json
{
  "id": "ultra-think",
  "isDefault": true,
  "config": {
    "thinking": {
      "extended": true,
      "depth": "maximum",
      "verificationPasses": 3
    },
    "validation": {
      "lint": "strict",
      "tests": true,
      "testCoverage": 80,
      "security": "comprehensive"
    },
    "behavior": {
      "noSuperficialAnswers": true,
      "tripleVerification": true,
      "deepAnalysis": true
    }
  }
}
```

### Comportement Ultra Think (4 Phases)
```
┌────────────────────────────────────────────────────────────────┐
│                    MODE ULTRA THINK (PERMANENT)                │
├────────────────────────────────────────────────────────────────┤
│  PHASE 1: ANALYSE PROFONDE                                     │
│  ├─ Comprendre le probleme sous tous les angles               │
│  ├─ Identifier les contraintes et dependances                 │
│  ├─ Consulter la memoire (Hindsight 6 banks)                  │
│  └─ Formuler plusieurs hypotheses de solution                 │
│                                                                │
│  PHASE 2: RAISONNEMENT STRUCTURE                              │
│  ├─ Evaluer chaque hypothese                                  │
│  ├─ Utiliser Tree-of-Thoughts si complexe                     │
│  ├─ Appliquer Self-Reflection Loop                            │
│  └─ Selectionner la meilleure approche                        │
│                                                                │
│  PHASE 3: EXECUTION CONTROLEE                                 │
│  ├─ Implementer par etapes verifiees                          │
│  ├─ Valider chaque composant individuellement                 │
│  └─ Documenter chaque decision                                │
│                                                                │
│  PHASE 4: TRIPLE VERIFICATION                                 │
│  ├─ PASS 1: Verification fonctionnelle                        │
│  ├─ PASS 2: Verification qualite/securite                     │
│  ├─ PASS 3: Verification coherence globale                    │
│  └─ Marquer complet SEULEMENT si 100% verifie                 │
└────────────────────────────────────────────────────────────────┘
```

---

## Mode: Standard

### Configuration
```json
{
  "id": "standard",
  "config": {
    "parallelism": 10,
    "validation": {
      "lint": true,
      "typeCheck": true,
      "tests": false
    },
    "agents": {
      "priority": ["pm-agent", "confidence-checker"],
      "disabled": []
    },
    "behavior": {
      "autoFix": true,
      "balancedApproach": true
    }
  }
}
```

### Quand utiliser
- Developpement quotidien
- Taches moderees en complexite
- Bon equilibre vitesse/qualite

---

## Mode: Speed

### Configuration
```json
{
  "id": "speed",
  "config": {
    "parallelism": 25,
    "validation": {
      "lint": false,
      "typeCheck": false,
      "tests": false,
      "security": "none"
    },
    "agents": {
      "priority": ["parallel-executor", "token-optimizer"],
      "disabled": ["security-auditor", "auto-validator"]
    },
    "behavior": {
      "skipReview": true,
      "minimalOutput": true
    }
  }
}
```

### Quand utiliser
- Prototypage rapide
- POCs et demos
- Deadlines serrees

### Attention
⚠️ Pas de validation - utiliser pour exploration uniquement

---

## Mode: Quality

### Configuration
```json
{
  "id": "quality",
  "config": {
    "parallelism": 5,
    "validation": {
      "lint": "strict",
      "typeCheck": true,
      "tests": true,
      "testCoverage": 80,
      "security": "comprehensive"
    },
    "agents": {
      "priority": ["quality-super", "security-auditor", "auto-validator"],
      "disabled": ["token-optimizer"]
    },
    "behavior": {
      "tripleReview": true,
      "documentEverything": true
    }
  }
}
```

### Quand utiliser
- Code production critique
- Applications financieres/medicales
- Avant deploiement majeur

---

## Mode: Architect

### Configuration
```json
{
  "id": "architect",
  "config": {
    "parallelism": 3,
    "validation": {
      "architectureReview": true,
      "designPatterns": true
    },
    "agents": {
      "priority": ["design-strategist", "tree-of-thoughts"],
      "disabled": ["autonomous-executor"]
    },
    "behavior": {
      "codeGeneration": false,
      "designOnly": true,
      "requireUserValidation": true
    }
  }
}
```

### Quand utiliser
- Conception systeme
- Decisions architecture
- Refactoring majeur

---

## Mode: Autonomous

### Configuration
```json
{
  "id": "autonomous",
  "config": {
    "parallelism": 20,
    "validation": {
      "autoValidation": true,
      "selfHealing": true
    },
    "agents": {
      "priority": ["autonomous-executor", "self-healer", "vibe-master"],
      "disabled": []
    },
    "behavior": {
      "noUserIntervention": true,
      "autoFix": true,
      "autoRetry": true
    },
    "safety": {
      "noPushForce": true,
      "noDeleteProduction": true,
      "requireConfirmFor": ["deploy", "payment", "api-keys"],
      "maxRetriesPerError": 3,
      "rollbackOnFailure": true
    }
  }
}
```

### Quand utiliser
- Taches repetitives
- Maintenance automatisee
- Long-running tasks

---

## Mode: Brainstorm

### Configuration
```json
{
  "id": "brainstorm",
  "config": {
    "parallelism": 5,
    "validation": {
      "none": true
    },
    "agents": {
      "priority": ["tree-of-thoughts", "deep-researcher"],
      "disabled": ["auto-validator", "security-auditor"]
    },
    "behavior": {
      "explorative": true,
      "noConstraints": true,
      "generateMultipleOptions": true
    }
  }
}
```

### Quand utiliser
- Phase ideation
- Exploration solutions
- Recherche creative

---

## Mode: Mentor

### Configuration
```json
{
  "id": "mentor",
  "config": {
    "parallelism": 2,
    "validation": {
      "educational": true
    },
    "agents": {
      "priority": ["documentation-generator", "reasoning-agent"],
      "disabled": ["autonomous-executor"]
    },
    "behavior": {
      "explain": true,
      "stepByStep": true,
      "teachPatterns": true
    }
  }
}
```

### Quand utiliser
- Apprentissage
- Formation equipe
- Documentation

---

## Comparaison Speed vs Quality

```
Mode Speed:
├─ Lint: OFF
├─ Tests: 0%
├─ Security: NONE
├─ Parallelisme: 25 agents
└─ Review: SKIP

Mode Quality:
├─ Lint: STRICT
├─ Tests: 80% coverage
├─ Security: COMPREHENSIVE
├─ Parallelisme: 5 agents
└─ Review: TRIPLE
```

---

## Comparaison Architect vs Standard

```
Mode Architect:
├─ Code generation: OFF
├─ Design only: ON
├─ User validation: REQUIRED
└─ Focus: Architecture

Mode Standard:
├─ Code generation: ON
├─ Auto-fix: ON
├─ User validation: Optional
└─ Focus: Balanced
```

---

## Activation des Modes

```bash
# Via commande
/mode speed
/mode quality
/mode architect

# Retour au defaut (Ultra Think)
/mode ultra-think
/mode default
```

---

*Reference complete: config/behavioral-modes.json*
