# Mode Architect v25.0

**Type**: design
**Activation**: `/mode architect` ou `/design`
**Usage**: Architecture avant implémentation

---

## Configuration Comportementale v25.0

```json
{
  "mode": "architect",
  "version": "25.0",

  "execution": {
    "parallelism": "sequential",
    "maxConcurrentAgents": 3,
    "confidenceThreshold": 85,
    "autoFix": false,
    "checkpointFrequency": "each_decision",
    "codeGeneration": false,
    "designOnly": true
  },

  "validation": {
    "lint": false,
    "typeCheck": false,
    "testCoverage": 0,
    "securityScan": "design-review",
    "performanceCheck": false,
    "architectureReview": true
  },

  "tokens": {
    "optimization": "none",
    "maxResponseLength": "extended",
    "compressionLevel": 0,
    "includeExplanations": true
  },

  "agents": {
    "priority": ["design-strategist", "database-architect", "api-designer", "tech-scout"],
    "optional": ["deep-researcher"],
    "disabled": ["frontend-developer", "backend-developer", "tester"],
    "required": ["tree-of-thoughts", "reasoning-agent"]
  },

  "mcps": {
    "required": ["context7", "hindsight", "mermaid"],
    "preferred": ["github", "notion"],
    "fallbackEnabled": true
  },

  "hooks": {
    "enabled": ["memory-first", "knowledge-auto-load"],
    "blocking": []
  },

  "memory": {
    "recallBefore": true,
    "retainAfter": true,
    "banks": ["ultra-dev-memory", "patterns"],
    "recallSimilarProjects": true
  },

  "outputs": {
    "adr": true,
    "diagrams": true,
    "projectStructure": true,
    "stackJustification": true,
    "tradeoffsAnalysis": true,
    "codeGen": false
  },

  "workflow": {
    "requireUserValidation": true,
    "noCodeBeforeApproval": true,
    "exploreAlternatives": true,
    "documentDecisions": true
  }
}
```

---

## Description

Mode focalisé sur l'architecture et le design système.
Pas de code - seulement des plans, diagrammes et décisions.

---

## Caractéristiques

| Aspect | Comportement |
|--------|--------------|
| **Vitesse** | N/A (pas d'exécution) |
| **Qualité** | Design rigoureux |
| **Coût tokens** | Modéré |
| **Validation** | Review architecture |
| **Output** | Plans, diagrammes |

---

## Outputs Générés

### 1. Architecture Decision Records (ADR)
```markdown
# ADR-001: Choix de la base de données

## Contexte
...

## Décision
PostgreSQL via Supabase

## Conséquences
+ Avantages...
- Inconvénients...
```

### 2. Diagrammes (Mermaid)
- Architecture globale
- Flux de données
- Séquences d'interactions
- ERD (base de données)

### 3. Structure Projet
```
/project
├── /src
│   ├── /components
│   ├── /features
│   └── /lib
├── /tests
└── /docs
```

### 4. Stack Technique
- Justification de chaque choix
- Alternatives considérées
- Trade-offs documentés

---

## Workflow

```
1. Analyse des requirements
2. Exploration des patterns applicables
3. Recall Hindsight (projets similaires)
4. Design architecture
5. Génération diagrammes
6. Documentation décisions
7. Validation avec utilisateur
8. (Optionnel) Transition vers mode Standard
```

---

## Quand l'utiliser

- Nouveau projet complexe
- Refactoring majeur
- Migration de système
- Discussion technique
- Documentation architecture existante

---

## Agents Activés

- Design Strategist
- Database Architect
- API Designer
- Tech Scout (recherche alternatives)

---

## Transition

Après validation de l'architecture:
```
/mode standard  → Implémentation normale
/mode speed     → Prototypage rapide
/mode quality   → Implémentation production
```

---

*ATUM CREA - Mode Architect*
