# SDD Patterns - Spec-Driven Development Reference

> **Version**: 1.0.0
> **Source**: GitHub Spec Kit, Thoughtworks, Amazon Kiro
> **Integration**: ULTRA-CREATE v28.6

---

## Overview

Spec-Driven Development (SDD) est un paradigme de developpement ou les specifications
deviennent executables. Au lieu de transformer directement le langage naturel en code
(vibe coding pur), SDD ajoute une couche de specifications structurees qui:

1. **Eliminent l'ambiguite** avant l'implementation
2. **Tracent** les requirements jusqu'au code
3. **Generent** des tests depuis les acceptance criteria
4. **Permettent** la maintenance long-terme

---

## Core Principles

### 1. Specification Authority (Article IV)

```
Source of Truth: Spec → Code → Tests

WRONG:
  User request → Code → "Maybe some tests"

RIGHT:
  User request → Spec (WHAT) → Plan (HOW) → Tests → Code
```

### 2. Test-First Imperative (Article III)

```
RED-GREEN-VERIFY Loop:

1. RED:    Write test that fails
           test("user can subscribe to notifications", () => {
             expect(subscribe(userId)).toResolve();
           })

2. GREEN:  Write minimal code to pass
           async function subscribe(userId) {
             return db.subscriptions.create({ userId });
           }

3. VERIFY: Validate against spec acceptance criteria
           AC-1.1: User can subscribe ✓
           AC-1.2: Duplicate subscription prevented ?
```

### 3. Uncertainty Marking (Article V)

```markdown
## Clarifications Needed

- [NEEDS CLARIFICATION] What happens when user is offline?
  → RESOLVED: Queue notifications, deliver on reconnect (max 24h)

- [ASSUMPTION] Notifications expire after 7 days
  → Rationale: Industry standard, reduces storage

- [RISK] WebSocket connections may timeout on mobile
  → Mitigation: Implement heartbeat + automatic reconnection
```

---

## Workflow Patterns

### Pattern 1: Feature Specification Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CAPTURE                                                   │
│    User: "I want push notifications"                        │
│    → Parse intent, identify scope                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CLARIFY                                                   │
│    - Web or mobile?                                          │
│    - Real-time or batch?                                     │
│    - What notification types?                                │
│    → Mark [NEEDS CLARIFICATION] for unknowns                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. SPECIFY                                                   │
│    User Stories:                                             │
│    - US-1: Subscribe to notifications                        │
│    - US-2: Receive real-time alerts                          │
│    - US-3: Manage notification preferences                   │
│    → Each US has Acceptance Criteria                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. PLAN                                                      │
│    Architecture: WebSocket server + Redis pub/sub            │
│    Data Model: subscriptions, notifications, preferences     │
│    APIs: POST /subscribe, WS /notifications                  │
│    → Validate against Constitution                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. DECOMPOSE                                                 │
│    T1: Setup WebSocket infrastructure                        │
│    T2: Implement subscription API [PARALLEL]                 │
│    T3: Implement notification delivery [PARALLEL]            │
│    T4: Add preferences management                            │
│    T5: Integration tests                                     │
│    → Mark parallelizable tasks                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. IMPLEMENT                                                 │
│    For each task:                                            │
│    - Write failing test (RED)                                │
│    - Write code (GREEN)                                      │
│    - Verify against AC (VERIFY)                              │
│    → Iterate until all AC pass                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. VERIFY                                                    │
│    - All AC checkboxes validated                             │
│    - NFRs measured (latency, throughput)                     │
│    - Constitution compliance confirmed                       │
│    → Generate verification report                            │
└─────────────────────────────────────────────────────────────┘
```

### Pattern 2: Acceptance Criteria Design

```markdown
## Bad AC (Not Testable)

- [ ] System should be fast
- [ ] User experience should be good
- [ ] Security should be implemented

## Good AC (Testable)

- [ ] AC-1.1: Response time < 100ms at P95
- [ ] AC-1.2: User can complete subscription in < 3 clicks
- [ ] AC-1.3: All endpoints require authentication token
- [ ] AC-1.4: Invalid tokens return 401 with error message
```

### Pattern 3: Task Parallelization

```
Dependency Graph Analysis:

T1 (Setup) ─────┬──▶ T2 (API)     ─┬──▶ T5 (Integration)
                │                   │
                ├──▶ T3 (WebSocket)─┤
                │                   │
                └──▶ T4 (Tests)    ─┘    [Can start early]

Parallel Batches:
  Batch 1: T1 (sequential - foundation)
  Batch 2: T2, T3, T4 (parallel - after T1)
  Batch 3: T5 (sequential - after Batch 2)

Speedup: 5 tasks → 3 batches = 40% faster
```

---

## Constitution Patterns

### Pattern 4: Technology Stack Declaration

```markdown
## Technology Stack

| Layer | Technology | Version | Rationale |
|-------|------------|---------|-----------|
| Frontend | Next.js | 15.x | SSR + App Router |
| Backend | Hono | 4.x | Edge-ready, fast |
| Database | PostgreSQL | 16.x | ACID, JSON support |
| Cache | Redis | 7.x | Pub/sub for real-time |
| Testing | Vitest | 2.x | Fast, ESM native |

## Non-Negotiables

1. TypeScript strict mode enabled
2. All API endpoints have OpenAPI specs
3. Database migrations are versioned
4. No runtime dependencies > 1MB
```

### Pattern 5: Article Compliance Checklist

```markdown
## Pre-Implementation Checklist

### Article I: Library-First
- [ ] Feature extractable as standalone package?
- [ ] No framework coupling in core logic?
- [ ] Clear public API defined?

### Article II: CLI Interface
- [ ] --help implemented?
- [ ] --json output available?
- [ ] Exit codes documented?

### Article III: Test-First
- [ ] Test file created before implementation?
- [ ] All AC have corresponding tests?
- [ ] No code merged without passing tests?

### Article VII: Integration Testing
- [ ] Tests use real database (not mocks)?
- [ ] E2E tests against actual services?
- [ ] Mock usage documented if necessary?
```

---

## Data Model Patterns

### Pattern 6: Schema Evolution

```sql
-- Migration: 001_create_notifications
-- Feature: 001-push-notifications

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT unique_user_endpoint UNIQUE (user_id, endpoint)
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id),
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_status ON notifications(status)
WHERE status = 'pending';
```

### Pattern 7: TypeScript Type Generation

```typescript
// Generated from data model spec
// Feature: 001-push-notifications

export interface Subscription {
  id: string;
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: Date;
}

export interface Notification {
  id: string;
  subscriptionId: string;
  payload: NotificationPayload;
  status: 'pending' | 'sent' | 'failed';
  sentAt: Date | null;
  createdAt: Date;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  data?: Record<string, unknown>;
}
```

---

## Testing Patterns

### Pattern 8: AC-to-Test Mapping

```typescript
// spec.md
// AC-1.1: User can subscribe with valid credentials
// AC-1.2: Duplicate subscription returns existing record
// AC-1.3: Invalid endpoint returns 400 error

// subscription.test.ts
describe('Subscription API', () => {
  // AC-1.1
  test('creates subscription with valid credentials', async () => {
    const response = await api.post('/subscribe', validPayload);
    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
  });

  // AC-1.2
  test('returns existing subscription for duplicate', async () => {
    await api.post('/subscribe', validPayload);
    const response = await api.post('/subscribe', validPayload);
    expect(response.status).toBe(200);
    expect(response.body.created).toBe(false);
  });

  // AC-1.3
  test('rejects invalid endpoint with 400', async () => {
    const response = await api.post('/subscribe', { ...validPayload, endpoint: 'invalid' });
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('endpoint');
  });
});
```

### Pattern 9: Integration Test Structure

```typescript
// Following Article VII: Real environments

import { createTestDatabase, seedTestData, cleanupTestDatabase } from './helpers';

describe('Notification Delivery (Integration)', () => {
  let db: Database;
  let wsServer: WebSocketServer;

  beforeAll(async () => {
    // Real database, not mock
    db = await createTestDatabase();
    wsServer = await startTestWebSocketServer();
  });

  afterAll(async () => {
    await cleanupTestDatabase(db);
    await wsServer.close();
  });

  test('delivers notification via WebSocket in real-time', async () => {
    // Setup: Real subscription in real database
    const subscription = await db.subscriptions.create(testSubscription);

    // Connect: Real WebSocket connection
    const ws = new WebSocket(`ws://localhost:${wsServer.port}`);
    const received = new Promise(resolve => ws.on('message', resolve));

    // Trigger: Send real notification
    await notificationService.send(subscription.id, testPayload);

    // Verify: Real message received
    const message = await received;
    expect(JSON.parse(message)).toMatchObject(testPayload);
  });
});
```

---

## Verification Patterns

### Pattern 10: Verification Report Generation

```markdown
# Verification Report: 001-push-notifications

## Summary
| Metric | Value |
|--------|-------|
| Total AC | 12 |
| Passed | 11 |
| Failed | 1 |
| Pass Rate | 91.7% |

## Failed Criteria

### AC-2.3: Notification delivery under 100ms at P95

**Expected**: < 100ms
**Actual**: 127ms
**Root Cause**: Database query not indexed
**Fix**: Add index on notifications.subscription_id
**Retest Required**: Yes

## Recommendation

CONDITIONAL APPROVAL
- Fix AC-2.3 performance issue
- Rerun performance tests
- Update verification report
```

---

## Anti-Patterns

### Anti-Pattern 1: Spec After Code

```
WRONG:
  1. Write code based on understanding
  2. Discover edge cases during development
  3. Retroactively document as "spec"

RIGHT:
  1. Write spec with all edge cases
  2. Get approval before coding
  3. Code implements spec exactly
```

### Anti-Pattern 2: Vague Acceptance Criteria

```
WRONG:
  - [ ] System handles errors gracefully

RIGHT:
  - [ ] AC-3.1: Network timeout returns 504 with retry-after header
  - [ ] AC-3.2: Invalid payload returns 400 with field-level errors
  - [ ] AC-3.3: Server error returns 500 and logs stack trace
  - [ ] AC-3.4: All errors include correlation ID for debugging
```

### Anti-Pattern 3: Ignoring Constitution

```
WRONG:
  "Let's skip tests for this hotfix, we'll add them later"
  → Violates Article III

RIGHT:
  "Hotfix requires expedited process. Writing minimal test
   that covers the fix, full test suite update tracked in
   follow-up task T-XXX."
```

---

## Integration with ULTRA-CREATE

### Hindsight Integration

```javascript
// After spec creation
hindsight_retain({
  bank: 'patterns',
  content: `SDD Spec Pattern: ${featureName}
    User Stories: ${userStories.length}
    Acceptance Criteria: ${acCount}
    Complexity: ${complexity}`
});

// Before planning
hindsight_recall({
  bank: 'patterns',
  query: 'SDD similar feature',
  top_k: 3
});
```

### Context7 Integration

```javascript
// During technical planning
context7__resolve-library-id({ libraryName: 'web-push' });
context7__get-library-docs({
  libraryId: 'web-push',
  topic: 'VAPID keys setup'
});
```

### Agent Synergy

```yaml
sdd-workflow:
  primary: spec-architect
  collaborators:
    - wizard-agent      # Clarification
    - pm-agent          # Prioritization
    - tester            # Test generation
    - database-architect # Data model review
  mcps: [hindsight, context7, github]
```

---

## Metrics & Benefits

### Quality Improvement

| Metric | Without SDD | With SDD | Improvement |
|--------|-------------|----------|-------------|
| Bugs in Production | 15/release | 5/release | -67% |
| Rework Rate | 30% | 10% | -67% |
| Code Review Cycles | 3.2 avg | 1.4 avg | -56% |
| Time to First Deploy | 2 weeks | 3 weeks | +50% |
| Long-term Maintenance | High cost | Low cost | -40% |

### When to Use SDD

| Scenario | Recommended? |
|----------|--------------|
| New complex feature (>3 components) | Yes |
| Simple bug fix | No |
| Refactoring existing code | Partial (spec changes) |
| External API integration | Yes |
| UI component addition | Depends on complexity |
| Performance optimization | Partial (NFR spec) |

---

## Quick Reference

### Commands

| Command | Output |
|---------|--------|
| `/spec init [name]` | specs/constitution.md |
| `/spec feature [desc]` | specs/NNN-feature/spec.md |
| `/spec plan` | plan.md, data-model.md |
| `/spec tasks` | tasks.md |
| `/spec implement` | Code + Tests |
| `/spec verify` | verification-report.md |

### Markers

| Marker | Meaning |
|--------|---------|
| `[NEEDS CLARIFICATION]` | Must resolve before implementation |
| `[ASSUMPTION]` | Decision made, document rationale |
| `[RISK]` | Potential issue, needs mitigation |
| `[PARALLEL]` | Task can run concurrently |
| `[DEPENDS: Tn]` | Blocked by task Tn |

---

*SDD Patterns v1.0 - Part of ULTRA-CREATE v28.6*
*"First, make it clear. Then, make it work. Finally, make it fast."*
