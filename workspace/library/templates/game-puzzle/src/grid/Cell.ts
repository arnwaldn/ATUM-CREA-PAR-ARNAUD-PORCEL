import Phaser from 'phaser'

export class Cell {
  private scene: Phaser.Scene
  private container: Phaser.GameObjects.Container
  private x: number
  private y: number
  private size: number

  private tile: Phaser.GameObjects.Rectangle | null = null
  private text: Phaser.GameObjects.Text | null = null
  private value = 0

  constructor(
    scene: Phaser.Scene,
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    size: number
  ) {
    this.scene = scene
    this.container = container
    this.x = x
    this.y = y
    this.size = size
  }

  setValue(value: number, bgColor?: string, textColor?: string): void {
    this.value = value

    // Remove old elements
    if (this.tile) {
      this.tile.destroy()
      this.tile = null
    }
    if (this.text) {
      this.text.destroy()
      this.text = null
    }

    if (value === 0) return

    // Create tile background
    const color = Phaser.Display.Color.HexStringToColor(bgColor ?? '#eee4da')
    this.tile = this.scene.add.rectangle(this.x, this.y, this.size - 4, this.size - 4, color.color)
    this.tile.setStrokeStyle(0)
    this.container.add(this.tile)

    // Create text
    const fontSize = value >= 1000 ? '28px' : value >= 100 ? '32px' : '36px'
    this.text = this.scene.add.text(this.x, this.y, String(value), {
      fontSize,
      color: textColor ?? '#776e65',
      fontStyle: 'bold',
      fontFamily: 'Arial'
    }).setOrigin(0.5)
    this.container.add(this.text)
  }

  animateMove(dx: number, dy: number, onComplete: () => void): void {
    if (!this.tile || !this.text) {
      onComplete()
      return
    }

    const duration = 100

    this.scene.tweens.add({
      targets: [this.tile, this.text],
      x: `+=${dx}`,
      y: `+=${dy}`,
      duration,
      ease: 'Power2',
      onComplete
    })
  }

  animateMerge(onComplete: () => void): void {
    if (!this.tile || !this.text) {
      onComplete()
      return
    }

    this.scene.tweens.add({
      targets: [this.tile, this.text],
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Bounce.easeOut',
      onComplete
    })
  }

  animateSpawn(): void {
    if (!this.tile || !this.text) return

    this.tile.setScale(0)
    this.text.setScale(0)

    this.scene.tweens.add({
      targets: [this.tile, this.text],
      scaleX: 1,
      scaleY: 1,
      duration: 150,
      ease: 'Back.easeOut'
    })
  }

  getValue(): number {
    return this.value
  }
}
