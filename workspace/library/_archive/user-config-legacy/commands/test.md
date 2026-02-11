---
description: Tests automatises (unit, integration, e2e) (user)
---

# /test - Automated Testing

## USAGE
```
/test unit "src/utils/helpers.ts"
/test integration "src/api/"
/test e2e "checkout flow"
/test coverage
/test fix
```

## MODES

### unit
Tests unitaires (Vitest)
```
/test unit "src/utils/formatDate.ts"
```
Output: Fichier .test.ts avec tests

### integration
Tests integration API/DB
```
/test integration "src/api/users"
```
Output: Tests integration endpoints

### e2e
Tests end-to-end (Playwright)
```
/test e2e "user login flow"
```
Output: Tests Playwright

### coverage
Rapport couverture
```
/test coverage
```
Output: Coverage report + gaps

### fix
Corriger tests echouant
```
/test fix
```
Output: Corrections auto

## VITEST UNIT TEST

```typescript
// src/utils/formatDate.test.ts
import { describe, it, expect } from 'vitest'
import { formatDate, isValidDate } from './formatDate'

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2024-01-15')
    expect(formatDate(date)).toBe('January 15, 2024')
  })

  it('handles invalid date', () => {
    expect(formatDate(null)).toBe('Invalid Date')
  })
})

describe('isValidDate', () => {
  it('returns true for valid date', () => {
    expect(isValidDate(new Date())).toBe(true)
  })

  it('returns false for invalid', () => {
    expect(isValidDate(new Date('invalid'))).toBe(false)
  })
})
```

## PLAYWRIGHT E2E

```typescript
// e2e/checkout.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test('complete purchase', async ({ page }) => {
    // Navigate to product
    await page.goto('/products/1')

    // Add to cart
    await page.click('[data-testid="add-to-cart"]')

    // Go to checkout
    await page.click('[data-testid="checkout-btn"]')

    // Fill form
    await page.fill('#email', 'test@test.com')
    await page.fill('#card', '4242424242424242')

    // Submit
    await page.click('[data-testid="pay-btn"]')

    // Verify success
    await expect(page.locator('.success-message')).toBeVisible()
  })
})
```

## WORKFLOW

### 1. Analyse code cible
```javascript
Read(targetFile)
// Identifier: fonctions, edge cases, dependencies
```

### 2. Generation tests
- Happy path
- Edge cases
- Error cases
- Boundary conditions

### 3. Execution
```bash
npm test -- --run
```

### 4. Coverage check
```bash
npm test -- --coverage
```

## OPTIONS
| Option | Description |
|--------|-------------|
| --watch | Mode watch |
| --coverage | Avec coverage |
| --update | Update snapshots |
| --ui | Interface Vitest UI |

## BONNES PRATIQUES
- AAA: Arrange, Act, Assert
- 1 assertion par test idealement
- Noms descriptifs
- Mocks pour external deps
- Fixtures reutilisables
