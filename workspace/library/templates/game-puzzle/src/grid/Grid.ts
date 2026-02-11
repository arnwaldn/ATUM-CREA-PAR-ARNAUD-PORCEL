import Phaser from 'phaser'
import { Cell } from './Cell'

const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  2: { bg: '#eee4da', text: '#776e65' },
  4: { bg: '#ede0c8', text: '#776e65' },
  8: { bg: '#f2b179', text: '#f9f6f2' },
  16: { bg: '#f59563', text: '#f9f6f2' },
  32: { bg: '#f67c5f', text: '#f9f6f2' },
  64: { bg: '#f65e3b', text: '#f9f6f2' },
  128: { bg: '#edcf72', text: '#f9f6f2' },
  256: { bg: '#edcc61', text: '#f9f6f2' },
  512: { bg: '#edc850', text: '#f9f6f2' },
  1024: { bg: '#edc53f', text: '#f9f6f2' },
  2048: { bg: '#edc22e', text: '#f9f6f2' }
}

export class Grid {
  private scene: Phaser.Scene
  private rows: number
  private cols: number
  private cellSize: number
  private padding: number
  private cells: Cell[][] = []
  private container: Phaser.GameObjects.Container

  constructor(
    scene: Phaser.Scene,
    rows: number,
    cols: number,
    cellSize: number,
    padding: number
  ) {
    this.scene = scene
    this.rows = rows
    this.cols = cols
    this.cellSize = cellSize
    this.padding = padding

    const totalWidth = cols * cellSize + (cols + 1) * padding
    const totalHeight = rows * cellSize + (rows + 1) * padding
    const offsetX = (scene.cameras.main.width - totalWidth) / 2
    const offsetY = (scene.cameras.main.height - totalHeight) / 2

    this.container = scene.add.container(offsetX, offsetY)

    // Create background
    const bg = scene.add.rectangle(
      totalWidth / 2,
      totalHeight / 2,
      totalWidth,
      totalHeight,
      0xbbada0,
      1
    )
    bg.setStrokeStyle(0)
    this.container.add(bg)

    // Create empty cell backgrounds
    for (let row = 0; row < rows; row++) {
      this.cells[row] = []
      for (let col = 0; col < cols; col++) {
        const x = padding + col * (cellSize + padding) + cellSize / 2
        const y = padding + row * (cellSize + padding) + cellSize / 2

        const cellBg = scene.add.rectangle(x, y, cellSize, cellSize, 0xcdc1b4, 1)
        cellBg.setStrokeStyle(0)
        this.container.add(cellBg)

        this.cells[row][col] = new Cell(scene, this.container, x, y, cellSize)
      }
    }
  }

  render(tiles: number[][]): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const value = tiles[row][col]
        const colors = value > 0 ? TILE_COLORS[value] ?? TILE_COLORS[2048] : null
        this.cells[row][col].setValue(value, colors?.bg, colors?.text)
      }
    }
  }

  animateTile(
    fromCol: number,
    fromRow: number,
    toCol: number,
    toRow: number,
    onComplete: () => void
  ): void {
    const fromX = this.padding + fromCol * (this.cellSize + this.padding) + this.cellSize / 2
    const fromY = this.padding + fromRow * (this.cellSize + this.padding) + this.cellSize / 2
    const toX = this.padding + toCol * (this.cellSize + this.padding) + this.cellSize / 2
    const toY = this.padding + toRow * (this.cellSize + this.padding) + this.cellSize / 2

    this.cells[fromRow][fromCol].animateMove(toX - fromX, toY - fromY, onComplete)
  }

  animateMerge(col: number, row: number, onComplete: () => void): void {
    this.cells[row][col].animateMerge(onComplete)
  }

  animateSpawn(col: number, row: number): void {
    this.cells[row][col].animateSpawn()
  }

  clear(): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.cells[row][col].setValue(0, undefined, undefined)
      }
    }
  }

  getCellPosition(col: number, row: number): { x: number; y: number } {
    return {
      x: this.padding + col * (this.cellSize + this.padding) + this.cellSize / 2,
      y: this.padding + row * (this.cellSize + this.padding) + this.cellSize / 2
    }
  }
}
