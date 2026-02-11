# ATUM CREA - Backup Complet du Systeme

**Systeme autonome de Vibe Coding propulse par Claude Opus 4.6**
Backup complet par Arnaud Porcel - Fevrier 2026

---

## Structure du Backup

```
ATUM-CREA-BACKUP/
├── .claude/                    # Configuration Claude Code
│   ├── CLAUDE.md               # Instructions principales du systeme
│   ├── AGENTS.md               # Registre des 16 agents specialises
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
│   ├── mcp-configs/             # Configuration MCP supplementaire
│   ├── plans/                   # 11 plans architecturaux sauvegardes
│   ├── cache/                   # Cache (changelog)
│   ├── plugins/                 # Plugins Claude Code
│   └── backups-pre-ultra/       # Backup pre-mise-a-jour
├── .halo-dev/                   # Configuration Halo (ATUM CREA IDE)
│   ├── config.json              # Config MCP ANONYMISEE (tokens remplaces)
│   ├── config.json.bak          # Backup config MCP (aussi anonymise)
│   ├── .env.example             # Variables d'environnement template
│   ├── .health-registry.json    # Registre de sante des processus
│   ├── hindsight.db             # Base de donnees memoire persistante
│   ├── hindsight-server.cjs     # Serveur Hindsight
│   └── spaces-index.json        # Index des espaces de travail
├── workspace/                   # Espace de travail ATUM CREA
│   ├── library/                 # Bibliotheque centrale (2458+ fichiers)
│   │   ├── knowledge/           # 175+ fichiers de connaissances
│   │   ├── templates/           # 164 templates de projets
│   │   ├── workflows/           # 11 workflows de developpement
│   │   ├── config/              # 30 fichiers de configuration systeme
│   │   ├── modes/               # 7 modes operationnels
│   │   ├── prompts/             # Templates de prompts
│   │   ├── scripts/             # Scripts utilitaires
│   │   └── _archive/            # Archive legacy (1500+ fichiers)
│   ├── everything-claude-code/  # Package ECC installe
│   ├── hello-halo/              # Scripts et proxies Halo
│   ├── test-pipeline/           # Pipeline de tests
│   ├── .gitignore               # Git ignore du workspace
│   └── atum-crea.ico            # Icone ATUM CREA
└── README.md                    # Ce fichier
```

---

## Guide de Restauration

### Pre-requis (TOUTES les dependances)

#### Logiciels requis

| Logiciel | Version min. | Installation | Verification |
|----------|-------------|-------------|-------------|
| **Windows** | 10/11 | - | `winver` |
| **Node.js** | 20+ | https://nodejs.org | `node --version` |
| **npm** | 10+ | Inclus avec Node.js | `npm --version` |
| **npx** | 10+ | Inclus avec Node.js | `npx --version` |
| **Git** | 2.40+ | https://git-scm.com | `git --version` |
| **Python** | 3.10+ | https://python.org | `python --version` |
| **Halo IDE** | Latest | https://halo.dev | Ouvrir l'app |
| **Claude Code** | Latest | Via Halo IDE | `claude --version` |

#### Abonnements requis

| Service | Requis pour | Obtention |
|---------|-----------|-----------|
| **Anthropic (Claude)** | Moteur IA principal | https://console.anthropic.com |
| **GitHub** | Stockage code + MCP | https://github.com (PAT requis) |

#### Packages npm globaux (installes automatiquement via npx)

Les MCP servers utilisent `npx -y` qui telecharge automatiquement les packages.
Aucune installation manuelle requise - tout se fait au premier lancement.

Principaux packages utilises :
- `@anthropic-ai/claude-code` (Claude Code CLI)
- `@modelcontextprotocol/server-github` (GitHub MCP)
- `@modelcontextprotocol/server-memory` (Memory MCP)
- `@upstash/context7-mcp` (Context7 docs)
- `@anthropic-ai/claude-code-mcp-server-fetch` (Fetch MCP)
- `@anthropic-ai/claude-code-mcp-server-filesystem` (Filesystem MCP)
- `@anthropic-ai/claude-code-mcp-server-desktop-commander` (Desktop Commander)
- `@anthropic-ai/claude-code-mcp-server-sequential-thinking` (Sequential Thinking)
- `@anthropic-ai/claude-code-mcp-server-git` (Git MCP)
- `@supabase/mcp-server-supabase@latest` (Supabase MCP)
- Et 30+ autres serveurs MCP (voir `config.json`)

### Etape 1 : Cloner ce depot

```bash
git clone https://github.com/arnwaldn/ATUM-CREA-PAR-ARNAUD-PORCEL.git
cd ATUM-CREA-PAR-ARNAUD-PORCEL
```

### Etape 2 : Restaurer la configuration Claude (.claude)

```bash
# Copier tout le dossier .claude dans le home directory
xcopy /E /I /Y ".claude" "%USERPROFILE%\.claude"
```

Fichiers restaures :
- `CLAUDE.md` - Instructions systeme principales
- `AGENTS.md` - Registre des agents
- `settings.json` - Hooks ATUM CREA (verification pre-push, deploy check, etc.)
- `hooks.json` - Hooks ECC (tmux, Prettier auto-format, TypeScript check, console.log warn)
- `statusline.js` / `statusline.ps1` - Scripts de status line
- `.claude.json` - Configuration Claude Code
- `agents/` - 13 agents specialises
- `commands/` - 33 commandes
- `skills/` - 35 skills
- `rules/` - 6 regles auto-chargees
- `contexts/` - Contextes de travail
- `scripts/` - Scripts pour les hooks (CI, setup, lib)
- `mcp-configs/` - Configuration MCP supplementaire
- `plans/` - Plans architecturaux sauvegardes
- `plugins/` - Plugins Claude Code

### Etape 3 : Restaurer l'espace de travail

```bash
# Creer le dossier sur le Bureau
mkdir "%USERPROFILE%\Desktop\ATUM CREA"
xcopy /E /I /Y "workspace\*" "%USERPROFILE%\Desktop\ATUM CREA"
```

### Etape 4 : Restaurer la configuration Halo (.halo-dev)

```bash
# Copier les fichiers halo-dev
xcopy /E /I /Y ".halo-dev" "%USERPROFILE%\.halo-dev"
```

**IMPORTANT** : Le fichier `config.json` contient des **placeholders** a la place des vrais tokens.
Vous devez remplacer chaque `<YOUR_XXX>` par vos vrais tokens/cles API.

### Etape 5 : Configurer les tokens API

Ouvrir `.halo-dev/config.json` et remplacer les placeholders suivants :

| Placeholder | Service | Ou obtenir le token |
|---|---|---|
| `<YOUR_OPENAI_API_KEY>` | OpenAI | https://platform.openai.com/api-keys |
| `<YOUR_GITHUB_PAT>` | GitHub | https://github.com/settings/tokens |
| `<YOUR_SUPABASE_ACCESS_TOKEN>` | Supabase | https://supabase.com/dashboard/account/tokens |
| `<YOUR_SUPABASE_PROJECT_REF>` | Supabase | Dashboard du projet |
| `<YOUR_VERCEL_API_KEY>` | Vercel | https://vercel.com/account/tokens |
| `<YOUR_RAILWAY_TOKEN>` | Railway | https://railway.app/account/tokens |
| `<YOUR_CLOUDFLARE_API_TOKEN>` | Cloudflare | https://dash.cloudflare.com/profile/api-tokens |
| `<YOUR_CLOUDFLARE_ACCOUNT_ID>` | Cloudflare | Dashboard > Overview |
| `<YOUR_STRIPE_SECRET_KEY>` | Stripe | https://dashboard.stripe.com/apikeys |
| `<YOUR_RESEND_API_KEY>` | Resend | https://resend.com/api-keys |
| `<YOUR_NOTION_TOKEN>` | Notion | https://www.notion.so/my-integrations |
| `<YOUR_DEEPL_API_KEY>` | DeepL | https://www.deepl.com/account/summary |
| `<YOUR_EXA_API_KEY>` | Exa | https://dashboard.exa.ai |
| `<YOUR_TAVILY_API_KEY>` | Tavily | https://tavily.com |
| `<YOUR_FIRECRAWL_API_KEY>` | Firecrawl | https://firecrawl.dev |
| `<YOUR_REPLICATE_TOKEN>` | Replicate | https://replicate.com/account/api-tokens |
| `<YOUR_SENTRY_TOKEN>` | Sentry | https://sentry.io/settings/account/api/auth-tokens |
| `<YOUR_SONAR_TOKEN>` | SonarCloud | https://sonarcloud.io/account/security |
| `<YOUR_CLICKHOUSE_PASSWORD>` | ClickHouse | Console ClickHouse Cloud |
| `<YOUR_UPSTASH_API_KEY>` | Upstash | https://console.upstash.com |
| `<YOUR_SANITY_TOKEN>` | Sanity | https://www.sanity.io/manage |
| `<YOUR_SANITY_PROJECT_ID>` | Sanity | Dashboard du projet |
| `<YOUR_EXPO_TOKEN>` | Expo | https://expo.dev/accounts/settings/access-tokens |
| `<YOUR_YOUTUBE_API_KEY>` | YouTube | https://console.cloud.google.com/apis |
| `<YOUR_E2B_API_KEY>` | E2B | https://e2b.dev/dashboard |
| `<YOUR_MONGODB_CLIENT_ID>` | MongoDB | https://cloud.mongodb.com |
| `<YOUR_MONGODB_SECRET>` | MongoDB | Atlas API Keys |
| `<YOUR_ELEVENLABS_API_KEY>` | ElevenLabs | https://elevenlabs.io/app/settings/api-keys |
| `<YOUR_SLACK_BOT_TOKEN>` | Slack | https://api.slack.com/apps |
| `<YOUR_SLACK_TEAM_ID>` | Slack | Workspace Settings |
| `<YOUR_EMAIL>` | Personnel | Votre adresse email |

### Etape 6 : Verifier l'installation

1. Ouvrir Halo IDE (ATUM CREA)
2. Ouvrir l'espace de travail `C:\Users\<username>\Desktop\ATUM CREA`
3. Demarrer une nouvelle conversation
4. Taper une commande simple comme "Bonjour" pour verifier que Claude repond
5. Verifier que les MCP servers se chargent (memory, context7, github, supabase)

---

## Statistiques du Systeme

| Composant | Quantite |
|---|---|
| Agents specialises | 13 |
| Commandes | 33 |
| Skills | 37 |
| Regles auto-chargees | 6 |
| Fichiers knowledge | 175+ |
| Templates de projets | 164 |
| Workflows | 11 |
| Modes operationnels | 7 |
| Fichiers config systeme | 30 |
| Serveurs MCP configures | 40+ |
| Fichiers archive legacy | 1500+ |
| **Total fichiers** | **2500+** |

---

## Ce qui N'EST PAS inclus (et pourquoi)

| Element | Raison | Action a la restauration |
|---------|--------|--------------------------|
| `.credentials.json` | Contient les tokens OAuth en clair | Se re-authentifier via Claude Code |
| `.env` (avec vrais tokens) | Securite | Remplir `.env.example` avec vos tokens |
| `history.jsonl` | Historique de conversation (poids, pas critique) | Se regenere automatiquement |
| `todos/` | Todos des sessions precedentes (temporaire) | Se regenere automatiquement |
| `tasks/` | Tasks des sessions precedentes (temporaire) | Se regenere automatiquement |
| `debug/` | Logs de debug (temporaire) | Se regenere automatiquement |
| `file-history/` | Historique d'edition (608 fichiers, temporaire) | Se regenere automatiquement |
| `paste-cache/` | Cache du presse-papier (temporaire) | Se regenere automatiquement |
| `shell-snapshots/` | Snapshots shell (temporaire) | Se regenere automatiquement |
| `projects/` | Conversations par projet (historique) | Se regenere automatiquement |
| `telemetry/` | Donnees de telemetrie (temporaire) | Se regenere automatiquement |
| `downloads/` | Fichiers telecharges (vide) | - |
| `.halo-dev/temp/` | Fichiers temporaires | Se regenere automatiquement |
| `.halo-dev/spaces/` | Espaces de travail cache | Se regenere automatiquement |
| `node_modules/` | Dependances npm | Reinstallees automatiquement via `npx` |

Tous ces fichiers sont soit **regeneres automatiquement** par Claude Code/Halo au premier usage,
soit des **fichiers temporaires** qui n'ont pas de valeur pour la restauration du systeme.

---

## Notes de securite

- Le fichier `config.json` a ete **anonymise** : tous les tokens/API keys ont ete remplaces par des placeholders
- Les fichiers `.credentials.json` et les backups de credentials n'ont **pas** ete inclus
- Le fichier `.env` a ete inclus comme `.env.example`
- La base de donnees Hindsight (`hindsight.db`) contient les memoires accumulees du systeme
- **Si ce depot est public**, ne JAMAIS y pousser de vrais tokens

---

## Auteur

**Arnaud Porcel**
Systeme ATUM CREA v3.1 - Fevrier 2026
