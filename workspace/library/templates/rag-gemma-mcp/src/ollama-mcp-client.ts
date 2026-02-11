/**
 * ollama-mcp-client.ts
 *
 * Client wrapper pour utiliser Gemma-3 via ollama-mcp-server existant
 * (pas gemma-mcp Python package - réutilise infrastructure ULTRA-CREATE)
 */

import { Ollama } from 'ollama';
import type { Message, ChatResponse, EmbeddingsResponse, GenerateResponse } from 'ollama';

export interface OllamaMCPConfig {
  host?: string;
  model?: string;
  embeddingModel?: string;
  timeout?: number;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  stream?: boolean;
  system?: string;
}

export interface EmbedOptions {
  model?: string;
  truncate?: boolean;
}

/**
 * Client pour interagir avec Gemma-3 via ollama-mcp-server
 *
 * Architecture:
 * OllamaMCPClient → ollama SDK → ollama-mcp-server → Ollama (port 11434)
 *
 * Avantages:
 * - Réutilise MCP déjà configuré dans settings.json
 * - Pas de nouveau serveur MCP
 * - Compatible tous modèles Ollama
 */
export class OllamaMCPClient {
  private client: Ollama;
  private model: string;
  private embeddingModel: string;

  constructor(config: OllamaMCPConfig = {}) {
    const {
      host = process.env.OLLAMA_HOST || 'http://localhost:11434',
      model = process.env.GEMMA_MODEL || 'gemma:3-9b-it',
      embeddingModel = process.env.EMBEDDING_MODEL || 'nomic-embed-text',
      timeout = 120000 // 2 minutes
    } = config;

    this.client = new Ollama({ host });
    this.model = model;
    this.embeddingModel = embeddingModel;
  }

  /**
   * Chat avec Gemma-3
   *
   * @param messages - Historique de conversation
   * @param options - Options de génération
   * @returns Réponse du modèle
   */
  async chat(
    messages: Message[],
    options: ChatOptions = {}
  ): Promise<ChatResponse> {
    const {
      temperature = 0.7,
      maxTokens = 512,
      topP,
      topK,
      stream = false,
      system
    } = options;

    // Injecter system prompt si fourni
    const finalMessages = system
      ? [{ role: 'system' as const, content: system }, ...messages]
      : messages;

    try {
      const response = await this.client.chat({
        model: this.model,
        messages: finalMessages,
        stream,
        options: {
          temperature,
          num_predict: maxTokens,
          top_p: topP,
          top_k: topK
        }
      });

      return response;
    } catch (error) {
      throw new Error(`Ollama chat failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Chat streaming pour réponses en temps réel
   *
   * @param messages - Historique de conversation
   * @param options - Options de génération
   * @yields Chunks de texte au fur et à mesure
   */
  async *chatStream(
    messages: Message[],
    options: ChatOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    const {
      temperature = 0.7,
      maxTokens = 512,
      system
    } = options;

    const finalMessages = system
      ? [{ role: 'system' as const, content: system }, ...messages]
      : messages;

    try {
      const stream = await this.client.chat({
        model: this.model,
        messages: finalMessages,
        stream: true,
        options: {
          temperature,
          num_predict: maxTokens
        }
      });

      for await (const chunk of stream) {
        if (chunk.message?.content) {
          yield chunk.message.content;
        }
      }
    } catch (error) {
      throw new Error(`Ollama streaming failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Génération simple (pas de chat history)
   *
   * @param prompt - Prompt de génération
   * @param options - Options de génération
   * @returns Texte généré
   */
  async generate(
    prompt: string,
    options: ChatOptions = {}
  ): Promise<string> {
    try {
      const response: GenerateResponse = await this.client.generate({
        model: this.model,
        prompt,
        stream: false,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens ?? 512
        }
      });

      return response.response;
    } catch (error) {
      throw new Error(`Ollama generate failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Créer embeddings pour recherche vectorielle
   *
   * @param text - Texte à embedder
   * @param options - Options d'embedding
   * @returns Vecteur d'embeddings
   */
  async embed(
    text: string,
    options: EmbedOptions = {}
  ): Promise<number[]> {
    const { model = this.embeddingModel, truncate = true } = options;

    try {
      const response: EmbeddingsResponse = await this.client.embeddings({
        model,
        prompt: text
      });

      return response.embedding;
    } catch (error) {
      throw new Error(`Ollama embedding failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Créer embeddings pour plusieurs textes (batch)
   *
   * @param texts - Liste de textes
   * @returns Liste de vecteurs
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    const embeddings = await Promise.all(
      texts.map(text => this.embed(text))
    );
    return embeddings;
  }

  /**
   * Vérifier disponibilité du modèle
   *
   * @returns true si modèle disponible
   */
  async checkModel(): Promise<boolean> {
    try {
      const models = await this.client.list();
      return models.models.some(m => m.name === this.model);
    } catch {
      return false;
    }
  }

  /**
   * Vérifier disponibilité du modèle d'embeddings
   *
   * @returns true si modèle disponible
   */
  async checkEmbeddingModel(): Promise<boolean> {
    try {
      const models = await this.client.list();
      return models.models.some(m => m.name === this.embeddingModel);
    } catch {
      return false;
    }
  }

  /**
   * Lister tous les modèles disponibles
   *
   * @returns Liste des modèles Ollama
   */
  async listModels(): Promise<string[]> {
    try {
      const models = await this.client.list();
      return models.models.map(m => m.name);
    } catch (error) {
      throw new Error(`Failed to list models: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Obtenir le nom du modèle actuellement configuré
   */
  getModel(): string {
    return this.model;
  }

  /**
   * Obtenir le nom du modèle d'embeddings
   */
  getEmbeddingModel(): string {
    return this.embeddingModel;
  }

  /**
   * Changer le modèle Gemma utilisé
   *
   * @param model - Nouveau modèle (ex: 'gemma:3-1b-it')
   */
  setModel(model: string): void {
    this.model = model;
  }

  /**
   * Changer le modèle d'embeddings
   *
   * @param model - Nouveau modèle (ex: 'multilingual-e5-large')
   */
  setEmbeddingModel(model: string): void {
    this.embeddingModel = model;
  }
}

/**
 * Factory function pour créer un client avec validation
 *
 * @param config - Configuration du client
 * @returns Client validé et prêt à l'emploi
 */
export async function createOllamaMCPClient(
  config: OllamaMCPConfig = {}
): Promise<OllamaMCPClient> {
  const client = new OllamaMCPClient(config);

  // Vérifier que les modèles sont disponibles
  const modelAvailable = await client.checkModel();
  const embeddingAvailable = await client.checkEmbeddingModel();

  if (!modelAvailable) {
    throw new Error(
      `Model ${client.getModel()} not found. Run: ollama pull ${client.getModel()}`
    );
  }

  if (!embeddingAvailable) {
    throw new Error(
      `Embedding model ${client.getEmbeddingModel()} not found. Run: ollama pull ${client.getEmbeddingModel()}`
    );
  }

  return client;
}
