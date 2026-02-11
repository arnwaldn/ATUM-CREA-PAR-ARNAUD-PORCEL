import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' })
  }

  preload(): void {
    // Load minimal assets needed for preloader
    // Example: this.load.image('logo', 'assets/logo.png')
  }

  create(): void {
    // Set up game settings
    this.scale.refresh()

    // Proceed to preloader
    this.scene.start('Preloader')
  }
}
