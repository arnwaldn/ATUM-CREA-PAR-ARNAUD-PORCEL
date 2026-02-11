import type { World } from '../ecs/World'
import type { DungeonGenerator } from '../map/DungeonGenerator'
import type { FOV } from '../utils/FOV'
import { Position, Renderable } from '../components'

export class RenderSystem {
  private ctx: CanvasRenderingContext2D
  private tileSize: number

  constructor(canvas: HTMLCanvasElement, tileSize: number) {
    this.ctx = canvas.getContext('2d')!
    this.tileSize = tileSize
    this.ctx.font = `${tileSize}px monospace`
    this.ctx.textBaseline = 'top'
  }

  render(world: World, dungeon: DungeonGenerator, fov: FOV): void {
    const { ctx, tileSize } = this

    // Clear
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Render map
    const map = dungeon.getMap()
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const tile = map[y][x]
        const visible = fov.isVisible(x, y)
        const explored = dungeon.isExplored(x, y)

        if (!visible && !explored) continue

        const alpha = visible ? 1 : 0.4
        let char = ' '
        let color = '#333'

        switch (tile) {
          case 0: // Wall
            char = '#'
            color = visible ? '#666' : '#333'
            break
          case 1: // Floor
            char = '.'
            color = visible ? '#444' : '#222'
            break
          case 2: // Stairs
            char = '>'
            color = visible ? '#ffeaa7' : '#665'
            break
        }

        ctx.globalAlpha = alpha
        ctx.fillStyle = color
        ctx.fillText(char, x * tileSize, y * tileSize)
      }
    }

    ctx.globalAlpha = 1

    // Render entities
    const entities = world.query(['Position', 'Renderable'])
    entities.forEach(entity => {
      const pos = world.getComponent<Position>(entity, 'Position')!
      const renderable = world.getComponent<Renderable>(entity, 'Renderable')!

      if (fov.isVisible(pos.x, pos.y)) {
        ctx.fillStyle = renderable.color
        ctx.fillText(renderable.char, pos.x * tileSize, pos.y * tileSize)
      }
    })
  }
}
