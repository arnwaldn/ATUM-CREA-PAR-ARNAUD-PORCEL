# Platformer Design

## Core Mechanics

### Movement Feel
```typescript
const config = {
  // Horizontal
  maxSpeed: 8,
  acceleration: 50,
  deceleration: 70,    // Higher = snappier stop
  airControl: 0.6,     // Reduced control in air

  // Vertical
  gravity: 40,
  jumpForce: 16,
  jumpCutMultiplier: 0.4,  // Variable jump

  // Polish
  coyoteTime: 0.1,
  jumpBuffer: 0.15
}
```

### Wall Mechanics
- **Wall Slide**: Reduced fall speed
- **Wall Jump**: Away from wall + upward
- **Wall Cling**: Stick temporarily

### Dash
```typescript
function dash() {
  this.dashing = true
  this.dashTimer = 0.2
  this.velocity.x = this.facing * DASH_SPEED
  this.velocity.y = 0
  this.invincible = true
}
```

## Level Design

### Teaching Through Design
1. Safe practice area
2. Introduce mechanic
3. Challenge with mechanic
4. Combine with previous

### Pacing
- Tension/Release rhythm
- Mix difficulty spikes with rests
- Secrets reward exploration

## Camera
```typescript
// Smooth follow with lookahead
const LOOKAHEAD = 2
const SMOOTHING = 0.1

camera.x = lerp(
  camera.x,
  player.x + player.facingX * LOOKAHEAD,
  SMOOTHING
)
```
