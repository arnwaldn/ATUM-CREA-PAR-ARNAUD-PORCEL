/**
 * ollama-mcp-client.test.ts
 *
 * Tests unitaires pour OllamaMCPClient
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { OllamaMCPClient, createOllamaMCPClient } from '../ollama-mcp-client.js';

describe('OllamaMCPClient', () => {
  let client: OllamaMCPClient;

  beforeAll(async () => {
    client = new OllamaMCPClient({
      host: process.env.OLLAMA_HOST || 'http://localhost:11434',
      model: 'gemma:3-9b-it',
      embeddingModel: 'nomic-embed-text'
    });
  });

  describe('Configuration', () => {
    it('should initialize with default config', () => {
      const defaultClient = new OllamaMCPClient();
      expect(defaultClient.getModel()).toBe('gemma:3-9b-it');
      expect(defaultClient.getEmbeddingModel()).toBe('nomic-embed-text');
    });

    it('should allow model changes', () => {
      const testClient = new OllamaMCPClient();
      testClient.setModel('gemma:3-1b-it');
      expect(testClient.getModel()).toBe('gemma:3-1b-it');
    });

    it('should allow embedding model changes', () => {
      const testClient = new OllamaMCPClient();
      testClient.setEmbeddingModel('multilingual-e5-large');
      expect(testClient.getEmbeddingModel()).toBe('multilingual-e5-large');
    });
  });

  describe('Model Management', () => {
    it('should check if model is available', async () => {
      const available = await client.checkModel();
      expect(typeof available).toBe('boolean');
    });

    it('should check if embedding model is available', async () => {
      const available = await client.checkEmbeddingModel();
      expect(typeof available).toBe('boolean');
    });

    it('should list available models', async () => {
      const models = await client.listModels();
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
    });
  });

  describe('Chat', () => {
    it('should generate a chat response', async () => {
      const response = await client.chat([
        { role: 'user', content: 'Say "test" and nothing else.' }
      ], {
        temperature: 0,
        maxTokens: 10
      });

      expect(response).toBeDefined();
      expect(response.message).toBeDefined();
      expect(typeof response.message.content).toBe('string');
    }, 30000); // 30s timeout for LLM

    it('should support system prompts', async () => {
      const response = await client.chat([
        { role: 'user', content: 'What is your role?' }
      ], {
        system: 'You are a helpful assistant named TestBot.',
        temperature: 0,
        maxTokens: 50
      });

      expect(response.message.content).toBeDefined();
    }, 30000);

    it('should stream chat responses', async () => {
      const chunks: string[] = [];

      for await (const chunk of client.chatStream([
        { role: 'user', content: 'Count to 3 slowly.' }
      ], {
        temperature: 0,
        maxTokens: 20
      })) {
        chunks.push(chunk);
      }

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks.join('')).toBeTruthy();
    }, 30000);
  });

  describe('Generation', () => {
    it('should generate text from prompt', async () => {
      const result = await client.generate('Say "test"', {
        temperature: 0,
        maxTokens: 10
      });

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe('Embeddings', () => {
    it('should create embeddings', async () => {
      const embedding = await client.embed('This is a test sentence.');

      expect(Array.isArray(embedding)).toBe(true);
      expect(embedding.length).toBeGreaterThan(0);
      expect(typeof embedding[0]).toBe('number');
    }, 10000);

    it('should create batch embeddings', async () => {
      const embeddings = await client.embedBatch([
        'First sentence.',
        'Second sentence.',
        'Third sentence.'
      ]);

      expect(Array.isArray(embeddings)).toBe(true);
      expect(embeddings.length).toBe(3);
      expect(embeddings[0].length).toBeGreaterThan(0);
    }, 30000);

    it('should produce consistent embeddings', async () => {
      const text = 'Consistency test.';
      const embed1 = await client.embed(text);
      const embed2 = await client.embed(text);

      // Les embeddings devraient être identiques pour le même texte
      expect(embed1.length).toBe(embed2.length);

      // Vérifier similarité (peut avoir de légères variations selon le modèle)
      const dotProduct = embed1.reduce((sum, val, i) => sum + val * embed2[i], 0);
      const magnitude1 = Math.sqrt(embed1.reduce((sum, val) => sum + val * val, 0));
      const magnitude2 = Math.sqrt(embed2.reduce((sum, val) => sum + val * val, 0));
      const cosineSim = dotProduct / (magnitude1 * magnitude2);

      expect(cosineSim).toBeGreaterThan(0.99); // Très similaire
    }, 20000);
  });

  describe('Factory Function', () => {
    it('should create client with validation', async () => {
      const validatedClient = await createOllamaMCPClient({
        model: 'gemma:3-9b-it',
        embeddingModel: 'nomic-embed-text'
      });

      expect(validatedClient).toBeInstanceOf(OllamaMCPClient);
    }, 10000);

    it('should throw if model not available', async () => {
      await expect(createOllamaMCPClient({
        model: 'nonexistent-model:1234'
      })).rejects.toThrow();
    }, 10000);
  });
});
