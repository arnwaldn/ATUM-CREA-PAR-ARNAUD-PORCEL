# Airtable - Patterns pour ULTRA-CREATE v28.5

> Ce fichier contient les patterns d'utilisation d'Airtable pour le developpement nocode.
> Charge automatiquement via knowledge-auto-load.js sur keywords: "airtable", "base airtable", "airtable api"

---

## Overview Airtable

| Aspect | Detail |
|--------|--------|
| **Type** | Database nocode/low-code |
| **MCP** | airtable-mcp-server v1.9.6 |
| **Package** | domdomegg/airtable-mcp-server |
| **Installation** | `npx -y airtable-mcp-server` |
| **API** | REST API + Personal Access Tokens |

---

## Configuration MCP

```json
{
  "mcpServers": {
    "airtable": {
      "command": "npx",
      "args": ["-y", "airtable-mcp-server"],
      "env": {
        "AIRTABLE_API_KEY": "pat_xxxxx"
      }
    }
  }
}
```

### Scopes Requis
- `schema.bases:read` - Lire schemas des bases
- `data.records:read` - Lire records
- `data.records:write` - Ecrire records
- `data.recordComments:read` - Lire commentaires
- `data.recordComments:write` - Ecrire commentaires

---

## Concepts Cles

### Hierarchie Airtable
```
Workspace > Base > Table > View > Record > Field
```

### Types de Fields
| Type | Usage | Exemple |
|------|-------|---------|
| Single Line Text | Texte court | Nom |
| Long Text | Texte long | Description |
| Attachment | Fichiers | Images, PDF |
| Checkbox | Boolean | Active |
| Single Select | Enum | Status |
| Multiple Select | Tags | Categories |
| Linked Record | Foreign Key | Client |
| Lookup | Derived | Client Name |
| Rollup | Aggregation | Total commandes |
| Formula | Calcul | Price * Qty |
| Date | Date/Time | Created At |
| Number | Numerique | Quantity |
| Currency | Monetaire | Price |
| Email | Email | Contact |
| URL | Lien | Website |
| Rating | 1-5 stars | Score |
| Autonumber | Auto-increment | ID |

---

## MCP Tools Reference

### list_bases
Liste toutes les bases accessibles avec le token.
```javascript
const bases = await airtable_list_bases();
// -> [{ id: "appXXX", name: "My Base", permissionLevel: "edit" }]
```

### get_base_schema
Obtient le schema complet d'une base (tables, fields, views).
```javascript
const schema = await airtable_get_base_schema({ baseId: "appXXX" });
// -> { tables: [{ id, name, fields, views }] }
```

### list_tables
Liste les tables d'une base.
```javascript
const tables = await airtable_list_tables({ baseId: "appXXX" });
```

### get_table_schema
Schema detaille d'une table avec tous les fields.
```javascript
const tableSchema = await airtable_get_table_schema({
  baseId: "appXXX",
  tableId: "tblYYY"
});
```

### search_records
Recherche records avec filtre formula.
```javascript
const records = await airtable_search_records({
  baseId: "appXXX",
  tableId: "tblYYY",
  formula: "AND({Status}='Active', {Created} > '2024-01-01')",
  maxRecords: 100,
  sort: [{ field: "Created", direction: "desc" }]
});
```

### create_records
Creer records en batch (max 10 par appel).
```javascript
const created = await airtable_create_records({
  baseId: "appXXX",
  tableId: "tblYYY",
  records: [
    { fields: { Name: "Item 1", Status: "Active" } },
    { fields: { Name: "Item 2", Status: "Pending" } }
  ]
});
```

### update_records
Mise a jour batch de records.
```javascript
await airtable_update_records({
  baseId: "appXXX",
  tableId: "tblYYY",
  records: [
    { id: "recAAA", fields: { Status: "Completed" } },
    { id: "recBBB", fields: { Status: "Cancelled" } }
  ]
});
```

### delete_records
Suppression de records.
```javascript
await airtable_delete_records({
  baseId: "appXXX",
  tableId: "tblYYY",
  recordIds: ["recAAA", "recBBB"]
});
```

### get_record
Obtenir un record specifique.
```javascript
const record = await airtable_get_record({
  baseId: "appXXX",
  tableId: "tblYYY",
  recordId: "recZZZ"
});
```

### create_comment
Ajouter un commentaire a un record.
```javascript
await airtable_create_comment({
  baseId: "appXXX",
  tableId: "tblYYY",
  recordId: "recZZZ",
  text: "Commentaire important"
});
```

---

## Formulas Airtable

### Syntaxe de Base
| Fonction | Usage | Exemple |
|----------|-------|---------|
| `IF(condition, true, false)` | Conditionnel | `IF({Status}='Active', 'Yes', 'No')` |
| `CONCATENATE(a, b)` | Concatenation | `CONCATENATE({First}, ' ', {Last})` |
| `FIND(search, text)` | Recherche | `FIND('error', {Log})` |
| `LEN(text)` | Longueur | `LEN({Name})` |
| `DATETIME_FORMAT(date, format)` | Format date | `DATETIME_FORMAT({Created}, 'YYYY-MM-DD')` |
| `DATETIME_DIFF(d1, d2, unit)` | Difference | `DATETIME_DIFF(NOW(), {Created}, 'days')` |
| `SUM(values)` | Somme | Rollup field |
| `AVERAGE(values)` | Moyenne | Rollup field |
| `COUNT(values)` | Comptage | Rollup field |

### Exemples Pratiques
```
// Prix total
{Quantity} * {Unit Price}

// Status badge
IF({Status} = 'Active', 'OK', IF({Status} = 'Pending', 'WAIT', 'ERROR'))

// Age en jours
DATETIME_DIFF(NOW(), {Created}, 'days')

// Nom complet
CONCATENATE({First Name}, ' ', {Last Name})

// Est en retard?
IF(DATETIME_DIFF(NOW(), {Due Date}, 'days') > 0, 'LATE', 'ON TIME')
```

---

## Patterns d'Integration

### Pattern 1: Backend Airtable + Frontend React
```
React App -> Airtable API -> Airtable Base
         <-

Frontend utilise:
- tanstack/react-query pour cache
- airtable.js SDK ou fetch direct
```

### Pattern 2: Airtable + Make + Notifications
```
Airtable Record Created
        |
        v
    Make Webhook (trigger)
        |
        v
    [Process Data]
        |
        v
    Slack/Email Notification
```

### Pattern 3: Sync Bidirectionnel
```
External API <-> Make Scenario <-> Airtable Base
              (scheduled sync)

Make scenario:
1. GET from API
2. Iterator sur resultats
3. Upsert dans Airtable
```

### Pattern 4: Airtable comme CMS
```
Airtable Base (content)
        |
        v
    API/Webhook
        |
        v
    Next.js (ISR/SSG)
        |
        v
    Static Site
```

---

## Best Practices

### 1. Rate Limiting
- Limite: 5 requests/seconde
- Utiliser batch operations (max 10 records)
- Implementer retry avec exponential backoff
- Queue pour operations massives

### 2. Schema Design
- Utiliser Linked Records pour relations (pas de duplications)
- Preferer Single Select aux textes libres
- Creer des vues pour filtres frequents
- Eviter les formules trop complexes (performance)

### 3. Integration Make
- Utiliser webhooks Airtable -> Make pour temps reel
- Make scenarios pour logique complexe
- Airtable pour stockage, Make pour orchestration
- Gerer les erreurs dans Make (retry, notifications)

### 4. Performance
- Limiter les fields retournes (fields parameter)
- Paginer les resultats (offset, pageSize)
- Cacher les schemas (ne changent pas souvent)
- Utiliser views pour filtres complexes

---

## Cas d'Usage Courants

### CRM Simple
```
Tables:
- Contacts (Name, Email, Phone, Company)
- Companies (Name, Industry, Website)
- Interactions (Date, Type, Notes, Contact)

Relations:
- Contact -> Company (Linked Record)
- Interaction -> Contact (Linked Record)
```

### Project Management
```
Tables:
- Projects (Name, Status, Start, End)
- Tasks (Name, Status, Assignee, Due)
- Team (Name, Email, Role)

Relations:
- Task -> Project
- Task -> Team (Assignee)
```

### Inventory
```
Tables:
- Products (Name, SKU, Price, Stock)
- Categories (Name, Description)
- Orders (Date, Customer, Total)
- OrderItems (Quantity, Price)

Relations:
- Product -> Category
- OrderItem -> Order
- OrderItem -> Product
```

---

## Troubleshooting

### Erreur: "Invalid API key"
- Verifier AIRTABLE_API_KEY est definie
- Verifier expiration du token
- Verifier scopes du token

### Erreur: "Base not found"
- Verifier baseId format (appXXX)
- Verifier acces au workspace
- Token a acces a cette base?

### Erreur: "Rate limit exceeded"
- Reduire frequence des appels
- Utiliser batch operations
- Implementer queue avec delays

### Erreur: "Field not found"
- Verifier nom exact du field (case sensitive)
- Field existe dans cette table?
- Verifier schema avec get_table_schema

---

## Keywords Auto-Discovery

```
airtable, base airtable, airtable api, airtable mcp, airtable records,
airtable schema, airtable table, airtable view, airtable automation,
airtable formula, linked records, airtable webhook, nocode database
```

---

*ULTRA-CREATE v28.5 | Airtable Integration Patterns*
*MCP: domdomegg/airtable-mcp-server v1.9.6*
*Reference: https://airtable.com/developers/web/api*
