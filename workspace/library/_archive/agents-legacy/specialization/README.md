# Agent Specialization Framework

## Vue d'ensemble

Ce framework definit la structure de specialisation des agents ULTRA-CREATE.
Chaque agent a une responsabilite principale et communique via messages structures.

---

## Principes Fondamentaux

### 1. Single Responsibility
Chaque agent = Une responsabilite principale

```
CORRECT:
- code-generator: Genere du code
- code-reviewer: Revoit le code
- test-generator: Genere des tests

INCORRECT:
- code-agent: Genere, revoit, et teste le code
```

### 2. Communication Structuree
Messages via le protocole defini dans `protocol.json`

### 3. Escalade Claire
Tout agent peut escalader vers l'orchestrateur

### 4. Metriques Individuelles
Chaque agent maintient ses propres KPIs

---

## Hierarchie des Agents

```
┌─────────────────────────────────────────────────────────┐
│                    TIER 1 - CORE                         │
│    Toujours charges, critique pour le fonctionnement    │
├─────────────────────────────────────────────────────────┤
│  orchestrator      │ Coordination globale               │
│  memory-manager    │ Gestion memoire unifiee            │
│  error-handler     │ Recuperation d'erreurs             │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────┐
│                  TIER 2 - DEVELOPMENT                    │
│           Agents principaux de developpement            │
├─────────────────────────────────────────────────────────┤
│  code-generator    │ Generation de code                 │
│  code-reviewer     │ Revue et qualite                   │
│  test-generator    │ Tests automatises                  │
│  debugger          │ Diagnostic et fix                  │
│  refactorer        │ Refactoring intelligent            │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────┐
│                 TIER 3 - INFRASTRUCTURE                  │
│              Gestion technique et integration           │
├─────────────────────────────────────────────────────────┤
│  mcp-manager       │ Gestion MCP servers                │
│  db-manager        │ Operations base de donnees         │
│  api-integrator    │ Integrations externes              │
│  deploy-manager    │ Deploiement et CI/CD               │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────┐
│               TIER 4 - SPECIALIZED (On-demand)          │
│            Charges uniquement quand necessaire          │
├─────────────────────────────────────────────────────────┤
│  ui-designer       │ Interfaces utilisateur             │
│  doc-generator     │ Documentation                      │
│  security-auditor  │ Audit securite                     │
│  perf-optimizer    │ Optimisation performance           │
│  data-analyst      │ Analyse de donnees                 │
└─────────────────────────────────────────────────────────┘
```

---

## Definition d'un Agent

### Structure Requise

```yaml
agent:
  id: string           # Identifiant unique
  name: string         # Nom lisible
  tier: 1|2|3|4        # Niveau hierarchique
  type: core|specialist|infrastructure|specialized

  responsibilities:
    primary: string    # Responsabilite principale
    secondary: [string] # Responsabilites secondaires

  capabilities:
    - capability_1
    - capability_2

  dependencies:
    required: [agent_ids]    # Agents necessaires
    optional: [agent_ids]    # Agents optionnels

  communication:
    accepts: [message_types]
    emits: [message_types]

  metrics:
    success_rate: float
    avg_response_time_ms: integer
    task_count: integer

  config:
    model: string           # Modele Claude a utiliser
    max_tokens: integer
    temperature: float
```

---

## Agents Core (Tier 1)

### orchestrator

**Responsabilite:** Coordination globale de tous les agents

**Capabilities:**
- Decomposition de taches complexes
- Assignation aux agents specialises
- Gestion des dependances entre taches
- Monitoring de progression
- Escalade et resolution de conflits

**Triggers:**
- Nouvelle tache utilisateur
- Echec d'agent
- Completion de tache

### memory-manager

**Responsabilite:** Gestion unifiee de la memoire

**Capabilities:**
- CRUD operations sur toutes les couches memoire
- Recherche semantique
- Gestion du cache
- Decay et garbage collection
- Synchronisation entre agents

### error-handler

**Responsabilite:** Recuperation et gestion des erreurs

**Capabilities:**
- Detection d'erreurs
- Strategies de retry
- Rollback automatique
- Logging et alerting
- Suggestion de corrections

---

## Agents Development (Tier 2)

### code-generator

**Responsabilite:** Generation de code de haute qualite

**Input attendu:**
```json
{
  "type": "request",
  "payload": {
    "task": "generate_code",
    "language": "typescript",
    "description": "Fonction de validation email",
    "context": {
      "project_path": "/path/to/project",
      "existing_patterns": ["..."]
    }
  }
}
```

**Output:**
```json
{
  "type": "response",
  "payload": {
    "code": "...",
    "language": "typescript",
    "dependencies": [],
    "tests_suggested": true,
    "confidence": 0.92
  }
}
```

### code-reviewer

**Responsabilite:** Revue de code et suggestions d'amelioration

**Checklist automatique:**
- [ ] Syntaxe correcte
- [ ] Conventions respectees
- [ ] Pas de secrets exposes
- [ ] Gestion d'erreurs presente
- [ ] Tests adequats
- [ ] Documentation suffisante

---

## Super-Agents

Les super-agents combinent plusieurs MCPs pour des taches complexes.

### fullstack-super

**MCPs combines:** Context7 + Magic-UI + Firecrawl + SonarQube

**Usage:** Creation de features fullstack completes

### ui-super

**MCPs combines:** Magic-UI + shadcn + Mermaid + Figma

**Usage:** Design et implementation UI professionnelle

### backend-super

**MCPs combines:** Supabase + Prisma + Neo4j + Stripe

**Usage:** APIs, bases de donnees, paiements

### research-super

**MCPs combines:** Tavily + Exa + Firecrawl + Context7

**Usage:** Recherche exhaustive et documentation

---

## Communication Inter-Agents

### Pattern Request-Response

```
code-generator → orchestrator: "Besoin de context projet"
orchestrator → memory-manager: "Recupere context projet X"
memory-manager → orchestrator: {project_context}
orchestrator → code-generator: {project_context}
code-generator → orchestrator: {generated_code}
```

### Pattern Event Broadcasting

```
deploy-manager → [broadcast]: "Deployment started"
    → monitoring: ACK
    → error-handler: ACK
    → notification: ACK
```

### Pattern Handoff

```
code-generator → code-reviewer: {
  type: "handoff",
  task_state: "code_generated",
  context: {...},
  reason: "Ready for review"
}
```

---

## Metriques et Monitoring

### KPIs par Agent

| Metrique | Cible | Alerte |
|----------|-------|--------|
| Success Rate | >95% | <90% |
| Avg Response Time | <5s | >10s |
| Error Rate | <5% | >10% |
| Utilization | 30-70% | >90% |

### Dashboard

Voir `monitoring/dashboard.json` pour la configuration complete.

---

## Creation d'un Nouvel Agent

1. **Definir la responsabilite**
   - Une seule responsabilite principale
   - Pas de chevauchement avec agents existants

2. **Creer le fichier de definition**
   ```
   agents/[category]/[agent-name].md
   ```

3. **Definir le protocole**
   - Messages acceptes
   - Messages emis
   - Patterns de communication

4. **Implementer les handlers**
   - Traitement des requetes
   - Gestion des erreurs
   - Metriques

5. **Tests**
   - Tests unitaires
   - Tests d'integration
   - Tests de charge

6. **Documentation**
   - README dans le dossier
   - Exemples d'utilisation
   - Limitations connues

---

*Version: 16.0.0 | Framework de specialisation agents*
