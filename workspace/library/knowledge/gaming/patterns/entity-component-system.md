# Entity-Component-System (ECS)

## Structure

```
Entity: ID only (number)
Component: Data only (no logic)
System: Logic only (operates on components)
```

## Implementation

```typescript
// Components (data)
class Position { x: number; y: number }
class Velocity { dx: number; dy: number }
class Sprite { texture: string }

// System (logic)
class MovementSystem {
  update(entities: Entity[], delta: number) {
    for (const entity of entities) {
      const pos = entity.get(Position)
      const vel = entity.get(Velocity)
      if (pos && vel) {
        pos.x += vel.dx * delta
        pos.y += vel.dy * delta
      }
    }
  }
}
```

## Benefits
- Composition over inheritance
- Cache-friendly data layout
- Easy to add new behaviors
- Decoupled systems

## When to Use
- Complex games with many entity types
- Roguelikes, simulations, RTS
