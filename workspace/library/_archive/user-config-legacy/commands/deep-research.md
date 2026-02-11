---
description: Recherche Firecrawl approfondie multi-hop (user)
---

# /deep-research - Multi-Hop Deep Research

## USAGE
```
/deep-research "RAG implementation best practices"
/deep-research "Next.js 15 server components" --depth=3
/deep-research "authentication patterns 2025" --sources=5
```

## DESCRIPTION
Recherche approfondie utilisant Firecrawl pour explorer
plusieurs niveaux de liens (multi-hop crawling).

## WORKFLOW

### 1. Recherche initiale
```javascript
// Trouver sources principales
mcp__firecrawl__firecrawl_search({
  query: topic,
  limit: sources || 10,
  scrapeOptions: { formats: ['markdown'] }
})
```

### 2. Crawl profond (multi-hop)
Pour chaque source pertinente:
```javascript
mcp__firecrawl__firecrawl_crawl({
  url: sourceUrl,
  maxDiscoveryDepth: depth || 2,
  limit: 20,
  scrapeOptions: {
    formats: ['markdown'],
    onlyMainContent: true
  }
})
```

### 3. Extraction structuree
```javascript
mcp__firecrawl__firecrawl_extract({
  urls: [crawledUrls],
  prompt: `Extract key information about: ${topic}`,
  schema: {
    type: "object",
    properties: {
      main_concepts: { type: "array" },
      best_practices: { type: "array" },
      code_examples: { type: "array" },
      warnings: { type: "array" },
      sources: { type: "array" }
    }
  }
})
```

### 4. Synthese
```yaml
research_synthesis:
  topic: "${topic}"
  sources_analyzed: N
  pages_crawled: M

  findings:
    main_concepts:
      - concept1: explanation
      - concept2: explanation

    best_practices:
      - practice: description
        source: url

    code_patterns:
      - pattern: name
        code: |
          // example

    warnings:
      - warning: description

  recommendations:
    - action1
    - action2

  sources:
    - title: "..."
      url: "..."
      relevance: high/medium
```

### 5. Sauvegarde Hindsight
```javascript
mcp__hindsight__hindsight_retain({
  bank: 'research',
  content: synthesisFinal,
  context: `Deep research: ${topic}`
})
```

## OPTIONS
| Option | Description |
|--------|-------------|
| --depth=N | Profondeur crawl (1-3, default: 2) |
| --sources=N | Nombre sources initiales (default: 10) |
| --focus="X" | Concentrer sur aspect specifique |
| --save | Sauvegarder automatiquement |

## VS /research
| Aspect | /research | /deep-research |
|--------|-----------|----------------|
| Sources | Multi-sources rapide | Firecrawl deep |
| Profondeur | Surface | Multi-hop |
| Temps | 30-60 sec | 2-5 min |
| Usage | Inspiration rapide | Analyse complete |

## MCP UTILISES
- Firecrawl (crawl, search, extract)
- Hindsight (sauvegarde research)
