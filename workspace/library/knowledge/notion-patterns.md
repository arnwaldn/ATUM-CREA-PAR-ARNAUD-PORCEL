# Notion Patterns - Guide d'Integration

> Patterns et best practices pour l'integration Notion via API et automatisation.

---

## Vue d'Ensemble API Notion

### Capabilities API

| Operation | Supporte | Endpoint |
|-----------|----------|----------|
| Creer Database | Oui | POST /databases |
| Modifier Database | Oui | PATCH /databases/{id} |
| Query Database | Oui | POST /databases/{id}/query |
| Creer Page | Oui | POST /pages |
| Modifier Page | Oui | PATCH /pages/{id} |
| Archiver Page | Oui | PATCH /pages/{id} (archived: true) |
| Creer Blocks | Oui | PATCH /blocks/{id}/children |
| Modifier Block | Oui | PATCH /blocks/{id} |
| Supprimer Block | Oui | DELETE /blocks/{id} |
| Recherche | Oui | POST /search |
| Comments | Oui | POST/GET /comments |
| Users | Oui (lecture) | GET /users |

### Limitations API (Important)

| Operation | Supporte | Alternative |
|-----------|----------|-------------|
| **Creer Vues** | NON | E2B Desktop ou manuel |
| **Modifier Vues** | NON | E2B Desktop ou manuel |
| **Permissions** | NON | Manuel via UI |
| **Templates DB** | NON | Creer via blocks |
| **Workspace settings** | NON | Manuel via UI |
| **Integrations** | NON | Manuel via UI |

---

## Pattern 1: Database avec Relations

### Schema Tasks/Projects (Cas Reel)

```javascript
// 1. Creer Projects Database
const projectsDb = await notion_create_database({
  parent: { page_id: "parent_page_id" },
  title: [{ text: { content: "Projects" } }],
  properties: {
    Name: { title: {} },
    Status: {
      select: {
        options: [
          { name: "Planning", color: "gray" },
          { name: "Active", color: "blue" },
          { name: "On Hold", color: "yellow" },
          { name: "Completed", color: "green" }
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
    Dates: { date: {} },
    Owner: { people: {} },
    Description: { rich_text: {} }
  }
});

// 2. Creer Tasks Database avec Relation
const tasksDb = await notion_create_database({
  parent: { page_id: "parent_page_id" },
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
    Due: { date: {} },
    Assignee: { people: {} },
    // Relation vers Projects
    Project: {
      relation: {
        database_id: projectsDb.id,
        type: "dual_property",
        dual_property: {
          synced_property_name: "Tasks"
        }
      }
    }
  }
});
```

---

## Pattern 2: Queries Avancees

### Filtres Composes

```javascript
// Tasks en cours, haute priorite, assignees a moi
await notion_query_database({
  database_id: tasksDbId,
  filter: {
    and: [
      {
        property: "Status",
        select: { equals: "In Progress" }
      },
      {
        property: "Priority",
        select: { equals: "High" }
      },
      {
        property: "Assignee",
        people: { contains: userId }
      }
    ]
  },
  sorts: [
    { property: "Due", direction: "ascending" }
  ]
});
```

### Filtres par Date

```javascript
// Tasks dues cette semaine
const today = new Date();
const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

await notion_query_database({
  database_id: tasksDbId,
  filter: {
    and: [
      {
        property: "Due",
        date: { on_or_after: today.toISOString().split('T')[0] }
      },
      {
        property: "Due",
        date: { on_or_before: nextWeek.toISOString().split('T')[0] }
      }
    ]
  }
});
```

### Filtres par Relation

```javascript
// Tasks d'un projet specifique
await notion_query_database({
  database_id: tasksDbId,
  filter: {
    property: "Project",
    relation: { contains: projectPageId }
  }
});
```

---

## Pattern 3: Formulas Utiles

### Progress Percentage (Rollup + Formula)

```
// Dans Projects, apres avoir cree un Rollup "Completed Tasks"
// Formula: Progress
round(prop("Completed Tasks") / prop("Total Tasks") * 100)
```

### Days Until Due

```
// Formula: Days Left
if(empty(prop("Due")), "No due date",
  if(dateBetween(prop("Due"), now(), "days") < 0,
    "Overdue",
    format(dateBetween(prop("Due"), now(), "days")) + " days"
  )
)
```

### Status Emoji

```
// Formula: Status Icon
if(prop("Status") == "Done", "✅",
  if(prop("Status") == "In Progress", "🔄",
    if(prop("Status") == "Not Started", "⬜", "❓")
  )
)
```

---

## Pattern 4: Blocks et Contenu

### Creer Page avec Contenu Structure

```javascript
await notion_create_page({
  parent: { database_id: tasksDbId },
  properties: {
    Name: { title: [{ text: { content: "Implement Login" } }] },
    Status: { select: { name: "Not Started" } },
    Priority: { select: { name: "High" } }
  },
  children: [
    {
      object: "block",
      type: "heading_2",
      heading_2: {
        rich_text: [{ text: { content: "Description" } }]
      }
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [{ text: { content: "Implement user authentication..." } }]
      }
    },
    {
      object: "block",
      type: "heading_2",
      heading_2: {
        rich_text: [{ text: { content: "Acceptance Criteria" } }]
      }
    },
    {
      object: "block",
      type: "to_do",
      to_do: {
        rich_text: [{ text: { content: "User can login with email/password" } }],
        checked: false
      }
    },
    {
      object: "block",
      type: "to_do",
      to_do: {
        rich_text: [{ text: { content: "User can logout" } }],
        checked: false
      }
    },
    {
      object: "block",
      type: "code",
      code: {
        rich_text: [{ text: { content: "// Implementation notes..." } }],
        language: "javascript"
      }
    }
  ]
});
```

---

## Pattern 5: Creation de Vues (E2B Desktop)

> L'API ne supporte PAS la creation de vues. Utiliser E2B Desktop.

### Workflow Vision-Action Loop

```javascript
// Prerequis: Sandbox E2B avec navigateur ouvert sur la database

async function createNotionView(viewType, viewName, groupBy = null) {
  // 1. Trouver le bouton "+" pour ajouter une vue
  let screenshot = await screen_capture();
  // Vision: "Find the + button next to existing view tabs at the top"
  let addButton = await analyzeWithVision(screenshot, "Find + button near view tabs");

  await mouse_click({ x: addButton.x, y: addButton.y });
  await wait(500);

  // 2. Selectionner le type de vue dans le menu
  screenshot = await screen_capture();
  // Vision: "Find the [viewType] option in the dropdown menu"
  let typeOption = await analyzeWithVision(screenshot, `Find ${viewType} option`);

  await mouse_click({ x: typeOption.x, y: typeOption.y });
  await wait(500);

  // 3. Nommer la vue
  // Le champ de nom est generalement deja focus
  await keyboard_type({ text: viewName });
  await keyboard_press({ key: "Enter" });
  await wait(1000);

  // 4. Configurer Group By (si Board/Table)
  if (groupBy && (viewType === "Board" || viewType === "Table")) {
    screenshot = await screen_capture();
    // Vision: "Find the Group button or 'No grouping' text"
    let groupButton = await analyzeWithVision(screenshot, "Find Group button");

    await mouse_click({ x: groupButton.x, y: groupButton.y });
    await wait(300);

    screenshot = await screen_capture();
    // Vision: "Find the [groupBy] property in the list"
    let propertyOption = await analyzeWithVision(screenshot, `Find ${groupBy} property`);

    await mouse_click({ x: propertyOption.x, y: propertyOption.y });
    await wait(500);
  }

  // 5. Verification
  screenshot = await screen_capture();
  // Vision: "Confirm view tab named [viewName] exists"
  return await analyzeWithVision(screenshot, `Confirm ${viewName} tab exists`);
}

// Usage:
await createNotionView("Board", "Kanban", "Status");
await createNotionView("Table", "By Project", "Project");
await createNotionView("Timeline", "Timeline", null);
```

---

## Pattern 6: Integration Make/Zapier

### Webhook Notion -> Make

```javascript
// 1. Dans Make, creer un scenario avec trigger "Watch Database Items"
// 2. Configurer le webhook Notion

// Exemple de payload recu par Make:
{
  "object": "page",
  "id": "page-id",
  "properties": {
    "Status": { "select": { "name": "Done" } },
    "Name": { "title": [{ "text": { "content": "Task name" } }] }
  }
}

// 3. Actions Make possibles:
// - Envoyer email quand task Done
// - Mettre a jour Airtable/Supabase
// - Notifier Slack/Discord
// - Generer rapport PDF
```

### Sync Bidirectionnel Notion <-> Supabase

```javascript
// Pattern: Notion comme interface, Supabase comme backend

// 1. Webhook Notion -> Make -> Supabase
// Quand page modifiee dans Notion:
// - Make detecte le changement
// - Make update la row correspondante dans Supabase

// 2. Webhook Supabase -> Make -> Notion
// Quand row modifiee dans Supabase:
// - Supabase trigger envoie a Make
// - Make update la page correspondante dans Notion
```

---

## Pattern 7: Batch Operations

### Creer Multiple Pages

```javascript
// Notion API limite: 3 requests/seconde
// Utiliser Promise.all avec rate limiting

async function createPagesWithRateLimit(pages, dbId) {
  const results = [];
  const batchSize = 3;

  for (let i = 0; i < pages.length; i += batchSize) {
    const batch = pages.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(page =>
        notion_create_page({
          parent: { database_id: dbId },
          properties: page.properties
        })
      )
    );

    results.push(...batchResults);

    // Attendre 1 seconde entre batches
    if (i + batchSize < pages.length) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  return results;
}
```

---

## Troubleshooting

### Erreur: "Could not find property"
```javascript
// Les noms de proprietes sont case-sensitive
// CORRECT:
{ property: "Status", select: { equals: "Done" } }
// INCORRECT:
{ property: "status", select: { equals: "Done" } }

// Solution: Recuperer le schema pour voir les noms exacts
const db = await notion_retrieve_database({ database_id: dbId });
console.log(Object.keys(db.properties));
```

### Erreur: "Validation failed" sur Relation
```javascript
// Les relations doivent utiliser des page IDs, pas des noms
// CORRECT:
{
  property: "Project",
  relation: [{ id: "page-id-xxx" }]
}
// INCORRECT:
{
  property: "Project",
  relation: [{ name: "Project Name" }]
}
```

### Erreur: Rate Limit (429)
```javascript
// Implementer exponential backoff
async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const waitTime = Math.pow(2, i) * 1000;
        await new Promise(r => setTimeout(r, waitTime));
      } else {
        throw error;
      }
    }
  }
}
```

---

## Resources

- [API Reference](https://developers.notion.com/reference)
- [API Changelog](https://developers.notion.com/changelog)
- [Integration Guide](https://developers.notion.com/docs)
- [Formula Reference](https://www.notion.so/help/formulas)

---

*Knowledge: notion-patterns v1.0.0 | Last updated: 2026-01-24*
