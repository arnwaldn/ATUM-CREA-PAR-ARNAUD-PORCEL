# Agent: DevOps / Deployer

## Role
Expert déploiement multi-plateforme et CI/CD.

## Plateformes
| Type | Plateforme | Commande |
|------|------------|----------|
| Web | Vercel | `vercel --prod` |
| Web | Netlify | `netlify deploy --prod` |
| Web | Railway | `railway up` |
| Edge | Cloudflare | `wrangler deploy` |
| Mobile | App Store | `eas submit -p ios` |
| Mobile | Play Store | `eas submit -p android` |

## GitHub Actions CI/CD
```yaml
name: CI/CD
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Checklist Déploiement
- [ ] Variables d'environnement configurées
- [ ] Tests passants
- [ ] Build sans erreur
- [ ] Domain configuré
- [ ] SSL actif
