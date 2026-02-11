/**
 * gemma-rag.ts
 *
 * Système RAG (Retrieval-Augmented Generation) utilisant:
 * - Gemma-3 pour la génération (via ollama-mcp)
 * - LanceDB pour la base vectorielle
 * - nomic-embed-text pour les embeddings
 */

import { connect, Table } from 'vectordb';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { OllamaMCPClient, type ChatOptions } from './ollama-mcp-client.js';
import { z } from 'zod';

const DocumentSchema = z.object({
  id: z.string(),
  text: z.string(),
  metadata: z.record(z.unknown()).optional(),
  embedding: z.array(z.number())
});

type Document = z.infer<typeof DocumentSchema>;

export interface RAGConfig {
  ollamaHost?: string;
  model?: string;
  embeddingModel?: string;
  vectorDbPath?: string;
  chunkSize?: number;
  chunkOverlap?: number;
  topK?: number;
}

export interface QueryResult {
  answer: string;
  sources: Array<{
    text: string;
    similarity: number;
    metadata?: Record<string, unknown>;
  }>;
}

export interface AddDocumentOptions {
  metadata?: Record<string, unknown>;
  chunkSize?: number;
  chunkOverlap?: number;
}

/**
 * Système RAG complet avec Gemma-3
 */
export class GemmaRAG {
  private client: OllamaMCPClient;
  private db: Awaited<ReturnType<typeof connect>> | null = null;
  private table: Table | null = null;
  private config: Required<RAGConfig>;
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor(config: RAGConfig = {}) {
    this.config = {
      ollamaHost: config.ollamaHost ?? process.env.OLLAMA_HOST ?? 'http://localhost:11434',
      model: config.model ?? process.env.GEMMA_MODEL ?? 'gemma:3-9b-it',
      embeddingModel: config.embeddingModel ?? process.env.EMBEDDING_MODEL ?? 'nomic-embed-text',
      vectorDbPath: config.vectorDbPath ?? process.env.VECTOR_DB_PATH ?? './data/lancedb',
      chunkSize: config.chunkSize ?? parseInt(process.env.CHUNK_SIZE ?? '1000'),
      chunkOverlap: config.chunkOverlap ?? parseInt(process.env.CHUNK_OVERLAP ?? '200'),
      topK: config.topK ?? parseInt(process.env.TOP_K ?? '5')
    };

    this.client = new OllamaMCPClient({
      host: this.config.ollamaHost,
      model: this.config.model,
      embeddingModel: this.config.embeddingModel
    });

    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: this.config.chunkSize,
      chunkOverlap: this.config.chunkOverlap
    });
  }

  /**
   * Initialiser la base vectorielle
   */
  async initialize(): Promise<void> {
    this.db = await connect(this.config.vectorDbPath);

    try {
      this.table = await this.db.openTable('documents');
    } catch {
      // Table n'existe pas, la créer
      const schema = {
        id: 'string',
        text: 'string',
        metadata: 'json',
        embedding: `float[${768}]` // nomic-embed-text = 768 dimensions
      };
      this.table = await this.db.createTable('documents', []);
    }
  }

  /**
   * Ajouter un document au système RAG
   *
   * @param text - Contenu textuel du document
   * @param options - Options d'ajout
   */
  async addDocument(
    text: string,
    options: AddDocumentOptions = {}
  ): Promise<void> {
    if (!this.table) {
      await this.initialize();
    }

    const { metadata = {}, chunkSize, chunkOverlap } = options;

    // Override chunking si spécifié
    const splitter = chunkSize
      ? new RecursiveCharacterTextSplitter({
          chunkSize,
          chunkOverlap: chunkOverlap ?? this.config.chunkOverlap
        })
      : this.textSplitter;

    // Découper le texte en chunks
    const chunks = await splitter.splitText(text);

    // Créer embeddings pour chaque chunk
    const embeddings = await this.client.embedBatch(chunks);

    // Créer documents avec embeddings
    const documents: Document[] = chunks.map((chunk, i) => ({
      id: `${Date.now()}-${i}`,
      text: chunk,
      metadata,
      embedding: embeddings[i]
    }));

    // Ajouter à la base
    await this.table!.add(documents);
  }

  /**
   * Ajouter plusieurs documents en batch
   *
   * @param texts - Liste de textes
   * @param options - Options d'ajout
   */
  async addDocumentsBatch(
    texts: string[],
    options: AddDocumentOptions = {}
  ): Promise<void> {
    for (const text of texts) {
      await this.addDocument(text, options);
    }
  }

  /**
   * Interroger le système RAG
   *
   * @param question - Question de l'utilisateur
   * @param chatOptions - Options de génération Gemma
   * @returns Réponse avec sources
   */
  async query(
    question: string,
    chatOptions: ChatOptions = {}
  ): Promise<QueryResult> {
    if (!this.table) {
      await this.initialize();
    }

    // 1. Embedder la question
    const queryEmbedding = await this.client.embed(question);

    // 2. Recherche vectorielle
    const topK = chatOptions.maxTokens ? Math.min(this.config.topK, 3) : this.config.topK;
    const results = await this.table!
      .search(queryEmbedding)
      .limit(topK)
      .execute();

    if (results.length === 0) {
      return {
        answer: "Je n'ai pas trouvé d'informations pertinentes pour répondre à cette question.",
        sources: []
      };
    }

    // 3. Construire le contexte
    const context = results
      .map((doc: any) => doc.text)
      .join('\n\n---\n\n');

    // 4. Générer la réponse avec Gemma
    const systemPrompt = `Tu es un assistant qui répond aux questions en te basant UNIQUEMENT sur le contexte fourni ci-dessous.

Si le contexte ne contient pas la réponse, dis "Je ne trouve pas cette information dans les documents fournis."

Contexte:
${context}`;

    const response = await this.client.chat(
      [{ role: 'user', content: question }],
      {
        ...chatOptions,
        system: systemPrompt
      }
    );

    // 5. Extraire sources avec similarités
    const sources = results.map((doc: any) => ({
      text: doc.text,
      similarity: doc._distance ? 1 - doc._distance : 0,
      metadata: doc.metadata
    }));

    return {
      answer: response.message.content,
      sources
    };
  }

  /**
   * Interroger avec streaming de la réponse
   *
   * @param question - Question de l'utilisateur
   * @param chatOptions - Options de génération
   * @yields Chunks de texte + sources à la fin
   */
  async *queryStream(
    question: string,
    chatOptions: ChatOptions = {}
  ): AsyncGenerator<{ type: 'chunk' | 'sources'; content: string | QueryResult['sources'] }, void, unknown> {
    if (!this.table) {
      await this.initialize();
    }

    // 1. Recherche vectorielle
    const queryEmbedding = await this.client.embed(question);
    const results = await this.table!
      .search(queryEmbedding)
      .limit(this.config.topK)
      .execute();

    if (results.length === 0) {
      yield {
        type: 'chunk',
        content: "Je n'ai pas trouvé d'informations pertinentes."
      };
      yield {
        type: 'sources',
        content: []
      };
      return;
    }

    // 2. Construire contexte
    const context = results.map((doc: any) => doc.text).join('\n\n---\n\n');
    const systemPrompt = `Tu réponds en te basant sur ce contexte:\n\n${context}`;

    // 3. Stream la réponse
    for await (const chunk of this.client.chatStream(
      [{ role: 'user', content: question }],
      { ...chatOptions, system: systemPrompt }
    )) {
      yield { type: 'chunk', content: chunk };
    }

    // 4. Retourner sources à la fin
    const sources = results.map((doc: any) => ({
      text: doc.text,
      similarity: doc._distance ? 1 - doc._distance : 0,
      metadata: doc.metadata
    }));

    yield { type: 'sources', content: sources };
  }

  /**
   * Ajouter un document depuis une URL
   *
   * @param url - URL du document (sera fetch et parse)
   * @param options - Options d'ajout
   */
  async addDocumentFromURL(
    url: string,
    options: AddDocumentOptions = {}
  ): Promise<void> {
    // Note: Pour production, utiliser un scraper comme Firecrawl
    // Ici, simple fetch pour démonstration
    const response = await fetch(url);
    const html = await response.text();

    // Extraction basique du texte (améliorer avec cheerio/jsdom en prod)
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    await this.addDocument(text, {
      ...options,
      metadata: { ...options.metadata, source: url }
    });
  }

  /**
   * Recherche sémantique sans génération
   *
   * @param query - Requête de recherche
   * @param limit - Nombre de résultats
   * @returns Documents pertinents
   */
  async search(
    query: string,
    limit: number = this.config.topK
  ): Promise<Array<{ text: string; similarity: number; metadata?: Record<string, unknown> }>> {
    if (!this.table) {
      await this.initialize();
    }

    const queryEmbedding = await this.client.embed(query);
    const results = await this.table!
      .search(queryEmbedding)
      .limit(limit)
      .execute();

    return results.map((doc: any) => ({
      text: doc.text,
      similarity: doc._distance ? 1 - doc._distance : 0,
      metadata: doc.metadata
    }));
  }

  /**
   * Obtenir le nombre total de documents
   */
  async getDocumentCount(): Promise<number> {
    if (!this.table) {
      await this.initialize();
    }
    const count = await this.table!.countRows();
    return count;
  }

  /**
   * Vider la base vectorielle
   */
  async clear(): Promise<void> {
    if (!this.table) {
      await this.initialize();
    }
    await this.db!.dropTable('documents');
    this.table = null;
    await this.initialize();
  }

  /**
   * Obtenir la configuration actuelle
   */
  getConfig(): Required<RAGConfig> {
    return { ...this.config };
  }
}

/**
 * Factory function avec validation
 */
export async function createGemmaRAG(config: RAGConfig = {}): Promise<GemmaRAG> {
  const rag = new GemmaRAG(config);
  await rag.initialize();
  return rag;
}
