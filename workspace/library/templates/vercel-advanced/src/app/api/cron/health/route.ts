/**
 * Cron Job: Health Check
 * Schedule: */15 * * * * (Every 15 minutes)
 *
 * Vérifie:
 * - Connexion KV
 * - Connexion Blob
 * - Latence services
 */

import { NextRequest } from 'next/server';
import { kv } from '@vercel/kv';
import { list } from '@vercel/blob';
import { withCronAuth, cronSuccess, cronError } from '@/lib/cron';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const maxDuration = 10;

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  error?: string;
}

async function checkKV(): Promise<HealthStatus> {
  const start = Date.now();
  try {
    await kv.ping();
    return {
      status: 'healthy',
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'KV connection failed',
    };
  }
}

async function checkBlob(): Promise<HealthStatus> {
  const start = Date.now();
  try {
    await list({ limit: 1 });
    return {
      status: 'healthy',
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Blob connection failed',
    };
  }
}

async function checkExternalAPI(): Promise<HealthStatus> {
  const start = Date.now();
  const apiUrl = process.env.EXTERNAL_API_URL;

  if (!apiUrl) {
    return {
      status: 'healthy',
      latency: 0,
    };
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });

    return {
      status: response.ok ? 'healthy' : 'degraded',
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'degraded',
      latency: Date.now() - start,
      error: 'External API unreachable',
    };
  }
}

export const GET = withCronAuth(async (request: NextRequest) => {
  const startTime = Date.now();

  try {
    const [kvHealth, blobHealth, apiHealth] = await Promise.all([
      checkKV(),
      checkBlob(),
      checkExternalAPI(),
    ]);

    const overallStatus =
      kvHealth.status === 'unhealthy' || blobHealth.status === 'unhealthy'
        ? 'unhealthy'
        : kvHealth.status === 'degraded' || blobHealth.status === 'degraded' || apiHealth.status === 'degraded'
        ? 'degraded'
        : 'healthy';

    // Log health status to KV for monitoring
    await kv.hset(`health:${Date.now()}`, {
      overall: overallStatus,
      kv: kvHealth.status,
      blob: blobHealth.status,
      api: apiHealth.status,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 100 health checks
    const healthKeys = await kv.keys('health:*');
    if (healthKeys.length > 100) {
      const toDelete = healthKeys.slice(0, healthKeys.length - 100);
      await kv.del(...toDelete);
    }

    return cronSuccess({
      overall: overallStatus,
      services: {
        kv: kvHealth,
        blob: blobHealth,
        externalApi: apiHealth,
      },
    }, startTime);
  } catch (error) {
    return cronError(error as Error, startTime);
  }
});
