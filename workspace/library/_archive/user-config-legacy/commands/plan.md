---
description: Planning projet/feature structure (user)
---

# /plan - Project Planning

## USAGE
```
/plan feature "User authentication system"
/plan project "E-commerce platform"
/plan sprint "Q1 2025 goals"
/plan architecture "Microservices migration"
```

## MODES

### feature
Planifier une feature
```
/plan feature "Shopping cart with checkout"
```

### project
Planifier projet complet
```
/plan project "SaaS analytics dashboard"
```

### sprint
Planifier un sprint
```
/plan sprint "2 weeks - auth + payments"
```

### architecture
Planifier architecture
```
/plan architecture "Monolith to microservices"
```

## FEATURE PLAN

```
/plan feature "User authentication"
```

Output:
```yaml
feature_plan:
  name: User Authentication
  priority: P0
  complexity: Medium

  requirements:
    functional:
      - Email/password login
      - OAuth (Google, GitHub)
      - Password reset flow
      - Session management
      - 2FA (optional)

    non_functional:
      - Response time < 200ms
      - 99.9% uptime
      - GDPR compliant

  components:
    - name: AuthProvider
      type: context
      files: [src/providers/auth.tsx]

    - name: LoginForm
      type: component
      files: [src/components/auth/LoginForm.tsx]

    - name: /api/auth/*
      type: api
      files: [src/app/api/auth/...]

  dependencies:
    - Supabase Auth
    - next-auth (optional)

  tasks:
    1. Setup Supabase project
    2. Create AuthProvider context
    3. Implement LoginForm
    4. Implement RegisterForm
    5. Create API routes
    6. Add OAuth providers
    7. Implement password reset
    8. Add tests
    9. Documentation

  risks:
    - OAuth callback configuration
    - Session token management
    - Rate limiting
```

## PROJECT PLAN

```
/plan project "E-commerce SaaS"
```

Output:
```yaml
project_plan:
  name: E-commerce SaaS
  type: Full-stack SaaS

  phases:
    phase_1_foundation:
      duration: 2 weeks
      features:
        - Project setup (Next.js, Supabase)
        - Authentication
        - Basic UI components

    phase_2_core:
      duration: 4 weeks
      features:
        - Product catalog
        - Shopping cart
        - Checkout flow
        - Order management

    phase_3_features:
      duration: 3 weeks
      features:
        - Payment integration
        - Email notifications
        - Admin dashboard

    phase_4_launch:
      duration: 1 week
      features:
        - Performance optimization
        - Security audit
        - Documentation
        - Deployment

  architecture:
    frontend: Next.js 15 + React 19
    backend: Supabase + Edge Functions
    database: PostgreSQL
    payments: Stripe
    auth: Supabase Auth
    deploy: Vercel

  milestones:
    - M1: Auth + basic UI (week 2)
    - M2: Product CRUD (week 4)
    - M3: Cart + Checkout (week 6)
    - M4: Payments (week 8)
    - M5: Launch ready (week 10)
```

## ARCHITECTURE PLAN

```
/plan architecture "Event-driven system"
```

Output:
```yaml
architecture_plan:
  current_state:
    type: Monolith
    issues:
      - Tight coupling
      - Scaling limitations
      - Deploy complexity

  target_state:
    type: Event-driven microservices
    components:
      - API Gateway
      - User Service
      - Order Service
      - Payment Service
      - Event Bus (Redis)

  migration_steps:
    1. Extract user service
    2. Implement event bus
    3. Extract order service
    4. Extract payment service
    5. Add API gateway
    6. Decommission monolith

  diagram: |
    [Client] → [API Gateway]
                    ↓
         ┌─────────┼─────────┐
         ↓         ↓         ↓
    [Users]   [Orders]  [Payments]
         └─────────┼─────────┘
                   ↓
              [Event Bus]
```

## OPTIONS
| Option | Description |
|--------|-------------|
| --detail=X | low, medium, high |
| --format=X | yaml, md, json |
| --save | Sauvegarder plan |
| --diagram | Generer diagramme |

## MCP UTILISES
- sequential-thinking (planning)
- Mermaid (diagrammes)
- Hindsight (patterns)
- TodoWrite (tasks)
