# Puppeteer vs Playwright - Decision Matrix

## Arbre de Décision

```
Question: "Ai-je besoin d'accéder aux comptes connectés de l'utilisateur?"
    │
    ├─── OUI → Puppeteer
    │    └─── Exemples: Gmail, Facebook, Banking, Services SaaS
    │
    └─── NON → Question: "Ai-je besoin de tests/scraping isolés?"
         │
         ├─── OUI → Playwright
         │    └─── Exemples: Scraping public, Tests E2E, Form filling anonyme
         │
         └─── NON → Desktop Commander (Bash)
              └─── Exemples: curl, wget, simple HTTP requests
```

## Matrice Complète

| Use Case | Puppeteer | Playwright | Desktop Commander |
|----------|-----------|------------|-------------------|
| **Accès Gmail user** | ✅ Optimal | ❌ Manual login | ❌ N/A |
| **Scraping site public** | ⚠️ Overkill | ✅ Optimal | ⚠️ curl OK |
| **Tests E2E isolés** | ❌ State pollution | ✅ Optimal | ❌ N/A |
| **Multi-onglets user** | ✅ Optimal | ❌ Un seul onglet | ❌ N/A |
| **Cookies/Sessions** | ✅ User cookies | ❌ Fresh session | ❌ N/A |
| **Performance** | ⚡⚡⚡ Direct | ⚡⚡ Spawn | ⚡ curl |
| **Sécurité** | ⚠️ Port 9222 | ✅ Isolation | ✅ Safe |

## Exemples Concrets

### ✅ Utiliser Puppeteer
```
- "Accède à mon Gmail et lis mes derniers emails"
- "Va sur Facebook et poste un statut"
- "Surveille mes onglets Chrome et fais des screenshots"
- "Copie les cookies de session de ce site"
```

### ✅ Utiliser Playwright
```
- "Scrape les prix de ce site e-commerce"
- "Teste ce formulaire de login"
- "Automatise le remplissage de ce form"
- "Capture screenshot de cette page publique"
```

### ✅ Utiliser Desktop Commander
```
- "Télécharge ce fichier"
- "Vérifie si ce site est en ligne"
- "Récupère le HTML de cette page"
```

## Patterns Intent → MCP

| Pattern Intent | MCP Sélectionné | Raison |
|----------------|-----------------|--------|
| `/my account/i` | puppeteer | User session required |
| `/logged in/i` | puppeteer | Auth state needed |
| `/cookies/i` | puppeteer | Session cookies |
| `/scrape/i` | playwright | Isolated scraping |
| `/test form/i` | playwright | Clean state testing |
| `/download/i` | desktop-commander | Simple HTTP |

## Code Examples

### Puppeteer (User Session)
```javascript
// Connect to user Chrome
mcp__puppeteer__puppeteer_connect_active_tab({ debugPort: 9222 })

// Navigate to authenticated service
mcp__puppeteer__puppeteer_navigate({ url: "https://mail.google.com" })

// Access user data
const emails = mcp__puppeteer__puppeteer_evaluate({
  script: "document.querySelectorAll('.email').length"
})
```

### Playwright (Isolated)
```javascript
// Fresh browser instance
mcp__playwright__browser_navigate({ url: "https://example.com" })

// Scrape public data
mcp__playwright__browser_evaluate({
  script: "document.querySelectorAll('h1').length"
})

// Clean teardown
```
