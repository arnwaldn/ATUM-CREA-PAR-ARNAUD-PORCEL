# ATUM CREA - Agents Registry (v3.1)

16 specialized subagents available for delegation via the Task tool.
Use `subagent_type` parameter to select the agent.

## Quick Reference

| Agent | When to Use | Speed |
|-------|-------------|-------|
| **Explore** | Find files, search code, understand structure | Fast (haiku) |
| **general-purpose** | Web research, complex multi-step tasks | Medium |
| **Plan** | Design implementation strategy | Medium |
| **architect** | System design, scalability decisions | Medium |
| **planner** | Complex feature planning, refactoring | Medium |
| **code-reviewer** | Review quality, security, maintainability | Medium |
| **refactor-cleaner** | Remove dead code, consolidate | Medium |
| **build-error-resolver** | Fix TypeScript/build errors (minimal diffs) | Fast |
| **tdd-guide** | Write tests first, then implement | Medium |
| **e2e-runner** | Playwright E2E tests, screenshots | Slow |
| **security-reviewer** | Security audit (auth, input, secrets) | Medium |
| **database-reviewer** | PostgreSQL optimization, schema, RLS | Medium |
| **doc-updater** | Update documentation, codemaps, READMEs | Medium |
| **go-build-resolver** | Fix Go build/vet errors (minimal diffs) | Fast |
| **go-reviewer** | Go code review (idiomatic, concurrency, perf) | Medium |
| **python-reviewer** | Python code review (PEP 8, type hints, security) | Medium |

## Detailed Registry

### Exploration & Research
| Agent | Purpose | Tools | Model |
|-------|---------|-------|-------|
| **Explore** | Fast codebase exploration, file search, keyword search | All | haiku |
| **general-purpose** | Complex multi-step research, web search, code search | All | default |

### Architecture & Planning
| Agent | Purpose | Tools | Model |
|-------|---------|-------|-------|
| **Plan** | Full implementation strategy with file writes (can execute) | All | default |
| **architect** | System design analysis, ADRs, trade-offs (read-only) | Read, Grep, Glob | default |
| **planner** | Feature breakdown, step ordering, dependency analysis (read-only + memory) | Read, Grep, Glob | default |

### Code Quality & Security
| Agent | Purpose | Tools | Model |
|-------|---------|-------|-------|
| **code-reviewer** | Code quality, security, maintainability review | Read, Grep, Glob, Bash | default |
| **go-reviewer** | Go code review: idiomatic patterns, concurrency, error handling | Read, Grep, Glob, Bash | default |
| **python-reviewer** | Python code review: PEP 8, type hints, security, Pythonic idioms | Read, Grep, Glob, Bash | default |
| **security-reviewer** | OWASP Top 10, secrets, SSRF, injection, crypto | Read, Write, Edit, Bash, Grep, Glob | default |
| **refactor-cleaner** | Dead code removal, consolidation, cleanup | Read, Write, Edit, Bash, Grep, Glob | default |

### Build & Error Resolution
| Agent | Purpose | Tools | Model |
|-------|---------|-------|-------|
| **build-error-resolver** | TypeScript/build error fixing, minimal diffs | Read, Write, Edit, Bash, Grep, Glob | default |
| **go-build-resolver** | Go build/vet error fixing, minimal diffs | Read, Write, Edit, Bash, Grep, Glob | default |

### Testing
| Agent | Purpose | Tools | Model |
|-------|---------|-------|-------|
| **tdd-guide** | TDD enforcement, write-tests-first, 80%+ coverage | Read, Write, Edit, Bash, Grep | default |
| **e2e-runner** | E2E testing with Playwright, screenshots, traces | Read, Write, Edit, Bash, Grep, Glob | default |

### Database
| Agent | Purpose | Tools | Model |
|-------|---------|-------|-------|
| **database-reviewer** | PostgreSQL optimization, schema design, RLS | Read, Write, Edit, Bash, Grep, Glob | default |

### Documentation
| Agent | Purpose | Tools | Model |
|-------|---------|-------|-------|
| **doc-updater** | Codemaps, documentation, READMEs | Read, Write, Edit, Bash, Grep, Glob | default |

## ATUM CREA Cycle Mapping

### RECHERCHER
- `Explore` x3-5 : parallele sur differentes zones du codebase
- `general-purpose` : recherche web, documentation externe

### PLANIFIER
- `Plan` : strategie d'implementation complete
- `architect` : decisions d'architecture systeme
- `planner` : planification de features complexes

### CONSTRUIRE
- `tdd-guide` : ecrire les tests puis le code (parallelisable par fichier)
- `build-error-resolver` : corriger les erreurs de build automatiquement

### VERIFIER (en parallele)
- **Gate A** : `code-reviewer` || `security-reviewer` || `build-error-resolver`
- **Gate B** : `e2e-runner` (tests end-to-end + screenshots)

### MEMORISER
- Pas d'agent specifique, utiliser `hindsight_retain` directement

## Parallelization Patterns

```
# Exploration parallele (3-5 agents simultanes)
Task(Explore, "analyze src/components/") || Task(Explore, "analyze src/lib/") || Task(Explore, "analyze src/app/")

# Construction parallele (fichiers independants)
Task(tdd-guide, "implement feature A in fileA.ts") || Task(tdd-guide, "implement feature B in fileB.ts")

# Verification parallele (Gate A + Gate B)
Task(code-reviewer, "review all changes") || Task(security-reviewer, "security audit") || Task(e2e-runner, "run E2E tests")
```

## Memory Integration

Key agents now have built-in Hindsight memory instructions:
- **planner** : Recalls past patterns/errors before planning, retains architecture decisions
- **tdd-guide** : Recalls testing patterns, retains test failure solutions
- **build-error-resolver** : Recalls past build error fixes, retains new solutions
- **security-reviewer** : Recalls past vulnerabilities, retains security patterns

This enables agents to learn from past sessions and avoid repeating mistakes.

## Important: Sub-Agent Limitations
- Sub-agents (Task) ne voient PAS les fichiers lus dans la conversation parent
- Pour les reviews de code : faire la review directement, PAS via Task
- Pour les corrections de build : `build-error-resolver` via Task fonctionne car il lit les fichiers lui-meme
