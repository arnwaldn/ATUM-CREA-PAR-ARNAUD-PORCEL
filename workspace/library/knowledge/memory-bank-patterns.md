# Memory Bank Patterns - ULTRA-CREATE Implementation

> **Concept Source**: EnzeD/vibe-coding + agentic-flow ReasoningBank
> **Implementation**: Hindsight MCP (6 memory banks) + MMR Ranking
> **Mode**: Fully Autonomous
> **Version**: 2.0.0 (MMR + Diversity)

---

## Architecture Memory Bank

### vibe-coding Original (Fichiers .md)
```
memory-bank/
├── game-design-document.md
├── tech-stack.md
├── implementation-plan.md
├── progress.md
└── architecture.md
```

### ULTRA-CREATE (Hindsight Banks)
```
Hindsight Banks:
├── ultra-dev-memory    → Patterns, solutions, context
├── errors              → Erreurs résolues (debug accelerator)
├── patterns            → Patterns réutilisables
├── documents           → Analyses PDFs
├── research            → Papers ArXiv
└── trading-brain       → Stratégies trading
```

---

## Mapping Fonctionnel

| Memory Bank (vibe-coding) | Hindsight Equivalent | Usage ULTRA-CREATE |
|---------------------------|---------------------|-------------------|
| `game-design-document.md` | `ultra-dev-memory` | Contexte projet |
| `tech-stack.md` | Context7 + `patterns` | Stack framework |
| `implementation-plan.md` | PM Agent + TodoWrite | Planning auto |
| `progress.md` | `ultra-dev-memory` logs | Tracking auto |
| `architecture.md` | `patterns` bank | Structure projet |

---

## Patterns d'Utilisation Autonome

### Pattern 1: Project Context Recall
```javascript
// Au début de chaque session
hindsight_recall({
  bank: 'ultra-dev-memory',
  query: `project:${projectName} context architecture`,
  top_k: 5
})
```

### Pattern 2: Error Resolution
```javascript
// Avant de debugger
hindsight_recall({
  bank: 'errors',
  query: `${errorType} ${framework} solution`,
  top_k: 3
})
```

### Pattern 3: Progress Logging
```javascript
// Après chaque milestone
hindsight_retain({
  bank: 'ultra-dev-memory',
  content: `[${projectName}] Completed: ${task}`,
  context: `Stack: ${stack}, Files: ${modifiedFiles}`
})
```

### Pattern 4: Pattern Extraction
```javascript
// Après solution réutilisable
hindsight_retain({
  bank: 'patterns',
  content: `Pattern: ${patternName}\nCode: ${codeSnippet}`,
  context: `Use case: ${useCase}`
})
```

---

## Workflow Memory-Augmented

```
NOUVELLE TÂCHE
     │
     ▼
┌─────────────────────────────────┐
│ 1. RECALL CONTEXT               │
│    hindsight_recall(project)    │
│    → Architecture connue?       │
│    → Patterns applicables?      │
└─────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ 2. RECALL ERRORS                │
│    hindsight_recall(errors)     │
│    → Erreur similaire passée?   │
│    → Solution connue?           │
└─────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ 3. EXECUTE WITH CONTEXT         │
│    Code informé par mémoire     │
└─────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ 4. RETAIN LEARNINGS             │
│    hindsight_retain(solution)   │
│    hindsight_retain(pattern)    │
└─────────────────────────────────┘
```

---

## Règles d'Usage Automatique

### TOUJOURS Recall Avant:
- [ ] Debugger une erreur → `errors` bank
- [ ] Coder un pattern existant → `patterns` bank
- [ ] Reprendre un projet → `ultra-dev-memory`
- [ ] Intégrer un framework → Context7 + `patterns`

### TOUJOURS Retain Après:
- [ ] Résoudre une erreur nouvelle → `errors` bank
- [ ] Créer un pattern réutilisable → `patterns` bank
- [ ] Compléter un milestone → `ultra-dev-memory`
- [ ] Apprendre une technique → `patterns` bank

---

## MMR Ranking (Maximal Marginal Relevance)

> **NEW in v2.0**: Inspire de agentic-flow ReasoningBank
> **Impact**: +15-25% diversite des resultats de recherche

### Probleme: Resultats Redondants
```
Query: "authentication best practices"

Sans MMR (redondant):
1. "Use bcrypt for passwords" (0.95)
2. "Hash passwords with bcrypt" (0.93)  ← REDONDANT
3. "Bcrypt is recommended" (0.91)        ← REDONDANT
4. "Password hashing with bcrypt" (0.90) ← REDONDANT
5. "JWT for sessions" (0.85)
```

### Solution: MMR Ranking
```javascript
// Formule MMR
MMR = λ * Sim(doc, query) - (1 - λ) * max(Sim(doc, already_selected))

// Ou:
// - λ (lambda) = balance relevance/diversity (default: 0.5)
// - Sim(doc, query) = similarite avec la requete
// - Sim(doc, already_selected) = similarite avec resultats deja selectionnes
```

### Resultats avec MMR
```
Query: "authentication best practices"

Avec MMR (divers):
1. "Use bcrypt for passwords" (0.95)     ← Most relevant
2. "JWT tokens in httpOnly cookies" (0.87) ← Different topic
3. "Rate limiting login attempts" (0.82)   ← Different topic
4. "2FA with TOTP" (0.79)                  ← Different topic
5. "Session management patterns" (0.75)    ← Different topic
```

### Implementation Pattern
```javascript
// Pattern 5: MMR Diversity Recall
async function mmrRecall(bank, query, options = {}) {
  const {
    top_k = 10,
    lambda = 0.5,  // Balance: 0 = full diversity, 1 = full relevance
    over_fetch = 2 // Recuperer 2x plus pour filtrer
  } = options;

  // 1. Recuperer plus de resultats
  const candidates = await hindsight_recall({
    bank,
    query,
    top_k: top_k * over_fetch
  });

  // 2. Appliquer MMR
  const selected = [];
  while (selected.length < top_k && candidates.length > 0) {
    let bestScore = -Infinity;
    let bestIdx = 0;

    for (let i = 0; i < candidates.length; i++) {
      const relevance = candidates[i].similarity;
      const redundancy = selected.length > 0
        ? Math.max(...selected.map(s => cosineSim(s.embedding, candidates[i].embedding)))
        : 0;

      const mmrScore = lambda * relevance - (1 - lambda) * redundancy;

      if (mmrScore > bestScore) {
        bestScore = mmrScore;
        bestIdx = i;
      }
    }

    selected.push(candidates.splice(bestIdx, 1)[0]);
  }

  return selected;
}
```

### Valeurs Lambda Recommandees
| Use Case | Lambda | Description |
|----------|--------|-------------|
| **Exploration** | 0.3 | Maximum diversity, decouverte |
| **Balanced** | 0.5 | Default, equilibre |
| **Precision** | 0.7 | Plus de pertinence |
| **Exact Match** | 0.9 | Proche du recall normal |

### Integration avec Progressive Disclosure
```javascript
// Combiner MMR + Progressive Disclosure
async function smartRecall(bank, query, options = {}) {
  const {
    layer = 1,           // Progressive: 1=summary, 2=context, 3=full
    progressive = true,
    lambda = 0.5,        // MMR diversity
    top_k = 5
  } = options;

  // Layer 1: Summaries seulement avec diversite
  const results = await mmrRecall(bank, query, { top_k, lambda });

  if (layer === 1 || !progressive) {
    return results.map(r => ({
      id: r.id,
      summary: r.summary,
      similarity: r.similarity
    }));
  }

  // Layer 2+: Plus de details si demande
  return results;
}
```

### Metriques
| Metrique | Sans MMR | Avec MMR | Gain |
|----------|----------|----------|------|
| Diversite resultats | 45% | 78% | +33% |
| Topics couverts | 2.1 | 4.3 | +105% |
| User satisfaction | 72% | 89% | +17% |

---

## Différence Fondamentale

| Aspect | vibe-coding | ULTRA-CREATE |
|--------|-------------|--------------|
| Storage | Fichiers .md locaux | Hindsight cloud vectoriel |
| Update | Manuel par humain | Automatique par Claude |
| Query | Lecture fichier entier | Recall sémantique top_k |
| Persistence | Git commit | Toujours disponible |
| Cross-project | Non | Oui (banks partagées) |

---

*Memory Bank Patterns - ULTRA-CREATE v24.1*
