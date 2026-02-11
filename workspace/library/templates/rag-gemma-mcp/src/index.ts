/**
 * index.ts
 *
 * CLI interactif pour le système RAG Gemma-3
 */

import { createInterface } from 'readline';
import { createGemmaRAG } from './gemma-rag.js';
import { config } from 'dotenv';

// Charger variables d'environnement
config();

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '\n> '
});

async function main() {
  console.log('🤖 RAG with Gemma-3 via ollama-mcp\n');
  console.log('Initializing...');

  const rag = await createGemmaRAG();
  const config = rag.getConfig();
  const docCount = await rag.getDocumentCount();

  console.log('✓ Ready!');
  console.log(`  Model: ${config.model}`);
  console.log(`  Embeddings: ${config.embeddingModel}`);
  console.log(`  Documents: ${docCount}`);
  console.log(`  Vector DB: ${config.vectorDbPath}\n`);

  console.log('Commands:');
  console.log('  add <url|text>  - Add document to knowledge base');
  console.log('  query <text>    - Query the RAG system');
  console.log('  search <text>   - Search without generation');
  console.log('  count           - Show document count');
  console.log('  clear           - Clear all documents');
  console.log('  config          - Show configuration');
  console.log('  help            - Show this help');
  console.log('  exit            - Exit\n');

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();

    if (!input) {
      rl.prompt();
      return;
    }

    const [command, ...args] = input.split(' ');
    const text = args.join(' ');

    try {
      switch (command.toLowerCase()) {
        case 'add':
          if (!text) {
            console.log('Usage: add <url|text>');
            break;
          }

          if (text.startsWith('http://') || text.startsWith('https://')) {
            console.log(`Adding document from URL: ${text}`);
            await rag.addDocumentFromURL(text);
            console.log('✓ Document added');
          } else {
            console.log('Adding text document...');
            await rag.addDocument(text);
            console.log('✓ Document added');
          }

          const newCount = await rag.getDocumentCount();
          console.log(`Total documents: ${newCount}`);
          break;

        case 'query':
          if (!text) {
            console.log('Usage: query <question>');
            break;
          }

          console.log('Thinking...\n');

          // Utiliser streaming pour une meilleure UX
          let answer = '';
          const sources: any[] = [];

          for await (const chunk of rag.queryStream(text)) {
            if (chunk.type === 'chunk') {
              process.stdout.write(chunk.content as string);
              answer += chunk.content;
            } else if (chunk.type === 'sources') {
              sources.push(...(chunk.content as any[]));
            }
          }

          console.log('\n');

          if (sources.length > 0) {
            console.log('📚 Sources:');
            sources.forEach((source, i) => {
              const preview = source.text.slice(0, 100).replace(/\n/g, ' ');
              const similarity = (source.similarity * 100).toFixed(1);
              console.log(`  ${i + 1}. [${similarity}%] ${preview}...`);
            });
          }
          break;

        case 'search':
          if (!text) {
            console.log('Usage: search <query>');
            break;
          }

          console.log('Searching...\n');
          const results = await rag.search(text, 5);

          if (results.length === 0) {
            console.log('No results found.');
          } else {
            console.log(`Found ${results.length} results:\n`);
            results.forEach((result, i) => {
              const similarity = (result.similarity * 100).toFixed(1);
              const preview = result.text.slice(0, 150).replace(/\n/g, ' ');
              console.log(`${i + 1}. [${similarity}%] ${preview}...\n`);
            });
          }
          break;

        case 'count':
          const count = await rag.getDocumentCount();
          console.log(`Total documents: ${count}`);
          break;

        case 'clear':
          console.log('Are you sure? This will delete all documents. (yes/no)');
          const confirmRl = createInterface({
            input: process.stdin,
            output: process.stdout
          });

          confirmRl.question('', async (answer) => {
            if (answer.toLowerCase() === 'yes') {
              await rag.clear();
              console.log('✓ All documents cleared');
            } else {
              console.log('Cancelled');
            }
            confirmRl.close();
            rl.prompt();
          });
          return; // Don't prompt yet

        case 'config':
          const cfg = rag.getConfig();
          console.log('Configuration:');
          console.log(`  Model: ${cfg.model}`);
          console.log(`  Embeddings: ${cfg.embeddingModel}`);
          console.log(`  Ollama Host: ${cfg.ollamaHost}`);
          console.log(`  Vector DB: ${cfg.vectorDbPath}`);
          console.log(`  Chunk Size: ${cfg.chunkSize}`);
          console.log(`  Chunk Overlap: ${cfg.chunkOverlap}`);
          console.log(`  Top K: ${cfg.topK}`);
          break;

        case 'help':
          console.log('Commands:');
          console.log('  add <url|text>  - Add document');
          console.log('  query <text>    - Query RAG system');
          console.log('  search <text>   - Search only');
          console.log('  count           - Show doc count');
          console.log('  clear           - Clear all docs');
          console.log('  config          - Show config');
          console.log('  exit            - Exit');
          break;

        case 'exit':
        case 'quit':
          console.log('Goodbye!');
          rl.close();
          process.exit(0);

        default:
          console.log(`Unknown command: ${command}. Type 'help' for available commands.`);
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log('\nGoodbye!');
    process.exit(0);
  });
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
