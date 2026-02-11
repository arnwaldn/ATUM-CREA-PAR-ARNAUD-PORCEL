# Queue & Background Jobs Patterns

> **Version**: v1.0 | ATUM CREA
> **Serverless (Vercel)**: Inngest (event-driven, HTTP-triggered)
> **Self-hosted (VPS/Docker)**: BullMQ + Redis
> **Regle**: Vercel → Inngest. VPS → BullMQ.

---

## Decision : Inngest vs BullMQ

| Critere | Inngest | BullMQ |
|---------|---------|--------|
| **Deploiement** | Serverless (Vercel, Netlify) | Long-running worker (VPS) |
| **Infra requise** | Aucune (service gere) | Redis obligatoire |
| **Declencheur** | Events HTTP | Queue Redis |
| **Retries** | Automatiques, configurables | Automatiques |
| **Cron jobs** | Oui (integre) | Oui (repeatables) |
| **Observabilite** | Dashboard integre | Redis Insight / BullBoard |
| **Prix** | Freemium (25K events/mois) | Gratuit (auto-heberge) |

---

## Inngest (Serverless)

### Installation

```bash
pnpm add inngest
```

### Configuration

```typescript
// lib/inngest/client.ts
import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'mon-app',
  schemas: new EventSchemas().fromRecord<{
    'user/created': { data: { userId: string; email: string } };
    'order/completed': { data: { orderId: string; amount: number } };
    'email/send': { data: { to: string; template: string; data: Record<string, any> } };
  }>(),
});
```

### Fonctions (Jobs)

```typescript
// lib/inngest/functions/welcome-flow.ts
import { inngest } from '../client';
import { emailService } from '@/lib/email';
import { db } from '@/lib/db';

export const welcomeFlow = inngest.createFunction(
  {
    id: 'welcome-flow',
    retries: 3,
  },
  { event: 'user/created' },
  async ({ event, step }) => {
    // Step 1: Envoyer l'email de bienvenue
    await step.run('send-welcome-email', async () => {
      await emailService.sendWelcome(event.data.email, event.data.userId);
    });

    // Step 2: Attendre 24h
    await step.sleep('wait-24h', '24h');

    // Step 3: Verifier si l'utilisateur a complete son profil
    const user = await step.run('check-profile', async () => {
      return db.user.findUnique({ where: { id: event.data.userId } });
    });

    // Step 4: Envoyer un rappel si profil incomplet
    if (!user?.profileCompleted) {
      await step.run('send-reminder', async () => {
        await emailService.sendProfileReminder(event.data.email);
      });
    }
  }
);
```

### Cron Job

```typescript
// lib/inngest/functions/daily-report.ts
import { inngest } from '../client';

export const dailyReport = inngest.createFunction(
  { id: 'daily-report' },
  { cron: '0 8 * * *' }, // Chaque jour a 8h
  async ({ step }) => {
    const stats = await step.run('fetch-stats', async () => {
      return db.order.aggregate({
        _sum: { amount: true },
        _count: true,
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      });
    });

    await step.run('send-report', async () => {
      await emailService.sendDailyReport({
        revenue: stats._sum.amount || 0,
        orders: stats._count,
      });
    });
  }
);
```

### API Route (endpoint Inngest)

```typescript
// app/api/inngest/route.ts
import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import { welcomeFlow } from '@/lib/inngest/functions/welcome-flow';
import { dailyReport } from '@/lib/inngest/functions/daily-report';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [welcomeFlow, dailyReport],
});
```

### Emettre un event

```typescript
// Dans n'importe quel Server Action ou API Route
import { inngest } from '@/lib/inngest/client';

export async function registerUser(data: { email: string; name: string }) {
  const user = await db.user.create({ data });

  // Declencher le workflow en background
  await inngest.send({
    name: 'user/created',
    data: { userId: user.id, email: user.email },
  });

  return user;
}
```

---

## BullMQ (Self-hosted)

### Installation

```bash
pnpm add bullmq ioredis
```

### Queue et Worker

```typescript
// lib/queue/email-queue.ts
import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null });

// Queue
export const emailQueue = new Queue('emails', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  },
});

// Worker (doit tourner dans un process long-running)
export const emailWorker = new Worker(
  'emails',
  async (job: Job) => {
    const { to, template, data } = job.data;

    switch (template) {
      case 'welcome':
        await emailService.sendWelcome(to, data.username);
        break;
      case 'reset-password':
        await emailService.sendPasswordReset(to, data.username, data.token);
        break;
    }
  },
  {
    connection,
    concurrency: 5,
    limiter: { max: 10, duration: 1000 }, // Max 10 emails/seconde
  }
);

emailWorker.on('failed', (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});
```

### Ajouter un job

```typescript
await emailQueue.add('send-welcome', {
  to: 'user@example.com',
  template: 'welcome',
  data: { username: 'Arnaud' },
});

// Job differe
await emailQueue.add('send-reminder', { ... }, {
  delay: 24 * 60 * 60 * 1000, // 24h
});

// Job recurrent
await emailQueue.add('daily-cleanup', {}, {
  repeat: { pattern: '0 3 * * *' }, // 3h du matin
});
```

---

## Checklist

### Inngest (Serverless)
- [ ] `inngest` installe
- [ ] Client configure avec event schemas
- [ ] Fonctions definies avec steps
- [ ] API route `/api/inngest` creee
- [ ] Inngest Dev Server pour le dev local (`npx inngest-cli@latest dev`)
- [ ] Events emis depuis les Server Actions

### BullMQ (Self-hosted)
- [ ] Redis deploye et accessible
- [ ] Queues definies avec retry et backoff
- [ ] Workers dans un process separe (pas Next.js)
- [ ] Monitoring (BullBoard ou Redis Insight)
- [ ] Jobs recurrents pour les taches cron

---

*Knowledge ATUM CREA | Sources: Inngest docs, BullMQ docs, batuhanbilginn/background-jobs-nextjs13-inngest*
