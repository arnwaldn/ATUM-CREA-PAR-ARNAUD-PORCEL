# API Backend Parallel Workflow

## Objectif
Générer une API REST/GraphQL complète en **< 2 minutes** avec **10-12 agents en parallèle**.

## Timeline

```
0s ──── 45s ──── 90s ──── 120s
│        │        │        │
▼        ▼        ▼        ▼
PHASE 1  PHASE 2  PHASE 3  DONE
Schema   Routes   Quality
(4 agents)(5 agents)(3 agents)
```

## Phase 1: Schema & Foundation (0-45s) - 4 Agents Parallèles

```yaml
agents:
  agent-1:
    name: backend-super
    task: database_schema
    files:
      - prisma/schema.prisma
      - src/lib/prisma.ts
      - src/types/index.ts
    template: |
      Modèles basés sur les requirements:
      - Relations (1:1, 1:N, N:N)
      - Enums
      - Indexes
      - Contraintes
    mcps: [prisma]
    estimated: 15s

  agent-2:
    name: backend-super
    task: auth_middleware
    files:
      - src/middleware/auth.ts
      - src/middleware/rate-limit.ts
      - src/middleware/cors.ts
      - src/lib/jwt.ts
    estimated: 12s

  agent-3:
    name: backend-super
    task: validation_schemas
    files:
      - src/validations/index.ts
      - src/validations/user.ts
      - src/validations/[model].ts
    template: |
      Zod schemas pour chaque modèle:
      - Create schema
      - Update schema
      - Query params schema
    estimated: 10s

  agent-4:
    name: research-super
    task: api_documentation
    files:
      - docs/api.md
      - openapi.yaml
    mcps: [context7]
    estimated: 15s
```

**Barrier: Phase 1 Complete**

## Phase 2: Routes & Logic (45-90s) - 5 Agents

```yaml
agents:
  agent-5:
    name: backend-super
    task: crud_routes
    dependencies: [agent-1, agent-3]
    files:
      - src/app/api/[model]/route.ts
      - src/app/api/[model]/[id]/route.ts
    template: |
      Pour chaque modèle:
      - GET /api/[model] (list avec pagination)
      - GET /api/[model]/[id] (single)
      - POST /api/[model] (create)
      - PUT /api/[model]/[id] (update)
      - DELETE /api/[model]/[id] (delete)
    estimated: 20s

  agent-6:
    name: backend-super
    task: custom_endpoints
    dependencies: [agent-1]
    files:
      - src/app/api/[custom]/route.ts
    template: |
      Endpoints spéciaux:
      - Search
      - Aggregate
      - Batch operations
      - Webhooks
    estimated: 15s

  agent-7:
    name: backend-super
    task: error_handling
    files:
      - src/lib/errors.ts
      - src/lib/api-response.ts
    template: |
      - Custom error classes
      - Error codes
      - Standardized responses
      - Logging
    estimated: 10s

  agent-8:
    name: backend-super
    task: caching_layer
    files:
      - src/lib/cache.ts
      - src/middleware/cache.ts
    mcps: [upstash]
    estimated: 12s

  agent-9:
    name: backend-super
    task: background_jobs
    files:
      - src/jobs/index.ts
      - src/lib/queue.ts
    template: |
      - Email notifications
      - Data sync
      - Cleanup tasks
    estimated: 15s
```

**Barrier: Phase 2 Complete**

## Phase 3: Quality (90-120s) - 3 Agents

```yaml
agents:
  agent-10:
    name: quality-super
    task: security_scan
    actions:
      - SQL injection check
      - Auth bypass check
      - Rate limiting verification
      - Input validation check
    mcps: [semgrep]
    estimated: 15s

  agent-11:
    name: quality-super
    task: api_tests
    files:
      - src/__tests__/api/[model].test.ts
      - src/__tests__/integration/
    estimated: 20s

  agent-12:
    name: quality-super
    task: load_testing
    files:
      - tests/load/k6.js
    template: |
      - Endpoint performance
      - Concurrent users
      - Response times
    estimated: 10s
```

## Structure Finale

```
my-api/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── users/
│   │       │   ├── route.ts          # GET (list), POST
│   │       │   └── [id]/
│   │       │       └── route.ts      # GET, PUT, DELETE
│   │       ├── posts/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── search/route.ts
│   │       └── webhooks/
│   │           └── [service]/route.ts
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── jwt.ts
│   │   ├── cache.ts
│   │   ├── errors.ts
│   │   ├── api-response.ts
│   │   └── queue.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── rate-limit.ts
│   │   ├── cors.ts
│   │   └── cache.ts
│   ├── validations/
│   │   ├── index.ts
│   │   ├── user.ts
│   │   └── post.ts
│   ├── jobs/
│   │   └── index.ts
│   └── __tests__/
│       └── api/
├── docs/
│   └── api.md
├── openapi.yaml
├── tests/
│   └── load/k6.js
└── package.json
```

## Templates de Route

### GET List (avec pagination)
```typescript
// src/app/api/users/route.ts
import { prisma } from '@/lib/prisma';
import { apiResponse, apiError } from '@/lib/api-response';
import { listUsersSchema } from '@/validations/user';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = listUsersSchema.parse({
    page: searchParams.get('page') || '1',
    limit: searchParams.get('limit') || '10',
    sort: searchParams.get('sort') || 'createdAt',
    order: searchParams.get('order') || 'desc',
  });

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { [params.sort]: params.order },
    }),
    prisma.user.count(),
  ]);

  return apiResponse({
    data: users,
    meta: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
    },
  });
}
```

### Error Response
```typescript
// src/lib/api-response.ts
export function apiResponse<T>(data: T, status = 200) {
  return Response.json({ success: true, ...data }, { status });
}

export function apiError(message: string, code: string, status = 400) {
  return Response.json({
    success: false,
    error: { message, code },
  }, { status });
}
```

## Commande

```bash
/turbo api "API de gestion de tâches"
```

Options:
```bash
/turbo api "Task API" --auth=jwt --cache=redis --docs=openapi
```

## Métriques

| Métrique | Cible | Actuel |
|----------|-------|--------|
| Temps total | < 2 min | 1m 45s |
| Endpoints | 20+ | 24 |
| Tests | 100% | 100% |
| Security | A | A |
| Latency P99 | < 100ms | 45ms |

---

**Version:** v18.1 | **Agents:** 12 | **Phases:** 3 | **Temps:** < 2 min
