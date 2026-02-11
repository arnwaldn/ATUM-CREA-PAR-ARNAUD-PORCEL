# Loot Tables

## Weighted Random Selection

```typescript
interface LootEntry {
  item: string
  weight: number
  minQuantity?: number
  maxQuantity?: number
}

class LootTable {
  private entries: LootEntry[] = []
  private totalWeight = 0

  add(entry: LootEntry) {
    this.entries.push(entry)
    this.totalWeight += entry.weight
  }

  roll(): { item: string; quantity: number } | null {
    if (this.entries.length === 0) return null

    let roll = Math.random() * this.totalWeight

    for (const entry of this.entries) {
      roll -= entry.weight
      if (roll <= 0) {
        const min = entry.minQuantity ?? 1
        const max = entry.maxQuantity ?? 1
        const quantity = Math.floor(Math.random() * (max - min + 1)) + min
        return { item: entry.item, quantity }
      }
    }

    return null
  }
}

// Usage
const goblinLoot = new LootTable()
goblinLoot.add({ item: 'gold', weight: 50, minQuantity: 5, maxQuantity: 20 })
goblinLoot.add({ item: 'health_potion', weight: 20 })
goblinLoot.add({ item: 'rusty_sword', weight: 10 })
goblinLoot.add({ item: 'nothing', weight: 20 })
```

## Tiered Loot

```typescript
enum Rarity {
  Common = 'common',
  Uncommon = 'uncommon',
  Rare = 'rare',
  Epic = 'epic',
  Legendary = 'legendary'
}

const RARITY_WEIGHTS: Record<Rarity, number> = {
  [Rarity.Common]: 60,
  [Rarity.Uncommon]: 25,
  [Rarity.Rare]: 10,
  [Rarity.Epic]: 4,
  [Rarity.Legendary]: 1
}

class TieredLootTable {
  private tables = new Map<Rarity, LootTable>()

  roll(luckModifier = 0): { item: string; rarity: Rarity } | null {
    // Roll for rarity first (luck increases rare chances)
    const weights = { ...RARITY_WEIGHTS }
    weights[Rarity.Rare] += luckModifier
    weights[Rarity.Epic] += luckModifier * 0.5
    weights[Rarity.Legendary] += luckModifier * 0.25
    weights[Rarity.Common] -= luckModifier * 2

    const rarity = this.rollRarity(weights)
    const table = this.tables.get(rarity)

    if (!table) return null
    const result = table.roll()
    return result ? { item: result.item, rarity } : null
  }
}
```

## Guaranteed + Bonus Drops

```typescript
interface ChestConfig {
  guaranteed: LootEntry[]
  bonusRolls: number
  bonusTable: LootTable
}

function openChest(config: ChestConfig): { item: string; quantity: number }[] {
  const drops: { item: string; quantity: number }[] = []

  // Always drop guaranteed items
  for (const entry of config.guaranteed) {
    const min = entry.minQuantity ?? 1
    const max = entry.maxQuantity ?? 1
    drops.push({
      item: entry.item,
      quantity: Math.floor(Math.random() * (max - min + 1)) + min
    })
  }

  // Roll for bonus items
  for (let i = 0; i < config.bonusRolls; i++) {
    const bonus = config.bonusTable.roll()
    if (bonus && bonus.item !== 'nothing') {
      drops.push(bonus)
    }
  }

  return drops
}
```

## Progressive Drop Rates (Pity System)

```typescript
class PitySystem {
  private rollsSinceRare = 0
  private pityThreshold = 50

  roll(table: LootTable): { item: string; isPity: boolean } {
    this.rollsSinceRare++

    // Guaranteed rare after threshold
    if (this.rollsSinceRare >= this.pityThreshold) {
      this.rollsSinceRare = 0
      return { item: this.getRareItem(), isPity: true }
    }

    // Normal roll with increasing luck
    const luckBonus = this.rollsSinceRare / this.pityThreshold * 10
    const result = table.roll()

    if (this.isRare(result?.item)) {
      this.rollsSinceRare = 0
    }

    return { item: result?.item ?? 'nothing', isPity: false }
  }
}
```
