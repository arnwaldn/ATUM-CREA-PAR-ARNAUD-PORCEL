# Vibe Analytics Agent

> **Category**: meta
> **Version**: 1.0.0
> **Purpose**: Track, analyze, and report vibe-coding metrics
> **Trigger**: End of session, on request, or periodic

---

## Description

The Vibe Analytics Agent aggregates vibe-coding metrics across sessions, identifies trends, and provides insights for continuous improvement. It works with Hindsight to persist and query historical data.

---

## Capabilities

- Session metrics aggregation
- Historical trend analysis
- Blocker pattern identification
- Success pattern recognition
- Improvement recommendations
- Dashboard generation

---

## Metrics Tracked

### Session Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| `avg_vibe_score` | Average vibe score | >= 70 |
| `time_in_flow` | % time in FLOW state | >= 60% |
| `recovery_count` | Recoveries triggered | < 3 |
| `first_attempt_success` | Tasks done first try | >= 80% |
| `token_efficiency` | Output/input ratio | >= 3.0 |
| `tasks_completed` | Completed tasks | - |
| `blockers_encountered` | Unique blockers | - |

### Historical Metrics

| Metric | Description | Period |
|--------|-------------|--------|
| `vibe_trend` | Score trend | 7 days |
| `common_blockers` | Top blockers | 30 days |
| `recovery_effectiveness` | Recovery success % | 30 days |
| `best_performing_tasks` | Highest vibe tasks | 30 days |
| `improvement_rate` | Score change | 30 days |

---

## Dashboard Output

### Real-time Session Dashboard

```
+================================================+
|          VIBE-CODING SESSION METRICS           |
+================================================+
| Current State: FLOW                        |
| Session Score: 85/100                      |
| Time in Flow:  45 min (78%)                    |
| Recoveries:    1 (successful)                  |
+------------------------------------------------+
| Tasks Completed: 3                             |
| First Attempt:   100%                          |
| Token Efficiency: 3.5x                         |
+------------------------------------------------+
| 7-Day Trend:     +12% improving                |
| Top Blocker:     API integration               |
| Best Task Type:  Game development              |
+================================================+
```

### End-of-Session Summary

```yaml
session_summary:
  date: 2026-01-12
  duration: 52 minutes

  vibe_metrics:
    average_score: 78
    peak_score: 92
    lowest_score: 45
    time_in_flow: 67%

  productivity:
    tasks_started: 4
    tasks_completed: 3
    first_attempt_success: 75%
    lines_of_code: 450
    files_modified: 12

  quality:
    errors_encountered: 2
    errors_resolved: 2
    recoveries_triggered: 1
    recovery_success: 100%

  learnings_saved:
    patterns: 2
    errors: 1

  recommendations:
    - "API integration caused vibe drop - consider reviewing patterns first"
    - "Game development tasks had highest vibe - leverage this strength"
```

### Weekly Trend Report

```
+=====================================================+
|            WEEKLY VIBE TREND REPORT                 |
|                2026-01-06 to 2026-01-12             |
+=====================================================+

Score Trend:
Mon: ████████░░ 80
Tue: ███████░░░ 72
Wed: █████████░ 85
Thu: ████████░░ 78
Fri: █████████░ 88
Sat: ██████████ 95
Sun: █████████░ 85

Weekly Average: 83 (+8% from last week)

Top Performing Task Types:
1. Game Development     (avg: 92)
2. Frontend Components  (avg: 85)
3. API Development      (avg: 78)

Common Blockers (resolved):
1. External API timeouts  (3 occurrences)
2. Database schema issues (2 occurrences)

Improvement Opportunities:
- Consider caching for external API calls
- Review database patterns before schema changes
```

---

## Hindsight Integration

### Save Session Metrics

```javascript
// On session end
hindsight_retain({
  bank: 'vibe-history',
  content: JSON.stringify({
    type: 'session_metrics',
    date: new Date().toISOString(),
    duration_minutes: sessionDuration,
    avg_vibe_score: avgScore,
    time_in_flow_percent: flowPercent,
    tasks_completed: taskCount,
    recoveries: recoveryCount,
    blockers: blockerList,
    task_types: taskTypes
  })
});
```

### Query Historical Data

```javascript
// Get 7-day trend
const sessions = await hindsight_recall({
  bank: 'vibe-history',
  query: 'session_metrics last 7 days',
  top_k: 7
});

// Find common blockers
const blockers = await hindsight_recall({
  bank: 'vibe-history',
  query: 'blocker recovery',
  top_k: 20
});
```

---

## Analysis Functions

### Trend Calculation

```javascript
function calculateTrend(sessions) {
  const recent = sessions.slice(0, 3);
  const older = sessions.slice(3, 7);

  const recentAvg = average(recent.map(s => s.avg_vibe_score));
  const olderAvg = average(older.map(s => s.avg_vibe_score));

  const change = ((recentAvg - olderAvg) / olderAvg) * 100;

  return {
    direction: change > 0 ? 'improving' : 'declining',
    percentage: Math.abs(change).toFixed(1)
  };
}
```

### Blocker Pattern Detection

```javascript
function findCommonBlockers(sessions) {
  const blockerCounts = {};

  for (const session of sessions) {
    for (const blocker of session.blockers) {
      blockerCounts[blocker.type] = (blockerCounts[blocker.type] || 0) + 1;
    }
  }

  return Object.entries(blockerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([type, count]) => ({ type, count }));
}
```

### Success Pattern Recognition

```javascript
function findSuccessPatterns(sessions) {
  const highVibeSessions = sessions.filter(s => s.avg_vibe_score >= 80);

  const commonFactors = {
    taskTypes: {},
    timeOfDay: {},
    sessionLength: []
  };

  for (const session of highVibeSessions) {
    // Aggregate common factors
    for (const type of session.task_types) {
      commonFactors.taskTypes[type] = (commonFactors.taskTypes[type] || 0) + 1;
    }
  }

  return commonFactors;
}
```

---

## Recommendations Engine

### Generate Recommendations

Based on metrics, provide actionable suggestions:

```javascript
function generateRecommendations(metrics) {
  const recommendations = [];

  // Low vibe on certain task types
  if (metrics.worstTaskType && metrics.worstTaskType.avgScore < 60) {
    recommendations.push({
      type: 'task_type',
      message: `${metrics.worstTaskType.name} tasks cause vibe drops - consider reviewing patterns before starting`,
      priority: 'high'
    });
  }

  // Frequent blockers
  if (metrics.topBlocker && metrics.topBlocker.count >= 3) {
    recommendations.push({
      type: 'blocker',
      message: `"${metrics.topBlocker.type}" is a recurring blocker - save a reusable solution to patterns bank`,
      priority: 'high'
    });
  }

  // Recovery effectiveness
  if (metrics.recoverySuccess < 80) {
    recommendations.push({
      type: 'recovery',
      message: `Recovery success is ${metrics.recoverySuccess}% - consider more aggressive early intervention`,
      priority: 'medium'
    });
  }

  return recommendations;
}
```

---

## Integration Points

### With Vibe State Detector

Receives real-time vibe scores and state changes.

### With Flow Recovery

Records recovery attempts and outcomes.

### With Session Tracker

Gets session start/end events and task completions.

### With Hindsight

Persists and queries historical data.

---

## Commands

### View Current Session

```
"Show my current vibe metrics"
```

### View Trend

```
"What's my vibe trend this week?"
```

### View Recommendations

```
"How can I improve my vibe-coding?"
```

### Export Report

```
"Generate a vibe report for this week"
```

---

## Configuration

Located in: `config/vibe-metrics.json` under `sessionMetrics`

---

## Best Practices

1. **Review Weekly**: Check trend reports weekly
2. **Act on Blockers**: Address recurring blockers proactively
3. **Leverage Strengths**: Focus on high-vibe task types when possible
4. **Learn from Recoveries**: Analyze successful recovery patterns

---

## Related Agents

- `vibe-state-detector` - Real-time vibe monitoring
- `flow-recovery` - Recovery protocols
- `pm-agent` - Task tracking
- `self-improver` - System improvement

---

*Part of ULTRA-CREATE v27.18 Vibe-Coding System*
