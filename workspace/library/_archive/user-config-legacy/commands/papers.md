---
description: Recherche ArXiv papers scientifiques (user)
---

# /papers - ArXiv Research

## USAGE
```
/papers "large language models agents"
/papers "RAG retrieval" --category="cs.CL" --since="2024"
/papers "transformer architecture" --top=5
```

## WORKFLOW

### 1. Recherche ArXiv API
```javascript
// Via Exa ou Firecrawl
mcp__exa__web_search_exa({
  query: `site:arxiv.org ${query} ${category || ''} ${year || ''}`,
  numResults: top || 10
})
```

### 2. Pour chaque paper trouve
Extraire:
- Titre
- Auteurs
- Date publication
- Abstract
- Categories
- URL PDF

### 3. Analyse rapide (top 3-5 papers)
Pour les papers les plus pertinents:
- Lire abstract complet
- Identifier methodologie
- Extraire contributions principales
- Noter applicabilite pratique

### 4. Synthese
```yaml
papers_analysis:
  query: "${query}"
  total_found: N
  top_papers:
    - title: "..."
      authors: [...]
      year: 2024
      key_contribution: "..."
      methodology: "..."
      applicability: "..."
  synthesis:
    main_trends: [...]
    practical_applications: [...]
    recommended_reading: [paper1, paper2]
```

### 5. Sauvegarde Hindsight
```javascript
mcp__hindsight__hindsight_retain({
  bank: 'research',
  content: synthesisYaml,
  context: `ArXiv search: ${query}`
})
```

## OPTIONS
| Option | Description |
|--------|-------------|
| --category="cs.AI" | Filtrer par categorie ArXiv |
| --since="2024" | Papers depuis annee |
| --top=N | Nombre de resultats (default: 10) |
| --deep | Analyse approfondie des top 3 |

## CATEGORIES ARXIV COMMUNES
- cs.AI - Artificial Intelligence
- cs.CL - Computation and Language
- cs.LG - Machine Learning
- cs.CV - Computer Vision
- cs.SE - Software Engineering

## MCP UTILISES
- Exa (recherche web)
- Firecrawl (scraping si necessaire)
- Hindsight (sauvegarde bank=research)
