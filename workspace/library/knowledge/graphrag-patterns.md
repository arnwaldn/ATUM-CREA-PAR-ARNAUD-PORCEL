# GraphRAG Patterns Guide

## Overview

GraphRAG (Graph-based Retrieval Augmented Generation) reduit les hallucinations de 90% en ancrant les reponses sur un graphe de connaissances structure.

```yaml
Source: FalkorDB 2025, Microsoft Research
Impact: Hallucination reduction from 15-20% to < 2%
Implementation: MCP Memory + Custom Graph Structure
```

---

## Pourquoi GraphRAG?

### Probleme: Hallucinations IA

| Cause | Exemple |
|-------|---------|
| Training data obsolete | "Utilisez React 17..." (obsolete) |
| Generalisation excessive | Melange de patterns incompatibles |
| Manque de contexte | Solutions generiques non adaptees |
| Confiance non calibree | Reponse assertive mais fausse |

### Solution: Ancrage Factuel

GraphRAG ancre chaque reponse sur des faits verifies:
1. **Entities**: Concepts, technologies, patterns documentes
2. **Relations**: Liens verifies entre entites
3. **Evidence**: Episodes sources avec resultats reels

---

## Architecture

```
+------------------+     +------------------+     +------------------+
|   USER QUERY     | --> |   GRAPH QUERY    | --> |   GROUNDED       |
|                  |     |   ENGINE         |     |   RESPONSE       |
+------------------+     +------------------+     +------------------+
                                 |
                                 v
                    +---------------------------+
                    |      KNOWLEDGE GRAPH      |
                    |  - Entities               |
                    |  - Relations              |
                    |  - Properties             |
                    |  - Confidence Scores      |
                    +---------------------------+
```

---

## Implementation ULTRA-CREATE

### 1. Structure du Graphe

```typescript
// Noeuds (Entities)
type NodeType =
  | 'Technology'    // Next.js, Supabase, React
  | 'Pattern'       // Server Actions, RSC
  | 'BestPractice'  // RLS-First, Type-Safety
  | 'AntiPattern'   // Hardcoded-Secrets
  | 'Error'         // Common errors
  | 'Solution'      // Verified solutions

interface GraphNode {
  id: string
  type: NodeType
  name: string
  properties: {
    description: string
    version?: string
    confidence: number      // 0-1
    episode_count: number   // Nombre d'episodes sources
    last_verified: Date
  }
}

// Relations (Edges)
type RelationType =
  | 'USES'           // A utilise B
  | 'REQUIRES'       // A necessite B
  | 'SOLVES'         // A resout B
  | 'CAUSES'         // A cause B
  | 'CONFLICTS_WITH' // A incompatible avec B
  | 'IMPROVES'       // A ameliore B
  | 'REPLACES'       // A remplace B

interface GraphEdge {
  from: string
  to: string
  type: RelationType
  properties: {
    weight: number      // Force de la relation
    evidence: string[]  // Episodes preuves
  }
}
```

### 2. Query Engine

```typescript
async function queryGraph(userQuery: string): Promise<GraphContext> {
  // 1. Extraire les concepts cles de la query
  const concepts = extractConcepts(userQuery)
  // ["Stripe", "Next.js", "integration"]

  // 2. Trouver les noeuds correspondants
  const nodes = await mcp__memory__search_nodes({
    query: concepts.join(' ')
  })

  // 3. Recuperer les relations
  const subgraph = await expandSubgraph(nodes, depth=2)

  // 4. Filtrer par pertinence et confiance
  const relevant = subgraph
    .filter(n => n.properties.confidence > 0.7)
    .sort((a, b) => b.properties.confidence - a.properties.confidence)

  return {
    nodes: relevant,
    patterns: extractPatterns(relevant),
    antiPatterns: extractAntiPatterns(relevant),
    context: buildContext(relevant)
  }
}
```

### 3. Response Grounding

```typescript
async function generateGroundedResponse(
  query: string,
  graphContext: GraphContext
): Promise<string> {
  // Construire le prompt avec ancrage
  const prompt = `
    QUERY: ${query}

    VERIFIED KNOWLEDGE (from ${graphContext.nodes.length} sources):
    ${graphContext.context}

    BEST PRACTICES TO FOLLOW:
    ${graphContext.patterns.map(p => `- ${p.name}: ${p.description}`).join('\n')}

    ANTI-PATTERNS TO AVOID:
    ${graphContext.antiPatterns.map(a => `- ${a.name}: ${a.description}`).join('\n')}

    Generate a response that:
    1. Is grounded in the verified knowledge above
    2. Follows the best practices listed
    3. Avoids the anti-patterns
    4. Cites specific patterns when relevant
    5. Indicates confidence level
  `

  return generateWithClaude(prompt)
}
```

---

## Patterns de Query

### Pattern 1: Direct Entity Lookup

```typescript
// "Comment utiliser Supabase RLS?"
const result = await queryGraph("Supabase RLS")
// Returns: RLS-First pattern, policy examples, common errors
```

### Pattern 2: Relation Traversal

```typescript
// "Qu'est-ce qui peut causer des problemes avec Server Components?"
const result = await traverseRelations("Server-Components", "CAUSES")
// Returns: Hydration-Mismatch, Client-Directive-Missing, etc.
```

### Pattern 3: Solution Discovery

```typescript
// "Comment resoudre l'erreur X?"
const error = await findNode("Error-X")
const solutions = await traverseRelations(error.id, "SOLVES", inverse=true)
// Returns: Patterns qui resolvent cette erreur
```

### Pattern 4: Compatibility Check

```typescript
// "Next.js 15 est-il compatible avec React 18?"
const conflicts = await checkConflicts("Next.js-15", "React-18")
// Returns: { compatible: false, reason: "Requires React 19" }
```

---

## Exemples Concrets

### Exemple 1: Integration Stripe

**Query:** "Comment integrer Stripe avec Next.js 15?"

**Graph Query Result:**
```yaml
Nodes:
  - Stripe (Technology, confidence: 0.95)
  - Next.js-15 (Technology, confidence: 0.98)
  - Server-Actions-Pattern (Pattern, confidence: 0.92)
  - Webhook-Verification (Pattern, confidence: 0.89)

Relations:
  - Stripe USES Server-Actions-Pattern
  - Next.js-15 IMPROVES Server-Actions-Pattern
  - Stripe REQUIRES Webhook-Verification

AntiPatterns:
  - Client-Side-Secret (confidence: 0.99)
    "Ne jamais exposer la cle secrete Stripe cote client"
```

**Grounded Response:**
```
Pour integrer Stripe avec Next.js 15:

1. **Utiliser Server Actions** (confiance 92%)
   Les Server Actions sont le pattern recommande pour les operations Stripe.

2. **Webhook Verification obligatoire** (confiance 89%)
   Toujours verifier la signature des webhooks Stripe.

ATTENTION - Anti-pattern a eviter:
- Ne JAMAIS mettre la cle secrete Stripe cote client

Sources: 47 episodes valides, derniere verification: aujourd'hui
```

### Exemple 2: Erreur TypeScript

**Query:** "Erreur 'Type undefined is not assignable'"

**Graph Query Result:**
```yaml
Nodes:
  - Undefined-Type-Error (Error, confidence: 0.97)
  - Optional-Chaining-Pattern (Solution, confidence: 0.94)
  - Nullish-Coalescing-Pattern (Solution, confidence: 0.91)
  - Strict-Mode (Pattern, confidence: 0.88)

Relations:
  - Optional-Chaining-Pattern SOLVES Undefined-Type-Error
  - Nullish-Coalescing-Pattern SOLVES Undefined-Type-Error
  - Strict-Mode CAUSES Undefined-Type-Error (detects it)
```

**Grounded Response:**
```
L'erreur "Type undefined is not assignable" a 2 solutions verifiees:

1. **Optional Chaining** (confiance 94%)
   `user?.profile?.name` au lieu de `user.profile.name`

2. **Nullish Coalescing** (confiance 91%)
   `value ?? defaultValue` pour les valeurs par defaut

Ces solutions sont basees sur 23 episodes avec 100% de succes.
```

---

## Maintenance du Graphe

### Ajout de Connaissances

```typescript
// Apres un episode reussi
async function updateGraphFromEpisode(episode: Episode) {
  if (episode.event.type === 'success') {
    // Renforcer le pattern utilise
    await strengthenPattern(episode.resolution.pattern)
  }

  if (episode.event.type === 'error') {
    // Ajouter/renforcer l'anti-pattern
    await addAntiPattern(episode.event.description)
  }
}
```

### Deprecation

```typescript
// Quand une technologie evolue
async function deprecateNode(nodeId: string, replacement: string) {
  await mcp__memory__create_relations({
    relations: [{
      from: replacement,
      to: nodeId,
      relationType: "REPLACES"
    }]
  })

  // Reduire la confiance du noeud obsolete
  await updateNodeConfidence(nodeId, 0.3)
}
```

### Nettoyage

```typescript
// Supprimer les noeuds non utilises
async function pruneGraph() {
  const nodes = await getAllNodes()
  const unused = nodes.filter(n =>
    n.properties.episode_count === 0 &&
    n.properties.last_verified < oneMonthAgo()
  )
  await removeNodes(unused)
}
```

---

## Metriques de Qualite

| Metrique | Seuil | Action si echec |
|----------|-------|-----------------|
| Confiance moyenne | > 0.8 | Consolider plus d'episodes |
| Noeuds orphelins | < 5% | Creer relations ou supprimer |
| Age moyen verification | < 30j | Re-verifier noeuds anciens |
| Query hit rate | > 90% | Enrichir le graphe |

---

## Integration MCP Memory

```typescript
// Structure recommandee dans MCP Memory
ULTRA-CREATE-SYSTEM-v14
├── KNOWLEDGE-GRAPH
│   ├── TECHNOLOGIES
│   │   ├── FRONTEND (Next.js, React, Vue...)
│   │   ├── BACKEND (Supabase, Prisma...)
│   │   └── DEVOPS (Vercel, Docker...)
│   ├── PATTERNS
│   │   ├── ARCHITECTURAL (Server-Components, API-Routes...)
│   │   ├── SECURITY (RLS, Auth, Encryption...)
│   │   └── PERFORMANCE (Caching, SSG, ISR...)
│   ├── ANTI-PATTERNS
│   │   ├── SECURITY (Exposed-Secrets, No-Validation...)
│   │   └── PERFORMANCE (N+1-Queries, No-Caching...)
│   └── ERRORS
│       ├── TYPESCRIPT (Type-Errors, Strict-Mode...)
│       ├── RUNTIME (Hydration, SSR...)
│       └── BUILD (Compilation, Dependencies...)
```

---

## Best Practices

1. **Toujours query avant generation** - Ne jamais generer sans consulter le graphe
2. **Citer les sources** - Mentionner le nombre d'episodes et la confiance
3. **Signaler l'incertitude** - Si confiance < 0.7, le mentionner explicitement
4. **Mettre a jour apres chaque session** - Le graphe doit rester frais
5. **Valider les anti-patterns** - Un anti-pattern confirme vaut 10 best practices

---

**"Chaque reponse est ancree dans l'experience reelle, pas dans l'imagination."**
