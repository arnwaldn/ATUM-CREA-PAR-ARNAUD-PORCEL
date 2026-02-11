# 2048 Game Patterns

## Core Algorithm

```typescript
function slideRow(row: number[]): { row: number[]; score: number; moved: boolean } {
  // Remove zeros
  const filtered = row.filter(x => x !== 0)
  const merged: number[] = []
  let score = 0

  // Merge adjacent equal values
  let i = 0
  while (i < filtered.length) {
    if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
      merged.push(filtered[i] * 2)
      score += filtered[i] * 2
      i += 2
    } else {
      merged.push(filtered[i])
      i++
    }
  }

  // Pad with zeros
  while (merged.length < row.length) {
    merged.push(0)
  }

  const moved = row.some((v, i) => v !== merged[i])
  return { row: merged, score, moved }
}

function slideGrid(grid: number[][], direction: 'left' | 'right' | 'up' | 'down') {
  let totalScore = 0
  let anyMoved = false

  // Rotate grid to always slide left
  const rotated = rotateForDirection(grid, direction)

  for (let y = 0; y < rotated.length; y++) {
    const { row, score, moved } = slideRow(rotated[y])
    rotated[y] = row
    totalScore += score
    anyMoved = anyMoved || moved
  }

  // Rotate back
  const result = rotateBack(rotated, direction)
  return { grid: result, score: totalScore, moved: anyMoved }
}
```

## Tile Spawning

```typescript
function spawnTile(grid: number[][]): { x: number; y: number; value: number } | null {
  const empty: { x: number; y: number }[] = []

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === 0) {
        empty.push({ x, y })
      }
    }
  }

  if (empty.length === 0) return null

  const pos = empty[Math.floor(Math.random() * empty.length)]
  const value = Math.random() < 0.9 ? 2 : 4  // 90% chance of 2

  grid[pos.y][pos.x] = value
  return { ...pos, value }
}
```

## Game State

```typescript
function checkGameOver(grid: number[][]): boolean {
  // Check for empty cells
  for (const row of grid) {
    if (row.includes(0)) return false
  }

  // Check for possible merges
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const val = grid[y][x]
      if (x < grid[y].length - 1 && grid[y][x + 1] === val) return false
      if (y < grid.length - 1 && grid[y + 1][x] === val) return false
    }
  }

  return true
}

function checkWin(grid: number[][]): boolean {
  return grid.some(row => row.some(cell => cell >= 2048))
}
```

## Animation

```typescript
interface TileAnimation {
  type: 'spawn' | 'move' | 'merge'
  fromX?: number
  fromY?: number
  toX: number
  toY: number
  value: number
  progress: number
}

class AnimatedGrid {
  private animations: TileAnimation[] = []

  animateMove(fromX: number, fromY: number, toX: number, toY: number, value: number) {
    this.animations.push({
      type: 'move',
      fromX, fromY, toX, toY, value,
      progress: 0
    })
  }

  animateSpawn(x: number, y: number, value: number) {
    this.animations.push({
      type: 'spawn',
      toX: x, toY: y, value,
      progress: 0
    })
  }

  update(dt: number) {
    for (const anim of this.animations) {
      anim.progress = Math.min(1, anim.progress + dt * 5)
    }
    this.animations = this.animations.filter(a => a.progress < 1)
  }
}
```

## Tile Colors

```typescript
const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  2:    { bg: '#eee4da', text: '#776e65' },
  4:    { bg: '#ede0c8', text: '#776e65' },
  8:    { bg: '#f2b179', text: '#f9f6f2' },
  16:   { bg: '#f59563', text: '#f9f6f2' },
  32:   { bg: '#f67c5f', text: '#f9f6f2' },
  64:   { bg: '#f65e3b', text: '#f9f6f2' },
  128:  { bg: '#edcf72', text: '#f9f6f2' },
  256:  { bg: '#edcc61', text: '#f9f6f2' },
  512:  { bg: '#edc850', text: '#f9f6f2' },
  1024: { bg: '#edc53f', text: '#f9f6f2' },
  2048: { bg: '#edc22e', text: '#f9f6f2' }
}
```
