# Plan: Config Manager MCP — Claude configure les MCP depuis le chat

## Context

Les utilisateurs d'ATUM CREA sont des **non-codeurs novices**. Ils ne savent pas editer du JSON.
Pour ajouter un MCP server (ex: Vercel), ils doivent actuellement aller dans Settings > MCP > JSON mode
et taper la config a la main. C'est un bloquant.

**Objectif** : Claude peut configurer les MCP servers **depuis le chat**, en guidant l'utilisateur
pas a pas (demander le token, expliquer ou le trouver, appliquer la config automatiquement).

**Pattern existant** : L'AI Browser fonctionne exactement comme ca — un MCP server in-process
cree avec `tool()` + `createSdkMcpServer()` du SDK, injecte dans chaque session.

## Architecture

```
Utilisateur: "Ajoute le MCP Vercel"
    ↓
Claude (via system prompt): sait qu'il a des outils config_*
    ↓
Claude appelle mcp__config-manager__config_list_mcp_servers
    ↓
Claude appelle mcp__config-manager__config_add_mcp_server
    ↓
L'outil appelle saveConfig({ mcpServers: ... }) dans le main process
    ↓
Config sauvee dans ~/.halo-dev/config.json
    ↓
Claude dit: "C'est fait ! Demarre une nouvelle conversation pour utiliser Vercel."
```

## Fichiers a creer/modifier

| Fichier | Action | Raison |
|---------|--------|--------|
| `src/main/services/agent/config-manager-mcp.ts` | **CREER** | MCP server in-process avec 5 outils |
| `src/main/services/agent/send-message.ts` | modifier | Injecter config-manager dans chaque session |
| `src/main/services/agent/system-prompt.ts` | modifier | Ajouter section Config Manager au prompt |

## 1. Creer `config-manager-mcp.ts`

Meme pattern que `ai-browser/sdk-mcp-server.ts` :

```typescript
import { z } from 'zod'
import { tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk'
import { getConfig, saveConfig } from '../config.service'
```

### 5 outils :

**`config_list_mcp_servers`** — Lister tous les MCP servers
- Pas de parametres
- Retourne la liste avec nom, type (stdio/http), enabled/disabled, commande, env vars (cles seulement, pas les valeurs)

**`config_add_mcp_server`** — Ajouter un nouveau serveur
- Params: `name` (string), `command` (string), `args` (string[]), `env` (Record<string, string> optionnel)
- Verifie que le nom n'existe pas deja
- Appelle `saveConfig({ mcpServers: { ...existing, [name]: newConfig } })`
- Retourne confirmation

**`config_update_mcp_server`** — Modifier un serveur existant
- Params: `name` (string), `env` (Record<string, string> optionnel — merge, ne remplace pas)
- Cas d'usage principal: mettre a jour un token
- Verifie que le serveur existe

**`config_remove_mcp_server`** — Supprimer un serveur
- Params: `name` (string)
- Verifie que le serveur existe
- Supprime la cle du mcpServers

**`config_toggle_mcp_server`** — Activer/desactiver un serveur
- Params: `name` (string), `enabled` (boolean)
- Set `disabled: true/false`

### Export :

```typescript
export function createConfigManagerMcpServer() {
  return createSdkMcpServer({
    name: 'config-manager',
    version: '1.0.0',
    tools: [
      config_list_mcp_servers,
      config_add_mcp_server,
      config_update_mcp_server,
      config_remove_mcp_server,
      config_toggle_mcp_server
    ]
  })
}
```

## 2. Modifier `send-message.ts`

Apres la ligne qui injecte AI Browser (ligne ~144), ajouter l'injection inconditionnelle :

```typescript
import { createConfigManagerMcpServer } from './config-manager-mcp'

// ...dans sendMessage():

// Config Manager MCP server (always available)
mcpServers['config-manager'] = createConfigManagerMcpServer()
```

Contrairement a l'AI Browser (conditionnel sur `aiBrowserEnabled`), le config-manager
est **toujours injecte** car la gestion MCP doit etre disponible a tout moment.

## 3. Modifier `system-prompt.ts`

Ajouter une section au system prompt de base (pas conditionnel comme AI Browser).
Dans `buildSystemPrompt()`, ajouter apres la section ECC :

```typescript
export const CONFIG_MANAGER_SYSTEM_PROMPT = `
## MCP Server Management

You can help users configure MCP (Model Context Protocol) servers directly from this chat.
MCP servers extend your capabilities (database access, deployments, web scraping, etc.).

### Available Tools (prefix: mcp__config-manager__)

- \`config_list_mcp_servers\` - List all configured MCP servers
- \`config_add_mcp_server\` - Add a new MCP server
- \`config_update_mcp_server\` - Update an existing server (e.g., change API token)
- \`config_remove_mcp_server\` - Remove a server
- \`config_toggle_mcp_server\` - Enable or disable a server

### How to Help Users

When a user wants to add an MCP server:
1. Ask which service they want (Vercel, Supabase, GitHub, etc.)
2. Explain what API token/key is needed and where to find it
3. Once they provide the token, use config_add_mcp_server to set it up
4. Tell them to start a new conversation for the server to be available

Common MCP servers:
- **Vercel**: command "npx", args ["-y", "vercel-mcp"], env VERCEL_API_TOKEN
- **GitHub**: command "npx", args ["-y", "@modelcontextprotocol/server-github"], env GITHUB_PERSONAL_ACCESS_TOKEN
- **Supabase**: command "npx", args ["-y", "@supabase/mcp-server-supabase@latest", "--project-ref", "<REF>"], env SUPABASE_ACCESS_TOKEN
- **Firecrawl**: command "npx", args ["-y", "firecrawl-mcp"], env FIRECRAWL_API_KEY

Important: After adding/modifying servers, tell the user to start a new conversation
for the changes to take effect (MCP servers are loaded at session start).
`
```

Integrer cette constante dans `buildSystemPrompt()` apres la section ECC awareness.

## Ce qui ne change PAS

- `config.service.ts` — `getConfig()` et `saveConfig()` deja fonctionnels
- `McpServerList.tsx` — l'UI Settings continue de fonctionner independamment
- `mcp-auto-detect.ts` — le merge additif est toujours la
- Les types `McpStdioServerConfig` — deja complets
- L'AI Browser — pas impacte
- `sdk-config.ts` — `allowedTools` n'a pas besoin de changer (les MCP tools sont auto-approuves via `permissionMode: 'acceptEdits'`)

## Verification

1. `npm run build` — pas d'erreurs TypeScript
2. Lancer l'app, ouvrir une conversation
3. Taper "Liste mes MCP servers" → Claude utilise `config_list_mcp_servers`
4. Taper "Ajoute un MCP test" → Claude utilise `config_add_mcp_server`
5. Verifier dans Settings > MCP que le nouveau serveur apparait
6. Taper "Desactive le MCP test" → Claude utilise `config_toggle_mcp_server`
7. Taper "Supprime le MCP test" → Claude utilise `config_remove_mcp_server`
