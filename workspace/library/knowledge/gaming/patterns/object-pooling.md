# Object Pooling Pattern

## Implementation

```typescript
class ObjectPool<T> {
  private available: T[] = []
  private inUse: Set<T> = new Set()

  constructor(
    private factory: () => T,
    private reset: (obj: T) => void,
    initialSize = 10
  ) {
    for (let i = 0; i < initialSize; i++) {
      this.available.push(factory())
    }
  }

  acquire(): T {
    let obj = this.available.pop()
    if (!obj) {
      obj = this.factory()
    }
    this.inUse.add(obj)
    return obj
  }

  release(obj: T): void {
    if (this.inUse.delete(obj)) {
      this.reset(obj)
      this.available.push(obj)
    }
  }
}
```

## Usage

```typescript
// Bullet pool
const bulletPool = new ObjectPool(
  () => new Bullet(),
  (bullet) => {
    bullet.active = false
    bullet.x = 0
    bullet.y = 0
  },
  100
)

function fire() {
  const bullet = bulletPool.acquire()
  bullet.init(player.x, player.y, direction)
}

function onBulletHit(bullet) {
  bulletPool.release(bullet)
}
```

## When to Use
- Bullets, particles, enemies
- Anything spawned/despawned frequently
- Reduces GC pressure
