# ATUM CREA - Backup Complet du Systeme

**Systeme autonome de Vibe Coding propulse par Claude Opus 4.6**
Backup complet par Arnaud Porcel - Fevrier 2026

---

## Structure du Backup

```
ATUM-CREA-BACKUP/
├── .claude/                    # Configuration Claude Code
│   ├── CLAUDE.md               # Instructions principales du systeme
│   ├── AGENTS.md               # Registre des 13 agents specialises
│   ├── .claude.json             # Configuration Claude Code
│   ├── .claude.json.backup      # Backup de la config
│   ├── settings.json            # Hooks ATUM CREA (pre-push, deploy check, etc.)
│   ├── hooks.json               # Hooks ECC (tmux, prettier, TypeScript check, etc.)
│   ├── statusline.js            # Status line script (Node.js)
│   ├── statusline.ps1           # Status line script (PowerShell)
│   ├── STATUSLINE-README.md     # Documentation status line
│   ├── stats-cache.json         # Cache de statistiques
│   ├── agents/                  # 13 definitions d'agents
│   ├── commands/                # 33 commandes personnalisees
│   ├── skills/                  # 35 skills specialisees
│   ├── rules/                   # 6 regles auto-chargees
│   ├── contexts/                # 3 contextes (dev, research, review)
│   ├── scripts/                 # Scripts hooks (CI, setup, lib)
│   │   ├── ci/                  # Validateurs CI (agents, commands, hooks, rules, skills)
│   │   ├── hooks/               # Scripts hooks (console-log, evaluate-session, pre-compact, etc.)
│   │   └── lib/                 # Utilitaires (package-manager, session-manager, utils)
│   ├── mcp-configs/             # Configuration MCP supplementaire
│   ├── plans/                   # 11 plans architecturaux sauvegardes
│   ├── cache/                   # Cache (changelog)
│   ├── plugins/                 # Plugins Claude Code (marketplace officiel)
│   └── backups-pre-ultra/       # Backup pre-mise-a-jour
├── .halo-dev/                   # Configuration Halo (ATUM CREA IDE)
│   ├── config.json              # Config MCP ANONYMISEE (54 serveurs, tokens remplaces)
│   ├── config.json.bak          # Backup config MCP (aussi anonymise)
│   ├── .env.example             # Variables d'environnement template (31 variables)
│   ├── .health-registry.json    # Registre de sante des processus
│   ├── hindsight.db             # Base de donnees memoire persistante (Hindsight)
│   ├── hindsight-server.cjs     # Serveur Hindsight (memoire IA)
│   └── spaces-index.json        # Index des espaces de travail
├── workspace/                   # Espace de travail ATUM CREA
│   ├── library/                 # Bibliotheque centrale (2458 fichiers)
│   │   ├── knowledge/           # 331 fichiers de connaissances
│   │   ├── templates/           # 1658 templates de projets
│   │   ├── workflows/           # 11 workflows de developpement
│   │   ├── config/              # 30 fichiers de configuration systeme
│   │   ├── modes/               # 7 modes operationnels
│   │   ├── prompts/             # Templates de prompts
│   │   ├── scripts/             # Scripts utilitaires
│   │   └── _archive/            # Archive legacy (387 fichiers)
│   ├── everything-claude-code/  # Package ECC installe (399 fichiers)
│   ├── hello-halo/              # Scripts et proxies Halo (476 fichiers)
│   ├── test-pipeline/           # Pipeline de tests
│   ├── .gitignore               # Git ignore du workspace
│   └── atum-crea.ico            # Icone ATUM CREA
├── .gitignore                   # Git ignore du depot
└── README.md                    # Ce fichier
```

---

## Guide de Restauration Complet

### Pre-requis : Logiciels de base (OBLIGATOIRES)

| Logiciel | Version min. | Installation | Verification | Role |
|----------|-------------|-------------|-------------|------|
| **Windows** | 10/11 | - | `winver` | OS principal |
| **Node.js** | 20+ | https://nodejs.org | `node --version` | Runtime pour MCP servers |
| **npm** | 10+ | Inclus avec Node.js | `npm --version` | Gestionnaire de packages |
| **npx** | 10+ | Inclus avec Node.js | `npx --version` | Execution MCP servers |
| **Git** | 2.40+ | https://git-scm.com | `git --version` | Controle de version |
| **Python** | 3.10+ | https://python.org | `python --version` | Scripts, hooks, MCP servers |
| **pip** | 23+ | Inclus avec Python | `pip --version` | Packages Python |
| **Halo IDE** | Latest | https://halo.dev | Ouvrir l'app | IDE ATUM CREA |
| **Claude Code** | Latest | Via Halo IDE / npm | `claude --version` | Agent IA |

### Pre-requis : Outils optionnels (pour MCP servers specifiques)

Ces outils ne sont necessaires que si vous activez les MCP servers correspondants.

| Logiciel | Installation | Verification | MCP Server(s) |
|----------|-------------|-------------|----------------|
| **Docker Desktop** | https://docker.com/products/docker-desktop | `docker --version` | `docker-mcp` |
| **Blender** | https://blender.org/download | `blender --version` | `blender` (via uvx blender-mcp) |
| **Unity** | https://unity.com/download | Unity Hub | `unity` (via npx @iflow-mcp/mcp-unity-server) |
| **VS Code** | https://code.visualstudio.com | `code --version` | `vscode` (via npx @vscode-mcp/vscode-mcp-server) |
| **Dart/Flutter** | https://dart.dev/get-dart | `dart --version` | `dart-flutter` |
| **uvx (uv)** | `pip install uv` | `uvx --version` | `blender`, `git`, `fetch`, `elevenlabs`, `docling`, `sqlite` |
| **FFmpeg** | https://ffmpeg.org/download.html | `ffmpeg -version` | `ffmpeg` |
| **Semgrep** | `pip install semgrep` | `semgrep --version` | `semgrep` |
| **Ollama** | https://ollama.com/download | `ollama --version` | `ollama` (LLM local) |

### Abonnements et API Keys

#### Abonnement obligatoire

| Service | Requis pour | Obtention |
|---------|-----------|-----------|
| **Anthropic (Claude)** | Moteur IA principal (Claude Opus 4.6) | https://console.anthropic.com |
| **GitHub** | Stockage code + MCP server | https://github.com (PAT requis) |

#### API Keys optionnelles (par categorie)

**IA et Machine Learning :**

| Service | API Key | Obtention | MCP Server |
|---------|---------|-----------|------------|
| OpenAI | `<YOUR_OPENAI_API_KEY>` | https://platform.openai.com/api-keys | Source IA secondaire |
| Replicate | `<YOUR_REPLICATE_TOKEN>` | https://replicate.com/account/api-tokens | `replicate` |
| ElevenLabs | `<YOUR_ELEVENLABS_API_KEY>` | https://elevenlabs.io/app/settings/api-keys | `elevenlabs` |
| E2B | `<YOUR_E2B_API_KEY>` | https://e2b.dev/dashboard | `e2b` |

**Bases de donnees :**

| Service | API Key(s) | Obtention | MCP Server |
|---------|-----------|-----------|------------|
| Supabase | `<YOUR_SUPABASE_ACCESS_TOKEN>` + `<YOUR_SUPABASE_PROJECT_REF>` | https://supabase.com/dashboard/account/tokens | `supabase` |
| ClickHouse | `<YOUR_CLICKHOUSE_PASSWORD>` | Console ClickHouse Cloud | `clickhouse` |
| MongoDB | `<YOUR_MONGODB_CLIENT_ID>` + `<YOUR_MONGODB_SECRET>` | https://cloud.mongodb.com | `mongodb` |
| Upstash | `<YOUR_UPSTASH_API_KEY>` + `<YOUR_EMAIL>` | https://console.upstash.com | `upstash` |

**Deploiement :**

| Service | API Key | Obtention | MCP Server |
|---------|---------|-----------|------------|
| Vercel | `<YOUR_VERCEL_API_KEY>` | https://vercel.com/account/tokens | `vercel` |
| Railway | `<YOUR_RAILWAY_TOKEN>` | https://railway.app/account/tokens | `railway` |
| Cloudflare | `<YOUR_CLOUDFLARE_API_TOKEN>` + `<YOUR_CLOUDFLARE_ACCOUNT_ID>` | https://dash.cloudflare.com/profile/api-tokens | `cloudflare` |

**Paiements :**

| Service | API Key | Obtention | MCP Server |
|---------|---------|-----------|------------|
| Stripe | `<YOUR_STRIPE_SECRET_KEY>` | https://dashboard.stripe.com/apikeys | `stripe` |

**Communication :**

| Service | API Key(s) | Obtention | MCP Server |
|---------|-----------|-----------|------------|
| Resend | `<YOUR_RESEND_API_KEY>` | https://resend.com/api-keys | `resend` |
| Slack | `<YOUR_SLACK_BOT_TOKEN>` + `<YOUR_SLACK_TEAM_ID>` | https://api.slack.com/apps | `slack` |
| Notion | `<YOUR_NOTION_TOKEN>` | https://www.notion.so/my-integrations | `notion` |

**Recherche et Scraping :**

| Service | API Key | Obtention | MCP Server |
|---------|---------|-----------|------------|
| Exa | `<YOUR_EXA_API_KEY>` | https://dashboard.exa.ai | `exa` |
| Tavily | `<YOUR_TAVILY_API_KEY>` | https://tavily.com | `tavily` |
| Firecrawl | `<YOUR_FIRECRAWL_API_KEY>` | https://firecrawl.dev | `firecrawl` |

**CMS et Contenu :**

| Service | API Key(s) | Obtention | MCP Server |
|---------|-----------|-----------|------------|
| Sanity | `<YOUR_SANITY_TOKEN>` + `<YOUR_SANITY_PROJECT_ID>` | https://www.sanity.io/manage | `sanity` |

**Traduction :**

| Service | API Key | Obtention | MCP Server |
|---------|---------|-----------|------------|
| DeepL | `<YOUR_DEEPL_API_KEY>` | https://www.deepl.com/account/summary | `deepl` |

**Monitoring et Securite :**

| Service | API Key | Obtention | MCP Server |
|---------|---------|-----------|------------|
| Sentry | `<YOUR_SENTRY_TOKEN>` | https://sentry.io/settings/account/api/auth-tokens | `sentry` |
| SonarCloud | `<YOUR_SONAR_TOKEN>` | https://sonarcloud.io/account/security | `sonarqube` |

**Media :**

| Service | API Key | Obtention | MCP Server |
|---------|---------|-----------|------------|
| YouTube | `<YOUR_YOUTUBE_API_KEY>` | https://console.cloud.google.com/apis | `youtube` |

**Mobile :**

| Service | API Key | Obtention | MCP Server |
|---------|---------|-----------|------------|
| Expo | `<YOUR_EXPO_TOKEN>` | https://expo.dev/accounts/settings/access-tokens | `expo` |

---

## Etapes de Restauration

### Etape 1 : Cloner ce depot

```powershell
git clone https://github.com/arnwaldn/ATUM-CREA-PAR-ARNAUD-PORCEL.git
cd ATUM-CREA-PAR-ARNAUD-PORCEL
```

### Etape 2 : Restaurer la configuration Claude (.claude)

```powershell
# Copier tout le dossier .claude dans le home directory
Copy-Item -Path ".\.claude" -Destination "$env:USERPROFILE\.claude" -Recurse -Force
```

Fichiers restaures :
- `CLAUDE.md` - Instructions systeme principales (cycle ATUM CREA, stack, orchestration)
- `AGENTS.md` - Registre des 13 agents specialises
- `settings.json` - Hooks ATUM CREA (verification pre-push, deploy check, doc blocking)
- `hooks.json` - Hooks ECC (tmux, Prettier, TypeScript check, console.log warn, session hooks)
- `statusline.js` / `statusline.ps1` - Scripts de status line
- `.claude.json` - Configuration Claude Code
- `agents/` - 13 agents (architect, build-error-resolver, code-reviewer, database-reviewer, doc-updater, e2e-runner, go-build-resolver, go-reviewer, planner, python-reviewer, refactor-cleaner, security-reviewer, tdd-guide)
- `commands/` - 33 commandes (build-fix, checkpoint, code-review, e2e, eval, go-build, multi-workflow, plan, ship, tdd, verify, etc.)
- `skills/` - 35 skills (backend-patterns, coding-standards, deployment, django-*, frontend-patterns, golang-*, python-*, security-review, springboot-*, tdd-workflow, etc.)
- `rules/` - 6 regles auto-chargees (autonomous-execution, memory-protocol, immutability-and-quality, test-first, production-standards, context7-and-docs)
- `contexts/` - 3 contextes (dev, research, review)
- `scripts/` - Scripts hooks CI + evaluation + session management
- `mcp-configs/` - Configuration MCP supplementaire
- `plans/` - 11 plans architecturaux sauvegardes
- `plugins/` - Plugins Claude Code marketplace

### Etape 3 : Restaurer l'espace de travail

```powershell
# Creer le dossier sur le Bureau
New-Item -ItemType Directory -Path "$env:USERPROFILE\Desktop\ATUM CREA" -Force
Copy-Item -Path ".\workspace\*" -Destination "$env:USERPROFILE\Desktop\ATUM CREA" -Recurse -Force
```

### Etape 4 : Restaurer la configuration Halo (.halo-dev)

```powershell
# Copier les fichiers halo-dev
Copy-Item -Path ".\.halo-dev" -Destination "$env:USERPROFILE\.halo-dev" -Recurse -Force
```

**IMPORTANT** : Le fichier `config.json` contient des **placeholders** a la place des vrais tokens.
Vous devez remplacer chaque `<YOUR_XXX>` par vos vrais tokens/cles API (voir section API Keys ci-dessus).

### Etape 5 : Installer les dependances Python (pour uvx/MCP servers)

```powershell
pip install uv
# uvx sera disponible pour les MCP servers: blender, git, fetch, elevenlabs, docling, sqlite
```

### Etape 6 : Configurer les tokens API

1. Ouvrir `%USERPROFILE%\.halo-dev\config.json` dans un editeur
2. Rechercher/remplacer chaque `<YOUR_XXX>` par le vrai token correspondant
3. Faire de meme pour `%USERPROFILE%\.halo-dev\.env.example` -> renommer en `.env` et remplir

### Etape 7 : Verifier l'installation

1. Ouvrir Halo IDE (ATUM CREA)
2. Ouvrir l'espace de travail `C:\Users\<username>\Desktop\ATUM CREA`
3. Demarrer une nouvelle conversation
4. Taper "Bonjour" pour verifier que Claude repond
5. Verifier que les MCP servers core se chargent :
   - `memory` (memoire persistante)
   - `context7` (documentation a jour)
   - `github` (controle de version)
   - `supabase` (base de donnees)
   - `sequential-thinking` (raisonnement)
   - `git` (operations git)
   - `fetch` (requetes web)
   - `filesystem` (gestion fichiers)
   - `desktop-commander` (commandes systeme)

---

## Les 54 Serveurs MCP Configures

### Serveurs Core (actifs par defaut)

| Serveur | Commande | Description |
|---------|----------|-------------|
| `github` | `@modelcontextprotocol/server-github` | Gestion repos, issues, PRs GitHub |
| `supabase` | `@supabase/mcp-server-supabase` | Base de donnees, auth, edge functions |
| `memory` | `@modelcontextprotocol/server-memory` | Memoire persistante (knowledge graph) |
| `context7` | `@upstash/context7-mcp` | Documentation a jour de frameworks |
| `sequential-thinking` | `@modelcontextprotocol/server-sequential-thinking` | Raisonnement en etapes |
| `git` | `mcp-server-git` (uvx) | Operations Git avancees |
| `fetch` | `mcp-server-fetch` (uvx) | Requetes HTTP/web |
| `filesystem` | `@modelcontextprotocol/server-filesystem` | Gestion de fichiers |
| `desktop-commander` | `@wonderwhy-er/desktop-commander` | Commandes systeme, processus |

### Serveurs de Developpement (a activer selon besoin)

| Serveur | Commande | Requis | Description |
|---------|----------|--------|-------------|
| `shadcn` | `shadcn-ui-mcp-server` | - | Composants UI shadcn/ui |
| `playwright` | `@automatalabs/mcp-server-playwright` | - | Tests E2E browser |
| `magic-ui` | `@21st-dev/magic` | - | Composants UI Magic |
| `magic` | `@magicuidesign/mcp` | - | Design UI Magic |
| `figma` | `figma-mcp` | Figma Desktop | Integration design Figma |
| `vscode` | `@vscode-mcp/vscode-mcp-server` | VS Code | Integration VS Code |
| `blender` | `blender-mcp` (uvx) | Blender + Python | Modelisation 3D |
| `unity` | `@iflow-mcp/mcp-unity-server` | Unity | Developpement jeux Unity |
| `dart-flutter` | `dart mcp-server` | Dart SDK | Apps Flutter/Dart |

### Serveurs Cloud et Deploiement

| Serveur | Commande | API Key | Description |
|---------|----------|---------|-------------|
| `vercel` | `vercel-mcp` | VERCEL_API_KEY | Deploiement Vercel |
| `railway` | `@railway/mcp-server` | RAILWAY_API_TOKEN | Deploiement Railway |
| `cloudflare` | `@cloudflare/mcp-server-cloudflare` | CLOUDFLARE_API_TOKEN | Workers, Pages, DNS |
| `cloudflare-docs` | HTTP endpoint | - | Documentation Cloudflare |

### Serveurs Bases de Donnees

| Serveur | Commande | API Key(s) | Description |
|---------|----------|-----------|-------------|
| `postgres` | `@modelcontextprotocol/server-postgres` | DATABASE_URL | PostgreSQL direct |
| `sqlite` | `mcp-server-sqlite` (uvx) | - | SQLite local |
| `mongodb` | `mongodb-mcp-server` | MDB_MCP_API_CLIENT_ID/SECRET | MongoDB Atlas |
| `neo4j` | `@johnymontana/neo4j-mcp` | NEO4J_URI/PASSWORD | Graph database |
| `clickhouse` | `clickhouse-mcp` | CLICKHOUSE_HOST/USER/PASSWORD | Analytics OLAP |

### Serveurs Paiements et Services

| Serveur | Commande | API Key | Description |
|---------|----------|---------|-------------|
| `stripe` | `@stripe/mcp` | STRIPE_SECRET_KEY | Paiements Stripe |
| `resend` | `resend-mcp` | RESEND_API_KEY | Emails transactionnels |

### Serveurs Contenu et CMS

| Serveur | Commande | API Key(s) | Description |
|---------|----------|-----------|-------------|
| `notion` | `@notionhq/notion-mcp-server` | NOTION_TOKEN | Gestion contenu Notion |
| `sanity` | `@sanity/mcp-server` | SANITY_TOKEN/PROJECT_ID | CMS Sanity |

### Serveurs Recherche et Scraping

| Serveur | Commande | API Key | Description |
|---------|----------|---------|-------------|
| `exa` | `exa-mcp-server` | EXA_API_KEY | Recherche semantique |
| `tavily` | HTTP endpoint | TAVILY_API_KEY | Recherche web IA |
| `firecrawl` | `firecrawl-mcp` | FIRECRAWL_API_KEY | Web scraping avance |
| `puppeteer` | `@modelcontextprotocol/server-puppeteer` | - | Browser automation |
| `browserbase` | `@browserbasehq/mcp-server-browserbase` | BROWSERBASE_API_KEY | Browser cloud |

### Serveurs Media et IA

| Serveur | Commande | API Key | Description |
|---------|----------|---------|-------------|
| `youtube` | `youtube-data-mcp-server` | YOUTUBE_API_KEY | Donnees YouTube |
| `elevenlabs` | `elevenlabs-mcp` (uvx) | ELEVENLABS_API_KEY | Synthese vocale |
| `ffmpeg` | `ffmpeg-mcp` | - | Traitement audio/video |
| `replicate` | `mcp-replicate` | REPLICATE_API_TOKEN | Modeles IA (Stable Diffusion, etc.) |

### Serveurs Visualisation et Documentation

| Serveur | Commande | Description |
|---------|----------|-------------|
| `mermaid` | `@peng-shawn/mermaid-mcp-server` | Diagrammes Mermaid |
| `echarts` | `echarts-mcp-server` | Graphiques/charts |
| `docling` | `docling-mcp-server` (uvx) | Conversion documents |

### Serveurs Code Quality et Monitoring

| Serveur | Commande | API Key | Description |
|---------|----------|---------|-------------|
| `sonarqube` | `oe-sonar-mcp` | SONAR_TOKEN | Analyse de code |
| `semgrep` | `semgrep mcp` | - | Detection vulnerabilites |
| `sentry` | `@sentry/mcp-server` | SENTRY_ACCESS_TOKEN | Monitoring erreurs |

### Serveurs Infrastructure et Utilities

| Serveur | Commande | API Key | Description |
|---------|----------|---------|-------------|
| `docker-mcp` | `docker mcp gateway run` | - | Gestion conteneurs Docker |
| `ollama` | `ollama-mcp-server` | OLLAMA_HOST | LLM local (Llama, Mistral, etc.) |
| `upstash` | `@upstash/mcp-server` | UPSTASH_API_KEY | Redis/Kafka serverless |
| `deepl` | `deepl-mcp-server` | DEEPL_API_KEY | Traduction automatique |

### Serveurs Mobile et Automation

| Serveur | Commande | API Key | Description |
|---------|----------|---------|-------------|
| `expo` | `expo-mcp` | EXPO_TOKEN | Apps React Native |
| `e2b` | `@e2b/mcp-server` | E2B_API_KEY | Sandbox code cloud |
| `slack` | `@modelcontextprotocol/server-slack` | SLACK_BOT_TOKEN | Integration Slack |
| `n8n` | `n8n-mcp` | - | Workflows automation |

---

## Statistiques du Systeme

| Composant | Quantite |
|---|---|
| Agents specialises | 13 |
| Commandes | 33 |
| Skills | 35 |
| Regles auto-chargees | 6 |
| Contextes de travail | 3 |
| Plans architecturaux | 11 |
| Fichiers knowledge | 331 |
| Templates de projets | 1658 |
| Workflows | 11 |
| Modes operationnels | 7 |
| Fichiers config systeme | 30 |
| Serveurs MCP configures | **54** |
| Fichiers dans library | 2458 |
| Fichiers ECC | 399 |
| Fichiers hello-halo | 476 |
| Scripts hooks/CI | 17 |
| **Total fichiers dans backup** | **3700+** |

---

## Ce qui N'EST PAS inclus (et pourquoi)

| Element | Raison | Action a la restauration |
|---------|--------|--------------------------|
| `.credentials.json` | Contient les tokens OAuth en clair | Se re-authentifier via Claude Code |
| `.env` (avec vrais tokens) | Securite | Copier `.env.example` -> `.env` et remplir |
| `.claude.json.backup.*` | Backups timestampes auto-generes | Se regenerent automatiquement |
| `history.jsonl` | Historique de conversation | Se regenere automatiquement |
| `todos/` | Todos des sessions precedentes | Se regenere automatiquement |
| `tasks/` | Tasks des sessions precedentes | Se regenere automatiquement |
| `debug/` | Logs de debug | Se regenere automatiquement |
| `file-history/` | Historique d'edition (608 fichiers) | Se regenere automatiquement |
| `paste-cache/` | Cache du presse-papier | Se regenere automatiquement |
| `shell-snapshots/` | Snapshots shell | Se regenere automatiquement |
| `projects/` | Conversations par projet | Se regenere automatiquement |
| `telemetry/` | Donnees de telemetrie | Se regenere automatiquement |
| `downloads/` | Fichiers telecharges | - |
| `.halo-dev/temp/` | Fichiers temporaires | Se regenere automatiquement |
| `.halo-dev/spaces/` | Espaces de travail cache | Se regenere automatiquement |
| `node_modules/` | Dependances npm | Reinstallees automatiquement via `npx` |
| `plugins/.git/` | Repo git du marketplace | Se reclone automatiquement |

Tous ces fichiers sont soit **regeneres automatiquement** par Claude Code/Halo au premier usage,
soit des **fichiers temporaires** qui n'ont pas de valeur pour la restauration du systeme.

---

## Notes de securite

- Le fichier `config.json` a ete **anonymise** : tous les tokens/API keys ont ete remplaces par des placeholders `<YOUR_XXX>`
- Le fichier `config.json.bak` a aussi ete **anonymise**
- Les fichiers `.credentials.json` et les backups de credentials n'ont **pas** ete inclus
- Le fichier `.env` a ete inclus comme `.env.example` avec des placeholders
- La base de donnees Hindsight (`hindsight.db`) contient les memoires accumulees du systeme (pas de secrets)
- **Si ce depot est public**, ne JAMAIS y pousser de vrais tokens

---

## Verification post-restauration

Apres la restauration, verifier avec cette checklist :

- [ ] Node.js 20+ installe (`node --version`)
- [ ] Git installe (`git --version`)
- [ ] Python 3.10+ installe (`python --version`)
- [ ] uvx installe (`uvx --version` - sinon: `pip install uv`)
- [ ] Halo IDE installe et lance
- [ ] `.claude/` copie dans `%USERPROFILE%\.claude\`
- [ ] `.halo-dev/` copie dans `%USERPROFILE%\.halo-dev\`
- [ ] `workspace/` copie dans `%USERPROFILE%\Desktop\ATUM CREA\`
- [ ] Tokens API remplaces dans `config.json` (au minimum: GitHub PAT + Supabase)
- [ ] `.env.example` copie en `.env` et rempli
- [ ] Nouvelle conversation dans Halo -> Claude repond
- [ ] MCP servers core charges (memory, context7, github, supabase, git, fetch, filesystem, desktop-commander, sequential-thinking)
- [ ] Test : "Cree un projet Next.js simple" -> verifie que ATUM CREA fonctionne

---

## Auteur

**Arnaud Porcel**
Systeme ATUM CREA v3.1 - Fevrier 2026
