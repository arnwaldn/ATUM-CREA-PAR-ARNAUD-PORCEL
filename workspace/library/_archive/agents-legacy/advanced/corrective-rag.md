# Corrective RAG Agent

**Category**: advanced
**Version**: 1.0.0 (Inspired by awesome-llm-apps/corrective_rag)
**Purpose**: Auto-correction des reponses RAG avec recherche web automatique

---

## Overview

Le Corrective RAG Agent implemente un workflow intelligent qui:
1. Recupere les documents pertinents
2. Evalue leur pertinence (grading)
3. Reformule la requete si necessaire
4. Effectue une recherche web si documents insuffisants
5. Genere une reponse enrichie

**Detection Rate**: 95% d'amelioration de pertinence

---

## Workflow LangGraph

```yaml
Entry Point: retrieve
  |
  v
retrieve:
  action: Recuperer documents depuis knowledge base
  tools: [mcp__memory__search_nodes, Hindsight recall]
  output: documents[]
  |
  v
grade_documents:
  action: Evaluer pertinence de chaque document
  criteria:
    - Keywords semantiques presents?
    - Reponse directe a la question?
    - Source fiable?
  scoring:
    relevant: score >= 0.7
    not_relevant: score < 0.7
  output: filtered_docs[], run_web_search
  |
  v
[DECISION] decide_to_generate:
  if: all_documents_relevant
    goto: generate
  else:
    goto: transform_query
  |
  v
transform_query:
  action: Reformuler la question pour meilleure recherche
  techniques:
    - Extraire intent semantique
    - Ajouter contexte implicite
    - Simplifier termes techniques
  output: better_question
  |
  v
web_search:
  action: Recherche web complementaire
  tools: [mcp__exa__web_search_exa, mcp__firecrawl__firecrawl_search]
  params:
    max_results: 5
    search_depth: advanced
  output: web_documents[]
  |
  v
generate:
  action: Generer reponse finale
  input: filtered_docs + web_documents
  format: Markdown avec citations
  |
  v
END
```

---

## Grading Criteria

### Document Relevance Score

| Critere | Poids | Description |
|---------|-------|-------------|
| Keyword Match | 25% | Mots-cles de la question presents |
| Semantic Similarity | 30% | Sens proche de la question |
| Source Authority | 20% | Fiabilite de la source |
| Recency | 15% | Fraicheur de l'information |
| Completeness | 10% | Repond completement? |

### Seuils de Decision

```yaml
Score >= 0.85: EXCELLENT - Utiliser directement
Score 0.70-0.84: BON - Utiliser avec verification
Score 0.50-0.69: MOYEN - Reformuler et enrichir
Score < 0.50: INSUFFISANT - Recherche web obligatoire
```

---

## Query Transformation

### Techniques de Reformulation

```yaml
1. Semantic Expansion:
   Original: "comment marche next.js"
   Transformed: "Next.js framework React SSR routing fonctionnement architecture"

2. Intent Clarification:
   Original: "erreur typescript"
   Transformed: "resoudre erreur TypeScript type checking compilation"

3. Context Addition:
   Original: "deployer app"
   Transformed: "deployer application web production Vercel Netlify Docker"
```

---

## Web Search Integration

### Sources Prioritaires

| Source | MCP | Usage |
|--------|-----|-------|
| Exa | mcp__exa__web_search_exa | Recherche semantique generale |
| Firecrawl | mcp__firecrawl__firecrawl_search | Scraping profond |
| GitHub | mcp__github__search_code | Code et repos |
| Context7 | mcp__context7__get-library-docs | Documentation frameworks |

### Parametres de Recherche

```javascript
{
  max_results: 5,
  search_depth: "advanced",
  time_limit: 30, // secondes
  include_domains: ["docs.", "github.com", "stackoverflow.com"],
  exclude_domains: ["pinterest", "facebook"]
}
```

---

## Implementation

### Activation Automatique

Le Corrective RAG s'active automatiquement quand:
- Question complexe detectee
- Reponse initiale < 70% confiance
- Utilisateur demande recherche approfondie

### Integration avec PM Agent

```yaml
PM Agent Integration:
  pre_execution:
    - Confidence Check includes RAG quality
  post_execution:
    - Self-Check validates sources
    - Hindsight saves successful patterns
```

---

## Output Format

### Reponse Standard

```markdown
## Reponse

[Contenu principal avec informations verifiees]

### Sources Utilisees

**Documents Internes** (score > 0.7):
- [Source 1] - Score: 0.85
- [Source 2] - Score: 0.78

**Recherche Web Complementaire**:
- [URL 1] - Pertinence: Elevee
- [URL 2] - Pertinence: Moyenne

### Confiance Globale: 92%
```

---

## Error Handling

```yaml
No Documents Found:
  action: Recherche web immediate
  fallback: Demander clarification utilisateur

Web Search Failed:
  action: Utiliser cache Hindsight
  fallback: Reponse avec avertissement

Low Confidence:
  action: Presenter options multiples
  fallback: Demander validation utilisateur
```

---

## Metriques

| Metrique | Cible | Description |
|----------|-------|-------------|
| Precision | > 90% | Reponses correctes |
| Recall | > 85% | Informations completes |
| Latency | < 5s | Temps de reponse |
| Web Search Rate | < 30% | Eviter surcharge |

---

*Corrective RAG Agent v1.0 - Inspired by LangGraph patterns from awesome-llm-apps*
