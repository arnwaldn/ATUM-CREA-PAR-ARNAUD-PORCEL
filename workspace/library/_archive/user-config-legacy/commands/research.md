---
description: "Recherche multi-sources approfondie avec MCPs"
---

# Mode RESEARCH Active

Recherche approfondie sur: **$ARGUMENTS**

## SOURCES A UTILISER (dans cet ordre)

### 1. Context7 (Documentation Officielle)
```
Utilise mcp__context7__resolve-library-id puis mcp__context7__get-library-docs
```
- Documentation framework a jour
- Patterns officiels
- API reference

### 2. Exa (Code Examples)
```
Utilise mcp__exa__get_code_context_exa ou mcp__exa__web_search_exa
```
- Exemples de code reels
- Implementations similaires
- Best practices

### 3. Tavily (Articles Recents)
```
Utilise mcp__firecrawl__firecrawl_search
```
- Tutorials recents 2024-2025
- Articles de blog techniques
- Discussions Stack Overflow

### 4. Firecrawl (Deep Scrape)
```
Utilise mcp__firecrawl__firecrawl_scrape pour pages specifiques
```
- Scrape sites pertinents
- Documentation externe
- Exemples detailles

## FORMAT DE SORTIE

```markdown
# Recherche: [sujet]

## Resume
[2-3 phrases de synthese]

## Documentation Officielle (Context7)
[Points cles de la doc]

## Exemples de Code (Exa)
[Code examples trouves]

## Articles Recents (Tavily)
[Liens et points cles]

## Recommandations
[Ce que je recommande pour ton projet]

## Code Example Complet
[Si applicable, un exemple fonctionnel]
```

## REGLES

1. **Toujours commencer par Context7** - Doc officielle en premier
2. **Citer les sources** - Liens vers la documentation
3. **Code executable** - Pas de pseudo-code
4. **2025-ready** - Patterns actuels, pas legacy

## GO!

Lance la recherche avec Context7 en premier.
