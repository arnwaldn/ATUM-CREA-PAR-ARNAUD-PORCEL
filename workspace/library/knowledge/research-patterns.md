# Research Patterns - ULTRA-CREATE v27.1

> **Guide**: Patterns optimisés pour la recherche avec les MCPs existants (Firecrawl + Exa)
> **Objectif**: Équivalent Perplexity sans coût supplémentaire

---

## Stack Research Optimisée

```
RESEARCH STACK v27.1 (sans Perplexity):
├─ Firecrawl Agent  → Deep research autonome (DÉJÀ PAYÉ)
├─ Firecrawl Search → Recherche web + scraping (DÉJÀ PAYÉ)
├─ Exa             → Recherche code/IA (DÉJÀ PAYÉ)
├─ Context7        → Docs frameworks (GRATUIT)
├─ WebSearch       → Built-in Claude (GRATUIT)
└─ Hindsight       → Mémoire patterns (GRATUIT)
```

---

## Pattern 1: Deep Research Autonome

**Quand utiliser**: Questions complexes nécessitant synthèse multi-sources

```javascript
// Étape 1: Agent autonome (équivalent Perplexity)
mcp__firecrawl__firecrawl_agent({
  prompt: "Trouve les meilleures pratiques pour [sujet] en 2025",
  schema: {
    type: "object",
    properties: {
      practices: { type: "array", items: { type: "string" } },
      sources: { type: "array", items: { type: "string" } },
      summary: { type: "string" }
    }
  }
})

// Étape 2: Vérifier le status si async
mcp__firecrawl__firecrawl_agent_status({ id: "[job_id]" })
```

**Avantages**:
- Recherche autonome multi-sources
- Schema structuré pour extraction précise
- Pas d'URLs requises - description suffit

---

## Pattern 2: Recherche Web Rapide

**Quand utiliser**: Questions simples, résultats rapides

```javascript
// Option A: Exa (recommandé pour IA/code)
mcp__exa__web_search_exa({
  query: "[question]",
  numResults: 8,
  type: "auto"  // ou "fast" pour rapidité
})

// Option B: Firecrawl Search (avec scraping)
mcp__firecrawl__firecrawl_search({
  query: "[question]",
  limit: 5,
  scrapeOptions: {
    formats: ["markdown"],
    onlyMainContent: true
  }
})
```

---

## Pattern 3: Code Context (Développement)

**Quand utiliser**: Questions sur frameworks, librairies, APIs

```javascript
// Étape 1: Exa Code Context (fraîcheur maximale)
mcp__exa__get_code_context_exa({
  query: "Next.js 15 server actions authentication",
  tokensNum: 5000
})

// Étape 2: Context7 (docs officielles)
mcp__context7__resolve-library-id({
  query: "Next.js authentication",
  libraryName: "next.js"
})

mcp__context7__query-docs({
  libraryId: "/vercel/next.js",
  query: "server actions authentication"
})
```

---

## Pattern 4: Research + Extract Structuré

**Quand utiliser**: Besoin de données structurées (comparaisons, listes)

```javascript
// Étape 1: Map pour découvrir URLs
mcp__firecrawl__firecrawl_map({
  url: "https://example.com",
  limit: 50
})

// Étape 2: Extract structuré
mcp__firecrawl__firecrawl_extract({
  urls: ["url1", "url2", "url3"],
  prompt: "Extract product features and pricing",
  schema: {
    type: "object",
    properties: {
      name: { type: "string" },
      price: { type: "number" },
      features: { type: "array" }
    }
  }
})
```

---

## Pattern 5: Fallback Chain (Résilience)

**Quand utiliser**: Automatiquement si un MCP échoue

```
FALLBACK CHAIN (deepResearch):
1. firecrawl_agent     → Primary (deep research)
2. firecrawl_search    → Si agent unavailable
3. web_search_exa      → Si firecrawl fails
4. WebSearch           → Fallback gratuit final
```

---

## Comparaison: Firecrawl Agent vs Perplexity

| Fonctionnalité | Firecrawl Agent | Perplexity |
|----------------|-----------------|------------|
| Recherche autonome | ✅ | ✅ |
| Schema structuré | ✅ | ✅ |
| Citations sources | ✅ | ✅ |
| Deep research | ✅ | ✅ (sonar-deep-research) |
| Raisonnement | ❌ | ✅ (sonar-reasoning-pro) |
| Coût | **DÉJÀ PAYÉ** | API supplémentaire |

**Verdict**: Pour 90% des cas, Firecrawl Agent suffit.

---

## Workflow Recommandé par Type

### Recherche Générale
```
1. firecrawl_agent (question ouverte)
2. Synthèse des résultats
3. hindsight_retain (sauvegarder pour futur)
```

### Recherche Code/Dev
```
1. exa:get_code_context (fraîcheur)
2. context7 (docs officielles)
3. firecrawl_search (si besoin exemples réels)
```

### Veille Concurrentielle
```
1. firecrawl_map (découvrir pages)
2. firecrawl_extract (données structurées)
3. exa:web_search (contexte marché)
```

### Inspiration UI/Design
```
1. firecrawl_search (query: "best [type] design 2025")
2. firecrawl_scrape (pages spécifiques)
   → formats: ["branding"] pour identité visuelle
```

---

## Optimisations Performance

### Cache avec maxAge
```javascript
// Réutiliser contenu récent (500% plus rapide)
mcp__firecrawl__firecrawl_scrape({
  url: "https://docs.example.com",
  maxAge: 172800000  // 48h en ms
})
```

### Limiter les résultats
```javascript
// Pour recherche rapide
{ limit: 5 }  // au lieu de 10+

// Pour scraping ciblé
{ onlyMainContent: true }
```

### Parallel Searches
```javascript
// Lancer plusieurs recherches en parallèle
Promise.all([
  firecrawl_search({ query: "aspect 1" }),
  exa_search({ query: "aspect 2" }),
  context7_docs({ query: "aspect 3" })
])
```

---

## Auto-Activation

Ce fichier est auto-chargé quand les mots-clés suivants sont détectés:
- `research`, `recherche`
- `deep research`, `recherche approfondie`
- `firecrawl`, `exa`
- `compare`, `analyze`
- `best practices`, `meilleures pratiques`

---

*v27.1 - Optimisation Research Stack (0€ coût supplémentaire)*
