# Make (Integromat) - Patterns pour ULTRA-CREATE v28.5

> Ce fichier contient les patterns d'utilisation de Make pour l'automatisation nocode.
> Charge automatiquement via knowledge-auto-load.js sur keywords: "make", "integromat", "make scenario"

---

## Overview Make

| Aspect | Detail |
|--------|--------|
| **Type** | Plateforme d'automatisation nocode |
| **Ancien Nom** | Integromat |
| **MCP** | @makehq/mcp-server (official) |
| **Installation** | `npx -y @makehq/mcp-server` |
| **Integrations** | 1500+ applications |

---

## Configuration MCP

```json
{
  "mcpServers": {
    "make": {
      "command": "npx",
      "args": ["-y", "@makehq/mcp-server"],
      "env": {
        "MAKE_API_KEY": "<api-key>",
        "MAKE_ZONE": "eu2.make.com",
        "MAKE_TEAM": "<team-id>"
      }
    }
  }
}
```

### Variables d'Environnement
| Variable | Description | Exemple |
|----------|-------------|---------|
| `MAKE_API_KEY` | API Key Make | `xxxxx` |
| `MAKE_ZONE` | Zone geographique | `eu2.make.com` |
| `MAKE_TEAM` | Team ID (optionnel) | `team_xxxxx` |

### Zones Disponibles
| Zone | Region | URL |
|------|--------|-----|
| `eu1` | Europe (Ireland) | eu1.make.com |
| `eu2` | Europe (Germany) | eu2.make.com |
| `us1` | US (Virginia) | us1.make.com |
| `us2` | US (Oregon) | us2.make.com |

---

## Concepts Cles

### Elements Make
| Element | Description |
|---------|-------------|
| **Scenario** | Workflow complet |
| **Module** | Action individuelle (app + operation) |
| **Connection** | Credentials d'une app |
| **Trigger** | Declencheur du scenario |
| **Router** | Branchement conditionnel |
| **Iterator** | Traitement de listes/arrays |
| **Aggregator** | Regroupement de resultats |
| **Filter** | Condition pour continuer |

### Types de Triggers
| Type | Usage | Latence |
|------|-------|---------|
| **Webhook** | Declenchement HTTP instantane | Temps reel |
| **Schedule** | Execution periodique | Selon cron |
| **Watch** | Polling de changements | 15min+ |

---

## Fonctionnalites MCP

Le MCP Make permet:
- Detection automatique des scenarios "On-Demand"
- Parsing des parametres d'entree avec descriptions AI-ready
- Invocation de scenarios avec parametres
- Retour JSON structure

---

## Architecture Scenario

```
MAKE SCENARIO STRUCTURE

TRIGGER
  |
  +-> [Module 1: Get Data]
        |
        +-> [Router]
              |
              +-- (Condition A) -> [Module 2A] -> [Module 3A]
              |
              +-- (Condition B) -> [Module 2B]
              |
              +-- (Default) -> [Error Handler]

ERROR HANDLING
  |
  +-> Retry (exponential backoff)
  +-> Break (stop scenario)
  +-> Rollback (undo previous)
  +-> Ignore (continue)
```

---

## Patterns de Scenarios

### Pattern 1: Webhook -> Process -> Notify
```
Cas d'usage: Form submission -> Database -> Notification

[Webhook]
    |
    v
[JSON Parse]
    |
    v
[Airtable: Create Record]
    |
    v
[Slack: Send Message]
```

Configuration:
```json
{
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
```

### Pattern 2: Scheduled Data Sync
```
Cas d'usage: Sync API externe -> Airtable toutes les heures

[Schedule: Every Hour]
    |
    v
[HTTP: GET /api/data]
    |
    v
[Iterator]
    |
    v
[Airtable: Upsert Record]
```

Configuration:
```json
{
  "trigger": {
    "type": "schedule",
    "interval": "hourly"
  },
  "modules": [
    { "app": "http", "action": "get", "url": "https://api.example.com/data" },
    { "app": "iterator", "action": "iterate" },
    { "app": "airtable", "action": "upsert", "matchField": "external_id" }
  ]
}
```

### Pattern 3: Conditional Routing
```
Cas d'usage: Router selon priorite

[Webhook]
    |
    v
[Router]
    |
    +-- (priority = "high") -> [SMS Alert]
    |
    +-- (priority = "medium") -> [Email]
    |
    +-- (default) -> [Slack]
```

### Pattern 4: Error Handling with Retry
```
[Main Flow]
    |
    v
[Risky Operation] -- ERROR --> [Error Handler]
    |                               |
    v                               v
[Continue]                    [Log to Airtable]
                                    |
                                    v
                              [Slack Alert]
```

---

## Integration Airtable

### Airtable Trigger -> Make
```json
{
  "trigger": {
    "app": "airtable",
    "action": "watch_records",
    "baseId": "appXXX",
    "tableId": "tblYYY",
    "event": "created"
  }
}
```

### Make -> Airtable Operations
```json
{
  "module": {
    "app": "airtable",
    "action": "create_record",
    "baseId": "appXXX",
    "tableId": "tblYYY",
    "fields": {
      "Name": "{{webhook.data.name}}",
      "Email": "{{webhook.data.email}}",
      "Status": "New"
    }
  }
}
```

---

## Error Handling Strategies

| Strategy | Usage | Configuration |
|----------|-------|---------------|
| **Ignore** | Erreurs non critiques | Continue malgre erreur |
| **Break** | Erreurs critiques | Arrete le scenario |
| **Retry** | Erreurs temporaires | Reessaye N fois |
| **Rollback** | Transactions | Annule operations precedentes |
| **Resume** | Reprendre apres fix | Depuis dernier checkpoint |

### Best Practice Error Handler
```
[Any Module]
    |
    +-- ERROR --> [Set Variable: error_details]
                       |
                       v
                 [Airtable: Log Error]
                       |
                       v
                 [Slack: Alert Team]
```

---

## Variables et Data Mapping

### Syntaxe Variables
```
{{module.field}}           - Valeur simple
{{module.field.subfield}}  - Valeur imbriquee
{{if(condition, a, b)}}    - Condition
{{formatDate(date, "DD/MM/YYYY")}} - Format
{{parseJSON(text)}}        - Parse JSON
```

### Exemples
```
// Concatenation
{{1.name}} - {{1.email}}

// Condition
{{if(1.status = "active"; "Yes"; "No")}}

// Format date
{{formatDate(1.created_at; "DD/MM/YYYY HH:mm")}}

// Parse number
{{parseNumber(1.amount)}}
```

---

## Best Practices

### 1. Error Handling
- Toujours configurer error handlers
- Logger erreurs dans Airtable ou Notion
- Alerter via Slack/Email pour erreurs critiques
- Utiliser Break pour transactions

### 2. Performance
- Limiter modules par scenario (<20)
- Utiliser iterators pour batchs
- Eviter boucles infinies (max iterations)
- Scheduler aux heures creuses

### 3. Securite
- Webhook authentication (signature)
- Variables sensibles en connexions (pas inline)
- Logs des executions pour audit
- Limiter acces scenarios

### 4. Organisation
- Nommer scenarios clairement
- Grouper par folders
- Documenter dans scenario
- Versionner via export

---

## Comparaison Make vs Alternatives

| Feature | Make | Zapier | n8n |
|---------|------|--------|-----|
| Self-hosted | Non | Non | Oui |
| Complexity | High | Low | High |
| Pricing | $$$ | $$$$ | Free |
| Visual Editor | Excellent | Good | Good |
| Error Handling | Advanced | Limited | Good |
| Integrations | 1500+ | 5000+ | 400+ |
| Code Support | Limited | Non | Full |

---

## Cas d'Usage Courants

### Lead Capture
```
Typeform -> Make -> Airtable CRM + Email Welcome + Slack Alert
```

### E-commerce Sync
```
Shopify Order -> Make -> Airtable + Accounting + Shipping
```

### Content Pipeline
```
RSS Feed -> Make -> AI Summary -> Social Media Posts
```

### Support Ticket
```
Email -> Make -> Airtable + Assignment + Slack Channel
```

---

## Troubleshooting

### Erreur: "Webhook not responding"
- Verifier URL webhook active
- Tester avec curl/Postman
- Verifier logs Make

### Erreur: "Rate limit"
- Reduire frequence schedule
- Batch operations
- Utiliser queues

### Erreur: "Connection expired"
- Re-authentifier connexion
- Verifier permissions app
- Renouveler tokens

### Scenario ne se declenche pas
- Verifier trigger actif
- Check schedule configuration
- Verifier filtres/conditions

---

## Keywords Auto-Discovery

```
make, make.com, integromat, make scenario, make automation,
make webhook, make module, scenario automation, make integration,
make trigger, make router, make iterator, nocode workflow
```

---

*ULTRA-CREATE v28.5 | Make (Integromat) Integration Patterns*
*MCP: @makehq/mcp-server (official)*
*Reference: https://www.make.com/en/api-documentation*
