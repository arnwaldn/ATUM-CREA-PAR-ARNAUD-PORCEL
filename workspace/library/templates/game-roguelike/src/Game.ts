import { World } from './ecs/World'
import { DungeonGenerator } from './map/DungeonGenerator'
import { RenderSystem } from './systems/RenderSystem'
import { MovementSystem } from './systems/MovementSystem'
import { CombatSystem } from './systems/CombatSystem'
import { AISystem } from './systems/AISystem'
import { FOV } from './utils/FOV'
import { GameLog } from './utils/GameLog'
import { Position, Renderable, Fighter, AI, Player } from './components'

export interface GameConfig {
  width: number
  height: number
  tileSize: number
}

export class Game {
  private container: HTMLElement
  private config: GameConfig
  private world: World
  private dungeon: DungeonGenerator
  private fov: FOV
  private log: GameLog

  private systems: {
    render: RenderSystem
    movement: MovementSystem
    combat: CombatSystem
    ai: AISystem
  }

  private playerEntity: number | null = null
  private currentFloor = 1
  private gameOver = false

  constructor(container: HTMLElement, config: GameConfig) {
    this.container = container
    this.config = config

    this.world = new World()
    this.dungeon = new DungeonGenerator(config.width, config.height)
    this.fov = new FOV(config.width, config.height)
    this.log = new GameLog(document.getElementById('log')!)

    // Create canvas
    const canvas = document.createElement('canvas')
    canvas.width = config.width * config.tileSize
    canvas.height = config.height * config.tileSize
    container.appendChild(canvas)

    // Initialize systems
    this.systems = {
      render: new RenderSystem(canvas, config.tileSize),
      movement: new MovementSystem(this.dungeon),
      combat: new CombatSystem(this.log),
      ai: new AISystem(this.dungeon)
    }

    // Input handling
    window.addEventListener('keydown', this.handleInput.bind(this))
  }

  start(): void {
    this.generateFloor()
    this.gameLoop()
  }

  private generateFloor(): void {
    this.world.clear()
    this.dungeon.generate()

    // Create player at starting position
    const startPos = this.dungeon.getStartPosition()
    this.playerEntity = this.createPlayer(startPos.x, startPos.y)

    // Create enemies
    const rooms = this.dungeon.getRooms()
    rooms.slice(1).forEach(room => {
      const enemyCount = Math.floor(Math.random() * 3) + 1
      for (let i = 0; i < enemyCount; i++) {
        const x = room.x + 1 + Math.floor(Math.random() * (room.width - 2))
        const y = room.y + 1 + Math.floor(Math.random() * (room.height - 2))
        this.createEnemy(x, y)
      }
    })

    // Update FOV
    this.updateFOV()

    this.log.add(`Entered floor ${this.currentFloor}`, 'info')
    this.updateUI()
  }

  private createPlayer(x: number, y: number): number {
    const entity = this.world.createEntity()
    this.world.addComponent(entity, new Position(x, y))
    this.world.addComponent(entity, new Renderable('@', '#4ecdc4'))
    this.world.addComponent(entity, new Fighter(100, 10, 5))
    this.world.addComponent(entity, new Player())
    return entity
  }

  private createEnemy(x: number, y: number): number {
    const types = [
      { char: 'g', color: '#90be6d', hp: 20, attack: 5, defense: 1, name: 'Goblin' },
      { char: 'o', color: '#f9844a', hp: 40, attack: 8, defense: 2, name: 'Orc' },
      { char: 'T', color: '#f94144', hp: 80, attack: 12, defense: 3, name: 'Troll' }
    ]
    const type = types[Math.floor(Math.random() * types.length)]

    const entity = this.world.createEntity()
    this.world.addComponent(entity, new Position(x, y))
    this.world.addComponent(entity, new Renderable(type.char, type.color, type.name))
    this.world.addComponent(entity, new Fighter(type.hp, type.attack, type.defense))
    this.world.addComponent(entity, new AI())
    return entity
  }

  private handleInput(event: KeyboardEvent): void {
    if (this.gameOver || !this.playerEntity) return

    let dx = 0, dy = 0
    let acted = false

    switch (event.key) {
      case 'ArrowUp': case 'w': case 'k': dy = -1; acted = true; break
      case 'ArrowDown': case 's': case 'j': dy = 1; acted = true; break
      case 'ArrowLeft': case 'a': case 'h': dx = -1; acted = true; break
      case 'ArrowRight': case 'd': case 'l': dx = 1; acted = true; break
      case 'y': dx = -1; dy = -1; acted = true; break
      case 'u': dx = 1; dy = -1; acted = true; break
      case 'b': dx = -1; dy = 1; acted = true; break
      case 'n': dx = 1; dy = 1; acted = true; break
      case '.': case ' ': acted = true; break // Wait
      case '>':
        const pos = this.world.getComponent<Position>(this.playerEntity, 'Position')
        if (pos && this.dungeon.isStairs(pos.x, pos.y)) {
          this.currentFloor++
          this.generateFloor()
          return
        }
        break
    }

    if (acted) {
      this.playerTurn(dx, dy)
      this.enemyTurn()
      this.updateFOV()
      this.updateUI()
      this.render()
    }
  }

  private playerTurn(dx: number, dy: number): void {
    if (!this.playerEntity) return

    const pos = this.world.getComponent<Position>(this.playerEntity, 'Position')
    if (!pos) return

    const newX = pos.x + dx
    const newY = pos.y + dy

    // Check for enemy at target position
    const enemy = this.getEntityAt(newX, newY, 'AI')
    if (enemy !== null) {
      this.systems.combat.attack(this.world, this.playerEntity, enemy)
      this.checkDeath(enemy)
    } else if (this.dungeon.isWalkable(newX, newY)) {
      this.systems.movement.move(this.world, this.playerEntity, dx, dy)
    }
  }

  private enemyTurn(): void {
    if (!this.playerEntity) return

    const playerPos = this.world.getComponent<Position>(this.playerEntity, 'Position')
    if (!playerPos) return

    const enemies = this.world.query(['Position', 'AI', 'Fighter'])
    enemies.forEach(entity => {
      const pos = this.world.getComponent<Position>(entity, 'Position')!
      const ai = this.world.getComponent<AI>(entity, 'AI')!

      // Check if in FOV (aware of player)
      if (!this.fov.isVisible(pos.x, pos.y)) return

      const dx = Math.sign(playerPos.x - pos.x)
      const dy = Math.sign(playerPos.y - pos.y)

      // If adjacent to player, attack
      if (Math.abs(playerPos.x - pos.x) <= 1 && Math.abs(playerPos.y - pos.y) <= 1) {
        this.systems.combat.attack(this.world, entity, this.playerEntity!)
        this.checkPlayerDeath()
      } else {
        // Move towards player
        if (this.dungeon.isWalkable(pos.x + dx, pos.y + dy) && !this.getEntityAt(pos.x + dx, pos.y + dy)) {
          this.systems.movement.move(this.world, entity, dx, dy)
        }
      }
    })
  }

  private checkDeath(entity: number): void {
    const fighter = this.world.getComponent<Fighter>(entity, 'Fighter')
    if (fighter && fighter.hp <= 0) {
      const renderable = this.world.getComponent<Renderable>(entity, 'Renderable')
      this.log.add(`${renderable?.name ?? 'Enemy'} dies!`, 'combat')
      this.world.destroyEntity(entity)
    }
  }

  private checkPlayerDeath(): void {
    if (!this.playerEntity) return
    const fighter = this.world.getComponent<Fighter>(this.playerEntity, 'Fighter')
    if (fighter && fighter.hp <= 0) {
      this.log.add('You died!', 'combat')
      this.gameOver = true
    }
  }

  private getEntityAt(x: number, y: number, componentType?: string): number | null {
    const components = componentType ? ['Position', componentType] : ['Position']
    const entities = this.world.query(components)

    for (const entity of entities) {
      const pos = this.world.getComponent<Position>(entity, 'Position')!
      if (pos.x === x && pos.y === y) return entity
    }
    return null
  }

  private updateFOV(): void {
    if (!this.playerEntity) return
    const pos = this.world.getComponent<Position>(this.playerEntity, 'Position')
    if (pos) {
      this.fov.compute(pos.x, pos.y, 8, (x, y) => this.dungeon.isTransparent(x, y))
      this.dungeon.updateExplored(this.fov)
    }
  }

  private updateUI(): void {
    if (!this.playerEntity) return
    const fighter = this.world.getComponent<Fighter>(this.playerEntity, 'Fighter')
    if (fighter) {
      document.getElementById('hp')!.textContent = String(fighter.hp)
      document.getElementById('maxHp')!.textContent = String(fighter.maxHp)
    }
    document.getElementById('floor')!.textContent = String(this.currentFloor)
  }

  private render(): void {
    this.systems.render.render(this.world, this.dungeon, this.fov)
  }

  private gameLoop(): void {
    this.render()
    requestAnimationFrame(() => this.gameLoop())
  }
}
