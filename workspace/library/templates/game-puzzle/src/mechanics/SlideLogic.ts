type Direction = 'up' | 'down' | 'left' | 'right'

interface MoveResult {
  moved: boolean
  scoreGained: number
  won: boolean
  moves: Array<{ fromX: number; fromY: number; toX: number; toY: number }>
  merges: Array<{ x: number; y: number; value: number }>
}

export class SlideLogic {
  private rows: number
  private cols: number
  private tiles: number[][]
  private hasWon = false

  constructor(rows: number, cols: number) {
    this.rows = rows
    this.cols = cols
    this.tiles = this.createEmptyGrid()
  }

  private createEmptyGrid(): number[][] {
    return Array.from({ length: this.rows }, () =>
      Array.from({ length: this.cols }, () => 0)
    )
  }

  reset(): void {
    this.tiles = this.createEmptyGrid()
    this.hasWon = false
  }

  getTiles(): number[][] {
    return this.tiles.map(row => [...row])
  }

  addRandomTile(): boolean {
    const empty: { row: number; col: number }[] = []

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.tiles[row][col] === 0) {
          empty.push({ row, col })
        }
      }
    }

    if (empty.length === 0) return false

    const { row, col } = empty[Math.floor(Math.random() * empty.length)]
    this.tiles[row][col] = Math.random() < 0.9 ? 2 : 4
    return true
  }

  slide(direction: Direction): MoveResult {
    const result: MoveResult = {
      moved: false,
      scoreGained: 0,
      won: false,
      moves: [],
      merges: []
    }

    const oldTiles = this.getTiles()

    switch (direction) {
      case 'up':
        this.slideUp(result)
        break
      case 'down':
        this.slideDown(result)
        break
      case 'left':
        this.slideLeft(result)
        break
      case 'right':
        this.slideRight(result)
        break
    }

    // Check if anything moved
    result.moved = this.tilesChanged(oldTiles, this.tiles)

    // Check for 2048
    if (!this.hasWon) {
      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.cols; col++) {
          if (this.tiles[row][col] === 2048) {
            this.hasWon = true
            result.won = true
          }
        }
      }
    }

    return result
  }

  private slideLeft(result: MoveResult): void {
    for (let row = 0; row < this.rows; row++) {
      const merged: boolean[] = Array(this.cols).fill(false)

      for (let col = 1; col < this.cols; col++) {
        if (this.tiles[row][col] === 0) continue

        let targetCol = col
        while (targetCol > 0 && this.tiles[row][targetCol - 1] === 0) {
          targetCol--
        }

        // Check for merge
        if (
          targetCol > 0 &&
          this.tiles[row][targetCol - 1] === this.tiles[row][col] &&
          !merged[targetCol - 1]
        ) {
          targetCol--
          const newValue = this.tiles[row][col] * 2
          this.tiles[row][targetCol] = newValue
          this.tiles[row][col] = 0
          merged[targetCol] = true
          result.scoreGained += newValue
          result.merges.push({ x: targetCol, y: row, value: newValue })
          result.moves.push({ fromX: col, fromY: row, toX: targetCol, toY: row })
        } else if (targetCol !== col) {
          this.tiles[row][targetCol] = this.tiles[row][col]
          this.tiles[row][col] = 0
          result.moves.push({ fromX: col, fromY: row, toX: targetCol, toY: row })
        }
      }
    }
  }

  private slideRight(result: MoveResult): void {
    for (let row = 0; row < this.rows; row++) {
      const merged: boolean[] = Array(this.cols).fill(false)

      for (let col = this.cols - 2; col >= 0; col--) {
        if (this.tiles[row][col] === 0) continue

        let targetCol = col
        while (targetCol < this.cols - 1 && this.tiles[row][targetCol + 1] === 0) {
          targetCol++
        }

        if (
          targetCol < this.cols - 1 &&
          this.tiles[row][targetCol + 1] === this.tiles[row][col] &&
          !merged[targetCol + 1]
        ) {
          targetCol++
          const newValue = this.tiles[row][col] * 2
          this.tiles[row][targetCol] = newValue
          this.tiles[row][col] = 0
          merged[targetCol] = true
          result.scoreGained += newValue
          result.merges.push({ x: targetCol, y: row, value: newValue })
          result.moves.push({ fromX: col, fromY: row, toX: targetCol, toY: row })
        } else if (targetCol !== col) {
          this.tiles[row][targetCol] = this.tiles[row][col]
          this.tiles[row][col] = 0
          result.moves.push({ fromX: col, fromY: row, toX: targetCol, toY: row })
        }
      }
    }
  }

  private slideUp(result: MoveResult): void {
    for (let col = 0; col < this.cols; col++) {
      const merged: boolean[] = Array(this.rows).fill(false)

      for (let row = 1; row < this.rows; row++) {
        if (this.tiles[row][col] === 0) continue

        let targetRow = row
        while (targetRow > 0 && this.tiles[targetRow - 1][col] === 0) {
          targetRow--
        }

        if (
          targetRow > 0 &&
          this.tiles[targetRow - 1][col] === this.tiles[row][col] &&
          !merged[targetRow - 1]
        ) {
          targetRow--
          const newValue = this.tiles[row][col] * 2
          this.tiles[targetRow][col] = newValue
          this.tiles[row][col] = 0
          merged[targetRow] = true
          result.scoreGained += newValue
          result.merges.push({ x: col, y: targetRow, value: newValue })
          result.moves.push({ fromX: col, fromY: row, toX: col, toY: targetRow })
        } else if (targetRow !== row) {
          this.tiles[targetRow][col] = this.tiles[row][col]
          this.tiles[row][col] = 0
          result.moves.push({ fromX: col, fromY: row, toX: col, toY: targetRow })
        }
      }
    }
  }

  private slideDown(result: MoveResult): void {
    for (let col = 0; col < this.cols; col++) {
      const merged: boolean[] = Array(this.rows).fill(false)

      for (let row = this.rows - 2; row >= 0; row--) {
        if (this.tiles[row][col] === 0) continue

        let targetRow = row
        while (targetRow < this.rows - 1 && this.tiles[targetRow + 1][col] === 0) {
          targetRow++
        }

        if (
          targetRow < this.rows - 1 &&
          this.tiles[targetRow + 1][col] === this.tiles[row][col] &&
          !merged[targetRow + 1]
        ) {
          targetRow++
          const newValue = this.tiles[row][col] * 2
          this.tiles[targetRow][col] = newValue
          this.tiles[row][col] = 0
          merged[targetRow] = true
          result.scoreGained += newValue
          result.merges.push({ x: col, y: targetRow, value: newValue })
          result.moves.push({ fromX: col, fromY: row, toX: col, toY: targetRow })
        } else if (targetRow !== row) {
          this.tiles[targetRow][col] = this.tiles[row][col]
          this.tiles[row][col] = 0
          result.moves.push({ fromX: col, fromY: row, toX: col, toY: targetRow })
        }
      }
    }
  }

  private tilesChanged(oldTiles: number[][], newTiles: number[][]): boolean {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (oldTiles[row][col] !== newTiles[row][col]) return true
      }
    }
    return false
  }

  isGameOver(): boolean {
    // Check for empty cells
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.tiles[row][col] === 0) return false
      }
    }

    // Check for possible merges
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const value = this.tiles[row][col]
        if (
          (col < this.cols - 1 && this.tiles[row][col + 1] === value) ||
          (row < this.rows - 1 && this.tiles[row + 1][col] === value)
        ) {
          return false
        }
      }
    }

    return true
  }
}
