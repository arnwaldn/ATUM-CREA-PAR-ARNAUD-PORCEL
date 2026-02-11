# Devin-Style Autonomous AI Patterns

## Overview

Patterns et stratégies pour créer une IA de développement autonome comparable à Devin, capable de travailler en arrière-plan avec un minimum d'intervention humaine.

---

## CORE PRINCIPLES

### 1. Background-First Execution

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TRADITIONAL vs DEVIN-STYLE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  TRADITIONAL (Blocking)              DEVIN-STYLE (Non-Blocking)             │
│                                                                              │
│  User: "Create app"                  User: "Create app"                     │
│    ↓                                   ↓                                     │
│  Wait... (10 min)                    AI: "Got it! Working in background."   │
│    ↓                                   ↓                                     │
│  "Done!"                             User continues other work               │
│                                        ↓                                     │
│                                      [Progress updates appear]               │
│                                        ↓                                     │
│                                      AI: "Done! Here's your app."           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key Implementation:**
```typescript
// Non-blocking task submission
function submitTask(task: Task): TaskHandle {
  const handle = createTaskHandle(task)

  // Start in background immediately
  queueMicrotask(() => executeInBackground(task, handle))

  // Return immediately to user
  return handle
}
```

### 2. Self-Recovery Loop

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SELF-RECOVERY LOOP                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐               │
│  │ EXECUTE│────►│  ERROR  │────►│ ANALYZE │────►│ RECOVER │               │
│  └────────┘     └─────────┘     └─────────┘     └────┬────┘               │
│       ▲                                              │                      │
│       │                                              │                      │
│       │         ┌─────────────────────────────────────┘                      │
│       │         │                                                            │
│       │         ▼                                                            │
│       │    ┌─────────┐                                                      │
│       │    │ Strategy │                                                      │
│       │    └────┬────┘                                                      │
│       │         │                                                            │
│       │    ┌────┴────────────────────────────────────────┐                  │
│       │    │                                              │                  │
│       │    ▼              ▼              ▼               ▼                  │
│       │ ┌──────┐    ┌──────────┐   ┌──────────┐   ┌──────────┐            │
│       │ │RETRY │    │ROLLBACK  │   │ALTERNATE │   │ESCALATE  │            │
│       │ └──┬───┘    └────┬─────┘   └────┬─────┘   └────┬─────┘            │
│       │    │             │              │              │                    │
│       └────┴─────────────┴──────────────┘              │                    │
│                                                        ▼                    │
│                                                   ┌──────────┐              │
│                                                   │ASK USER  │              │
│                                                   └──────────┘              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Recovery Strategies:**

| Error Type | Strategy | Max Attempts | Example |
|------------|----------|--------------|---------|
| Network timeout | Retry with backoff | 5 | API call failed |
| Validation error | Fix and retry | 3 | Invalid input format |
| Resource limit | Wait and retry | 10 | Rate limited |
| Missing dependency | Auto-install | 1 | npm package not found |
| Compile error | Self-correct code | 3 | TypeScript error |
| Test failure | Debug and fix | 3 | Unit test failed |
| Permission denied | Escalate | 1 | Needs user approval |

### 3. Continuous Progress Reporting

```typescript
interface ProgressReport {
  // What's happening now
  currentTask: string
  currentStep: string

  // Overall progress
  totalProgress: number    // 0-100
  phase: 'setup' | 'coding' | 'testing' | 'deploying'

  // Time estimates
  elapsedTime: number      // seconds
  estimatedRemaining: number

  // Artifacts produced
  filesCreated: number
  linesOfCode: number
  testsWritten: number

  // Health indicators
  errors: number
  warnings: number
  autoFixes: number
}

// Stream updates
async function* streamProgress(taskId: string): AsyncGenerator<ProgressReport> {
  while (taskNotComplete(taskId)) {
    yield getCurrentProgress(taskId)
    await sleep(1000)  // Update every second
  }
  yield getFinalReport(taskId)
}
```

---

## AUTONOMOUS DECISION MAKING

### Decision Tree Pattern

```typescript
interface Decision {
  situation: string
  options: Option[]
  selectedOption: Option
  reasoning: string
  confidence: number
  reversible: boolean
}

interface Option {
  name: string
  pros: string[]
  cons: string[]
  risk: 'low' | 'medium' | 'high'
}

// Example: Choosing auth provider
const authDecision: Decision = {
  situation: "Project needs authentication",
  options: [
    {
      name: "Clerk",
      pros: ["Full-featured", "Easy setup", "Social logins included"],
      cons: ["External dependency", "Pricing at scale"],
      risk: "low"
    },
    {
      name: "NextAuth",
      pros: ["Open source", "Flexible", "Self-hosted"],
      cons: ["More setup", "DIY features"],
      risk: "medium"
    },
    {
      name: "Custom JWT",
      pros: ["Full control", "No dependencies"],
      cons: ["Security risk", "Much more work"],
      risk: "high"
    }
  ],
  selectedOption: { name: "Clerk", /* ... */ },
  reasoning: "Clerk provides the best balance of features and setup speed for SaaS applications",
  confidence: 95,
  reversible: true
}
```

### Autonomous Thresholds

```typescript
interface AutonomyLevel {
  // Decisions AI can make without asking
  autonomous: {
    codeStyle: true        // Formatting, naming conventions
    libraryChoice: true    // Within approved list
    fileStructure: true    // Standard patterns
    testCoverage: true     // More tests is always OK
    performance: true      // Optimizations
  }

  // Decisions requiring confirmation
  needsConfirmation: {
    majorDependency: true  // New major library
    architectureChange: true
    dataModel: true        // Database schema
    externalService: true  // Third-party APIs
    costImpact: true       // Paid services
  }

  // Always ask user
  requiresApproval: {
    deployment: true
    payment: true
    userDataAccess: true
    securityConfig: true
    irreversibleAction: true
  }
}
```

---

## STATE PERSISTENCE

### Checkpoint System

```typescript
interface Checkpoint {
  id: string
  taskId: string
  timestamp: Date

  // Current state
  phase: string
  completedSteps: string[]
  pendingSteps: string[]

  // Artifacts
  files: FileSnapshot[]
  database: DatabaseSnapshot | null

  // Context
  decisions: Decision[]
  errors: Error[]
  logs: LogEntry[]

  // Recovery info
  resumeFrom: string
  rollbackTo: string | null
}

// Create checkpoint after each major step
async function createCheckpoint(task: Task): Promise<Checkpoint> {
  const checkpoint: Checkpoint = {
    id: generateId(),
    taskId: task.id,
    timestamp: new Date(),
    phase: task.currentPhase,
    completedSteps: task.completedSteps,
    pendingSteps: task.remainingSteps,
    files: await snapshotFiles(task.workdir),
    database: task.hasDatabase ? await snapshotDatabase() : null,
    decisions: task.decisions,
    errors: task.errors,
    logs: task.logs.slice(-100),
    resumeFrom: task.currentStep,
    rollbackTo: task.lastSuccessfulStep
  }

  await persistCheckpoint(checkpoint)
  return checkpoint
}

// Resume from checkpoint (session crash recovery)
async function resumeFromCheckpoint(checkpointId: string): Promise<void> {
  const checkpoint = await loadCheckpoint(checkpointId)

  // Restore state
  await restoreFiles(checkpoint.files)
  if (checkpoint.database) {
    await restoreDatabase(checkpoint.database)
  }

  // Continue execution
  await executeFromStep(checkpoint.resumeFrom, checkpoint)
}
```

---

## LEARNING LOOP

### Pattern Recognition

```typescript
interface LearnedPattern {
  id: string
  type: 'error' | 'optimization' | 'best-practice'

  // When this applies
  trigger: {
    context: string[]       // ["typescript", "prisma", "auth"]
    condition: string       // "Missing Prisma client after generate"
  }

  // What we learned
  lesson: {
    problem: string
    solution: string
    prevention: string
  }

  // Confidence
  occurrences: number
  successRate: number
  lastSeen: Date
}

// Learn from experience
async function learnFromExecution(task: Task): Promise<LearnedPattern[]> {
  const patterns: LearnedPattern[] = []

  for (const error of task.errors) {
    const existing = await findSimilarPattern(error)

    if (existing) {
      // Update existing pattern
      existing.occurrences++
      if (task.errorResolved(error)) {
        existing.successRate = updateSuccessRate(existing)
      }
      await persistPattern(existing)
    } else if (task.errorResolved(error)) {
      // Create new pattern
      const newPattern = createPatternFromError(error, task.resolution)
      patterns.push(newPattern)
      await persistPattern(newPattern)
    }
  }

  return patterns
}
```

### Proactive Prevention

```typescript
// Before executing, check for known issues
async function preflightCheck(task: Task): Promise<Warning[]> {
  const warnings: Warning[] = []
  const context = extractContext(task)

  // Load relevant patterns
  const patterns = await loadPatternsForContext(context)

  for (const pattern of patterns) {
    if (pattern.type === 'error' && pattern.occurrences >= 3) {
      // Known issue - apply prevention
      warnings.push({
        message: `Known issue detected: ${pattern.lesson.problem}`,
        prevention: pattern.lesson.prevention,
        autoApply: pattern.successRate > 0.9
      })

      if (pattern.successRate > 0.9) {
        await applyPrevention(task, pattern)
      }
    }
  }

  return warnings
}
```

---

## COMMUNICATION PATTERNS

### Minimal Interruption

```typescript
// Interrupt levels
enum InterruptLevel {
  NEVER = 0,        // Log only
  LOW = 1,          // Batch at end
  MEDIUM = 2,       // Periodic summary
  HIGH = 3,         // Major milestones
  CRITICAL = 4      // Immediate (errors, approvals)
}

interface Message {
  level: InterruptLevel
  content: string
  requiresResponse: boolean
  timeout?: number
}

// Only interrupt when necessary
function shouldInterrupt(message: Message): boolean {
  const userPreference = getUserInterruptPreference()
  return message.level >= userPreference || message.requiresResponse
}
```

### Structured Summaries

```markdown
## Task Complete: E-commerce Platform

### Executive Summary
Built a complete e-commerce platform with product catalog, cart, and Stripe checkout.
Total time: 12 minutes. No human intervention required.

### What Was Built
- 📄 47 files created
- 📝 4,200 lines of code
- ✅ 28 tests passing (92% coverage)
- 🚀 Ready for deployment

### Key Decisions Made
1. **Database**: PostgreSQL with Prisma (standard choice for e-commerce)
2. **Payments**: Stripe Checkout (simplest integration)
3. **UI**: shadcn/ui components (consistent with project style)

### Issues Resolved Automatically
- Fixed TypeScript strict mode errors (12 instances)
- Resolved missing dependency: added `@stripe/stripe-js`
- Corrected Prisma schema relation (Product → Category)

### Next Steps
1. Add your Stripe keys to `.env.local`
2. Run `npm run dev` to start
3. Visit `/admin` to add products

### Files Changed
<details>
<summary>Click to expand (47 files)</summary>
- src/app/page.tsx
- src/app/products/page.tsx
- ...
</details>
```

---

## SAFETY PATTERNS

### Sandbox Execution

```typescript
interface Sandbox {
  // Isolated environment
  workdir: string              // Temporary directory
  network: 'isolated' | 'limited' | 'full'
  filesystem: 'isolated' | 'project-only'

  // Resource limits
  maxCpu: number               // % CPU
  maxMemory: number            // MB
  maxDiskSpace: number         // MB
  maxExecutionTime: number     // seconds

  // Allowed operations
  allowedCommands: string[]    // Whitelist
  blockedPatterns: string[]    // Dangerous patterns
}

const defaultSandbox: Sandbox = {
  workdir: createTempDir(),
  network: 'limited',          // Only whitelisted domains
  filesystem: 'project-only',
  maxCpu: 50,
  maxMemory: 2048,
  maxDiskSpace: 1024,
  maxExecutionTime: 600,       // 10 minutes
  allowedCommands: ['npm', 'npx', 'node', 'git', 'prisma'],
  blockedPatterns: ['rm -rf /', 'sudo', 'curl | bash']
}
```

### Rollback Capability

```typescript
interface RollbackManager {
  // Create restore point
  createSnapshot(label: string): Promise<SnapshotId>

  // List available snapshots
  listSnapshots(): Promise<Snapshot[]>

  // Restore to snapshot
  rollback(snapshotId: SnapshotId): Promise<void>

  // Auto-rollback on failure
  executeWithRollback<T>(
    fn: () => Promise<T>,
    snapshotId: SnapshotId
  ): Promise<T>
}

// Usage
async function safeExecute(task: Task): Promise<Result> {
  const snapshot = await rollback.createSnapshot('before-task')

  try {
    const result = await executeTask(task)
    if (result.success) {
      return result
    } else {
      await rollback.rollback(snapshot)
      throw new Error('Task failed, rolled back')
    }
  } catch (error) {
    await rollback.rollback(snapshot)
    throw error
  }
}
```

---

## IMPLEMENTATION CHECKLIST

### Core Capabilities

- [ ] Background execution without blocking
- [ ] Real-time progress streaming
- [ ] Checkpoint/resume system
- [ ] Multi-level error recovery
- [ ] Decision logging and auditing
- [ ] Learning from past executions

### Safety Features

- [ ] Sandboxed execution environment
- [ ] Resource usage limits
- [ ] Rollback capability
- [ ] Human-in-the-loop for critical decisions
- [ ] Audit trail for all actions

### Communication

- [ ] Minimal interruption design
- [ ] Structured completion summaries
- [ ] Error escalation protocols
- [ ] Progress visualization

### Integration

- [ ] MCP Memory for persistence
- [ ] Git for version control
- [ ] CI/CD for deployment
- [ ] Monitoring for production

---

## METRICS

| Metric | Devin Benchmark | Our Target |
|--------|-----------------|------------|
| Task completion rate | 14% (SWE-bench) | > 50% |
| Human interventions | < 5 per task | < 1 per task |
| Self-recovery rate | Unknown | > 90% |
| Time to first result | Minutes | < 5 min |
| Background capability | Full | Full |

---

**Version:** 1.0
**Type:** Knowledge
**Related:** autonomous-executor.md, parallel-executor.md
