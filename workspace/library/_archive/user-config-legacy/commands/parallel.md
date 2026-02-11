---
description: "Execution parallele de plusieurs taches simultanees"
---

# Mode PARALLEL Active

Taches paralleles: **$ARGUMENTS**

## WORKFLOW

1. **Task Decomposer** - Diviser en sous-taches independantes
2. **Queen v18** - Orchestrer les workers
3. **Parallel Executor v18** - Execution (jusqu'a 25 agents)
4. **Merge** - Fusionner les resultats
5. **Self Checker** - Validation globale

## AGENTS IMPLIQUES

| Role | Agent |
|------|-------|
| Primary | `parallel-executor-v18` |
| Secondary | `queen-v18`, `task-decomposer` |

## MCPs REQUIS

- `git` - Gestion branches paralleles

## CAPACITES

| Metrique | Valeur |
|----------|--------|
| Max Agents | 25 simultanement |
| Speedup | Jusqu'a 10x |
| Coordination | Queen v18 |

## SYNTAXE

```
/parallel 'tache1' + 'tache2' + 'tache3'
```

## EXEMPLES

```
/parallel 'refactor auth' + 'add tests' + 'update docs'
/parallel 'build frontend' + 'build backend' + 'run tests'
/parallel 'analyze src' + 'security scan' + 'perf audit'
```

## REGLES DE PARALLELISATION

### Taches Parallelisables
- Independantes (pas de dependances mutuelles)
- Fichiers differents
- Modules separes

### Taches Sequentielles (NON parallelisables)
- Dependances entre taches
- Meme fichier modifie
- Ordre critique

## COORDINATION

```
       Queen v18 (Orchestrateur)
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
 Worker 1  Worker 2  Worker 3
    │         │         │
    └─────────┼─────────┘
              │
              ▼
        Merge Results
```

## GESTION CONFLITS

- Detection automatique de conflits
- Resolution intelligente
- Fallback vers sequentiel si necessaire

## GO!

Decompose et execute les taches en parallele.
