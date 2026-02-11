# PLANNING.md - Architecture & Rules

> Project-level architecture decisions and absolute rules.
> Update when major decisions are made. Reference constantly.

---

## Project Overview

**Name**: [Project Name]
**Type**: [SaaS / Landing / API / Mobile / Desktop / E-commerce]
**Created**: [Date]
**Status**: [Planning / Active / Maintenance]

---

## Tech Stack

### Frontend
```yaml
framework: [Next.js 15 / Nuxt / SvelteKit]
ui: [shadcn/ui / Tailwind / MUI]
state: [Zustand / Redux / Context]
forms: [React Hook Form / Formik]
```

### Backend
```yaml
api: [Next.js API Routes / Express / Hono]
database: [Supabase / PostgreSQL / MongoDB]
orm: [Prisma / Drizzle]
auth: [Clerk / Supabase Auth / NextAuth]
```

### Infrastructure
```yaml
hosting: [Vercel / Cloudflare / Railway]
storage: [Supabase Storage / S3 / Cloudflare R2]
cdn: [Cloudflare / Vercel Edge]
monitoring: [Sentry / PostHog]
```

---

## Architecture Decisions

### Decision 1: [Title]
**Date**: [When decided]
**Decision**: [What was decided]
**Rationale**: [Why this choice]
**Alternatives Considered**: [Other options]
**Status**: [Active / Superseded]

### Decision 2: [Title]
...

---

## Directory Structure

```
project/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   │   ├── ui/             # shadcn components
│   │   └── features/       # Feature-specific
│   ├── lib/                # Utilities
│   ├── hooks/              # Custom hooks
│   ├── types/              # TypeScript types
│   └── styles/             # Global styles
├── prisma/                  # Database schema
├── public/                  # Static assets
└── tests/                   # Test files
```

---

## Absolute Rules

### Code Rules
1. **TypeScript**: All code must be TypeScript (no `any` unless documented)
2. **Components**: Use shadcn/ui before creating custom components
3. **State**: Prefer server state (React Query) over client state
4. **Forms**: Use React Hook Form + Zod for all forms
5. **API**: Use server actions for mutations, route handlers for complex logic

### Naming Conventions
1. **Files**: kebab-case (`user-profile.tsx`)
2. **Components**: PascalCase (`UserProfile`)
3. **Hooks**: camelCase with use prefix (`useUserProfile`)
4. **Types**: PascalCase with Type/Props suffix (`UserProfileProps`)

### Git Rules
1. **Commits**: Conventional commits (`feat:`, `fix:`, `docs:`)
2. **Branches**: `feature/`, `fix/`, `refactor/` prefixes
3. **PR**: Must pass all checks before merge

---

## API Design

### Endpoints Pattern
```
GET    /api/[resource]         # List
POST   /api/[resource]         # Create
GET    /api/[resource]/[id]    # Read
PATCH  /api/[resource]/[id]    # Update
DELETE /api/[resource]/[id]    # Delete
```

### Response Format
```typescript
// Success
{ data: T, meta?: { page, total } }

// Error
{ error: { code: string, message: string, details?: any } }
```

---

## Security Rules

1. **Auth**: All protected routes require authentication
2. **Input**: Validate all inputs with Zod
3. **SQL**: Use parameterized queries (Prisma handles this)
4. **CORS**: Restrict to known origins in production
5. **Secrets**: Never commit secrets, use environment variables

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| LCP | < 2.5s | - |
| FID | < 100ms | - |
| CLS | < 0.1 | - |
| Bundle Size | < 200KB | - |
| API Response | < 200ms | - |

---

## Dependencies Policy

### Approved
- React, Next.js, TypeScript
- Tailwind, shadcn/ui
- Prisma, Supabase
- Zod, React Hook Form

### Requires Review
- Any new UI library
- Any new state management
- Any new API framework

### Forbidden
- jQuery
- Moment.js (use date-fns)
- Any library > 100KB without justification

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| [Date] | Initial architecture | [Name] |
| ... | ... | ... |

---

*Last Updated: [Date]*
