# Lag Compensation

## The Problem
- Network latency: 50-200ms typical
- Player sees outdated world state
- Actions feel delayed

## Client-Side Prediction

```typescript
class PredictedPlayer {
  private pendingInputs: Input[] = []
  private lastProcessedInput = 0

  applyInput(input: Input) {
    // Apply locally immediately
    this.move(input)

    // Store for reconciliation
    this.pendingInputs.push(input)

    // Send to server
    this.room.send('input', input)
  }

  reconcile(serverState: PlayerState, lastInputId: number) {
    // Update to server position
    this.x = serverState.x
    this.y = serverState.y

    // Remove acknowledged inputs
    this.pendingInputs = this.pendingInputs.filter(
      input => input.id > lastInputId
    )

    // Re-apply pending inputs
    for (const input of this.pendingInputs) {
      this.move(input)
    }
  }
}
```

## Entity Interpolation

```typescript
class InterpolatedEntity {
  private buffer: { time: number; state: State }[] = []
  private interpolationDelay = 100 // ms

  addState(state: State, serverTime: number) {
    this.buffer.push({ time: serverTime, state })

    // Keep only recent states
    const cutoff = serverTime - 1000
    this.buffer = this.buffer.filter(s => s.time > cutoff)
  }

  getInterpolatedState(renderTime: number): State {
    const targetTime = renderTime - this.interpolationDelay

    // Find surrounding states
    let before: typeof this.buffer[0] | null = null
    let after: typeof this.buffer[0] | null = null

    for (const state of this.buffer) {
      if (state.time <= targetTime) before = state
      else if (!after) after = state
    }

    if (!before || !after) return before?.state ?? after?.state!

    // Interpolate
    const t = (targetTime - before.time) / (after.time - before.time)
    return {
      x: lerp(before.state.x, after.state.x, t),
      y: lerp(before.state.y, after.state.y, t)
    }
  }
}
```

## Server Rewind (Hit Detection)

```typescript
class ServerRewind {
  private history: Map<number, WorldState> = new Map()

  saveState(tick: number, state: WorldState) {
    this.history.set(tick, state)

    // Keep 1 second of history
    const oldTick = tick - 60
    this.history.delete(oldTick)
  }

  checkHit(shooterTick: number, shooter: Player, target: Player): boolean {
    // Rewind to when shooter fired
    const pastState = this.history.get(shooterTick)
    if (!pastState) return false

    const pastTarget = pastState.players.get(target.id)

    // Check collision at that time
    return this.raycast(shooter.position, shooter.aimDir, pastTarget)
  }
}
```

## Visual Smoothing

```typescript
// Smooth visual position vs actual position
class SmoothedEntity {
  actualX: number
  actualY: number
  visualX: number
  visualY: number
  smoothing = 0.2

  update() {
    this.visualX = lerp(this.visualX, this.actualX, this.smoothing)
    this.visualY = lerp(this.visualY, this.actualY, this.smoothing)
  }
}
```
