# Vibe State Detector Agent

> **Category**: meta
> **Version**: 1.0.0
> **Purpose**: Real-time detection and monitoring of vibe-coding flow state
> **Auto-Trigger**: Always active during sessions

---

## Description

The Vibe State Detector monitors Claude's execution state to determine if the session is in optimal "vibe-coding" flow. It tracks positive indicators (efficiency, progress, confidence) and negative indicators (loops, errors, confusion) to calculate a real-time vibe score.

---

## Capabilities

- Real-time vibe score calculation (0-100)
- Flow state detection (FLOW, GOOD, STRUGGLING, BLOCKED)
- Negative indicator detection (loops, errors, stalls)
- Recovery protocol triggering
- Session metrics tracking

---

## Vibe Score Calculation

### Positive Indicators (60% weight)

| Indicator | Measurement | Weight | Ideal |
|-----------|-------------|--------|-------|
| Token Efficiency | output/input ratio | 20% | >= 3.0 |
| Zero Loops | no repeated operations | 25% | 0 repeats |
| Forward Progress | new content ratio | 25% | >= 70% |
| No Clarifications | questions asked | 15% | 0 questions |
| High Confidence | avg confidence | 15% | >= 80% |

### Negative Indicators (40% penalty)

| Indicator | Detection | Severity | Penalty |
|-----------|-----------|----------|---------|
| Repeated Search | same query 2+ times | HIGH | -15 |
| Error Loop | same error 3+ times | CRITICAL | -25 |
| Confusion Markers | "unclear", "not sure" | MEDIUM | -10 |
| Backtracking | undoing previous work | HIGH | -15 |
| Stalled | no output 3+ turns | CRITICAL | -30 |

### Formula

```javascript
vibe_score = (positive_score * 0.6) - (negative_penalty * 0.4)
```

---

## Vibe States

| Score | State | Color | Action |
|-------|-------|-------|--------|
| 80-100 | FLOW | Green | Continue, minimal intervention |
| 60-79 | GOOD | Yellow | Monitor, light guidance |
| 40-59 | STRUGGLING | Orange | Trigger recovery protocol |
| 0-39 | BLOCKED | Red | Full reset, ask questions |

---

## Detection Patterns

### Loop Detection

```javascript
// Detect repeated searches
if (sameSearchQuery >= 2) {
  triggerRecovery('stop_searching_ask_clarification');
}

// Detect error loops
if (sameError >= 3) {
  triggerRecovery('recall_error_patterns_or_escalate');
}
```

### Confusion Detection

```javascript
const confusionPatterns = [
  "I'm not sure",
  "unclear",
  "confused",
  "don't understand",
  "what do you mean",
  "could you clarify"
];

if (outputContains(confusionPatterns)) {
  decreaseVibeScore(10);
  triggerRecovery('simplify_approach');
}
```

### Stall Detection

```javascript
// Track meaningful output per turn
if (meaningfulOutputTurns < 3 && totalTurns >= 3) {
  triggerRecovery('full_reset_and_ask_questions');
}
```

---

## Integration Points

### With Flow Recovery Agent

When vibe_score drops below threshold, automatically triggers `flow-recovery` agent:

```javascript
if (vibe_score < 60) {
  activate('flow-recovery', {
    currentScore: vibe_score,
    negativeIndicators: detectedIndicators,
    taskContext: currentTaskContext
  });
}
```

### With Hindsight

Persists vibe session data for learning:

```javascript
// On session end
hindsight_retain({
  bank: 'vibe-history',
  content: {
    sessionId: session_id,
    avgVibeScore: avgScore,
    timeInFlow: flowPercentage,
    recoveryCount: recoveries,
    taskTypes: completedTaskTypes
  }
});
```

### With Activity Tracker

Receives execution data from activity-tracker hook:

- Tool calls count
- Error occurrences
- Search queries
- Output lengths

---

## Output Format

### Real-time Status

```
╔════════════════════════════════════════╗
║     VIBE STATE: FLOW 🟢                ║
║     Score: 85/100                      ║
╠════════════════════════════════════════╣
║  + Token Efficiency: 3.5x   ✓         ║
║  + Forward Progress: 82%    ✓         ║
║  + Confidence: 92%          ✓         ║
║  - Loops: 0                 ✓         ║
║  - Errors: 0                ✓         ║
╚════════════════════════════════════════╝
```

### Session Summary

```yaml
session_metrics:
  duration: 45 min
  avg_vibe_score: 78
  time_in_flow: 67%
  recoveries_triggered: 1
  tasks_completed: 3
  first_attempt_success: 100%
```

---

## Configuration

Located in: `config/vibe-metrics.json`

Key settings:
- Indicator weights and thresholds
- State boundaries
- Recovery triggers
- Hindsight integration

---

## Best Practices

1. **Don't Over-Monitor**: Check vibe every 3-5 tool calls, not every action
2. **Smooth Scores**: Use moving average to avoid jitter
3. **Early Recovery**: Trigger at 60, don't wait until 40
4. **Learn Patterns**: Persist successful recovery strategies

---

## Related Agents

- `flow-recovery` - Recovery protocols when vibe drops
- `vibe-analytics` - Historical analysis and trends
- `confidence-checker` - Decision confidence scoring
- `self-checker` - Quality validation

---

*Part of ULTRA-CREATE v27.18 Vibe-Coding System*
