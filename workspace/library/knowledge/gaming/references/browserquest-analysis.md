# BrowserQuest Analysis

> Mozilla's open-source HTML5 multiplayer game - Key patterns for web MMO

## Architecture

```
┌─────────────┐     WebSocket      ┌─────────────┐
│   Client    │ ◄────────────────► │   Server    │
│  (Phaser)   │                    │  (Node.js)  │
└─────────────┘                    └─────────────┘
      │                                   │
      ▼                                   ▼
 Local State                        World State
 Rendering                          Game Logic
 Input                              Collision
 Prediction                         Spawn/Loot
```

## Server Architecture

```typescript
// World divided into zones/areas
class WorldServer {
  private areas: Map<string, Area> = new Map()

  getArea(x: number, y: number): Area {
    const areaId = `${Math.floor(x / AREA_SIZE)},${Math.floor(y / AREA_SIZE)}`
    return this.areas.get(areaId)!
  }

  // Only broadcast to players in same area
  broadcastToArea(areaId: string, message: any) {
    const area = this.areas.get(areaId)
    area?.players.forEach(player => player.send(message))
  }
}
```

## Entity Types

```typescript
enum EntityType {
  Player = 'player',
  Mob = 'mob',
  NPC = 'npc',
  Item = 'item',
  Chest = 'chest'
}

interface Entity {
  id: number
  type: EntityType
  x: number
  y: number
  sprite: string
}

interface Character extends Entity {
  name: string
  level: number
  health: number
  maxHealth: number
  armor: number
  weapon: string
}
```

## Message Protocol

```typescript
// Client → Server
type ClientMessage =
  | { type: 'move'; x: number; y: number }
  | { type: 'attack'; targetId: number }
  | { type: 'loot'; itemId: number }
  | { type: 'chat'; message: string }

// Server → Client
type ServerMessage =
  | { type: 'spawn'; entities: Entity[] }
  | { type: 'despawn'; ids: number[] }
  | { type: 'move'; id: number; x: number; y: number }
  | { type: 'damage'; id: number; amount: number }
  | { type: 'chat'; playerId: number; message: string }
```

## Spawn Management

```typescript
class SpawnManager {
  private spawnPoints: SpawnPoint[] = []
  private respawnTime = 30000 // ms

  onMobDeath(mob: Mob, spawnPoint: SpawnPoint) {
    setTimeout(() => {
      const newMob = this.createMob(spawnPoint.mobType)
      newMob.x = spawnPoint.x
      newMob.y = spawnPoint.y
      this.world.addEntity(newMob)
      this.broadcast('spawn', [newMob])
    }, this.respawnTime)
  }
}
```

## Combat System

```typescript
class CombatSystem {
  attack(attacker: Character, target: Character): DamageResult {
    // Check range
    const distance = Math.hypot(target.x - attacker.x, target.y - attacker.y)
    if (distance > attacker.attackRange) {
      return { success: false, reason: 'out_of_range' }
    }

    // Calculate damage
    const weaponDamage = WEAPONS[attacker.weapon].damage
    const baseDamage = randomRange(weaponDamage.min, weaponDamage.max)
    const armor = ARMORS[target.armor]?.defense ?? 0
    const finalDamage = Math.max(1, baseDamage - armor)

    target.health -= finalDamage

    // Broadcast to area
    this.broadcastToArea(target.areaId, {
      type: 'damage',
      attackerId: attacker.id,
      targetId: target.id,
      amount: finalDamage
    })

    if (target.health <= 0) {
      this.handleDeath(target, attacker)
    }

    return { success: true, damage: finalDamage }
  }
}
```

## Loot System

```typescript
class LootManager {
  dropLoot(mob: Mob): Item[] {
    const drops: Item[] = []
    const lootTable = MOB_LOOT[mob.type]

    for (const entry of lootTable) {
      if (Math.random() < entry.chance) {
        const item = this.createItem(entry.itemType)
        item.x = mob.x + randomRange(-1, 1)
        item.y = mob.y + randomRange(-1, 1)
        drops.push(item)
      }
    }

    // Despawn after timeout
    drops.forEach(item => {
      setTimeout(() => {
        if (!item.looted) {
          this.world.removeEntity(item)
          this.broadcast('despawn', [item.id])
        }
      }, 30000)
    })

    return drops
  }
}
```

## Key Takeaways

1. **Area-based broadcasting** - Don't send everything to everyone
2. **Simple collision** - Grid-based, not physics engine
3. **Stateless messages** - Each message complete in itself
4. **Server authority** - All game logic on server
5. **Minimal client prediction** - Movement only
6. **Respawn timers** - Keep world populated
7. **Loot timeout** - Clean up dropped items
