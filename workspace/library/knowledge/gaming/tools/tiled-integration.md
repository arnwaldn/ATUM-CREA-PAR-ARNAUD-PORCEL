# Tiled Map Editor Integration

## Export Format (JSON)

```json
{
  "width": 40,
  "height": 30,
  "tilewidth": 16,
  "tileheight": 16,
  "layers": [
    {
      "name": "ground",
      "type": "tilelayer",
      "data": [1, 1, 1, 2, 2, ...]
    },
    {
      "name": "collisions",
      "type": "objectgroup",
      "objects": [
        { "x": 0, "y": 0, "width": 640, "height": 16 }
      ]
    }
  ],
  "tilesets": [
    {
      "name": "tileset",
      "image": "tileset.png",
      "tilewidth": 16,
      "tileheight": 16,
      "firstgid": 1
    }
  ]
}
```

## Phaser 3 Loading

```typescript
// In preload()
this.load.tilemapTiledJSON('level1', 'maps/level1.json')
this.load.image('tiles', 'tilesets/tileset.png')

// In create()
const map = this.make.tilemap({ key: 'level1' })
const tileset = map.addTilesetImage('tileset', 'tiles')

// Create layers
const groundLayer = map.createLayer('ground', tileset)
const wallsLayer = map.createLayer('walls', tileset)

// Set collision
wallsLayer.setCollisionByProperty({ collides: true })

// Or by tile index
wallsLayer.setCollision([1, 2, 3, 4])

// Add physics
this.physics.add.collider(player, wallsLayer)
```

## Object Layers

```typescript
// Spawn points from Tiled
const spawnPoints = map.getObjectLayer('spawns')

spawnPoints.objects.forEach(obj => {
  if (obj.type === 'player') {
    this.player = new Player(this, obj.x, obj.y)
  } else if (obj.type === 'enemy') {
    const enemy = new Enemy(this, obj.x, obj.y)
    enemy.setProperties(obj.properties)
    this.enemies.add(enemy)
  }
})
```

## Custom Properties

```typescript
// In Tiled: Add custom property "damage" = 10 to tile

const spikeTiles = groundLayer.filterTiles(tile =>
  tile.properties?.damage > 0
)

// Or check on collision
this.physics.add.overlap(player, groundLayer, (player, tile) => {
  if (tile.properties?.damage) {
    player.takeDamage(tile.properties.damage)
  }
})
```

## Three.js Loading

```typescript
import { TiledLoader } from './TiledLoader'

async function loadMap(path: string): Promise<THREE.Group> {
  const mapData = await fetch(path).then(r => r.json())
  const group = new THREE.Group()

  for (const layer of mapData.layers) {
    if (layer.type === 'tilelayer') {
      const mesh = createTilemapMesh(layer, mapData)
      group.add(mesh)
    } else if (layer.type === 'objectgroup') {
      for (const obj of layer.objects) {
        const entity = createEntity(obj)
        group.add(entity)
      }
    }
  }

  return group
}

function createTilemapMesh(layer: any, map: any): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(
    map.width * map.tilewidth,
    map.height * map.tileheight
  )

  // Create texture from tile data
  const texture = createTilemapTexture(layer.data, map)
  const material = new THREE.MeshBasicMaterial({ map: texture })

  return new THREE.Mesh(geometry, material)
}
```

## Collision Shapes

```typescript
// Parse collision objects from Tiled
function parseCollisions(objectLayer: any): CollisionShape[] {
  return objectLayer.objects.map(obj => {
    if (obj.polygon) {
      return {
        type: 'polygon',
        points: obj.polygon.map(p => ({ x: obj.x + p.x, y: obj.y + p.y }))
      }
    } else if (obj.ellipse) {
      return {
        type: 'circle',
        x: obj.x + obj.width / 2,
        y: obj.y + obj.height / 2,
        radius: obj.width / 2
      }
    } else {
      return {
        type: 'rectangle',
        x: obj.x,
        y: obj.y,
        width: obj.width,
        height: obj.height
      }
    }
  })
}
```

## Best Practices

1. **Layer naming convention**: `ground`, `walls`, `decorations`, `spawns`, `triggers`
2. **Use object layers** for entities, not tile layers
3. **Custom properties** for gameplay data (damage, speed, etc.)
4. **Embed tilesets** in map for simpler loading
5. **Grid snapping** for consistent placement
6. **Collision layer** separate from visual layers
