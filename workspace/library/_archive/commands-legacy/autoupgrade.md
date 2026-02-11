# /autoupgrade - Auto-Upgrade Agent Command

> **Version**: v27.6
> **Agent Principal**: `auto-upgrade-agent`
> **Description**: Analyse automatique du systeme ULTRA-CREATE et proposition d'ameliorations
> **Objectif**: Maintenir ULTRA-CREATE comme "le meilleur vibe-coding AI au monde"

---

## Overview

La commande `/autoupgrade` active l'agent auto-upgrade qui:
1. **Analyse** les sessions passees pour identifier les faiblesses
2. **Recherche** les solutions dans 8+ sources (web, GitHub, papers)
3. **Synthetise** des ameliorations adaptees a ULTRA-CREATE
4. **Propose** des suggestions avec metriques CMP (Cumulative Metaproductivity)
5. **Apprend** des feedbacks pour s'ameliorer continuellement

---

## Usage

```bash
# Mode standard - Analyse complete
/autoupgrade

# Mode veille - Scan innovations seulement
/autoupgrade --veille

# Voir innovations detectees
/autoupgrade --innovations

# Rapport concurrents
/autoupgrade --competitors

# Analyse complete + veille
/autoupgrade --full

# Focus sur un domaine
/autoupgrade --focus errors      # Focus erreurs
/autoupgrade --focus patterns    # Focus patterns manquants
/autoupgrade --focus performance # Focus performance
/autoupgrade --focus agents      # Focus agents

# Options avancees
/autoupgrade --sessions 50       # Analyser 50 sessions (defaut: 10)
/autoupgrade --research deep     # Recherche approfondie
/autoupgrade --apply             # Appliquer suggestions automatiquement
```

---

## Architecture 7 Phases

```
/autoupgrade
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 0: VEILLE (Background Continuous)                     │
│ innovation-monitor.js en arriere-plan                       │
│ 8 sources: ArXiv, GitHub, Anthropic, OpenAI, HF, PH, HN, X  │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: PARSE                                              │
│ +-- Hindsight recall (10-50 sessions)                       │
│ +-- RECON: Scanner composants ULTRA-CREATE                  │
│ +-- Self-Questioning: Generer hypotheses                    │
│ Patterns: RECON, MUSE, Self-Questioning                     │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: DIAGNOSE                                           │
│ +-- AutoDetect: Classifier faiblesses                       │
│ +-- CMP Metric: Prioriser par potentiel amelioration        │
│ +-- Categorisation P0-P3                                    │
│ Patterns: AutoDetect, Agent0 Curriculum, CMP                │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: RESEARCH                                           │
│ +-- Self-Navigating: Experience passee avant recherche      │
│ +-- Multi-Agent 8x parallele (Cursor 2.0 pattern)           │
│ +-- Sources: Exa, GitHub, Context7, ArXiv, innovations      │
│ Patterns: Multi-Agent 8x, Self-Navigating, Context-Eng      │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: SYNTHESIZE                                         │
│ +-- Tree-of-Thoughts: 3-5 branches                          │
│ +-- RISE Introspection: Auto-critique recursive             │
│ +-- Verification-First: Valider avant proposal              │
│ Patterns: RISE, ToT, Self-Reflection, Verification-First    │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 5: PROPOSE                                            │
│ +-- Rapport Markdown structure                              │
│ +-- Score CMP affiche pour chaque suggestion                │
│ +-- Emergence: Proposer nouveaux agents si necessaire       │
│ Patterns: Emergence, CMP Display                            │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 6: LEARN                                              │
│ +-- Self-Attributing: Attribution causale                   │
│ +-- Darwin Godel: Self-modification si validee              │
│ +-- ReasoningBank: Stocker raisonnements (+34.2%)           │
│ Patterns: Darwin Godel, STOP, Self-Attributing, Skill Amp   │
└─────────────────────────────────────────────────────────────┘
```

---

## Agents Impliques

### Agent Principal
- `auto-upgrade-agent` - Orchestrateur 7 phases

### Agents Secondaires
| Agent | Phase | Role |
|-------|-------|------|
| `intent-parser` | 1 | Analyser sessions |
| `confidence-checker` | 2, 4 | Valider pertinence |
| `self-checker` | 2, 4 | Verifier qualite |
| `deep-researcher` | 3 | Recherche multi-sources |
| `tree-of-thoughts` | 4 | Exploration branches |
| `self-reflection-loop` | 4 | Auto-critique |
| `pm-agent` | 5 | Coordination rapport |
| `self-improver` | 6 | Apprentissage |

---

## MCPs Requis

| MCP | Usage |
|-----|-------|
| `hindsight` | Memoire sessions, patterns, erreurs |
| `exa` | Recherche web |
| `github` | Repos, code, trends |
| `context7` | Documentation frameworks |
| `sequential-thinking` | Raisonnement structure |
| `firecrawl` | Scraping blogs/docs (backup) |

---

## Metriques CMP (Cumulative Metaproductivity)

La metrique CMP mesure le **potentiel d'amelioration**, pas juste l'impact immediat.

```
CMP Score = (ImmediateImpact × 0.4) + (DescendantPotential × 0.6)
```

| Score CMP | Priority | Action |
|-----------|----------|--------|
| 8-10 | P0 | Implementation immediate |
| 6-7.9 | P1 | Prochaine version |
| 4-5.9 | P2 | A planifier |
| < 4 | P3 | A surveiller |

**Exemple**:
- Suggestion A: Impact immediat 8/10, potentiel descendant 3/10 → CMP = 6.0 (P1)
- Suggestion B: Impact immediat 4/10, potentiel descendant 9/10 → CMP = 7.0 (P0)

→ Suggestion B est prioritaire car elle genere plus d'ameliorations futures.

---

## Sources de Veille (8)

| Source | Type | Frequence | Contenu |
|--------|------|-----------|---------|
| ArXiv | Papers | Quotidienne | Recherche AI/agents |
| GitHub Trending | Repos | Quotidienne | Outils coding AI |
| Anthropic Blog | Blog | Hebdo | Nouveautes Claude |
| OpenAI Blog | Blog | Hebdo | Concurrence |
| HuggingFace | Modeles | Quotidienne | Nouveaux modeles |
| ProductHunt | Produits | Hebdo | Nouveaux outils |
| Hacker News | Discussions | Quotidienne | Tendances dev |
| Twitter/X | Social | Continue | Temps reel |

---

## 22 Patterns Integres

| # | Pattern | Source | Phase |
|---|---------|--------|-------|
| 1 | RECON | dev-swarm | 1 |
| 2 | MUSE Experience Memory | arXiv:2510.08002 | 1 |
| 3 | Self-Questioning | AgentEvolver | 1 |
| 4 | AutoDetect Categories | Framework academique | 2 |
| 5 | Agent0 Curriculum | arXiv:2511.16043 | 2 |
| 6 | CMP Metric | Huxley-Godel | 2,4,5,6 |
| 7 | EvoAgentX Search | GitHub | 3 |
| 8 | Context-Engineering | Karpathy | 3 |
| 9 | Self-Navigating | AgentEvolver | 3 |
| 10 | RISE Introspection | Paper | 4 |
| 11 | Tree-of-Thoughts | Yao et al. | 4 |
| 12 | Self-Reflection | Shinn et al. | 4 |
| 13 | Verification-First | Factory AI | 4 |
| 14 | OpenAI Self-Evolving Loop | Cookbook | 6 |
| 15 | Darwin Godel Self-Mod | Sakana AI | 6 |
| 16 | STOP Recursive Opt | arXiv:2310.02304 | 6 |
| 17 | Recursive Skill Amp | GitHub | 6 |
| 18 | Emergence Assembly | Emergence.ai | 5 |
| 19 | Self-Attributing | AgentEvolver | 6 |
| 20 | Multi-Agent 8x | Cursor 2.0 | 3 |
| 21 | ReasoningBank | Google | 6 |
| 22 | Innovation Monitor | Original | 0 |

---

## Format Rapport Output

```markdown
# Rapport Auto-Upgrade ULTRA-CREATE

**Date**: 2026-01-07T14:30:00Z
**Version**: v27.6
**Sessions analysees**: 10
**Periode**: 7 jours

---

## Resume Executif

- **Problemes identifies**: X
- **P0 (Critiques)**: Y
- **Solutions proposees**: Z
- **Score coherence**: 95%

---

## Top 5 Suggestions

### 1. [Titre Suggestion]
- **CMP Score**: 8.5/10
- **Impact immediat**: 7/10
- **Potentiel descendant**: 9/10
- **Effort**: Moyen
- **Source**: [arXiv/GitHub/Blog]
- **Description**: ...
- **Implementation**:
  1. Etape 1
  2. Etape 2

### 2. [...]

---

## Problemes Detectes

### P0 - Critiques
| Probleme | Frequence | Impact | Solution |
|----------|-----------|--------|----------|
| ... | X fois | Eleve | ... |

### P1 - Importants
[...]

---

## Sources Consultees

- [ArXiv] paper_title - URL
- [GitHub] repo_name - URL
- [Blog] article_title - URL

---

## Metriques Session

| Metrique | Valeur |
|----------|--------|
| Coherence avec existant | 95% |
| Patterns reutilises | 18/22 |
| Nouveaux patterns proposes | 2 |
| Innovations detectees | 5 |

---
*Genere par Auto-Upgrade Agent v27.6 | ULTRA-CREATE*
```

---

## Concurrents Surveilles

| Concurrent | URL Changelog | Features Cles |
|------------|---------------|---------------|
| Cursor | cursor.com/changelog | Multi-agent, Background agents |
| GitHub Copilot | github.blog/changelog | Workspace, Auto-repair |
| Devin | cognition.ai/blog | Full autonomy |
| Replit | blog.replit.com | Agent mode |

---

## Triggers Automatiques (Optionnel)

Si active dans config, l'auto-upgrade se declenche automatiquement:

```json
{
  "autoUpgrade": {
    "enabled": false,
    "triggerAfterSessions": 10,
    "recurringErrorThreshold": 5,
    "qualityScoreThreshold": 7,
    "autoApply": false
  }
}
```

---

## Exemples d'Utilisation

### Analyse Standard
```
User: /autoupgrade
Claude: Je lance l'analyse auto-upgrade...

[Phase 1: PARSE]
Analyse des 10 dernieres sessions Hindsight...
Extraction des patterns et erreurs...

[Phase 2: DIAGNOSE]
3 problemes P0 identifies:
- Erreur recurrente: Module not found (5x)
- Pattern manquant: Validation input
- Performance: Context overflow (2x)

[Phase 3: RESEARCH]
Recherche multi-sources en parallele...
- ArXiv: 3 papers pertinents
- GitHub: 5 repos similaires
- Context7: Documentation mise a jour

[Phase 4: SYNTHESIZE]
Application Tree-of-Thoughts...
Introspection RISE...
3 solutions validees.

[Phase 5: PROPOSE]
# Rapport Auto-Upgrade
...

[Phase 6: LEARN]
Voulez-vous accepter ces suggestions?
```

### Veille Seulement
```
User: /autoupgrade --veille
Claude: Execution du scan de veille...

Sources scannees:
- ArXiv: 12 nouveaux papers
- GitHub Trending: 8 repos pertinents
- Anthropic Blog: 1 nouvelle annonce

Innovations detectees: 5
- [HIGH] "Self-Evolving Agent v2" - arxiv.org/...
- [MEDIUM] "Claude Code SDK" - anthropic.com/...
...
```

---

## Integration Hooks

| Hook | Role |
|------|------|
| `innovation-monitor.js` | Veille continue en arriere-plan |
| `auto-upgrade-trigger.js` | Declenchement automatique (optionnel) |
| `auto-retain.js` | Persistance des learnings |
| `session-end.js` | Capture metriques session |

---

## Troubleshooting

| Probleme | Solution |
|----------|----------|
| "Hindsight unavailable" | Verifier `docker start hindsight hindsight-postgres` |
| "No sessions found" | Executer au moins 1 session avec `/wake` |
| "Research timeout" | Utiliser `--research basic` |
| "CMP Score faible" | Verifier coherence avec existant |

---

## Voir Aussi

- `agents/meta/auto-upgrade-agent.md` - Agent complet
- `scripts/hooks/innovation-monitor.js` - Hook veille
- `knowledge/auto-upgrade-patterns.md` - 22 patterns documentes
- `knowledge/auto-veille-guide.md` - Guide veille

---

*v27.6 AUTO-UPGRADE AGENT | 22 patterns | 7 phases | 8 sources veille | CMP Metric*
