/**
 * Vercel Cron Job Utilities
 * @module lib/cron
 *
 * Usage via Claude Code (langage naturel):
 * - "Crée un cron job qui nettoie les sessions expirées"
 * - "Ajoute un job de synchronisation toutes les heures"
 * - "Vérifie la santé de l'app toutes les 15 minutes"
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================
// CRON AUTHENTICATION
// ============================================

/**
 * Vérifie l'authentification d'une requête cron Vercel
 * OBLIGATOIRE pour sécuriser les endpoints cron
 */
export function verifyCronAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

/**
 * Wrapper pour les handlers cron avec auth automatique
 */
export function withCronAuth(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    if (!verifyCronAuth(request)) {
      console.log('[CRON] Unauthorized attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const startTime = Date.now();

    try {
      const response = await handler(request);
      const duration = Date.now() - startTime;

      console.log(`[CRON] Completed in ${duration}ms`);
      return response;
    } catch (error) {
      console.error('[CRON] Error:', error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  };
}

// ============================================
// CRON JOB TYPES
// ============================================

export interface CronResult {
  success: boolean;
  duration: number;
  timestamp: string;
  results?: Record<string, unknown>;
  error?: string;
}

export interface CronJobConfig {
  name: string;
  schedule: string;
  path: string;
  description: string;
  maxDuration?: number;
}

/**
 * Configuration des cron jobs par défaut
 */
export const defaultCronJobs: CronJobConfig[] = [
  {
    name: 'cleanup',
    schedule: '0 2 * * *',
    path: '/api/cron/cleanup',
    description: 'Nettoie les sessions expirées et données obsolètes',
    maxDuration: 60,
  },
  {
    name: 'sync',
    schedule: '0 * * * *',
    path: '/api/cron/sync',
    description: 'Synchronise les données avec les services externes',
    maxDuration: 30,
  },
  {
    name: 'health',
    schedule: '*/15 * * * *',
    path: '/api/cron/health',
    description: 'Vérifie la santé de l\'application',
    maxDuration: 10,
  },
];

// ============================================
// CRON HELPERS
// ============================================

/**
 * Crée une réponse de succès standardisée pour les crons
 */
export function cronSuccess(
  results: Record<string, unknown>,
  startTime: number
): NextResponse {
  return NextResponse.json({
    success: true,
    duration: Date.now() - startTime,
    timestamp: new Date().toISOString(),
    results,
  });
}

/**
 * Crée une réponse d'erreur standardisée pour les crons
 */
export function cronError(
  error: Error | string,
  startTime: number
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : error,
    },
    { status: 500 }
  );
}

/**
 * Parse une expression cron en description lisible
 */
export function describeCronSchedule(schedule: string): string {
  const parts = schedule.split(' ');

  if (parts.length !== 5) {
    return 'Invalid cron expression';
  }

  const [minute, hour, dayMonth, month, dayWeek] = parts;

  // Cas communs
  if (schedule === '* * * * *') return 'Every minute';
  if (schedule === '0 * * * *') return 'Every hour';
  if (schedule === '0 0 * * *') return 'Every day at midnight';
  if (schedule.startsWith('*/')) {
    const interval = schedule.split(' ')[0].replace('*/', '');
    return `Every ${interval} minutes`;
  }

  if (minute !== '*' && hour !== '*' && dayWeek !== '*') {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return `${days[parseInt(dayWeek)]} at ${hour}:${minute.padStart(2, '0')}`;
  }

  if (minute !== '*' && hour !== '*') {
    return `Daily at ${hour}:${minute.padStart(2, '0')}`;
  }

  return schedule;
}
