# Game Loop Pattern

## Fixed Timestep

```typescript
const TICK_RATE = 60
const TICK_MS = 1000 / TICK_RATE

let accumulator = 0
let lastTime = performance.now()

function gameLoop() {
  const now = performance.now()
  const delta = now - lastTime
  lastTime = now

  accumulator += delta

  // Fixed update (physics, logic)
  while (accumulator >= TICK_MS) {
    update(TICK_MS / 1000)
    accumulator -= TICK_MS
  }

  // Variable render (interpolation)
  const alpha = accumulator / TICK_MS
  render(alpha)

  requestAnimationFrame(gameLoop)
}
```

## Benefits
- Physics determinism
- Network sync possible
- Consistent behavior across framerates

## Usage
- Platformers, physics games, multiplayer
