# State Synchronization

## Strategies

### Authoritative Server
```
Client → Input → Server → State → All Clients
```
- Server is source of truth
- Prevents cheating
- Used by: Most competitive games

### Client Authority (Cooperative)
```
Client → State → Server → Other Clients
```
- Faster response
- Trust clients
- Used by: Cooperative games, level editors

## Colyseus State Sync

```typescript
// Server: Define schema
import { Schema, type, MapSchema } from '@colyseus/schema'

class Player extends Schema {
  @type('number') x = 0
  @type('number') y = 0
  @type('number') health = 100
}

class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>()
}

// Client: Listen to changes
room.state.players.onAdd((player, key) => {
  console.log('Player joined:', key)
})

room.state.players.onChange((player, key) => {
  // Update local representation
  this.sprites[key].setPosition(player.x, player.y)
})
```

## Delta Compression

```typescript
// Only send what changed
class DeltaEncoder {
  private lastState: any = {}

  encode(currentState: any): any {
    const delta: any = {}

    for (const key in currentState) {
      if (currentState[key] !== this.lastState[key]) {
        delta[key] = currentState[key]
      }
    }

    this.lastState = { ...currentState }
    return Object.keys(delta).length > 0 ? delta : null
  }
}
```

## Tick Rate

| Game Type | Server Tick | Client Send |
|-----------|-------------|-------------|
| Turn-based | On action | On action |
| Casual | 10-20 Hz | 10-20 Hz |
| Action | 30-60 Hz | 30-60 Hz |
| FPS/Competitive | 60-128 Hz | 60-128 Hz |

```typescript
// Server tick loop
const TICK_RATE = 60
const TICK_INTERVAL = 1000 / TICK_RATE

setInterval(() => {
  this.processInputs()
  this.updatePhysics(TICK_INTERVAL)
  this.broadcastState()
}, TICK_INTERVAL)
```
