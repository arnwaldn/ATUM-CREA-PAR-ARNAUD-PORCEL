# Agent: Message Protocol v1.0 (Camel Pattern)

## Role
Protocole de communication structure entre agents pour coordination swarm.
- Messages types avec sender/receiver explicites
- Schemas JSON pour validation
- Patterns de conversation predefinies
- Tracabilite complete des echanges

---

## CAMEL PATTERN (awesome-ai-agents)

### Principe
Inspire de Camel (Role-Playing for AI), ce pattern structure la communication
entre agents avec des messages types, des roles clairs, et des patterns
de conversation reproductibles.

### Difference avec worker-protocol actuel
| worker-protocol (actuel) | message-protocol (nouveau) |
|--------------------------|----------------------------|
| Messages YAML informels | Messages JSON types |
| Pas de schema | Schema valide |
| Roles implicites | Roles explicites |
| Pas de threading | Thread IDs pour conversations |
| Debug difficile | Tracabilite complete |

---

## TYPES DE MESSAGES

### 1. REQUEST
Demande de travail a un agent.

```json
{
  "id": "msg_abc123",
  "type": "request",
  "from": { "id": "queen-v18", "role": "orchestrator" },
  "to": { "id": "frontend-developer", "role": "worker" },
  "content": {
    "action": "create-component",
    "parameters": {
      "name": "LoginForm",
      "type": "functional"
    },
    "expected_output": {
      "file_path": "string"
    }
  },
  "priority": "high",
  "timestamp": "2026-01-11T12:00:00Z"
}
```

### 2. RESPONSE
Reponse a une demande.

```json
{
  "id": "msg_xyz789",
  "type": "response",
  "from": { "id": "frontend-developer", "role": "worker" },
  "to": { "id": "queen-v18", "role": "orchestrator" },
  "reply_to": "msg_abc123",
  "content": {
    "status": "success",
    "result": {
      "file_path": "src/components/LoginForm.tsx"
    },
    "metrics": {
      "time_ms": 2500
    }
  },
  "timestamp": "2026-01-11T12:00:03Z"
}
```

### 3. HANDOFF
Transfert de tache entre agents.

```json
{
  "id": "msg_hand456",
  "type": "handoff",
  "from": { "id": "frontend-developer", "role": "worker" },
  "to": { "id": "database-architect", "role": "specialist" },
  "content": {
    "reason": "Need database schema",
    "partial_result": { "component_skeleton": "created" },
    "context_transfer": { "entities": ["User", "Session"] }
  },
  "timestamp": "2026-01-11T12:01:00Z"
}
```

### 4. BROADCAST
Message a tous les agents du swarm.

```json
{
  "id": "msg_broad001",
  "type": "broadcast",
  "from": { "id": "queen-v18", "role": "orchestrator" },
  "to": null,
  "content": {
    "announcement": "Phase 2 starting",
    "data": { "new_constraints": {} }
  },
  "timestamp": "2026-01-11T12:05:00Z"
}
```

### 5. STATUS
Mise a jour de progression.

```json
{
  "id": "msg_stat001",
  "type": "status",
  "from": { "id": "backend-developer", "role": "worker" },
  "to": { "id": "queen-v18", "role": "orchestrator" },
  "content": {
    "phase": "api-implementation",
    "progress": 65,
    "eta_seconds": 120,
    "blockers": []
  },
  "timestamp": "2026-01-11T12:03:00Z"
}
```

### 6. ERROR
Notification d'erreur.

```json
{
  "id": "msg_err001",
  "type": "error",
  "from": { "id": "tester", "role": "validator" },
  "to": { "id": "queen-v18", "role": "orchestrator" },
  "content": {
    "error_type": "test_failure",
    "message": "3 tests failed",
    "recoverable": true,
    "suggested_action": "Fix type errors in LoginForm"
  },
  "priority": "high",
  "timestamp": "2026-01-11T12:04:00Z"
}
```

---

## ROLES

| Role | Description | Exemples |
|------|-------------|----------|
| **orchestrator** | Coordonne le swarm | queen-v18, pm-agent |
| **worker** | Execute les taches | frontend-developer, backend-developer |
| **specialist** | Expertise specifique | database-architect, security-auditor |
| **validator** | Valide les outputs | tester, auto-validator |
| **observer** | Observe sans agir | self-improver, context-monitor |

---

## PATTERNS DE CONVERSATION

### 1. Request-Response
Simple demande-reponse.

```
Orchestrator ──request──> Worker
Worker ──response──> Orchestrator
```

### 2. Delegation avec Status
Delegation avec mises a jour.

```
Orchestrator ──request──> Worker
Worker ──status──> Orchestrator (10%)
Worker ──status──> Orchestrator (50%)
Worker ──status──> Orchestrator (90%)
Worker ──response──> Orchestrator
```

### 3. Handoff Chain
Passage de relais entre specialists.

```
Orchestrator ──request──> Worker A
Worker A ──handoff──> Specialist B
Specialist B ──response──> Worker A
Worker A ──response──> Orchestrator
```

### 4. Broadcast-Gather
Diffusion et collection.

```
Orchestrator ──broadcast──> All
Worker A ──response──> Orchestrator
Worker B ──response──> Orchestrator
Specialist C ──response──> Orchestrator
```

### 5. Validation Loop
Boucle de validation.

```
Worker ──response──> Validator
Validator ──error──> Worker
Worker ──response──> Validator (v2)
Validator ──response──> Orchestrator (approved)
```

---

## CONTEXT SHARING

### Structure du contexte partage

```typescript
interface SharedContext {
  // Projet
  project: {
    path: string;
    type: string;
    phase: string;
  };

  // Tache en cours
  task: {
    id: string;
    description: string;
    status: string;
    progress: number;
  };

  // Contraintes
  constraints: {
    timeout_ms: number;
    max_retries: number;
    quality_threshold: number;
  };

  // Memoire partagee
  memory: {
    hindsight_context: string[];
    local_cache: Record<string, any>;
  };
}
```

### Propagation du contexte

1. **Initial**: Orchestrator cree le contexte
2. **Enrichissement**: Chaque agent ajoute ses decouvertes
3. **Synchronisation**: Contexte mis a jour a chaque reponse
4. **Persistance**: Sauvegarde dans session-state

---

## ROUTING

### Par Capability
Trouver l'agent avec la capacite requise.

```javascript
function routeByCapability(action, registry) {
  return registry.agents.find(a =>
    a.capabilities.includes(action)
  );
}
```

### Par Role
Router selon le role necessaire.

```javascript
function routeByRole(role, swarm) {
  return swarm.agents.filter(a => a.role === role);
}
```

### Par Priorite
Router selon l'urgence.

```javascript
function routeByPriority(message, agents) {
  if (message.priority === 'critical') {
    return agents.filter(a => a.priority === 'high');
  }
  return agents;
}
```

---

## VALIDATION

### Schema JSON
Tous les messages sont valides contre `agent-messages.schema.json`.

### Verification a l'envoi
```javascript
function validateMessage(message, schema) {
  // Champs requis
  const required = ['id', 'type', 'from', 'to', 'content', 'timestamp'];
  for (const field of required) {
    if (!message[field] && field !== 'to') {
      throw new Error(`Missing field: ${field}`);
    }
  }

  // Type valide
  const validTypes = ['request', 'response', 'broadcast', 'handoff', 'status', 'error'];
  if (!validTypes.includes(message.type)) {
    throw new Error(`Invalid type: ${message.type}`);
  }

  return true;
}
```

---

## TRACABILITE

### Log des messages
Tous les messages sont logues dans `logs/agent-messages.log`.

```json
{
  "timestamp": "2026-01-11T12:00:00Z",
  "message_id": "msg_abc123",
  "type": "request",
  "from": "queen-v18",
  "to": "frontend-developer",
  "action": "create-component",
  "thread_id": "thread_001"
}
```

### Threading
Les conversations sont groupees par thread_id pour reconstruction.

### Metrics
- Messages envoyes/recus par agent
- Temps de reponse moyen
- Taux d'erreur par type

---

## INTEGRATION

### Avec worker-protocol.md
Le worker-protocol existant reference ce message-protocol pour la structure des messages.

### Avec swarm-coordinator
Le coordinateur utilise ce protocole pour toutes les communications.

### Avec session-manager
Les messages sont inclus dans la serialisation de session.

---

## COMMANDES

```bash
/messages                    # Voir messages recents
/messages --thread <id>      # Voir conversation complete
/messages --from <agent>     # Filtrer par emetteur
/messages --errors           # Voir erreurs uniquement
```

---

## METRIQUES

| Metrique | Objectif |
|----------|----------|
| Validation rate | 100% |
| Message latency | < 50ms |
| Error rate | < 5% |
| Thread completion | > 95% |

---

**Version:** 1.0 (Camel Pattern)
**Pattern Source:** Camel (awesome-ai-agents)
**Schema:** config/agent-messages.schema.json
**Logs:** logs/agent-messages.log
**Integration:** worker-protocol, swarm-coordinator, session-manager
