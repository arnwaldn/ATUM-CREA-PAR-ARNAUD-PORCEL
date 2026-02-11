# State Machine Pattern

## Player States

```typescript
enum PlayerState {
  IDLE,
  RUNNING,
  JUMPING,
  FALLING,
  ATTACKING
}

class Player {
  state = PlayerState.IDLE

  update(delta: number) {
    switch (this.state) {
      case PlayerState.IDLE:
        if (input.move) this.state = PlayerState.RUNNING
        if (input.jump) this.state = PlayerState.JUMPING
        break

      case PlayerState.RUNNING:
        this.move(delta)
        if (!input.move) this.state = PlayerState.IDLE
        if (input.jump) this.state = PlayerState.JUMPING
        break

      case PlayerState.JUMPING:
        this.applyGravity(delta)
        if (this.velocity.y > 0) this.state = PlayerState.FALLING
        break

      case PlayerState.FALLING:
        this.applyGravity(delta)
        if (this.isGrounded()) this.state = PlayerState.IDLE
        break
    }
  }
}
```

## Hierarchical FSM
- Super states contain sub-states
- Example: "InAir" contains "Jumping" and "Falling"

## Benefits
- Clear behavior organization
- Easy to debug
- Animation sync
