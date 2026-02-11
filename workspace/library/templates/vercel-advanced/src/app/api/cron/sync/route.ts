/**
 * Cron Job: Sync
 * Schedule: 0 * * * * (Every hour)
 *
 * Synchronise:
 * - Stats aggregation
 * - External service sync
 * - Cache warming
 */

import { NextRequest } from 'next/server';
import { kv } from '@vercel/kv';
import { withCronAuth, cronSuccess, cronError } from '@/lib/cron';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

async function aggregatePageViews(): Promise<{ total: number; aggregated: boolean }> {
  const keys = await kv.keys('pageview:*');
  if (keys.length === 0) {
    return { total: 0, aggregated: false };
  }

  let total = 0;
  for (const key of keys) {
    const count = await kv.get<number>(key);
    total += count ?? 0;
  }

  // Sauvegarder l'agrégat quotidien
  const date = new Date().toISOString().split('T')[0];
  await kv.hincrby(`stats:daily:${date}`, 'pageViews', total);

  // Nettoyer les clés individuelles
  if (keys.length > 0) {
    await kv.del(...keys);
  }

  return { total, aggregated: true };
}

async function warmCache(): Promise<number> {
  // Précharger les données fréquemment accédées
  // Adapter selon les besoins de l'application
  const criticalKeys = [
    'config:global',
    'features:enabled',
  ];

  let warmed = 0;
  for (const key of criticalKeys) {
    const exists = await kv.exists(key);
    if (exists) {
      warmed++;
    }
  }

  return warmed;
}

async function syncExternalServices(): Promise<{ synced: string[] }> {
  // Placeholder pour synchronisation avec services externes
  // Exemple: webhook vers analytics, CRM, etc.
  const synced: string[] = [];

  // Exemple: ping healthcheck endpoint
  if (process.env.HEALTHCHECK_URL) {
    try {
      await fetch(process.env.HEALTHCHECK_URL, { method: 'HEAD' });
      synced.push('healthcheck');
    } catch {
      // Silently fail for healthcheck
    }
  }

  return { synced };
}

export const GET = withCronAuth(async (request: NextRequest) => {
  const startTime = Date.now();

  try {
    const [pageViews, cacheWarmed, external] = await Promise.all([
      aggregatePageViews(),
      warmCache(),
      syncExternalServices(),
    ]);

    return cronSuccess({
      pageViews,
      cacheKeysWarmed: cacheWarmed,
      externalServices: external,
    }, startTime);
  } catch (error) {
    return cronError(error as Error, startTime);
  }
});
