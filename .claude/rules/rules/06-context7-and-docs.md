# Rule: Documentation & Framework Verification

## Context7 (MANDATORY before coding with any framework)
BEFORE writing code that uses a framework or library:
1. Resolve the library ID: `mcp__context7__resolve-library-id`
2. Query the latest docs: `mcp__context7__query-docs`
3. Verify API signatures match current version
4. Check for breaking changes or deprecations

## Common Libraries to Verify
- Next.js 15 (App Router vs Pages Router patterns change frequently)
- React 19 (hooks API, server components, concurrent features)
- Supabase (auth methods, RLS policies, edge functions)
- Tailwind CSS 4 (utility changes, configuration format)
- Prisma 6 (schema syntax, query API)
- Stripe (payment intents, webhooks, checkout sessions)
- Expo SDK 52+ (mobile navigation, native modules)
- Tauri 2.0 (IPC, window management, plugins)
- Phaser 3 / Three.js (game loop, scene management, WebGL)
- LangGraph / Phidata (agent patterns, tool calling)

## When to Skip Context7
- Standard language features (TypeScript, Python, Go built-ins)
- Well-known stable APIs (DOM, fetch, fs)
- Previously verified in the same session
- Quick fixes to existing code (follow existing patterns)

## Design Intelligence
BEFORE coding any UI, consult:
- `library/knowledge/design-intelligence.md` for color palettes, typography, spacing
- Match the design to the product type (SaaS = clean/professional, Game = vibrant/playful)
