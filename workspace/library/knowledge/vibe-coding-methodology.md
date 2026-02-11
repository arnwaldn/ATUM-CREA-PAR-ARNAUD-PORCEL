# Vibe-Coding Methodology - ULTRA-CREATE v27.18

> **Origin**: Adapted from EnzeD/vibe-coding (3.3k stars)
> **Version**: 2.0.0 (Expanded)
> **Philosophy**: Autonomous flow state detection and maintenance
> **Goal**: Make Claude the best vibe-coding AI in the world

---

## Table of Contents

1. [Fundamental Principle](#fundamental-principle)
2. [Vibe State Machine](#vibe-state-machine)
3. [Flow Indicators](#flow-indicators)
4. [Recovery Protocols](#recovery-protocols)
5. [Core Patterns](#core-patterns)
6. [Metrics and Measurement](#metrics-and-measurement)
7. [Integration Architecture](#integration-architecture)
8. [Best Practices](#best-practices)

---

## Fundamental Principle

### Original vibe-coding

The original vibe-coding methodology emphasizes human control: "Do NOT let AI plan autonomously."

### ULTRA-CREATE Adaptation

**ULTRA-CREATE inverts this logic**: Claude applies these patterns autonomously and intelligently, freeing users from manual management while maintaining quality through self-monitoring.

### The Vibe-Coding Promise

When in optimal flow:
- Claude generates high-quality code rapidly
- Decisions are confident and accurate
- Progress is continuous without stalls
- Errors are rare and quickly resolved
- The experience feels effortless

---

## Vibe State Machine

### States Defined

```
┌─────────────────────────────────────────────────────────────┐
│                    VIBE STATE MACHINE                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌──────────┐                                              │
│   │   FLOW   │  Score: 80-100                               │
│   │    🟢    │  "In the zone"                               │
│   └────┬─────┘                                              │
│        │ vibe drops below 80                                │
│        ▼                                                    │
│   ┌──────────┐                                              │
│   │   GOOD   │  Score: 60-79                                │
│   │    🟡    │  "Minor friction"                            │
│   └────┬─────┘                                              │
│        │ vibe drops below 60                                │
│        ▼                                                    │
│   ┌──────────┐                                              │
│   │STRUGGLING│  Score: 40-59                                │
│   │    🟠    │  "Obstacles detected"                        │
│   └────┬─────┘  → Trigger recovery                          │
│        │ vibe drops below 40                                │
│        ▼                                                    │
│   ┌──────────┐                                              │
│   │ BLOCKED  │  Score: 0-39                                 │
│   │    🔴    │  "Needs reset"                               │
│   └──────────┘  → Full recovery + user input                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### State Transitions

| From | To | Trigger |
|------|----|---------|
| FLOW | GOOD | Minor obstacle, slight confusion |
| GOOD | FLOW | Obstacle resolved, confidence restored |
| GOOD | STRUGGLING | Multiple obstacles, repeated errors |
| STRUGGLING | GOOD | Recovery successful |
| STRUGGLING | BLOCKED | Recovery failed, critical blocker |
| BLOCKED | STRUGGLING | Partial resolution |
| BLOCKED | GOOD | User clarification received |

### State Actions

**FLOW State (80-100)**
- Continue execution, minimal intervention
- Light monitoring only
- No suggestions or interruptions

**GOOD State (60-79)**
- Monitor closely
- Offer subtle guidance if dropping
- Enable suggestions

**STRUGGLING State (40-59)**
- Trigger automatic recovery
- Recall relevant patterns from memory
- Simplify scope
- Consider context reset

**BLOCKED State (0-39)**
- Stop current approach immediately
- Perform root cause analysis
- Ask user targeted questions (max 3)
- Propose alternative strategies

---

## Flow Indicators

### Positive Indicators (What Good Vibe Looks Like)

| Indicator | Measurement | Target | Weight |
|-----------|-------------|--------|--------|
| **Token Efficiency** | Output/Input ratio | >= 3.0 | 20% |
| **Zero Loops** | No repeated operations | 0 repeats | 25% |
| **Forward Progress** | New content ratio | >= 70% | 25% |
| **No Clarifications** | Questions to user | 0 | 15% |
| **High Confidence** | Decision confidence | >= 80% | 15% |

### Negative Indicators (Red Flags)

| Indicator | Detection | Severity | Penalty |
|-----------|-----------|----------|---------|
| **Repeated Search** | Same query 2+ times | HIGH | -15 |
| **Error Loop** | Same error 3+ times | CRITICAL | -25 |
| **Confusion Markers** | "unclear", "not sure" | MEDIUM | -10 |
| **Backtracking** | Undoing previous work | HIGH | -15 |
| **Stalled Progress** | No output 3+ turns | CRITICAL | -30 |

### Scoring Formula

```
vibe_score = (positive_score × 0.6) - (negative_penalty × 0.4)
```

Where:
- `positive_score` = weighted sum of positive indicators (0-100)
- `negative_penalty` = sum of triggered negative penalties (0-100)

---

## Recovery Protocols

### Lightweight Recovery (STRUGGLING State)

```
PROTOCOL: STRUGGLING_RECOVERY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: Memory Recall
└── hindsight_recall({bank: 'patterns', query: current_task, top_k: 5})
└── Apply any matching patterns

Step 2: Simplify Scope
└── Break task into smaller atomic steps
└── Focus on immediate next action only
└── Remove speculative work

Step 3: Context Reset
└── Summarize: "Here's what I've accomplished..."
└── Clear confusion markers
└── State the immediate goal clearly

Step 4: Pattern Match
└── hindsight_recall({bank: 'errors', query: current_error})
└── Apply proven solutions from history
```

### Full Recovery (BLOCKED State)

```
PROTOCOL: BLOCKED_RECOVERY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: STOP
└── Do not continue failing approach
└── Acknowledge: "I'm stuck on [specific issue]"

Step 2: Root Cause Analysis
└── Question 1: What am I trying to accomplish?
└── Question 2: What information am I missing?
└── Question 3: What assumptions might be wrong?

Step 3: Ask User (Max 3 Questions)
└── Specific, targeted questions only
└── No vague "what should I do?" questions
└── Example: "Is the endpoint /api/users or /users?"

Step 4: Propose Alternatives
└── Generate 2-3 different strategies
└── Explain trade-offs of each
└── Let user choose direction

Step 5: Persist Blocker
└── Save to errors bank for future learning
└── Include: error, context, resolution
```

### Specific Recovery Scenarios

**Loop Detection Recovery**
```
IF same_search > 2:
  STOP searching
  SUMMARIZE what was found
  ASK: "I've searched twice without finding X. Could you clarify?"
```

**Error Loop Recovery**
```
IF same_error > 3:
  STOP fixing with same approach
  RECALL errors bank
  IF match_found: APPLY pattern
  ELSE: ASK user for guidance
```

**Stalled Progress Recovery**
```
IF no_meaningful_output > 3 turns:
  SUMMARIZE progress so far
  IDENTIFY specific blocker
  PROPOSE simplest next step
```

---

## Core Patterns

### 1. Memory-First Execution

Every action follows this pattern:

```
BEFORE action:
├── hindsight_recall({bank: 'patterns', query: task_type})
├── hindsight_recall({bank: 'errors', query: potential_issues})
└── context7_get_docs({framework})

EXECUTE action

AFTER action:
└── hindsight_retain({bank: 'patterns', content: learned_pattern})
```

**Implementation**: `memory-first-blocking.cjs`, `post-edit-learn.js`

### 2. Self-Validation Loop

```
┌─────────────────────────────────────────┐
│           SELF-VALIDATION               │
├─────────────────────────────────────────┤
│                                         │
│  Claude executes step                   │
│         │                               │
│         ▼                               │
│  Self-Checker validates                 │
│         │                               │
│         ├── ✅ Success → Continue       │
│         │                               │
│         └── ❌ Failure                  │
│                  │                      │
│                  ▼                      │
│         Self-Healer attempts fix        │
│                  │                      │
│                  ├── ✅ Fixed → Continue│
│                  │                      │
│                  └── ❌ Failed 3x       │
│                           │             │
│                           ▼             │
│                    Escalate to user     │
│                                         │
└─────────────────────────────────────────┘
```

### 3. Context Management

```javascript
// Automatic context monitoring
if (contextUsage > 70%) {
  // Summarize key information
  summary = generateContextSummary();

  // Save state to Hindsight
  hindsight_retain({
    bank: 'development',
    content: summary,
    context: 'context_overflow_save'
  });

  // Recommend fresh start if needed
  if (contextUsage > 85%) {
    suggestNewChat();
  }
}
```

### 4. Progress Tracking

```javascript
// After each milestone
hindsight_retain({
  bank: 'development',
  content: JSON.stringify({
    type: 'progress',
    project: projectName,
    milestone: milestoneName,
    files_modified: fileList,
    timestamp: new Date().toISOString()
  })
});
```

---

## Metrics and Measurement

### Session Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| `avg_vibe_score` | Average vibe score | >= 70 |
| `time_in_flow` | % time in FLOW state | >= 60% |
| `recovery_count` | Recoveries triggered | < 3 |
| `first_attempt_success` | Tasks done first try | >= 80% |
| `token_efficiency` | Output/input ratio | >= 3.0 |

### Historical Metrics

| Metric | Period | Purpose |
|--------|--------|---------|
| `vibe_trend` | 7 days | Track improvement |
| `common_blockers` | 30 days | Identify patterns |
| `recovery_effectiveness` | 30 days | Optimize recovery |
| `best_task_types` | 30 days | Leverage strengths |

### Measurement Points

1. **Per Tool Call**: Update vibe indicators
2. **Per Turn**: Calculate vibe score, check state
3. **Per Recovery**: Log attempt and outcome
4. **Per Session**: Aggregate and persist to Hindsight

---

## Integration Architecture

### Component Interaction

```
┌─────────────────────────────────────────────────────────────┐
│                 VIBE-CODING INTEGRATION                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐ │
│  │   Vibe      │      │    Flow     │      │    Vibe     │ │
│  │   State     │ ───▶ │  Recovery   │ ───▶ │  Analytics  │ │
│  │  Detector   │      │    Agent    │      │    Agent    │ │
│  └──────┬──────┘      └─────────────┘      └──────┬──────┘ │
│         │                                         │        │
│         │  scores + states                        │ metrics│
│         ▼                                         ▼        │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                    HINDSIGHT                        │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │  │
│  │  │ patterns │ │  errors  │ │   vibe   │            │  │
│  │  │   bank   │ │   bank   │ │  history │            │  │
│  │  └──────────┘ └──────────┘ └──────────┘            │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Hooks Integration

| Hook | Role in Vibe-Coding |
|------|---------------------|
| `memory-first-blocking.cjs` | Recall before action |
| `post-edit-learn.js` | Learn from successful edits |
| `vibe-state-monitor.js` | Real-time vibe tracking |
| `vibe-recovery-hook.js` | Trigger recovery protocols |
| `auto-retain.js` | Persist patterns and errors |

### Agents Integration

| Agent | Role |
|-------|------|
| `vibe-state-detector` | Real-time vibe detection |
| `flow-recovery` | Recovery protocol execution |
| `vibe-analytics` | Metrics and reporting |
| `confidence-checker` | Decision confidence |
| `self-checker` | Output validation |

---

## Best Practices

### DO: Maintain Flow

1. **Check memory first** - Always recall before acting
2. **Stay focused** - One task at a time, atomic steps
3. **Validate continuously** - Self-check each output
4. **Learn always** - Persist patterns and error solutions
5. **Recover early** - Trigger recovery at 60, not 40

### DON'T: Break Flow

1. **Don't loop** - If searched twice, stop and ask
2. **Don't guess** - Uncertain? Ask for clarification
3. **Don't speculate** - Stick to what you know
4. **Don't ignore errors** - Each error is a learning opportunity
5. **Don't continue blind** - BLOCKED state means STOP

### Signs of Good Vibe

- Rapid, confident code generation
- Zero repeated searches
- Clear, focused output
- No backtracking
- User says "that's exactly what I wanted"

### Signs of Broken Vibe

- Multiple attempts at same thing
- Long pauses with no output
- "I'm not sure..." in output
- User asking "what happened?"
- Undoing previous work

---

## Workflow Summary

### Autonomous ULTRA-CREATE Workflow

```
1. Intent Parser detects request
2. Complexity Scoring calculates difficulty
3. Vibe State Monitor initializes tracking
4. Memory Recall (patterns + errors + context)
5. Context7 docs if framework involved
6. Execute with Self-Checker validation
7. Vibe monitoring throughout
8. Recovery if score drops < 60
9. Hindsight retain (learnings)
10. Vibe Analytics session summary
```

### Key Principle

**No human intervention required** except:
- Initial clarification if confidence < 70%
- BLOCKED state requiring user input
- Security-sensitive operations

---

## Configuration

### Files

| File | Purpose |
|------|---------|
| `config/vibe-metrics.json` | Indicators, thresholds, states |
| `config/complexity-scoring.json` | Task complexity algorithm |
| `agents/meta/vibe-state-detector.md` | Detection agent |
| `agents/meta/flow-recovery.md` | Recovery agent |
| `agents/meta/vibe-analytics.md` | Analytics agent |

### Hindsight Banks

| Bank | Vibe-Coding Use |
|------|-----------------|
| `patterns` | Successful patterns for recall |
| `errors` | Error solutions for quick fixes |
| `vibe-history` | Session metrics and trends |
| `development` | Project context for resume |

---

## Differences from Original vibe-coding

| Aspect | Original (EnzeD) | ULTRA-CREATE |
|--------|------------------|--------------|
| Control | Human strict | Claude autonomous |
| Memory | Manual .md files | Hindsight 6 banks |
| Validation | Human per step | Self-Checker auto |
| Progress | Manual progress.md | Auto Hindsight |
| Fresh Chat | Human decision | Context bloat detection |
| Planning | Human plans | Intent Parser + PM |
| Flow Detection | None | Real-time vibe tracking |
| Recovery | Manual | Automatic protocols |

---

## Success Criteria

ULTRA-CREATE achieves optimal vibe-coding when:

- Average session vibe score >= 70
- Time in FLOW state >= 60%
- Recovery success rate >= 90%
- First-attempt success >= 80%
- User satisfaction is high

---

*ULTRA-CREATE v27.18 Vibe-Coding Methodology*
*Transforming Claude into the best vibe-coding AI in the world*
