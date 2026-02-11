import { BaseComponent } from '../ecs/Component'

export class Position extends BaseComponent {
  readonly type = 'Position'

  constructor(
    public x: number,
    public y: number
  ) {
    super()
  }
}

export class Renderable extends BaseComponent {
  readonly type = 'Renderable'

  constructor(
    public char: string,
    public color: string,
    public name: string = 'Unknown'
  ) {
    super()
  }
}

export class Fighter extends BaseComponent {
  readonly type = 'Fighter'
  public hp: number

  constructor(
    public maxHp: number,
    public attack: number,
    public defense: number
  ) {
    super()
    this.hp = maxHp
  }

  takeDamage(amount: number): number {
    const damage = Math.max(0, amount - this.defense)
    this.hp -= damage
    return damage
  }

  heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount)
  }
}

export class AI extends BaseComponent {
  readonly type = 'AI'
  public state: 'idle' | 'hunting' | 'fleeing' = 'idle'

  constructor() {
    super()
  }
}

export class Player extends BaseComponent {
  readonly type = 'Player'
  public level = 1
  public experience = 0

  constructor() {
    super()
  }

  addExperience(amount: number): boolean {
    this.experience += amount
    const needed = this.level * 100
    if (this.experience >= needed) {
      this.experience -= needed
      this.level++
      return true
    }
    return false
  }
}

export class Item extends BaseComponent {
  readonly type = 'Item'

  constructor(
    public itemType: 'potion' | 'scroll' | 'equipment',
    public name: string,
    public effect: Record<string, number>
  ) {
    super()
  }
}

export class Inventory extends BaseComponent {
  readonly type = 'Inventory'
  public items: number[] = []
  public capacity: number

  constructor(capacity = 10) {
    super()
    this.capacity = capacity
  }

  add(itemEntity: number): boolean {
    if (this.items.length >= this.capacity) return false
    this.items.push(itemEntity)
    return true
  }

  remove(itemEntity: number): boolean {
    const index = this.items.indexOf(itemEntity)
    if (index === -1) return false
    this.items.splice(index, 1)
    return true
  }
}
