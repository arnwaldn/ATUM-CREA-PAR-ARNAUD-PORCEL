# Guide Workflows Chrome - ULTRA-CREATE v26.1

## Introduction
Claude Code peut maintenant accéder et contrôler **votre Chrome personnel** avec tous vos comptes connectés.

## Configuration Requise

### 1. Setup One-Time
```powershell
# Exécuter une seule fois
C:\Claude-Code-Creation\scripts\setup\enable-chrome-debugging.ps1
```

### 2. Lancer Chrome-Debug
- Fermez **tous** les Chrome normaux
- Lancez Chrome via raccourci "Chrome-Debug" sur Bureau
- Vérifiez: http://localhost:9222 → JSON

### 3. Vérifier connexion
```javascript
mcp__puppeteer__puppeteer_connect_active_tab({ debugPort: 9222 })
// → Succès: Claude Code connecté à votre Chrome
```

## Workflows Courants

### Workflow 1: Accéder Gmail (Zero-Auth)
```javascript
// 1. Connexion (déjà logged in)
mcp__puppeteer__puppeteer_connect_active_tab({ debugPort: 9222 })

// 2. Naviguer Gmail
mcp__puppeteer__puppeteer_navigate({ url: "https://mail.google.com" })

// 3. Lire emails
const emails = mcp__puppeteer__puppeteer_evaluate({
  script: `
    Array.from(document.querySelectorAll('.email-subject')).map(el => el.textContent)
  `
})

// 4. Screenshot
mcp__puppeteer__puppeteer_screenshot({ name: "gmail-inbox", fullPage: true })
```

### Workflow 2: Monitoring Multi-Tab
```javascript
// Surveiller plusieurs onglets en temps réel
// 1. Connexion
mcp__puppeteer__puppeteer_connect_active_tab({ debugPort: 9222 })

// 2. Récupérer tous onglets
const tabs = mcp__puppeteer__puppeteer_evaluate({
  script: `
    // Get all tabs info
    chrome.tabs.query({}, tabs => tabs)
  `
})

// 3. Pour chaque onglet, capturer état
tabs.forEach(tab => {
  mcp__puppeteer__puppeteer_screenshot({
    name: `tab-${tab.id}`,
    tabId: tab.id
  })
})
```

### Workflow 3: Form Filling Automatique
```javascript
// Remplir formulaire avec données utilisateur
mcp__puppeteer__puppeteer_navigate({ url: "https://form.example.com" })
mcp__puppeteer__puppeteer_fill({ selector: "#name", value: "John Doe" })
mcp__puppeteer__puppeteer_fill({ selector: "#email", value: "john@example.com" })
mcp__puppeteer__puppeteer_click({ selector: "#submit" })
```

## Puppeteer vs Playwright

| Critère | Puppeteer | Playwright |
|---------|-----------|------------|
| **Connexion user Chrome** | ✅ Oui (port 9222) | ❌ Non (isolation) |
| **Sessions/Cookies user** | ✅ Accès complet | ❌ Session propre |
| **Multi-onglets** | ✅ Tous onglets user | ❌ 1 onglet isolé |
| **Zero-auth comptes** | ✅ Logged in | ❌ Manual login |
| **Performance** | ⚡ Direct | 🐌 Spawn browser |
| **Use case** | User workflows | Scraping/Tests |

**Règle de décision:**
```
Intent contient "my account" | "logged in" | "cookies" → Puppeteer
Intent contient "scrape" | "extract" | "headless" → Playwright
```

## Sécurité et Limites

### ⚠️ Avertissements
1. **Chrome-Debug expose port 9222** → N'importe quelle app peut contrôler Chrome
2. **Ne PAS utiliser Chrome-Debug pour navigation normale** → Risque sécurité
3. **Toujours fermer Chrome-Debug après usage** → Fermer port 9222

### ✅ Best Practices
1. Utiliser Chrome-Debug **uniquement** pour Claude Code
2. Sauvegarder workflows dans Hindsight après usage
3. Vérifier que port 9222 est fermé quand non utilisé
4. Ne jamais partager Chrome-Debug avec apps tierces

## Apprentissage et Mémoire

### Sauvegarder Workflows
```javascript
// Après workflow réussi
mcp__hindsight__hindsight_retain({
  bank: 'patterns',
  content: `Workflow Chrome: Accès Gmail

  Étapes:
  1. puppeteer_connect_active_tab({ debugPort: 9222 })
  2. puppeteer_navigate({ url: "https://mail.google.com" })
  3. puppeteer_evaluate({ script: "..." })

  Résultat: Succès - Emails récupérés
  `,
  context: 'Chrome workflows, Gmail access'
})
```

### Rappeler Workflows
```javascript
// Avant nouveau workflow
mcp__hindsight__hindsight_recall({
  bank: 'patterns',
  query: 'Chrome Gmail workflow',
  top_k: 3
})
```

## Troubleshooting

### Erreur: "Cannot connect to Chrome"
**Cause**: Chrome-Debug pas lancé ou port 9222 fermé
**Solution**:
1. Vérifier Chrome-Debug lancé (raccourci Bureau)
2. Vérifier http://localhost:9222 accessible
3. Relancer: `C:\Claude-Code-Creation\scripts\setup\enable-chrome-debugging.ps1`

### Erreur: "Puppeteer MCP not found"
**Cause**: Puppeteer MCP pas configuré dans settings.json
**Solution**: Vérifier settings.json (ligne ~639) contient config Puppeteer

### Performance lente
**Cause**: Trop d'onglets Chrome ouverts
**Solution**: Fermer onglets non utilisés, ou utiliser Playwright (isolation)
