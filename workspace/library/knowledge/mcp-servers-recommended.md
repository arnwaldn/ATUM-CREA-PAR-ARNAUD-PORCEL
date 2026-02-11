# MCP Servers - Inventaire ATUM CREA

> **Version**: v3.0 (Fevrier 2026)
> **Architecture**: Core (9 toujours actifs) + Pool On-Demand (46 activables dynamiquement)
> **Total configure**: 55 serveurs MCP
> **Reference catalogue**: `docker-mcp-registry.md` (451+ serveurs Docker)

---

## Architecture Dynamique

ATUM CREA utilise une architecture MCP a deux niveaux :

1. **Core (9 serveurs)** : Toujours actifs au demarrage, essentiels a chaque session
2. **Pool On-Demand (42+ serveurs)** : Desactives au repos, actives dynamiquement par l'orchestrateur selon la tache

### Activation/Desactivation en temps reel

```
# Activer un MCP pendant une session (immediat, pas de redemarrage)
mcp_activate("stripe")

# Desactiver quand on n'en a plus besoin (libere un slot)
mcp_deactivate("stripe")

# Changement persistant (necessite nouveau chat)
config_toggle_mcp_server(name: "serveur", enabled: true/false)
```

### Workflow automatique

Quand une tache necessite un MCP specifique :
1. L'orchestrateur detecte le besoin (ex: deploiement → vercel)
2. Active le MCP dynamiquement (`mcp_activate`)
3. Utilise les outils du MCP
4. Desactive apres usage (`mcp_deactivate`) pour liberer le slot

---

## Core - Toujours Actifs (9 serveurs)

| Serveur | Package | Usage |
|---------|---------|-------|
| github | `@modelcontextprotocol/server-github` | API GitHub, repos, PRs, issues |
| supabase | `@supabase/mcp-server-supabase` | Base de donnees, migrations, RLS |
| memory | `@modelcontextprotocol/server-memory` | Memoire persistante (Knowledge Graph) |
| context7 | `@upstash/context7-mcp` | Documentation frameworks a jour |
| sequential-thinking | `@modelcontextprotocol/server-sequential-thinking` | Raisonnement structure |
| git | `mcp-server-git` (uvx) | Operations Git |
| fetch | `mcp-server-fetch` (uvx) | Web fetching |
| filesystem | `@modelcontextprotocol/server-filesystem` | Manipulation fichiers |
| desktop-commander | `@wonderwhy-er/desktop-commander` | Commandes systeme avancees |

---

## Pool On-Demand - Activables Dynamiquement

### Haute frequence (actives souvent)

| Serveur | Package | Usage | Credentials |
|---------|---------|-------|-------------|
| shadcn | `shadcn-ui-mcp-server` | Composants UI shadcn | Aucune |
| vercel | `vercel-mcp` | Deploiement, logs, domaines | `VERCEL_API_TOKEN` OK |
| stripe | `@stripe/mcp` | Paiements, abonnements | `STRIPE_API_KEY` OK |
| tavily | HTTP remote | Recherche web + extraction | `TAVILY_API_KEY` OK |
| firecrawl | `firecrawl-mcp` | Scraping web avance | `FIRECRAWL_API_KEY` OK |
| exa | `exa-mcp-server` | Recherche web IA | `EXA_API_KEY` OK |
| playwright | `@automatalabs/mcp-server-playwright` | Tests E2E, automation | Aucune |
| docker-mcp | `docker mcp gateway` | Passerelle Docker Registry | Aucune |

### Communication & Productivite

| Serveur | Package | Usage | Credentials |
|---------|---------|-------|-------------|
| slack | `@modelcontextprotocol/server-slack` | Messages, canaux Slack | `SLACK_BOT_TOKEN` + `SLACK_TEAM_ID` OK |
| notion | `@notionhq/notion-mcp-server` | Documentation, bases Notion | `NOTION_TOKEN` OK |
| resend | `resend-mcp` | Envoi d'emails | `RESEND_API_KEY` OK |
| deepl | `deepl-mcp-server` | Traduction multilingue | `DEEPL_API_KEY` OK |

### Bases de Donnees

| Serveur | Package | Usage | Credentials |
|---------|---------|-------|-------------|
| mongodb | `mongodb-mcp-server` | Base NoSQL, Atlas | `MDB_MCP_API_CLIENT_ID` + `SECRET` OK |
| clickhouse | `clickhouse-mcp` | Analytics OLAP | Configure |
| upstash | Config existante | Redis/Kafka serverless | Configure |
| sqlite | `mcp-server-sqlite` | SQLite local | Aucune |
| postgres | `@modelcontextprotocol/server-postgres` | PostgreSQL direct | `DATABASE_URL` manquante |
| neo4j | `@johnymontana/neo4j-mcp` | Graph database | Credentials manquantes |

### Multimedia & Generation

| Serveur | Package | Usage | Credentials |
|---------|---------|-------|-------------|
| elevenlabs | `elevenlabs-mcp` (uvx) | Text-to-Speech, voix IA | `ELEVENLABS_API_KEY` OK |
| ffmpeg | `ffmpeg-mcp` | Traitement video/audio | Aucune (ffmpeg 8.0.1 installe) |
| replicate | `mcp-replicate` | Generation images/video | `REPLICATE_API_TOKEN` configure |
| blender | `blender-mcp` (uvx) | 3D modelisation | Aucune |
| youtube | Config existante | API YouTube | Configure |

### Workflow & Automation

| Serveur | Package | Usage | Credentials |
|---------|---------|-------|-------------|
| n8n | `n8n-mcp` | Workflow automation (1084 nodes) | Aucune |

### Services Cloud & Hosting

| Serveur | Package | Usage | Credentials |
|---------|---------|-------|-------------|
| railway | `@railway/mcp-server` | Deploiement Railway | `RAILWAY_TOKEN` configure |
| cloudflare | `@cloudflare/mcp-server-cloudflare` | Workers, Pages, DNS | `CLOUDFLARE_API_TOKEN` configure |
| cloudflare-docs | HTTP remote | Documentation Cloudflare | Aucune |

### Securite & Monitoring

| Serveur | Package | Usage | Credentials |
|---------|---------|-------|-------------|
| sentry | `@sentry/mcp-server` | Error tracking | Configure |
| sonarqube | Config existante | Analyse code statique | Configure |
| semgrep | Config existante | Securite code | Configure |

### IA & Sandbox

| Serveur | Package | Usage | Credentials |
|---------|---------|-------|-------------|
| ollama | Config existante | LLM local | Aucune |
| e2b | Config existante | Sandbox Python | Configure |

### Document Processing & OCR

| Serveur | Package | Usage | Credentials |
|---------|---------|-------|-------------|
| docling | `docling-mcp` (uvx) | Parsing PDF/DOCX/PPTX/XLSX, tables, formules, VLM, audio | Aucune |
| paddleocr | `paddleocr.mcp_server` (python) | OCR multilingue 100+ langues, handwriting, manuscrits | Aucune |

> **Routing** : Docling pour formats Office/audio/VLM. PaddleOCR pour multilingue/handwriting/manuscrits. Voir `docling-patterns.md` et `paddleocr-patterns.md`.

### Design & Diagrammes

| Serveur | Package | Usage | Credentials |
|---------|---------|-------|-------------|
| figma | Config existante | Design-to-code | Configure |
| mermaid | Config existante | Diagrammes | Aucune |
| echarts | Config existante | Graphiques interactifs | Aucune |
| magic-ui | Config existante | Composants Magic UI | Aucune |
| magic | Config existante | Magic UI design | Aucune |

### Mobile & Desktop

| Serveur | Package | Usage | Credentials |
|---------|---------|-------|-------------|
| expo | Config existante | React Native/Expo | Aucune |
| dart-flutter | Config existante | Flutter | Aucune |
| unity | Config existante | Unity game engine | Aucune |

### Divers

| Serveur | Package | Usage | Credentials |
|---------|---------|-------|-------------|
| puppeteer | Config existante | Browser automation legacy | Aucune |
| vscode | Config existante | Controle VS Code | Aucune |
| sanity | Config existante | CMS headless | Configure |
| browserbase | Config existante | Cloud browser | Credentials manquantes |

---

## Mapping Tache → MCPs a Activer

| Tache | MCPs a activer |
|-------|----------------|
| Construire une UI | `shadcn` |
| Deployer | `vercel` ou `railway` ou `cloudflare` |
| Paiements | `stripe` |
| Recherche web | `tavily` + `exa` ou `firecrawl` |
| Scraping | `firecrawl` |
| Tests E2E | `playwright` |
| Emails | `resend` |
| Traduction | `deepl` |
| Communication equipe | `slack` |
| Documentation Notion | `notion` |
| Base MongoDB | `mongodb` |
| Audio/Voix IA | `elevenlabs` |
| Traitement video/audio | `ffmpeg` |
| Workflow automation | `n8n` |
| Diagrammes | `mermaid` ou `echarts` |
| Document parsing (PDF/DOCX/PPTX) | `docling` |
| OCR multilingue / handwriting | `paddleocr` |
| Mobile | `expo` ou `dart-flutter` |
| 3D | `blender` |
| Securite code | `semgrep` + `sonarqube` |
| Error tracking | `sentry` |

---

## Sources

- [Docker MCP Registry](https://github.com/docker/mcp-registry) - 451+ serveurs verifies
- [MongoDB MCP Server](https://www.npmjs.com/package/mongodb-mcp-server) - Officiel MongoDB
- [ElevenLabs MCP](https://github.com/elevenlabs/elevenlabs-mcp) - Officiel ElevenLabs
- [FFmpeg MCP](https://github.com/AmolDerickSoans/ffmpeg-mcp) - Traitement multimedia
- [n8n MCP](https://github.com/czlonkowski/n8n-mcp) - 1084 nodes workflow
- [Slack MCP](https://www.npmjs.com/package/@modelcontextprotocol/server-slack) - Officiel MCP
