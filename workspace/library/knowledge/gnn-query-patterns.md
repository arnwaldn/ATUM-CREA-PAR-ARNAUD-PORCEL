# GNN Query Refinement Patterns - ULTRA-CREATE v27.13

> Inspired by: ruvnet/agentic-flow GNN Query Refinement (+12.4% recall)

## Purpose

Enrich Hindsight queries with semantically related terms to improve recall.

## Pattern Mappings

### Error/Debug Patterns
```yaml
stripe:
  - webhook, signature, verification, checkout, payment_intent
  - customer, subscription, billing, invoice
  - error, failed, declined, invalid

react:
  - hook, useState, useEffect, component, render
  - props, state, context, ref, memo
  - error, boundary, hydration, suspense

next:
  - page, api, route, middleware, server
  - getServerSideProps, getStaticProps, ISR
  - error, 404, 500, hydration

prisma:
  - schema, model, relation, migration
  - query, findMany, create, update, delete
  - error, constraint, unique, foreign_key

supabase:
  - auth, user, session, token
  - storage, bucket, upload, download
  - realtime, subscribe, channel
  - error, policy, rls, permission
```

### Project Type Patterns
```yaml
saas:
  - subscription, billing, payment, stripe
  - auth, user, tenant, organization
  - dashboard, analytics, metrics
  - pricing, plan, tier, feature

ecommerce:
  - product, cart, checkout, order
  - inventory, stock, shipping, delivery
  - payment, stripe, paypal, checkout
  - customer, review, rating

landing:
  - hero, cta, testimonial, pricing
  - responsive, mobile, animation
  - seo, meta, og, social
  - conversion, analytics

game:
  - scene, sprite, physics, collision
  - input, keyboard, mouse, touch
  - audio, music, sfx, asset
  - level, score, leaderboard
```

### Feature Patterns
```yaml
auth:
  - login, register, signup, logout
  - password, reset, forgot, verify
  - session, token, jwt, oauth
  - 2fa, mfa, otp, magic_link

payment:
  - stripe, checkout, payment_intent
  - subscription, recurring, billing
  - webhook, invoice, refund
  - customer, card, method

upload:
  - file, image, video, document
  - storage, bucket, presigned
  - progress, chunk, multipart
  - validation, size, type, mime

search:
  - query, filter, sort, pagination
  - index, fulltext, fuzzy, autocomplete
  - facet, aggregation, highlight
```

### Framework Best Practices
```yaml
nextjs:
  - app_router, pages_router, layout
  - server_component, client_component
  - metadata, seo, opengraph
  - caching, revalidation, isr

tailwind:
  - utility, responsive, dark_mode
  - custom, extend, plugin
  - animation, transition, gradient

shadcn:
  - component, variant, slot
  - dialog, dropdown, form
  - toast, alert, card
```

## Expansion Algorithm

```javascript
function expandQuery(query, context) {
  const words = query.toLowerCase().split(/\s+/);
  const expanded = new Set(words);

  // Add related terms from patterns
  for (const word of words) {
    const related = PATTERN_MAPPINGS[word] || [];
    related.forEach(term => expanded.add(term));
  }

  // Weight by context
  if (context.action === 'debug') {
    expanded.add('error');
    expanded.add('fix');
    expanded.add('solution');
  }

  return Array.from(expanded).join(' ');
}
```

## Usage

```javascript
// Before: "stripe webhook error"
// After:  "stripe webhook error signature verification checkout payment_intent failed"
// Result: +12% recall improvement
```

## Version

- v27.13 (11 Jan 2026): Initial implementation
- Inspired by: ruvnet/agentic-flow GNN implementation
