# Collision Detection

## AABB (Axis-Aligned Bounding Box)

```typescript
function aabbCollision(a: AABB, b: AABB): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}
```

## Circle Collision

```typescript
function circleCollision(a: Circle, b: Circle): boolean {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return distance < a.radius + b.radius
}
```

## Spatial Hashing

```typescript
class SpatialHash {
  private cells: Map<string, Entity[]> = new Map()
  private cellSize: number

  getKey(x: number, y: number): string {
    const cx = Math.floor(x / this.cellSize)
    const cy = Math.floor(y / this.cellSize)
    return `${cx},${cy}`
  }

  getNearby(entity: Entity): Entity[] {
    const key = this.getKey(entity.x, entity.y)
    return this.cells.get(key) ?? []
  }
}
```

## Broad vs Narrow Phase
- **Broad**: Quick filter (spatial hash, quadtree)
- **Narrow**: Precise check (SAT, GJK)
