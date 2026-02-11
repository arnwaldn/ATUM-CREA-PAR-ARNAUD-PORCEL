# Conscience Environnementale + Orchestration MCP Intelligente

## Contexte

ATUM CREA a 52 MCPs configures, mais le systeme est **aveugle** :
- Le system prompt ne mentionne AUCUN MCP (Claude ne sait pas ce qui existe)
- `config_toggle_mcp_server` ecrit dans config.json mais n'active rien en temps reel
- Le SDK a `setMcpServers()` sur Query (ligne 13812 de sdk.mjs) qui peut charger/decharger des MCPs **en cours de session** — mais hello-halo ne l'utilise pas

**Objectif** : ATUM CREA doit avoir une conscience complete de son environnement et orchestrer ses MCPs de facon autonome — activer a la demande, utiliser, desactiver quand c'est fait.

---

## Architecture

```
Utilisateur: "Deploie mon app sur Vercel"
    |
    v
System Prompt ──► Claude SAIT que 'vercel' existe (desactive, pret)
    |
    v
Claude appelle ──► mcp_activate({name: 'vercel'})
    |
    v
mcp-orchestrator.ts ──► v2Session.setMcpServers({...actifs, vercel: config})
    |                     (chargement dynamique, ZERO interruption)
    v
Claude utilise ──► mcp__vercel__deploy(...)
    |
    v
Claude appelle ──► mcp_deactivate({name: 'vercel'})
    |
    v
Session allegee (moins d'outils = moins de tokens)
```

---

## Etape 1 : Refactoring helpers.ts (prerequis)

**Fichier** : `src/main/services/agent/helpers.ts`

### 1a. Exporter `hasPlaceholderEnvValues`

Actuellement `function` privee (ligne 264). Ajouter `export`.

### 1b. Ajouter `MCP_DESCRIPTIONS` — descriptions anglaises hardcodees

```typescript
export const MCP_DESCRIPTIONS: Record<string, string> = {
  'memory': 'Persistent memory across sessions',
  'sequential-thinking': 'Step-by-step reasoning for complex problems',
  'context7': 'Up-to-date framework documentation',
  'filesystem': 'File operations (read, write, search)',
  'git': 'Git operations (commits, branches, diffs)',
  'github': 'GitHub repos, issues, PRs, code search',
  'fetch': 'Web content retrieval (pages, APIs)',
  'supabase': 'Supabase backend (database, auth, storage)',
  'tavily': 'AI-optimized web search',
  'exa': 'Semantic search with neural embeddings',
  'firecrawl': 'Smart web scraping and content extraction',
  'shadcn': 'Pre-built shadcn/ui components',
  // ... les 52 descriptions copiees depuis en.json
}
```

Pourquoi hardcode et pas i18n : le system prompt tourne dans le main process, pas le renderer. On ne veut pas coupler les deux. L'anglais est la langue de Claude.

### 1c. Ajouter `getMcpServerReadiness()`

```typescript
export type McpReadiness = 'active' | 'available' | 'missing-credentials' | 'disabled'

export interface McpServerInfo {
  name: string
  status: McpReadiness
  category: string
  isCore: boolean
  description: string
  missingEnvKeys?: string[]
}

export function getMcpServerReadiness(mcpServers: Record<string, any>): McpServerInfo[]
```

Logique : pour chaque serveur dans config, croiser avec MCP_REGISTRY (categorie, isCore) + MCP_DESCRIPTIONS + `hasPlaceholderEnvValues()` + `disabled`.

---

## Etape 2 : Patch SDK — exposer setMcpServers sur SessionImpl

**Fichier** : `node_modules/@anthropic-ai/claude-agent-sdk/sdk.mjs` (ligne 14097)

`SessionImpl` delegue `setModel`, `setMaxThinkingTokens`, `setPermissionMode` vers `this.query.*` mais **PAS** `setMcpServers`. Ajouter :

```javascript
async setMcpServers(servers) {
  return this.query.setMcpServers(servers);
}
```

Apres la ligne 14097 (`setPermissionMode`), avant le getter `pid`.

**Aussi** : creer un patch script (`scripts/patch-sdk.js`) pour reappliquer ce patch apres `npm install`, comme le patch `pid` existant.

---

## Etape 3 : System Prompt — Catalogue MCP

**Fichier** : `src/main/services/agent/system-prompt.ts`

### 3a. Nouvelle fonction `buildMcpCatalogSection()`

Genere une section dynamique du system prompt avec le catalogue complet :

```markdown
# MCP Server Environment

You have 52 MCP servers configured. Use mcp__mcp-orchestrator__ tools to activate on-demand.

## Active (12)
| Server | Description |
|--------|-------------|
| memory | Persistent memory across sessions [core] |
| context7 | Up-to-date framework documentation [core] |
| github | GitHub repos, issues, PRs [core] |
...

## Available — can activate on-demand (28)
| Server | Category | Description |
|--------|----------|-------------|
| vercel | deployment | Vercel deployment (Next.js, serverless) |
| stripe | external | Stripe payments and subscriptions |
| playwright | automation | Multi-browser automation |
...

## Missing Credentials (12)
| Server | Needs |
|--------|-------|
| sentry | SENTRY_AUTH_TOKEN |
| notion | NOTION_API_KEY |
...
```

Appelle `getMcpServerReadiness()` de helpers.ts. ~400-600 tokens (acceptable).

### 3b. Section instructions orchestrateur

```markdown
# Dynamic MCP Orchestration

Activate and deactivate MCP servers within the current conversation — no restart needed.

**Tools** (prefix: mcp__mcp-orchestrator__):
- `mcp_environment`: Full MCP status (active, available, missing credentials)
- `mcp_discover`: Find relevant MCPs for an intent ("deploy", "payments", "scraping")
- `mcp_activate`: Load an MCP server into this session instantly
- `mcp_deactivate`: Unload a non-core MCP when done (saves tokens)

**Workflow**:
- User says "deploy on Vercel" → `mcp_activate({name: 'vercel'})` → use vercel tools → `mcp_deactivate({name: 'vercel'})`
- User says "add Stripe payments" → `mcp_activate({name: 'stripe'})` → use stripe tools
- If credentials missing → tell user what's needed

**Rules**:
- NEVER deactivate core servers
- If credentials are missing, guide the user to provide them
- Prefer one activation at a time
- Dynamic activations are session-scoped (don't persist)
```

### 3c. Appeler dans `buildSystemPrompt()`

Inserer `buildMcpCatalogSection()` avant la section `Tool usage policy` existante.

---

## Etape 4 : MCP Orchestrator — nouveau serveur MCP in-process

**Nouveau fichier** : `src/main/services/agent/mcp-orchestrator.ts` (~250 lignes)

Pattern identique a config-manager-mcp.ts et hindsight/sdk-mcp-server.ts.

### State module-level

```typescript
let activeSessionRef: any = null  // V2 session reference
let dynamicServers = new Map<string, any>()  // Servers activated this session
let activationTimestamps: number[] = []  // Rate limiting

export function setOrchestratorSession(session: any): void
export function clearOrchestratorSession(): void
```

### 4 outils

**`mcp_environment`** — Vue complete de l'environnement
- Input : aucun
- Output : JSON de tous les serveurs avec status, categorie, description
- Impl : appelle `getMcpServerReadiness(getConfig().mcpServers)`

**`mcp_discover`** — Recherche par intent
- Input : `{ intent: string }`
- Output : top 5 MCPs pertinents avec descriptions et readiness
- Impl : table de mapping intent → MCPs :
  ```typescript
  const INTENT_MAP: Record<string, string[]> = {
    'deploy': ['vercel', 'railway', 'cloudflare'],
    'payment': ['stripe'],
    'database': ['supabase', 'postgres', 'sqlite', 'clickhouse', 'neo4j'],
    'email': ['resend'],
    'search': ['tavily', 'exa', 'firecrawl'],
    'scraping': ['firecrawl', 'puppeteer', 'playwright'],
    'browser': ['puppeteer', 'playwright', 'browserbase'],
    'mobile': ['expo', 'dart-flutter'],
    'design': ['figma', 'shadcn', 'magic', 'magic-ui'],
    'chart': ['echarts', 'mermaid'],
    'translation': ['deepl'],
    'cms': ['notion', 'sanity'],
    'monitoring': ['sentry'],
    'security': ['semgrep', 'sonarqube'],
    'document': ['docling', 'code2prompt'],
    '3d': ['blender', 'unity'],
    'ai': ['ollama', 'replicate'],
    'video': ['youtube'],
    'docker': ['docker-mcp'],
    'cache': ['upstash'],
    'automation': ['desktop-commander', 'desktop-automation'],
  }
  ```
  + matching fuzzy sur les noms/descriptions

**`mcp_activate`** — Chargement dynamique
- Input : `{ name: string }`
- Output : succes/erreur
- Impl :
  1. Verifier que le serveur existe dans config
  2. Verifier pas de placeholder credentials → sinon erreur avec les cles manquantes
  3. Verifier pas deja actif
  4. Rate limit : max 5 activations / 60s
  5. Lire config du serveur, stripper champs Halo (disabled, oauth)
  6. Injecter token OAuth si HTTP + oauth.accessToken
  7. `activeSessionRef.setMcpServers({...currentDynamic, [name]: serverConfig})`
  8. Tracker dans `dynamicServers`
  9. Retourner result (added/removed/errors)

**`mcp_deactivate`** — Dechargement
- Input : `{ name: string }`
- Output : succes/erreur
- Impl :
  1. Verifier que le serveur est dans `dynamicServers` (pas un serveur charge au boot)
  2. Rejeter si `isCore === true`
  3. Retirer de `dynamicServers`
  4. `activeSessionRef.setMcpServers({...remainingDynamic})`

### Export

```typescript
export function createMcpOrchestratorServer() {
  return createSdkMcpServer({
    name: 'mcp-orchestrator',
    version: '1.0.0',
    tools: [mcp_environment, mcp_discover, mcp_activate, mcp_deactivate]
  })
}
```

---

## Etape 5 : Integration send-message.ts

**Fichier** : `src/main/services/agent/send-message.ts`

### 5a. Import

```typescript
import { createMcpOrchestratorServer, setOrchestratorSession, clearOrchestratorSession } from './mcp-orchestrator'
```

### 5b. Injection (apres ligne 226, apres hindsight)

```typescript
mcpServers['mcp-orchestrator'] = createMcpOrchestratorServer()
```

### 5c. Set session reference (apres ligne ~280, apres `v2Session.setModel`)

```typescript
setOrchestratorSession(v2Session)
```

### 5d. Clear session reference (dans le finally block, ~ligne 379)

```typescript
clearOrchestratorSession()
```

---

## Securite

| Regle | Implementation |
|-------|---------------|
| Jamais desactiver un core | `mcp_deactivate` verifie `MCP_REGISTRY[name]?.isCore` |
| Jamais activer sans credentials | `mcp_activate` verifie `hasPlaceholderEnvValues()` |
| Rate limiting | Max 5 activations / 60s par session |
| Session invalide | Tous les outils verifient `activeSessionRef !== null` |
| Serveurs boot proteges | `mcp_deactivate` ne fonctionne que sur les serveurs dynamiques |

---

## Fichiers

| Fichier | Action | Lignes |
|---------|--------|--------|
| `src/main/services/agent/mcp-orchestrator.ts` | **CREER** | ~250 |
| `src/main/services/agent/helpers.ts` | **MODIFIER** | +60 (export, descriptions, readiness) |
| `src/main/services/agent/system-prompt.ts` | **MODIFIER** | +80 (catalogue + instructions) |
| `src/main/services/agent/send-message.ts` | **MODIFIER** | +6 (import, injection, session lifecycle) |
| `node_modules/.../sdk.mjs` | **PATCH** | +3 (setMcpServers delegate) |
| `scripts/patch-sdk.js` | **CREER** | ~20 (auto-apply patch after npm install) |

**Zero nouvelle dependance.** Pattern in-process MCP eprouve (config-manager, hindsight).

---

## Verification

1. **Conscience** : Demarrer ATUM CREA → envoyer "What MCP servers do I have?" → Claude liste tous les 52 MCPs avec statut
2. **Decouverte** : Envoyer "I want to deploy on Vercel" → Claude appelle `mcp_discover({intent: 'deploy'})` → suggere vercel, railway, cloudflare
3. **Activation** : Claude appelle `mcp_activate({name: 'vercel'})` → les outils vercel sont disponibles immediatement
4. **Utilisation** : Claude utilise `mcp__vercel__deploy(...)` dans le meme tour
5. **Desactivation** : Claude appelle `mcp_deactivate({name: 'vercel'})` → outils retires
6. **Credentials manquants** : `mcp_activate({name: 'sentry'})` → erreur "Missing SENTRY_AUTH_TOKEN"
7. **Protection core** : `mcp_deactivate({name: 'memory'})` → erreur "Cannot deactivate core server"
8. **Rate limit** : 6 activations rapides → 6eme rejetee "Rate limit exceeded"
