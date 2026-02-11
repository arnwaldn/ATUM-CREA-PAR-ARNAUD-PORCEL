# ULTRA-CREATE Hooks Reference (48 hooks) [VERIFIE 13-Jan-2026]

> Ce fichier contient la documentation detaillee de tous les hooks ULTRA-CREATE.
> Charge automatiquement via knowledge-auto-load.js sur keywords: "hook", "hooks"

---

## Architecture Hooks v27.8

```
┌─────────────────────────────────────────────────────────────────────┐
│                        HOOKS PIPELINE (48 hooks)                     │
├─────────────────────────────────────────────────────────────────────┤
│  PreToolUse (8 hooks - AVANT action)                                │
│    [1] memory-first.js         → Recall 6 banks                     │
│    [2] pre-edit-check.js       → Validation + backup                │
│    [3] knowledge-auto-load.js  → Charge knowledge contextuel        │
│    [4] mcp-auto-router.js      → Selection MCP + fallbacks          │
│    [5] agent-auto-router.js    → Activation agents                  │
│    [6] enforce-v25-rules.js    → Regles BLOQUANTES                  │
│    [7] workflow-auto-router.js → Routing commandes                  │
│    [8] mode-enforcer.js        → Mode comportemental                │
│                                                                      │
│  EXECUTION ─────────────────────────────────────────────────────────│
│                                                                      │
│  PostToolUse (9 hooks - APRES action)                               │
│    [1] self-healing-hook.js    → Auto-heal si erreur                │
│    [2] post-edit-learn.js      → Sauvegarde patterns                │
│    [3] auto-retain.js          → Sauvegarde completions             │
│    [4] context-monitor.js      → Surveillance context               │
│    [5] anti-hallucination.js   → Prevention hallucinations          │
│    [6] auto-sync-hindsight.js  → Sync memoire                       │
│    [7] auto-rollback.js        → Snapshots + rollback               │
│    [8] pre-deploy.js           → 6 checks deploiement               │
│    [9] notification-hook.js    → Notifications                      │
│                                                                      │
│  Session Lifecycle (4 hooks - claude-mem inspired)                  │
│    [1] session-start.js        → Charge contexte au demarrage       │
│    [2] session-end.js          → Sauvegarde resume en fin           │
│    [3] session-processor.js    → Traitement session continu         │
│    [4] start-hindsight-auto.js → Demarrage Hindsight (port 8888)    │
│                                                                      │
│  Auto-Upgrade (2 hooks - veille continue)                           │
│    [1] auto-upgrade-trigger.js → Detecte opportunites amelioration  │
│    [2] innovation-monitor.js   → Veille 8 sources (ArXiv, GH, etc.) │
└─────────────────────────────────────────────────────────────────────┘
```

---

## PreToolUse Hooks (Avant action)

### 1. Memory-First Hook
| Propriete | Valeur |
|-----------|--------|
| **Fichier** | `scripts/hooks/memory-first.js` |
| **Matcher** | `Write\|Edit\|Bash` |
| **Priority** | 1 (plus haute) |
| **Fonction** | Recall Hindsight auto (6 banks) AVANT toute action |

```javascript
// Comportement
hindsight_recall({bank: 'errors', query: context, top_k: 3})
hindsight_recall({bank: 'patterns', query: context, top_k: 5})
hindsight_recall({bank: 'ultra-dev-memory', query: context, top_k: 3})
```

---

### 2. Pre-Edit Check Hook
| Propriete | Valeur |
|-----------|--------|
| **Fichier** | `scripts/hooks/pre-edit-check.js` |
| **Matcher** | `Write\|Edit` |
| **Priority** | 2 |
| **Fonction** | Validation + backup avant edition fichier |

---

### 3. Knowledge Auto-Load Hook
| Propriete | Valeur |
|-----------|--------|
| **Fichier** | `scripts/hooks/knowledge-auto-load.js` |
| **Matcher** | `*` (tous outils) |
| **Priority** | 3 |
| **Fonction** | Charge knowledge files selon intent detecte |

Mapping intent → knowledge file via `config/knowledge-mapping.json`

---

### 4. MCP Auto-Router Hook
| Propriete | Valeur |
|-----------|--------|
| **Fichier** | `scripts/hooks/mcp-auto-router.js` |
| **Matcher** | `*` |
| **Priority** | 4 |
| **Fonction** | Selection MCP optimaux + fallback chains |

---

### 5. Agent Auto-Router Hook
| Propriete | Valeur |
|-----------|--------|
| **Fichier** | `scripts/hooks/agent-auto-router.js` |
| **Matcher** | `*` |
| **Priority** | 5 |
| **Fonction** | Activation agents par pattern matching (autoTrigger) |

---

### 6. Enforce v26 Rules Hook
| Propriete | Valeur |
|-----------|--------|
| **Fichier** | `scripts/hooks/enforce-v25-rules.js` |
| **Matcher** | `*` |
| **Priority** | 6 |
| **Fonction** | Regles BLOQUANTES + AutoFix automatique |

Regles critiques (BLOCKERS):
- shadcn obligatoire pour UI
- Context7 avant framework
- Hindsight recall avant resolution erreur

---

### 7. Workflow Auto-Router Hook
| Propriete | Valeur |
|-----------|--------|
| **Fichier** | `scripts/hooks/workflow-auto-router.js` |
| **Matcher** | `*` |
| **Priority** | 7 |
| **Fonction** | Routing commandes → workflows + checkpoints |

---

### 8. Mode Enforcer Hook
| Propriete | Valeur |
|-----------|--------|
| **Fichier** | `scripts/hooks/mode-enforcer.js` |
| **Matcher** | `*` |
| **Priority** | 4 |
| **Fonction** | Application automatique du mode comportemental actif |

---

## PostToolUse Hooks (Apres action)

### 1. Self-Healing Hook
| Propriete | Valeur |
|-----------|--------|
| **Fichier** | `scripts/hooks/self-healing-hook.js` |
| **Matcher** | `Bash` |
| **Priority** | 2 |
| **Fonction** | Auto-trigger self-healer sur erreur Bash |

```
Erreur detectee → Diagnose → Fix (max 3 retries) → Validate → Learn
                                                      ↓
                                        hindsight_retain('errors', solution)
```

---

### 2. Post-Edit Learn Hook
| Propriete | Valeur |
|-----------|--------|
| **Fichier** | `scripts/hooks/post-edit-learn.js` |
| **Matcher** | `Edit\|Write` |
| **Priority** | 3 |
| **Fonction** | Apprentissage patterns apres edition fichier |

```javascript
hindsight_retain({bank: 'patterns', content: pattern})
```

---

### 3. Auto-Retain Hook
| Propriete | Valeur |
|-----------|--------|
| **Fichier** | `scripts/hooks/auto-retain.js` |
| **Matcher** | `Bash` |
| **Priority** | 3 |
| **Fonction** | Sauvegarde completions vers banks multiples |

---

### 4. Context Monitor Hook
| Propriete | Valeur |
|-----------|--------|
| **Fichier** | `scripts/hooks/context-monitor.js` |
| **Matcher** | `*` |
| **Priority** | 4 |
| **Fonction** | Surveillance context 60/80/95% |

| Seuil | Action |
|-------|--------|
| 60% | Message discret |
| 80% | Recommander resume ou nouveau chat |
| 95% | Sauvegarde auto + forcer nouveau chat |

---

### 5. Anti-Hallucination Hook
| Propriete | Valeur |
|-----------|--------|
| **Fichier** | `scripts/hooks/anti-hallucination.js` |
| **Matcher** | `*` |
| **Priority** | 5 |
| **Fonction** | Prevention hallucinations via validation |

---

### 6. Auto-Sync Hindsight Hook
| Propriete | Valeur |
|-----------|--------|
| **Fichier** | `scripts/hooks/auto-sync-hindsight.js` |
| **Matcher** | `*` |
| **Priority** | 6 |
| **Fonction** | Synchronisation automatique memoire |

---

### 7. Auto-Rollback Hook (v27.0)
| Propriete | Valeur |
|-----------|--------|
| **Fichier** | `scripts/hooks/auto-rollback.js` |
| **Matcher** | `Edit\|Write` |
| **Priority** | 7 |
| **Fonction** | Snapshots automatiques + rollback sur erreur |

---

### 8. Pre-Deploy Hook (v27.0)
| Propriete | Valeur |
|-----------|--------|
| **Fichier** | `scripts/hooks/pre-deploy.js` |
| **Matcher** | `Bash` |
| **Priority** | 8 |
| **Fonction** | 6 checks bloquants avant deploiement |

Checks:
1. Tests passent
2. Build reussi
3. Pas de secrets exposes
4. Environnement correct
5. Dependencies verifiees
6. Confirmation utilisateur (si requis)

---

### 9. Notification Hook (v27.0)
| Propriete | Valeur |
|-----------|--------|
| **Fichier** | `scripts/hooks/notification-hook.js` |
| **Matcher** | `*` |
| **Priority** | 9 |
| **Fonction** | Notifications cross-platform (Windows/Mac/Linux) |

---

## Session Lifecycle Hooks (4 hooks - v27.5 claude-mem inspired)

### 1. Session Start Hook
| Propriete | Valeur |
|-----------|--------|
| **Fichier** | `scripts/hooks/session-start.js` |
| **Type** | Session Lifecycle |
| **Trigger** | Demarrage session (via /wake) |
| **Fonction** | Charge contexte automatiquement au demarrage |

Comportement:
- Charge le dernier resume de session depuis Hindsight
- Restaure le contexte de travail precedent
- Initialise les variables de session

---

### 2. Session End Hook
| Propriete | Valeur |
|-----------|--------|
| **Fichier** | `scripts/hooks/session-end.js` |
| **Type** | Session Lifecycle |
| **Trigger** | Fin de session |
| **Fonction** | Sauvegarde resume de session |

Comportement:
- Genere un resume automatique de la session
- Sauvegarde dans Hindsight (bank: ultra-dev-memory)
- Preserve le contexte pour la prochaine session

---

### 3. Session Processor Hook
| Propriete | Valeur |
|-----------|--------|
| **Fichier** | `scripts/hooks/session-processor.js` |
| **Type** | Session Lifecycle |
| **Trigger** | Continu pendant session |
| **Fonction** | Traitement continu des evenements de session |

---

### 4. Start Hindsight Auto Hook
| Propriete | Valeur |
|-----------|--------|
| **Fichier** | `scripts/hooks/start-hindsight-auto.js` |
| **Type** | Session Lifecycle |
| **Trigger** | Demarrage session |
| **Fonction** | Demarrage automatique Hindsight (port 8888) |

---

## Auto-Upgrade Hooks (2 hooks - v27.6 veille continue)

### 1. Auto-Upgrade Trigger Hook
| Propriete | Valeur |
|-----------|--------|
| **Fichier** | `scripts/hooks/auto-upgrade-trigger.js` |
| **Type** | Auto-Upgrade |
| **Trigger** | Fin de session ou /autoupgrade |
| **Fonction** | Detecte opportunites d'amelioration du systeme |

Comportement:
- Analyse les erreurs recurrentes
- Detecte les patterns d'utilisation
- Propose des ameliorations via 23 patterns (RISE, ToT, Darwin-Godel, etc.)

---

### 2. Innovation Monitor Hook
| Propriete | Valeur |
|-----------|--------|
| **Fichier** | `scripts/hooks/innovation-monitor.js` |
| **Type** | Auto-Upgrade |
| **Trigger** | Periodique (background) |
| **Fonction** | Veille continue sur 8 sources d'innovation |

Sources surveillees:
1. ArXiv (papers AI/ML)
2. GitHub Trending
3. Anthropic Blog
4. OpenAI Blog
5. HuggingFace
6. ProductHunt
7. Hacker News
8. Twitter/X AI

---

## Stop Hook

### Task Complete
| Propriete | Valeur |
|-----------|--------|
| **Type** | Stop Hook |
| **Fonction** | Notifie "Claude a termine sa tache" |

---

## Configuration dans settings.json

```json
{
  "hooks": {
    "preToolUse": [
      {
        "name": "memory-first",
        "matcher": "Write|Edit|Bash",
        "command": "node scripts/hooks/memory-first.js"
      }
      // ... autres hooks
    ],
    "postToolUse": [
      {
        "name": "self-healing",
        "matcher": "Bash",
        "command": "node scripts/hooks/self-healing-hook.js"
      }
      // ... autres hooks
    ]
  }
}
```

---

*Reference complete: C:\Users\arnau\.claude\settings.json*
