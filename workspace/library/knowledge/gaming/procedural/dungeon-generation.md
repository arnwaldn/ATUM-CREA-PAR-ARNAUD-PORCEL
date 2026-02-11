# Dungeon Generation

## BSP (Binary Space Partitioning)

```typescript
function bspGenerate(width, height, minSize = 6) {
  const root = { x: 0, y: 0, width, height }
  const leaves = [root]
  const rooms = []

  // Split recursively
  while (leaves.length > 0) {
    const leaf = leaves.pop()
    if (leaf.width > minSize * 2 || leaf.height > minSize * 2) {
      const [a, b] = split(leaf)
      leaves.push(a, b)
    } else {
      rooms.push(createRoom(leaf))
    }
  }

  // Connect rooms
  connectRooms(rooms)
  return rooms
}

function split(node) {
  const horizontal = node.width < node.height
  const splitPos = randomRange(0.3, 0.7)

  if (horizontal) {
    const splitY = Math.floor(node.y + node.height * splitPos)
    return [
      { ...node, height: splitY - node.y },
      { ...node, y: splitY, height: node.y + node.height - splitY }
    ]
  }
  // Similar for vertical...
}
```

## Cellular Automata (Caves)

```typescript
function generateCave(width, height, fillProbability = 0.45) {
  // Initialize randomly
  let map = initRandom(width, height, fillProbability)

  // Apply rules 4-5 times
  for (let i = 0; i < 5; i++) {
    map = applyCA(map)
  }

  return map
}

function applyCA(map) {
  return map.map((row, y) =>
    row.map((cell, x) => {
      const neighbors = countNeighbors(map, x, y)
      // B5678/S45678 - classic cave rule
      return neighbors >= 5 ? WALL : FLOOR
    })
  )
}
```

## Drunkard's Walk

```typescript
function drunkardWalk(width, height, coverage = 0.4) {
  const map = createFilled(width, height, WALL)
  let x = Math.floor(width / 2)
  let y = Math.floor(height / 2)
  let carved = 0
  const target = width * height * coverage

  while (carved < target) {
    if (map[y][x] === WALL) {
      map[y][x] = FLOOR
      carved++
    }

    const dir = randomDirection()
    x = clamp(x + dir.dx, 1, width - 2)
    y = clamp(y + dir.dy, 1, height - 2)
  }

  return map
}
```
