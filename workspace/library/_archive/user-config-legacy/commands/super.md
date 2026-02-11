---
description: "Mode super-agent avec orchestration maximale"
---

# Mode SUPER Active

Mode: **$ARGUMENTS**

## WORKFLOW

1. **Queen v18** - Orchestration maximale
2. **Activer tous Super-Agents**
3. **Parallelisme maximum** (25 agents)
4. **Mode autonome complet**

## AGENTS IMPLIQUES

| Role | Agent |
|------|-------|
| Orchestrateur | `queen-v18` |
| Super-Agents | Tous les 6 |

## SUPER-AGENTS ACTIVES

| Agent | Specialite |
|-------|------------|
| `fullstack-super` | Developpement full-stack complet |
| `backend-super` | APIs, bases de donnees, services |
| `ui-super` | Interfaces, composants, UX |
| `deploy-super` | Deploiement, CI/CD, cloud |
| `quality-super` | Tests, securite, performance |
| `research-super` | Recherche, documentation, analyse |

## MODES DISPONIBLES

| Mode | Description |
|------|-------------|
| `all` | Tous les super-agents actifs |
| `dev` | fullstack-super + backend-super + ui-super |
| `research` | research-super + quality-super |
| `deploy` | deploy-super + quality-super |

## EXEMPLES

```
/super all
/super dev
/super research
/super deploy
```

## CAPACITES

| Metrique | Valeur |
|----------|--------|
| Agents simultanees | Jusqu'a 25 |
| Autonomie | Maximale |
| Parallelisme | Maximum |
| Decision | Automatique |

## ARCHITECTURE

```
                Queen v18
                    │
    ┌───────────────┼───────────────┐
    │               │               │
    ▼               ▼               ▼
Fullstack      Backend          UI
 Super          Super         Super
    │               │               │
    │               │               │
    ▼               ▼               ▼
 Deploy        Quality        Research
  Super         Super          Super
```

## SECURITE

- Pas de push force vers main/master
- Pas de suppression production
- Confirmation requise pour: deploy, payments, api-keys

## GO!

Active le mode super-agent avec orchestration maximale.
