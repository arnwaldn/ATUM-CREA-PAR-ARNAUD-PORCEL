# Plan: Audit Complet MCP — Verification exhaustive des 49 serveurs

## Contexte
Apres plusieurs sessions de corrections (packages, schema proxy, credentials, PATH), l'utilisateur demande un audit complet et definitif. Objectif : verifier que TOUS les serveurs MCP fonctionnent et qu'ATUM CREA peut les utiliser.

**Etat actuel** : 49 serveurs, 0 desactives, 14 proxies, 2 HTTP/SSE, 3 placeholders.

---

## Etape 1 — Verifier les prerequis systeme

Confirmer que tous les outils necessaires sont accessibles :
- `node`, `npx`, `uvx`, `semgrep`, `docker` (directs dans PATH)
- `dart`, `blender`, `code` (via scoop — verifier PATH Windows User)
- Unity Hub (GUI — verifier presence)
- Schema proxy (`scripts/mcp-schema-proxy.cjs` — verifier existence)

## Etape 2 — Valider config.json

- JSON valide (parseable)
- 49 serveurs, 0 disabled
- 14 proxied, 2 HTTP, 3 placeholder
- Verifier que chaque proxy pointe vers le bon fichier

## Etape 3 — Test exhaustif des 47 serveurs stdio

Script `test-all-mcp.cjs` : pour chaque serveur stdio :
1. Spawn avec PATH etendu (scoop shims + dart + vscode)
2. Envoie `initialize` + `tools/list` JSON-RPC
3. Verifie : reponse valide + 0 anyOf/oneOf/allOf dans schemas
4. Classe : OK / SCHEMA_FAIL / EXIT_ERR / TIMEOUT / NO_TOOLS

## Etape 4 — Test des 2 serveurs HTTP/SSE

Tavily + Cloudflare-docs : test avec header `Accept: text/event-stream`
Reponse attendue : HTTP 200 + Content-Type `text/event-stream`

## Etape 5 — Rapport final definitif

Tableau 49/49 avec statut, nombre d'outils, notes.
Bilan : nombre total de serveurs OK, nombre total d'outils, serveurs en attente d'action.

## Etape 6 — Mettre a jour MEMORY.md

Avec les chiffres definitifs post-audit.

---

## Verification
- 43+ serveurs OK en stdio (spawn + initialize + tools/list + schema clean)
- 2 serveurs OK en SSE (HTTP 200 + text/event-stream)
- 0 SCHEMA_FAIL
- Total outils > 560
- 3 serveurs placeholder documentes (postgres, browserbase, neo4j)
- 1 serveur cloud down documente (clickhouse)
