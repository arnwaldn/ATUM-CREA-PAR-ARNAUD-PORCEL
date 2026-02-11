import type { World } from '../ecs/World'
import type { DungeonGenerator } from '../map/DungeonGenerator'
import { Position } from '../components'

export class MovementSystem {
  private dungeon: DungeonGenerator

  constructor(dungeon: DungeonGenerator) {
    this.dungeon = dungeon
  }

  move(world: World, entity: number, dx: number, dy: number): boolean {
    const pos = world.getComponent<Position>(entity, 'Position')
    if (!pos) return false

    const newX = pos.x + dx
    const newY = pos.y + dy

    if (this.dungeon.isWalkable(newX, newY)) {
      pos.x = newX
      pos.y = newY
      return true
    }

    return false
  }

  teleport(world: World, entity: number, x: number, y: number): boolean {
    const pos = world.getComponent<Position>(entity, 'Position')
    if (!pos) return false

    if (this.dungeon.isWalkable(x, y)) {
      pos.x = x
      pos.y = y
      return true
    }

    return false
  }
}
