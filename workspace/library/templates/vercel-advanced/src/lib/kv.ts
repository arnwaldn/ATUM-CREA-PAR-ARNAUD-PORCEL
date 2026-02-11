/**
 * Vercel KV Cache Utilities
 * @module lib/kv
 *
 * Usage via Claude Code (langage naturel):
 * - "Active le rate limiting pour l'API"
 * - "Cache les données utilisateur pendant 5 minutes"
 * - "Crée un leaderboard pour le jeu"
 */

import { kv } from '@vercel/kv';

// ============================================
// RATE LIMITING
// ============================================

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

/**
 * Rate limiting par IP ou identifiant
 *
 * @example
 * // Dans un middleware ou API route
 * const result = await rateLimit(request.ip, 100, 60);
 * if (!result.allowed) {
 *   return new Response('Too Many Requests', { status: 429 });
 * }
 */
export async function rateLimit(
  identifier: string,
  limit: number = 100,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`;
  const current = await kv.incr(key);

  if (current === 1) {
    await kv.expire(key, windowSeconds);
  }

  const ttl = await kv.ttl(key);

  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current),
    resetIn: ttl > 0 ? ttl : windowSeconds,
  };
}

/**
 * Rate limiting par tiers (API key based)
 */
export async function rateLimitByTier(
  apiKey: string,
  tier: 'free' | 'pro' | 'enterprise' = 'free'
): Promise<RateLimitResult> {
  const limits = {
    free: { requests: 100, window: 3600 },      // 100/hour
    pro: { requests: 1000, window: 3600 },      // 1000/hour
    enterprise: { requests: 10000, window: 3600 }, // 10000/hour
  };

  const { requests, window } = limits[tier];
  return rateLimit(`api:${apiKey}`, requests, window);
}

// ============================================
// CACHING
// ============================================

/**
 * Cache-aside pattern avec fallback
 *
 * @example
 * const user = await getCached(
 *   `user:${userId}`,
 *   () => db.users.findUnique({ where: { id: userId } }),
 *   300 // 5 minutes
 * );
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const cached = await kv.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  const fresh = await fetcher();
  await kv.set(key, fresh, { ex: ttlSeconds });
  return fresh;
}

/**
 * Invalide un cache
 */
export async function invalidateCache(pattern: string): Promise<void> {
  const keys = await kv.keys(pattern);
  if (keys.length > 0) {
    await kv.del(...keys);
  }
}

/**
 * Cache with stale-while-revalidate pattern
 */
export async function getCachedSWR<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300,
  staleSeconds: number = 60
): Promise<{ data: T; stale: boolean }> {
  const cached = await kv.get<{ data: T; timestamp: number }>(key);

  if (cached) {
    const age = (Date.now() - cached.timestamp) / 1000;

    if (age < ttlSeconds) {
      return { data: cached.data, stale: false };
    }

    if (age < ttlSeconds + staleSeconds) {
      // Revalidate in background
      fetcher().then(fresh => {
        kv.set(key, { data: fresh, timestamp: Date.now() }, { ex: ttlSeconds + staleSeconds });
      });
      return { data: cached.data, stale: true };
    }
  }

  const fresh = await fetcher();
  await kv.set(key, { data: fresh, timestamp: Date.now() }, { ex: ttlSeconds + staleSeconds });
  return { data: fresh, stale: false };
}

// ============================================
// SESSIONS
// ============================================

export interface Session {
  userId: string;
  email: string;
  role: string;
  createdAt: string;
  [key: string]: unknown;
}

/**
 * Gestion de session avec KV
 */
export async function getSession(sessionId: string): Promise<Session | null> {
  const session = await kv.hgetall<Session>(`session:${sessionId}`);
  if (!session) return null;

  // Prolonger la session à chaque accès
  await kv.expire(`session:${sessionId}`, 3600); // 1 hour
  return session;
}

export async function setSession(sessionId: string, data: Session): Promise<void> {
  await kv.hset(`session:${sessionId}`, data);
  await kv.expire(`session:${sessionId}`, 3600);
}

export async function deleteSession(sessionId: string): Promise<void> {
  await kv.del(`session:${sessionId}`);
}

// ============================================
// LEADERBOARD
// ============================================

export interface LeaderboardEntry {
  member: string;
  score: number;
  rank: number;
}

/**
 * Leaderboard avec sorted sets
 */
export async function updateScore(
  leaderboard: string,
  member: string,
  score: number
): Promise<void> {
  await kv.zadd(leaderboard, { score, member });
}

export async function incrementScore(
  leaderboard: string,
  member: string,
  increment: number
): Promise<number> {
  return kv.zincrby(leaderboard, increment, member);
}

export async function getTopScores(
  leaderboard: string,
  count: number = 10
): Promise<LeaderboardEntry[]> {
  const results = await kv.zrange(leaderboard, 0, count - 1, {
    rev: true,
    withScores: true
  });

  const entries: LeaderboardEntry[] = [];
  for (let i = 0; i < results.length; i += 2) {
    entries.push({
      member: results[i] as string,
      score: results[i + 1] as number,
      rank: Math.floor(i / 2) + 1,
    });
  }
  return entries;
}

export async function getRank(
  leaderboard: string,
  member: string
): Promise<number | null> {
  const rank = await kv.zrank(leaderboard, member);
  return rank !== null ? rank + 1 : null;
}

// ============================================
// FEATURE FLAGS
// ============================================

/**
 * Feature flags avec KV
 */
export async function isFeatureEnabled(
  feature: string,
  userId?: string
): Promise<boolean> {
  // Check user-specific override
  if (userId) {
    const userFlag = await kv.sismember(`feature:${feature}:users`, userId);
    if (userFlag) return true;
  }

  // Check global flag
  const enabled = await kv.get<boolean>(`feature:${feature}:enabled`);
  return enabled === true;
}

export async function enableFeature(feature: string): Promise<void> {
  await kv.set(`feature:${feature}:enabled`, true);
}

export async function disableFeature(feature: string): Promise<void> {
  await kv.set(`feature:${feature}:enabled`, false);
}

export async function enableFeatureForUser(feature: string, userId: string): Promise<void> {
  await kv.sadd(`feature:${feature}:users`, userId);
}
