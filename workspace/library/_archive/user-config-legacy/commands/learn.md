---
description: Sauvegarder pattern/apprentissage dans Hindsight (user)
---

# /learn - Save to Hindsight Memory

## USAGE
```
/learn "Pattern X resout probleme Y avec approche Z"
/learn --bank=errors "Erreur CORS fixee avec headers"
/learn --bank=patterns "Hook useDebounce pour inputs"
```

## DESCRIPTION
Commande rapide pour sauvegarder un apprentissage
dans la memoire Hindsight persistante.

## WORKFLOW

### 1. Detection automatique bank
Si --bank non specifie, detecter:
- Contient "erreur/error/bug/fix" → `errors`
- Contient "pattern/hook/util" → `patterns`
- Contient "paper/research/arxiv" → `research`
- Contient "pdf/doc/spec" → `documents`
- Sinon → `ultra-dev-memory`

### 2. Enrichissement contexte
Ajouter automatiquement:
- Date/heure
- Projet actuel (si detecte)
- Fichiers lies (si detectes)

### 3. Sauvegarde
```javascript
mcp__hindsight__hindsight_retain({
  bank: detectedBank,
  content: `
## ${title || 'Apprentissage'}
${content}

### Contexte
- Date: ${new Date().toISOString()}
- Projet: ${currentProject || 'N/A'}
- Tags: ${autoTags.join(', ')}
`,
  context: contextString
})
```

### 4. Confirmation
```yaml
saved:
  bank: "${bank}"
  summary: "${first50chars}..."
  tags: [auto, detected, tags]
  recall_query: "${suggestedQuery}"
```

## OPTIONS
| Option | Description |
|--------|-------------|
| --bank=X | Forcer banque (errors, patterns, etc) |
| --tags="a,b" | Tags manuels |
| --project="X" | Associer a projet |

## BANKS DISPONIBLES
| Bank | Usage |
|------|-------|
| `ultra-dev-memory` | General (default) |
| `errors` | Erreurs resolues |
| `patterns` | Patterns reutilisables |
| `documents` | PDFs analyses |
| `research` | Papers/recherches |
| `trading-brain` | Trading specifique |

## EXEMPLES

### Sauvegarder erreur
```
/learn --bank=errors "CORS error: Ajouter Access-Control-Allow-Origin header cote serveur. Fix: middleware cors() avec origin: '*' pour dev"
```

### Sauvegarder pattern
```
/learn --bank=patterns "useLocalStorage hook: useState + useEffect pour sync avec localStorage. Gerer SSR avec typeof window check"
```

### Sauvegarder general
```
/learn "Next.js 15 App Router: Utiliser 'use client' uniquement pour interactivite. Server Components par defaut pour perf"
```
