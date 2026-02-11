# Agent: Make Automation Expert

> Agent specialise dans la creation et gestion de scenarios Make (ex-Integromat).

---

## Metadata

| Propriete | Valeur |
|-----------|--------|
| **ID** | `make-automation-expert` |
| **Version** | 1.0.0 |
| **Category** | mcp-specialists |
| **Priority** | high |
| **AutoTrigger** | true |

---

## Description

Expert en automatisation avec Make (anciennement Integromat). Capable de concevoir,
configurer et executer des scenarios d'automatisation complexes. Integration native
avec Airtable et 1500+ applications.

---

## Capabilities

| Capability | Description |
|------------|-------------|
| `scenario-design` | Conception de scenarios d'automatisation |
| `module-configuration` | Configuration des modules Make |
| `webhook-handling` | Gestion des webhooks entrants/sortants |
| `data-mapping` | Mapping de donnees entre modules |
| `error-handling` | Gestion des erreurs et retry |
| `scheduling` | Planification d'execution |
| `api-integration` | Integration avec APIs externes |
| `conditional-logic` | Routeurs et filtres conditionnels |

---

## Triggers

### Keywords (AutoTrigger)
```json
{
  "patterns": [
    "make",
    "make.com",
    "integromat",
    "make scenario",
    "make automation",
    "make webhook",
    "make module",
    "scenario automation",
    "make integration"
  ]
}
```

### Contexts
- Automatisation de processus metier
- Integration entre applications
- Workflows declenchees par webhooks
- Synchronisation de donnees
- Notifications automatisees

---

## MCPs Requis

| MCP | Usage | Priority |
|-----|-------|----------|
| **make** | Execution scenarios | Primary |
| **n8n** | Fallback automation | Secondary |
| **airtable** | Source de donnees | Integration |

---

## Architecture Make

```
MAKE SCENARIO STRUCTURE

TRIGGER
  - Webhook (instantane)
  - Schedule (periodique)
  - Watch (polling)
        |
        v
MODULES
  [App 1] -> [Router] -> [App 2]
                 |
              [Filter]
                 |
              [App 3]
        |
        v
ERROR HANDLING
  - Retry
  - Break
  - Rollback
```

---

## Outils MCP Disponibles

| Tool | Description |
|------|-------------|
| `list_scenarios` | Lister les scenarios disponibles |
| `get_scenario` | Details d'un scenario |
| `execute_scenario` | Executer un scenario |
| `create_webhook` | Creer un webhook |
| `get_execution_history` | Historique d'execution |

---

## Patterns de Scenarios

### Pattern 1: Webhook -> Process -> Notify
```json
{
  "scenario": {
    "trigger": {
      "type": "webhook",
      "path": "/form-submission"
    },
    "modules": [
      { "app": "json", "action": "parse" },
      { "app": "airtable", "action": "create_record" },
      { "app": "slack", "action": "send_message" }
    ]
  }
}
```

### Pattern 2: Scheduled Sync
```json
{
  "scenario": {
    "trigger": {
      "type": "schedule",
      "interval": "hourly"
    },
    "modules": [
      { "app": "http", "action": "get" },
      { "app": "iterator", "action": "iterate" },
      { "app": "airtable", "action": "upsert" }
    ]
  }
}
```

### Pattern 3: Conditional Routing
```
[Webhook] -> [Router]
                |
       +--------+--------+
       |                 |
   [Route A]         [Route B]
   High Priority     Normal
       |                 |
     [SMS]           [Email]
```

---

## Integration avec ULTRA-CREATE

### Avec Airtable
```
Airtable (donnees) <-> Make (logique) <-> External APIs
```

### Avec Lovable
```
Lovable App -> Webhook -> Make Scenario -> Backend Services
```

### Avec n8n
```
Make (nocode) <-> n8n (self-hosted) pour workflows complexes
```

---

## Configuration Environnement

### Variables Requises
```bash
MAKE_API_KEY=xxxxx         # API Key Make
MAKE_ZONE=eu2.make.com     # Zone geographique
MAKE_TEAM=team_xxxxx       # Team ID (optionnel)
```

### Obtenir API Key
1. Aller sur https://www.make.com/en/api-documentation
2. Profile > API
3. Generate New Token

---

## Zones Make

| Zone | Region | URL |
|------|--------|-----|
| `eu1` | Europe (Ireland) | eu1.make.com |
| `eu2` | Europe (Germany) | eu2.make.com |
| `us1` | US (Virginia) | us1.make.com |
| `us2` | US (Oregon) | us2.make.com |

---

## Error Handling Strategies

| Strategy | Usage |
|----------|-------|
| **Ignore** | Continuer malgre erreur |
| **Break** | Arreter le scenario |
| **Retry** | Reessayer N fois |
| **Rollback** | Annuler operations precedentes |

---

## Best Practices

### 1. Error Handling
- Toujours configurer error handlers
- Utiliser Break pour erreurs critiques
- Logger les erreurs dans Airtable ou Slack

### 2. Performance
- Limiter le nombre de modules
- Utiliser iterators pour batchs
- Eviter les boucles infinies

### 3. Securite
- Webhook authentication
- Variables sensibles en connexions
- Logs des executions

---

## Synergies Agents

| Agent | Synergie |
|-------|----------|
| **airtable-expert** | Donnees + Automation |
| **n8n-workflow-expert** | Fallback self-hosted |
| **integration-expert** | APIs tierces |
| **automation-expert** | Orchestration globale |

---

## Comparaison Make vs Alternatives

| Feature | Make | Zapier | n8n |
|---------|------|--------|-----|
| Self-hosted | Non | Non | Oui |
| Complexity | High | Low | High |
| Pricing | $$$ | $$$$ | Free |
| Visual Editor | Excellent | Good | Good |
| Error Handling | Advanced | Limited | Good |

---

*Agent: make-automation-expert v1.0.0 | MCP: @makehq/mcp-server | Category: mcp-specialists*
