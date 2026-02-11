# Platformer Physics

## Jump Curve

```typescript
class PlatformerController {
  // Tunable parameters
  jumpHeight = 4       // tiles
  jumpDuration = 0.4   // seconds
  gravity: number
  jumpSpeed: number

  constructor() {
    // Calculate physics from desired feel
    this.gravity = (2 * this.jumpHeight) / (this.jumpDuration ** 2)
    this.jumpSpeed = this.gravity * this.jumpDuration
  }

  jump() {
    this.velocity.y = -this.jumpSpeed
  }

  update(delta: number) {
    this.velocity.y += this.gravity * delta
    this.position.y += this.velocity.y * delta
  }
}
```

## Variable Jump Height

```typescript
// Release jump early = lower jump
if (!input.jumpHeld && this.velocity.y < 0) {
  this.velocity.y *= 0.5 // Cut upward velocity
}
```

## Coyote Time

```typescript
// Grace period after leaving platform
const COYOTE_TIME = 0.1 // seconds
let coyoteTimer = 0

update(delta) {
  if (this.isGrounded) {
    coyoteTimer = COYOTE_TIME
  } else {
    coyoteTimer -= delta
  }

  // Can jump even if just left ground
  if (input.jump && coyoteTimer > 0) {
    this.jump()
    coyoteTimer = 0
  }
}
```

## Input Buffering

```typescript
// Remember jump input for short time
const BUFFER_TIME = 0.1
let jumpBufferTimer = 0

if (input.jumpPressed) jumpBufferTimer = BUFFER_TIME
jumpBufferTimer -= delta

if (this.isGrounded && jumpBufferTimer > 0) {
  this.jump()
  jumpBufferTimer = 0
}
```
