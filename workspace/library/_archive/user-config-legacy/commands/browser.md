---
description: Browser automation multi-modes (user)
---

# /browser - Browser Automation

## USAGE
```
/browser observe "https://example.com"
/browser interact "click login button"
/browser automate "fill form and submit"
/browser scrape "extract all product prices"
/browser test "verify checkout flow"
/browser connect
```

## MODES

### observe
Screenshot + analyse complete de la page
```
/browser observe "https://example.com"
```
Output: Screenshot + structure + elements cles

### interact
Action unique sur la page
```
/browser interact "click #submit-btn"
/browser interact "fill #email with test@test.com"
/browser interact "scroll to footer"
```

### automate
Workflow multi-etapes autonome
```
/browser automate "Login avec user@test.com, aller au dashboard, exporter CSV"
```

### scrape
Extraction donnees structurees
```
/browser scrape "https://shop.com" --extract="products: name, price, rating"
```
Output: JSON structure

### test
Verification automatisee
```
/browser test "https://app.com" --verify="login flow works"
```
Output: Test results pass/fail

### connect
Connexion a Chrome existant (port 9222)
```
/browser connect
/browser connect --port=9223
```

## WORKFLOW PLAYWRIGHT

### 1. Navigation
```javascript
mcp__playwright__browser_navigate({ url: targetUrl })
```

### 2. Screenshot
```javascript
mcp__playwright__browser_screenshot({ name: "page" })
```

### 3. Interactions
```javascript
mcp__playwright__browser_click({ selector: "#btn" })
mcp__playwright__browser_fill({ selector: "#input", value: "text" })
mcp__playwright__browser_select({ selector: "#dropdown", value: "option1" })
```

### 4. Evaluation JS
```javascript
mcp__playwright__browser_evaluate({
  script: "document.querySelectorAll('.product').length"
})
```

## OPTIONS
| Option | Description |
|--------|-------------|
| --headless | Mode sans interface |
| --port=N | Port Chrome (default: 9222) |
| --wait=N | Attente en ms |
| --screenshot | Capturer chaque etape |

## EXEMPLES

### Scraping e-commerce
```
/browser scrape "https://amazon.com/s?k=laptop" --extract="products: title, price, rating, reviews"
```

### Test flow
```
/browser test "https://app.com" --steps="
1. Go to /login
2. Fill email with test@test.com
3. Fill password with Test123!
4. Click Submit
5. Verify redirect to /dashboard
"
```

### Automation
```
/browser automate "
1. Navigate to admin panel
2. Click 'Export Data'
3. Select date range 'Last 30 days'
4. Download CSV
5. Confirm success message
"
```

## MCP UTILISES
- Playwright (primary)
- Puppeteer (fallback)
- Firecrawl (scraping avance)
