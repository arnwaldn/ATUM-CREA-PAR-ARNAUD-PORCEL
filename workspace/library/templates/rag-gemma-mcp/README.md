# RAG with Gemma-3 via ollama-mcp

Système RAG (Retrieval-Augmented Generation) utilisant Gemma-3 via **l'infrastructure ollama-mcp existante** (pas gemma-mcp).

> **Architecture**: Réutilise ollama-mcp-server déjà configuré dans ULTRA-CREATE v26.1

## Pourquoi ce template?

**Alternative optimisée** au package `gemma-mcp` Python:
- ✅ **Zéro nouveau serveur MCP** (réutilise ollama-mcp existant)
- ✅ **TypeScript natif** (pas de dépendance Python)
- ✅ **Maintenance simplifiée** (un seul MCP pour tous modèles Ollama)
- ✅ **Compatible templates existants** (rag-agentic-gemma, etc.)

## Stack Technique

```yaml
LLM:
  - Gemma-3-9B-it (via Ollama local)
  - Backend: ollama-mcp-server (déjà configuré)

RAG:
  - Vector DB: LanceDB (fichier local)
  - Embeddings: nomic-embed-text (via Ollama)
  - Chunking: LangChain text splitters

Framework:
  - TypeScript 5.7+
  - Node.js 22+
  - ollama SDK (npm)
```

## Prérequis

### 1. Ollama avec Gemma-3
```bash
# Installer Gemma-3-9B Instruct (recommandé)
ollama pull gemma:3-9b-it

# Installer modèle d'embeddings
ollama pull nomic-embed-text

# Vérifier installation
ollama list
```

### 2. ollama-mcp-server (Déjà Configuré)
Vérifier dans `~/.claude/settings.json`:
```json
"ollama": {
  "command": "npx",
  "args": ["-y", "ollama-mcp-server"],
  "env": {
    "OLLAMA_HOST": "http://localhost:11434"
  }
}
```

### 3. Dépendances NPM
```bash
npm install
```

## Installation

```bash
# Scaffolder le projet
/scaffold rag-gemma-mcp mon-projet

# Installer dépendances
cd mon-projet
npm install

# Configurer
cp .env.example .env
```

## Configuration

### .env
```bash
# Ollama
OLLAMA_HOST=http://localhost:11434
GEMMA_MODEL=gemma:3-9b-it
EMBEDDING_MODEL=nomic-embed-text

# RAG
VECTOR_DB_PATH=./data/lancedb
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
TOP_K=5
```

## Utilisation

### Mode CLI Interactif
```bash
npm run dev

# Ajouter documents
> add https://example.com/article.pdf
> add ./local-docs/guide.md

# Interroger
> query Comment fonctionne le RAG?
```

### Mode Programmatique
```typescript
import { GemmaRAG } from './gemma-rag';

const rag = new GemmaRAG({
  ollamaHost: process.env.OLLAMA_HOST!,
  model: 'gemma:3-9b-it',
  embeddingModel: 'nomic-embed-text'
});

// Ajouter documents
await rag.addDocument('Contenu du document...');
await rag.addDocumentFromURL('https://example.com/article.html');

// Interroger
const response = await rag.query('Explique-moi le RAG');
console.log(response.answer);
console.log(response.sources);
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    RAG Pipeline                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐ │
│  │Documents │ → │ Chunking │ → │Embeddings│ → │LanceDB   │ │
│  │(PDF/URL) │   │(1k chars)│   │(nomic)   │   │(vectors) │ │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘ │
│                                                      ↑      │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐         │      │
│  │  Query   │ → │ Embed    │ → │ Search   │ ────────┘      │
│  │(question)│   │(nomic)   │   │(cosine)  │                │
│  └──────────┘   └──────────┘   └──────────┘                │
│                                      ↓                      │
│  ┌──────────┐   ┌──────────────────────────┐               │
│  │ Response │ ← │ Gemma-3 via ollama-mcp   │               │
│  │(answer)  │   │ (context injection)      │               │
│  └──────────┘   └──────────────────────────┘               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Différences avec rag-agentic-gemma

| Critère | rag-gemma-mcp (ce template) | rag-agentic-gemma (existant) |
|---------|----------------------------|-------------------------------|
| **Backend** | ollama-mcp (TypeScript) | Ollama direct (Python) |
| **Protocole** | MCP standardisé | HTTP REST |
| **Embeddings** | nomic-embed-text | EmbeddingGemma |
| **LLM** | Gemma-3-9B-it | Llama 3.2 |
| **Vector DB** | LanceDB | LanceDB |
| **Framework** | TypeScript custom | Agno + Streamlit |
| **UI** | CLI | Web |

**Quand utiliser ce template:**
- Besoin d'intégration MCP native
- Projet TypeScript/Node.js
- Interface CLI suffisante
- Réutilisation ollama-mcp existant

**Quand utiliser rag-agentic-gemma:**
- Besoin d'interface web Streamlit
- Projet Python
- EmbeddingGemma spécifique requis
- Agent agentique avec tools

## Exemples d'Utilisation

### Ajouter des Documents
```typescript
import { GemmaRAG } from './gemma-rag';

const rag = new GemmaRAG();

// Document texte
await rag.addDocument(`
  Le RAG (Retrieval-Augmented Generation) combine:
  1. Recherche sémantique dans une base vectorielle
  2. Génération de réponse par un LLM avec le contexte
`);

// Document depuis URL
await rag.addDocumentFromURL('https://arxiv.org/abs/2005.11401');

// PDF local
await rag.addDocumentFromFile('./docs/manual.pdf');
```

### Interroger avec Sources
```typescript
const result = await rag.query('Comment fonctionne le RAG?', {
  topK: 5,           // Nombre de chunks à récupérer
  temperature: 0.7,  // Créativité de Gemma
  maxTokens: 512     // Longueur max réponse
});

console.log('Réponse:', result.answer);
console.log('Sources:', result.sources.map(s => s.text.slice(0, 100)));
console.log('Similarités:', result.sources.map(s => s.similarity));
```

### Streaming de Réponse
```typescript
for await (const chunk of rag.queryStream('Explique le RAG')) {
  process.stdout.write(chunk);
}
```

## Performance

### Benchmarks (Gemma-3-9B-it)
| Métrique | Valeur | Notes |
|----------|--------|-------|
| **Latence première réponse** | ~800ms | Sur CPU moderne |
| **Tokens/sec** | ~15-20 | Avec quantization 4-bit |
| **Mémoire VRAM** | ~6GB | 9B model quantized |
| **Embedding latence** | ~50ms | nomic-embed-text |
| **Vector search** | ~10ms | LanceDB sur 10k docs |

### Optimisations
```typescript
// 1. Quantization (déjà activée par Ollama)
// gemma:3-9b-it est en Q4_K_M par défaut

// 2. Context window optimal
const rag = new GemmaRAG({
  chunkSize: 800,      // Plus petit = plus précis
  chunkOverlap: 150,   // Overlap 20% optimal
  topK: 3              // Moins de chunks = plus rapide
});

// 3. Cache embeddings
await rag.cacheEmbeddings('./data/embeddings-cache');

// 4. Batch processing
await rag.addDocumentsBatch([doc1, doc2, doc3]);
```

## Troubleshooting

### Erreur: "Model gemma:3-9b-it not found"
```bash
ollama pull gemma:3-9b-it
ollama list  # Vérifier installation
```

### Erreur: "ollama-mcp not responding"
Vérifier dans `~/.claude/settings.json`:
```json
"ollama": {
  "command": "npx",
  "args": ["-y", "ollama-mcp-server"],
  "env": {"OLLAMA_HOST": "http://localhost:11434"}
}
```

Redémarrer Claude Code pour recharger MCP.

### Réponses lentes (>3s)
```typescript
// Réduire topK
const result = await rag.query(question, { topK: 3 });  // au lieu de 5

// Réduire max tokens
const result = await rag.query(question, { maxTokens: 256 });

// Utiliser modèle plus petit
ollama pull gemma:3-1b-it  // Plus rapide, moins précis
```

### Pas de sources pertinentes trouvées
```typescript
// Augmenter chunk overlap
const rag = new GemmaRAG({
  chunkSize: 1000,
  chunkOverlap: 300  // 30% overlap
});

// Utiliser multilingual embeddings si docs non-anglais
const rag = new GemmaRAG({
  embeddingModel: 'multilingual-e5-large'
});
```

## Comparaison avec gemma-mcp (Package Python)

| Critère | rag-gemma-mcp (ce template) | gemma-mcp (package) |
|---------|----------------------------|---------------------|
| **Nouveau serveur MCP** | ❌ Non (réutilise ollama) | ✅ Oui (gemma_mcp.server) |
| **Langage** | TypeScript | Python |
| **Dépendances** | ollama SDK | gemma-mcp + FastMCP |
| **Maintenance** | Simple (1 MCP) | Double (ollama + gemma-mcp) |
| **FastMCP async** | ❌ Non | ✅ Oui |
| **Compatibilité** | Tous templates existants | Nouveaux templates uniquement |
| **Overhead** | Minimal | Double serveur MCP |

**Pourquoi ce template est préféré:**
1. **Zéro redondance** avec infrastructure existante
2. **Simplicité** d'installation et maintenance
3. **Compatibilité** totale avec ecosystem ULTRA-CREATE
4. **Performance** identique (même backend Ollama)

## Intégration ULTRA-CREATE

### Agent Recommandé
```bash
# llm-integration-expert a déjà l'expertise Ollama
/llm-integration-expert
```

### Triggers Auto
L'agent `llm-integration-expert` s'activera automatiquement sur:
- Intent: "gemma", "gemma-3", "local LLM"
- Patterns: "RAG avec Gemma", "chatbot local"

### Knowledge Files Auto-Chargés
```
knowledge/gemma-with-ollama-mcp.md  # Guide complet
knowledge/stack-2025.md              # Stack recommandée
```

### MCP Profile Optimal
```json
"gemma-development": {
  "primary": {
    "llm": "ollama",           // Utilise ollama-mcp
    "memory": "hindsight",
    "filesystem": "desktop-commander"
  },
  "secondary": ["context7"]
}
```

## Ressources

- **Guide complet**: `knowledge/gemma-with-ollama-mcp.md`
- **Agent expert**: `agents/ai-ml/llm-integration-expert.md`
- **Template alternatif**: `templates/rag-agentic-gemma/` (Python + Streamlit)
- **Ollama docs**: https://ollama.com/library/gemma
- **LanceDB docs**: https://lancedb.github.io/lancedb/

## Scripts NPM

```json
{
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "add": "tsx src/add-document.ts",
    "query": "tsx src/query.ts"
  }
}
```

## License

MIT

---

*Template ULTRA-CREATE v26.1 - Utilise ollama-mcp existant (pas gemma-mcp)*
