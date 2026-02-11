# Session Learnings - 15 Janvier 2026
## Projet: QuickSummarize AI (Chrome Extension)

---

## PATTERNS APPRIS

### 1. Chrome Web Store - Screenshots
**Problème:** Chrome Web Store rejette les screenshots avec mauvaises dimensions ou canal alpha
**Solution:**
```bash
# Resize + remove alpha avec ImageMagick
magick input.png -resize 1280x800! -background white -alpha remove -alpha off output.png
```
**Dimensions acceptées:** 1280x800 ou 640x400, PNG 24 bits (pas RGBA)

### 2. Chrome Web Store - Formulaire Confidentialité
**Pattern:** Préparer tous les textes à l'avance:
- Description objectif unique (~300 car)
- Justification pour CHAQUE permission (~150-200 car)
- URL privacy policy (GitHub raw ou Pages)
- Cocher "Contenu du site Web" si extension lit les pages

### 3. Monétisation sans entreprise
**Problème:** Stripe requiert une entreprise pour certains comptes
**Solutions:**
- LemonSqueezy (accepte les particuliers)
- Publier gratuit d'abord, monétiser ensuite
- Bouton "Coming Soon" comme placeholder

### 4. GitHub Token Permissions
**Erreur:** "Resource not accessible by personal access token"
**Cause:** Token sans scope `repo`
**Solution:** Créer token avec permissions `repo` OU créer repo manuellement

### 5. PowerShell vs Bash sur Windows
**Pattern:** Pour les commandes complexes avec caractères spéciaux:
1. Écrire un fichier .ps1
2. Exécuter avec `powershell -ExecutionPolicy Bypass -File script.ps1`
Évite les problèmes d'échappement de $, ", etc.

---

## WORKFLOW OPTIMISÉ - Publication Chrome Extension

```
1. BUILD
   npm run build

2. ZIP
   Créer ZIP du dossier dist/

3. SCREENSHOTS
   - Dimensions: 1280x800 exactement
   - Format: PNG 24 bits (pas d'alpha)
   - Minimum: 1, Maximum: 5

4. PRIVACY POLICY
   - Héberger sur GitHub (public)
   - URL directe vers le fichier .md

5. FORMULAIRE CHROME WEB STORE
   - Description store
   - Justification permissions (obligatoire pour host_permissions)
   - Sélectionner données collectées
   - 3 certifications à cocher

6. SOUMISSION
   - Review: 1-3 jours ouvrés
   - host_permissions = review plus longue
```

---

## ERREURS À ÉVITER

1. **Ne pas oublier** de retirer le canal alpha des PNG (Chrome Store reject)
2. **Ne pas utiliser** `<all_urls>` sans justification solide
3. **Ne pas supposer** que les tokens GitHub ont toutes les permissions
4. **Toujours tester** l'extension en local avant publication

---

## MÉTRIQUES SESSION

- **Durée estimée:** ~2h
- **Tâches complétées:**
  - Modification UpgradeModal (Coming Soon)
  - Rebuild extension
  - Préparation screenshots
  - Configuration GitHub repo
  - Rédaction formulaire Chrome Web Store
  - Document handoff collaborateur

- **Bloqueurs rencontrés:**
  - Token GitHub permissions
  - Screenshots alpha channel
  - Brouillon Chrome Store disparu

---

*Auto-learning entry - ULTRA-CREATE v28.0*
