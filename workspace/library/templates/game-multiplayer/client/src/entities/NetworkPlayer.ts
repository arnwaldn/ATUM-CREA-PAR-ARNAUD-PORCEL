import Phaser from 'phaser'
import type { PlayerInput } from '@game/shared'

export class NetworkPlayer {
  private scene: Phaser.Scene
  private sprite: Phaser.GameObjects.Container
  private body: Phaser.GameObjects.Arc
  private nameText: Phaser.GameObjects.Text
  private isLocal: boolean

  private serverX = 0
  private serverY = 0
  private interpolationSpeed = 0.2

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    color: string,
    name: string,
    isLocal = false
  ) {
    this.scene = scene
    this.isLocal = isLocal

    // Create player body (circle)
    this.body = scene.add.circle(0, 0, 20, Phaser.Display.Color.HexStringToColor(color).color)

    // Create name label
    this.nameText = scene.add.text(0, -35, name, {
      fontSize: '12px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5)

    // Container for player elements
    this.sprite = scene.add.container(x, y, [this.body, this.nameText])

    // Add local player indicator
    if (isLocal) {
      const indicator = scene.add.circle(0, -25, 4, 0x4ecdc4)
      this.sprite.add(indicator)
    }

    this.serverX = x
    this.serverY = y
  }

  syncFromServer(x: number, y: number) {
    this.serverX = x
    this.serverY = y

    if (!this.isLocal) {
      // Interpolate remote players
      this.sprite.x = Phaser.Math.Linear(this.sprite.x, x, this.interpolationSpeed)
      this.sprite.y = Phaser.Math.Linear(this.sprite.y, y, this.interpolationSpeed)
    }
  }

  applyLocalInput(input: PlayerInput) {
    if (!this.isLocal) return

    const speed = 5

    if (input.left) this.sprite.x -= speed
    if (input.right) this.sprite.x += speed
    if (input.up) this.sprite.y -= speed
    if (input.down) this.sprite.y += speed

    // Reconcile with server position (simple approach)
    const dx = this.serverX - this.sprite.x
    const dy = this.serverY - this.sprite.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // If too far from server, snap back
    if (distance > 50) {
      this.sprite.x = this.serverX
      this.sprite.y = this.serverY
    }
  }

  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y }
  }

  destroy() {
    this.sprite.destroy()
  }
}
