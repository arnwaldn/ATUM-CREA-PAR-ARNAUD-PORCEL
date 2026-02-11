import { Game } from './Game'

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('game-container')
  const loading = document.getElementById('loading')

  if (!container) {
    console.error('Game container not found')
    return
  }

  const game = new Game(container)

  // Hide loading screen when ready
  game.onReady(() => {
    loading?.classList.add('hidden')
  })

  // Start the game
  game.start()

  // Handle window resize
  window.addEventListener('resize', () => {
    game.resize()
  })

  // Expose game to window for debugging
  if (import.meta.env.DEV) {
    (window as unknown as { game: Game }).game = game
  }
})
