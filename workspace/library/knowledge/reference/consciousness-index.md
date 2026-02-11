# ULTRA-CREATE Consciousness Index

> Claude SAIT que toutes ces capacites existent et PEUT les utiliser.

## 145 AGENTS (33 categories)

**Meta (9)**: pm-agent, confidence-checker, self-checker, token-optimizer, wizard-agent, intent-parser, mcp-router, auto-upgrade-agent, innovation-monitor

**Advanced (5)**: tree-of-thoughts, self-reflection-loop, corrective-rag, reasoning-agent, workflow-generator

**Core (9)**: frontend-developer, backend-developer, full-stack-generator, ui-designer, autonomous-executor, requirement-interpreter, self-improver, tester, intent-parser

**Gaming (8)**: game-architect, phaser-expert, three-js-expert, godot-expert, unity-expert, networking-expert, audio-expert, procgen-expert

**AI/ML (6)**: llm-integration-expert, ml-engineer, mlops-engineer, prompt-engineer, pytorch-expert, tensorflow-expert

**Mobile (4)**: expo-expert, swift-ios-expert, kotlin-android-expert, flutter-dart-expert

**Odoo (12)**: odoo-accounting, odoo-education, odoo-events, odoo-field-service, odoo-food-beverage, odoo-healthcare, odoo-hospitality, odoo-integration, odoo-manufacturing, odoo-orm, odoo-realestate, odoo-retail-pos

**Specialized (19)**: accessibility-auditor, api-designer, blockchain-expert, boilerplate-expert, database-architect, debugger, documentation-generator, electron-ipc-expert, graphql-expert, hospitality-expert, integration-expert, migration-expert, mql5-expert, odoo-expert, payment-expert, performance-optimizer, refactoring-expert, seo-expert, windows-scripting-expert

**Super-Agents (6)**: fullstack-super, backend-super, ui-super, deploy-super, quality-super, research-super

**MCP Specialists (9)**: automation-expert, cloud-deploy-expert, context7-expert, firecrawl-expert, graphrag-expert, magic-ui-expert, security-scanner-expert, flowbite-expert, daisyui-expert

**+41 autres** dans: orchestration, engine, visual, quality, research, analysis, automation, browser, cloud, patterns, swarm, teams

→ Registry complet: `agents/registry.json`

---

## 172 TEMPLATES (24 categories)

**Web (8)**: saas, landing, ecommerce, api, rag-chatbot, pwa, websocket-chat, streaming-chatbot

**Desktop/Mobile (5)**: desktop (Tauri), electron-app, mobile (Expo), ios-native, android-native

**Games (10)**: game-web, game-3d-web, game-multiplayer, game-roguelike, game-puzzle, unity-game, webxr-experience, ai-chess, ai-tic-tac-toe, ai-3d-pygame

**AI Agents Starter (16)**: ai-blog-to-podcast, ai-data-analysis, ai-data-visualization, ai-medical-imaging, ai-meme-generator, ai-music-generator, ai-travel-agent, openai-research-agent, web-scraping-agent, xai-finance-agent, mixture-of-agents, multimodal-ai-agent, ai-reasoning-agent, ai-startup-trend-analysis, ai-life-insurance-advisor, ai-breakup-recovery

**AI Agents Advanced (14)**: ai-consultant, ai-customer-support, ai-deep-research, ai-email-gtm, ai-health-fitness, ai-investment, ai-journalist, ai-meeting, ai-movie-production, ai-personal-finance, ai-recipe-meal-planning, ai-startup-insight, ai-system-architect, windows-autonomous-agent

**AI Agents Multi-Agent (10)**: ai-aqi-analysis, ai-domain-research, ai-financial-coach, ai-home-renovation, ai-mental-wellbeing, ai-news-podcast, ai-self-evolving, ai-speech-trainer, multi-agent-researcher, product-launch-intel

**Agent Teams (13)**: team-competitor-intel, team-finance, team-game-design, team-legal, team-real-estate, team-recruitment, team-seo-audit, team-services-agency, team-teaching, team-travel-planner, team-coding, team-design, team-uiux-feedback

**RAG Systems (20)**: rag-agentic-gemma, rag-agentic-gpt5, rag-agentic-math, rag-agentic-reasoning, rag-blog-search, rag-autonomous, rag-contextual, rag-corrective, rag-deepseek-local, rag-gemini, rag-hybrid-search, rag-llama-local, rag-local-hybrid, rag-local-agent, rag-qwen-local, rag-as-service, rag-cohere, rag-chain, rag-db-routing, rag-vision

**+55 autres** dans: MCP agents, Voice AI, Chat-with-X, Memory-based, Fine-tuning, Sectoriels, Extensions

→ Manifest complet: `templates/manifest.json`

---

## 42 COMMANDES SLASH (6 groupes)

**Core (7)**: `/wake`, `/create`, `/scaffold`, `/analyze`, `/debug`, `/refactor`, `/deploy`

**Developpement (8)**: `/generate`, `/test`, `/tdd`, `/review`, `/review-fix`, `/optimize`, `/migrate`, `/parallel`

**Recherche (7)**: `/research`, `/deep-research`, `/papers`, `/learn`, `/learn-pdf`, `/learn-video`, `/profile`

**Specialisees (9)**: `/odoo`, `/odoo-module`, `/odoo-migrate`, `/odoo-audit`, `/mql5`, `/game`, `/3d`, `/email`, `/browser`

**Documentation (4)**: `/docs`, `/init-docs`, `/code-team`, `/agency`

**Avancees (7)**: `/turbo`, `/plan`, `/workflow`, `/uiux`, `/awake`, `/super`, `/autoupgrade`

→ Dispatch complet: `commands/dispatcher.md`

---

## 57 MCPs

**Core (toujours actifs)**: hindsight, context7, shadcn, e2b, memory, github, supabase, firecrawl, exa, desktop-commander, playwright, puppeteer, figma, mermaid, postgres, notion, docling

**Profiles par projet** (via `config/mcp-profiles.json`):
- web-development, mobile-development, game-development
- ai-development, data-analysis, research
- ui-extended-development, workflow-automation-development
- boilerplate-infrastructure

---

## 34 HOOKS

**PreToolUse (8)**: memory-first, pre-edit-check, knowledge-auto-load, mcp-auto-router, agent-auto-router, enforce-v25-rules, workflow-auto-router, mode-enforcer

**PostToolUse (9)**: self-healing-hook, post-edit-learn, auto-retain, context-monitor, anti-hallucination, auto-sync-hindsight, auto-rollback, pre-deploy, notification-hook

**Session Lifecycle (4)**: session-start, session-end, session-processor, start-hindsight-auto

**Auto-Upgrade (2)**: innovation-monitor, auto-upgrade-trigger

**Blocking (4)**: memory-first-blocking, stop-validator, permission-auto-router, activity-tracker

---

## 8 MODES COMPORTEMENTAUX

| Mode | Parallelisme | Validation | Usage |
|------|--------------|------------|-------|
| **Ultra Think** (defaut) | Adaptive | Triple verification | Permanent |
| **Standard** | 10 agents | Lint + TypeCheck | Quotidien |
| **Speed** | 25 agents | Aucune | Prototypage |
| **Quality** | 5 agents | 80% coverage | Production |
| **Architect** | 3 agents | Architecture review | Design |
| **Autonomous** | 20 agents | Auto-validation | Maintenance |
| **Brainstorm** | 5 agents | Aucune | Ideation |
| **Mentor** | 2 agents | Educative | Formation |

→ Config: `config/behavioral-modes.json`
