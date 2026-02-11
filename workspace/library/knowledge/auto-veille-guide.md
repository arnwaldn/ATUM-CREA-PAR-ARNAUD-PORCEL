# Guide Auto-Veille ULTRA-CREATE v27.6

> **Version**: v27.6
> **Système**: Auto-Veille (Innovation Monitor)
> **Objectif**: Maintenir ULTRA-CREATE comme "le meilleur vibe-coding AI au monde"
> **Hook**: `scripts/hooks/innovation-monitor.js`

---

## Vue d'Ensemble

Le système Auto-Veille surveille en continu les innovations dans le domaine du vibe-coding et de l'IA pour:
1. **Détecter** les nouvelles avancées pertinentes
2. **Évaluer** leur impact potentiel pour ULTRA-CREATE
3. **Alerter** quand une innovation high-impact est détectée
4. **Déclencher** automatiquement `/autoupgrade` si configuré

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SYSTÈME AUTO-VEILLE                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │
│  │   8 SOURCES  │───►│   ANALYSE    │───►│   ACTIONS    │         │
│  │   MONITOR    │    │   RELEVANCE  │    │   PROPOSER   │         │
│  └──────────────┘    └──────────────┘    └──────────────┘         │
│         │                   │                   │                   │
│         ▼                   ▼                   ▼                   │
│  ┌──────────────────────────────────────────────────────┐         │
│  │            HINDSIGHT BANK: research                   │         │
│  │   Stockage: innovations, papers, competitors          │         │
│  └──────────────────────────────────────────────────────┘         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8 Sources de Veille

### 1. ArXiv (Papers IA/Agents)

| Paramètre | Valeur |
|-----------|--------|
| **URL** | `https://arxiv.org/list/cs.AI/recent` |
| **Fréquence** | Quotidienne |
| **MCP** | `firecrawl` ou `exa` |
| **Mots-clés** | self-improving agents, LLM coding, autonomous AI, vibe coding |

**Requêtes recommandées**:
```
"self-evolving agent" OR "self-improving LLM"
"autonomous coding agent" OR "AI code generation"
"recursive self-improvement" site:arxiv.org
```

### 2. GitHub Trending (Repos Coding AI)

| Paramètre | Valeur |
|-----------|--------|
| **URL** | `https://github.com/trending` |
| **Fréquence** | Quotidienne |
| **MCP** | `github` |
| **Filtres** | stars:>100, ai-coding, agent, autonomous |

**Requêtes API GitHub**:
```javascript
// Recherche repos trending AI coding
github.search_repositories({
  query: 'ai coding agent stars:>100 pushed:>2026-01-01',
  sort: 'stars',
  order: 'desc'
})
```

### 3. Anthropic Blog (Nouveautés Claude)

| Paramètre | Valeur |
|-----------|--------|
| **URL** | `https://www.anthropic.com/news` |
| **Fréquence** | Hebdomadaire |
| **MCP** | `exa` ou `firecrawl` |
| **Priorité** | **CRITIQUE** - Notre base technologique |

**Éléments à surveiller**:
- Nouvelles versions Claude (Opus, Sonnet, Haiku)
- Claude Code updates
- API changes
- Best practices

### 4. OpenAI Blog (Concurrence)

| Paramètre | Valeur |
|-----------|--------|
| **URL** | `https://openai.com/blog` |
| **Fréquence** | Hebdomadaire |
| **MCP** | `exa` ou `firecrawl` |
| **Priorité** | Haute - Benchmark concurrentiel |

**Éléments à surveiller**:
- GPT updates
- Codex/Code Interpreter
- Agent capabilities
- API features

### 5. HuggingFace (Modèles/Datasets)

| Paramètre | Valeur |
|-----------|--------|
| **URL** | `https://huggingface.co/models` |
| **Fréquence** | Quotidienne |
| **MCP** | `firecrawl` |
| **Filtres** | code-generation, agent, task:text-generation |

**Éléments à surveiller**:
- Nouveaux modèles coding
- Fine-tuned models pour agents
- Datasets d'évaluation (SWE-Bench, etc.)

### 6. ProductHunt (Nouveaux Outils)

| Paramètre | Valeur |
|-----------|--------|
| **URL** | `https://www.producthunt.com/topics/artificial-intelligence` |
| **Fréquence** | Hebdomadaire |
| **MCP** | `firecrawl` |
| **Filtres** | AI, Developer Tools, Coding |

**Éléments à surveiller**:
- Nouveaux IDE AI
- Outils de productivité dev
- Concurrents émergents

### 7. Hacker News (Discussions IA)

| Paramètre | Valeur |
|-----------|--------|
| **URL** | `https://news.ycombinator.com` |
| **Fréquence** | Quotidienne |
| **MCP** | `exa` |
| **Filtres** | points:>100, AI, LLM, coding |

**Requêtes Exa**:
```javascript
exa.web_search_exa({
  query: 'AI coding assistant site:news.ycombinator.com',
  numResults: 10
})
```

### 8. Twitter/X (Tendances Temps Réel)

| Paramètre | Valeur |
|-----------|--------|
| **Fréquence** | Continue |
| **MCP** | `exa` |
| **Comptes clés** | @AnthropicAI, @OpenAI, @cursor_ai, @kaborenpm, @aaborenpm |
| **Hashtags** | #AIcoding, #LLM, #Claude, #VibeCodin |

**Requêtes recommandées**:
```
"cursor" OR "claude code" OR "github copilot" site:twitter.com
"AI coding" "breakthrough" OR "new" site:twitter.com
```

---

## Concurrents Principaux à Surveiller

| Concurrent | URL Changelog | Features Clés | Menace |
|------------|---------------|---------------|--------|
| **Cursor** | cursor.com/changelog | Multi-agent 8x, Background agents | **Haute** |
| **GitHub Copilot** | github.blog/changelog | Workspace, Auto-repair | **Haute** |
| **Devin** | cognition.ai/blog | Full autonomy, 67% PRs | **Très Haute** |
| **Replit** | blog.replit.com | Agent mode, Cloud IDE | Moyenne |
| **Codeium** | codeium.com/blog | Fast completion | Moyenne |
| **Tabnine** | tabnine.com/blog | Enterprise focus | Basse |

### Surveillance Concurrentielle

```javascript
// Changelog URLs à vérifier
const COMPETITOR_CHANGELOGS = [
  { name: 'Cursor', url: 'https://cursor.com/changelog' },
  { name: 'GitHub Copilot', url: 'https://github.blog/changelog/label/copilot/' },
  { name: 'Devin', url: 'https://www.cognition.ai/blog' },
  { name: 'Replit', url: 'https://blog.replit.com' }
];
```

---

## Utilisation du Hook

### Mode Automatique (Background)

Le hook `innovation-monitor.js` peut tourner en arrière-plan:

```javascript
// Configuration dans scripts/hooks/innovation-monitor.js
const VEILLE_CONFIG = {
  enabled: true,
  scanInterval: 'daily',  // 'hourly', 'daily', 'weekly'
  sources: ['arxiv', 'github', 'anthropic', 'openai', 'huggingface', 'producthunt', 'hackernews', 'twitter'],
  relevanceThreshold: 0.7,
  triggerAutoUpgrade: true,
  notifyOnHighImpact: true
};
```

### Mode Manuel (Commande)

Via `/autoupgrade`:

```bash
# Lancer un scan de veille
/autoupgrade --veille

# Voir les innovations récentes
/autoupgrade --innovations

# Rapport concurrents
/autoupgrade --competitors

# Analyse complète + veille
/autoupgrade --full
```

---

## Scoring de Relevance

### Calcul du Score

```javascript
function calculateRelevanceScore(innovation) {
  let score = 0;

  // Mots-clés critiques (+0.3 chacun)
  const criticalKeywords = ['self-improving', 'autonomous', 'vibe-coding', 'claude', 'agent'];
  criticalKeywords.forEach(kw => {
    if (innovation.title.toLowerCase().includes(kw) ||
        innovation.content.toLowerCase().includes(kw)) {
      score += 0.3;
    }
  });

  // Source fiable (+0.2)
  const trustedSources = ['arxiv.org', 'anthropic.com', 'openai.com', 'github.com'];
  if (trustedSources.some(s => innovation.url.includes(s))) {
    score += 0.2;
  }

  // Récence (+0.1 si < 7 jours)
  const daysSincePublish = (Date.now() - new Date(innovation.date)) / (1000 * 60 * 60 * 24);
  if (daysSincePublish < 7) score += 0.1;

  // Impact potentiel (évalué par LLM)
  score += innovation.estimatedImpact * 0.3;

  return Math.min(score, 1.0);
}
```

### Seuils de Relevance

| Score | Niveau | Action |
|-------|--------|--------|
| 0.9+ | **CRITIQUE** | Notification immédiate + auto-upgrade trigger |
| 0.7-0.89 | **HIGH** | Stockage + inclusion rapport hebdo |
| 0.5-0.69 | **MEDIUM** | Stockage pour référence |
| < 0.5 | **LOW** | Ignoré |

---

## Stockage Hindsight

### Structure des Données

```javascript
// Stocker une innovation détectée
await hindsight_retain({
  bank: 'research',
  content: `Innovation: ${innovation.title}
Source: ${innovation.source}
URL: ${innovation.url}
Relevance: ${innovation.score}
Impact: ${innovation.impact}
Summary: ${innovation.summary}`,
  context: JSON.stringify({
    type: 'innovation_detected',
    timestamp: new Date().toISOString(),
    source: innovation.source,
    relevanceScore: innovation.score,
    potentialImpact: innovation.impact,
    keywords: innovation.keywords,
    triggerAutoUpgrade: innovation.score >= 0.9
  })
});
```

### Requêtes de Rappel

```javascript
// Récupérer innovations récentes
const recentInnovations = await hindsight_recall({
  bank: 'research',
  query: 'innovation_detected high impact',
  top_k: 20
});

// Filtrer par source
const arxivPapers = await hindsight_recall({
  bank: 'research',
  query: 'innovation arxiv self-improving agent',
  top_k: 10
});

// Concurrents
const competitorUpdates = await hindsight_recall({
  bank: 'research',
  query: 'competitor changelog cursor copilot devin',
  top_k: 10
});
```

---

## Rapport de Veille

### Format Standard

```markdown
# Rapport Auto-Veille ULTRA-CREATE

**Période**: [date_début] → [date_fin]
**Scans effectués**: X
**Innovations détectées**: Y
**High-Impact**: Z

---

## Résumé Exécutif

- **Innovations critiques**: X (action requise)
- **Nouvelles features concurrents**: Y
- **Papers pertinents**: Z
- **Tendances émergentes**: [liste]

---

## Top 5 Innovations à Évaluer

### 1. [Titre Innovation]
- **Source**: ArXiv/GitHub/Blog
- **URL**: [lien]
- **Date**: [date]
- **Relevance Score**: X/10
- **Impact Potentiel**: High/Medium/Low
- **Description**: [résumé]
- **Application ULTRA-CREATE**: [comment l'intégrer]
- **Recommandation**: ✅ Intégrer / ⏳ Surveiller / ❌ Ignorer

### 2. [...]

---

## Activité Concurrents

| Concurrent | Dernière MàJ | Nouvelle Feature | Impact | Action |
|------------|-------------|------------------|--------|--------|
| Cursor | [date] | [feature] | [level] | [action] |
| Copilot | [date] | [feature] | [level] | [action] |
| Devin | [date] | [feature] | [level] | [action] |

---

## Papers ArXiv Pertinents

| Titre | Référence | Concept | Applicabilité |
|-------|-----------|---------|---------------|
| [titre] | arxiv:XXXX.XXXXX | [concept] | [score]/10 |

---

## Tendances Détectées

1. **[Tendance 1]**: [description]
2. **[Tendance 2]**: [description]
3. **[Tendance 3]**: [description]

---

## Actions Recommandées

### P0 - Immédiat
- [ ] [action critique]

### P1 - Cette semaine
- [ ] [action importante]

### P2 - Ce mois
- [ ] [action planifiée]

---

*Généré par Auto-Veille System v27.6 | ULTRA-CREATE*
*Prochaine veille: [date]*
```

---

## Configuration Avancée

### Fichier de Configuration

```json
// config/auto-veille-config.json
{
  "enabled": true,
  "schedule": {
    "arxiv": "0 6 * * *",      // 6h quotidien
    "github": "0 8 * * *",      // 8h quotidien
    "anthropic": "0 9 * * 1",   // 9h lundi
    "openai": "0 9 * * 1",      // 9h lundi
    "huggingface": "0 7 * * *", // 7h quotidien
    "producthunt": "0 10 * * 1", // 10h lundi
    "hackernews": "0 12 * * *", // 12h quotidien
    "twitter": "*/30 * * * *"   // Toutes les 30 min
  },
  "thresholds": {
    "relevance": 0.7,
    "triggerUpgrade": 0.9,
    "maxAgesDays": 30
  },
  "notifications": {
    "onHighImpact": true,
    "onCompetitorUpdate": true,
    "weeklyDigest": true
  },
  "storage": {
    "bank": "research",
    "maxEntries": 1000,
    "archiveAfterDays": 90
  }
}
```

### Variables d'Environnement

```bash
# .env (optionnel)
VEILLE_ENABLED=true
VEILLE_ARXIV_ENABLED=true
VEILLE_GITHUB_ENABLED=true
VEILLE_RELEVANCE_THRESHOLD=0.7
VEILLE_AUTO_TRIGGER=true
```

---

## Intégration avec /autoupgrade

### Flux de Données

```
innovation-monitor.js
        │
        │ Détecte innovation high-impact
        │
        ▼
┌─────────────────────────┐
│ Stocke dans Hindsight   │
│ bank: 'research'        │
│ triggerAutoUpgrade: true│
└───────────┬─────────────┘
            │
            ▼
auto-upgrade-trigger.js
        │
        │ checkHighImpactInnovations()
        │ Trouve innovation flaggée
        │
        ▼
┌─────────────────────────┐
│ Trigger /autoupgrade    │
│ reason: 'HIGH_IMPACT_   │
│         INNOVATION'     │
└───────────┬─────────────┘
            │
            ▼
/autoupgrade (Phase 0: VEILLE)
        │
        │ Inclut innovation dans analyse
        │
        ▼
     RAPPORT avec innovation intégrée
```

### Code d'Intégration

```javascript
// Dans auto-upgrade-trigger.js
async function checkHighImpactInnovations() {
  const innovations = await hindsight_recall({
    bank: 'research',
    query: 'innovation_detected triggerAutoUpgrade:true',
    top_k: 10
  });

  // Filtrer les non-traités
  const unprocessed = innovations.filter(i => !i.context?.processed);

  return {
    found: unprocessed.length > 0,
    innovations: unprocessed,
    count: unprocessed.length
  };
}
```

---

## Best Practices

### 1. Fréquence de Scan

| Source | Recommandé | Minimum | Maximum |
|--------|------------|---------|---------|
| ArXiv | Quotidien | Hebdo | Quotidien |
| GitHub | Quotidien | Hebdo | Horaire |
| Anthropic | Hebdo | Mensuel | Quotidien |
| Twitter | Continue | Quotidien | 15 min |

### 2. Gestion des Faux Positifs

```javascript
// Liste blanche/noire pour affiner la relevance
const WHITELIST_KEYWORDS = [
  'claude', 'anthropic', 'self-improving', 'autonomous agent',
  'vibe coding', 'ai coding', 'code generation'
];

const BLACKLIST_KEYWORDS = [
  'job posting', 'hiring', 'course', 'tutorial beginner',
  'introduction to', 'getting started'
];
```

### 3. Archivage

- Archiver innovations >90 jours
- Garder uniquement high-impact indéfiniment
- Nettoyer duplicates mensuellement

### 4. Alertes

```javascript
// Configurer alertes critiques
const ALERT_CONDITIONS = {
  // Nouvelle version majeure concurrent
  competitorMajorRelease: {
    keywords: ['v2', 'major release', 'breakthrough'],
    sources: ['cursor', 'copilot', 'devin'],
    action: 'immediate_notify'
  },

  // Nouvelle feature Anthropic
  anthropicUpdate: {
    source: 'anthropic.com',
    action: 'immediate_notify'
  },

  // Paper révolutionnaire
  breakthroughPaper: {
    keywords: ['state-of-the-art', 'SOTA', 'surpasses human'],
    relevanceMin: 0.95,
    action: 'immediate_notify_and_trigger'
  }
};
```

---

## Troubleshooting

| Problème | Cause | Solution |
|----------|-------|----------|
| Scan échoue | MCP non disponible | Vérifier status MCPs (exa, firecrawl, github) |
| Trop de faux positifs | Seuil trop bas | Augmenter `relevanceThreshold` à 0.8 |
| Innovations manquées | Mots-clés insuffisants | Enrichir `WHITELIST_KEYWORDS` |
| Stockage plein | Trop d'entrées | Lancer archivage `archiveOldInnovations()` |
| Duplicates | Même innovation plusieurs sources | Activer dedup par URL |

---

## Commandes Utiles

```bash
# Veille manuelle immédiate
/autoupgrade --veille

# Voir innovations non traitées
/autoupgrade --innovations --unprocessed

# Rapport concurrents dernière semaine
/autoupgrade --competitors --days 7

# Forcer re-scan toutes sources
/autoupgrade --veille --force --all-sources

# Export rapport PDF
/autoupgrade --veille --export pdf
```

---

## Métriques de Veille

| Métrique | Description | Cible |
|----------|-------------|-------|
| **Coverage** | % sources scannées avec succès | >95% |
| **Latency** | Délai détection → stockage | <1h |
| **Precision** | % innovations pertinentes / total | >70% |
| **Recall** | % innovations critiques détectées | >95% |
| **Trigger Accuracy** | % triggers justifiés | >90% |

---

## Voir Aussi

- `scripts/hooks/innovation-monitor.js` - Hook principal
- `scripts/hooks/auto-upgrade-trigger.js` - Déclencheur automatique
- `commands/autoupgrade.md` - Documentation commande
- `knowledge/auto-upgrade-patterns.md` - 22 patterns
- `agents/meta/auto-upgrade-agent.md` - Agent principal

---

*Guide Auto-Veille v27.6 | 8 Sources | ULTRA-CREATE*
*Objectif: Maintenir ULTRA-CREATE comme "le meilleur vibe-coding AI au monde"*
