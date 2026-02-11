# Wave Execution Pattern

## Overview

The Wave->Checkpoint->Wave pattern optimizes parallel tool execution by grouping independent operations into "waves" with synchronization checkpoints.

**Performance**: 3.5x speedup vs sequential execution

---

## Pattern Structure

```
Wave 1: [Independent Operations] (parallel)
   |
   v
Checkpoint: [Analyze Results Together]
   |
   v
Wave 2: [Dependent Operations] (parallel)
   |
   v
Checkpoint: [Final Analysis]
```

---

## When to Use

### Good Use Cases
- Reading multiple files before analysis
- Searching across multiple patterns
- Running independent API calls
- Creating multiple independent files
- Running tests in parallel

### Bad Use Cases (Use Sequential Instead)
- Operations with dependencies
- File that must be read before edit
- API call that needs previous result
- Sequential data processing

---

## Implementation Examples

### Example 1: Code Analysis
```
Task: Understand auth system

Wave 1 (Read - Parallel):
  - Read src/auth/login.ts
  - Read src/auth/logout.ts
  - Read src/auth/session.ts
  - Read lib/supabase.ts

Checkpoint: Analyze all 4 files together
  - Identify patterns
  - Map dependencies
  - Note inconsistencies

Wave 2 (Search - Parallel):
  - Grep for "signIn" usage
  - Grep for "signOut" usage
  - Grep for "session" usage

Checkpoint: Synthesize findings
  - Complete flow documented
  - Issues identified
  - Recommendations ready
```

### Example 2: Feature Implementation
```
Task: Add dark mode toggle

Wave 1 (Research - Parallel):
  - Read existing theme context
  - Search for theme usage
  - Check shadcn theme docs (Context7)
  - Find OSS examples (GitHub)

Checkpoint: Design approach
  - Understand existing system
  - Choose implementation strategy

Wave 2 (Implement - Parallel):
  - Create ThemeToggle component
  - Update ThemeProvider
  - Add CSS variables

Checkpoint: Validate
  - All files created
  - No conflicts
  - Tests ready

Wave 3 (Test - Parallel):
  - Run unit tests
  - Run integration tests
  - Manual verification

Checkpoint: Final validation
  - All tests pass
  - Feature complete
```

### Example 3: Multi-File Edit
```
Task: Rename function across codebase

Wave 1 (Find - Parallel):
  - Grep for old function name
  - Grep for imports
  - Grep for type references

Checkpoint: Map all occurrences
  - List all files
  - Identify dependencies
  - Order by importance

Wave 2 (Edit - Parallel):
  - Edit file1.ts
  - Edit file2.ts
  - Edit file3.ts
  - Edit types.ts

Checkpoint: Verify
  - All changes applied
  - No missed occurrences
  - TypeScript compiles
```

---

## Wave Sizing Guidelines

| Operation Type | Max Per Wave | Rationale |
|----------------|--------------|-----------|
| File Reads | 5-10 | Context processing limit |
| Grep Searches | 3-5 | Result aggregation |
| File Edits | 3-5 | Conflict prevention |
| API Calls | 5-10 | Rate limiting |
| Test Runs | Unlimited | Independent |

---

## Checkpoint Actions

### Required at Each Checkpoint
1. **Aggregate Results**: Combine outputs from wave
2. **Analyze Together**: Look for patterns/conflicts
3. **Plan Next Wave**: Define next parallel operations
4. **Update State**: Track progress in TodoWrite

### Checkpoint Questions
- Did all operations succeed?
- Any conflicts or issues?
- What should the next wave do?
- Are we ready to proceed?

---

## File-Based Dependency Analysis

When orchestrating multiple tasks/issues in parallel, analyze which files each task touches to determine execution order automatically.

### Dependency Rules

| Condition | Execution | Rationale |
|-----------|-----------|-----------|
| Tasks touch **different files** | **Parallel** | No conflict risk |
| Tasks touch **same file** | **Sequential** | Prevent merge conflicts |
| Task B has explicit `dependsOn: [A]` | **Wait for A** | Logical dependency |
| Phase N+1 depends on Phase N | **Phase gate** | All Phase N tasks must complete first |

### Dependency Analysis Workflow

```
Step 1: List all tasks with their impacted files
  Task A → [src/auth.ts, src/types.ts]
  Task B → [src/dashboard.tsx, src/api/users.ts]
  Task C → [src/auth.ts, src/middleware.ts]

Step 2: Build conflict matrix
  A ∩ B = {} → PARALLEL OK
  A ∩ C = {src/auth.ts} → SEQUENTIAL (A before C)
  B ∩ C = {} → PARALLEL OK

Step 3: Execution plan
  Wave 1: Task A + Task B (parallel, no file overlap)
  Wave 2: Task C (after A completes, shares auth.ts)
```

### Implementation with Task Tool

```
Wave 1 (Parallel - no file overlap):
  - Task(subagent_type=general-purpose): "Implement Task A" → [auth.ts, types.ts]
  - Task(subagent_type=general-purpose): "Implement Task B" → [dashboard.tsx, api/users.ts]

Checkpoint: Both tasks complete, verify no conflicts

Wave 2 (Sequential - file overlap with Wave 1):
  - Task(subagent_type=general-purpose): "Implement Task C" → [auth.ts, middleware.ts]

Checkpoint: All tasks complete, run build + tests
```

### Quick Decision Rule

```
IF task_files_A ∩ task_files_B == {} THEN parallel
ELSE sequential (task with fewer dependencies first)
```

---

## Anti-Patterns

### Bad: Dependent Operations in Same Wave
```
// WRONG - file2 depends on file1
Wave 1:
  - Read file1.ts
  - Edit file2.ts based on file1  <- Fails! file1 not read yet
```

### Bad: No Checkpoint After Complex Wave
```
// WRONG - Missing analysis
Wave 1:
  - Read 10 files
Wave 2:
  - Edit 5 files  <- No checkpoint to analyze reads!
```

### Bad: Too Many Operations Per Wave
```
// WRONG - Context overload
Wave 1:
  - Read 20 files  <- Too many, context lost
```

---

## Integration with ATUM CREA

### In TodoWrite
```yaml
todo:
  - name: "Wave 1: Read auth files"
    status: "in_progress"
    operations:
      - Read src/auth/login.ts
      - Read src/auth/logout.ts

  - name: "Checkpoint: Analyze auth"
    status: "pending"

  - name: "Wave 2: Implement changes"
    status: "pending"
```

### In Hindsight
```javascript
// After successful wave pattern
mcp__hindsight__hindsight_retain({
  bank: 'patterns',
  content: 'Wave pattern for [task type]: Wave1=[ops], Checkpoint=[analysis], Wave2=[ops]',
  context: 'Successful parallel execution'
})
```

---

## Performance Metrics

| Metric | Sequential | Wave Pattern | Improvement |
|--------|------------|--------------|-------------|
| 5-file read | 5 calls | 1 wave (5 parallel) | 5x |
| Search + Edit | 8 calls | 2 waves | 3-4x |
| Full feature | 15+ calls | 3-4 waves | 3.5x avg |

---

## Template for Complex Tasks

```markdown
## Task: [Description]

### Wave 1: Research (Parallel)
- [ ] Operation 1
- [ ] Operation 2
- [ ] Operation 3

### Checkpoint 1
Analyze: [What to look for]
Decision: [What to decide]

### Wave 2: Implementation (Parallel)
- [ ] Operation 4
- [ ] Operation 5

### Checkpoint 2
Verify: [What to check]
Status: [Pass/Fail]

### Wave 3: Validation (Parallel)
- [ ] Test 1
- [ ] Test 2

### Final Checkpoint
Complete: [Yes/No]
Evidence: [Proof]
```

---

*Adapted from SuperClaude Framework for ATUM CREA v24.2*
