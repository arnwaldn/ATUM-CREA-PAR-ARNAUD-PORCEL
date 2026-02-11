# Commands Dispatcher - ULTRA-CREATE v28.6

> **Purpose**: Routing central pour les 50 commandes slash
> **Usage**: Claude consulte ce fichier pour router chaque commande vers les agents/MCPs appropriés
> **Auto-Discovery**: Activé via `agents/registry.json` et `templates/manifest.json`

---

## Architecture de Routing

```
COMMANDE SLASH
      │
      ▼
┌─────────────────────────────────┐
│ 1. PARSE COMMAND                │
│    Extraire: /cmd [args]        │
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│ 2. LOOKUP DISPATCHER            │
│    Ce fichier → routing table   │
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│ 3. ACTIVATE AGENTS              │
│    Primary → Secondary chain    │
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│ 4. LOAD MCPs                    │
│    Required + Optional MCPs     │
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│ 5. EXECUTE WORKFLOW             │
│    Steps définies par command   │
└─────────────────────────────────┘
```

---

## Routing Table Complète (48 Commandes)

### CORE (7 commandes)

| Command | Primary Agent | Secondary Agents | MCPs Requis | MCPs Optionnels |
|---------|---------------|------------------|-------------|-----------------|
| `/wake` | `intent-parser` | `confidence-checker`, `pm-agent` | `hindsight`, `memory` | - |
| `/create` | `wizard-agent` | `intent-parser`, `fullstack-super` | `context7`, `hindsight` | `supabase`, `github` |
| `/scaffold` | `wizard-agent` | `fullstack-super`, `template-selector` | `context7`, `filesystem` | `supabase` |
| `/analyze` | `code-reviewer` | `self-checker`, `tech-scout` | `code2prompt`, `hindsight` | `sequential-thinking` |
| `/debug` | `debugger` | `confidence-checker`, `self-healer` | `hindsight`, `context7` | `sequential-thinking` |
| `/refactor` | `refactoring-expert` | `code-reviewer`, `self-checker` | `context7` | `hindsight` |
| `/deploy` | `deploy-super` | `ci-cd-engineer`, `cloud-deploy-expert` | `github`, `supabase` | `desktop-commander` |

#### Détail Workflows Core

**`/wake`** - Activation système complet
```yaml
workflow:
  1. hindsight_recall(bank: 'ultra-dev-memory', query: 'session context')
  2. Load agents/registry.json
  3. Load templates/manifest.json
  4. Activate intent-parser in listening mode
  5. Confirm: "ULTRA-CREATE v25.0 activé"
triggers_auto: ["bonjour", "salut", "aide", "help"]
```

**`/create [description]`** - Création nouveau projet
```yaml
workflow:
  1. intent-parser → Analyser description
  2. wizard-agent → Questions si confidence < 70%
  3. templates/manifest.json → Matching template
  4. context7 → Charger docs stack
  5. hindsight_recall → Patterns similaires
  6. fullstack-super → Génération code
  7. hindsight_retain → Sauvegarder patterns
example: "/create un SaaS de facturation"
```

**`/scaffold [template] [name]`** - Scaffolding rapide
```yaml
workflow:
  1. templates/manifest.json → Lookup template
  2. wizard-agent → Compléter params manquants
  3. context7 → Docs frameworks du template
  4. Copier structure template
  5. Personnaliser avec nom projet
  6. npm install / configuration initiale
example: "/scaffold saas mon-projet"
```

**`/analyze [path|url]`** - Analyse de code
```yaml
workflow:
  1. code2prompt_analyze → Structure et tokens
  2. Glob/Read → Charger fichiers clés
  2. code-reviewer → Analyse qualité
  3. tech-scout → Identifier technologies
  4. self-checker → Validation analyse
  5. Générer rapport markdown
example: "/analyze ./src"
```

**`/debug [error|description]`** - Debug systématique
```yaml
workflow:
  1. hindsight_recall(bank: 'errors') → Erreurs similaires
  2. debugger → Analyse root cause
  3. context7 → Docs framework concerné
  4. confidence-checker → Valider solution
  5. self-healer → Appliquer fix
  6. hindsight_retain(bank: 'errors') → Sauvegarder solution
example: "/debug TypeError: Cannot read property 'map'"
```

**`/refactor [scope]`** - Refactoring code
```yaml
workflow:
  1. code-reviewer → Identifier issues
  2. refactoring-expert → Proposer améliorations
  3. context7 → Best practices framework
  4. self-checker → Valider refactor
  5. Appliquer changes incrémentaux
example: "/refactor ./src/components"
```

**`/deploy [platform] [subcommand]`** - Déploiement
```yaml
workflow:
  1. Détecter type projet (Next.js, Tauri, etc.)
  2. deploy-super → Orchestrer déploiement
  3. ci-cd-engineer → Setup pipeline si absent
  4. cloud-deploy-expert → Config plateforme
  5. github → Push + Actions
  6. Vérification santé post-deploy
  7. [v27.0] Post-deploy: logs streaming + inspection auto
platforms: ["vercel", "supabase", "railway", "docker", "github-pages"]
example: "/deploy vercel"

# Sous-commandes Vercel Avancées (v27.0)
subcommands:
  /deploy vercel logs:
    description: "Logs streaming temps réel"
    command: "vercel logs [url] --follow"
    usage: "/deploy vercel logs"

  /deploy vercel inspect:
    description: "Inspection détaillée déploiement"
    command: "vercel inspect [url]"
    output: "Build info, routes, functions, headers, env vars"
    usage: "/deploy vercel inspect https://my-app.vercel.app"

  /deploy vercel env-sync:
    description: "Synchronisation bulk des variables d'environnement"
    workflow:
      1. vercel env pull .env.production
      2. Diff avec .env.local
      3. vercel env add < production.env (si changements)
    usage: "/deploy vercel env-sync"

  /deploy vercel promote:
    description: "Promouvoir preview vers production"
    command: "vercel promote [preview-url]"
    usage: "/deploy vercel promote https://my-app-abc123.vercel.app"

  /deploy vercel rollback:
    description: "Rollback vers déploiement précédent"
    command: "vercel rollback [deployment-url]"
    usage: "/deploy vercel rollback"

  /deploy vercel history:
    description: "Historique des déploiements"
    command: "vercel list --meta"
    usage: "/deploy vercel history"
```

---

### DÉVELOPPEMENT (8 commandes)

| Command | Primary Agent | Secondary Agents | MCPs Requis | MCPs Optionnels |
|---------|---------------|------------------|-------------|-----------------|
| `/generate` | `full-stack-generator` | `ui-designer`, `backend-developer` | `context7`, `shadcn` | `supabase` |
| `/test` | `tester` | `test-automation`, `auto-validator` | `e2b` | `playwright` |
| `/tdd` | `tester` | `debugger`, `self-checker` | `e2b`, `context7` | - |
| `/review` | `code-reviewer` | `security-auditor`, `self-checker` | `hindsight` | `sequential-thinking` |
| `/review-fix` | `code-reviewer` | `self-healer`, `refactoring-expert` | `hindsight`, `context7` | - |
| `/optimize` | `performance-optimizer` | `token-optimizer`, `tech-scout` | `context7` | `sequential-thinking` |
| `/migrate` | `migration-expert` | `context7-expert`, `debugger` | `context7`, `hindsight` | - |
| `/parallel` | `parallel-executor-v18` | `queen-v18`, `task-decomposer` | `git` | - |

#### Détail Workflows Développement

**`/generate [type] [description]`** - Génération de code
```yaml
workflow:
  1. Parser type: component|route|api|hook|util
  2. context7 → Docs framework projet
  3. shadcn → Si composant UI
  4. full-stack-generator → Générer code
  5. tester → Tests unitaires auto
types: ["component", "route", "api", "hook", "util", "page", "model"]
example: "/generate component UserProfile avec avatar et stats"
```

**`/test [type] [scope]`** - Tests automatisés
```yaml
workflow:
  1. Détecter framework test (vitest, jest, playwright)
  2. tester → Générer tests
  3. e2b → Exécuter en sandbox
  4. auto-validator → Valider résultats
  5. Rapport couverture
types: ["unit", "integration", "e2e", "all"]
example: "/test e2e ./src/features/auth"
```

**`/tdd [feature]`** - Test-Driven Development
```yaml
workflow:
  1. tester → Écrire tests FIRST (red)
  2. Run tests → Confirm failing
  3. Implémenter minimum viable (green)
  4. refactoring-expert → Refactor
  5. Loop jusqu'à feature complète
example: "/tdd authentication avec Google OAuth"
```

**`/review [scope]`** - Code review
```yaml
workflow:
  1. code-reviewer → Analyse qualité
  2. security-auditor → Scan vulnérabilités
  3. hindsight_recall → Patterns best practice
  4. Générer rapport avec suggestions
example: "/review ./src"
```

**`/review-fix [scope]`** - Review + fix automatique
```yaml
workflow:
  1. /review workflow
  2. self-healer → Appliquer fixes automatiques
  3. refactoring-expert → Améliorations structurelles
  4. self-checker → Valider corrections
example: "/review-fix ./src/api"
```

**`/optimize [type]`** - Optimisation
```yaml
workflow:
  1. performance-optimizer → Profiling
  2. tech-scout → Identifier bottlenecks
  3. token-optimizer → Si code IA (30-60% réduction)
  4. context7 → Best practices perf
  5. Appliquer optimisations
types: ["performance", "bundle", "tokens", "memory", "all"]
example: "/optimize performance"
```

**`/migrate [from] [to]`** - Migration framework
```yaml
workflow:
  1. migration-expert → Plan migration
  2. context7 → Docs deux versions
  3. hindsight_recall → Migrations similaires
  4. Exécuter migration incrémentale
  5. tester → Valider fonctionnalités
example: "/migrate next14 next15"
```

**`/parallel [tasks]`** - Exécution parallèle
```yaml
workflow:
  1. task-decomposer → Diviser en sous-tâches
  2. queen-v18 → Orchestrer workers
  3. parallel-executor-v18 → Exécution (jusqu'à 25 agents)
  4. Merge résultats
  5. self-checker → Validation globale
example: "/parallel 'refactor auth' + 'add tests' + 'update docs'"
```

---

### RECHERCHE & APPRENTISSAGE (7 commandes)

| Command | Primary Agent | Secondary Agents | MCPs Requis | MCPs Optionnels |
|---------|---------------|------------------|-------------|-----------------|
| `/research` | `deep-researcher` | `tech-scout`, `arxiv-researcher` | `firecrawl`, `exa` | `context7` |
| `/deep-research` | `deep-researcher` | `firecrawl-expert` | `firecrawl` | `exa`, `fetch` |
| `/papers` | `arxiv-researcher` | `docling-expert`, `pdf-researcher` | `docling`, `fetch`, `hindsight` | `e2b` |
| `/learn` | `self-improver` | - | `hindsight` | `memory` |
| `/learn-pdf` | `docling-expert` | `pdf-researcher`, `self-improver` | `docling`, `hindsight` | `desktop-commander` |
| `/learn-video` | `video-researcher` | `self-improver` | `fetch`, `hindsight` | - |
| `/profile` | `tech-scout` | `code-reviewer` | `github`, `exa` | - |

#### Détail Workflows Recherche

**`/research [topic]`** - Recherche multi-sources
```yaml
workflow:
  1. exa → Recherche web initiale
  2. firecrawl → Scraping sources pertinentes
  3. context7 → Docs officielles si framework
  4. arxiv-researcher → Papers si académique
  5. Synthèse avec sources citées
example: "/research state management React 2025"
```

**`/deep-research [topic]`** - Recherche approfondie Firecrawl
```yaml
workflow:
  1. firecrawl_map → Découvrir URLs
  2. firecrawl_scrape → Contenu détaillé
  3. firecrawl_extract → Données structurées
  4. Multi-hop reasoning (3-5 niveaux)
  5. Rapport exhaustif avec citations
example: "/deep-research architecture microservices 2025"
```

**`/papers [query]`** - Recherche ArXiv
```yaml
workflow:
  1. fetch → Query ArXiv API
  2. arxiv-researcher → Filtrer papers pertinents
  3. docling-expert → Parser PDFs avec formules LaTeX (v27.2)
  4. pdf-researcher → Analyser contenu structuré
  5. hindsight_retain(bank: 'research') → Sauvegarder
  6. Synthèse académique avec formules préservées
mcps: [docling, fetch, hindsight]
example: "/papers transformer architectures"
```

**`/learn [pattern|content]`** - Sauvegarder apprentissage
```yaml
workflow:
  1. Parser contenu à retenir
  2. hindsight_retain → Sauvegarder dans bank appropriée
  3. memory → Créer entité graphe si pertinent
  4. Confirmer sauvegarde
banks: ["ultra-dev-memory", "patterns", "errors"]
example: "/learn pattern: React Query avec Suspense"
```

**`/learn-pdf [path|url]`** - Analyser PDF
```yaml
workflow:
  1. docling-expert → Parser PDF avec structure (tables, formules, layout) (v27.2)
  2. pdf-researcher → Extraire insights du contenu structuré
  3. hindsight_retain(bank: 'documents') → Sauvegarder
  4. Résumé structuré avec tables et formules préservées
mcps: [docling, hindsight]
fallback: desktop-commander si docling indisponible
example: "/learn-pdf ./docs/architecture.pdf"
```

**`/learn-video [youtube-url]`** - Apprendre depuis YouTube
```yaml
workflow:
  1. fetch → Récupérer transcription
  2. video-researcher → Analyser contenu
  3. Extraire points clés + timestamps
  4. hindsight_retain → Sauvegarder learnings
example: "/learn-video https://youtube.com/watch?v=..."
```

**`/profile [github-user|repo]`** - Analyse profil/repo
```yaml
workflow:
  1. github → Fetch données profil/repo
  2. tech-scout → Analyser stack
  3. code-reviewer → Évaluer qualité (si repo)
  4. Générer rapport détaillé
example: "/profile vercel/next.js"
```

---

### SPÉCIALISÉES (9 commandes)

| Command | Primary Agent | Secondary Agents | MCPs Requis | MCPs Optionnels |
|---------|---------------|------------------|-------------|-----------------|
| `/odoo` | `odoo-expert` | `odoo-orm-expert` | `context7` | `postgres` |
| `/odoo-module` | `odoo-expert` | `backend-developer` | `context7`, `filesystem` | - |
| `/odoo-migrate` | `odoo-expert` | `migration-expert` | `context7`, `hindsight` | - |
| `/odoo-audit` | `odoo-expert` | `code-reviewer`, `security-auditor` | `hindsight` | - |
| `/mql5` | `mql5-expert` | `debugger` | `hindsight`, `desktop-commander` | - |
| `/game` | `game-architect` | `phaser-expert`, `three-expert` | `context7` | `e2b` |
| `/3d` | `3d-artist` | `three-expert`, `webxr-expert` | `context7` | `desktop-commander` |
| `/email` | `email-agent` | `automation-expert` | `fetch` | `puppeteer` |
| `/browser` | `browser-agent` | `web-scraper` | `puppeteer`, `playwright` | `firecrawl` |

#### Détail Workflows Spécialisées

**`/odoo [action] [module]`** - Développement Odoo
```yaml
workflow:
  1. context7 → Docs Odoo version projet
  2. odoo-expert → Action spécifique
  3. odoo-orm-expert → Si manipulation données
  4. postgres → Si queries SQL directes
actions: ["create", "extend", "fix", "test"]
example: "/odoo extend sale_order avec champ custom"
```

**`/odoo-module [name]`** - Scaffolding module Odoo
```yaml
workflow:
  1. wizard-agent → Collecter specs module
  2. odoo-expert → Générer structure
  3. Créer: __manifest__.py, models/, views/, security/
  4. context7 → Best practices Odoo
example: "/odoo-module custom_inventory"
```

**`/odoo-migrate [from] [to]`** - Migration Odoo
```yaml
workflow:
  1. odoo-expert → Analyser incompatibilités
  2. migration-expert → Plan migration
  3. context7 → Docs deux versions
  4. hindsight_recall → Migrations passées
  5. Exécuter avec checkpoints
example: "/odoo-migrate 16.0 17.0"
```

**`/odoo-audit [module]`** - Audit module Odoo
```yaml
workflow:
  1. odoo-expert → Analyse structure
  2. code-reviewer → Qualité code
  3. security-auditor → Vulnérabilités
  4. Rapport avec score et recommandations
example: "/odoo-audit custom_sales"
```

**`/mql5 [type] [strategy]`** - Trading MQL5
```yaml
workflow:
  1. mql5-expert → Développer EA/indicateur
  2. hindsight_recall(bank: 'trading-brain') → Stratégies passées
  3. desktop-commander → Compiler .mq5
  4. debugger → Si erreurs compilation
  5. hindsight_retain → Sauvegarder stratégie
types: ["ea", "indicator", "script", "library"]
example: "/mql5 ea breakout EURUSD H1"
```

**`/game [engine] [genre]`** - Game development
```yaml
workflow:
  1. game-architect → Sélectionner approche
  2. Route vers expert engine:
     - web-2d → phaser-expert
     - web-3d → three-expert
     - native → unity-expert | godot-expert
  3. context7 → Docs engine
  4. templates/manifest.json → Template matching
engines: ["phaser", "three", "unity", "godot", "webxr"]
example: "/game phaser platformer"
```

**`/3d [tool] [action]`** - 3D Development
```yaml
workflow:
  1. 3d-artist → Coordination
  2. Route vers expert:
     - blender → desktop-commander (Blender CLI)
     - three → three-expert
     - webxr → webxr-expert
  3. context7 → Docs outil
tools: ["blender", "three", "unity", "webxr"]
example: "/3d three créer scène avec lighting PBR"
```

**`/email [action]`** - Gmail automation
```yaml
workflow:
  1. email-agent → Action email
  2. automation-expert → Si workflow complexe
  3. fetch → API Gmail si nécessaire
actions: ["read", "compose", "search", "automate"]
example: "/email search factures décembre"
```

**`/browser [action] [target]`** - Browser automation
```yaml
workflow:
  1. browser-agent → Orchestrer automation
  2. puppeteer ou playwright → Exécution
  3. web-scraper → Si extraction données
  4. firecrawl → Fallback si blocage
actions: ["navigate", "scrape", "fill", "screenshot", "test"]
example: "/browser scrape https://example.com/products"
```

---

### DOCUMENTATION & TEAMS (4 commandes)

| Command | Primary Agent | Secondary Agents | MCPs Requis | MCPs Optionnels |
|---------|---------------|------------------|-------------|-----------------|
| `/docs` | `documentation-generator` | `code-reviewer` | `filesystem` | `mermaid` |
| `/init-docs` | `documentation-generator` | `tech-scout` | `filesystem`, `mermaid` | - |
| `/code-team` | `coding-team` | `figma-interpreter`, `fullstack-super` | `figma`, `context7` | `shadcn` |
| `/agency` | `services-agency` | `pm-agent`, `queen-v18` | `sequential-thinking` | - |

#### Détail Workflows Documentation & Teams

**`/docs [type] [scope]`** - Génération documentation
```yaml
workflow:
  1. code-reviewer → Analyser code
  2. documentation-generator → Générer docs
  3. mermaid → Diagrammes si architecture
  4. Écrire fichiers markdown
types: ["api", "readme", "architecture", "changelog", "all"]
example: "/docs api ./src/api"
```

**`/init-docs`** - Initialiser documentation projet
```yaml
workflow:
  1. tech-scout → Détecter stack
  2. documentation-generator → Template docs adapté
  3. Créer structure:
     - README.md
     - docs/ARCHITECTURE.md
     - docs/API.md
     - docs/CONTRIBUTING.md
  4. mermaid → Diagramme architecture initial
example: "/init-docs"
```

**`/code-team [design|screenshot]`** - Team vision-to-code
```yaml
workflow:
  1. figma-interpreter → Analyser design
  2. coding-team → Coordonner implémentation
  3. ui-designer → Composants shadcn
  4. fullstack-super → Code complet
  5. Générer code depuis visuel
example: "/code-team https://figma.com/file/..."
```

**`/agency [task]`** - Analyse multi-agents
```yaml
workflow:
  1. pm-agent → Décomposer tâche
  2. services-agency → Assigner agents spécialisés
  3. queen-v18 → Orchestrer exécution
  4. sequential-thinking → Raisonnement structuré
  5. Synthèse résultats multi-agents
example: "/agency analyser et améliorer performance app"
```

---

### AVANCÉES (7 commandes)

| Command | Primary Agent | Secondary Agents | MCPs Requis | MCPs Optionnels |
|---------|---------------|------------------|-------------|-----------------|
| `/turbo` | `fullstack-super` | `wizard-agent`, `pm-agent` | `context7`, `shadcn`, `supabase` | `github` |
| `/plan` | `pm-agent` | `task-decomposer`, `tree-of-thoughts` | `sequential-thinking` | `mermaid` |
| `/workflow` | `workflow-generator` | `pm-agent` | `mermaid` | - |
| `/uiux` | `ui-ux-team` | `ui-critic`, `design-strategist` | `figma`, `shadcn` | - |
| `/awake` | `intent-parser` | Tous agents meta | `hindsight`, `memory` | Tous |
| `/super` | `queen-v18` | Tous super-agents | Tous | - |
| `/autoupgrade` | `auto-upgrade-agent` | `deep-researcher`, `self-reflection-loop`, `tree-of-thoughts` | `hindsight`, `exa`, `github`, `context7` | `firecrawl`, `sequential-thinking` |

#### Détail Workflows Avancées

**`/turbo [description]`** - Mode création rapide
```yaml
workflow:
  1. Bypass wizard → Décisions automatiques
  2. Stack par défaut (Next.js 15 + Supabase)
  3. templates/manifest.json → Best match
  4. fullstack-super → Génération accélérée
  5. Déploiement auto si configuré
  6. Livraison < 30 minutes
example: "/turbo landing page pour startup IA"
```

**`/plan [feature|project]`** - Planning structuré
```yaml
workflow:
  1. pm-agent → Analyser scope
  2. tree-of-thoughts → Explorer approches
  3. task-decomposer → Sous-tâches atomiques
  4. sequential-thinking → Ordonnancement
  5. mermaid → Diagramme Gantt/flow
  6. TodoWrite → Créer todos
example: "/plan système de notifications push"
```

**`/workflow [name]`** - Définir workflow custom
```yaml
workflow:
  1. workflow-generator → Créer définition
  2. pm-agent → Valider étapes
  3. mermaid → Visualisation
  4. Sauvegarder dans workflows/
example: "/workflow code-review-strict"
```

**`/uiux [target]`** - Feedback UI/UX
```yaml
workflow:
  1. ui-ux-team → Coordination review
  2. ui-critic → Analyse critique
  3. design-strategist → Recommandations
  4. figma → Annotations si design
  5. Rapport avec améliorations prioritaires
example: "/uiux ./src/pages/dashboard"
```

**`/awake`** - Conscience complète
```yaml
workflow:
  1. Load agents/registry.json (127 agents)
  2. Load templates/manifest.json (149 templates)
  3. Load commands/dispatcher.md (42 commandes)
  4. hindsight_recall → Contexte session
  5. memory → Graphe connaissances
  6. Tous MCPs activés
  7. Confirmer: "Conscience complète activée"
alias: ["/wake debug"]
```

**`/super [mode]`** - Mode super-agent
```yaml
workflow:
  1. queen-v18 → Orchestration maximale
  2. Activer tous super-agents:
     - fullstack-super
     - backend-super
     - ui-super
     - deploy-super
     - quality-super
     - research-super
  3. Parallélisme maximum (25 agents)
  4. Mode autonome complet
modes: ["all", "dev", "research", "deploy"]
example: "/super all"
```

**`/autoupgrade [options]`** - Auto-amélioration système (v27.6)
```yaml
description: "Agent auto-upgrade pour amélioration continue ULTRA-CREATE"
architecture: "7 phases avec 22 patterns intégrés"
workflow:
  phase_0_veille:
    description: "Veille continue innovations (background)"
    agent: "innovation-monitor"
    sources: ["arxiv", "github", "anthropic", "openai", "huggingface", "producthunt", "hackernews", "twitter"]
    action: "Scan innovations, flag high-impact pour trigger"

  phase_1_parse:
    description: "Analyse sessions passées"
    agents: ["intent-parser", "session-analyzer"]
    patterns: ["RECON", "MUSE", "Self-Questioning"]
    actions:
      - hindsight_recall(bank: 'ultra-dev-memory', query: 'session summary', top_k: 10)
      - hindsight_recall(bank: 'errors', query: 'recurring errors', top_k: 20)
      - hindsight_recall(bank: 'patterns', query: 'patterns used', top_k: 10)
      - "RECON: Scanner composants ULTRA-CREATE"
      - "Self-Questioning: Générer hypothèses d'upgrade"

  phase_2_diagnose:
    description: "Identifier et prioriser problèmes"
    agents: ["confidence-checker", "self-checker"]
    patterns: ["AutoDetect", "Agent0 Curriculum", "CMP Metric"]
    actions:
      - "Classifier par catégories AutoDetect (Reasoning, Hallucinations, Consistency, Safety, Performance)"
      - "Prioriser P0-P3 avec sévérité calculée"
      - "Calculer CMP Score = (ImmediateImpact × 0.4) + (DescendantPotential × 0.6)"

  phase_3_research:
    description: "Recherche multi-sources parallèle"
    agents: ["deep-researcher", "firecrawl-expert"]
    patterns: ["Multi-Agent 8x", "Self-Navigating", "Context-Engineering"]
    actions:
      - "Self-Navigating: Consulter expériences passées AVANT recherche"
      - "Parallèle jusqu'à 8 agents:"
      - "  - Agent 1: exa web search"
      - "  - Agent 2: github repos"
      - "  - Agent 3: arxiv papers"
      - "  - Agent 4: context7 docs"
      - "  - Agent 5: innovations veille"

  phase_4_synthesize:
    description: "Synthétiser et valider solutions"
    agents: ["tree-of-thoughts", "self-reflection-loop"]
    patterns: ["RISE", "Tree-of-Thoughts", "Self-Reflection", "Verification-First"]
    actions:
      - "Tree-of-Thoughts: 3-5 branches exploration"
      - "RISE: Introspection récursive des propositions"
      - "Self-Reflection: Auto-critique avant présentation"
      - "Verification-First: Valider critères CMP avant proposal"

  phase_5_propose:
    description: "Présenter suggestions à l'utilisateur"
    agents: ["auto-upgrade-agent", "pm-agent"]
    patterns: ["Emergence", "CMP Display"]
    output: "Rapport Markdown structuré avec:"
      - "Score CMP pour chaque suggestion"
      - "Effort/Impact estimés"
      - "Sources citées (Web, GitHub, Papers)"
      - "Cohérence avec existant (%)"
      - "Proposition nouveaux agents si nécessaire"

  phase_6_learn:
    description: "Capturer feedback et améliorer"
    agents: ["self-improver", "auto-retain"]
    patterns: ["Darwin Gödel", "STOP", "Self-Attributing", "ReasoningBank"]
    actions:
      - "Self-Attributing: Attribution causale par étape"
      - "ReasoningBank: Stocker raisonnements réussis (+34.2%)"
      - hindsight_retain(bank: 'patterns', content: '[suggestion acceptée]')
      - "Darwin Gödel: Self-modification si validée"

options:
  --veille: "Scan veille innovations seulement"
  --innovations: "Voir innovations détectées"
  --competitors: "Rapport concurrents"
  --full: "Analyse complète + veille"
  --focus: "Focus domaine: errors|patterns|performance|agents"
  --sessions: "Nombre sessions à analyser (défaut: 10)"
  --research: "Niveau recherche: basic|deep"
  --apply: "Appliquer suggestions automatiquement"

metrics:
  - "CMP Score (Cumulative Metaproductivity)"
  - "Attribution Score (contribution causale)"
  - "Coherence Score (alignement existant)"
  - "Innovation Relevance Score"

triggers_auto:
  conditions:
    - "sessions_count > 10"
    - "recurring_errors > 5"
    - "quality_score < 7"
    - "high_impact_innovation detected"
  enabled: false  # Opt-in
  config: "config/auto-veille-config.json"

examples:
  - "/autoupgrade"
  - "/autoupgrade --veille"
  - "/autoupgrade --focus errors"
  - "/autoupgrade --sessions 50 --research deep"
  - "/autoupgrade --full --apply"
```

---

### SÉCURITÉ (1 commande) - v27.18

| Command | Primary Agent | Secondary Agents | MCPs Requis | MCPs Optionnels |
|---------|---------------|------------------|-------------|-----------------|
| `/security-scan` | `strix-coordinator` | `security-scanner-expert`, `payload-engineer`, `exploit-validator` | `e2b`, `hindsight` | `playwright`, `puppeteer` |

#### Détail Workflow Security

**`/security-scan [target] [--type TYPE]`** - Tests de sécurité autonomes
```yaml
workflow:
  1. RECON
     - strix-coordinator → Orchestrer scan
     - security-scanner-expert → Détecter technologies
     - Lister endpoints et paramètres
  2. CLASSIFY
     - Catégoriser selon security-taxonomy.md
     - Prioriser par risque potentiel
     - Filtrer selon --type si spécifié
  3. GENERATE
     - payload-engineer → Créer payloads adaptatifs
     - Encoder selon contexte d'injection
     - Adaptation au framework détecté
  4. VALIDATE
     - exploit-validator → Analyser résultats
     - Calcul score de confiance
     - Détection faux positifs
  5. REPORT
     - Générer rapport structuré
     - Classer par sévérité (CRITICAL/HIGH/MEDIUM/LOW)
     - Proposer remédiations

options:
  --type: "Types de vulnérabilités à tester (SQLi,XSS,IDOR,SSRF,XXE,RCE,AuthBypass,RaceCondition,CSRF,PrototypePollution)"
  --report: "Niveau de rapport: executive|technical|detailed|full"
  --timeout: "Timeout en secondes (défaut: 300)"
  --depth: "Profondeur d'analyse: 1-3 (défaut: 2)"

safety_boundaries:
  allowed_targets:
    - localhost
    - 127.0.0.1
    - "*.local"
    - "*.test"
    - "*.example"
  blocked_actions:
    - data_exfiltration
    - persistent_backdoor
    - dos_attack
    - lateral_movement

synergy: "security-testing"
knowledge:
  - knowledge/security-taxonomy.md
  - knowledge/strix-patterns.md

examples:
  - "/security-scan http://localhost:3000"
  - "/security-scan http://localhost:3000 --type SQLi,XSS"
  - "/security-scan http://localhost:3000/api --report detailed"
  - "/security-scan https://myapp.local --type IDOR,AuthBypass --depth 3"
```

---

### DATA, MOBILE & CLOUD (5 commandes) - v27.19

| Command | Primary Agent | Secondary Agents | MCPs Requis | MCPs Optionnels |
|---------|---------------|------------------|-------------|-----------------|
| `/data` | `data-engineer` | `analytics-architect`, `vector-db-expert`, `data-modeler` | `supabase`, `postgres`, `hindsight` | `e2b` |
| `/mobile` | routing dynamique | `ui-super`, `figma-interpreter` | `context7`, `hindsight`, `github` | `expo` |
| `/ml` | `ml-engineer` | `llm-integration-expert`, `prompt-engineer`, `vector-db-expert` | `ollama`, `hindsight` | `openai`, `replicate`, `e2b` |
| `/cloud` | routing dynamique | `deployer`, `ci-cd-engineer` | `cloudflare`, `github`, `hindsight` | `kubernetes` |
| `/desktop` | routing dynamique | `fullstack-super`, `ui-super` | `context7`, `hindsight`, `desktop-commander` | - |

#### Détail Workflows Data, Mobile & Cloud

**`/data [action] [description]`** - Data engineering et analytics
```yaml
workflow:
  1. Analyser type de tâche data
  2. data-engineer → ETL, pipelines, data warehouse
  3. analytics-architect → Dashboards, KPIs, BI
  4. vector-db-expert → Embeddings, semantic search (si RAG)
  5. data-modeler → Schema design, ERD
  6. hindsight_retain(bank: 'patterns', content: '[data pattern]')

actions: ["pipeline", "analytics", "schema", "etl", "dashboard", "warehouse", "vector"]

agent_routing:
  - "etl|pipeline|airflow|dbt|kafka" → data-engineer
  - "dashboard|analytics|bi|kpi|metrics" → analytics-architect
  - "vector|embedding|semantic|rag" → vector-db-expert
  - "schema|erd|model" → data-modeler

examples:
  - "/data pipeline ETL avec Airflow vers BigQuery"
  - "/data analytics Dashboard KPIs ventes"
  - "/data vector Store embeddings pour RAG"
  - "/data schema Design base e-commerce"
```

**`/mobile [framework] [description]`** - Développement mobile multi-framework
```yaml
workflow:
  1. Détecter framework ciblé (expo, flutter, ios, android)
  2. Router vers expert spécifique
  3. context7 → Docs framework mobile
  4. ui-super + figma-interpreter → Design mobile
  5. hindsight_recall → Patterns mobile similaires
  6. Génération code mobile

framework_routing:
  - "expo|react native|react-native" → expo-expert
  - "flutter|dart" → flutter-dart-expert
  - "ios|swift|swiftui" → swift-ios-expert
  - "android|kotlin|jetpack" → kotlin-android-expert

secondary: ["ui-super", "figma-interpreter", "accessibility-auditor"]

examples:
  - "/mobile expo App de todo list avec auth"
  - "/mobile flutter E-commerce mobile"
  - "/mobile ios App fitness avec HealthKit"
  - "/mobile android App de livraison avec maps"
```

**`/ml [task] [description]`** - Machine Learning et LLM integration
```yaml
workflow:
  1. Analyser type de tâche ML/AI
  2. ml-engineer → Training, models, inference
  3. llm-integration-expert → LLM APIs, chatbots, RAG
  4. prompt-engineer → Prompt design, few-shot
  5. vector-db-expert → Embeddings storage
  6. mlops-engineer → Model deployment (si deploy)

task_routing:
  - "training|model|sklearn|classification|regression" → ml-engineer
  - "llm|chatbot|rag|langchain|claude|openai" → llm-integration-expert
  - "prompt|few-shot|chain of thought" → prompt-engineer
  - "embedding|vector|semantic" → vector-db-expert
  - "deploy|mlops|serve" → mlops-engineer
  - "pytorch|tensor|deep learning" → pytorch-expert
  - "tensorflow|keras" → tensorflow-expert

examples:
  - "/ml rag Système RAG avec Claude et Pinecone"
  - "/ml training Classification de sentiments"
  - "/ml prompt System prompt pour assistant code"
  - "/ml deploy Pipeline MLOps avec MLflow"
```

**`/cloud [provider] [description]`** - Cloud architecture et deployment
```yaml
workflow:
  1. Détecter provider cloud ciblé
  2. Router vers expert cloud spécifique
  3. ci-cd-engineer → Setup pipeline CI/CD
  4. security-auditor → Audit config cloud
  5. deployer → Exécution déploiement

provider_routing:
  - "aws|lambda|s3|ec2|dynamodb|rds" → aws-architect
  - "k8s|kubernetes|helm|pod|ingress" → kubernetes-expert
  - "cloudflare|workers|pages" → cloud-deploy-expert
  - "vercel" → vercel-expert
  - "gcp|google cloud" → cloud-deploy-expert

secondary: ["deployer", "ci-cd-engineer", "security-auditor"]

examples:
  - "/cloud aws Lambda functions avec DynamoDB"
  - "/cloud k8s Deployment Kubernetes avec Helm"
  - "/cloud cloudflare Workers edge functions"
```

**`/desktop [framework] [description]`** - Applications desktop
```yaml
workflow:
  1. Détecter framework desktop ciblé
  2. Router vers expert spécifique
  3. context7 → Docs framework desktop
  4. fullstack-super + ui-super → Code app
  5. Génération structure projet desktop

framework_routing:
  - "tauri" → tauri-expert
  - "electron" → electron-ipc-expert
  - "default" → tauri-expert  # Tauri recommandé par défaut

secondary: ["fullstack-super", "ui-super", "security-auditor"]

examples:
  - "/desktop tauri App notes markdown"
  - "/desktop electron Gestionnaire de fichiers"
```

---

### ODOO DOMAIN ROUTING (v27.19)

La commande `/odoo` route maintenant vers les experts domaine spécifiques:

```yaml
/odoo domain_routing:
  - "accounting|invoice|tax|fiscal|ledger|journal" → odoo-accounting-expert
  - "manufacturing|mrp|bom|production|work order" → odoo-manufacturing-expert
  - "pos|point of sale|retail|cash register" → odoo-retail-pos-expert
  - "hotel|hospitality|booking|reservation" → odoo-hospitality-expert
  - "integration|api|connector|webhook" → odoo-integration-expert
  - "education|school|student|course" → odoo-education-expert
  - "event|conference|ticket|registration" → odoo-events-expert
  - "restaurant|food|beverage|menu" → odoo-food-beverage-expert
  - "healthcare|patient|clinic|medical" → odoo-healthcare-expert
  - "real estate|property|lease|rental" → odoo-realestate-expert
  - "field service|technician|maintenance" → odoo-field-service-expert

secondary_always: ["odoo-expert", "odoo-orm-expert"]

examples:
  - "/odoo accounting Module de facturation automatique"
  - "/odoo manufacturing MRP avec nomenclatures"
  - "/odoo pos Point de vente restaurant"
  - "/odoo healthcare Gestion cabinet médical"
```

---

### SKILLS MANAGEMENT (v28.5)

**`/skill [subcommand]`** - Gestion des Agent Skills (agentskills.io)
```yaml
workflow:
  1. Parse subcommand
  2. Execute skill operation
  3. Update manifest si modification
  4. Sync avec registry si nécessaire

subcommands:
  list:
    description: "Liste toutes les skills (exported + community)"
    workflow:
      1. Lire skills/manifest.json
      2. Afficher exported skills
      3. Afficher community skills
      4. Indiquer statut activation
    example: "/skill list"

  import:
    description: "Importer skill depuis GitHub"
    workflow:
      1. Clone repo spécifié
      2. Copier skill vers skills/community/
      3. Valider SKILL.md format
      4. Exécuter import-skill.cjs
      5. Ajouter routing dans auto-discovery
    example: "/skill import anthropics/skills/docx"
    example: "/skill import owner/repo --skill skill-name"

  export:
    description: "Exporter commande ULTRA-CREATE comme skill"
    workflow:
      1. Lire workflow depuis dispatcher.md
      2. Lire agents depuis registry.json
      3. Générer SKILL.md format agentskills.io
      4. Créer structure skill (references/, scripts/)
      5. Mettre à jour manifest
    example: "/skill export create"
    example: "/skill export debug"

  sync:
    description: "Synchroniser manifest avec skills actuelles"
    workflow:
      1. Scanner skills/community/
      2. Scanner skills/exported/
      3. Mettre à jour manifest.json
      4. Vérifier intégrité registry
    example: "/skill sync"

  info:
    description: "Afficher détails d'une skill"
    workflow:
      1. Lire SKILL.md de la skill
      2. Afficher metadata (name, description, license)
      3. Afficher capabilities
      4. Afficher triggers configurés
    example: "/skill info docx"

primary_agent: wizard-agent
secondary_agents: ["intent-parser"]
mcps: []
priority: low

skill_capabilities:
  - "Document Processing: docx, xlsx, pptx, pdf"
  - "Development: webapp-testing, mcp-builder, web-artifacts-builder"
  - "Meta: skill-creator"

triggers:
  - "skill"
  - "skills"
  - "importer skill"
  - "agent skill"
  - "community skill"
```

---

### SPEC-DRIVEN DEVELOPMENT (v28.6)

| Command | Primary Agent | Secondary Agents | MCPs Requis | MCPs Optionnels |
|---------|---------------|------------------|-------------|-----------------|
| `/spec` | `spec-architect` | `wizard-agent`, `pm-agent`, `tester` | `hindsight`, `context7` | `github` |

**`/spec [subcommand]`** - Spec-Driven Development
```yaml
description: "Workflow SDD complet: specs executables → code deterministe"
source: "GitHub Spec Kit + Thoughtworks + Amazon Kiro"
impact: "+30-50% fiabilite code genere"

workflow:
  Voir detail subcommands ci-dessous

primary_agent: spec-architect
secondary_agents: [wizard-agent, pm-agent, tester, database-architect]
mcps: [hindsight, context7, github]

subcommands:
  init:
    description: "Initialiser projet SDD avec constitution"
    workflow:
      1. Collecter informations projet (wizard-agent)
      2. Generer specs/constitution.md depuis template
      3. Definir stack technologique
      4. Configurer .specrc.json si necessaire
      5. hindsight_retain(bank: 'patterns', content: 'SDD project initialized')
    output: "specs/constitution.md + structure projet SDD"
    example: "/spec init MonProjet"

  feature:
    description: "Creer specification pour nouvelle feature"
    workflow:
      1. Parser description feature
      2. Assigner numero sequentiel (001, 002...)
      3. Generer specs/NNN-feature/spec.md depuis template
      4. Identifier User Stories + Acceptance Criteria
      5. Marquer [NEEDS CLARIFICATION] si ambigu
      6. Lister NFRs (performance, security, a11y)
      7. github → Creer branche feature si repo
    output: "specs/NNN-feature/spec.md"
    example: "/spec feature Systeme de notifications push"

  plan:
    description: "Generer plan technique depuis spec approuvee"
    workflow:
      1. Lire spec.md de la feature
      2. Valider compliance constitution (7 articles)
      3. context7 → Docs frameworks pour architecture
      4. Generer plan.md (architecture composants)
      5. Generer data-model.md (schemas DB + TypeScript types)
      6. Generer contracts/ (API endpoints)
      7. database-architect → Review data model
    output: "plan.md + data-model.md + contracts/"
    example: "/spec plan"

  tasks:
    description: "Decomposer plan en taches executables"
    workflow:
      1. Analyser plan.md
      2. Decomposer en taches atomiques (T1, T2...)
      3. Identifier dependances (Tn → Tm)
      4. Marquer taches parallelisables [PARALLEL]
      5. Estimer complexite (S/M/L/XL)
      6. Generer diagramme execution
      7. Creer tasks.md
    output: "specs/NNN-feature/tasks.md"
    example: "/spec tasks"

  implement:
    description: "Executer implementation selon tasks.md"
    workflow:
      1. Lire tasks.md
      2. Pour chaque tache (respect ordre + dependances):
         a. RED: tester → Ecrire test qui echoue
         b. GREEN: Generer code minimal qui passe
         c. VERIFY: Valider contre acceptance criteria
      3. Merge quand tous tests passent
      4. hindsight_retain(bank: 'patterns', content: '[implementation pattern]')
    test_first: true  # Article III obligatoire
    output: "Code + Tests implementes"
    example: "/spec implement"

  verify:
    description: "Valider implementation contre specification"
    workflow:
      1. Lire spec.md acceptance criteria
      2. tester → Executer tous tests
      3. Valider chaque AC (checkboxes)
      4. Mesurer NFRs (performance, etc.)
      5. Valider compliance constitution
      6. Generer verification-report.md
      7. Recommander APPROVED ou NEEDS_WORK
    output: "specs/NNN-feature/verification-report.md"
    example: "/spec verify"

  status:
    description: "Afficher statut specs projet"
    workflow:
      1. Scanner specs/
      2. Lister features avec statut
      3. Calculer progression globale
      4. Identifier blockers ([NEEDS CLARIFICATION])
    output: "Tableau statut features"
    example: "/spec status"

triggers:
  - "spec"
  - "specification"
  - "SDD"
  - "requirements"
  - "plan technique"
  - "task breakdown"
  - "acceptance criteria"

constitution_articles:
  I: "Library-First Principle"
  II: "CLI Interface Mandate"
  III: "Test-First Imperative"
  IV: "Specification Authority"
  V: "Uncertainty Marking"
  VI: "Simplicity Gate"
  VII: "Integration Testing"

markers:
  "[NEEDS CLARIFICATION]": "Requirement ambigu - DOIT etre resolu"
  "[ASSUMPTION]": "Decision prise sans requirement explicite"
  "[RISK]": "Risque identifie - mitigation requise"
  "[PARALLEL]": "Tache parallelisable"
  "[DEPENDS: Tn]": "Tache bloquee par Tn"

templates:
  - templates/sdd/constitution-template.md
  - templates/sdd/spec-template.md
  - templates/sdd/plan-template.md
  - templates/sdd/data-model-template.md
  - templates/sdd/tasks-template.md
  - templates/sdd/verification-template.md

knowledge:
  - knowledge/reference/sdd-patterns.md

examples:
  - "/spec init MonSaaS"
  - "/spec feature Authentification OAuth2"
  - "/spec plan"
  - "/spec tasks"
  - "/spec implement"
  - "/spec verify"
  - "/spec status"
```

---

## Quick Reference

### Par Catégorie d'Intent

| Intent Utilisateur | Commande Recommandée |
|-------------------|---------------------|
| "Crée-moi un site/app" | `/create` ou `/turbo` |
| "J'ai une erreur" | `/debug` |
| "Améliore ce code" | `/refactor` ou `/optimize` |
| "Ajoute un composant" | `/generate component` |
| "Teste l'app" | `/test` |
| "Déploie le projet" | `/deploy` |
| "Recherche sur..." | `/research` ou `/deep-research` |
| "Fais un jeu" | `/game` |
| "Module Odoo" | `/odoo-module` |
| "Expert Advisor MT5" | `/mql5 ea` |
| "Audit sécurité" | `/security-scan` |
| "Pipeline data/ETL" | `/data` |
| "App mobile" | `/mobile` |
| "Machine Learning/LLM" | `/ml` |
| "Architecture cloud" | `/cloud` |
| "App desktop" | `/desktop` |
| "Gérer skills" | `/skill` |
| "Spec/Requirements" | `/spec` |

### Par Complexité

| Niveau | Commandes |
|--------|-----------|
| **Simple** | `/scaffold`, `/generate`, `/test`, `/docs` |
| **Intermédiaire** | `/create`, `/debug`, `/refactor`, `/deploy` |
| **Avancé** | `/turbo`, `/plan`, `/agency`, `/super`, `/security-scan` |
| **Expert** | `/parallel`, `/migrate`, `/deep-research` |

---

## Fallback Naturel

Si aucune commande slash n'est utilisée, le système:

1. **Intent Parser** analyse le langage naturel
2. **Lookup** dans cette table de dispatch
3. **Route** vers la commande équivalente
4. **Execute** workflow correspondant

Exemples:
- "Crée un SaaS" → `/create` workflow
- "Y'a un bug" → `/debug` workflow
- "Mets en prod" → `/deploy` workflow

---

*Commands Dispatcher v28.6 - 50 commandes routées + Agent Skills + SDD (Spec-Driven Development) + routing dynamique*
