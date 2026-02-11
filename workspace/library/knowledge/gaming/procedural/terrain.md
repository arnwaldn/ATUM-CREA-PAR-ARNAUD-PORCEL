# Terrain Generation

## Perlin Noise

```typescript
// Using simplex-noise library
import { createNoise2D } from 'simplex-noise'

const noise2D = createNoise2D()

function generateHeightmap(width: number, height: number): number[][] {
  const map: number[][] = []

  for (let y = 0; y < height; y++) {
    map[y] = []
    for (let x = 0; x < width; x++) {
      // Combine multiple octaves
      let value = 0
      let amplitude = 1
      let frequency = 0.01
      let maxValue = 0

      for (let octave = 0; octave < 4; octave++) {
        value += noise2D(x * frequency, y * frequency) * amplitude
        maxValue += amplitude
        amplitude *= 0.5
        frequency *= 2
      }

      map[y][x] = (value / maxValue + 1) / 2 // Normalize to 0-1
    }
  }

  return map
}
```

## Biome Assignment

```typescript
interface Biome {
  name: string
  color: number
  minHeight: number
  maxHeight: number
  minMoisture: number
  maxMoisture: number
}

const BIOMES: Biome[] = [
  { name: 'ocean', color: 0x0066cc, minHeight: 0, maxHeight: 0.3, minMoisture: 0, maxMoisture: 1 },
  { name: 'beach', color: 0xffee99, minHeight: 0.3, maxHeight: 0.35, minMoisture: 0, maxMoisture: 1 },
  { name: 'desert', color: 0xddcc55, minHeight: 0.35, maxHeight: 0.6, minMoisture: 0, maxMoisture: 0.3 },
  { name: 'grass', color: 0x33aa33, minHeight: 0.35, maxHeight: 0.6, minMoisture: 0.3, maxMoisture: 0.7 },
  { name: 'forest', color: 0x228822, minHeight: 0.35, maxHeight: 0.6, minMoisture: 0.7, maxMoisture: 1 },
  { name: 'mountain', color: 0x888888, minHeight: 0.6, maxHeight: 0.8, minMoisture: 0, maxMoisture: 1 },
  { name: 'snow', color: 0xffffff, minHeight: 0.8, maxHeight: 1, minMoisture: 0, maxMoisture: 1 }
]

function getBiome(height: number, moisture: number): Biome {
  return BIOMES.find(b =>
    height >= b.minHeight && height < b.maxHeight &&
    moisture >= b.minMoisture && moisture < b.maxMoisture
  ) ?? BIOMES[0]
}
```

## Diamond-Square Algorithm

```typescript
function diamondSquare(size: number, roughness: number): number[][] {
  // Size must be 2^n + 1
  const map: number[][] = Array(size).fill(0).map(() => Array(size).fill(0))

  // Initialize corners
  map[0][0] = Math.random()
  map[0][size-1] = Math.random()
  map[size-1][0] = Math.random()
  map[size-1][size-1] = Math.random()

  let step = size - 1
  let scale = roughness

  while (step > 1) {
    const half = step / 2

    // Diamond step
    for (let y = half; y < size - 1; y += step) {
      for (let x = half; x < size - 1; x += step) {
        const avg = (
          map[y - half][x - half] +
          map[y - half][x + half] +
          map[y + half][x - half] +
          map[y + half][x + half]
        ) / 4
        map[y][x] = avg + (Math.random() - 0.5) * scale
      }
    }

    // Square step
    // ... (similar pattern for edge midpoints)

    step = half
    scale *= 0.5
  }

  return map
}
```

## Chunk-Based Infinite Terrain

```typescript
class ChunkManager {
  private chunks = new Map<string, Chunk>()
  private loadRadius = 3

  update(playerChunkX: number, playerChunkY: number) {
    // Load nearby chunks
    for (let dy = -this.loadRadius; dy <= this.loadRadius; dy++) {
      for (let dx = -this.loadRadius; dx <= this.loadRadius; dx++) {
        const key = `${playerChunkX + dx},${playerChunkY + dy}`
        if (!this.chunks.has(key)) {
          this.chunks.set(key, this.generateChunk(playerChunkX + dx, playerChunkY + dy))
        }
      }
    }

    // Unload far chunks
    for (const [key, chunk] of this.chunks) {
      const [cx, cy] = key.split(',').map(Number)
      if (Math.abs(cx - playerChunkX) > this.loadRadius + 1 ||
          Math.abs(cy - playerChunkY) > this.loadRadius + 1) {
        this.chunks.delete(key)
      }
    }
  }
}
```
