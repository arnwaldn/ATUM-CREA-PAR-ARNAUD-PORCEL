import { FOV as RotFOV } from 'rot-js'

export class FOV {
  private width: number
  private height: number
  private visible: boolean[][] = []

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.clear()
  }

  clear(): void {
    this.visible = []
    for (let y = 0; y < this.height; y++) {
      this.visible[y] = []
      for (let x = 0; x < this.width; x++) {
        this.visible[y][x] = false
      }
    }
  }

  compute(
    originX: number,
    originY: number,
    radius: number,
    isTransparent: (x: number, y: number) => boolean
  ): void {
    this.clear()

    const fov = new RotFOV.PreciseShadowcasting((x, y) => {
      if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false
      return isTransparent(x, y)
    })

    fov.compute(originX, originY, radius, (x, y, _r, _visibility) => {
      if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        this.visible[y][x] = true
      }
    })
  }

  isVisible(x: number, y: number): boolean {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false
    return this.visible[y][x]
  }
}
