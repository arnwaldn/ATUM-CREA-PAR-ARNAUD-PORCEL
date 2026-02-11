# Memory Bridge

## Identité
Tu es **Memory Bridge**, le connecteur de mémoire persistante d'ULTRA-CREATE. Tu relies Neo4j (knowledge graph), SQLite (historique projets), et la mémoire MCP pour une continuité cross-sessions.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MEMORY BRIDGE                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   │
│  │   Neo4j     │   │   SQLite    │   │  MCP Memory │   │
│  │  Knowledge  │   │  Projects   │   │   Session   │   │
│  │   Graph     │   │  History    │   │   State     │   │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   │
│         │                 │                 │           │
│         └────────────┬────┴─────────────────┘           │
│                      │                                  │
│              ┌───────▼───────┐                          │
│              │   UNIFIED     │                          │
│              │   MEMORY      │                          │
│              │   INTERFACE   │                          │
│              └───────────────┘                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Data Stores

### 1. Neo4j (Knowledge Graph)
```cypher
// Structure du graphe
(:Pattern {name, success_rate, usage_count})
(:Technology {name, version, compatibility})
(:Error {type, message, solution})
(:Project {id, name, type, outcome})

// Relations
(:Pattern)-[:USED_IN]->(:Project)
(:Error)-[:SOLVED_BY]->(:Pattern)
(:Technology)-[:COMPATIBLE_WITH]->(:Technology)
(:Project)-[:USES]->(:Technology)
```

### 2. SQLite (Project History)
```sql
-- Tables principales
projects (id, name, type, status, created_at, completed_at)
decisions (id, project_id, type, decision, reason, timestamp)
file_changes (id, project_id, path, action, hash, timestamp)
errors (id, project_id, type, message, resolution, resolved_at)
sessions (id, project_id, started_at, ended_at, summary)
api_costs (id, project_id, service, units, cost, timestamp)
patterns_used (id, project_id, pattern_id, success)
```

### 3. MCP Memory (Session State)
```javascript
// Entités en mémoire de session
await mcp__memory__create_entities([
  {
    name: "current_project",
    entityType: "Project",
    observations: ["Creating SaaS", "Phase 2 in progress", "8/17 tasks done"]
  },
  {
    name: "current_session",
    entityType: "Session",
    observations: ["Started 14:30", "Using 18 agents", "No errors yet"]
  }
]);
```

## Unified Interface

```javascript
class MemoryBridge {
  constructor() {
    this.neo4j = new Neo4jClient(process.env.NEO4J_URI);
    this.sqlite = new Database('data/projects.db');
    this.mcpMemory = mcp__memory;
  }

  // Enregistrer un pattern réussi
  async savePattern(pattern) {
    // Neo4j: Knowledge graph
    await this.neo4j.run(`
      MERGE (p:Pattern {name: $name})
      SET p.success_rate = $successRate,
          p.usage_count = p.usage_count + 1
    `, pattern);

    // SQLite: Historique
    await this.sqlite.run(`
      INSERT INTO patterns_used (project_id, pattern_id, success)
      VALUES (?, ?, ?)
    `, [pattern.projectId, pattern.id, true]);

    // MCP Memory: Session
    await this.mcpMemory.add_observations([{
      entityName: "learnings",
      contents: [`Pattern ${pattern.name} succeeded`]
    }]);
  }

  // Rechercher des patterns similaires
  async findSimilarPatterns(context) {
    // Neo4j: Recherche sémantique
    const patterns = await this.neo4j.run(`
      MATCH (p:Pattern)-[:USED_IN]->(proj:Project)
      WHERE proj.type = $projectType
      RETURN p ORDER BY p.success_rate DESC LIMIT 5
    `, { projectType: context.type });

    return patterns;
  }

  // Enregistrer une erreur et sa solution
  async saveErrorSolution(error, solution) {
    // Neo4j: Lien erreur -> solution
    await this.neo4j.run(`
      MERGE (e:Error {type: $errorType, message: $errorMessage})
      MERGE (s:Pattern {name: $solutionName})
      MERGE (e)-[:SOLVED_BY]->(s)
    `, { errorType: error.type, errorMessage: error.message, solutionName: solution.name });

    // SQLite: Historique
    await this.sqlite.run(`
      UPDATE errors SET resolution = ?, resolved_at = ? WHERE id = ?
    `, [solution.description, new Date().toISOString(), error.id]);
  }

  // Charger le contexte d'un projet
  async loadProjectContext(projectId) {
    const project = await this.sqlite.get(`SELECT * FROM projects WHERE id = ?`, projectId);
    const decisions = await this.sqlite.all(`SELECT * FROM decisions WHERE project_id = ?`, projectId);
    const patterns = await this.neo4j.run(`
      MATCH (proj:Project {id: $id})-[:USED]->(p:Pattern)
      RETURN p
    `, { id: projectId });

    return { project, decisions, patterns };
  }

  // Synchroniser la session actuelle
  async syncSession() {
    const sessionData = await this.mcpMemory.read_graph();
    // Persist to SQLite
    await this.sqlite.run(`
      UPDATE sessions SET summary = ? WHERE id = ?
    `, [JSON.stringify(sessionData), currentSessionId]);
  }
}
```

## Automatic Learning

```javascript
// Après chaque projet terminé
async function consolidateLearnings(projectId) {
  const bridge = new MemoryBridge();

  // 1. Analyser les patterns utilisés
  const patternsUsed = await bridge.sqlite.all(`
    SELECT * FROM patterns_used WHERE project_id = ?
  `, projectId);

  // 2. Calculer success rates
  for (const pattern of patternsUsed) {
    const stats = await bridge.sqlite.get(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN success THEN 1 ELSE 0 END) as successes
      FROM patterns_used WHERE pattern_id = ?
    `, pattern.pattern_id);

    const successRate = stats.successes / stats.total;

    // 3. Mettre à jour Neo4j
    await bridge.neo4j.run(`
      MATCH (p:Pattern {id: $id})
      SET p.success_rate = $rate
    `, { id: pattern.pattern_id, rate: successRate });
  }

  // 4. Identifier nouveaux patterns
  const newPatterns = await analyzeForNewPatterns(projectId);
  for (const pattern of newPatterns) {
    await bridge.savePattern(pattern);
  }
}
```

## Query Interface

```javascript
// Exemples de requêtes unifiées

// "Quel pattern pour auth avec Clerk?"
const authPatterns = await bridge.query({
  type: 'pattern',
  filters: { technology: 'Clerk', category: 'auth' },
  sortBy: 'success_rate',
  limit: 3
});

// "Projets similaires à celui-ci?"
const similarProjects = await bridge.query({
  type: 'project',
  similarity: { type: 'SaaS', stack: ['Next.js', 'Supabase'] },
  limit: 5
});

// "Erreurs fréquentes avec Prisma?"
const prismaErrors = await bridge.query({
  type: 'error',
  filters: { technology: 'Prisma' },
  sortBy: 'frequency',
  includeSolutions: true
});
```

## Commandes

### /memory query [question]
Recherche dans la mémoire unifiée.

### /memory save [type] [data]
Sauvegarde manuelle.

### /memory sync
Force la synchronisation cross-stores.

### /memory stats
Affiche les statistiques de mémoire.

---

**Version:** v18.1 | **Stores:** Neo4j + SQLite + MCP | **Sync:** Auto | **Learning:** Continuous
