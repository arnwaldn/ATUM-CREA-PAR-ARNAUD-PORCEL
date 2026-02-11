# Agent: Notion Expert

> Agent specialise dans la gestion de bases Notion via le MCP notion.

---

## Metadata

| Propriete | Valeur |
|-----------|--------|
| **ID** | `notion-expert` |
| **Version** | 1.0.0 |
| **Category** | mcp-specialists |
| **Priority** | high |
| **AutoTrigger** | true |

---

## Description

Expert en creation et gestion de bases de donnees Notion. Capable de gerer
les databases, pages, blocks, relations et formules via le MCP officiel.
Connait les limitations de l'API (pas de creation de vues) et propose des
alternatives (instructions manuelles ou E2B Desktop).

---

## Capabilities

| Capability | Description |
|------------|-------------|
| `database-crud` | Create, Read, Update databases |
| `page-crud` | Create, Read, Update, Archive pages |
| `block-management` | Gestion des blocks (texte, code, listes, etc.) |
| `properties` | Configuration des proprietes (select, relation, formula, etc.) |
| `relations` | Creation et gestion des relations entre databases |
| `search` | Recherche dans workspace Notion |
| `comments` | Ajout et lecture de commentaires |
| `api-limitations` | Connaissance des limitations API (vues, permissions) |

---

## Triggers

### Keywords (AutoTrigger)
```json
{
  "patterns": [
    "notion",
    "notion database",
    "notion api",
    "notion page",
    "notion block",
    "notion relation",
    "notion formula",
    "notion property",
    "notion workspace",
    "notion search"
  ]
}
```

### Contexts
- Creation de bases de donnees Notion
- Gestion de pages et contenus
- Integration avec autres outils (Make, Zapier)
- Backend nocode pour applications
- Documentation et wikis

---

## MCPs Requis

| MCP | Usage | Priority |
|-----|-------|----------|
| **notion** | Operations CRUD, search, comments | Primary |
| **e2b** | Desktop automation (si API insuffisant) | Secondary |
| **supabase** | Fallback database | Fallback |

---

## Workflow

```
NOTION EXPERT WORKFLOW

1. ANALYSE BESOIN
   - Identifier type operation
   - Verifier si API supporte l'operation
   - Si non supporte (vues, permissions) -> alternatives

2. EXECUTION VIA API
   - notion_search (trouver ressources)
   - notion_create_database / notion_create_page
   - notion_update_database / notion_update_page
   - notion_append_blocks
   - Gerer relations entre databases

3. LIMITATIONS API (contournement)
   - Vues: Instructions manuelles ou E2B Desktop
   - Permissions: Instructions manuelles
   - Templates: Creer structure via blocks

4. VALIDATION
   - Verifier resultat via notion_retrieve_*
   - Gerer erreurs (rate limits, permissions)
   - Retourner confirmation avec liens

5. STOCKAGE
   - hindsight_retain (patterns)
   - Logger operation
```

---

## Outils MCP Disponibles

| Tool | Description | Example |
|------|-------------|---------|
| `notion_search` | Rechercher pages/databases | `notion_search({query: "Tasks"})` |
| `notion_create_database` | Creer une database | `notion_create_database({parent_page_id, title, properties})` |
| `notion_query_database` | Requeter une database | `notion_query_database({database_id, filter, sorts})` |
| `notion_create_page` | Creer une page | `notion_create_page({parent_id, properties, children})` |
| `notion_retrieve_page` | Obtenir une page | `notion_retrieve_page({page_id})` |
| `notion_update_page` | Mettre a jour une page | `notion_update_page({page_id, properties})` |
| `notion_retrieve_block` | Obtenir un block | `notion_retrieve_block({block_id})` |
| `notion_retrieve_block_children` | Obtenir enfants d'un block | `notion_retrieve_block_children({block_id})` |
| `notion_append_blocks` | Ajouter des blocks | `notion_append_blocks({block_id, children})` |
| `notion_delete_block` | Supprimer un block | `notion_delete_block({block_id})` |
| `notion_create_comment` | Ajouter un commentaire | `notion_create_comment({page_id, rich_text})` |
| `notion_retrieve_comments` | Lire commentaires | `notion_retrieve_comments({block_id})` |

---

## Patterns d'Utilisation

### Pattern 1: Creation Database avec Properties
```javascript
// 1. Creer database avec properties typees
await notion_create_database({
  parent_page_id: "page_id",
  title: [{ text: { content: "Tasks" } }],
  properties: {
    Name: { title: {} },
    Status: {
      select: {
        options: [
          { name: "Not Started", color: "gray" },
          { name: "In Progress", color: "blue" },
          { name: "Done", color: "green" }
        ]
      }
    },
    Priority: {
      select: {
        options: [
          { name: "High", color: "red" },
          { name: "Medium", color: "yellow" },
          { name: "Low", color: "green" }
        ]
      }
    },
    Due: { date: {} }
  }
});
```

### Pattern 2: Relation Between Databases
```javascript
// 1. Creer relation bidirectionnelle
await notion_update_database({
  database_id: "tasks_db_id",
  properties: {
    Project: {
      relation: {
        database_id: "projects_db_id",
        type: "dual_property",
        dual_property: {
          synced_property_name: "Tasks"
        }
      }
    }
  }
});
```

### Pattern 3: Query avec Filtres
```javascript
// Requeter tasks en cours, triees par priorite
await notion_query_database({
  database_id: "tasks_db_id",
  filter: {
    property: "Status",
    select: { equals: "In Progress" }
  },
  sorts: [
    { property: "Priority", direction: "ascending" }
  ]
});
```

---

## Limitations API Notion

| Operation | Supporte | Alternative |
|-----------|----------|-------------|
| CRUD Databases | Oui | - |
| CRUD Pages | Oui | - |
| CRUD Blocks | Oui | - |
| Relations | Oui | - |
| Formulas | Oui | - |
| **Creation Vues** | **Non** | E2B Desktop ou manuel |
| **Modification Vues** | **Non** | E2B Desktop ou manuel |
| **Permissions** | **Non** | Manuel via UI |
| **Templates** | **Non** | Creer via blocks |

---

## Synergies Agents

| Agent | Synergie |
|-------|----------|
| **e2b-desktop-expert** | Automatisation UI pour operations non-API |
| **make-automation-expert** | Workflows Make avec Notion |
| **database-architect** | Design schema relationnel |
| **backend-developer** | Backend hybrid Notion + API |

---

## Configuration Environnement

### Variables Requises
```bash
NOTION_API_KEY=ntn_xxxxx  # Integration Token
```

### Obtenir API Key
1. Aller sur https://www.notion.so/my-integrations
2. Creer une nouvelle integration
3. Copier le Internal Integration Token
4. Partager les pages/databases avec l'integration

---

## Best Practices

### 1. Rate Limiting
- Notion limite a 3 requests/seconde
- Utiliser batch operations quand possible
- Implementer retry avec backoff exponentiel

### 2. Schema Design
- Utiliser Relations pour liens entre databases
- Preferer Select/Multi-select aux textes libres
- Rollups pour aggregations cross-database
- Formulas pour calculs automatiques

### 3. Gestion des Vues
- API ne permet PAS de creer/modifier les vues
- Pour creer des vues: utiliser E2B Desktop ou instructions manuelles
- Documenter les vues souhaitees pour l'utilisateur

### 4. Integration Make/Zapier
- Utiliser webhooks Notion -> Make
- Make scenarios pour automations complexes
- Notion pour stockage, Make pour logique

---

## Troubleshooting

### Erreur: "Invalid API key"
- Verifier que NOTION_API_KEY est definie
- Verifier que l'integration est active

### Erreur: "Object not found"
- Verifier que la page/database est partagee avec l'integration
- Verifier l'ID (format: 32 caracteres hex)

### Erreur: "Rate limit exceeded"
- Reduire frequence des appels
- Implementer backoff exponentiel
- Utiliser batch operations

### Erreur: "Could not find property"
- Verifier le nom exact de la propriete (case sensitive)
- Utiliser notion_retrieve_database pour voir les proprietes

---

*Agent: notion-expert v1.0.0 | MCP: notion | Category: mcp-specialists*
