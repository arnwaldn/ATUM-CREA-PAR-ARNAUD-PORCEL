# RAG Chatbot Template

> ULTRA-CREATE Template - Chatbot avec Retrieval-Augmented Generation

## Stack

- **Frontend**: Next.js 15 + React 19 + TailwindCSS 4
- **LLM**: Ollama (local) avec support OpenAI fallback
- **Embeddings**: nomic-embed-text via Ollama
- **Vector DB**: PostgreSQL + pgvector
- **ORM**: Prisma 6

## Prérequis

1. **PostgreSQL** avec extension pgvector:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

2. **Ollama** installé et lancé:
   ```bash
   ollama serve
   ollama pull llama3.2
   ollama pull nomic-embed-text
   ```

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# 3. Initialiser la base de données
npm run db:push

# 4. Lancer le serveur
npm run dev
```

## Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts      # Endpoint chat streaming
│   │   │   └── ingest/route.ts    # Upload et indexation docs
│   │   ├── page.tsx               # Interface chat
│   │   └── layout.tsx
│   ├── components/
│   │   ├── chat-interface.tsx     # Composant chat principal
│   │   ├── message-list.tsx       # Liste des messages
│   │   └── document-upload.tsx    # Upload de documents
│   └── lib/
│       ├── ollama.ts              # Client Ollama
│       ├── embeddings.ts          # Génération embeddings
│       ├── vector-store.ts        # Opérations pgvector
│       └── chunker.ts             # Découpage documents
├── prisma/
│   └── schema.prisma              # Schéma avec vector
└── package.json
```

## Fonctionnalités

- ✅ Chat streaming avec Ollama
- ✅ Upload PDF, DOCX, TXT
- ✅ Chunking intelligent
- ✅ Recherche sémantique pgvector
- ✅ Contexte RAG automatique
- ✅ Interface responsive

## API Endpoints

### POST /api/chat
```json
{
  "messages": [{"role": "user", "content": "Question?"}],
  "useRAG": true
}
```

### POST /api/ingest
```
FormData: file (PDF/DOCX/TXT)
```

## Configuration Ollama

Le template utilise par défaut:
- **LLM**: llama3.2 (7B params, rapide)
- **Embeddings**: nomic-embed-text (768 dimensions)

Pour changer de modèle, modifier `.env`:
```env
OLLAMA_MODEL="mistral"
OLLAMA_EMBEDDING_MODEL="mxbai-embed-large"
```

---

*Template ULTRA-CREATE v22.3*
