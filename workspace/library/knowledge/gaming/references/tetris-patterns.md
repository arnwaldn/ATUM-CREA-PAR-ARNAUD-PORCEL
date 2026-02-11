# Tetris Game Patterns

## Tetromino Definitions

```typescript
const TETROMINOES = {
  I: {
    rotations: [
      [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
      [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]],
      [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]],
      [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]]
    ],
    color: 0x00f0f0
  },
  O: {
    rotations: [
      [[1,1], [1,1]]
    ],
    color: 0xf0f000
  },
  T: {
    rotations: [
      [[0,1,0], [1,1,1], [0,0,0]],
      [[0,1,0], [0,1,1], [0,1,0]],
      [[0,0,0], [1,1,1], [0,1,0]],
      [[0,1,0], [1,1,0], [0,1,0]]
    ],
    color: 0xa000f0
  },
  // S, Z, J, L similar...
}
```

## Rotation System (SRS)

```typescript
// Super Rotation System - Wall Kick Data
const WALL_KICKS = {
  'JLSTZ': {
    '0>1': [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]],
    '1>0': [[0,0], [1,0], [1,-1], [0,2], [1,2]],
    '1>2': [[0,0], [1,0], [1,-1], [0,2], [1,2]],
    '2>1': [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]],
    '2>3': [[0,0], [1,0], [1,1], [0,-2], [1,-2]],
    '3>2': [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],
    '3>0': [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],
    '0>3': [[0,0], [1,0], [1,1], [0,-2], [1,-2]]
  }
}

function tryRotate(piece: Piece, direction: 1 | -1): boolean {
  const newRotation = (piece.rotation + direction + 4) % 4
  const kicks = WALL_KICKS[piece.type][`${piece.rotation}>${newRotation}`]

  for (const [dx, dy] of kicks) {
    if (!checkCollision(piece.x + dx, piece.y + dy, newRotation)) {
      piece.x += dx
      piece.y += dy
      piece.rotation = newRotation
      return true
    }
  }
  return false
}
```

## Line Clear

```typescript
function clearLines(board: number[][]): { clearedLines: number[]; score: number } {
  const clearedLines: number[] = []

  for (let y = board.length - 1; y >= 0; y--) {
    if (board[y].every(cell => cell !== 0)) {
      clearedLines.push(y)
    }
  }

  // Remove cleared lines
  for (const lineY of clearedLines) {
    board.splice(lineY, 1)
    board.unshift(new Array(board[0].length).fill(0))
  }

  // Scoring (classic)
  const scores = [0, 100, 300, 500, 800]
  return { clearedLines, score: scores[clearedLines.length] }
}
```

## Lock Delay

```typescript
class LockDelaySystem {
  private lockTimer = 0
  private lockDelay = 500 // ms
  private moveResetCount = 0
  private maxResets = 15

  update(dt: number, piece: Piece, board: Board): boolean {
    if (!piece.isOnGround(board)) {
      this.lockTimer = 0
      return false
    }

    this.lockTimer += dt

    if (this.lockTimer >= this.lockDelay) {
      return true // Lock the piece
    }
    return false
  }

  onMove() {
    if (this.moveResetCount < this.maxResets) {
      this.lockTimer = 0
      this.moveResetCount++
    }
  }

  reset() {
    this.lockTimer = 0
    this.moveResetCount = 0
  }
}
```

## 7-Bag Randomizer

```typescript
class BagRandomizer {
  private bag: string[] = []

  next(): string {
    if (this.bag.length === 0) {
      this.bag = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']
      this.shuffle()
    }
    return this.bag.pop()!
  }

  private shuffle() {
    for (let i = this.bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]]
    }
  }

  preview(count: number): string[] {
    while (this.bag.length < count) {
      const newBag = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']
      this.shuffle.call({ bag: newBag })
      this.bag = [...newBag, ...this.bag]
    }
    return this.bag.slice(-count).reverse()
  }
}
```

## Ghost Piece

```typescript
function getGhostPosition(piece: Piece, board: Board): number {
  let ghostY = piece.y

  while (!checkCollision(piece.x, ghostY + 1, piece.rotation, board)) {
    ghostY++
  }

  return ghostY
}
```
