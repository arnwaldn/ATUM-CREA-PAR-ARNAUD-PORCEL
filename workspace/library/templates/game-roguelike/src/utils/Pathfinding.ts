import { Path } from 'rot-js'
import type { DungeonGenerator } from '../map/DungeonGenerator'

interface Point {
  x: number
  y: number
}

export class Pathfinding {
  private dungeon: DungeonGenerator

  constructor(dungeon: DungeonGenerator) {
    this.dungeon = dungeon
  }

  findPath(fromX: number, fromY: number, toX: number, toY: number): Point[] {
    const path: Point[] = []

    const astar = new Path.AStar(
      toX,
      toY,
      (x, y) => this.dungeon.isWalkable(x, y),
      { topology: 8 }
    )

    astar.compute(fromX, fromY, (x, y) => {
      path.push({ x, y })
    })

    return path
  }

  // Simple line-of-sight check
  hasLineOfSight(fromX: number, fromY: number, toX: number, toY: number): boolean {
    const dx = Math.abs(toX - fromX)
    const dy = Math.abs(toY - fromY)
    const sx = fromX < toX ? 1 : -1
    const sy = fromY < toY ? 1 : -1
    let err = dx - dy

    let x = fromX
    let y = fromY

    while (x !== toX || y !== toY) {
      if (!this.dungeon.isTransparent(x, y)) {
        return false
      }

      const e2 = 2 * err
      if (e2 > -dy) {
        err -= dy
        x += sx
      }
      if (e2 < dx) {
        err += dx
        y += sy
      }
    }

    return true
  }

  // Get neighbors for pathfinding
  getNeighbors(x: number, y: number, allowDiagonal = true): Point[] {
    const neighbors: Point[] = []
    const directions = allowDiagonal
      ? [[-1,-1], [0,-1], [1,-1], [-1,0], [1,0], [-1,1], [0,1], [1,1]]
      : [[0,-1], [-1,0], [1,0], [0,1]]

    for (const [dx, dy] of directions) {
      const nx = x + dx
      const ny = y + dy
      if (this.dungeon.isWalkable(nx, ny)) {
        neighbors.push({ x: nx, y: ny })
      }
    }

    return neighbors
  }

  // Manhattan distance
  distance(fromX: number, fromY: number, toX: number, toY: number): number {
    return Math.abs(toX - fromX) + Math.abs(toY - fromY)
  }
}
