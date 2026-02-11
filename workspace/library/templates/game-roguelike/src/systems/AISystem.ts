import type { World } from '../ecs/World'
import type { DungeonGenerator } from '../map/DungeonGenerator'
import { Position, AI, Fighter } from '../components'
import { Pathfinding } from '../utils/Pathfinding'

export class AISystem {
  private dungeon: DungeonGenerator
  private pathfinding: Pathfinding

  constructor(dungeon: DungeonGenerator) {
    this.dungeon = dungeon
    this.pathfinding = new Pathfinding(dungeon)
  }

  update(world: World, playerPos: { x: number; y: number }): void {
    const aiEntities = world.query(['Position', 'AI', 'Fighter'])

    aiEntities.forEach(entity => {
      const pos = world.getComponent<Position>(entity, 'Position')!
      const ai = world.getComponent<AI>(entity, 'AI')!
      const fighter = world.getComponent<Fighter>(entity, 'Fighter')!

      // Update AI state based on conditions
      this.updateState(ai, fighter, pos, playerPos)

      // Get movement based on state
      const move = this.getMove(ai, pos, playerPos)

      // Apply movement if valid
      if (move.dx !== 0 || move.dy !== 0) {
        const newX = pos.x + move.dx
        const newY = pos.y + move.dy
        if (this.dungeon.isWalkable(newX, newY)) {
          pos.x = newX
          pos.y = newY
        }
      }
    })
  }

  private updateState(
    ai: AI,
    fighter: Fighter,
    pos: Position,
    playerPos: { x: number; y: number }
  ): void {
    const distance = Math.abs(pos.x - playerPos.x) + Math.abs(pos.y - playerPos.y)
    const healthPercent = fighter.hp / fighter.maxHp

    if (healthPercent < 0.3) {
      ai.state = 'fleeing'
    } else if (distance <= 8) {
      ai.state = 'hunting'
    } else {
      ai.state = 'idle'
    }
  }

  private getMove(
    ai: AI,
    pos: Position,
    playerPos: { x: number; y: number }
  ): { dx: number; dy: number } {
    switch (ai.state) {
      case 'hunting':
        return this.moveTowards(pos, playerPos)
      case 'fleeing':
        return this.moveAway(pos, playerPos)
      case 'idle':
      default:
        return this.wander()
    }
  }

  private moveTowards(
    from: Position,
    to: { x: number; y: number }
  ): { dx: number; dy: number } {
    const path = this.pathfinding.findPath(from.x, from.y, to.x, to.y)
    if (path.length > 1) {
      return {
        dx: path[1].x - from.x,
        dy: path[1].y - from.y
      }
    }

    // Simple fallback: move directly
    return {
      dx: Math.sign(to.x - from.x),
      dy: Math.sign(to.y - from.y)
    }
  }

  private moveAway(
    from: Position,
    threat: { x: number; y: number }
  ): { dx: number; dy: number } {
    return {
      dx: -Math.sign(threat.x - from.x),
      dy: -Math.sign(threat.y - from.y)
    }
  }

  private wander(): { dx: number; dy: number } {
    if (Math.random() < 0.7) {
      return { dx: 0, dy: 0 }
    }

    const directions = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 }
    ]
    return directions[Math.floor(Math.random() * directions.length)]
  }
}
