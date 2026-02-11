# Mode Standard v25.0

**Type**: default
**Activation**: Mode par défaut, toujours actif
**Usage**: `/mode standard` ou automatique

---

## Configuration Comportementale v25.0

```json
{
  "mode": "standard",
  "version": "25.0",

  "execution": {
    "parallelism": "adaptive",
    "maxConcurrentAgents": 10,
    "confidenceThreshold": 70,
    "autoFix": true,
    "checkpointFrequency": "on_milestone"
  },

  "validation": {
    "lint": true,
    "typeCheck": true,
    "testCoverage": 60,
    "securityScan": "basic",
    "performanceCheck": false
  },

  "tokens": {
    "optimization": "balanced",
    "maxResponseLength": "auto",
    "compressionLevel": 1
  },

  "agents": {
    "priority": ["pm-agent", "confidence-checker", "self-checker"],
    "optional": ["token-optimizer"],
    "disabled": []
  },

  "mcps": {
    "required": ["context7", "hindsight"],
    "preferred": ["shadcn", "supabase"],
    "fallbackEnabled": true
  },

  "hooks": {
    "enabled": ["memory-first", "enforce-v25-rules", "knowledge-auto-load"],
    "blocking": ["enforce-v25-rules"]
  },

  "memory": {
    "recallBefore": true,
    "retainAfter": true,
    "banks": ["ultra-dev-memory", "patterns"]
  }
}
```

---

## Description

Mode équilibré optimisant le rapport qualité/vitesse/coût.
C'est le mode par défaut utilisé pour la majorité des tâches.

---

## Caractéristiques

| Aspect | Comportement |
|--------|--------------|
| **Vitesse** | Modérée |
| **Qualité** | Élevée |
| **Coût tokens** | Optimisé |
| **Validation** | Standard |
| **Parallélisation** | Selon complexité |

---

## Workflow

```
1. Intent Parsing (confidence check)
2. Memory Recall (Hindsight)
3. Context7 si framework
4. Exécution avec validation
5. Memory Retain si apprentissage
```

---

## Quand l'utiliser

- Tâches quotidiennes de développement
- Bugs et corrections
- Ajout de fonctionnalités
- Refactoring standard

---

## Agents Activés

- PM Agent (orchestration)
- Confidence Checker
- Self-Checker
- Token Optimizer

---

*ATUM CREA - Mode Standard*
