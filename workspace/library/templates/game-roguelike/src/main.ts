import { Game } from './Game'

const container = document.getElementById('game-container')!

const game = new Game(container, {
  width: 80,
  height: 40,
  tileSize: 16
})

game.start()
