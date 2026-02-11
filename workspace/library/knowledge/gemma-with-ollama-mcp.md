# Gemma-3 avec ollama-mcp - Guide d'Utilisation

> **NOTE**: Ce guide utilise **ollama-mcp-server existant** (déjà configuré dans ULTRA-CREATE)
> **PAS BESOIN** de gemma-mcp séparé - ollama-mcp fonctionne avec TOUS modèles Ollama.

---

## Pourquoi ollama-mcp suffit ?

| Feature | gemma-mcp | ollama-mcp | Verdict |
|---------|-----------|------------|---------|
| Backend | Ollama | Ollama | ✅ IDENTIQUE |
| Port | 11434 | 11434 | ✅ IDENTIQUE |
| MCP Protocol | Oui | Oui | ✅ IDENTIQUE |
| Gemma-3 Support | Oui | Oui | ✅ IDENTIQUE |
| Tous modèles Ollama | Non | Oui | ✅ ollama-mcp SUPÉRIEUR |
| FastMCP | Oui | Non (optionnel) | Différence mineure |

**Conclusion**: ollama-mcp **est un superset** de gemma-mcp. Utiliser ollama-mcp = **zéro redondance**.

---

## Prérequis

### 1. Vérifier ollama-mcp actif

```bash
# Vérifier que Ollama MCP est configuré dans settings.json
# Devrait afficher config à ligne 629
cat ~/.claude/settings.json | grep -A 5 '"ollama"'
```

**Attendu**:
```json
"ollama": {
  "command": "npx",
  "args": ["-y", "ollama-mcp-server"],
  "env": {
    "OLLAMA_HOST": "http://localhost:11434"
  }
}
```

### 2. Installer Gemma-3 dans Ollama

```bash
# Lister modèles disponibles
ollama list

# Installer Gemma-3-9B Instruct (recommandé)
ollama pull gemma:3-9b-it

# Vérification
ollama list | grep gemma
```

**Modèles Gemma disponibles**:
- `gemma:270m` - Ultra léger (270M paramètres)
- `gemma:1b` - Léger (1B paramètres)
- `gemma:3-9b-it` - **RECOMMANDÉ** (9B paramètres, Instruct-tuned)
- `gemma:27b` - Grand modèle (27B paramètres)

### 3. Test rapide

```bash
# Test Ollama direct
ollama run gemma:3-9b-it "Bonjour, es-tu opérationnel ?"
```

---

## Utilisation avec ollama-mcp

### Option 1: Via Templates ULTRA-CREATE

**Templates existants compatibles Gemma**:
```bash
# RAG avec Gemma + embeddings
/scaffold rag-agentic-gemma mon-rag

# Fine-tuning Gemma 3
/scaffold finetune-gemma mon-finetune

# RAG avec MCP (nouveau - voir section suivante)
/scaffold rag-gemma-mcp mon-rag-mcp
```

### Option 2: Code TypeScript/JavaScript

```typescript
// ollama-mcp-client.ts
import { Ollama } from 'ollama';

// Utilise ollama-mcp via protocole MCP
const client = new Ollama({
  host: 'http://localhost:11434'  // MCP endpoint
});

async function chatWithGemma(message: string) {
  const response = await client.chat({
    model: 'gemma:3-9b-it',  // Spécifier Gemma
    messages: [
      { role: 'user', content: message }
    ],
    stream: false
  });

  return response.message.content;
}

// Utilisation
const answer = await chatWithGemma(
  "Explique la relativité générale en 100 mots"
);
console.log(answer);
```

### Option 3: Python avec Ollama SDK

```python
# gemma_client.py
from ollama import Client

# Client Ollama = accès MCP automatique si configuré
client = Client(host='http://localhost:11434')

def chat_with_gemma(message: str) -> str:
    response = client.chat(
        model='gemma:3-9b-it',
        messages=[
            {'role': 'user', 'content': message}
        ]
    )
    return response['message']['content']

# Utilisation
answer = chat_with_gemma(
    "Quelle est la capitale de la France ?"
)
print(answer)
```

### Option 4: Streaming avec ollama-mcp

```typescript
// streaming-gemma.ts
import { Ollama } from 'ollama';

const client = new Ollama({ host: 'http://localhost:11434' });

async function* streamGemma(message: string) {
  const response = await client.chat({
    model: 'gemma:3-9b-it',
    messages: [{ role: 'user', content: message }],
    stream: true
  });

  for await (const part of response) {
    yield part.message.content;
  }
}

// Utilisation
for await (const chunk of streamGemma("Raconte-moi une histoire")) {
  process.stdout.write(chunk);
}
```

---

## RAG avec Gemma via ollama-mcp

### Architecture Recommandée

```
┌─────────────────────────────────────┐
│   User Query                        │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Embed Query (nomic-embed-text)    │ ← Ollama embeddings
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Vector Search (LanceDB/Chroma)    │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Retrieve Top K Documents          │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Generate Answer (gemma:3-9b-it)   │ ← ollama-mcp
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Streaming Response                │
└─────────────────────────────────────┘
```

### Code Example: RAG Simple

```typescript
// simple-rag-gemma.ts
import { Ollama } from 'ollama';
import { LanceDB } from '@lancedb/lancedb';

const ollama = new Ollama({ host: 'http://localhost:11434' });

class GemmaRAG {
  private db: LanceDB;

  async addDocument(content: string) {
    // Embed avec Ollama
    const embedding = await ollama.embeddings({
      model: 'nomic-embed-text',
      prompt: content
    });

    // Stocker dans vector DB
    await this.db.add({
      content,
      embedding: embedding.embedding
    });
  }

  async query(question: string, topK = 3): Promise<string> {
    // 1. Embed question
    const queryEmbedding = await ollama.embeddings({
      model: 'nomic-embed-text',
      prompt: question
    });

    // 2. Retrieve documents
    const docs = await this.db.search(
      queryEmbedding.embedding,
      topK
    );

    const context = docs.map(d => d.content).join('\n\n');

    // 3. Generate with Gemma via ollama-mcp
    const response = await ollama.chat({
      model: 'gemma:3-9b-it',
      messages: [
        {
          role: 'system',
          content: `Tu es un assistant qui répond en te basant sur le contexte suivant:\n\n${context}`
        },
        {
          role: 'user',
          content: question
        }
      ]
    });

    return response.message.content;
  }
}

// Utilisation
const rag = new GemmaRAG();
await rag.addDocument("Paris est la capitale de la France.");
await rag.addDocument("Lyon est la troisième plus grande ville de France.");

const answer = await rag.query("Quelle est la capitale de la France ?");
console.log(answer); // "Selon le contexte, Paris est la capitale de la France."
```

---

## Function Calling avec Gemma (Expérimental)

**NOTE**: Gemma-3 **n'a PAS** de fonction calling natif comme GPT-4 ou Claude.
Deux approches possibles :

### 1. Prompt Engineering (Recommandé)

```typescript
// gemma-function-calling.ts
import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://localhost:11434' });

interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

const tools: Tool[] = [
  {
    name: 'get_weather',
    description: 'Get current weather for a location',
    parameters: {
      location: { type: 'string', description: 'City name' }
    }
  },
  {
    name: 'search_web',
    description: 'Search the web for information',
    parameters: {
      query: { type: 'string', description: 'Search query' }
    }
  }
];

async function chatWithTools(userMessage: string) {
  const systemPrompt = `Tu es un assistant. Tu as accès aux outils suivants:

${tools.map(t => `- ${t.name}: ${t.description}`).join('\n')}

Pour utiliser un outil, réponds EXACTEMENT dans ce format JSON:
{"tool": "nom_outil", "arguments": {...}}

Exemple:
User: "Quel temps fait-il à Paris ?"
Assistant: {"tool": "get_weather", "arguments": {"location": "Paris"}}`;

  const response = await ollama.chat({
    model: 'gemma:3-9b-it',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ]
  });

  // Parser réponse pour extraire tool call
  try {
    const toolCall = JSON.parse(response.message.content);
    return toolCall;
  } catch {
    // Pas de tool call, réponse directe
    return { response: response.message.content };
  }
}

// Utilisation
const result = await chatWithTools("Quel temps fait-il à Londres ?");
console.log(result);
// {"tool": "get_weather", "arguments": {"location": "Londres"}}
```

### 2. Fine-tuning pour Function Calling

Utiliser le template `finetune-gemma` pour entraîner Gemma-3 sur dataset function calling :

```bash
# Scaffold projet fine-tuning
/scaffold finetune-gemma gemma-fc

# Préparer dataset ShareGPT format avec function calls
# Entraîner avec Unsloth (4-bit LoRA)
# Résultat: gemma:3-9b-fc (fine-tuned)
```

---

## Comparaison: Gemma vs Autres Modèles Ollama

| Modèle | Taille | Vitesse | Qualité | Use Case |
|--------|--------|---------|---------|----------|
| **gemma:3-9b-it** | 9B (5GB) | Moyen | Bonne | RAG, chat, reasoning |
| codellama:7b | 7B (3.8GB) | Rapide | Code | Code generation |
| llama3.2:3b | 3B (2GB) | Très rapide | Moyenne | Chat simple |
| mistral:7b | 7B (4.1GB) | Rapide | Très bonne | RAG, chat |
| deepseek-coder:1.3b | 1.3B (1GB) | Ultra rapide | Code | Code completion |

**Recommandation par use case**:
- **RAG général** → `gemma:3-9b-it` ou `mistral:7b`
- **Code RAG** → `codellama:7b` ou `deepseek-coder:6.7b`
- **Chat léger** → `gemma:1b` ou `llama3.2:3b`
- **Production** → `mistral:7b` (meilleur rapport qualité/vitesse)

---

## Optimisations Performance

### 1. Quantization pour Réduire Taille

```bash
# Gemma 9B standard = ~5GB
ollama pull gemma:3-9b-it

# Gemma 9B quantizé 4-bit = ~2.5GB (via Ollama GGUF)
# Créer modelfile custom
cat > Modelfile <<EOF
FROM gemma:3-9b-it
PARAMETER num_ctx 8192
PARAMETER temperature 0.7
PARAMETER top_p 0.9
EOF

ollama create gemma-optimized -f Modelfile
```

### 2. Context Window Adjustment

```typescript
// Gemma-3 supporte jusqu'à 8K tokens de contexte
const response = await ollama.chat({
  model: 'gemma:3-9b-it',
  messages: [...],
  options: {
    num_ctx: 8192  // Max context window
  }
});
```

### 3. Batch Processing pour RAG

```typescript
// Traiter plusieurs queries en parallèle
const queries = [
  "Question 1 ?",
  "Question 2 ?",
  "Question 3 ?"
];

const results = await Promise.all(
  queries.map(q => rag.query(q))
);
```

---

## Troubleshooting

### Erreur: "Model not found"

```bash
# Vérifier modèle installé
ollama list | grep gemma

# Si absent, installer
ollama pull gemma:3-9b-it
```

### Erreur: "Connection refused localhost:11434"

```bash
# Vérifier Ollama running
ollama serve

# Vérifier port
netstat -an | grep 11434

# Restart Ollama si nécessaire
```

### Réponses lentes avec Gemma-3

**Causes**:
- Modèle 9B plus lourd que codellama 7B
- GPU non utilisé (CPU fallback)

**Solutions**:
```bash
# 1. Vérifier GPU détecté
ollama ps

# 2. Utiliser modèle plus léger
ollama pull gemma:1b

# 3. Réduire context window
# options: { num_ctx: 2048 } au lieu de 8192
```

### Réponses incohérentes

**Ajuster température**:
```typescript
const response = await ollama.chat({
  model: 'gemma:3-9b-it',
  messages: [...],
  options: {
    temperature: 0.3,  // Plus déterministe (0.0-1.0)
    top_p: 0.8,        // Nucleus sampling
    top_k: 40          // Top-k sampling
  }
});
```

---

## Best Practices

```yaml
Model Selection:
  - RAG général: gemma:3-9b-it
  - RAG code: codellama:7b
  - Chat léger: gemma:1b
  - Production: mistral:7b

Embeddings:
  - Anglais: nomic-embed-text
  - Multilingue: multilingual-e5-large
  - Code: codellama:7b (embeddings endpoint)

Context Window:
  - Chat simple: 2048 tokens
  - RAG: 4096-8192 tokens
  - Long documents: Chunking requis

Temperature:
  - Factuel/RAG: 0.1-0.3
  - Créatif: 0.7-0.9
  - Code: 0.0-0.2

Fallback Strategy:
  - Primary: gemma via ollama-mcp
  - Fallback 1: mistral via ollama-mcp
  - Fallback 2: E2B Python (si Ollama down)
```

---

## Exemples Avancés

### Multi-turn Conversation

```typescript
// conversation-gemma.ts
import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://localhost:11434' });

class GemmaConversation {
  private messages: Array<{role: string, content: string}> = [];

  async chat(userMessage: string): Promise<string> {
    this.messages.push({
      role: 'user',
      content: userMessage
    });

    const response = await ollama.chat({
      model: 'gemma:3-9b-it',
      messages: this.messages
    });

    this.messages.push({
      role: 'assistant',
      content: response.message.content
    });

    return response.message.content;
  }

  reset() {
    this.messages = [];
  }
}

// Utilisation
const conv = new GemmaConversation();
console.log(await conv.chat("Bonjour, je m'appelle Alice"));
console.log(await conv.chat("Quel est mon nom ?"));
// "Tu t'appelles Alice."
```

### RAG avec Reranking

```typescript
// rag-rerank-gemma.ts
import { Ollama } from 'ollama';

async function rerankDocuments(
  query: string,
  docs: string[]
): Promise<string[]> {
  // Utiliser Gemma pour reranker documents
  const prompt = `Question: ${query}

Documents:
${docs.map((d, i) => `${i + 1}. ${d}`).join('\n\n')}

Classe ces documents par pertinence (indices séparés par virgules, le plus pertinent en premier):`;

  const response = await ollama.chat({
    model: 'gemma:3-9b-it',
    messages: [{ role: 'user', content: prompt }]
  });

  // Parser "3, 1, 2" → [docs[2], docs[0], docs[1]]
  const ranking = response.message.content
    .split(',')
    .map(i => parseInt(i.trim()) - 1);

  return ranking.map(i => docs[i]);
}

// Utilisation dans RAG
const retrievedDocs = ['doc1', 'doc2', 'doc3'];
const rerankedDocs = await rerankDocuments(query, retrievedDocs);
// Utiliser rerankedDocs[0] comme meilleur contexte
```

---

## Ressources

**Documentation**:
- [Ollama Documentation](https://github.com/ollama/ollama)
- [Gemma on Hugging Face](https://huggingface.co/google/gemma-3-9b-it)
- [Template rag-agentic-gemma](../templates/rag-agentic-gemma/)
- [Template finetune-gemma](../templates/finetune-gemma/)

**ULTRA-CREATE**:
- Agent llm-integration-expert : `agents/ai-ml/llm-integration-expert.md`
- MCP ollama config : `~/.claude/settings.json:629`
- Profil ml-development : `config/mcp-profiles.json`

**Benchmarks Gemma-3**:
- MMLU: 71.3% (9B)
- HumanEval: 58.5% (code)
- GSM8K: 73.2% (math)

---

*Guide Gemma avec ollama-mcp | ULTRA-CREATE v26.1 | Zéro redondance | Infrastructure existante*
