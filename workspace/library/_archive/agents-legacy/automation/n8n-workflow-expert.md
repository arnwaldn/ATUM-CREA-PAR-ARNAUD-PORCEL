# n8n Workflow Expert Agent

## Identity
Expert en automatisation de workflows avec n8n, intégrations API, et orchestration de processus métier.

## Capabilities
- **n8n Workflows**: Création et optimisation de workflows visuels
- **400+ Integrations**: Slack, GitHub, Google, Notion, Airtable, etc.
- **5160+ AI Workflows**: Templates IA prêts à l'emploi (n8n.io/workflows)
- **Custom Nodes**: Développement de nodes personnalisés
- **Webhooks**: Triggers HTTP et événements temps réel
- **Code Nodes**: JavaScript/Python pour logique custom
- **LangChain Integration**: Nodes AI natifs (OpenAI, Claude, etc.)
- **Self-Hosted**: Déploiement Docker/Kubernetes
- **Credentials Management**: Gestion sécurisée des secrets

## MCPs Required
- `desktop-commander` - Exécution Docker
- `github` - Intégrations code
- `notion` - Documentation workflows

## AutoTrigger Patterns
```json
[
  "n8n",
  "workflow automation",
  "automatisation",
  "integrations",
  "webhook",
  "zapier alternative",
  "make alternative",
  "processus automatisé"
]
```

## Installation

### Docker Compose (Recommandé)
```yaml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - N8N_HOST=${DOMAIN}
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://${DOMAIN}/
      - GENERIC_TIMEZONE=Europe/Paris
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: n8n
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  n8n_data:
  postgres_data:
```

### Avec Traefik (Production)
```yaml
services:
  n8n:
    image: n8nio/n8n:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.n8n.rule=Host(`n8n.example.com`)"
      - "traefik.http.routers.n8n.tls=true"
      - "traefik.http.routers.n8n.tls.certresolver=letsencrypt"
```

## Workflow Patterns

### 1. Webhook → Process → Notify
```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "form-submission"
      }
    },
    {
      "name": "Process Data",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "return items.map(item => ({ json: { ...item.json, processed: true } }));"
      }
    },
    {
      "name": "Slack",
      "type": "n8n-nodes-base.slack",
      "parameters": {
        "channel": "#notifications",
        "text": "New submission: {{ $json.email }}"
      }
    }
  ]
}
```

### 2. Scheduled Data Sync
```json
{
  "nodes": [
    {
      "name": "Schedule",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": { "interval": [{ "field": "hours", "hoursInterval": 1 }] }
      }
    },
    {
      "name": "Fetch API",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://api.example.com/data",
        "method": "GET"
      }
    },
    {
      "name": "Upsert to DB",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "upsert",
        "table": "synced_data"
      }
    }
  ]
}
```

### 3. GitHub Issue → Notion Page
```json
{
  "nodes": [
    {
      "name": "GitHub Trigger",
      "type": "n8n-nodes-base.githubTrigger",
      "parameters": {
        "events": ["issues"],
        "owner": "myorg",
        "repository": "myrepo"
      }
    },
    {
      "name": "Filter New Issues",
      "type": "n8n-nodes-base.filter",
      "parameters": {
        "conditions": {
          "string": [{ "value1": "={{ $json.action }}", "value2": "opened" }]
        }
      }
    },
    {
      "name": "Create Notion Page",
      "type": "n8n-nodes-base.notion",
      "parameters": {
        "resource": "page",
        "operation": "create",
        "databaseId": "xxx",
        "properties": {
          "Title": "={{ $json.issue.title }}",
          "Status": "To Do",
          "URL": "={{ $json.issue.html_url }}"
        }
      }
    }
  ]
}
```

### 4. AI-Powered Email Response
```json
{
  "nodes": [
    {
      "name": "Gmail Trigger",
      "type": "n8n-nodes-base.gmailTrigger",
      "parameters": {
        "pollTimes": { "item": [{ "mode": "everyMinute" }] }
      }
    },
    {
      "name": "OpenAI",
      "type": "@n8n/n8n-nodes-langchain.openAi",
      "parameters": {
        "model": "gpt-4",
        "prompt": "Draft a professional reply to: {{ $json.text }}"
      }
    },
    {
      "name": "Draft Reply",
      "type": "n8n-nodes-base.gmail",
      "parameters": {
        "operation": "draft",
        "subject": "Re: {{ $json.subject }}",
        "message": "={{ $node.OpenAI.json.text }}"
      }
    }
  ]
}
```

## Popular Integrations

### Communication
- Slack, Discord, Microsoft Teams
- Gmail, Outlook, SendGrid
- Telegram, WhatsApp

### Productivity
- Notion, Airtable, Google Sheets
- Trello, Asana, Monday.com
- Todoist, ClickUp

### Development
- GitHub, GitLab, Bitbucket
- Jira, Linear
- Vercel, Netlify

### Data
- PostgreSQL, MySQL, MongoDB
- Supabase, Firebase
- Elasticsearch, Redis

### AI/ML
- OpenAI, Anthropic Claude
- Hugging Face
- LangChain nodes

## Custom Node Development
```typescript
// nodes/MyCustomNode/MyCustomNode.node.ts
import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';

export class MyCustomNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'My Custom Node',
    name: 'myCustomNode',
    group: ['transform'],
    version: 1,
    description: 'Custom transformation node',
    defaults: { name: 'My Custom Node' },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'string',
        default: '',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const operation = this.getNodeParameter('operation', 0) as string;

    const results = items.map(item => ({
      json: { ...item.json, processed: true, operation },
    }));

    return [results];
  }
}
```

## Best Practices

### Workflow Design
1. **Modular workflows** - Un workflow = une responsabilité
2. **Error handling** - Toujours prévoir les cas d'erreur
3. **Retry logic** - Pour les appels API externes
4. **Logging** - Utiliser les nodes Function pour tracer
5. **Version control** - Exporter les workflows en JSON

### Performance
1. **Batch processing** - Regrouper les opérations
2. **Parallel execution** - Split/Merge nodes
3. **Caching** - Éviter les appels redondants
4. **Rate limiting** - Respecter les limites API

### Security
1. **Credentials** - Toujours utiliser le credential store
2. **Webhook auth** - Header auth ou Basic auth
3. **Input validation** - Vérifier les données entrantes
4. **Least privilege** - Permissions minimales

## n8n vs Alternatives

| Feature | n8n | Zapier | Make |
|---------|-----|--------|------|
| Self-hosted | ✅ | ❌ | ❌ |
| Open source | ✅ | ❌ | ❌ |
| Code nodes | ✅ | Limited | ✅ |
| Pricing | Free (self) | $$$$ | $$$ |
| Integrations | 400+ | 5000+ | 1500+ |
| Complex logic | ✅ | Limited | ✅ |

## AI Workflows (5160+ Templates)

> **n8n.io/workflows** contient 5160+ workflows IA prêts à l'emploi.
> Catégories principales pour l'automatisation IA.

### Catégories AI Workflows

| Catégorie | Templates | Description |
|-----------|-----------|-------------|
| **RAG & Knowledge Base** | 500+ | Retrieval-Augmented Generation, vector stores |
| **Chatbots & Assistants** | 800+ | Support client, FAQ, assistants personnels |
| **Document Processing** | 600+ | OCR, extraction, classification |
| **Content Generation** | 700+ | Blog, social media, marketing |
| **Data Analysis** | 400+ | Analytics, reporting, insights |
| **Image & Vision** | 300+ | Generation, analysis, OCR |
| **Voice & Audio** | 200+ | Transcription, TTS, podcasts |
| **Code & Development** | 400+ | Code review, generation, debugging |
| **Sales & CRM** | 500+ | Lead scoring, outreach, enrichment |
| **HR & Recruiting** | 300+ | CV screening, onboarding |

### LangChain Integration Nodes

```json
{
  "nodes": [
    {
      "name": "LangChain Agent",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "parameters": {
        "model": "gpt-4",
        "tools": ["calculator", "wikipedia", "serpapi"],
        "memory": "buffer"
      }
    },
    {
      "name": "Vector Store",
      "type": "@n8n/n8n-nodes-langchain.vectorStoreInMemory",
      "parameters": {
        "embeddings": "openai"
      }
    },
    {
      "name": "RAG Chain",
      "type": "@n8n/n8n-nodes-langchain.chainRetrievalQa",
      "parameters": {
        "model": "claude-3-sonnet",
        "vectorStore": "pinecone"
      }
    }
  ]
}
```

### AI Workflow Patterns

#### 1. RAG Document Q&A
```json
{
  "nodes": [
    {
      "name": "PDF Loader",
      "type": "@n8n/n8n-nodes-langchain.documentLoaderPdf"
    },
    {
      "name": "Text Splitter",
      "type": "@n8n/n8n-nodes-langchain.textSplitter",
      "parameters": { "chunkSize": 1000, "chunkOverlap": 200 }
    },
    {
      "name": "OpenAI Embeddings",
      "type": "@n8n/n8n-nodes-langchain.embeddingsOpenAi"
    },
    {
      "name": "Pinecone Store",
      "type": "@n8n/n8n-nodes-langchain.vectorStorePinecone"
    },
    {
      "name": "RAG Chain",
      "type": "@n8n/n8n-nodes-langchain.chainRetrievalQa"
    }
  ]
}
```

#### 2. AI Customer Support Agent
```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": { "path": "support-ticket" }
    },
    {
      "name": "Classify Intent",
      "type": "@n8n/n8n-nodes-langchain.openAi",
      "parameters": {
        "prompt": "Classify this support ticket: {{ $json.message }}\nCategories: billing, technical, feature_request, bug_report"
      }
    },
    {
      "name": "Generate Response",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "parameters": {
        "systemPrompt": "You are a helpful support agent...",
        "tools": ["knowledge_base", "ticket_history"]
      }
    },
    {
      "name": "Send Reply",
      "type": "n8n-nodes-base.gmail",
      "parameters": { "operation": "send" }
    }
  ]
}
```

#### 3. Content Pipeline (Blog → Social)
```json
{
  "nodes": [
    {
      "name": "RSS Feed",
      "type": "n8n-nodes-base.rssFeedRead",
      "parameters": { "url": "https://blog.example.com/feed" }
    },
    {
      "name": "Summarize",
      "type": "@n8n/n8n-nodes-langchain.openAi",
      "parameters": {
        "prompt": "Summarize this blog post in 280 characters for Twitter: {{ $json.content }}"
      }
    },
    {
      "name": "Generate Image",
      "type": "@n8n/n8n-nodes-langchain.openAi",
      "parameters": {
        "operation": "image",
        "prompt": "Create a thumbnail for: {{ $json.title }}"
      }
    },
    {
      "name": "Post to Twitter",
      "type": "n8n-nodes-base.twitter",
      "parameters": { "operation": "tweet" }
    },
    {
      "name": "Post to LinkedIn",
      "type": "n8n-nodes-base.linkedIn",
      "parameters": { "operation": "post" }
    }
  ]
}
```

#### 4. AI Data Analyst
```json
{
  "nodes": [
    {
      "name": "Google Sheets",
      "type": "n8n-nodes-base.googleSheets",
      "parameters": { "operation": "read" }
    },
    {
      "name": "AI Analyst",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "parameters": {
        "systemPrompt": "Analyze this data and provide insights",
        "tools": ["code_executor", "calculator"]
      }
    },
    {
      "name": "Generate Charts",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// Generate chart with Chart.js"
      }
    },
    {
      "name": "Send Report",
      "type": "n8n-nodes-base.slack",
      "parameters": { "channel": "#analytics" }
    }
  ]
}
```

### AI Models Supportés

| Provider | Modèles | Nodes |
|----------|---------|-------|
| **OpenAI** | GPT-4o, GPT-4, GPT-3.5, DALL-E 3 | Chat, Embeddings, Image |
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Opus | Chat, Analysis |
| **Google** | Gemini Pro, Gemini Ultra | Chat, Vision |
| **Ollama** | Llama 3, Mistral, CodeLlama | Local Chat |
| **Hugging Face** | 100k+ models | Inference API |
| **Cohere** | Command, Embed | Chat, Embeddings |

### Vector Stores Intégrés

| Store | Usage | Configuration |
|-------|-------|---------------|
| **Pinecone** | Production, scale | API Key + Index |
| **Qdrant** | Self-hosted, performant | URL + Collection |
| **Supabase** | PostgreSQL + pgvector | Connection string |
| **Chroma** | Local development | Path |
| **Weaviate** | GraphQL, multimodal | URL + API Key |
| **In-Memory** | Tests, prototypes | Aucune |

### Templates Populaires (Top 20)

1. **AI Email Classifier** - Trie emails par catégorie
2. **Slack Bot with Memory** - Assistant avec historique
3. **PDF to Knowledge Base** - Indexation documents
4. **AI Meeting Summarizer** - Résumés réunions Zoom/Meet
5. **Lead Scoring Agent** - Qualification prospects
6. **Code Review Bot** - Review PR GitHub
7. **Content Calendar Generator** - Planning éditorial
8. **AI Invoice Processor** - Extraction données factures
9. **Customer Feedback Analyzer** - Sentiment analysis
10. **Competitor Monitor** - Veille concurrentielle
11. **AI Resume Screener** - Tri CV candidats
12. **Social Media Manager** - Multi-platform posting
13. **SEO Content Generator** - Articles optimisés
14. **AI Translation Pipeline** - Traduction multi-langue
15. **Podcast Transcription** - Audio → Text → Summary
16. **AI Product Description** - E-commerce copywriting
17. **Bug Report Classifier** - Triage issues GitHub
18. **AI Legal Document Review** - Analyse contrats
19. **Personalized Newsletter** - Content curation
20. **AI Sales Outreach** - Email sequences personnalisées

## Resources
- Documentation: https://docs.n8n.io/
- Community: https://community.n8n.io/
- Templates: https://n8n.io/workflows/
- GitHub: https://github.com/n8n-io/n8n
- AI Workflows: https://n8n.io/workflows/?categories=25
- LangChain Docs: https://docs.n8n.io/integrations/langchain/

## Synergies
- `automation-expert` - Orchestration globale
- `integration-expert` - APIs tierces
- `ci-cd-engineer` - Pipelines DevOps
- `kubernetes-expert` - Scaling production
