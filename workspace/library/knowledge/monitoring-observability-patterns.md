# Monitoring & Observabilite - Sentry + OpenTelemetry + Pino

> **Version**: v1.0 | ATUM CREA
> **Stack**: Sentry (errors) + OpenTelemetry (traces) + Pino (logs)
> **Principe**: Les 3 piliers de l'observabilite correles par traceId

---

## Architecture

```
Application Next.js
    │
    ├── Sentry (@sentry/nextjs v9+)
    │   └── Error tracking, performance, replays
    │
    ├── OpenTelemetry (@vercel/otel)
    │   └── Traces distribuees, spans, metriques
    │
    └── Pino (pino + pino-opentelemetry-transport)
        └── Logs structures, correles aux traces
            │
            ▼
    ┌───────────────────┐
    │   Correlation      │
    │   traceId + spanId │
    │   dans CHAQUE log  │
    └───────────────────┘
```

---

## Sentry - Error Tracking

### Installation

```bash
npx @sentry/wizard@latest -i nextjs
```

### Configuration

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration(),
    Sentry.feedbackIntegration({ colorScheme: 'system' }),
  ],
  // Bypass ad-blockers
  tunnelRoute: '/monitoring-tunnel',
});
```

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### Instrumentation Hook (Next.js 15)

```typescript
// instrumentation.ts
import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Capture automatique des erreurs serveur
export const onRequestError = Sentry.captureRequestError;
```

### Error Boundary

```typescript
// app/global-error.tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <h2>Une erreur est survenue</h2>
        <button onClick={reset}>Reessayer</button>
      </body>
    </html>
  );
}
```

---

## OpenTelemetry - Traces

### Installation

```bash
pnpm add @vercel/otel @opentelemetry/instrumentation-undici @opentelemetry/instrumentation-pino
```

### Configuration

```typescript
// instrumentation.ts
import { registerOTel } from '@vercel/otel';

export function register() {
  registerOTel({
    serviceName: 'mon-app',
    instrumentations: [
      // Tracer les requetes HTTP (fetch)
      new (require('@opentelemetry/instrumentation-undici').UndiciInstrumentation)(),
      // Injecter traceId/spanId dans les logs Pino
      new (require('@opentelemetry/instrumentation-pino').PinoInstrumentation)(),
    ],
  });
}
```

---

## Pino - Structured Logging

### Installation

```bash
pnpm add pino pino-pretty pino-opentelemetry-transport
```

### Configuration

```typescript
// lib/logger.ts
import pino from 'pino';

const isDev = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // En dev: format lisible. En prod: JSON + transport OTel
  ...(isDev
    ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
    : {
        transport: {
          targets: [
            {
              target: 'pino-opentelemetry-transport',
              options: {
                resourceAttributes: {
                  'service.name': 'mon-app',
                  'deployment.environment': process.env.NODE_ENV,
                },
              },
            },
            { target: 'pino/file', options: { destination: 1 } }, // stdout
          ],
        },
      }),
  // Champs par defaut
  base: { env: process.env.NODE_ENV },
  // Serializers securises
  serializers: {
    err: pino.stdSerializers.err,
    req: (req: any) => ({
      method: req.method,
      url: req.url,
      // NE PAS logger les headers Authorization
    }),
  },
});

// Logger enfant par module
export const createLogger = (module: string) => logger.child({ module });
```

### Usage

```typescript
// Dans les API routes
import { createLogger } from '@/lib/logger';

const log = createLogger('api/users');

export async function GET() {
  log.info({ action: 'list_users' }, 'Fetching users');

  try {
    const users = await db.user.findMany();
    log.info({ count: users.length }, 'Users fetched');
    return Response.json(users);
  } catch (error) {
    log.error({ err: error }, 'Failed to fetch users');
    throw error;
  }
}
```

### Correlation traces/logs

Avec `@opentelemetry/instrumentation-pino`, chaque log inclut automatiquement :
```json
{
  "level": 30,
  "msg": "Users fetched",
  "module": "api/users",
  "count": 42,
  "trace_id": "abc123def456",
  "span_id": "789ghi",
  "trace_flags": "01"
}
```

---

## Patterns Production

### Alertes Sentry sur metriques business

```typescript
// lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';

export function trackBusinessMetric(name: string, value: number, tags?: Record<string, string>) {
  Sentry.metrics.distribution(name, value, {
    tags,
    unit: name.includes('duration') ? 'millisecond' : 'none',
  });
}

// Usage
trackBusinessMetric('checkout.completed', 1, { plan: 'pro' });
trackBusinessMetric('api.response_time', 150, { endpoint: '/api/users' });
```

### Health Check endpoint

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const checks: Record<string, 'ok' | 'error'> = {};

  // Check DB
  try {
    await db.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }

  const healthy = Object.values(checks).every((v) => v === 'ok');

  return NextResponse.json(
    { status: healthy ? 'healthy' : 'degraded', checks },
    { status: healthy ? 200 : 503 }
  );
}
```

---

## Checklist

- [ ] `@sentry/nextjs` configure avec `tunnelRoute`
- [ ] `@vercel/otel` avec `registerOTel` dans `instrumentation.ts`
- [ ] `pino` avec `pino-opentelemetry-transport` en production
- [ ] `onRequestError` de Sentry dans `instrumentation.ts`
- [ ] Error boundaries (`global-error.tsx`, `error.tsx` par route)
- [ ] Logs structures (JSON, pas de `console.log`)
- [ ] Correlation `traceId`/`spanId` dans les logs
- [ ] Health check endpoint `/api/health`
- [ ] Sampling rates ajustes pour la production
- [ ] Alertes configurees dans Sentry (erreurs, metriques)

---

*Knowledge ATUM CREA | Sources: @sentry/nextjs v9, @vercel/otel, pino docs*
