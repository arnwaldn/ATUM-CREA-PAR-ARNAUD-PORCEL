import Phaser from 'phaser'
import { Grid } from '../grid/Grid'
import { SlideLogic } from '../mechanics/SlideLogic'

export class GameScene extends Phaser.Scene {
  private grid!: Grid
  private logic!: SlideLogic
  private score = 0
  private bestScore = 0
  private isAnimating = false

  private swipeStartX = 0
  private swipeStartY = 0

  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    // Load best score from storage
    this.bestScore = parseInt(localStorage.getItem('puzzle_best') ?? '0', 10)
    this.updateScoreDisplay()

    // Create grid and logic
    this.grid = new Grid(this, 4, 4, 90, 10)
    this.logic = new SlideLogic(4, 4)

    // Add initial tiles
    this.addRandomTile()
    this.addRandomTile()
    this.renderGrid()

    // Setup input
    this.setupInput()
  }

  private setupInput(): void {
    // Keyboard
    this.input.keyboard?.on('keydown-UP', () => this.move('up'))
    this.input.keyboard?.on('keydown-DOWN', () => this.move('down'))
    this.input.keyboard?.on('keydown-LEFT', () => this.move('left'))
    this.input.keyboard?.on('keydown-RIGHT', () => this.move('right'))

    // Touch/swipe
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.swipeStartX = pointer.x
      this.swipeStartY = pointer.y
    })

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      const dx = pointer.x - this.swipeStartX
      const dy = pointer.y - this.swipeStartY
      const minSwipe = 50

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > minSwipe) this.move('right')
        else if (dx < -minSwipe) this.move('left')
      } else {
        if (dy > minSwipe) this.move('down')
        else if (dy < -minSwipe) this.move('up')
      }
    })

    // R to restart
    this.input.keyboard?.on('keydown-R', () => this.restart())
  }

  private move(direction: 'up' | 'down' | 'left' | 'right'): void {
    if (this.isAnimating) return

    const result = this.logic.slide(direction)

    if (result.moved) {
      this.isAnimating = true

      // Add score
      this.score += result.scoreGained
      if (this.score > this.bestScore) {
        this.bestScore = this.score
        localStorage.setItem('puzzle_best', String(this.bestScore))
      }
      this.updateScoreDisplay()

      // Animate tiles
      this.animateMoves(result.moves, () => {
        // Check for merges
        this.animateMerges(result.merges, () => {
          // Add new tile
          this.addRandomTile()
          this.renderGrid()

          // Check game over
          if (this.logic.isGameOver()) {
            this.showGameOver()
          }

          // Check win
          if (result.won) {
            this.showWin()
          }

          this.isAnimating = false
        })
      })
    }
  }

  private addRandomTile(): void {
    this.logic.addRandomTile()
  }

  private renderGrid(): void {
    const tiles = this.logic.getTiles()
    this.grid.render(tiles)
  }

  private animateMoves(
    moves: Array<{ fromX: number; fromY: number; toX: number; toY: number }>,
    onComplete: () => void
  ): void {
    if (moves.length === 0) {
      onComplete()
      return
    }

    let completed = 0
    moves.forEach(move => {
      this.grid.animateTile(move.fromX, move.fromY, move.toX, move.toY, () => {
        completed++
        if (completed === moves.length) {
          onComplete()
        }
      })
    })
  }

  private animateMerges(
    merges: Array<{ x: number; y: number; value: number }>,
    onComplete: () => void
  ): void {
    if (merges.length === 0) {
      onComplete()
      return
    }

    let completed = 0
    merges.forEach(merge => {
      this.grid.animateMerge(merge.x, merge.y, () => {
        completed++
        if (completed === merges.length) {
          onComplete()
        }
      })
    })
  }

  private updateScoreDisplay(): void {
    document.getElementById('score')!.textContent = String(this.score)
    document.getElementById('best')!.textContent = String(this.bestScore)
  }

  private showGameOver(): void {
    const overlay = this.add.rectangle(200, 200, 400, 400, 0x000000, 0.7)
    const text = this.add.text(200, 180, 'Game Over!', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    const restartText = this.add.text(200, 230, 'Press R to restart', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5)
  }

  private showWin(): void {
    const overlay = this.add.rectangle(200, 200, 400, 400, 0xffd700, 0.7)
    const text = this.add.text(200, 180, 'You Win!', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    const continueText = this.add.text(200, 230, 'Keep playing or press R', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5)
  }

  private restart(): void {
    this.score = 0
    this.updateScoreDisplay()
    this.logic.reset()
    this.grid.clear()
    this.addRandomTile()
    this.addRandomTile()
    this.renderGrid()
    this.isAnimating = false

    // Remove overlays
    this.children.list
      .filter(child => child.type === 'Rectangle' || child.type === 'Text')
      .forEach(child => child.destroy())
  }
}
