---
description: Debugging systematique (user)
---

# /debug - Systematic Debugging

## USAGE
```
/debug "TypeError: Cannot read property 'x' of undefined"
/debug file "src/api/users.ts:45"
/debug trace "error-id-123"
/debug performance "slow query"
```

## MODES

### error (default)
Debugger une erreur specifique
```
/debug "CORS error on API call"
```

### file
Debugger a partir d'un fichier/ligne
```
/debug file "src/components/Form.tsx:127"
```

### trace
Suivre un trace/stack
```
/debug trace "stack trace here..."
```

### performance
Problemes de performance
```
/debug performance "page loads slowly"
```

## WORKFLOW SYSTEMATIQUE

### 1. Recherche memoire
```javascript
// Chercher erreurs similaires deja resolues
mcp__hindsight__hindsight_recall({
  bank: 'errors',
  query: errorMessage,
  top_k: 5
})
```

### 2. Analyse contexte
- Lire fichier concerne
- Identifier dependencies
- Verifier versions

### 3. Hypotheses
```yaml
hypotheses:
  - hypothesis: "Variable non initialisee"
    probability: high
    test: "Ajouter console.log avant usage"

  - hypothesis: "Race condition async"
    probability: medium
    test: "Verifier ordre des await"

  - hypothesis: "Import circulaire"
    probability: low
    test: "Tracer les imports"
```

### 4. Tests systematiques
Tester chaque hypothese dans l'ordre

### 5. Solution + Prevention
```yaml
debug_result:
  error: "${errorMessage}"
  root_cause: "Variable user undefined car fetch echoue silencieusement"

  solution:
    description: "Ajouter error handling au fetch"
    code: |
      try {
        const user = await fetchUser(id)
        if (!user) throw new Error('User not found')
      } catch (e) {
        console.error('Failed to fetch user:', e)
        return null
      }

  prevention:
    - "Toujours verifier null/undefined"
    - "Ajouter error boundaries React"
    - "Logger les erreurs API"
```

### 6. Sauvegarde Hindsight
```javascript
mcp__hindsight__hindsight_retain({
  bank: 'errors',
  content: debugResult,
  context: 'Debug session'
})
```

## ERREURS COMMUNES

| Erreur | Cause Frequente |
|--------|-----------------|
| undefined is not a function | Import incorrect |
| Cannot read property of null | Async non await |
| CORS error | Headers manquants |
| 404 on API | Route incorrecte |
| Hydration mismatch | SSR vs client |
| Memory leak | Event listeners |

## OPTIONS
| Option | Description |
|--------|-------------|
| --verbose | Logs detailles |
| --step | Mode pas a pas |
| --bisect | Git bisect auto |

## OUTILS DEBUG

### Console
```javascript
console.log('Value:', value)
console.table(array)
console.trace('Call stack')
console.time('operation')
```

### Breakpoints (conceptuel)
```typescript
// debugger; // Pause here
if (condition) {
  console.log('Breakpoint:', { state, props })
}
```

### React DevTools
- Component tree
- Props/State
- Profiler

## MCP UTILISES
- Hindsight (erreurs passees)
- Read (fichiers source)
- Bash (logs, git)
