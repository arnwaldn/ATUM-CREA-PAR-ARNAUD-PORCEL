---
description: Analyse multi-agents hierarchique (user)
---

# /agency - Multi-Agent Hierarchical Analysis

## USAGE
```
/agency security "Audit complet application e-commerce"
/agency architecture "Design systeme microservices"
/agency review "Code review PR #123"
/agency full "Projet SaaS from scratch"
```

## TYPES D'AGENCY

### security
Agents: security-auditor, penetration-tester, code-reviewer
```
/agency security "path/to/project"
```
Output: Rapport vulnerabilites + recommandations

### architecture
Agents: architect, system-designer, database-expert
```
/agency architecture "specs du systeme"
```
Output: Architecture diagrams + decisions

### review
Agents: code-reviewer, best-practices-checker, test-reviewer
```
/agency review "PR ou path"
```
Output: Code review structuree

### full
Tous les agents en hierarchie
```
/agency full "description projet"
```
Output: Projet complet

## HIERARCHIE AGENTS

```
                    CEO/PM
                      │
        ┌─────────────┼─────────────┐
        │             │             │
   ARCHITECT     RESEARCHER    SECURITY
        │             │             │
   ┌────┼────┐        │        ┌────┴────┐
   │    │    │        │        │         │
 FRONT BACK DEVOPS  ANALYST  AUDITOR  TESTER
```

## WORKFLOW

### 1. Decomposition tache
PM Agent decompose en sous-taches

### 2. Assignment
Chaque sous-tache assignee a agent specialise

### 3. Execution parallele
Agents travaillent en parallele quand possible

### 4. Aggregation
PM Agent compile les resultats

### 5. Review croisee
Agents reviewent le travail des autres

### 6. Synthese finale
Output structure et actionnable

## OPTIONS
| Option | Description |
|--------|-------------|
| --depth=N | Profondeur analyse (1-3) |
| --focus="X" | Concentrer sur aspect |
| --parallel | Forcer parallelisme max |
| --report | Generer rapport PDF |

## OUTPUT FORMAT
```yaml
agency_result:
  type: "${type}"
  agents_used: [list]
  duration: "Xm Ys"

  findings:
    critical: [...]
    important: [...]
    suggestions: [...]

  deliverables:
    - type: report
      content: "..."
    - type: code
      files: [...]

  next_steps:
    - action1
    - action2
```

## MCP/AGENTS UTILISES
- Task (subagents)
- Agents specifiques par type
- sequential-thinking (orchestration)
- Hindsight (memoire)
