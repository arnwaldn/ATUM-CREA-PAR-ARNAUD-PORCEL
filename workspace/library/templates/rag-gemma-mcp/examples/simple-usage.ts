/**
 * simple-usage.ts
 *
 * Exemple simple d'utilisation du RAG Gemma-3
 */

import { createGemmaRAG } from '../src/gemma-rag.js';

async function main() {
  console.log('🤖 RAG Gemma-3 - Simple Usage Example\n');

  // 1. Créer instance RAG
  const rag = await createGemmaRAG({
    model: 'gemma:3-9b-it',
    embeddingModel: 'nomic-embed-text',
    topK: 3
  });

  console.log('✓ RAG initialized\n');

  // 2. Ajouter quelques documents
  console.log('Adding documents...');

  await rag.addDocument(`
    Le RAG (Retrieval-Augmented Generation) est une technique qui combine:
    1. Recherche sémantique dans une base de connaissances vectorielle
    2. Génération de texte par un LLM avec le contexte récupéré

    Cette approche permet au modèle de répondre avec des informations
    factuelles récentes, réduisant les hallucinations.
  `);

  await rag.addDocument(`
    Gemma-3 est la famille de modèles LLM de Google, disponible en plusieurs tailles:
    - 270M, 1B, 4B, 9B, 12B, 27B paramètres
    - Optimisé pour l'efficacité et la qualité
    - Disponible localement via Ollama
  `);

  await rag.addDocument(`
    LanceDB est une base de données vectorielle:
    - Format columnar Apache Arrow
    - Recherche par similarité cosine
    - Stockage sur disque (pas RAM uniquement)
    - Open source et performante
  `);

  const docCount = await rag.getDocumentCount();
  console.log(`✓ ${docCount} documents added\n`);

  // 3. Interroger le système
  console.log('Query 1: "Qu\'est-ce que le RAG?"\n');

  const result1 = await rag.query("Qu'est-ce que le RAG?", {
    temperature: 0.7,
    maxTokens: 200
  });

  console.log('Answer:', result1.answer);
  console.log('\nSources:');
  result1.sources.forEach((source, i) => {
    const similarity = (source.similarity * 100).toFixed(1);
    console.log(`  ${i + 1}. [${similarity}%] ${source.text.slice(0, 80)}...`);
  });

  console.log('\n---\n');

  // 4. Autre question
  console.log('Query 2: "Quelles sont les tailles de Gemma?"\n');

  const result2 = await rag.query("Quelles sont les tailles de Gemma disponibles?");

  console.log('Answer:', result2.answer);
  console.log('\nSources:');
  result2.sources.forEach((source, i) => {
    const similarity = (source.similarity * 100).toFixed(1);
    console.log(`  ${i + 1}. [${similarity}%] ${source.text.slice(0, 80)}...`);
  });

  console.log('\n---\n');

  // 5. Streaming example
  console.log('Query 3 (streaming): "Parle-moi de LanceDB"\n');
  console.log('Answer (streaming):');

  for await (const chunk of rag.queryStream("Explique-moi LanceDB en quelques phrases")) {
    if (chunk.type === 'chunk') {
      process.stdout.write(chunk.content as string);
    }
  }

  console.log('\n\n---\n');

  // 6. Recherche sémantique sans génération
  console.log('Semantic search: "vector database"\n');

  const searchResults = await rag.search('vector database', 2);

  console.log('Results:');
  searchResults.forEach((result, i) => {
    const similarity = (result.similarity * 100).toFixed(1);
    console.log(`  ${i + 1}. [${similarity}%] ${result.text.slice(0, 100)}...`);
  });

  console.log('\n✓ Example completed');
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
