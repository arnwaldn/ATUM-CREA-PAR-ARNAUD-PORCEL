# Knowledge Index - Auto-Discovery

> **Version**: v2.0 (ATUM CREA)
> **Location**: `C:\Users\arnau\Desktop\ATUM CREA\library\knowledge\`
> **Usage**: Claude consulte cet index pour trouver les fichiers pertinents selon le contexte
> **Fichiers**: 175+ knowledge files

---

## Routing Contextuel

### Par Type de Demande

| Contexte Détecté | Fichiers à Consulter | Priorité |
|------------------|---------------------|----------|
| **Nouveau projet** | `stack-2025.md`, `vibe-coding-methodology.md` | HAUTE |
| **Debug/Erreur** | `memory-bank-patterns.md` (recall errors bank) | HAUTE |
| **UI/Frontend** | `anthropic-best-practices-2025.md`, `web-vitals-guide.md` | MOYENNE |
| **Choix design UI/UX** | `design-intelligence.md` (couleurs, typo, patterns, checklist) | HAUTE |
| **Game dev** | `gaming/*.md` | HAUTE |
| **Framework inconnu** | Context7 resolve + get-library-docs | HAUTE |
| **Reprise projet** | `memory-bank-patterns.md` (recall development bank) | HAUTE |
| **Optimisation** | `web-vitals-guide.md`, `anthropic-best-practices-2025.md` | MOYENNE |
| **Integration MCP** | `docker-mcp-registry.md`, `mcp-servers-recommended.md` | HAUTE |
| **Multimedia/Audio** | `docker-mcp-registry.md` (ElevenLabs, FFmpeg) | MOYENNE |
| **Workflow/Automation** | `docker-mcp-registry.md` (n8n, Slack) | MOYENNE |
| **Architecture/Diagrammes** | `mermaid-diagrams-guide.md` | MOYENNE |
| **Parallelisation taches** | `wave-execution-pattern.md` (dependency analysis) | HAUTE |
| **Animations/Effets visuels** | `creative-web-animations.md` (GSAP, WebGL, scroll, hover, transitions) | HAUTE |
| **Site premium/Award** | `creative-web-animations.md` + `design-intelligence.md` | HAUTE |
| **Commerce agentique/UCP** | `ucp-commerce-protocol.md` (discovery, checkout, cart, MCP binding, AP2) | HAUTE |
| **E-commerce + AI agents** | `ucp-commerce-protocol.md` + `stripe-patterns.md` (section UCP) | HAUTE |
| **Marketplace/Multi-provider** | `ucp-commerce-protocol.md` + `stripe-patterns.md` (Connect) | MOYENNE |
| **Document parsing (PDF/DOCX/PPTX)** | `docling-patterns.md` + activer MCP `docling` | HAUTE |
| **OCR / documents scannes** | `docling-patterns.md` (OCR standard) ou `paddleocr-patterns.md` (multilingue/manuscrits) | HAUTE |
| **Audio transcription** | `docling-patterns.md` (ASR pipeline WAV/MP3/VTT) | MOYENNE |
| **Paiement/Stripe** | `stripe-patterns.md` (Connect, subscriptions, webhooks) | HAUTE |
| **Securite** | `security-taxonomy.md`, `production-checklist.md` | HAUTE |
| **Clone/inspire par X** | `clone-wars-catalog.md` (300+ clones open-source) | HAUTE |
| **Agents IA autonomes** | `autonomous-agents-guide.md` | HAUTE |
| **GraphRAG/Knowledge Graph** | `graphrag-patterns.md`, `gnn-query-patterns.md` | HAUTE |
| **Odoo/ERP** | `odoo/*.md` (15 guides specialises) | HAUTE |
| **Supabase SSR** | `supabase-ssr-patterns.md` | MOYENNE |
| **Electron/Desktop** | `electron-patterns.md` | MOYENNE |
| **Chrome Extension** | `chrome-workflows-guide.md` | MOYENNE |
| **Nocode/Low-code** | `nocode-ux-patterns.md`, `claude-code-nocode-patterns.md` | MOYENNE |
| **Deployment/Production** | `production-checklist.md`, `vercel-advanced-patterns.md` | HAUTE |
| **Scraping web** | `puppeteer-vs-playwright.md` | MOYENNE |
| **Video/Multimedia** | `video-analysis-patterns.md` | MOYENNE |
| **Licences open-source** | `software-licenses-guide.md` | BASSE |
| **Onboarding** | `onboarding/LEVEL-1-QUICKSTART.md` a `LEVEL-4-EXPERT.md` | BASSE |
| **Internationalisation/i18n** | `i18n-patterns.md` (next-intl, routing, ICU) | HAUTE |
| **Temps reel/Realtime** | `realtime-patterns.md` (Supabase Broadcast, Presence, Postgres Changes) | HAUTE |
| **Upload fichiers** | `file-upload-patterns.md` (signed URLs, Supabase Storage, UploadThing, S3) | HAUTE |
| **State management** | `state-management-patterns.md` (Zustand + TanStack Query) | HAUTE |
| **Auth avancee/Passkeys** | `advanced-auth-patterns.md` (WebAuthn, SimpleWebAuthn, MFA TOTP) | HAUTE |
| **Monitoring/Observabilite** | `monitoring-observability-patterns.md` (Sentry, OpenTelemetry, Pino) | HAUTE |
| **CI/CD** | `cicd-github-actions-patterns.md` (GitHub Actions, Vercel deploy) | HAUTE |
| **CMS/Contenu** | `headless-cms-patterns.md` (Payload CMS, Sanity, Strapi) | MOYENNE |
| **Emails transactionnels** | `email-patterns.md` (React Email + Resend) | MOYENNE |
| **Notifications push** | `notifications-patterns.md` (Expo, Web Push, In-App, multi-canal) | MOYENNE |
| **Recherche/Search** | `search-engine-patterns.md` (Meilisearch, InstantSearch) | MOYENNE |
| **Load testing** | `load-testing-patterns.md` (k6, GitHub Actions) | BASSE |
| **Queues/Background jobs** | `queue-patterns.md` (Inngest serverless, BullMQ self-hosted) | MOYENNE |
| **IoT/Capteurs** | `iot-patterns.md` (MQTT, Edge Functions, dashboard) | BASSE |
| **Data engineering/ETL** | `data-engineering-patterns.md` (ETL, Event Sourcing, Materialized Views) | BASSE |

---

## Fichiers Disponibles

### Core Methodology
| Fichier | Description | Quand Lire |
|---------|-------------|------------|
| `vibe-coding-methodology.md` | Workflow autonome ATUM CREA | Tout nouveau projet |
| `memory-bank-patterns.md` | Patterns Hindsight 6 banks | Debug, recall, retain |
| `always-rules-guide.md` | Règles enforcement auto | Comprendre le système |

### Stack & Best Practices
| Fichier | Description | Quand Lire |
|---------|-------------|------------|
| `stack-2025.md` | Stack technologique 2025 | Choix technologies |
| `anthropic-best-practices-2025.md` | Best practices Claude 4.x | Prompts, patterns IA |
| `web-vitals-guide.md` | Core Web Vitals monitoring | Performance frontend |

### Design Intelligence & Animations
| Fichier | Description | Quand Lire |
|---------|-------------|------------|
| `design-intelligence.md` | 35 palettes couleurs, 20 fonts, 25 regles UI reasoning, checklist | Tout projet avec UI |
| `creative-web-animations.md` | 19 sections : GSAP, scroll-driven, page transitions, hover, WebGL/R3F, typo, grid, SVG filters, distortion, preloaders, menus creatifs, morphing, blur/DOF, grain/noise, slideshows WebGL | Site premium, animations, effets visuels |

### Execution & Documentation
| Fichier | Description | Quand Lire |
|---------|-------------|------------|
| `wave-execution-pattern.md` | Pattern Wave+Checkpoint + analyse dependances fichier | Parallelisation agents |
| `mermaid-diagrams-guide.md` | Templates diagrammes Mermaid (archi, sequence, ER, etats) | Documentation architecture |

### Frontend & State
| Fichier | Description | Quand Lire |
|---------|-------------|------------|
| `i18n-patterns.md` | next-intl : routing [locale], middleware, ICU messages, Server/Client Components | Projet multilingue |
| `state-management-patterns.md` | Zustand (slices, middlewares) + TanStack Query (optimistic updates) | State management |
| `realtime-patterns.md` | Supabase Realtime : Broadcast, Presence, Postgres Changes, hooks React | Fonctionnalites temps reel |
| `file-upload-patterns.md` | Upload via signed URLs : Supabase Storage, UploadThing, S3 presigned | Upload fichiers |

### Auth & Security
| Fichier | Description | Quand Lire |
|---------|-------------|------------|
| `advanced-auth-patterns.md` | Passkeys/WebAuthn (SimpleWebAuthn), MFA TOTP, iron-session, Clerk/Supabase | Auth avancee, passwordless |

### Backend & Infrastructure
| Fichier | Description | Quand Lire |
|---------|-------------|------------|
| `monitoring-observability-patterns.md` | Sentry v9 + OpenTelemetry + Pino : 3 piliers observabilite | Monitoring production |
| `cicd-github-actions-patterns.md` | CI (lint/test/build) + CD (Vercel deploy) + Dependabot | Mise en place CI/CD |
| `email-patterns.md` | React Email + Resend : templates JSX, service centralise, batch | Emails transactionnels |
| `notifications-patterns.md` | Push mobile (Expo), Push web (Service Worker), In-App (Supabase), multi-canal | Notifications |
| `queue-patterns.md` | Inngest (serverless, Vercel) vs BullMQ (self-hosted, Redis) | Background jobs, cron |
| `search-engine-patterns.md` | Meilisearch + InstantSearch React : indexation, sync, UI composants | Recherche full-text |
| `headless-cms-patterns.md` | Payload CMS (Next.js natif) vs Sanity vs Strapi | Gestion de contenu |
| `load-testing-patterns.md` | k6 : scripts, scenarios (ramp/spike/soak), GitHub Actions | Tests de charge |
| `data-engineering-patterns.md` | ETL (Inngest), Event Sourcing, Materialized Views, CSV import | Data pipelines |
| `iot-patterns.md` | MQTT + Edge Functions + Recharts dashboard temps reel | IoT, capteurs |

### Commerce & Protocols
| Fichier | Description | Quand Lire |
|---------|-------------|------------|
| `ucp-commerce-protocol.md` | UCP standard (1047 lignes, 15 sections) : discovery, checkout lifecycle, cart, payment handlers, MCP binding, identity linking, AP2 mandates, implementations Next.js + Supabase | Commerce agentique, marketplace AI, e-commerce multi-provider |

### Document Processing & OCR
| Fichier | Description | Quand Lire |
|---------|-------------|------------|
| `docling-patterns.md` | Docling (IBM Research) : parsing PDF/DOCX/PPTX/XLSX, tables ML, formules LaTeX, OCR, VLM GraniteDocling, ASR audio, MCP server | Traitement documents, extraction tables, OCR, audio transcription |
| `paddleocr-patterns.md` | PaddleOCR : OCR 100+ langues, PP-OCRv5, PP-StructureV3, handwriting, manuscrits anciens, MCP server | OCR multilingue, handwriting, manuscrits, langues non-latines |

### Payments & E-commerce
| Fichier | Description | Quand Lire |
|---------|-------------|------------|
| `stripe-patterns.md` | Stripe Connect, subscriptions, webhooks, UCP integration | Tout projet avec paiements |
| `clone-wars-catalog.md` | 300+ clones open-source (Airbnb, Netflix, Spotify, etc.) | "comme X", "clone de X" |

### Security & Production
| Fichier | Description | Quand Lire |
|---------|-------------|------------|
| `security-taxonomy.md` | Taxonomie securite complete | Audit securite |
| `production-checklist.md` | Checklist pre-deploiement | Avant mise en production |
| `vercel-advanced-patterns.md` | Patterns Vercel avances (ISR, Edge, middleware) | Deploiement Vercel |

### AI & Agents
| Fichier | Description | Quand Lire |
|---------|-------------|------------|
| `autonomous-agents-guide.md` | Guide agents IA autonomes (CrewAI, LangGraph, Phidata) | Projets multi-agents |
| `graphrag-patterns.md` | GraphRAG + Knowledge Graph patterns | Projets RAG avances |
| `smolagents-patterns.md` | HuggingFace SmolAgents patterns | Agents legers |

### Platform Patterns
| Fichier | Description | Quand Lire |
|---------|-------------|------------|
| `supabase-ssr-patterns.md` | Supabase SSR avec Next.js | Auth + SSR |
| `electron-patterns.md` | Electron patterns desktop | Apps desktop Electron |
| `chrome-workflows-guide.md` | Chrome extensions development | Extensions navigateur |
| `nocode-ux-patterns.md` | Patterns UX no-code | Interfaces no-code |
| `puppeteer-vs-playwright.md` | Comparaison + patterns scraping | Web scraping, tests E2E |

### Specialises
| Fichier | Description | Quand Lire |
|---------|-------------|------------|
| `gaming/*.md` | 44 guides game development (rendering, physics, multiplayer, procedural) | Projets jeux |
| `trading/*.md` | Strategies trading MQL5 | Projets MQL5/trading |
| `odoo/*.md` | 15 guides Odoo (v19, API, OWL, security, deploy, SaaS) + 152 templates | Projets Odoo/ERP |
| `onboarding/LEVEL-*.md` | 4 niveaux d'onboarding progressif | Decouverte systeme |
| `reference/*.md` | 11 guides detailles (agents, hooks, MCPs, modes, templates) | Reference technique |

---

## Workflow Auto-Discovery

```
NOUVELLE DEMANDE
      │
      ▼
┌─────────────────────────────────┐
│ 1. DÉTECTER LE CONTEXTE         │
│    Intent Parser analyse        │
│    → Type de projet?            │
│    → Framework utilisé?         │
│    → Erreur à résoudre?         │
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│ 2. CONSULTER CET INDEX          │
│    → Fichiers pertinents        │
│    → Priorités de lecture       │
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│ 3. LIRE FICHIERS IDENTIFIÉS     │
│    Read(file_path)              │
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│ 4. APPLIQUER MÉTHODOLOGIE       │
│    → Hindsight recall           │
│    → Context7 si framework      │
│    → Exécution informée         │
└─────────────────────────────────┘
```

---

## Hindsight Banks Quick Reference

| Bank | Usage | Recall Query Pattern |
|------|-------|---------------------|
| `errors` | Bugs, erreurs et solutions | `{error_type} {framework} solution` |
| `patterns` | Patterns reutilisables | `{pattern_type} {use_case}` |
| `development` | Contexte projets, stack | `project:{name} context` |
| `projects` | Statut projets actifs | `project:{name} status` |
| `skills` | Techniques apprises | `{skill_type} {technology}` |
| `experiences` | Experiences generales | `{experience_type}` |
| `user_preferences` | Style et preferences | `{preference_type}` |
| `world_facts` | Connaissances generales | `{topic}` |
| `trading` | Strategies trading | `strategy:{pair} {timeframe}` |

---

## Commandes Utiles

```javascript
// Recall avant projet
hindsight_recall({bank: 'development', query: 'next.js ecommerce patterns', top_k: 5})

// Recall avant debug
hindsight_recall({bank: 'errors', query: 'TypeError React 19', top_k: 3})

// Retain après apprentissage
hindsight_retain({bank: 'patterns', content: '...', context: '...'})

// Context7 pour framework
context7.resolve-library-id({libraryName: 'next.js'})
context7.get-library-docs({context7CompatibleLibraryID: '/vercel/next.js', topic: 'app router'})
```

---

*Knowledge Index v2.0 - ATUM CREA | 88+ knowledge files | Score: 100/100*
