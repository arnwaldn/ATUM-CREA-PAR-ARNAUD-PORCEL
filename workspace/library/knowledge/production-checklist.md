# Checklist Qualité Production

## Avant Chaque Livraison

### Code Quality
- [ ] TypeScript strict mode sans erreurs
- [ ] ESLint sans warnings
- [ ] Prettier formatage appliqué
- [ ] Pas de `console.log` en production
- [ ] Pas de `any` explicite
- [ ] Pas de code commenté inutile
- [ ] Pas de TODO laissés

### Tests
- [ ] Tests unitaires passants
- [ ] Tests E2E passants
- [ ] Coverage > 80%
- [ ] Pas de tests skippés

### Performance
- [ ] Lighthouse score > 90 (tous les métriques)
- [ ] Bundle JS initial < 200KB
- [ ] Images optimisées (WebP, lazy loading)
- [ ] Fonts optimisées (swap, preload)
- [ ] Pas de layout shift (CLS < 0.1)

### SEO
- [ ] Title unique par page
- [ ] Meta descriptions
- [ ] Open Graph tags
- [ ] Structured data (JSON-LD)
- [ ] Sitemap.xml
- [ ] Robots.txt
- [ ] Canonical URLs

### Accessibilité
- [ ] Navigation clavier complète
- [ ] Contraste suffisant (4.5:1)
- [ ] Alt text sur images
- [ ] Labels sur inputs
- [ ] ARIA attributes corrects
- [ ] Skip link présent
- [ ] Focus visible

### Sécurité
- [ ] HTTPS only
- [ ] Headers sécurité configurés
- [ ] Input validation (Zod)
- [ ] SQL injection impossible (ORM)
- [ ] XSS prévenu
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Secrets en .env (pas dans le code)
- [ ] npm audit sans high/critical

### Fonctionnel
- [ ] Toutes les features fonctionnent
- [ ] Edge cases gérés
- [ ] Error boundaries en place
- [ ] Loading states présents
- [ ] Empty states présents
- [ ] Messages d'erreur clairs
- [ ] Responsive (mobile/tablet/desktop)
- [ ] Dark mode (si applicable)

### Infrastructure
- [ ] Variables d'environnement documentées
- [ ] .env.example à jour
- [ ] README.md complet
- [ ] CI/CD configuré
- [ ] Monitoring en place (optionnel)
- [ ] Backup strategy (si DB)

### Pre-Deploy
- [ ] Build de production réussi
- [ ] Preview deployment testé
- [ ] URLs de production configurées
- [ ] Domaine configuré
- [ ] SSL certificate valide

---

## Checklist Rapide (Minimum Viable)

### Must Have (Bloquant)
- [ ] Build sans erreur
- [ ] Tests passants
- [ ] TypeScript sans erreur
- [ ] Pas de secrets exposés
- [ ] Features principales fonctionnent

### Should Have (Important)
- [ ] Lighthouse > 80
- [ ] Responsive design
- [ ] Error handling
- [ ] Loading states

### Nice to Have
- [ ] Lighthouse > 95
- [ ] Coverage > 90%
- [ ] Animations fluides
- [ ] Documentation complète

---

## Script de Validation

```powershell
# ULTRA-VALIDATE.ps1
Write-Host "=== VALIDATION PRE-DEPLOY ===" -ForegroundColor Cyan

$errors = @()

# TypeScript
Write-Host "`nChecking TypeScript..." -ForegroundColor Yellow
$tsResult = pnpm tsc --noEmit 2>&1
if ($LASTEXITCODE -ne 0) { $errors += "TypeScript errors found" }

# ESLint
Write-Host "Checking ESLint..." -ForegroundColor Yellow
$lintResult = pnpm eslint . 2>&1
if ($LASTEXITCODE -ne 0) { $errors += "ESLint errors found" }

# Tests
Write-Host "Running tests..." -ForegroundColor Yellow
$testResult = pnpm test 2>&1
if ($LASTEXITCODE -ne 0) { $errors += "Tests failed" }

# Build
Write-Host "Building..." -ForegroundColor Yellow
$buildResult = pnpm build 2>&1
if ($LASTEXITCODE -ne 0) { $errors += "Build failed" }

# Security
Write-Host "Security audit..." -ForegroundColor Yellow
$auditResult = npm audit --audit-level=high 2>&1
if ($LASTEXITCODE -ne 0) { $errors += "Security vulnerabilities found" }

# Results
Write-Host "`n=== RESULTS ===" -ForegroundColor Cyan
if ($errors.Count -eq 0) {
    Write-Host "✅ ALL CHECKS PASSED - Ready to deploy!" -ForegroundColor Green
} else {
    Write-Host "❌ VALIDATION FAILED:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    exit 1
}
```

---

## Commandes Utiles

```bash
# Vérification complète
pnpm tsc --noEmit && pnpm lint && pnpm test && pnpm build

# Lighthouse CLI
npx lighthouse http://localhost:3000 --view

# Bundle analysis
ANALYZE=true pnpm build

# Security audit
npm audit
npx snyk test

# Accessibility check
npx pa11y http://localhost:3000
```
