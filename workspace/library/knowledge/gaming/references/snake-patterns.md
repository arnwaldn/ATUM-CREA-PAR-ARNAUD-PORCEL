# Snake Game Patterns

## Core Data Structure

```typescript
interface Point {
  x: number
  y: number
}

class Snake {
  body: Point[] = []
  direction: Point = { x: 1, y: 0 }
  growing = false

  constructor(startX: number, startY: number, length: number) {
    for (let i = 0; i < length; i++) {
      this.body.push({ x: startX - i, y: startY })
    }
  }

  get head(): Point {
    return this.body[0]
  }

  move() {
    const newHead = {
      x: this.head.x + this.direction.x,
      y: this.head.y + this.direction.y
    }

    this.body.unshift(newHead)

    if (!this.growing) {
      this.body.pop()
    }
    this.growing = false
  }

  grow() {
    this.growing = true
  }

  setDirection(dx: number, dy: number) {
    // Prevent 180-degree turns
    if (this.direction.x + dx !== 0 || this.direction.y + dy !== 0) {
      this.direction = { x: dx, y: dy }
    }
  }
}
```

## Collision Detection

```typescript
function checkCollisions(snake: Snake, gridWidth: number, gridHeight: number): string | null {
  const head = snake.head

  // Wall collision
  if (head.x < 0 || head.x >= gridWidth ||
      head.y < 0 || head.y >= gridHeight) {
    return 'wall'
  }

  // Self collision (skip head)
  for (let i = 1; i < snake.body.length; i++) {
    if (head.x === snake.body[i].x && head.y === snake.body[i].y) {
      return 'self'
    }
  }

  return null
}
```

## Food Spawning

```typescript
function spawnFood(snake: Snake, gridWidth: number, gridHeight: number): Point {
  const occupied = new Set(
    snake.body.map(p => `${p.x},${p.y}`)
  )

  const available: Point[] = []
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      if (!occupied.has(`${x},${y}`)) {
        available.push({ x, y })
      }
    }
  }

  return available[Math.floor(Math.random() * available.length)]
}
```

## Input Buffering

```typescript
class InputBuffer {
  private buffer: Point[] = []
  private maxBuffer = 2

  add(direction: Point) {
    if (this.buffer.length < this.maxBuffer) {
      this.buffer.push(direction)
    }
  }

  consume(): Point | null {
    return this.buffer.shift() ?? null
  }
}

// Usage in game loop
const bufferedInput = inputBuffer.consume()
if (bufferedInput) {
  snake.setDirection(bufferedInput.x, bufferedInput.y)
}
```

## Speed Progression

```typescript
class SpeedController {
  private baseSpeed = 150 // ms per move
  private minSpeed = 50
  private speedDecrease = 5 // ms per food eaten

  getInterval(score: number): number {
    return Math.max(
      this.minSpeed,
      this.baseSpeed - score * this.speedDecrease
    )
  }
}
```

## Wrapping Mode (Alternative)

```typescript
function wrapPosition(pos: Point, gridWidth: number, gridHeight: number): Point {
  return {
    x: (pos.x + gridWidth) % gridWidth,
    y: (pos.y + gridHeight) % gridHeight
  }
}

// In Snake.move():
move() {
  const newHead = wrapPosition({
    x: this.head.x + this.direction.x,
    y: this.head.y + this.direction.y
  }, this.gridWidth, this.gridHeight)

  this.body.unshift(newHead)
  // ...
}
```

## Power-Ups

```typescript
enum PowerUpType {
  SpeedBoost = 'speed',
  SlowDown = 'slow',
  Shrink = 'shrink',
  Ghost = 'ghost'  // Pass through self
}

class PowerUpManager {
  private active: Map<PowerUpType, number> = new Map()

  activate(type: PowerUpType, duration: number) {
    this.active.set(type, Date.now() + duration)
  }

  isActive(type: PowerUpType): boolean {
    const expiry = this.active.get(type)
    if (!expiry) return false
    if (Date.now() > expiry) {
      this.active.delete(type)
      return false
    }
    return true
  }
}
```

## High Score Storage

```typescript
class HighScoreManager {
  private key = 'snake_high_scores'
  private maxScores = 10

  getScores(): { name: string; score: number }[] {
    const data = localStorage.getItem(this.key)
    return data ? JSON.parse(data) : []
  }

  addScore(name: string, score: number): number {
    const scores = this.getScores()
    scores.push({ name, score })
    scores.sort((a, b) => b.score - a.score)
    scores.splice(this.maxScores)

    localStorage.setItem(this.key, JSON.stringify(scores))

    return scores.findIndex(s => s.name === name && s.score === score) + 1
  }
}
```
