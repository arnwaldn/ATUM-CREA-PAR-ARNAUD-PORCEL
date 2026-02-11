# Project Templates (Legacy)

> **NOTE:** Ce dossier est déprécié. Utilisez `templates/` à la place.

## Templates Actifs

Les templates de production sont dans le dossier `templates/`:

- `templates/saas/` - SaaS complet avec Clerk, Stripe, Supabase
- `templates/landing/` - Landing page avec animations
- `templates/api/` - API REST avec Prisma
- `templates/mobile/` - App mobile Expo
- `templates/desktop/` - App desktop Tauri
- `templates/ecommerce/` - Boutique e-commerce

## Migration

Si vous avez des projets utilisant ces anciens templates, migrez vers `templates/`.

```bash
# Exemple de création avec nouveau template
node scripts/autonomous/orchestrator.js "MonProjet" "Description"
```
