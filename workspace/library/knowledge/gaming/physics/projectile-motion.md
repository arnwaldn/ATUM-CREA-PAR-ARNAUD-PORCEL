# Projectile Motion

## Basic Physics

```typescript
class Projectile {
  x: number
  y: number
  vx: number
  vy: number
  gravity = 9.8

  constructor(x: number, y: number, angle: number, speed: number) {
    this.x = x
    this.y = y
    this.vx = Math.cos(angle) * speed
    this.vy = Math.sin(angle) * speed
  }

  update(dt: number) {
    this.vy += this.gravity * dt
    this.x += this.vx * dt
    this.y += this.vy * dt
  }
}
```

## Trajectory Prediction

```typescript
function predictTrajectory(
  x: number, y: number,
  vx: number, vy: number,
  gravity: number,
  steps: number,
  dt: number
): { x: number; y: number }[] {
  const points = []

  for (let i = 0; i < steps; i++) {
    points.push({ x, y })
    vy += gravity * dt
    x += vx * dt
    y += vy * dt
  }

  return points
}

// Draw trajectory
const trajectory = predictTrajectory(cannon.x, cannon.y, vx, vy, 9.8, 50, 0.1)
graphics.lineStyle(2, 0xffffff, 0.5)
trajectory.forEach(p => graphics.lineTo(p.x, p.y))
```

## Aiming at Target

```typescript
// Calculate launch angle to hit target
function calculateLaunchAngle(
  start: { x: number; y: number },
  target: { x: number; y: number },
  speed: number,
  gravity: number
): number | null {
  const dx = target.x - start.x
  const dy = target.y - start.y
  const v2 = speed * speed
  const v4 = v2 * v2

  const discriminant = v4 - gravity * (gravity * dx * dx + 2 * dy * v2)

  if (discriminant < 0) return null // Can't reach

  // Low arc (more common in games)
  return Math.atan2(v2 - Math.sqrt(discriminant), gravity * dx)
}
```

## Homing Missiles

```typescript
class HomingMissile {
  turnRate = 3 // radians/sec
  angle: number

  update(target: { x: number; y: number }, dt: number) {
    const targetAngle = Math.atan2(
      target.y - this.y,
      target.x - this.x
    )

    // Smoothly rotate towards target
    let diff = targetAngle - this.angle
    // Normalize to [-PI, PI]
    while (diff > Math.PI) diff -= Math.PI * 2
    while (diff < -Math.PI) diff += Math.PI * 2

    const turn = Math.sign(diff) * Math.min(Math.abs(diff), this.turnRate * dt)
    this.angle += turn

    this.x += Math.cos(this.angle) * this.speed * dt
    this.y += Math.sin(this.angle) * this.speed * dt
  }
}
```
