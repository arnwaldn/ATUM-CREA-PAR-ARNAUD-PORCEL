import type { World } from '../ecs/World'
import type { GameLog } from '../utils/GameLog'
import { Fighter, Renderable, Player } from '../components'

export class CombatSystem {
  private log: GameLog

  constructor(log: GameLog) {
    this.log = log
  }

  attack(world: World, attacker: number, defender: number): number {
    const attackerFighter = world.getComponent<Fighter>(attacker, 'Fighter')
    const defenderFighter = world.getComponent<Fighter>(defender, 'Fighter')

    if (!attackerFighter || !defenderFighter) return 0

    // Simple damage calculation
    const baseDamage = attackerFighter.attack
    const variance = Math.floor(Math.random() * 5) - 2
    const rawDamage = Math.max(1, baseDamage + variance)

    const actualDamage = defenderFighter.takeDamage(rawDamage)

    // Log the attack
    const attackerName = world.hasComponent(attacker, 'Player')
      ? 'You'
      : world.getComponent<Renderable>(attacker, 'Renderable')?.name ?? 'Enemy'

    const defenderName = world.hasComponent(defender, 'Player')
      ? 'you'
      : world.getComponent<Renderable>(defender, 'Renderable')?.name ?? 'enemy'

    const verb = world.hasComponent(attacker, 'Player') ? 'hit' : 'hits'

    this.log.add(`${attackerName} ${verb} ${defenderName} for ${actualDamage} damage!`, 'combat')

    return actualDamage
  }

  heal(world: World, entity: number, amount: number): number {
    const fighter = world.getComponent<Fighter>(entity, 'Fighter')
    if (!fighter) return 0

    const oldHp = fighter.hp
    fighter.heal(amount)
    const healed = fighter.hp - oldHp

    if (healed > 0) {
      this.log.add(`Healed for ${healed} HP!`, 'item')
    }

    return healed
  }

  isDead(world: World, entity: number): boolean {
    const fighter = world.getComponent<Fighter>(entity, 'Fighter')
    return fighter ? fighter.hp <= 0 : false
  }
}
