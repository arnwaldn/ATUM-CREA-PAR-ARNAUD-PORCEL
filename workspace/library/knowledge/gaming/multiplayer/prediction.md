# Client-Side Prediction

## The Problem
- Network latency = delayed response
- Feels laggy without prediction

## Solution

```typescript
class PredictedPlayer {
  private pendingInputs: Input[] = []
  private serverState: PlayerState

  // Apply input immediately (predict)
  onInput(input: Input) {
    this.applyInput(input)
    input.sequence = this.sequence++
    this.pendingInputs.push(input)
    network.send(input)
  }

  // Reconcile when server responds
  onServerState(state: PlayerState) {
    // Reset to authoritative state
    this.position = state.position
    this.serverState = state

    // Remove acknowledged inputs
    this.pendingInputs = this.pendingInputs.filter(
      i => i.sequence > state.lastProcessedInput
    )

    // Re-apply unacknowledged inputs
    for (const input of this.pendingInputs) {
      this.applyInput(input)
    }
  }
}
```

## Entity Interpolation
For other players (not predicted):

```typescript
const INTERPOLATION_DELAY = 100 // ms

function interpolateEntity(entity, serverSnapshots) {
  const renderTime = serverTime - INTERPOLATION_DELAY

  const before = snapshots.findLast(s => s.time <= renderTime)
  const after = snapshots.find(s => s.time > renderTime)

  if (before && after) {
    const t = (renderTime - before.time) / (after.time - before.time)
    entity.position = lerp(before.position, after.position, t)
  }
}
```

## Lag Compensation
Server-side hit detection with rewind:

```typescript
// On hit request from client
function processHit(shooter, targetId, clientTime) {
  // Rewind target to client's view
  const targetState = getStateAtTime(targetId, clientTime)

  // Check hit against past position
  if (raycast(shooter.position, targetState.position)) {
    applyDamage(targetId)
  }
}
```
