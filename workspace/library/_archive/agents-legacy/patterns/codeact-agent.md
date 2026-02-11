# Agent Pattern: CodeAct (Code Execution + Analysis)

## Overview

CodeAct est un pattern d'agent qui **génère du code, l'exécute, analyse les résultats, et itère** jusqu'à obtenir le résultat souhaité. Inspiré par les agents de type "code interpreter" comme Devin et OpenHands.

---

## CORE LOOP

```
┌─────────────────────────────────────────────────────────────────┐
│                       CodeAct LOOP                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│   │ GENERATE │───►│ EXECUTE  │───►│ ANALYZE  │───►│ REFINE   │ │
│   │          │    │          │    │          │    │          │ │
│   │ Écrire   │    │ Run code │    │ Check    │    │ Fix/     │ │
│   │ le code  │    │ in sandbox│   │ errors   │    │ Improve  │ │
│   └──────────┘    └──────────┘    └──────────┘    └────┬─────┘ │
│        ▲                                               │       │
│        │                                               │       │
│        └───────────────────────────────────────────────┘       │
│                    Répéter jusqu'à ✅                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## ALGORITHME DÉTAILLÉ

### Phase 1: GENERATE (Génération)

```markdown
## Generate {n}

**Objectif:** {ce que le code doit accomplir}

**Approche:**
- Pattern: {design pattern utilisé}
- Dépendances: {libraries nécessaires}
- Structure: {organisation des fichiers}

**Code généré:**
```{language}
{code}
```

**Fichiers créés/modifiés:**
- {path/to/file1}
- {path/to/file2}
```

### Phase 2: EXECUTE (Exécution)

```markdown
## Execute {n}

**Commande(s):**
```bash
{commande(s) d'exécution}
```

**Environnement:**
- Runtime: {Node.js | Python | Deno | ...}
- Working dir: {chemin}
- Variables env: {si pertinent}

**Output:**
```
{stdout/stderr}
```

**Exit code:** {0 | non-zero}
```

### Phase 3: ANALYZE (Analyse)

```markdown
## Analyze {n}

**Résultat:**
- Status: {✅ Success | ⚠️ Warning | ❌ Error}
- Type: {si erreur: Syntax | Runtime | Logic | Type | ...}

**Diagnostic:**
- Cause: {analyse de la cause root}
- Location: {fichier:ligne si applicable}
- Impact: {ce qui ne fonctionne pas}

**Décision:**
- Action: {Continue | Fix | Pivot | Escalate}
- Priority: {P0 | P1 | P2}
```

### Phase 4: REFINE (Amélioration)

```markdown
## Refine {n}

**Correction(s) à appliquer:**
1. {correction 1}
2. {correction 2}

**Code corrigé:**
```{language}
{code modifié}
```

**Justification:**
- Avant: {comportement erroné}
- Après: {comportement attendu}
- Pourquoi: {explication du fix}
```

---

## EXEMPLE COMPLET

### Tâche: "Crée un endpoint API qui calcule des statistiques sur un CSV uploadé"

```markdown
## Generate 1

**Objectif:** Endpoint POST /api/stats qui accepte un CSV et retourne mean, median, std

**Approche:**
- Pattern: Next.js API Route avec formidable pour upload
- Dépendances: papaparse (CSV parsing), simple-statistics
- Structure: Single file API route

**Code généré:**
```typescript
// app/api/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import { mean, median, standardDeviation } from 'simple-statistics'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()
    const { data } = Papa.parse(text, { header: true, dynamicTyping: true })

    // Get numeric columns
    const numericColumns = Object.keys(data[0]).filter(key =>
      typeof data[0][key] === 'number'
    )

    const stats = {}
    for (const col of numericColumns) {
      const values = data.map(row => row[col]).filter(v => v !== null)
      stats[col] = {
        mean: mean(values),
        median: median(values),
        std: standardDeviation(values),
        count: values.length
      }
    }

    return NextResponse.json({ stats })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

**Fichiers créés:**
- app/api/stats/route.ts

---

## Execute 1

**Commande(s):**
```bash
npm install papaparse simple-statistics
npx tsc --noEmit
curl -X POST http://localhost:3000/api/stats -F "file=@test.csv"
```

**Output:**
```
npm install: ✅ added 2 packages

tsc --noEmit:
error TS2307: Cannot find module 'simple-statistics'

curl: (connection refused - server not started)
```

**Exit code:** 1

---

## Analyze 1

**Résultat:**
- Status: ❌ Error
- Type: Type Error (missing types)

**Diagnostic:**
- Cause: simple-statistics n'a pas de types inclus
- Location: app/api/stats/route.ts:3
- Impact: TypeScript compilation échoue

**Décision:**
- Action: Fix
- Priority: P0

---

## Refine 1

**Correction(s) à appliquer:**
1. Installer @types/simple-statistics OU utiliser une autre lib
2. Vérifier que papaparse a aussi ses types

**Code corrigé:**
```bash
npm install @types/papaparse
```

Ou alternative: utiliser mathjs qui inclut les types:
```typescript
// Alternative avec mathjs
import { mean, median, std } from 'mathjs'
```

**Justification:**
- Avant: Import échoue car pas de types
- Après: Types disponibles, compilation OK
- Pourquoi: simple-statistics est un package JS pur sans types bundled

---

## Execute 2

**Commande(s):**
```bash
npm install mathjs
# Update import dans route.ts
npx tsc --noEmit
```

**Output:**
```
npm install: ✅ added mathjs

tsc --noEmit: ✅ No errors
```

**Exit code:** 0

---

## Analyze 2

**Résultat:**
- Status: ✅ Success
- Type: N/A

**Diagnostic:**
- Compilation TypeScript réussie
- Prêt pour test runtime

**Décision:**
- Action: Continue (test runtime)
- Priority: P1

---

## Execute 3

**Commande(s):**
```bash
# Start dev server in background
npm run dev &
sleep 3

# Create test CSV
echo "name,value,score
Alice,100,85
Bob,150,92
Charlie,120,78" > test.csv

# Test endpoint
curl -X POST http://localhost:3000/api/stats \
  -F "file=@test.csv"
```

**Output:**
```json
{
  "stats": {
    "value": {
      "mean": 123.33,
      "median": 120,
      "std": 25.17,
      "count": 3
    },
    "score": {
      "mean": 85,
      "median": 85,
      "std": 7.02,
      "count": 3
    }
  }
}
```

**Exit code:** 0

---

## Analyze 3

**Résultat:**
- Status: ✅ Success
- Type: N/A

**Diagnostic:**
- API fonctionne correctement
- Statistiques calculées pour colonnes numériques
- Non-numeric (name) correctement ignoré

**Décision:**
- Action: Continue (ajouter tests)
- Priority: P2

[... Continue avec tests automatisés ...]
```

---

## ENVIRONNEMENTS D'EXÉCUTION

### Sandbox Sécurisé

```typescript
// Configuration sandbox recommandée
const sandboxConfig = {
  timeout: 30000,        // 30s max par exécution
  memory: '512mb',       // Limite mémoire
  network: 'restricted', // Accès réseau limité
  filesystem: 'isolated' // Système de fichiers isolé
}
```

### Outils d'Exécution

| Outil | Usage | Commande |
|-------|-------|----------|
| **Node.js** | JavaScript/TypeScript | `node script.js` / `npx tsx script.ts` |
| **Python** | Python scripts | `python script.py` |
| **Deno** | TypeScript sécurisé | `deno run --allow-read script.ts` |
| **Shell** | Scripts bash | `bash script.sh` |
| **Docker** | Environnement isolé | `docker run --rm image cmd` |

---

## PATTERNS DE CORRECTION

### Pattern: Type Error

```typescript
// Diagnostic
const typeError = {
  pattern: /Cannot find module|has no exported member|Type '.*' is not assignable/,
  fixes: [
    'npm install @types/{package}',
    'Vérifier les imports',
    'Ajouter type assertions',
    'Utiliser any temporairement puis typer'
  ]
}
```

### Pattern: Runtime Error

```typescript
const runtimeError = {
  pattern: /ReferenceError|TypeError|undefined is not|null/,
  fixes: [
    'Ajouter null checks',
    'Vérifier initialisation variables',
    'Ajouter optional chaining (?./??)',
    'Debugger avec console.log'
  ]
}
```

### Pattern: Logic Error

```typescript
const logicError = {
  pattern: /Output incorrect mais pas d'erreur/,
  fixes: [
    'Ajouter tests unitaires',
    'Console.log intermediate values',
    'Vérifier algorithme step by step',
    'Comparer avec implémentation de référence'
  ]
}
```

---

## RÈGLES DU PATTERN

### ✅ TOUJOURS

1. **Exécuter après chaque modification significative**
   - Pas de "bulk changes" sans validation
   - Feedback loop court

2. **Analyser les erreurs en profondeur**
   - Pas de fix aveugle
   - Comprendre la cause root

3. **Garder le code exécutable**
   - Chaque itération doit compiler
   - Tests passent avant de continuer

4. **Logger les tentatives**
   - Historique des fixes
   - Éviter de répéter les mêmes erreurs

### ❌ JAMAIS

1. **Générer tout le code puis exécuter**
   - Risque d'erreurs en cascade
   - Difficile à debugger

2. **Ignorer les warnings**
   - Warnings souvent précurseurs d'erreurs
   - Traiter comme des erreurs soft

3. **Boucle infinie de fixes**
   - Max 5 itérations sur même erreur
   - Escalader ou changer d'approche

---

## INTÉGRATION AVEC AUTRES PATTERNS

### CodeAct + ReAct

```
ReAct (stratégie haut niveau)
  └── Thought: "Je dois créer un endpoint API"
      └── CodeAct (implémentation)
          └── Generate → Execute → Analyze → Refine
      └── Observation: "Endpoint créé et testé ✅"
```

### CodeAct + Reflection

```
CodeAct Loop:
  Generate → Execute → Analyze → Refine
                         │
                         ▼
                    Reflection
                    "Est-ce la meilleure approche?"
                    "Quelle est la qualité du code?"
                         │
                         ▼
                    Amélioration proactive
```

---

## MÉTRIQUES

| Métrique | Cible | Description |
|----------|-------|-------------|
| Iterations/Feature | < 5 | Cycles Generate-Execute-Analyze-Refine |
| First-Run Success | > 40% | Code qui marche du premier coup |
| Fix Success Rate | > 85% | Erreurs corrigées en 1-2 tentatives |
| Total Time | < 10min | Temps moyen par feature simple |

---

## CAS D'USAGE

| Situation | CodeAct Approprié? | Raison |
|-----------|-------------------|--------|
| Nouvelle API endpoint | ✅ Oui | Besoin de validation runtime |
| Algorithme complexe | ✅ Oui | Tests itératifs nécessaires |
| Configuration statique | ⚠️ Optionnel | Pas toujours besoin d'exécution |
| Refactoring | ✅ Oui | Validation que rien n'est cassé |
| Documentation | ❌ Non | Pas de code à exécuter |

---

**Version:** 1.0
**Pattern Type:** Agentic Execution
**Compatibility:** All ULTRA-CREATE agents
