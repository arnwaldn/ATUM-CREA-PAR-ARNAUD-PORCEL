import Phaser from 'phaser'

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private score = 0
  private scoreText!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'Game' })
  }

  create(): void {
    const { width, height } = this.cameras.main

    // Create player (replace with sprite later)
    this.player = this.add.rectangle(width / 2, height / 2, 50, 50, 0x00ff88)
    this.physics.add.existing(this.player)

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    playerBody.setCollideWorldBounds(true)

    // Setup input
    this.cursors = this.input.keyboard!.createCursorKeys()

    // UI
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    })

    // Instructions
    this.add.text(width / 2, height - 30, 'Use Arrow Keys to Move', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#888888'
    }).setOrigin(0.5)
  }

  update(): void {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    const speed = 300

    // Reset velocity
    playerBody.setVelocity(0)

    // Handle input
    if (this.cursors.left.isDown) {
      playerBody.setVelocityX(-speed)
    } else if (this.cursors.right.isDown) {
      playerBody.setVelocityX(speed)
    }

    if (this.cursors.up.isDown) {
      playerBody.setVelocityY(-speed)
    } else if (this.cursors.down.isDown) {
      playerBody.setVelocityY(speed)
    }
  }

  addScore(points: number): void {
    this.score += points
    this.scoreText.setText(`Score: ${this.score}`)
  }
}
