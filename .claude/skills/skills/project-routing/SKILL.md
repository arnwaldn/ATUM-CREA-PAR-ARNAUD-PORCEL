---
name: project-routing
description: Route project requests to the correct stack, template, and knowledge files. Use when creating a new project or choosing a technology stack.
---

# Project Routing - Stack & Template Selection

## Stack 2025

```
Frontend  : Next.js 15, React 19, TypeScript 5.7, TailwindCSS 4, shadcn/ui
Backend   : Supabase, Prisma 6, Hono
Auth      : Clerk (SaaS) | Supabase Auth (simple)
Tests     : Vitest, Playwright
Mobile    : Expo SDK 52+, React Native
Desktop   : Tauri 2.0
Games     : Phaser 3, Three.js
```

## Project Type -> Stack Mapping

| Type | Stack |
|------|-------|
| Web SaaS | Next.js 15 + Supabase + Stripe + Clerk |
| Web Landing | Next.js 15 + shadcn/ui + TailwindCSS 4 |
| Web E-commerce | Next.js 15 + Stripe + Prisma |
| Web Dashboard | Next.js 15 + shadcn/ui + Recharts + Zustand |
| API | Hono + Prisma + PostgreSQL |
| Mobile | Expo SDK 52 + React Native |
| Desktop | Tauri 2.0 + React 19 |
| Game 2D/3D | Phaser 3 / Three.js |
| AI Agent | Python + Phidata/LangGraph |
| Odoo Module | Python + OWL 2.0 + PostgreSQL |

## Template Mapping

| User Request | Template Path | Knowledge File |
|---|---|---|
| SaaS | `templates/saas/` | `knowledge/stripe-patterns.md` |
| Landing page | `templates/landing/` | `knowledge/web-vitals-guide.md` |
| E-commerce | `templates/ecommerce/` | `knowledge/stripe-patterns.md` |
| Dashboard | `templates/admin-dashboard/` | `knowledge/ui-components.md` |
| API | `templates/microservices/` | `knowledge/stack-2025.md` |
| Game 2D | `templates/game-web/` | `knowledge/gaming/` |
| Game 3D | `templates/webxr-experience/` | `knowledge/gaming/` |
| Mobile | `templates/mobile/` | `knowledge/stack-2025.md` |
| Desktop | `templates/tauri-app/` | `knowledge/stack-2025.md` |
| AI Agent | `templates/ai-*/` (41 variants) | `knowledge/autonomous-agents-guide.md` |
| RAG | `templates/rag-*/` (23 variants) | `knowledge/graphrag-patterns.md` |
| Clone of X | `config/template-sources.json` | `knowledge/clone-wars-catalog.md` |
| Sector-specific | `templates/{restaurant,real-estate,wedding,...}` | `knowledge/industry-patterns.md` |
| Team multi-agents | `templates/team-*/` (13 variants) | `knowledge/autonomous-agents-guide.md` |

## Library Root

`C:\Users\arnau\Desktop\ATUM CREA\library\`

All templates are in `library/templates/`. Read `library/knowledge/INDEX.md` first to discover relevant knowledge files.
