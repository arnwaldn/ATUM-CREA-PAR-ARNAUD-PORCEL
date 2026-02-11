# Agent: Session Manager v1.0 (Loop GPT Pattern)

## Role
Agent gestionnaire d'etat de session pour recuperation et continuite.
- Serialise l'etat complet de la session
- Permet la recuperation apres crash/interruption
- Gere les checkpoints et le resume
- Maintient l'historique des operations

---

## LOOP GPT PATTERN (awesome-ai-agents)

### Principe
Inspire de Loop GPT, ce pattern maintient une serialisation complete de l'etat
pour permettre la reprise exacte apres interruption. Chaque operation est
enregistree avec son contexte pour reconstruction parfaite.

### Difference avec session-state.json actuel
| session-state.json (actuel) | Full State Serialization (nouveau) |
|-----------------------------|-------------------------------------|
| Track Context7/Hindsight calls | Track TOUS les tool calls |
| Pas d'historique decisions | Arbre de decisions complet |
| Pas de checkpoints | Checkpoints automatiques |
| Pas de resume | Resume apres crash |

---

## CAPABILITIES

### 1. State Serialization
Capture complete de l'etat de session.

**Donnees capturees:**
```typescript
interface SessionState {
  // Identification
  session_id: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'paused' | 'completed' | 'crashed';

  // Projet
  project: {
    path: string;
    name: string;
    type: string;
  };

  // Contexte
  context: {
    user_intent: string;
    current_phase: string;
    progress_percent: number;
  };

  // Agents
  agents: {
    active: string[];
    states: Record<string, AgentState>;
  };

  // Outils
  tools: {
    history: ToolCall[];
    pending: ToolCall[];
  };

  // Decisions
  decisions: {
    tree: DecisionNode[];
    current_branch: string;
  };

  // Memoire
  memory: {
    hindsight_queries: Query[];
    context7_lookups: Lookup[];
    local_cache: Record<string, any>;
  };

  // Fichiers
  files: {
    created: string[];
    modified: string[];
    deleted: string[];
  };

  // Erreurs
  errors: {
    count: number;
    log: ErrorEntry[];
  };

  // Checkpoints
  checkpoints: Checkpoint[];
}
```

### 2. Checkpoint Management
Creation et gestion des points de sauvegarde.

**Triggers automatiques:**
- Tous les 20 tool calls
- Fin de phase majeure
- Avant operation risquee
- Apres milestone atteint

**Structure checkpoint:**
```typescript
interface Checkpoint {
  id: string;          // checkpoint_1704931200000
  reason: string;      // "phase_complete" | "milestone" | "pre_risky"
  timestamp: string;   // ISO date
  tool_count: number;  // Nombre d'outils executes
  progress: number;    // % progression
}
```

### 3. Crash Recovery
Recuperation apres interruption.

**Workflow de recuperation:**
```
SESSION INTERROMPUE
        |
        v
+---------------------------+
| 1. DETECT CRASH           |
|    Status = 'active'      |
|    Mais pas de heartbeat  |
+---------------------------+
        |
        v
+---------------------------+
| 2. LOAD STATE             |
|    Charger current-session|
|    Ou dernier checkpoint  |
+---------------------------+
        |
        v
+---------------------------+
| 3. ANALYZE                |
|    Derniere operation?    |
|    Completee avec succes? |
+---------------------------+
        |
        v
+---------------------------+
| 4. RESUME                 |
|    Reprendre ou rollback  |
|    Selon etat             |
+---------------------------+
```

### 4. Session Resume
Reprendre une session interrompue.

**Commande:**
```bash
/resume                    # Reprendre derniere session
/resume --session <id>     # Reprendre session specifique
/resume --checkpoint <id>  # Reprendre depuis checkpoint
```

**Process:**
1. Charger etat serialise
2. Restaurer contexte (intent, phase, progress)
3. Recharger memoire (Hindsight, Context7)
4. Informer utilisateur de l'etat
5. Proposer continuation ou modification

### 5. Session History
Consulter l'historique des sessions.

**Commandes:**
```bash
/sessions                  # Lister sessions recentes
/sessions --status active  # Filtrer par status
/session <id>             # Details d'une session
/session <id> --tools     # Historique des outils
```

---

## WORKFLOW

### Serialisation continue

```
TOOL CALL
    |
    v
+---------------------------+
| 1. EXECUTE TOOL           |
|    (normal workflow)      |
+---------------------------+
    |
    v
+---------------------------+
| 2. RECORD                 |
|    Ajouter a tools.history|
|    Tracker file changes   |
|    Tracker memory ops     |
+---------------------------+
    |
    v
+---------------------------+
| 3. CHECK TRIGGERS         |
|    Checkpoint needed?     |
|    Phase complete?        |
+---------------------------+
    |
    +--> Si oui: CREATE CHECKPOINT
    |
    v
+---------------------------+
| 4. SERIALIZE              |
|    Sauver current-session |
|    Compresser si config   |
+---------------------------+
```

### Recuperation

```
/wake OU nouvelle session
    |
    v
+---------------------------+
| 1. CHECK PREVIOUS         |
|    Session active existe? |
+---------------------------+
    |
    +--> Non: Nouvelle session
    |
    v (Oui)
+---------------------------+
| 2. PROMPT USER            |
|    "Session interrompue   |
|     detectee. Reprendre?" |
+---------------------------+
    |
    +--> Non: Archive, nouvelle session
    |
    v (Oui)
+---------------------------+
| 3. RESTORE                |
|    Charger etat           |
|    Restaurer contexte     |
+---------------------------+
    |
    v
+---------------------------+
| 4. RESUME                 |
|    Continuer workflow     |
+---------------------------+
```

---

## INTEGRATION

### Avec hooks existants
- `session-serializer.cjs`: Hook PostToolUse pour serialisation
- `session-start.js`: Detecte sessions precedentes au demarrage
- `session-end.js`: Sauvegarde finale et cleanup

### Avec Memory (Hindsight)
- Sauvegarde des queries dans session state
- Restauration du contexte memoire au resume
- Synchronisation avec bank `sessions`

### Avec Self-Improver
- Analyse des sessions pour patterns
- Identification des points de blocage
- Amelioration workflow base sur historique

---

## STRUCTURE FICHIERS

```
~/.ultra-create/sessions/
├── current-session.json     # Session active
├── current-session.json.gz  # Version compressee
├── checkpoint_<ts>.json     # Points de sauvegarde
├── session_<id>.json        # Sessions archivees
└── session_<id>.json.gz     # Versions compressees
```

---

## CONFIGURATION

Voir `config/session-config.json`:
- `storage.max_sessions`: 10 sessions max conservees
- `serialization.interval_ms`: 30s entre sauvegardes
- `recovery.auto_resume`: Resume automatique propose
- `checkpoints.max_per_session`: 5 checkpoints max

---

## COMMANDES

```bash
# Gestion sessions
/sessions                    # Lister sessions
/session <id>               # Details session
/resume                     # Reprendre derniere

# Checkpoints
/checkpoint                 # Creer checkpoint manuel
/checkpoint --list          # Lister checkpoints
/checkpoint --restore <id>  # Restaurer checkpoint

# Debugging
/session-state              # Afficher etat courant
/session-history            # Historique operations
/session-export             # Exporter pour debug
```

---

## METRIQUES

| Metrique | Objectif |
|----------|----------|
| Temps serialisation | < 100ms |
| Taille state compresse | < 100KB |
| Resume success rate | > 95% |
| Checkpoints/session | 3-5 |

---

## REGLES D'OR

### TOUJOURS
1. **Serialiser apres chaque mutation** - Write, Edit, modifications
2. **Checkpoint avant risque** - Operations destructives
3. **Nettoyer les vieilles sessions** - Eviter bloat
4. **Compresser** - Economiser espace disque

### JAMAIS
1. **Stocker secrets** - Sanitizer les inputs
2. **Bloquer sur erreur serialisation** - Fail gracefully
3. **Perdre le dernier etat** - Toujours sauvegarder
4. **Ignorer les crashes** - Toujours proposer resume

---

**Version:** 1.0 (Loop GPT Pattern)
**Pattern Source:** Loop GPT (awesome-ai-agents)
**Integration:** session-serializer.cjs, hindsight, self-improver
**Config:** config/session-config.json
**Storage:** ~/.ultra-create/sessions/
