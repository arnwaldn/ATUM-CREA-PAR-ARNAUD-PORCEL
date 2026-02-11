# ATUM CREA — Audit MCP & Plan d'Amelioration

## Contexte

L'utilisateur veut un inventaire complet des MCP, verifier si tout le necessaire est present, et confirmer que l'IA d'ATUM CREA a conscience de tous ses MCP et peut les activer/desactiver dynamiquement.

---

## 1. INVENTAIRE COMPLET (43 serveurs dans config.json)

### ACTIFS (22 serveurs) — toujours charges au demarrage

| # | Serveur | Package | Creds | Role |
|---|---------|---------|-------|------|
| 1 | **memory** | `@modelcontextprotocol/server-memory` | - | Memoire persistante [CORE] |
| 2 | **context7** | `@upstash/context7-mcp` | - | Doc frameworks [CORE] |
| 3 | **sequential-thinking** | `@modelcontextprotocol/server-sequential-thinking` | - | Raisonnement [CORE] |
| 4 | **git** | `mcp-server-git` (uvx) | - | Operations git [CORE] |
| 5 | **github** | `@modelcontextprotocol/server-github` | Token OK | GitHub API [CORE] |
| 6 | **supabase** | `@supabase/mcp-server-supabase` | Token OK | Backend [CORE] |
| 7 | **filesystem** | `@modelcontextprotocol/server-filesystem` | - | Fichiers [CORE] |
| 8 | **fetch** | `mcp-server-fetch` (uvx) | - | Web fetch [CORE] |
| 9 | **desktop-commander** | `@wonderwhy-er/desktop-commander` | - | Commandes systeme |
| 10 | **playwright** | `@automatalabs/mcp-server-playwright` | - | Browser automation |
| 11 | **shadcn** | `shadcn-ui-mcp-server` | - | UI components |
| 12 | **vercel** | `vercel-mcp` | Token OK | Deploiement |
| 13 | **stripe** | `@stripe/mcp` | Test key OK | Paiements |
| 14 | **resend** | `resend-mcp` | Token OK | Emails |
| 15 | **notion** | `@notionhq/notion-mcp-server` | Bearer OK | CMS/Notes |
| 16 | **deepl** | `deepl-mcp-server` | Key OK | Traduction |
| 17 | **exa** | `exa-mcp-server` | Key OK | Recherche web |
| 18 | **tavily** | HTTP MCP | Key in URL | Recherche web |
| 19 | **docker-mcp** | `docker run mcp gateway` | - | Docker gateway |
| 20 | **e2b** | `@e2b/mcp-server` | Token OK | Code sandbox |
| 21 | **mermaid** | `@mermaidchart/mcp-server` | - | Diagrammes |
| 22 | **docling** | `docling-mcp-server` | - | Document parsing |

### DESACTIVES (18 serveurs) — activables a la demande via l'orchestrateur

| # | Serveur | Package | Creds | Role |
|---|---------|---------|-------|------|
| 1 | **railway** | `@railway/mcp-server` | Token OK | Deploiement alt |
| 2 | **cloudflare** | `@cloudflare/mcp-server-cloudflare` | Token OK | Workers/R2/D1 |
| 3 | **cloudflare-docs** | HTTP MCP | - | Docs Cloudflare |
| 4 | **firecrawl** | `firecrawl-mcp` | Key OK | Web scraping (credits epuises) |
| 5 | **ollama** | `ollama-mcp-server` | Host OK | LLM local |
| 6 | **replicate** | `mcp-replicate` | Token OK | AI models |
| 7 | **sentry** | `@sentry/mcp-server` | Token OK | Error tracking |
| 8 | **sonarqube** | `oe-sonar-mcp` | Token OK | Code quality |
| 9 | **semgrep** | `mcp-server-semgrep` | - | Security scan |
| 10 | **clickhouse** | `clickhouse-mcp` | Creds OK | Analytics DB |
| 11 | **upstash** | `@upstash/mcp-server` | Creds OK | Redis/Kafka |
| 12 | **sanity** | `@sanity/mcp-server` | Creds OK | CMS headless |
| 13 | **expo** | `expo-mcp` | Token OK | Mobile (React Native) |
| 14 | **dart-flutter** | `dart dart_mcp_server` | - | Mobile (Flutter) |
| 15 | **unity** | `@iflow-mcp/mcp-unity-server` | - | Game dev |
| 16 | **blender** | `blender-mcp` (uvx) | - | 3D modeling |
| 17 | **figma** | `figma-mcp` | - | Design |
| 18 | **youtube** | `youtube-data-mcp-server` | - | YouTube data |

### SERVEURS INTERNES (non dans config.json, injectes automatiquement)

| Serveur | Type | Role |
|---------|------|------|
| **hindsight** | SDK MCP natif | Memoire auto-apprenante (7 outils) |
| **mcp-orchestrator** | SDK MCP natif | Gestion dynamique MCP (4 outils) |
| **config-manager** | SDK MCP natif | Modification config depuis le chat (5 outils) |
| **ai-browser** | Conditionnel | Browser AI (quand active dans l'UI) |

---

## 2. CE QUI MANQUE — Analyse des lacunes

### Lacune 1 : 8 descriptions orphelines (dans le code, pas dans config.json)
Les serveurs suivants sont decrits dans `MCP_DESCRIPTIONS` de helpers.ts mais **n'existent pas dans config.json** :
- `sqlite`, `code2prompt`, `vscode`, `desktop-automation`, `puppeteer`, `neo4j`, `postgres`, `browserbase`

**Impact** : L'IA peut les mentionner dans `mcp_discover` mais `mcp_activate` echoue car ils n'existent pas en config.

**Correction** : Les ajouter a config.json comme `disabled: true` avec la bonne commande.

### Lacune 2 : Serveurs potentiellement utiles absents
Pour un systeme de vibe coding complet, il pourrait manquer :
- `prisma` — ORM (mentionne dans la stack preferee)
- `tailwindcss` — CSS utility framework MCP (si existant)
- `turso` — LibSQL/SQLite edge (alternative a Supabase)

### Lacune 3 : Duplication magic-ui
Deux entrees : `magic` et `magic-ui` font reference au meme service (@21st-dev). A nettoyer.

---

## 3. CONSCIENCE DE L'IA — L'orchestrateur

### Ce que l'IA voit au demarrage de chaque session :
1. **Section "MCP Server Environment"** dans le system prompt avec :
   - Liste des serveurs **actifs** (avec badge [core] pour les 8 proteges)
   - Liste des serveurs **disponibles** (desactives mais activables)
   - Liste des serveurs a **credentials manquants**
   - Compteur `X/8 actifs` + instructions

2. **4 outils d'orchestration** :
   - `mcp_environment` — voir l'etat complet
   - `mcp_discover` — trouver les MCP pertinents pour une tache (63+ mots-cles)
   - `mcp_activate` — charger un MCP a chaud (hot-loading)
   - `mcp_deactivate` — decharger un MCP non-core

3. **Contraintes** :
   - Max **8 MCP actifs** simultanement
   - Rate limit : 5 activations / 60 secondes
   - 8 serveurs **core** proteges (memory, context7, git, github, supabase, filesystem, fetch, sequential-thinking)
   - Les activations sont **ephemeres** (duree de la session seulement)

### Verdict : OUI, l'IA a pleine conscience et controle dynamique
L'IA peut decouvrir, activer et desactiver les MCP selon ses besoins. Exemple concret :
- User : "deploie mon app sur Cloudflare"
- IA : appelle `mcp_discover("deploy")` → trouve cloudflare
- IA : appelle `mcp_activate("cloudflare")` → cloudflare charge a chaud
- IA : utilise les outils Cloudflare (Workers, R2, D1...)
- IA : appelle `mcp_deactivate("cloudflare")` quand fini → libere un slot

---

## 4. PLAN DE CORRECTION

### 4.1 Ajouter les 8 serveurs orphelins a config.json (disabled)

```
sqlite      → npx @modelcontextprotocol/server-sqlite
puppeteer   → npx @modelcontextprotocol/server-puppeteer  (disabled - schema issues)
postgres    → npx @modelcontextprotocol/server-postgres    (needs DATABASE_URL)
browserbase → npx @browserbasehq/mcp-server-browserbase   (needs BROWSERBASE_API_KEY)
neo4j       → npx neo4j-mcp-server                        (needs NEO4J_URI, NEO4J_PASSWORD)
vscode      → npx vscode-mcp-server                       (needs VS Code running)
code2prompt → npx code2prompt-mcp                          (utility)
desktop-automation → npx desktop-automation-mcp            (utility)
```

### 4.2 Supprimer le doublon magic-ui
Garder `magic-ui` (package `@21st-dev/magic`), supprimer `magic` (doublon).

### 4.3 Verifier les packages npm existent
Avant d'ajouter les 8 serveurs, verifier que les packages npm sont reels (lecon de la session precedente : 9 packages fantomes trouves).

### Fichiers a modifier :
- `~/.halo-dev/config.json` — ajouter/supprimer serveurs
- `helpers.ts` — nettoyer descriptions orphelines si packages n'existent pas

---

## 5. VERIFICATION

1. Lancer l'app → envoyer "What MCP servers do I have?" → l'IA doit lister tous les serveurs
2. Envoyer "I need to work with PostgreSQL" → l'IA doit `mcp_discover("database")` → trouver postgres
3. Verifier que `mcp_activate("postgres")` fonctionne si le serveur est en config
4. Verifier `mcp_deactivate` sur un non-core → le serveur disparait
5. `npx tsc --noEmit` → zero erreurs apres modifications
