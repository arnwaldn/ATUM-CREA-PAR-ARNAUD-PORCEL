# Puzzle Game Design

## 2048 Mechanics

```typescript
// Core slide logic
function slide(grid, direction) {
  const merged = new Set()

  for (each cell in direction order) {
    // Move as far as possible
    let targetPos = findFarthestEmpty(cell, direction)

    // Check merge with adjacent
    const adjacent = getAdjacent(targetPos, direction)
    if (adjacent && adjacent.value === cell.value && !merged.has(adjacent)) {
      merge(cell, adjacent)
      merged.add(adjacent)
      score += adjacent.value
    } else {
      moveTo(cell, targetPos)
    }
  }

  if (moved) spawnNewTile()
}
```

## Match-3 Mechanics

```typescript
// Find matches
function findMatches(grid) {
  const matches = []

  // Horizontal
  for (let y = 0; y < height; y++) {
    let run = [grid[y][0]]
    for (let x = 1; x < width; x++) {
      if (grid[y][x].type === run[0].type) {
        run.push(grid[y][x])
      } else {
        if (run.length >= 3) matches.push(run)
        run = [grid[y][x]]
      }
    }
    if (run.length >= 3) matches.push(run)
  }

  // Similar for vertical
  return matches
}

// Cascade
function cascade() {
  removeMatches()
  dropTiles()
  fillEmpty()

  const newMatches = findMatches()
  if (newMatches.length > 0) {
    comboMultiplier++
    cascade() // Recursive
  }
}
```

## Polish

### Juice
- Tile pop on merge
- Screen shake on big combos
- Particle effects
- Satisfying sounds

### Feedback
- Preview next tile
- Undo option
- Score animation
