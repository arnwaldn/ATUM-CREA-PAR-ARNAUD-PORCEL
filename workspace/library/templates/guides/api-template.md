# Template: API Backend

## Overview

Template complet pour créer une API REST/GraphQL moderne avec Hono, documentation OpenAPI, rate limiting, versioning, et monitoring.

---

## STACK TECHNIQUE

| Couche | Technologie | Raison |
|--------|-------------|--------|
| **Framework** | Hono | Ultra-fast, Edge-ready |
| **Runtime** | Bun / Node.js | Performance |
| **Database** | PostgreSQL + Prisma | Type-safe ORM |
| **Cache** | Redis / Upstash | Rate limiting, caching |
| **Auth** | JWT + API Keys | Standard auth |
| **Docs** | OpenAPI 3.1 / Swagger | Auto-generated docs |
| **Validation** | Zod | Runtime validation |
| **Monitoring** | OpenTelemetry | Observability |
| **Deploy** | Cloudflare Workers / Fly.io | Edge deployment |

---

## ARCHITECTURE API

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API ARCHITECTURE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  CLIENT REQUEST                                                              │
│       │                                                                      │
│       ▼                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    EDGE LAYER                                        │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │    CORS      │  │ RATE LIMIT   │  │    AUTH      │               │   │
│  │  │              │  │              │  │              │               │   │
│  │  │ • Origins    │  │ • IP-based   │  │ • JWT        │               │   │
│  │  │ • Methods    │  │ • Key-based  │  │ • API Keys   │               │   │
│  │  │ • Headers    │  │ • Sliding    │  │ • OAuth      │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  └────────────────────────────────────┬────────────────────────────────┘   │
│                                       │                                     │
│                                       ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    ROUTING LAYER                                     │   │
│  │                                                                      │   │
│  │  /api/v1/*                        /api/v2/*                         │   │
│  │  ├── /users                       ├── /users                        │   │
│  │  ├── /products                    ├── /products                     │   │
│  │  ├── /orders                      └── /orders                       │   │
│  │  └── /webhooks                                                      │   │
│  └────────────────────────────────────┬────────────────────────────────┘   │
│                                       │                                     │
│                                       ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    HANDLER LAYER                                     │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │  VALIDATION  │  │   BUSINESS   │  │   RESPONSE   │               │   │
│  │  │              │  │   LOGIC      │  │              │               │   │
│  │  │ • Zod        │  │ • Services   │  │ • Format     │               │   │
│  │  │ • Sanitize   │  │ • Database   │  │ • Status     │               │   │
│  │  │ • Transform  │  │ • Cache      │  │ • Headers    │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  └────────────────────────────────────┬────────────────────────────────┘   │
│                                       │                                     │
│                                       ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    DATA LAYER                                        │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │   PRISMA     │  │    REDIS     │  │   STORAGE    │               │   │
│  │  │   (ORM)      │  │   (Cache)    │  │   (Files)    │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## STRUCTURE PROJET

```
my-api/
├── src/
│   ├── index.ts                    # Entry point
│   ├── app.ts                      # Hono app setup
│   │
│   ├── routes/
│   │   ├── index.ts                # Route aggregator
│   │   ├── v1/
│   │   │   ├── index.ts            # V1 router
│   │   │   ├── users.ts            # User routes
│   │   │   ├── products.ts         # Product routes
│   │   │   ├── orders.ts           # Order routes
│   │   │   └── webhooks.ts         # Webhook routes
│   │   └── v2/
│   │       └── index.ts            # V2 router (breaking changes)
│   │
│   ├── middleware/
│   │   ├── auth.ts                 # Authentication
│   │   ├── rate-limit.ts           # Rate limiting
│   │   ├── cors.ts                 # CORS
│   │   ├── logger.ts               # Request logging
│   │   ├── error-handler.ts        # Error handling
│   │   └── validate.ts             # Validation middleware
│   │
│   ├── services/
│   │   ├── user.service.ts
│   │   ├── product.service.ts
│   │   ├── order.service.ts
│   │   └── cache.service.ts
│   │
│   ├── schemas/
│   │   ├── user.schema.ts          # Zod schemas
│   │   ├── product.schema.ts
│   │   └── common.schema.ts
│   │
│   ├── lib/
│   │   ├── db.ts                   # Prisma client
│   │   ├── redis.ts                # Redis client
│   │   ├── jwt.ts                  # JWT utilities
│   │   └── openapi.ts              # OpenAPI generator
│   │
│   ├── types/
│   │   └── index.ts                # Type definitions
│   │
│   └── utils/
│       ├── response.ts             # Response helpers
│       └── errors.ts               # Custom errors
│
├── prisma/
│   └── schema.prisma
│
├── docs/
│   └── openapi.yaml                # Generated OpenAPI spec
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── package.json
├── tsconfig.json
├── wrangler.toml                   # Cloudflare config
└── fly.toml                        # Fly.io config
```

---

## HONO SETUP

### App Configuration

```typescript
// src/app.ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { prettyJSON } from 'hono/pretty-json'

import { authMiddleware } from './middleware/auth'
import { rateLimiter } from './middleware/rate-limit'
import { errorHandler } from './middleware/error-handler'
import { v1Routes } from './routes/v1'
import { v2Routes } from './routes/v2'

type Bindings = {
  DATABASE_URL: string
  REDIS_URL: string
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Global middleware
app.use('*', logger())
app.use('*', secureHeaders())
app.use('*', prettyJSON())
app.use('*', cors({
  origin: ['https://myapp.com', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposeHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400,
}))

// Rate limiting
app.use('/api/*', rateLimiter({
  limit: 100,
  window: 60, // seconds
}))

// Error handling
app.onError(errorHandler)

// Health check
app.get('/health', (c) => c.json({ status: 'healthy', timestamp: new Date().toISOString() }))

// API routes
app.route('/api/v1', v1Routes)
app.route('/api/v2', v2Routes)

// OpenAPI docs
app.get('/docs', (c) => c.html(swaggerUI))
app.get('/openapi.json', (c) => c.json(openApiSpec))

export default app
```

### Entry Point

```typescript
// src/index.ts
import app from './app'

// For Cloudflare Workers
export default app

// For Node.js / Bun
// import { serve } from '@hono/node-server'
// serve({ fetch: app.fetch, port: 3000 })
```

---

## ROUTE DEFINITIONS

### Users Routes

```typescript
// src/routes/v1/users.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware, requireRole } from '@/middleware/auth'
import { UserService } from '@/services/user.service'

const users = new Hono()

// Schemas
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(8),
})

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
})

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z.enum(['createdAt', 'name', 'email']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

// Routes
users.get('/', zValidator('query', querySchema), async (c) => {
  const query = c.req.valid('query')
  const result = await UserService.list(query)
  return c.json({
    data: result.users,
    pagination: {
      page: query.page,
      limit: query.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / query.limit)
    }
  })
})

users.get('/:id', async (c) => {
  const id = c.req.param('id')
  const user = await UserService.getById(id)

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json({ data: user })
})

users.post('/', zValidator('json', createUserSchema), async (c) => {
  const data = c.req.valid('json')
  const user = await UserService.create(data)
  return c.json({ data: user }, 201)
})

users.patch('/:id', authMiddleware, zValidator('json', updateUserSchema), async (c) => {
  const id = c.req.param('id')
  const data = c.req.valid('json')
  const user = await UserService.update(id, data)
  return c.json({ data: user })
})

users.delete('/:id', authMiddleware, requireRole('admin'), async (c) => {
  const id = c.req.param('id')
  await UserService.delete(id)
  return c.json({ message: 'User deleted' }, 200)
})

export { users }
```

---

## AUTHENTICATION

### JWT Middleware

```typescript
// src/middleware/auth.ts
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { verify } from 'hono/jwt'

interface JWTPayload {
  sub: string
  email: string
  role: string
  exp: number
}

declare module 'hono' {
  interface ContextVariableMap {
    user: JWTPayload
  }
}

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Missing or invalid authorization header' })
  }

  const token = authHeader.substring(7)

  try {
    const payload = await verify(token, c.env.JWT_SECRET) as JWTPayload

    if (payload.exp < Date.now() / 1000) {
      throw new HTTPException(401, { message: 'Token expired' })
    }

    c.set('user', payload)
    await next()
  } catch (error) {
    throw new HTTPException(401, { message: 'Invalid token' })
  }
})

export const requireRole = (...roles: string[]) => {
  return createMiddleware(async (c, next) => {
    const user = c.get('user')

    if (!user || !roles.includes(user.role)) {
      throw new HTTPException(403, { message: 'Insufficient permissions' })
    }

    await next()
  })
}

// API Key authentication
export const apiKeyAuth = createMiddleware(async (c, next) => {
  const apiKey = c.req.header('X-API-Key')

  if (!apiKey) {
    throw new HTTPException(401, { message: 'API key required' })
  }

  const keyData = await validateApiKey(apiKey)

  if (!keyData) {
    throw new HTTPException(401, { message: 'Invalid API key' })
  }

  c.set('apiKey', keyData)
  await next()
})
```

---

## RATE LIMITING

```typescript
// src/middleware/rate-limit.ts
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { Redis } from '@upstash/redis'

interface RateLimitConfig {
  limit: number
  window: number // seconds
  keyGenerator?: (c: Context) => string
}

export function rateLimiter(config: RateLimitConfig) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })

  return createMiddleware(async (c, next) => {
    const key = config.keyGenerator?.(c) ??
      c.req.header('X-API-Key') ??
      c.req.header('CF-Connecting-IP') ??
      'anonymous'

    const redisKey = `ratelimit:${key}`
    const now = Math.floor(Date.now() / 1000)
    const windowStart = now - config.window

    // Use Redis sorted set for sliding window
    const pipeline = redis.pipeline()
    pipeline.zremrangebyscore(redisKey, 0, windowStart)
    pipeline.zadd(redisKey, { score: now, member: `${now}-${Math.random()}` })
    pipeline.zcard(redisKey)
    pipeline.expire(redisKey, config.window)

    const results = await pipeline.exec()
    const count = results[2] as number

    // Set rate limit headers
    c.header('X-RateLimit-Limit', config.limit.toString())
    c.header('X-RateLimit-Remaining', Math.max(0, config.limit - count).toString())
    c.header('X-RateLimit-Reset', (now + config.window).toString())

    if (count > config.limit) {
      throw new HTTPException(429, {
        message: 'Rate limit exceeded',
        res: new Response(JSON.stringify({
          error: 'Too Many Requests',
          retryAfter: config.window
        }), {
          status: 429,
          headers: {
            'Retry-After': config.window.toString(),
            'Content-Type': 'application/json'
          }
        })
      })
    }

    await next()
  })
}
```

---

## OPENAPI DOCUMENTATION

```typescript
// src/lib/openapi.ts
import { OpenAPIHono } from '@hono/zod-openapi'

export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'A modern REST API built with Hono',
  },
  servers: [
    { url: 'https://api.myapp.com', description: 'Production' },
    { url: 'http://localhost:3000', description: 'Development' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      apiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
      },
    },
  },
  security: [
    { bearerAuth: [] },
    { apiKeyAuth: [] },
  ],
  paths: {
    '/api/v1/users': {
      get: {
        summary: 'List users',
        tags: ['Users'],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          '200': {
            description: 'List of users',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create user',
        tags: ['Users'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateUser' },
            },
          },
        },
        responses: {
          '201': { description: 'User created' },
          '400': { description: 'Validation error' },
        },
      },
    },
  },
}
```

---

## ERROR HANDLING

```typescript
// src/middleware/error-handler.ts
import { ErrorHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'

export const errorHandler: ErrorHandler = (err, c) => {
  console.error('Error:', err)

  // Zod validation errors
  if (err instanceof ZodError) {
    return c.json({
      error: 'Validation Error',
      details: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    }, 400)
  }

  // HTTP exceptions
  if (err instanceof HTTPException) {
    return c.json({
      error: err.message,
    }, err.status)
  }

  // Database errors
  if (err.code === 'P2002') {
    return c.json({
      error: 'Resource already exists',
    }, 409)
  }

  if (err.code === 'P2025') {
    return c.json({
      error: 'Resource not found',
    }, 404)
  }

  // Generic server error
  return c.json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  }, 500)
}
```

---

## DEPLOYMENT

### Cloudflare Workers

```toml
# wrangler.toml
name = "my-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
NODE_ENV = "production"

[[d1_databases]]
binding = "DB"
database_name = "my-api-db"
database_id = "xxx"

[[kv_namespaces]]
binding = "CACHE"
id = "xxx"
```

### Fly.io

```toml
# fly.toml
app = "my-api"
primary_region = "iad"

[build]
  builder = "heroku/buildpacks:20"

[env]
  NODE_ENV = "production"

[http_service]
  internal_port = 3000
  force_https = true

[[services.ports]]
  port = 443
  handlers = ["tls", "http"]

[services.concurrency]
  type = "connections"
  hard_limit = 100
  soft_limit = 80
```

---

## FEATURES INCLUSES

### MVP
- [x] RESTful routing with Hono
- [x] JWT & API Key authentication
- [x] Request validation (Zod)
- [x] Rate limiting (sliding window)
- [x] Error handling
- [x] CORS configuration
- [x] OpenAPI documentation

### Advanced
- [ ] GraphQL endpoint
- [ ] Webhook management
- [ ] API versioning (v1, v2)
- [ ] Request/response logging
- [ ] Caching layer (Redis)
- [ ] Monitoring (OpenTelemetry)

---

## COMMANDES

```bash
# Create API
/create api MyAPI

# With options
/create api MyAPI --with-graphql --with-redis

# Add features
/generate feature rate-limit
/generate feature webhooks
```

---

**Version:** 1.0
**Stack:** Hono + Prisma + Redis + OpenAPI
**Deploy:** Cloudflare Workers / Fly.io
**Temps estimé:** 2-3 heures pour MVP
