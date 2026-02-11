# Vercel Advanced Patterns v27.0

> **Documentation de référence pour les fonctionnalités Vercel avancées**
> Intégré dans ULTRA-CREATE v27.0 basé sur l'analyse du dépôt vercel/vercel (50+ packages)

---

## Vue d'Ensemble

| Fonctionnalité | Package | Use Case Principal |
|----------------|---------|-------------------|
| Blob Storage | `@vercel/blob` | Fichiers utilisateurs, assets |
| KV Cache | `@vercel/kv` | Sessions, cache, rate limiting |
| Cron Jobs | `vercel.json` | Jobs planifiés |
| Logs Streaming | CLI | Debugging temps réel |
| Deployment Insights | CLI | Diagnostic production |

---

## 1. Vercel Blob Storage

### Installation
```bash
npm install @vercel/blob
```

### Configuration
1. Créer un Blob Store dans le dashboard Vercel
2. Lier au projet: `vercel link`
3. Variables auto-injectées: `BLOB_READ_WRITE_TOKEN`

### API Complète

```typescript
import { put, list, del, head, copy } from '@vercel/blob';

// ===== UPLOAD =====

// Upload simple
const blob = await put('avatars/user-123.png', file, {
  access: 'public',           // ou 'private'
  contentType: 'image/png',
  addRandomSuffix: false,     // Garder le nom exact
});

// Upload avec multipart (> 4MB recommandé)
const largeBlob = await put('videos/demo.mp4', videoBuffer, {
  access: 'public',
  multipart: true,            // Chunked upload
});

// Upload côté client (Server Action)
// app/actions/upload.ts
'use server'
export async function uploadAvatar(formData: FormData) {
  const file = formData.get('file') as File;
  const blob = await put(`avatars/${Date.now()}.png`, file, {
    access: 'public',
  });
  return blob.url;
}

// ===== LISTING =====

// Liste avec pagination
const { blobs, cursor, hasMore } = await list({
  prefix: 'avatars/',        // Filtrer par préfixe
  limit: 100,                // Max par page
  cursor: previousCursor,    // Pour pagination
});

// Tous les blobs (attention: peut être lent)
let allBlobs = [];
let cursor;
do {
  const result = await list({ cursor });
  allBlobs.push(...result.blobs);
  cursor = result.cursor;
} while (cursor);

// ===== OPERATIONS =====

// Supprimer un blob
await del('avatars/old-avatar.png');

// Supprimer plusieurs
await del([
  'uploads/file1.pdf',
  'uploads/file2.pdf',
  'uploads/file3.pdf',
]);

// Copier un blob
await copy('uploads/original.pdf', 'backups/original.pdf');

// Métadonnées sans télécharger
const info = await head('uploads/document.pdf');
// { contentType, contentLength, uploadedAt, pathname, url }
```

### Patterns d'Usage

```typescript
// Pattern: Upload avec validation
async function uploadUserFile(file: File, userId: string) {
  // Validation
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

  if (file.size > MAX_SIZE) {
    throw new Error('File too large');
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  // Upload sécurisé
  const blob = await put(`users/${userId}/${Date.now()}-${file.name}`, file, {
    access: 'public',
    contentType: file.type,
  });

  return blob;
}

// Pattern: Migration S3 → Vercel Blob
async function migrateFromS3(s3Key: string) {
  const s3Response = await s3.getObject({ Bucket: 'old-bucket', Key: s3Key });
  const blob = await put(s3Key, s3Response.Body, {
    access: 'public',
    contentType: s3Response.ContentType,
  });
  return blob.url;
}
```

---

## 2. Vercel KV Cache

### Installation
```bash
npm install @vercel/kv
```

### Configuration
1. Créer un KV Store dans le dashboard
2. Lier au projet
3. Variables auto: `KV_REST_API_URL`, `KV_REST_API_TOKEN`

### API Complète

```typescript
import { kv } from '@vercel/kv';

// ===== STRINGS =====

await kv.set('key', 'value');
await kv.set('json-key', { complex: 'object' });  // Auto JSON
await kv.set('temp-key', 'value', { ex: 3600 });  // Expire 1h
await kv.set('unique', 'value', { nx: true });    // Set if not exists
await kv.set('update', 'value', { xx: true });    // Set if exists

const value = await kv.get('key');
const values = await kv.mget('key1', 'key2', 'key3');
await kv.del('key');

// ===== HASHES (Objets) =====

await kv.hset('user:123', {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin',
  visits: 0,
});

const user = await kv.hgetall('user:123');
const name = await kv.hget('user:123', 'name');
await kv.hincrby('user:123', 'visits', 1);
await kv.hdel('user:123', 'temporary_field');
const exists = await kv.hexists('user:123', 'email');

// ===== LISTS (Queues/Stacks) =====

await kv.lpush('queue:jobs', JSON.stringify(job));      // Push left
await kv.rpush('queue:jobs', JSON.stringify(job));      // Push right
const nextJob = await kv.rpop('queue:jobs');            // Pop right
const length = await kv.llen('queue:jobs');
const items = await kv.lrange('queue:jobs', 0, 9);      // Get range

// ===== SETS (Uniques) =====

await kv.sadd('tags:post:123', 'javascript', 'react', 'nextjs');
await kv.srem('tags:post:123', 'react');
const tags = await kv.smembers('tags:post:123');
const count = await kv.scard('tags:post:123');
const has = await kv.sismember('tags:post:123', 'javascript');

// ===== SORTED SETS (Classements) =====

await kv.zadd('leaderboard', { score: 1500, member: 'player1' });
await kv.zadd('leaderboard',
  { score: 1200, member: 'player2' },
  { score: 1800, member: 'player3' }
);
const top10 = await kv.zrange('leaderboard', 0, 9, { rev: true });
const rank = await kv.zrank('leaderboard', 'player1');
await kv.zincrby('leaderboard', 100, 'player1');  // +100 points

// ===== TTL & EXPIRATION =====

await kv.expire('session:abc', 3600);      // Expire dans 1h
await kv.expireat('session:abc', timestamp); // Expire à date
const ttl = await kv.ttl('session:abc');    // Temps restant
await kv.persist('session:abc');            // Annuler expiration
```

### Patterns d'Usage

```typescript
// Pattern: Rate Limiting
async function rateLimit(
  identifier: string,
  limit: number = 100,
  window: number = 60
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `ratelimit:${identifier}`;
  const current = await kv.incr(key);

  if (current === 1) {
    await kv.expire(key, window);
  }

  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current),
  };
}

// Usage dans middleware
export async function middleware(request: NextRequest) {
  const ip = request.ip ?? 'unknown';
  const { allowed, remaining } = await rateLimit(ip, 100, 60);

  if (!allowed) {
    return new Response('Too Many Requests', {
      status: 429,
      headers: { 'X-RateLimit-Remaining': '0' },
    });
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  return response;
}

// Pattern: Session Cache
async function getSession(sessionId: string) {
  const session = await kv.hgetall(`session:${sessionId}`);
  if (!session) return null;

  // Prolonger la session à chaque accès
  await kv.expire(`session:${sessionId}`, 3600);
  return session;
}

async function setSession(sessionId: string, data: object) {
  await kv.hset(`session:${sessionId}`, data);
  await kv.expire(`session:${sessionId}`, 3600);
}

// Pattern: Cache-Aside
async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  const cached = await kv.get<T>(key);
  if (cached) return cached;

  const fresh = await fetcher();
  await kv.set(key, fresh, { ex: ttl });
  return fresh;
}

// Usage
const user = await getCached(
  `user:${userId}`,
  () => db.users.findUnique({ where: { id: userId } }),
  300 // 5 minutes
);
```

---

## 3. Cron Jobs

### Configuration vercel.json

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-cleanup",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/hourly-sync",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/every-15min",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

### Syntaxe Cron

```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-6) (Sunday=0)
│ │ │ │ │
* * * * *

Exemples:
0 2 * * *     → Tous les jours à 2h00
0 */6 * * *   → Toutes les 6 heures
0 9 * * 1     → Lundi à 9h00
*/15 * * * *  → Toutes les 15 minutes
0 0 1 * *     → 1er du mois à minuit
```

### Implémentation Sécurisée

```typescript
// app/api/cron/cleanup/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // SÉCURITÉ OBLIGATOIRE: Vérifier le secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log('Unauthorized cron attempt');
    return new Response('Unauthorized', { status: 401 });
  }

  const startTime = Date.now();

  try {
    // === LOGIQUE DU CRON ===
    const results = await Promise.all([
      cleanupExpiredSessions(),
      deleteOldLogs(),
      archiveCompletedTasks(),
    ]);

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      results: {
        sessions: results[0],
        logs: results[1],
        tasks: results[2],
      },
    });
  } catch (error) {
    console.error('Cron failed:', error);

    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// Helpers
async function cleanupExpiredSessions() {
  // Cleanup logic
  return { deleted: 42 };
}

async function deleteOldLogs() {
  // Delete logs older than 30 days
  return { deleted: 1337 };
}

async function archiveCompletedTasks() {
  // Archive logic
  return { archived: 15 };
}
```

---

## 4. CLI Avancé

### Logs Streaming

```bash
# Logs en temps réel
vercel logs --follow

# Logs production seulement
vercel logs production --follow

# Logs depuis une durée
vercel logs --since 1h
vercel logs --since 24h

# Logs d'un déploiement spécifique
vercel logs https://my-app-abc123.vercel.app --follow

# Filtrer les erreurs
vercel logs --since 1h | grep -i error
```

### Inspection Déploiement

```bash
# Inspection complète
vercel inspect https://my-app.vercel.app

# Affiche:
# - Build info (durée, taille)
# - Routes configurées
# - Fonctions serverless (taille, régions)
# - Headers et redirects
# - Environment variables (noms seulement)
```

### Historique et Gestion

```bash
# Liste des déploiements
vercel list
vercel list --meta    # Avec métadonnées Git

# Déploiements d'un projet
vercel list my-project --limit 20

# Rollback
vercel rollback [deployment-url]

# Promouvoir preview → production
vercel promote [deployment-url]

# Supprimer un déploiement
vercel remove [deployment-url]
```

### Environnement

```bash
# Exporter les variables
vercel env pull .env.local
vercel env pull .env.production --environment production

# Lister les variables
vercel env ls

# Ajouter une variable
vercel env add MY_VAR

# Importer en bulk
vercel env add < production.env
```

---

## 5. Patterns d'Architecture

### Full-Stack avec Blob + KV

```typescript
// Architecture recommandée pour uploads utilisateurs

// 1. API Route pour upload
// app/api/upload/route.ts
import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const userId = formData.get('userId') as string;

  // Upload vers Blob
  const blob = await put(`uploads/${userId}/${file.name}`, file, {
    access: 'public',
  });

  // Tracker dans KV
  await kv.lpush(`user:${userId}:uploads`, JSON.stringify({
    url: blob.url,
    name: file.name,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  }));

  // Incrémenter stats
  await kv.hincrby(`user:${userId}:stats`, 'totalUploads', 1);
  await kv.hincrby(`user:${userId}:stats`, 'totalBytes', file.size);

  return Response.json({ url: blob.url });
}
```

### Cron + KV pour Aggregations

```typescript
// app/api/cron/aggregate-stats/route.ts
export async function GET(request: Request) {
  // Auth check...

  // Collecter stats des dernières 24h
  const keys = await kv.keys('pageview:*');
  let totalViews = 0;

  for (const key of keys) {
    totalViews += await kv.get<number>(key) ?? 0;
  }

  // Sauvegarder l'agrégat
  const date = new Date().toISOString().split('T')[0];
  await kv.hset(`stats:daily:${date}`, {
    pageViews: totalViews,
    aggregatedAt: new Date().toISOString(),
  });

  // Cleanup des clés individuelles
  if (keys.length > 0) {
    await kv.del(...keys);
  }

  return Response.json({
    aggregated: totalViews,
    keysProcessed: keys.length
  });
}
```

---

## Références

- [Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)
- [Vercel KV Docs](https://vercel.com/docs/storage/vercel-kv)
- [Vercel Cron Docs](https://vercel.com/docs/cron-jobs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Source: vercel/vercel GitHub](https://github.com/vercel/vercel)

---

*ULTRA-CREATE v27.0 | Knowledge File | Dernière mise à jour: Janvier 2026*
