# Docker MCP Registry - Reference pour ATUM CREA

> **Version**: v1.0
> **Source**: https://github.com/docker/mcp-registry
> **Catalogue**: 451+ serveurs MCP verifies et securises
> **Usage**: Decouvrir, proposer et ajouter des MCPs pertinents pour chaque projet

---

## Qu'est-ce que le Docker MCP Registry ?

Le Docker MCP Registry est le catalogue officiel Docker de serveurs MCP (Model Context Protocol).
Chaque serveur est :
- Verifie pour la securite (isolation conteneur Docker)
- Documente avec un `server.yaml` standardise
- Disponible via Docker Hub (`mcp/` namespace) ou en mode remote (HTTP)

---

## Quand Consulter ce Registry

| Situation | Action |
|-----------|--------|
| Nouveau projet necessite un service externe | Chercher un MCP adapte |
| Utilisateur demande une integration specifique | Proposer le MCP du registry |
| Besoin d'une capacite manquante | Verifier si un MCP existe |
| Projet avec base de donnees specifique | MongoDB, Redis, Elasticsearch, Neon, etc. |
| Projet multimedia | ElevenLabs, FFmpeg, Replicate |
| Projet avec workflow automation | n8n, Slack, Linear |
| Projet infra/DevOps | Terraform, Kubernetes, Grafana |

---

## Comment Ajouter un MCP

### Methode 1 : Via npx (recommande pour Halo)

```json
{
  "nom-du-mcp": {
    "command": "npx",
    "args": ["-y", "@scope/package-name"],
    "env": {
      "API_KEY": "valeur"
    }
  }
}
```

Utiliser `config_add_mcp_server` ou editer directement `C:\Users\arnau\.halo-dev\config.json`.

### Methode 2 : Via Docker MCP Gateway

```json
{
  "docker-mcp": {
    "command": "docker",
    "args": ["mcp", "gateway", "run"]
  }
}
```

Les serveurs du registry Docker sont accessibles via le gateway `docker-mcp` deja actif dans ATUM CREA.

### Methode 3 : Via HTTP Remote

```json
{
  "nom-du-mcp": {
    "type": "http",
    "url": "https://mcp.service.com/mcp"
  }
}
```

---

## Schema server.yaml (Docker Registry)

### Serveur Local (conteneurise)

```yaml
name: exemple-server
image: mcp/exemple-server
type: server
meta:
  category: databases        # productivity, databases, devtools, multimedia, etc.
  tags: [tag1, tag2]
about:
  title: Nom Affiche
  description: Description courte
  icon: https://url-icone.com/icon.png
source:
  project: https://github.com/org/repo
  commit: sha_du_commit
run:
  env:
    VARIABLE: '$SECRET_NAME'
config:
  secrets:
    - name: service.api_key
      env: VARIABLE
      example: sk-****
```

### Serveur Remote (heberge)

```yaml
name: exemple-remote
type: remote
dynamic:
  tools: true
meta:
  category: productivity
  tags: [remote, service]
about:
  title: Nom Affiche
  description: Description
  icon: https://url-icone.com/icon.png
remote:
  transport_type: streamable-http
  url: https://mcp.service.com/mcp
oauth:
  - provider: service-name
    secret: service.personal_access_token
    env: SERVICE_TOKEN
```

---

## Catalogue des MCPs les Plus Pertinents pour Vibe Coding

### Bases de Donnees

| MCP | Package NPX | Cle Requise | Status ATUM CREA |
|-----|-------------|-------------|-----------------|
| MongoDB | `mongodb-mcp-server` | `MDB_MCP_CONNECTION_STRING` | A ajouter |
| Redis | Docker Registry | `REDIS_HOST` + config | Disponible Docker |
| Elasticsearch | Docker Registry | `ES_API_KEY` + `ES_URL` | Disponible Docker |
| Neon (Serverless PG) | Docker Registry | `NEON_API_KEY` | Disponible Docker |
| ClickHouse | `clickhouse-mcp` | Config existante | Deja configure (disabled) |
| SQLite | `mcp-server-sqlite` | Aucune | Deja configure (disabled) |
| Neo4j | `@johnymontana/neo4j-mcp` | `NEO4J_URI` + `NEO4J_PASSWORD` | Deja configure (disabled) |
| PostgreSQL | `@modelcontextprotocol/server-postgres` | `DATABASE_URL` | Deja configure (disabled) |

### Multimedia & Generation

| MCP | Package | Cle Requise | Status ATUM CREA |
|-----|---------|-------------|-----------------|
| ElevenLabs | `elevenlabs-mcp` (uvx) | `ELEVENLABS_API_KEY` | A ajouter |
| FFmpeg | `ffmpeg-mcp` (npx) | Aucune (ffmpeg systeme) | A ajouter |
| Replicate | `mcp-replicate` | `REPLICATE_API_TOKEN` | Deja configure (disabled) |
| Blender | `blender-mcp` (uvx) | Aucune | Deja configure (disabled) |

### Workflow & Communication

| MCP | Package | Cle Requise | Status ATUM CREA |
|-----|---------|-------------|-----------------|
| n8n | `n8n-mcp` (npx) | Aucune (doc locale) | A ajouter |
| Slack | `@modelcontextprotocol/server-slack` | `SLACK_BOT_TOKEN` + `SLACK_TEAM_ID` | A ajouter |
| Notion | `@notionhq/notion-mcp-server` | Token existant | Deja actif |
| Resend | `resend-mcp` | Token existant | Deja actif |

### DevOps & Infra

| MCP | Package | Cle Requise | Status ATUM CREA |
|-----|---------|-------------|-----------------|
| Terraform | Docker Registry | Aucune | Disponible Docker |
| Kubernetes | Docker Registry | `.kube/config` | Disponible Docker |
| Grafana | Docker Registry | `GRAFANA_API_KEY` + `GRAFANA_URL` | Disponible Docker |
| Sentry | `@sentry/mcp-server` | Token existant | Deja configure (disabled) |
| Railway | `@railway/mcp-server` | Token existant | Deja configure (disabled) |
| Cloudflare | `@cloudflare/mcp-server-cloudflare` | Token existant | Deja configure (disabled) |

---

## Workflow de Proposition MCP a l'Utilisateur

Quand ATUM CREA detecte qu'un projet beneficierait d'un MCP :

```
1. DETECTER le besoin (ex: projet utilise MongoDB)
2. VERIFIER si le MCP est deja configure (config.json)
3. SI non configure → PROPOSER a l'utilisateur :
   "Ce projet utilise MongoDB. Je peux ajouter le MCP MongoDB
    pour interagir directement avec ta base de donnees.
    Il faudra une connection string MongoDB. Souhaites-tu l'ajouter ?"
4. SI oui → AJOUTER via config_add_mcp_server
5. GUIDER pour la cle API si necessaire
6. TESTER le MCP
7. INFORMER que le MCP sera actif a la prochaine session
```

---

## Contribution au Registry

Pour ajouter un nouveau serveur au Docker MCP Registry :

1. Fork `docker/mcp-registry`
2. Utiliser `task wizard` (local) ou `task remote-wizard` (remote)
3. Creer les fichiers : `servers/{name}/server.yaml`, `tools.json`, `readme.md`
4. Valider : `task validate -- --name SERVER_NAME`
5. Build : `task build -- --tools SERVER_NAME`
6. PR avec le template fourni

Prerequis : licence open source (MIT, Apache-2.0, BSD), compliance MCP, documentation.

---

## Mapping Projet → MCPs Recommandes

| Type de Projet | MCPs a Proposer |
|----------------|----------------|
| SaaS | Stripe, Supabase, Resend, Clerk |
| E-commerce | Stripe, MongoDB/Supabase, Resend |
| Dashboard Analytics | ClickHouse, Grafana, Supabase |
| API Backend | MongoDB/PostgreSQL, Redis, Sentry |
| Mobile (Expo) | Expo, Supabase, Firebase |
| Multimedia | ElevenLabs, FFmpeg, Replicate, Blender |
| AI Agent | Replicate, OpenAI, Ollama, E2B |
| Workflow/Automation | n8n, Slack, Notion, Make |
| Game Development | Unity, Blender, Phaser (code only) |
| DevOps | Terraform, Kubernetes, Grafana, Sentry |
| Communication | Slack, Resend, Notion |
| Documentation | Notion, Docling |
| Trading | ClickHouse, Supabase, custom |
