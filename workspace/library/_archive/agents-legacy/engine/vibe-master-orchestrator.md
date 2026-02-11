# VIBE-MASTER Orchestrator v26.0

> **Role**: Pipeline unifié autonome qui connecte tous les composants ULTRA-CREATE
> pour livrer des projets de niveau professionnel avec ZERO intervention humaine
> (sauf validation finale de déploiement).

---

## ARCHITECTURE DU PIPELINE

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        VIBE-MASTER ENGINE v26.0                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    PRE-EXECUTION PHASE (Automatique)                     │ │
│  │                                                                          │ │
│  │  1. memory-first.js        → Recall erreurs + patterns Hindsight        │ │
│  │  2. pre-edit-check.js      → Validation + backup avant modification     │ │
│  │  3. Context7               → Documentation frameworks à jour            │ │
│  │  4. Intent Parser          → Détection confidence (>=70% pour GO)       │ │
│  │                                                                          │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                     │                                         │
│                                     ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    EXECUTION PHASE (Automatique)                         │ │
│  │                                                                          │ │
│  │  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                 │ │
│  │  │   AGENTS     │   │   TEMPLATES  │   │   MCPs       │                 │ │
│  │  │              │   │              │   │              │                 │ │
│  │  │ registry.json│◀──│manifest.json │──▶│mcp-selector  │                 │ │
│  │  │ 128 agents   │   │ 149 templates│   │ 61 MCPs      │                 │ │
│  │  └──────────────┘   └──────────────┘   └──────────────┘                 │ │
│  │                                                                          │ │
│  │  Self-Checker: Validation continue pendant exécution                    │ │
│  │  Parallel Executor: Jusqu'à 25 agents simultanés                        │ │
│  │                                                                          │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                     │                                         │
│                                     ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    POST-EXECUTION PHASE (Automatique)                    │ │
│  │                                                                          │ │
│  │  1. self-healing-hook.js   → Détection + auto-correction erreurs        │ │
│  │  2. auto-retain.js         → Sauvegarde completions Hindsight           │ │
│  │  3. post-edit-learn.js     → Apprentissage patterns                     │ │
│  │  4. context-monitor.js     → Surveillance usage context                 │ │
│  │                                                                          │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                     │                                         │
│                                     ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    SELF-HEALING LOOP (Si erreur détectée)                │ │
│  │                                                                          │ │
│  │  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐         │ │
│  │  │    DETECT      │───▶│   DIAGNOSE     │───▶│     FIX        │         │ │
│  │  │                │    │                │    │                │         │ │
│  │  │ Error patterns │    │ Pattern match  │    │ Auto-fix or    │         │ │
│  │  │ Exit codes     │    │ Hindsight      │    │ suggest fix    │         │ │
│  │  │ Output parse   │    │ Context7       │    │ Max 3 retries  │         │ │
│  │  └────────────────┘    └────────────────┘    └────────────────┘         │ │
│  │                                                      │                   │ │
│  │           ┌──────────────────────────────────────────┘                   │ │
│  │           ▼                                                              │ │
│  │  ┌────────────────┐    ┌────────────────┐                               │ │
│  │  │   VALIDATE     │───▶│    LEARN       │                               │ │
│  │  │                │    │                │                               │ │
│  │  │ Tests pass?    │    │ Save fix to    │                               │ │
│  │  │ No regression? │    │ 'errors' bank  │                               │ │
│  │  └────────────────┘    └────────────────┘                               │ │
│  │                                                                          │ │
│  │  Fallback: Rollback to last checkpoint if 3 retries fail                │ │
│  │                                                                          │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## HOOKS ACTIVÉS (8 total)

### PreToolUse (Avant action)

| Hook | Matcher | Priority | Fonction |
|------|---------|----------|----------|
| `memory-first.js` | `Write\|Edit\|Bash` | 1 | Recall Hindsight (6 banks) |
| `pre-edit-check.js` | `Write\|Edit` | 2 | Validation + backup fichiers |

### PostToolUse (Après action)

| Hook | Matcher | Priority | Fonction |
|------|---------|----------|----------|
| `post-edit-learn.js` | `Edit\|Write` | 3 | Analyse patterns → 'patterns' bank |
| `self-healing-hook.js` | `Bash` | 2 | Détection erreurs → auto-fix |
| `auto-retain.js` | `Bash` | 3 | Sauvegarde completions |
| `context-monitor.js` | `*` | 4 | Monitoring context usage |
| Notification | `AskUserQuestion` | - | Alerte attente réponse |

### Stop

| Hook | Fonction |
|------|----------|
| Notification | Alerte tâche terminée |

---

## SEPARATION DES RESPONSABILITÉS

### Évitement des Duplications

```
memory-first.js      → LECTURE seule (6 banks AVANT action)
                       Banks: errors, patterns, ultra-dev-memory, documents, research, trading-brain

post-edit-learn.js   → ÉCRITURE vers 'patterns' (analyse refactoring/bugfix)
                       Trigger: APRÈS edits réussis

self-healing-hook.js → ÉCRITURE vers 'errors' (UNIQUEMENT sur FAILURE Bash)
                       Trigger: Détection erreur dans stdout/stderr

auto-retain.js       → ÉCRITURE vers banks multiples (completions)
                       Banks: errors, patterns, ultra-dev-memory, research, trading-brain
                       Trigger: Mots-clés completion (done, fixed, implemented, etc.)
```

### Pas de Conflit

- `self-healing-hook.js` écrit dans **'errors'** bank
- `post-edit-learn.js` écrit dans **'patterns'** bank
- Aucune duplication car banks différents et triggers différents

---

## AGENTS INTÉGRÉS

### Core Engine Agents

| Agent | Fichier | Rôle dans Pipeline |
|-------|---------|-------------------|
| **Queen v18** | `agents/orchestration/queen-v18.md` | Orchestration macro (QUOI, QUAND) |
| **VIBE-MASTER** | `agents/engine/vibe-master-orchestrator.md` | Pipeline (COMMENT, STYLE) |
| **Self-Healer** | `agents/quality/self-healer.md` | Auto-correction erreurs |
| **Checkpoint Manager** | `agents/orchestration/checkpoint-manager.md` | Backup/Rollback |
| **Memory Bridge** | `agents/orchestration/memory-bridge.md` | Transfert contexte |

### Quality Agents

| Agent | Fichier | Rôle |
|-------|---------|------|
| `auto-validator.md` | `agents/quality/` | 5 couches validation |
| `validation-pipeline.md` | `agents/quality/` | Pipeline 4 étapes |
| `security-auditor.md` | `agents/specialized/` | Audit sécurité |

### Meta Agents

| Agent | Fichier | Rôle |
|-------|---------|------|
| `confidence-checker.md` | `agents/meta/` | Évaluation pre-exec (>=70%) |
| `self-checker.md` | `agents/meta/` | Validation post-exec |
| `token-optimizer.md` | `agents/meta/` | Réduction tokens 30-60% |
| `intent-parser.md` | `agents/meta/` | Détection NL v2.0 |

---

## WORKFLOW COMPLET

### Phase 1: Intent Detection

```
User Input (Natural Language ou /command)
        │
        ▼
┌─────────────────────────────────────┐
│ INTENT PARSER v2.0                  │
│ • Détecter intent                   │
│ • Calculer confidence               │
│ • Consulter registry.json           │
│ • Router vers action                │
└─────────────────────────────────────┘
        │
        ├── Confidence >= 70% → GO
        └── Confidence < 70%  → CLARIFY
```

### Phase 2: Memory-First

```
┌─────────────────────────────────────┐
│ MEMORY-FIRST PROTOCOL               │
│                                     │
│ hindsight_recall('errors', query)   │
│ hindsight_recall('patterns', query) │
│ hindsight_recall('ultra-dev-memory')│
│                                     │
│ Context7 pour frameworks utilisés   │
│ Template via manifest.json          │
└─────────────────────────────────────┘
```

### Phase 3: Execution

```
┌─────────────────────────────────────┐
│ EXECUTION                           │
│                                     │
│ Mode: Standard | Speed | Quality    │
│ Agents: Via registry.json           │
│ Parallelism: 5-25 agents            │
│                                     │
│ Self-Checker actif pendant exec     │
└─────────────────────────────────────┘
```

### Phase 4: Self-Healing (Si erreur)

```
┌─────────────────────────────────────┐
│ SELF-HEALING LOOP                   │
│                                     │
│ 1. Detect error in output           │
│ 2. Match against ERROR_PATTERNS     │
│ 3. Recall similar from Hindsight    │
│ 4. Apply fix (max 3 retries)        │
│ 5. Validate fix worked              │
│ 6. Save solution to 'errors' bank   │
│                                     │
│ Fallback: Rollback if 3 fails       │
└─────────────────────────────────────┘
```

### Phase 5: Delivery

```
┌─────────────────────────────────────┐
│ DELIVERY                            │
│                                     │
│ • Code complet et fonctionnel       │
│ • Tests passent                     │
│ • hindsight_retain automatique      │
│ • Métriques session                 │
│                                     │
│ Si deploy demandé:                  │
│ → Confirmation humaine requise      │
└─────────────────────────────────────┘
```

---

## SAFETY LIMITS

```json
{
  "autonomous": {
    "noPushForce": true,
    "noDeleteProduction": true,
    "requireConfirmFor": ["deploy", "payment-integration", "api-keys"],
    "maxRetriesPerError": 3,
    "rollbackOnFailure": true
  }
}
```

---

## CONTEXT MONITORING THRESHOLDS

| Level | Threshold | Action |
|-------|-----------|--------|
| Info | 60% | Message discret |
| Warning | 80% | Recommander résumé ou nouveau chat |
| Critical | 95% | Sauvegarde auto Hindsight + forcer nouveau chat |

---

## MÉTRIQUES SESSION

```
┌─────────────────────────────────────────────────────┐
│ ULTRA-CREATE v26.0 VIBE-MASTER - Session Metrics    │
├─────────────────────────────────────────────────────┤
│ Tasks Completed: X/Y (Z%)                           │
│ Self-Healing Triggers: N (success/fail)             │
│ Tests Generated: N | Tests Passing: M (P%)          │
│ Context Usage: X% [████████░░░░░░░░░░░░]           │
│ Memory Recalls: N | Memory Retains: M               │
│ Checkpoints: N | Rollbacks: M                       │
└─────────────────────────────────────────────────────┘
```

---

## COMMANDES

| Commande | Action |
|----------|--------|
| `/wake` | Activer système complet |
| `/heal` | Déclencher self-healing manuel |
| `/heal watch` | Mode surveillance continue |
| `/checkpoint save` | Créer point de sauvegarde |
| `/checkpoint restore` | Restaurer état précédent |
| `/metrics` | Afficher métriques session |
| `/context status` | Afficher usage context |

---

## INTÉGRATION AVEC QUEEN v18

VIBE-MASTER est une **extension harmonique** de Queen v18, pas un remplacement:

| Aspect | Queen v18 | VIBE-MASTER |
|--------|-----------|-------------|
| **Scope** | QUOI faire, QUAND | COMMENT, avec quel STYLE |
| **Décisions** | Task decomposition, priority | Monitoring, cohérence, adaptation |
| **Agents** | Gère 25 agents directement | Observe et conseille, ne gère pas |
| **Checkpoints** | Trigger après phase | Monitoring + alertes |
| **Self-Healing** | Trigger manuel | Auto-trigger sur erreur |

---

## ACTIVATION

Le VIBE-MASTER est automatiquement activé via les hooks dans `settings.json`:

1. Memory-First: Chaque Write/Edit/Bash déclenche recall Hindsight
2. Self-Healing: Chaque erreur Bash déclenche auto-correction
3. Context Monitoring: Chaque tool call met à jour les métriques
4. Auto-Retain: Chaque completion sauvegarde les apprentissages

**Aucune activation manuelle requise** - le système fonctionne en arrière-plan.

---

*VIBE-MASTER v26.0 - Pipeline Autonome Intelligent | ULTRA-CREATE*
