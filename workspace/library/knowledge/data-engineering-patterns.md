# Data Engineering Patterns

> **Version**: v1.0 | ATUM CREA
> **Orchestration**: Inngest (serverless) ou cron Edge Functions
> **Analytics**: ClickHouse (via MCP) ou Supabase materialized views
> **Pattern**: Event Sourcing + Materialized Views

---

## Architecture ETL Serverless

```
Sources                    Transform                   Load
  │                           │                          │
  ├─ Supabase DB             │  Inngest Functions       │  ClickHouse (analytics)
  ├─ API externes      ────> │  Edge Functions    ────> │  Supabase (materialized views)
  ├─ Fichiers CSV/JSON       │  Server Actions          │  Data warehouse
  └─ Webhooks                │                          │
```

---

## ETL avec Inngest

```typescript
// lib/inngest/functions/etl-pipeline.ts
import { inngest } from '../client';

export const dailyETL = inngest.createFunction(
  { id: 'daily-etl-pipeline' },
  { cron: '0 2 * * *' }, // 2h du matin
  async ({ step }) => {
    // EXTRACT
    const rawData = await step.run('extract', async () => {
      const [orders, users, products] = await Promise.all([
        db.order.findMany({
          where: { createdAt: { gte: yesterday() } },
          include: { items: true },
        }),
        db.user.findMany({ where: { createdAt: { gte: yesterday() } } }),
        db.product.findMany({ select: { id: true, category: true, price: true } }),
      ]);
      return { orders, users, products };
    });

    // TRANSFORM
    const transformed = await step.run('transform', async () => {
      const dailyStats = {
        date: new Date().toISOString().split('T')[0],
        totalRevenue: rawData.orders.reduce((sum, o) => sum + o.total, 0),
        orderCount: rawData.orders.length,
        newUsers: rawData.users.length,
        avgOrderValue: rawData.orders.length > 0
          ? rawData.orders.reduce((sum, o) => sum + o.total, 0) / rawData.orders.length
          : 0,
        topCategories: computeTopCategories(rawData.orders, rawData.products),
        conversionRate: rawData.users.length > 0
          ? rawData.orders.length / rawData.users.length
          : 0,
      };
      return dailyStats;
    });

    // LOAD
    await step.run('load', async () => {
      await db.dailyAnalytics.upsert({
        where: { date: transformed.date },
        create: transformed,
        update: transformed,
      });
    });

    return { processed: true, date: transformed.date };
  }
);

function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function computeTopCategories(orders: any[], products: any[]) {
  const categoryMap = new Map(products.map((p) => [p.id, p.category]));
  const counts: Record<string, number> = {};

  for (const order of orders) {
    for (const item of order.items) {
      const cat = categoryMap.get(item.productId) || 'unknown';
      counts[cat] = (counts[cat] || 0) + item.quantity;
    }
  }

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));
}
```

---

## Materialized Views (Supabase)

```sql
-- Vue materialisee pour les stats mensuelles
CREATE MATERIALIZED VIEW monthly_revenue AS
SELECT
  date_trunc('month', created_at) AS month,
  COUNT(*) AS order_count,
  SUM(total) AS revenue,
  AVG(total) AS avg_order_value,
  COUNT(DISTINCT user_id) AS unique_customers
FROM orders
WHERE status = 'completed'
GROUP BY date_trunc('month', created_at)
ORDER BY month DESC;

CREATE UNIQUE INDEX idx_monthly_revenue ON monthly_revenue(month);

-- Rafraichir via cron (pg_cron) ou Edge Function
-- REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_revenue;
```

### Rafraichissement automatique

```typescript
// supabase/functions/refresh-views/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const views = [
    'monthly_revenue',
    'user_cohorts',
    'product_performance',
  ];

  for (const view of views) {
    await supabase.rpc('refresh_materialized_view', { view_name: view });
  }

  return new Response(JSON.stringify({ refreshed: views }));
});
```

```sql
-- Fonction SQL pour rafraichir une vue
CREATE OR REPLACE FUNCTION refresh_materialized_view(view_name TEXT)
RETURNS void AS $$
BEGIN
  EXECUTE format('REFRESH MATERIALIZED VIEW CONCURRENTLY %I', view_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Event Sourcing

```typescript
// lib/events/event-store.ts
type DomainEvent = {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  payload: Record<string, unknown>;
  metadata: { userId?: string; timestamp: string };
  version: number;
};

export async function appendEvent(event: Omit<DomainEvent, 'id' | 'version'>) {
  const { data, error } = await supabase
    .from('event_store')
    .insert({
      ...event,
      id: crypto.randomUUID(),
      version: await getNextVersion(event.aggregateId),
    })
    .select()
    .single();

  if (error) throw error;

  // Emettre vers Inngest pour les projections
  await inngest.send({
    name: `event/${event.eventType}`,
    data: { event: data },
  });

  return data;
}

// Reconstituer l'etat d'un aggregate
export async function getAggregate<T>(
  aggregateId: string,
  reducer: (state: T, event: DomainEvent) => T,
  initialState: T
): Promise<T> {
  const { data: events } = await supabase
    .from('event_store')
    .select('*')
    .eq('aggregate_id', aggregateId)
    .order('version', { ascending: true });

  return (events || []).reduce(reducer, initialState);
}
```

```sql
-- Table event store
CREATE TABLE event_store (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_id TEXT NOT NULL,
  aggregate_type TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  version INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(aggregate_id, version) -- Optimistic concurrency
);

CREATE INDEX idx_events_aggregate ON event_store(aggregate_id, version);
CREATE INDEX idx_events_type ON event_store(event_type, created_at);
```

---

## Pipeline d'import CSV

```typescript
// lib/data/csv-import.ts
import { parse } from 'csv-parse/sync';

export async function importCSV(
  buffer: Buffer,
  tableName: string,
  mapping: Record<string, string>, // csvColumn -> dbColumn
  batchSize = 1000
) {
  const records = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const mapped = records.map((record: Record<string, string>) => {
    const row: Record<string, any> = {};
    for (const [csvCol, dbCol] of Object.entries(mapping)) {
      row[dbCol] = record[csvCol];
    }
    return row;
  });

  // Insertion par batch
  let inserted = 0;
  for (let i = 0; i < mapped.length; i += batchSize) {
    const batch = mapped.slice(i, i + batchSize);
    const { error } = await supabase.from(tableName).insert(batch);
    if (error) throw error;
    inserted += batch.length;
  }

  return { total: records.length, inserted };
}
```

---

## Checklist

- [ ] Inngest configure pour l'orchestration ETL
- [ ] Pipeline EXTRACT → TRANSFORM → LOAD defini
- [ ] Materialized views pour les agregations
- [ ] Rafraichissement automatique des vues (cron ou Edge Function)
- [ ] Event store pour l'event sourcing (si applicable)
- [ ] Import CSV/JSON avec validation et batch insert
- [ ] Monitoring des pipelines (duree, erreurs, volumes)
- [ ] Retention policy pour les anciennes donnees

---

*Knowledge ATUM CREA | Sources: Inngest docs, Supabase, ClickHouse MCP*
