# Audit : Integration Auto-Claude dans ATUM CREA

## Contexte

Auto-Claude (https://github.com/AndyMik90/Auto-Claude) est un framework d'orchestration multi-agent autonome. ATUM CREA utilise hello-halo comme interface. La question est : est-ce que les capacites d'Auto-Claude sont bien integrees dans le systeme, en dehors de l'interface ?

## Reponse courte : NON - L'orchestration Auto-Claude a ete perdue

Quand on a remplace l'ancienne interface (`atum-crea/`) par hello-halo, on a supprime le backend Python d'Auto-Claude qui contenait toute la couche d'orchestration. Hello-halo est une app autonome avec son propre backend TypeScript.

---

## Ce qui FONCTIONNE (via Claude Code CLI + ECC)

| Capacite Auto-Claude | Status dans ATUM CREA | Comment |
|----------------------|----------------------|---------|
| Agent unique intelligent | FONCTIONNE | Claude Code CLI via SDK, streaming temps reel |
| ECC (agents, skills, commands, rules) | FONCTIONNE | Injecte via env vars, detecte au boot |
| Task tool (sub-agents) | FONCTIONNE* | Le CLI Claude Code a deja Task/TaskCreate built-in |
| Recherche codebase | FONCTIONNE | Grep, Glob, Read, Task(Explore) via CLI |
| Execution shell | FONCTIONNE | Bash tool via CLI |
| Edition de fichiers | FONCTIONNE | Read/Write/Edit via CLI |
| OAuth subscription | FONCTIONNE | Zero cout API |
| Extended thinking | FONCTIONNE | Streaming + visualisation |
| Session reuse (V2) | FONCTIONNE | Processus CLI reutilise entre messages |

*Le Claude Code CLI peut spawner des sub-agents en interne via le Task tool. L'utilisateur ne le voit pas dans l'UI, mais le CLI le fait.

## Ce qui est PERDU (backend Python Auto-Claude supprime)

| Capacite Auto-Claude | Status | Impact |
|----------------------|--------|--------|
| **12 terminals paralleles** | PERDU | Hello-halo = 1 session a la fois |
| **Git worktree isolation** | PERDU | Pas de protection branch main |
| **GitHub/GitLab integration** | PERDU | Pas d'import issues ni MR auto |
| **Linear integration** | PERDU | Pas de sync taches Linear |
| **Kanban board UI** | PERDU | Interface replaced |
| **Changelog generation** | PERDU | Pas de generation auto |
| **QA pipeline (3 layers)** | PERDU | Pas de validation auto |
| **Memory/Instinct layer** | PARTIELLEMENT | instinct_store.py supprime, mais Claude CLI a sa propre memoire |
| **Multi-model orchestration** | PARTIELLEMENT | ECC commands existent (/orchestrate, /multi-*) mais pas de backend pour les executer en parallele |

## Ce qui est DISPONIBLE MAIS PAS WIRE

| Capacite | Ou ca existe | Pourquoi pas wire |
|----------|-------------|-------------------|
| **MCP Servers** | `~/.claude/mcp-configs/` (15 serveurs definis) | `~/.halo-dev/config.json` a `"mcpServers": {}` vide |
| **ECC multi-agent commands** | `~/.claude/commands/` (orchestrate, multi-plan, etc.) | Le CLI peut les executer, mais pas de UI pour les declencher |
| **Contexts (dev/research/review)** | `~/.claude/contexts/` | Phase hardcodee a "coding", pas de switch dynamique |

---

## Analyse : Faut-il re-integrer Auto-Claude ?

### Option A : Le CLI suffit (recommande pour le vibe coding)

Le Claude Code CLI, quand il execute une tache, peut DEJA :
- Spawner des sub-agents via `Task` tool
- Utiliser les 13 agents ECC (planner, code-reviewer, tdd-guide, etc.)
- Invoquer les 29 skills et 31 commands
- Lire les rules et contexts
- Orchestrer des workflows complexes (le CLI gere ca en interne)

**Ce qui manque vraiment** : juste les MCP servers pas wires dans hello-halo.

### Option B : Re-integrer l'orchestration Auto-Claude

Remettre les capacites du backend Python, mais en TypeScript dans hello-halo :
- Parallel sessions (multiple Claude CLI en meme temps)
- Git worktree management
- GitHub/Linear integration
- Kanban task board

**Cout** : Tres lourd, plusieurs semaines de dev.

### Option C : Juste wirer les MCP servers (quick win)

Copier la config MCP de `~/.claude/mcp-configs/` dans `~/.halo-dev/config.json` pour que hello-halo passe les serveurs MCP au SDK. Cela donnerait acces a GitHub, Firecrawl, Supabase, Memory, etc. directement dans les sessions Claude.

---

## Recommandation : Option A + C

**Pourquoi ne PAS re-integrer le backend Python d'Auto-Claude :**
- Claude Code CLI a DEJA le Task tool built-in (sub-agents, parallel exploration)
- Le CLI charge automatiquement les 13 agents, 29 skills, 31 commands depuis `~/.claude/`
- Les ECC commands (/orchestrate, /multi-plan, /tdd) sont invocables via le Skill tool du CLI
- Re-porter le backend Python en TypeScript prendrait des semaines pour des gains marginaux
- Le "vibe coding" ne necessite pas 12 terminals paralleles - un agent intelligent suffit

**Ce qu'on doit faire :**
1. Wirer les MCP servers pour donner au CLI acces a GitHub, Memory, etc.
2. Valider E2E que l'ensemble fonctionne

---

## Plan d'execution

### Etape 1 : Wirer les MCP servers dans hello-halo

**Probleme** : `~/.halo-dev/config.json` a `"mcpServers": {}` vide, donc le SDK ne passe aucun serveur MCP au CLI.

**Fichiers a modifier :**
- `~/.halo-dev/config.json` → lire les MCP servers depuis `~/.claude/mcp-configs/mcp-servers.json` ou les copier dans la config
- `src/main/services/agent/sdk-config.ts:236` → verifier que `mcpServers` est passe correctement au SDK

**Approche :** Plutot que copier manuellement la config, modifier le bootstrap pour auto-detecter les MCP servers depuis `~/.claude/` (meme pattern que `autoDetectClaudeCode()`).

**Nouveau fichier** : `src/main/services/mcp-auto-detect.ts`
- Lire `~/.claude/mcp-configs/mcp-servers.json` au demarrage
- Merger dans la config hello-halo si `mcpServers` est vide
- Appeler depuis `essential.ts` apres `autoDetectClaudeCode()`

### Etape 2 : Valider E2E

1. Lancer ATUM CREA via `ATUM CREA.bat`
2. Envoyer un message simple → verifier streaming OK
3. Envoyer un message complexe → verifier que Claude utilise les ECC tools
4. Verifier les logs pour : `ATUM_CREA_RULES_COUNT=24`, MCP servers detected

### Verification

- `tsc --noEmit` → 0 erreurs
- `electron-vite build` → succes
- App lance sans erreur
- MCP servers detectes dans les logs au demarrage
- Message envoye → reponse streamee correctement
