#!/usr/bin/env node
/**
 * Hindsight Local Server v1.0
 *
 * Standalone replacement for the Docker-based Hindsight server.
 * Emulates the Hindsight HTTP API on port 8888 using:
 * - SQLite (better-sqlite3) for persistent storage
 * - Ollama (localhost:11434) for embeddings + reflect
 *
 * Compatible with hindsight-mcp-bridge.cjs without any modification.
 *
 * API endpoints:
 *   GET  /health
 *   GET  /v1/default/banks
 *   GET  /v1/default/banks/:bankId/stats
 *   POST /v1/default/banks/:bankId/memories          (retain)
 *   POST /v1/default/banks/:bankId/memories/recall    (recall)
 *   POST /v1/default/banks/:bankId/reflect            (reflect)
 */

const http = require('http');
const path = require('path');
const Database = require('better-sqlite3');

// ── Config ──────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.HINDSIGHT_PORT || '8888', 10);
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const EMBED_MODEL = process.env.EMBED_MODEL || 'nomic-embed-text:latest';
const REFLECT_MODEL = process.env.REFLECT_MODEL || 'gemma3:4b';
const DB_PATH = process.env.HINDSIGHT_DB || path.join(__dirname, '..', 'data', 'hindsight.db');

// ── Database ────────────────────────────────────────────────────────────────
const fs = require('fs');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS banks (
    bank_id   TEXT PRIMARY KEY,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS memories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    bank_id     TEXT NOT NULL,
    content     TEXT NOT NULL,
    metadata    TEXT DEFAULT '{}',
    embedding   TEXT DEFAULT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (bank_id) REFERENCES banks(bank_id)
  );

  CREATE INDEX IF NOT EXISTS idx_memories_bank ON memories(bank_id);
  CREATE INDEX IF NOT EXISTS idx_memories_created ON memories(created_at);
`);

function ensureBank(bankId) {
  const exists = db.prepare('SELECT 1 FROM banks WHERE bank_id = ?').get(bankId);
  if (!exists) {
    db.prepare('INSERT INTO banks (bank_id) VALUES (?)').run(bankId);
  }
}

// ── Ollama helpers ──────────────────────────────────────────────────────────
function ollamaRequest(endpoint, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, OLLAMA_URL);
    const payload = JSON.stringify(body);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
      timeout: 120000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve({ raw: data });
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Ollama timeout')); });
    req.write(payload);
    req.end();
  });
}

async function getEmbedding(text) {
  try {
    const res = await ollamaRequest('/api/embed', {
      model: EMBED_MODEL,
      input: text,
    });
    return res.embeddings?.[0] || null;
  } catch {
    return null;
  }
}

function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);
  return magA && magB ? dot / (magA * magB) : 0;
}

async function ollamaGenerate(prompt) {
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 120000);
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: REFLECT_MODEL, prompt, stream: false }),
      signal: controller.signal,
    });
    clearTimeout(tid);
    const data = await res.json();
    return data.response || '';
  } catch (err) {
    return `Reflection unavailable: ${err.message}`;
  }
}

// ── HTTP Server ─────────────────────────────────────────────────────────────
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, status, data) {
  const payload = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

// Route: GET /health
function handleHealth(req, res) {
  sendJSON(res, 200, {
    status: 'healthy',
    database: 'connected',
    type: 'hindsight-local',
    version: '1.0.0',
    ollama: OLLAMA_URL,
    embed_model: EMBED_MODEL,
    reflect_model: REFLECT_MODEL,
  });
}

// Route: GET /v1/default/banks
function handleListBanks(req, res) {
  const banks = db.prepare('SELECT bank_id, created_at FROM banks ORDER BY created_at').all();
  sendJSON(res, 200, { banks });
}

// Route: GET /v1/default/banks/:bankId/stats
function handleBankStats(req, res, bankId) {
  ensureBank(bankId);
  const count = db.prepare('SELECT COUNT(*) as total FROM memories WHERE bank_id = ?').get(bankId);
  const latest = db.prepare('SELECT created_at FROM memories WHERE bank_id = ? ORDER BY created_at DESC LIMIT 1').get(bankId);
  sendJSON(res, 200, {
    bank_id: bankId,
    total_memories: count.total,
    latest_memory: latest?.created_at || null,
  });
}

// Route: POST /v1/default/banks/:bankId/memories  (retain)
async function handleRetain(req, res, bankId) {
  const body = await parseBody(req);
  ensureBank(bankId);

  const items = body.items || [{ content: body.content, metadata: body.metadata || {} }];
  const insertStmt = db.prepare(
    'INSERT INTO memories (bank_id, content, metadata, embedding) VALUES (?, ?, ?, ?)'
  );

  const ids = [];
  for (const item of items) {
    const content = item.content || '';
    const metadata = JSON.stringify(item.metadata || {});
    const embedding = await getEmbedding(content);
    const embStr = embedding ? JSON.stringify(embedding) : null;
    const info = insertStmt.run(bankId, content, metadata, embStr);
    ids.push(info.lastInsertRowid);
  }

  sendJSON(res, 200, {
    success: true,
    documents: ids.map(String),
    count: ids.length,
  });
}

// Route: POST /v1/default/banks/:bankId/memories/recall
async function handleRecall(req, res, bankId) {
  const body = await parseBody(req);
  ensureBank(bankId);

  const query = body.query || '';
  const maxMemories = body.max_memories || body.top_k || 10;

  // Try semantic search first
  const queryEmbedding = await getEmbedding(query);

  const allMemories = db.prepare(
    'SELECT id, content, metadata, embedding, created_at FROM memories WHERE bank_id = ? ORDER BY created_at DESC LIMIT 500'
  ).all(bankId);

  let scored;
  if (queryEmbedding && allMemories.some((m) => m.embedding)) {
    // Semantic ranking
    scored = allMemories.map((m) => {
      let emb = null;
      try { emb = m.embedding ? JSON.parse(m.embedding) : null; } catch {}
      const semScore = cosineSimilarity(queryEmbedding, emb);

      // Keyword boost
      const queryWords = query.toLowerCase().split(/\s+/);
      const contentLower = m.content.toLowerCase();
      const keywordHits = queryWords.filter((w) => w.length > 2 && contentLower.includes(w)).length;
      const keywordScore = queryWords.length > 0 ? keywordHits / queryWords.length : 0;

      return {
        ...m,
        score: semScore * 0.7 + keywordScore * 0.3,
      };
    });
  } else {
    // Fallback: keyword-only ranking
    const queryWords = query.toLowerCase().split(/\s+/);
    scored = allMemories.map((m) => {
      const contentLower = m.content.toLowerCase();
      const keywordHits = queryWords.filter((w) => w.length > 2 && contentLower.includes(w)).length;
      return {
        ...m,
        score: queryWords.length > 0 ? keywordHits / queryWords.length : 0,
      };
    });
  }

  scored.sort((a, b) => b.score - a.score);
  const topResults = scored.slice(0, maxMemories).filter((m) => m.score > 0);

  const memories = topResults.map((m) => {
    let meta = {};
    try { meta = JSON.parse(m.metadata); } catch {}
    return {
      id: String(m.id),
      text: m.content,
      content: m.content,
      score: Math.round(m.score * 1000) / 1000,
      entities: meta.entities || [],
      occurred_start: m.created_at,
      metadata: meta,
    };
  });

  sendJSON(res, 200, {
    results: memories,
    memories,
    count: memories.length,
  });
}

// Route: POST /v1/default/banks/:bankId/reflect
async function handleReflect(req, res, bankId) {
  const body = await parseBody(req);
  ensureBank(bankId);

  const query = body.query || '';

  // Gather context from memories
  const recentMemories = db.prepare(
    'SELECT content FROM memories WHERE bank_id = ? ORDER BY created_at DESC LIMIT 20'
  ).all(bankId);

  const contextStr = recentMemories.map((m, i) => `[${i + 1}] ${m.content}`).join('\n');

  const prompt = `You are analyzing a memory bank. Based on these stored memories:\n\n${contextStr}\n\nQuestion: ${query}\n\nProvide concise insights and patterns you observe. Focus on actionable takeaways.`;

  const reflection = await ollamaGenerate(prompt);

  sendJSON(res, 200, {
    reflection,
    insights: reflection,
    query,
    bank_id: bankId,
    memories_analyzed: recentMemories.length,
  });
}

// ── Router ──────────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathParts = url.pathname.split('/').filter(Boolean);

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  try {
    // GET /health
    if (req.method === 'GET' && url.pathname === '/health') {
      return handleHealth(req, res);
    }

    // GET /v1/default/banks
    if (req.method === 'GET' && url.pathname === '/v1/default/banks') {
      return handleListBanks(req, res);
    }

    // Routes with bankId: /v1/default/banks/:bankId/...
    if (pathParts[0] === 'v1' && pathParts[1] === 'default' && pathParts[2] === 'banks' && pathParts[3]) {
      const bankId = decodeURIComponent(pathParts[3]);

      // GET /v1/default/banks/:bankId/stats
      if (req.method === 'GET' && pathParts[4] === 'stats') {
        return handleBankStats(req, res, bankId);
      }

      // POST /v1/default/banks/:bankId/memories/recall
      if (req.method === 'POST' && pathParts[4] === 'memories' && pathParts[5] === 'recall') {
        return await handleRecall(req, res, bankId);
      }

      // POST /v1/default/banks/:bankId/memories
      if (req.method === 'POST' && pathParts[4] === 'memories' && !pathParts[5]) {
        return await handleRetain(req, res, bankId);
      }

      // POST /v1/default/banks/:bankId/reflect
      if (req.method === 'POST' && pathParts[4] === 'reflect') {
        return await handleReflect(req, res, bankId);
      }
    }

    // 404
    sendJSON(res, 404, { error: 'Not found', path: url.pathname });
  } catch (err) {
    console.error(`[ERROR] ${req.method} ${url.pathname}:`, err.message);
    sendJSON(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`\n══════════════════════════════════════════════════════════`);
  console.log(`  Hindsight Local Server v1.0`);
  console.log(`  API:      http://localhost:${PORT}`);
  console.log(`  Health:   http://localhost:${PORT}/health`);
  console.log(`  Database: ${DB_PATH}`);
  console.log(`  Ollama:   ${OLLAMA_URL}`);
  console.log(`  Embed:    ${EMBED_MODEL}`);
  console.log(`  Reflect:  ${REFLECT_MODEL}`);
  console.log(`══════════════════════════════════════════════════════════\n`);
});

process.on('SIGINT', () => { db.close(); process.exit(0); });
process.on('SIGTERM', () => { db.close(); process.exit(0); });
