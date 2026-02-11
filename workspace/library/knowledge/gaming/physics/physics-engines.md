# Physics Engines Comparison

## Web 2D

### Matter.js
```typescript
import Matter from 'matter-js'

const engine = Matter.Engine.create()
const world = engine.world

// Create bodies
const box = Matter.Bodies.rectangle(400, 200, 80, 80)
const ground = Matter.Bodies.rectangle(400, 600, 800, 60, { isStatic: true })

Matter.World.add(world, [box, ground])

// Update loop
Matter.Engine.update(engine, delta)
```

**Pros**: Stable, well-documented, good for complex shapes
**Cons**: Heavier than Arcade physics

### Phaser Arcade
```typescript
// Simple AABB collision
this.physics.add.collider(player, platforms)
this.physics.add.overlap(player, coins, collect)

// Properties
player.body.velocity.x = 200
player.body.bounce.y = 0.2
player.body.gravity.y = 300
```

**Pros**: Fast, simple, good for platformers
**Cons**: Only rectangles and circles

## Web 3D

### Cannon-es
```typescript
import * as CANNON from 'cannon-es'

const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) })

const body = new CANNON.Body({
  mass: 1,
  shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1))
})
world.addBody(body)

// Sync with Three.js
mesh.position.copy(body.position)
mesh.quaternion.copy(body.quaternion)
```

### Rapier (WASM)
```typescript
import RAPIER from '@dimforge/rapier3d'

const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 })

const rigidBody = world.createRigidBody(
  RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 10, 0)
)
const collider = world.createCollider(
  RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5),
  rigidBody
)
```

**Rapier advantages**: Faster, deterministic, better for multiplayer

## Choosing

| Engine | Use Case |
|--------|----------|
| Arcade | Simple platformer, mobile games |
| Matter.js | Complex 2D physics, puzzles |
| Cannon-es | 3D games, easier API |
| Rapier | Multiplayer, performance critical |
