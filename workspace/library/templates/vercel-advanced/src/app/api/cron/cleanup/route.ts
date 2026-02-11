/**
 * Cron Job: Cleanup
 * Schedule: 0 2 * * * (Daily at 2:00 AM UTC)
 *
 * Nettoie:
 * - Sessions expirées
 * - Rate limit keys
 * - Fichiers temporaires
 */

import { NextRequest } from 'next/server';
import { kv } from '@vercel/kv';
import { list, del } from '@vercel/blob';
import { withCronAuth, cronSuccess, cronError } from '@/lib/cron';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function cleanupSessions(): Promise<number> {
  // Les sessions avec TTL expirent automatiquement
  // Ici on nettoie les sessions orphelines potentielles
  const keys = await kv.keys('session:*');
  let cleaned = 0;

  for (const key of keys) {
    const ttl = await kv.ttl(key);
    if (ttl === -1) {
      // Pas de TTL, session orpheline
      await kv.del(key);
      cleaned++;
    }
  }

  return cleaned;
}

async function cleanupRateLimits(): Promise<number> {
  const keys = await kv.keys('ratelimit:*');
  let cleaned = 0;

  for (const key of keys) {
    const ttl = await kv.ttl(key);
    if (ttl === -1 || ttl === -2) {
      await kv.del(key);
      cleaned++;
    }
  }

  return cleaned;
}

async function cleanupTempFiles(): Promise<number> {
  const { blobs } = await list({ prefix: 'temp/' });
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  let cleaned = 0;

  const toDelete: string[] = [];
  for (const blob of blobs) {
    if (new Date(blob.uploadedAt).getTime() < oneDayAgo) {
      toDelete.push(blob.url);
      cleaned++;
    }
  }

  if (toDelete.length > 0) {
    await del(toDelete);
  }

  return cleaned;
}

export const GET = withCronAuth(async (request: NextRequest) => {
  const startTime = Date.now();

  try {
    const [sessions, rateLimits, tempFiles] = await Promise.all([
      cleanupSessions(),
      cleanupRateLimits(),
      cleanupTempFiles(),
    ]);

    return cronSuccess({
      sessionsCleared: sessions,
      rateLimitsCleared: rateLimits,
      tempFilesDeleted: tempFiles,
    }, startTime);
  } catch (error) {
    return cronError(error as Error, startTime);
  }
});
