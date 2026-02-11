# Plan : Fix OAuth 2.1 PKCE — Auto-start HTTP Server

## Contexte

L'implémentation OAuth 2.1 PKCE pour les 5 serveurs MCP HTTP est **déjà codée** (12 fichiers, ~490 lignes). Le test en live a révélé **un seul bug** : le serveur HTTP Express n'est pas démarré par défaut (il ne se lance que pour l'accès distant), donc le callback OAuth ne peut pas être reçu.

**Recherche approfondie effectuée** :
- Spec officielle MCP : OAuth 2.1 + PKCE obligatoire pour HTTP MCP → notre implémentation est conforme
- SDK `@modelcontextprotocol/sdk` : fournit `OAuthClientProvider` mais inutilisable (Claude Agent SDK spawne CLI subprocess)
- Implémentations de référence (mcp-remote, oauth-callback, electron-oauth2) : même pattern que nous (localhost HTTP + Bearer header injection)
- Le champ `headers` de `McpHttpServerConfig` est le seul point d'injection disponible → notre approche est la bonne

## Fix déjà appliqué

**Fichier** : `src/main/services/mcp-oauth/oauth-service.ts`

**Avant** :
```typescript
const serverInfo = getServerInfo()
if (!serverInfo.running || !serverInfo.port) {
  throw new Error('HTTP server not running. Cannot receive OAuth callback.')
}
```

**Après** :
```typescript
import { getServerInfo, startHttpServer, isServerRunning } from '../../http/server'

let serverInfo = getServerInfo()
if (!serverInfo.running || !serverInfo.port) {
  console.log('[MCP-OAuth] HTTP server not running, auto-starting for OAuth callback...')
  const result = await startHttpServer()
  serverInfo = { running: true, port: result.port, token: result.token, clients: 0 }
}
```

Build vérifié : `tsc --noEmit` passe sans erreur.

## Vérification

1. Relancer l'app (`npm run dev`)
2. Settings → MCP Servers → cliquer "Connect" sur Vercel
3. Vérifier dans les logs : `[MCP-OAuth] HTTP server not running, auto-starting...` puis `[HTTP] Server started on port XXXX`
4. Chrome s'ouvre → s'authentifier → callback reçu → badge vert "Auth"
5. Envoyer un message utilisant un outil Vercel → vérifier le succès
