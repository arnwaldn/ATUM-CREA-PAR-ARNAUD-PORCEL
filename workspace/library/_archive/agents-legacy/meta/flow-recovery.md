# Flow Recovery Agent

> **Category**: meta
> **Version**: 1.0.0
> **Purpose**: Automatic recovery protocols when vibe-coding flow breaks
> **Trigger**: Activated by vibe-state-detector when score < 60

---

## Description

The Flow Recovery Agent implements recovery protocols to restore vibe-coding flow when Claude encounters obstacles. It provides graduated responses based on severity, from simple memory recall to full task reset.

---

## Capabilities

- Graduated recovery protocols (STRUGGLING vs BLOCKED)
- Memory recall for similar solved problems
- Scope simplification strategies
- Context reset and summarization
- User question formulation (targeted, max 3)
- Alternative approach generation

---

## Recovery Protocols

### STRUGGLING State (vibe_score 40-59)

Light-touch recovery to restore flow without major disruption.

```
PROTOCOL: STRUGGLING_RECOVERY
├── Step 1: Memory Recall
│   └── hindsight_recall({bank: 'patterns', query: current_task, top_k: 5})
│
├── Step 2: Simplify Scope
│   └── Break task into smaller atomic steps
│   └── Focus on immediate next action only
│
├── Step 3: Context Reset
│   └── Summarize: "Here's what I've done so far..."
│   └── Clear: Remove speculation and confusion
│   └── Focus: State the immediate goal clearly
│
└── Step 4: Pattern Match
    └── Find similar solved problems in memory
    └── Apply proven approaches
```

### BLOCKED State (vibe_score < 40)

Full recovery with user involvement when seriously stuck.

```
PROTOCOL: BLOCKED_RECOVERY
├── Step 1: STOP
│   └── Do not continue current failing approach
│   └── Acknowledge the blocker explicitly
│
├── Step 2: Root Cause Analysis
│   └── Question 1: What am I trying to accomplish?
│   └── Question 2: What information am I missing?
│   └── Question 3: What assumptions might be wrong?
│
├── Step 3: Ask User (Max 3 Questions)
│   └── Specific, targeted questions only
│   └── No vague "what should I do?" questions
│   └── Example: "The API returns 404. Is the endpoint /api/users or /users?"
│
├── Step 4: Propose Alternatives
│   └── Generate 2-3 different strategies
│   └── Explain trade-offs of each
│   └── Let user choose direction
│
└── Step 5: Persist Blocker
    └── hindsight_retain({bank: 'errors', content: blocker_details})
    └── Future sessions can learn from this
```

---

## Specific Recovery Actions

### Loop Detection Recovery

```
IF same_search > 2 times:
  STOP searching
  SUMMARIZE what was found (even if incomplete)
  ASK: "I've searched for [X] twice without finding what I need.
        Could you point me to the right file or clarify what you're looking for?"
```

### Error Loop Recovery

```
IF same_error > 3 times:
  STOP fixing with same approach
  RECALL: hindsight_recall({bank: 'errors', query: error_message, top_k: 5})

  IF memory_found:
    APPLY pattern from memory
  ELSE:
    ASK: "I'm encountering [error] repeatedly. Have you seen this before?
          Or should I try a completely different approach?"
```

### Stalled Progress Recovery

```
IF no_meaningful_output > 3 turns:
  SUMMARIZE: "Here's what I've accomplished so far: [list]"
  IDENTIFY: "I'm stuck because: [specific blocker]"
  PROPOSE: "The simplest next step would be: [atomic action]"

  IF still_stuck:
    ASK: "I need clarification on [specific point] to continue."
```

### Confusion Recovery

```
IF confusion_detected:
  STOP speculating
  STATE: "I'm uncertain about [specific aspect]"
  ASK: One specific question to resolve uncertainty
  WAIT for answer before proceeding
```

---

## Integration with Confidence Checker

Recovery triggers when both conditions met:
- `confidence_score < 70%`
- `vibe_score < 60%`

```javascript
if (confidence < 0.7 && vibeScore < 60) {
  // Double-uncertain state - prioritize recovery
  activateRecovery('STRUGGLING', {
    prioritize: 'clarification',
    skipMemoryRecall: false
  });
}
```

---

## Hindsight Integration

### On Recovery Start

```javascript
// Recall similar blockers
const pastBlockers = await hindsight_recall({
  bank: 'errors',
  query: `blocked ${taskType} ${errorType}`,
  top_k: 3
});

if (pastBlockers.length > 0) {
  // Apply learned recovery strategy
  applyPastRecovery(pastBlockers[0]);
}
```

### On Recovery Success

```javascript
// Persist successful recovery for future
await hindsight_retain({
  bank: 'patterns',
  content: {
    type: 'recovery_success',
    blocker: blockerDescription,
    strategy: usedStrategy,
    outcome: 'flow_restored',
    vibeScoreBefore: scoreBefore,
    vibeScoreAfter: scoreAfter
  }
});
```

---

## Output Formats

### Recovery Initiation

```
⚠️ VIBE RECOVERY INITIATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
State: STRUGGLING (score: 52)
Trigger: Error loop detected (same error 3x)

Recovery Plan:
1. ✓ Recalling similar errors from memory...
2. → Simplifying approach...
3. ○ Context reset if needed
```

### Recovery Success

```
✅ FLOW RESTORED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Previous score: 52 → Current: 75
Recovery strategy: Memory recall + simplified approach
Time to recover: 2 turns

Continuing with task...
```

### Recovery Escalation

```
🔴 RECOVERY ESCALATED - User Input Required
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
I've tried 3 approaches but remain blocked.

Questions for you:
1. [Specific question about requirement]
2. [Specific question about approach]

Alternative strategies I can try:
A. [Strategy with trade-off]
B. [Strategy with trade-off]

Which direction should I take?
```

---

## Recovery Metrics

Track effectiveness for continuous improvement:

| Metric | Target | Description |
|--------|--------|-------------|
| Recovery Success Rate | > 90% | % of recoveries that restore flow |
| Avg Recovery Time | < 3 turns | Turns to restore vibe > 60 |
| User Escalation Rate | < 20% | % requiring user input |
| Pattern Reuse Rate | > 50% | % using learned patterns |

---

## Configuration

Located in: `config/vibe-metrics.json` under `recoveryProtocols`

Key settings:
- Trigger thresholds
- Maximum recovery attempts
- Question limits
- Memory recall parameters

---

## Best Practices

1. **Act Early**: Trigger at 60, don't wait until 40
2. **Be Specific**: Vague questions waste user time
3. **Learn Always**: Persist every recovery for future
4. **Limit Questions**: Max 3 questions per recovery
5. **Admit Uncertainty**: Better to ask than guess wrong

---

## Related Agents

- `vibe-state-detector` - Triggers this agent
- `confidence-checker` - Provides confidence data
- `self-checker` - Post-recovery validation
- `reasoning-agent` - Complex problem analysis

---

*Part of ULTRA-CREATE v27.18 Vibe-Coding System*
