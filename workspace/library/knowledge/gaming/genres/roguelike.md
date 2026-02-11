# Roguelike Design

## Berlin Interpretation (Core Features)

### High Value
- **Permadeath**: Death is permanent
- **Procedural**: New world each run
- **Turn-based**: Time for decisions
- **Grid-based**: Discrete movement
- **Resource management**: Limited items

### Medium Value
- **Hack'n'slash**: Combat focus
- **Exploration**: Discover the map
- **Complexity**: Many systems interact

## Progression Systems

### Within Run
```typescript
// Power curve through items/levels
const POWER_CURVE = {
  floor1: { enemyHP: 20, playerDamage: 5 },
  floor5: { enemyHP: 100, playerDamage: 25 },
  floor10: { enemyHP: 300, playerDamage: 60 }
}
```

### Meta Progression (Roguelite)
- Unlock new items/characters
- Permanent upgrades
- Shortcut unlocks

## Item Design

### Synergies
```typescript
// Items that combine
const SYNERGIES = [
  { items: ['fire_staff', 'oil_flask'], effect: 'massive_burn' },
  { items: ['ice_ring', 'lightning_rod'], effect: 'shatter' }
]
```

### Rarity Tiers
| Tier    | Drop Rate | Power |
|---------|-----------|-------|
| Common  | 60%       | 1x    |
| Uncommon| 25%       | 1.5x  |
| Rare    | 12%       | 2x    |
| Epic    | 3%        | 3x    |

## Information Display
- Show enemy intent (attacks coming)
- Clear damage numbers
- Status effect indicators
