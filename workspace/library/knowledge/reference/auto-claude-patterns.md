# Auto-Claude Patterns Reference - ULTRA-CREATE v27.8

> Patterns extracted from [Auto-Claude](https://github.com/AndyMik90/Auto-Claude) v2.7.2
> Integrated into ULTRA-CREATE for autonomous reliability improvements.

---

## Pattern Index

| ID | Pattern Name | CMP Score | Status | File |
|----|--------------|-----------|--------|------|
| P1 | Post-Session Processing | 8.5 | Implemented | `session-processor.js` |
| P2 | Hierarchical Task Decomposition | 8.2 | Planned | `config/task-schema.json` |
| P3 | Circular Fix Detection | 8.0 | Implemented | `self-healing-hook.js` |
| P4 | Dual-Layer Memory | 7.5 | Implemented | `memory-first.js` |
| P5 | Dynamic Command Allowlisting | 7.2 | Planned | `stack-detector.js` |
| P6 | Complexity-Based Phase Selection | 6.8 | Planned | `complexity-assessor.md` |
| P7 | Git Worktree per Task | 5.5 | Planned | `worktree-manager.js` |
| P8 | AI + Auto Conflict Resolution | 5.2 | Planned | - |
| P9 | Security Scanner Gate | 5.0 | Planned | `security-gate.js` |

---

## TIER 1: Highest Impact (CMP 8.0+)

### P1: Post-Session Processing (CMP 8.5)

**Problem Solved**: ULTRA-CREATE relied on agents to self-report completion, which causes drift.

**Solution**: All verification happens in Node.js (100% reliable), not agent-dependent.

**Implementation**: `scripts/hooks/session-processor.js`

```javascript
// Key features:
- Verify task completion independently (file/test checks)
- Extract insights from session activity
- Save learnings to Hindsight memory
- Record good commits for rollback safety

// Usage:
const sessionProcessor = require('./session-processor.js');
sessionProcessor.init();  // Start of session
// ... work happens ...
await sessionProcessor.processEnd(projectPath);  // End of session
```

**Integration Points**:
- Called by `session-end.js` hook
- Writes to Hindsight `patterns` bank
- Records commits to `~/.ultra-create/good-commits.json`

---

### P2: Hierarchical Task Decomposition (CMP 8.2)

**Problem Solved**: ULTRA-CREATE has flat task lists without dependencies.

**Solution**: 3-level hierarchy: Spec -> Phases -> Subtasks with `depends_on`.

**Implementation**: `config/task-schema.json` (Planned)

```javascript
TASK_SCHEMA = {
  workflow_type: "feature|refactor|investigation",
  phases: [{
    id: 1,
    name: "Phase name",
    depends_on: [],  // Phase IDs that must complete first
    parallel_safe: false,
    subtasks: [{
      id: "unique-id",
      description: "What to do",
      expected_output: "How to verify",
      status: "pending|in_progress|completed"
    }]
  }],
  final_acceptance: ["Criterion 1", "Criterion 2"]
}
```

**Benefits**:
- Explicit dependencies prevent race conditions
- `expected_output` enables automated verification
- `parallel_safe` flag for concurrent execution

---

### P3: Circular Fix Detection (CMP 8.0)

**Problem Solved**: ULTRA-CREATE could loop infinitely on the same error.

**Solution**: Jaccard similarity on recent fix attempts.

**Implementation**: `scripts/hooks/self-healing-hook.js` (v27.8)

```javascript
// Algorithm:
// If 2+ of last 3 attempts share >30% keywords -> CIRCULAR

function detectCircularFix(errorSignature, currentApproach) {
  const attempts = circularFixBuffer.attempts.get(errorSignature) || [];
  const currentKeywords = extractKeywords(currentApproach);
  const recentAttempts = attempts.slice(-3);

  let similarCount = 0;
  for (const attempt of recentAttempts) {
    const similarity = jaccardSimilarity(currentKeywords, attempt.keywords);
    if (similarity >= 0.3) similarCount++;
  }

  return similarCount >= 2;  // CIRCULAR if true
}
```

**Configuration**:
```javascript
CONFIG.circularDetection = {
  enabled: true,
  windowSize: 3,           // Check last N attempts
  similarityThreshold: 0.3, // 30% keyword overlap
  minSimilarCount: 2,      // Min similar attempts
  maxAttemptsPerError: 5   // Force escalation limit
}
```

**Escalation Behavior**:
- When circular detected, returns `action: 'escalate'`
- Provides human-readable recommendation
- Lists previous approaches tried
- Suggests alternative strategies

---

## TIER 2: High Value (CMP 6.0-7.9)

### P4: Dual-Layer Memory (CMP 7.5)

**Problem Solved**: Hindsight failure = total memory loss.

**Solution**: Primary (Hindsight) + file-based fallback with auto-sync.

**Implementation**: `scripts/hooks/memory-first.js` (v27.8)

```javascript
// Storage hierarchy:
// 1. Primary: Hindsight MCP (semantic search)
// 2. Fallback: ~/.ultra-create/memories/*.json

// When Hindsight unavailable:
const fallbackResults = searchFallback(bank, query, topK);

// Auto-sync when Hindsight recovers:
await syncQueueToHindsight();  // Processes queued memories
```

**File Structure**:
```
~/.ultra-create/memories/
  errors.json        # Error patterns and solutions
  patterns.json      # Code patterns
  _sync_queue.json   # Pending memories for Hindsight
```

**Configuration**:
```javascript
FALLBACK_CONFIG = {
  enabled: true,
  baseDir: '~/.ultra-create/memories',
  maxQueueSize: 1000,
  syncBatchSize: 10,
  autoSyncInterval: 300000  // 5 minutes
}
```

---

### P5: Dynamic Command Allowlisting (CMP 7.2)

**Problem Solved**: Safety Net is static, doesn't adapt to project type.

**Solution**: Detect stack -> allow stack-specific commands.

**Implementation**: `scripts/hooks/stack-detector.js` (Planned)

```javascript
// Stack Detection -> Command Registry
if ("typescript" in detected_stack) {
  allow(["npm", "npx", "tsc", "eslint"])
}
if ("python" in detected_stack) {
  allow(["pip", "python", "pytest", "black"])
}
if ("rust" in detected_stack) {
  allow(["cargo", "rustc", "clippy"])
}
```

**Detection Sources**:
- `package.json` -> Node.js/TypeScript
- `pyproject.toml` / `requirements.txt` -> Python
- `Cargo.toml` -> Rust
- `go.mod` -> Go

---

### P6: Complexity-Based Phase Selection (CMP 6.8)

**Problem Solved**: Same workflow for trivial and complex tasks.

**Solution**: AI assesses complexity -> selects appropriate phases.

**Implementation**: `agents/meta/complexity-assessor.md` (Planned)

| Complexity | Files | Phases |
|------------|-------|--------|
| Simple | 1-2 | Discovery -> Quick Spec -> Validate |
| Standard | 3-10 | Full 6-phase workflow |
| Complex | 10+ | 8-phase + research + self-critique |

```javascript
// Assessment criteria:
- Number of files affected
- Cross-cutting concerns (auth, DB, API)
- External dependencies
- Test coverage requirements
- Breaking change potential
```

---

## TIER 3: Quality Improvements (CMP 4.0-5.9)

### P7: Git Worktree per Task (CMP 5.5)

**Problem Solved**: Multiple tasks can conflict on same branch.

**Solution**: Isolate each task in separate worktree.

```bash
# Structure:
.ultra-create/worktrees/tasks/
  task-abc123/   # Worktree for task abc123
  task-def456/   # Worktree for task def456

# Branch convention:
ultra-create/agent-{id}/{task-name}
```

---

### P8: AI + Auto Conflict Resolution (CMP 5.2)

**Problem Solved**: Merge conflicts block autonomous operation.

**Solution**: Tiered conflict resolution.

```
1. Auto-merge: Simple conflicts (whitespace, imports)
2. AI resolver: Semantic conflicts (code changes)
3. Human review: Complex/ambiguous conflicts
```

---

### P9: Security Scanner Gate (CMP 5.0)

**Problem Solved**: Security vulnerabilities merged without review.

**Solution**: Run security scan before merge.

```javascript
// Pre-merge checks:
- npm audit (JavaScript)
- pip-audit (Python)
- cargo audit (Rust)
- bandit (Python static analysis)

// Block on:
- Critical vulnerabilities
- High severity with known exploits
```

---

## Integration Guide

### Enabling Patterns

All implemented patterns are enabled by default. To configure:

```javascript
// self-healing-hook.js - Circular Fix Detection
CONFIG.circularDetection.enabled = true;
CONFIG.circularDetection.maxAttemptsPerError = 5;

// memory-first.js - Dual-Layer Memory
FALLBACK_CONFIG.enabled = true;

// session-processor.js - Post-Session Processing
CONFIG.verification.checkBuild = true;
CONFIG.verification.checkTests = true;
```

### Hook Priority Order

1. `memory-first.js` (priority: 1) - Recall before action
2. `self-healing-hook.js` (priority: 2) - Error detection/fix
3. `session-processor.js` (priority: 99) - End of session

### Monitoring

```javascript
// Check circular fix status
const { circularFixBuffer } = require('./self-healing-hook.js');
console.log(circularFixBuffer.attempts.size);  // Active error signatures

// Check memory fallback status
const memoryFirst = require('./memory-first.js');
console.log(memoryFirst.fallback.getSyncStatus());

// Check session status
const sessionProcessor = require('./session-processor.js');
console.log(sessionProcessor.getSessionState());
```

---

## Source Reference

- **Repository**: https://github.com/AndyMik90/Auto-Claude
- **Version Analyzed**: 2.7.2 (develop branch)
- **Key Files Studied**:
  - `apps/backend/agents/session.py` (400+ lines)
  - `apps/backend/services/recovery.py` (450+ lines)
  - `apps/backend/core/worktree.py` (620+ lines)
  - `apps/backend/implementation_plan/*.py`
  - `CLAUDE.md` (17KB instructions)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v27.8 | 2026-01-07 | Initial Auto-Claude patterns (P1, P3, P4) |

---

*ULTRA-CREATE v27.8 "AUTO-CLAUDE PATTERNS" | 3 Patterns Implemented | CMP-Prioritized*
