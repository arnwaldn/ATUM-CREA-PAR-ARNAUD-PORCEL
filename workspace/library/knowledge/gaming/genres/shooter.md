# Shooter Game Design

## Weapon System

```typescript
interface WeaponConfig {
  name: string
  damage: number
  fireRate: number      // shots per second
  magazineSize: number
  reloadTime: number    // seconds
  spread: number        // degrees
  projectileSpeed: number
  automatic: boolean
}

class Weapon {
  private ammo: number
  private lastFired = 0
  private reloading = false

  constructor(private config: WeaponConfig) {
    this.ammo = config.magazineSize
  }

  canFire(time: number): boolean {
    if (this.reloading) return false
    if (this.ammo <= 0) return false

    const fireInterval = 1000 / this.config.fireRate
    return time - this.lastFired >= fireInterval
  }

  fire(time: number, origin: Vector2, direction: number): Projectile | null {
    if (!this.canFire(time)) return null

    this.ammo--
    this.lastFired = time

    // Apply spread
    const spreadRad = (this.config.spread * Math.PI / 180)
    const finalDir = direction + (Math.random() - 0.5) * spreadRad

    return new Projectile(
      origin,
      finalDir,
      this.config.projectileSpeed,
      this.config.damage
    )
  }

  reload() {
    this.reloading = true
    setTimeout(() => {
      this.ammo = this.config.magazineSize
      this.reloading = false
    }, this.config.reloadTime * 1000)
  }
}
```

## Aiming

### Crosshair
```typescript
class Crosshair {
  baseSize = 10
  currentSize = 10

  update(isMoving: boolean, isShooting: boolean) {
    let targetSize = this.baseSize

    if (isMoving) targetSize *= 1.5
    if (isShooting) targetSize *= 2

    // Smooth transition
    this.currentSize = lerp(this.currentSize, targetSize, 0.1)
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const gap = this.currentSize
    const length = 10

    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2

    // Four lines around center
    ctx.beginPath()
    ctx.moveTo(x - gap - length, y)
    ctx.lineTo(x - gap, y)
    ctx.moveTo(x + gap, y)
    ctx.lineTo(x + gap + length, y)
    ctx.moveTo(x, y - gap - length)
    ctx.lineTo(x, y - gap)
    ctx.moveTo(x, y + gap)
    ctx.lineTo(x, y + gap + length)
    ctx.stroke()
  }
}
```

## Hit Detection

### Hitscan
```typescript
function hitscanShot(origin: Vector2, direction: Vector2, range: number): Hit | null {
  const ray = { origin, direction: normalize(direction) }
  let closestHit: Hit | null = null
  let closestDist = range

  for (const entity of entities) {
    const hit = raycastAABB(ray, entity.bounds)
    if (hit && hit.distance < closestDist) {
      closestDist = hit.distance
      closestHit = { entity, point: hit.point, distance: hit.distance }
    }
  }

  return closestHit
}
```

### Headshot Multiplier
```typescript
function calculateDamage(hit: Hit, baseDamage: number): number {
  const hitbox = hit.entity.getHitbox(hit.point)

  switch (hitbox) {
    case 'head': return baseDamage * 2.5
    case 'body': return baseDamage * 1.0
    case 'limbs': return baseDamage * 0.75
    default: return baseDamage
  }
}
```

## Camera Effects

```typescript
class CameraShake {
  private trauma = 0

  addTrauma(amount: number) {
    this.trauma = Math.min(1, this.trauma + amount)
  }

  update(dt: number): { offsetX: number; offsetY: number; rotation: number } {
    const shake = this.trauma * this.trauma // Quadratic for better feel

    // Decay trauma
    this.trauma = Math.max(0, this.trauma - dt * 2)

    return {
      offsetX: (Math.random() * 2 - 1) * shake * 20,
      offsetY: (Math.random() * 2 - 1) * shake * 20,
      rotation: (Math.random() * 2 - 1) * shake * 0.1
    }
  }
}

// On weapon fire
cameraShake.addTrauma(0.3)
```
