# Phaser 3 Best Practices

## Scene Structure

```typescript
class GameScene extends Phaser.Scene {
  // Type declarations
  private player!: Phaser.Physics.Arcade.Sprite
  private enemies!: Phaser.Physics.Arcade.Group

  init(data: GameData) {
    // Receive data from previous scene
  }

  preload() {
    // Load assets - show progress
    this.load.on('progress', (value) => {
      // Update loading bar
    })
  }

  create() {
    // Create game objects
    this.createPlayer()
    this.createEnemies()
    this.setupCollisions()
    this.setupInput()
  }

  update(time: number, delta: number) {
    // Game loop - use delta for framerate independence
    this.player.update(delta)
  }
}
```

## Asset Loading

```typescript
// Texture atlas (recommended)
this.load.atlas('sprites', 'sprites.png', 'sprites.json')

// Audio with fallback
this.load.audio('music', ['music.ogg', 'music.mp3'])
```

## Physics

```typescript
// Arcade - performant
this.physics.add.collider(player, platforms)
this.physics.add.overlap(player, coins, collectCoin)

// Use groups for efficiency
this.enemies = this.physics.add.group({
  maxSize: 50,
  classType: Enemy,
  runChildUpdate: true
})
```

## Mobile Optimization

```typescript
// Responsive canvas
const config = {
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
}

// Touch input
this.input.addPointer(2)
this.input.on('pointerdown', handleTouch)
```

## Memory Management

```typescript
// Clean up on scene shutdown
shutdown() {
  this.events.off('update')
  this.input.off('pointerdown')
}

// Reuse objects with pools
const bulletPool = this.add.group({
  classType: Bullet,
  maxSize: 100,
  runChildUpdate: true
})
```
