# ULTRA-CREATE v27.18 - Inventaire Systeme Complet

> Charge automatiquement via /wake pour conscience complete du systeme
> Derniere mise a jour: 2026-01-12

---

## Resume Executif

| Composant | Compte | Localisation |
|-----------|--------|--------------|
| **Templates** | 172 | `templates/manifest.json` |
| **Agents** | 154 | `agents/registry.json` |
| **MCPs** | 54+ directs | `.mcp.json` |
| **Commandes** | 43 | `commands/dispatcher.md` |
| **Hooks** | 35 | `scripts/hooks/` |
| **Knowledge** | 351 fichiers | `knowledge/` |
| **Configs** | 24 | `config/` |

---

## 1. TEMPLATES (172)

### Categories (24)

| Categorie | Compte | Exemples |
|-----------|--------|----------|
| Web Apps | 8 | saas, landing, ecommerce, api, rag-chatbot |
| Desktop/Mobile | 5 | tauri, electron, expo, ios, android |
| Extensions | 2 | chrome-extension, discord-bot |
| Games | 10 | phaser, threejs, unity, multiplayer, roguelike |
| AI Starter | 16 | blog-to-podcast, data-analysis, meme-generator |
| AI Advanced | 19 | consultant, deep-research, journalist, architect |
| AI Multi-Agent | 10 | financial-coach, mental-wellbeing, multi-researcher |
| Teams | 13 | competitor-intel, legal, recruitment, coding |
| RAG | 22 | agentic, contextual, corrective, vision |
| MCP | 5 | travel-planner, browser, github, multi, notion |
| Voice | 3 | audio-tour, customer-support, voice-rag |
| Chat | 7 | github, gmail, pdf, arxiv, youtube |
| Memory | 6 | arxiv, travel, stateful, personalized |
| Finetuning | 3 | gemma, llama, token-optimization |
| Sectorial | 15 | blog, restaurant, medical, wedding, fitness |
| Course | 2 | google-adk, openai-sdk |
| Extra | 4 | cursor-experiments, resume-matcher |

### Commande
```
/scaffold [template-id] [project-name]
```

---

## 2. AGENTS (154)

### Categories (32)

| Categorie | Agents |
|-----------|--------|
| **meta** | intent-parser, pm-agent, wizard-agent, confidence-checker, vibe-state-detector |
| **core** | frontend-developer, backend-developer, fullstack-super, tester, ui-designer |
| **super-agents** | fullstack-super, backend-super, ui-super, deploy-super, quality-super |
| **game** | game-architect, phaser-expert, threejs-expert, unity-expert, godot-expert |
| **ai-ml** | ml-engineer, llm-integration, pytorch-expert, prompt-engineer |
| **orchestration** | queen-v18, task-decomposer, swarm-coordinator, worker-protocol |
| **specialized** | payment-expert, seo-expert, accessibility-auditor, performance-optimizer |
| **security** | security-auditor, strix-analyst, exploit-validator |
| **odoo** | odoo-expert, odoo-migration, odoo-customizer |
| **research** | research-super, arxiv-researcher, github-analyst |
| **deploy** | deploy-super, cloud-deploy-expert, vercel-expert |

### Selection Automatique
- Tache frontend → frontend-developer + ui-designer
- Tache backend → backend-developer + database-expert
- Tache complexe → fullstack-super + pm-agent
- Tache game → game-architect + phaser/unity-expert
- Tache deploy → deploy-super + cloud-deploy-expert

---

## 3. MCPs (54+ directs)

### Essentiels

| MCP | Usage | Auto-Selection |
|-----|-------|----------------|
| **hindsight** | Memoire persistante | Toujours |
| **context7** | Documentation frameworks | Code framework |
| **shadcn** | Composants UI | Frontend |
| **supabase** | Database + Auth | Backend |
| **github** | Operations Git | Commits, PRs |
| **playwright** | Tests browser | Testing, E2E |
| **e2b** | Execution sandbox | Code execution |
| **docker-mcp** | Gateway 100+ MCPs | Docker compose |

### Par Domaine

| Domaine | MCPs |
|---------|------|
| Database | supabase, postgres, sqlite, prisma, neo4j |
| AI/ML | openai, replicate, huggingface, ollama |
| Search | firecrawl, tavily, exa, fetch |
| Design | figma, shadcn, magic-ui |
| Deploy | cloudflare, vercel, sentry |
| Automation | playwright, puppeteer, browserbase |

---

## 4. COMMANDES (43)

### Core (7)
| Commande | Usage |
|----------|-------|
| `/wake` | Activer conscience complete |
| `/create` | Nouveau projet depuis description |
| `/scaffold` | Projet depuis template |
| `/analyze` | Analyser codebase |
| `/debug` | Debugger erreur |
| `/refactor` | Refactoriser code |
| `/deploy` | Deployer projet |

### Development (8)
| Commande | Usage |
|----------|-------|
| `/generate` | Generer code/composants |
| `/test` | Lancer tests |
| `/tdd` | Test-Driven Development |
| `/review` | Code review |
| `/review-fix` | Review + auto-fix |
| `/optimize` | Optimiser performance |
| `/migrate` | Migration framework |
| `/parallel` | Execution parallele |

### Research (7)
| Commande | Usage |
|----------|-------|
| `/research` | Recherche rapide |
| `/deep-research` | Recherche approfondie |
| `/papers` | Papers ArXiv |
| `/learn` | Apprendre source |
| `/learn-pdf` | Analyser PDF |
| `/learn-video` | Apprendre YouTube |
| `/profile` | Profil GitHub |

### Specialized (9)
| Commande | Usage |
|----------|-------|
| `/odoo` | Dev Odoo |
| `/odoo-module` | Nouveau module Odoo |
| `/odoo-migrate` | Migration Odoo |
| `/odoo-audit` | Audit module Odoo |
| `/mql5` | Trading MQL5 |
| `/game` | Dev jeux |
| `/3d` | Dev 3D |
| `/email` | Automation email |
| `/browser` | Automation browser |

### Advanced (8)
| Commande | Usage |
|----------|-------|
| `/turbo` | Mode turbo (speed) |
| `/plan` | Planification projet |
| `/workflow` | Workflow custom |
| `/uiux` | Review UI/UX |
| `/awake` | Force wake complet |
| `/super` | Mode super-agent |
| `/autoupgrade` | Auto-amelioration |
| `/security-scan` | Scan securite |

---

## 5. HOOKS (35)

### PreToolUse (Avant action)
1. `memory-first-blocking.cjs` - Rappel memoire obligatoire
2. `knowledge-auto-load.js` - Chargement knowledge contextuel
3. `agent-auto-router.js` - Selection agent automatique
4. `mcp-auto-router.js` - Selection MCP automatique
5. `mode-enforcer.js` - Application mode comportemental

### PostToolUse (Apres action)
1. `activity-tracker.cjs` - Tracking activite
2. `post-edit-learn.js` - Apprentissage post-edit
3. `auto-retain.js` - Sauvegarde patterns automatique
4. `auto-sync-hindsight.js` - Sync memoire Hindsight
5. `context-monitor.js` - Monitoring contexte

### Stop (Avant arret)
1. `stop-validator.cjs` - Validation taches completes

---

## 6. MEMOIRE HINDSIGHT

### Banks Disponibles

| Bank | ID | Usage |
|------|-----|-------|
| patterns | ultra-patterns-memory | Patterns reutilisables |
| errors | ultra-errors-memory | Erreurs resolues |
| development | ultra-dev-memory | Context projet |
| documents | ultra-documents-memory | PDFs analyses |
| research | ultra-research-memory | Papers ArXiv |
| trading | ultra-trading-memory | Strategies trading |

### Protocole
```javascript
// AVANT action
hindsight_recall({bank: 'patterns', query: '[type]', top_k: 5})
hindsight_recall({bank: 'errors', query: '[erreur]', top_k: 5})

// APRES action
hindsight_retain({bank: 'patterns', content: '[pattern appris]'})
```

---

## 7. SELECTION AUTOMATIQUE

### Templates
| Intent | Template |
|--------|----------|
| "creer SaaS" | saas |
| "landing page" | landing |
| "e-commerce" | ecommerce |
| "chatbot IA" | rag-chatbot |
| "jeu 2D" | game-web |
| "app mobile" | mobile |
| "app desktop" | desktop |

### MCPs
| Context | MCP |
|---------|-----|
| React/Next.js | context7 |
| Composants UI | shadcn |
| Database | supabase |
| Tests E2E | playwright |
| Recherche web | firecrawl |
| Git operations | github |

### Agents
| Tache | Agents |
|-------|--------|
| Frontend | frontend-developer, ui-designer |
| Backend | backend-developer, database-expert |
| Full-stack | fullstack-super |
| Games | game-architect |
| Security | security-auditor |
| Deploy | deploy-super |

---

## 8. FICHIERS CRITIQUES

| Fichier | Role |
|---------|------|
| `CLAUDE.md` | Instructions systeme |
| `agents/registry.json` | Registry agents |
| `templates/manifest.json` | Catalog templates |
| `.mcp.json` | Configuration MCPs |
| `commands/dispatcher.md` | Routing commandes |
| `config/hook-registry.json` | Orchestration hooks |
| `config/agent-synergies.json` | Synergies agents |
| `knowledge/NAVIGATOR.md` | Navigation knowledge |

---

*ULTRA-CREATE v27.18 STRIX SECURITY - Inventaire Systeme Complet*
