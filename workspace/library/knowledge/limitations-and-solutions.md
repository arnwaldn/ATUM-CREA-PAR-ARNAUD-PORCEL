# Limitations Connues et Solutions

## Limitations Techniques

### 1. Pas de GUI Direct
**Limitation**: Je ne peux pas voir l'interface graphique de ce que je crée.

**Solutions**:
- Utiliser des patterns éprouvés et testés
- S'appuyer sur les composants shadcn/ui qui sont visuellement cohérents
- Demander à l'utilisateur des screenshots pour feedback
- Utiliser le MCP Puppeteer pour des tests automatisés
- Lighthouse pour valider l'UX

### 2. Pas d'Accès Réseau Direct
**Limitation**: Certains MCP servers peuvent avoir des problèmes de connexion.

**Solutions**:
- Utiliser `mcp__fetch__fetch` pour accéder au web
- WebFetch pour récupérer de la documentation
- Travailler offline avec des templates locaux
- Stocker les patterns dans knowledge/

### 3. Exécution Longue
**Limitation**: Les processus très longs peuvent timeout.

**Solutions**:
- Découper en tâches plus petites
- Utiliser `run_in_background` pour les processus longs
- Checkpoints réguliers
- Workflow par étapes

### 4. Mémoire de Contexte
**Limitation**: Le contexte peut se perdre dans les longues conversations.

**Solutions**:
- Utiliser MCP Memory pour stocker les informations critiques
- Créer des fichiers de documentation au fur et à mesure
- Utiliser TodoWrite pour tracker le progrès
- Sauvegarder les learnings après chaque projet

## Limitations par Domaine

### Mobile (Expo/React Native)
| Limitation | Solution |
|------------|----------|
| Pas de test sur device réel | Expo Go + instructions utilisateur |
| Pas d'accès aux simulateurs | Code compatible, test manuel |
| Pas de build natif | Expo EAS Build (cloud) |

### Desktop (Tauri)
| Limitation | Solution |
|------------|----------|
| Build multi-plateforme complexe | GitHub Actions pour CI/CD |
| Permissions système | Documentation claire |
| Test sur différents OS | Instructions de test |

### Base de Données
| Limitation | Solution |
|------------|----------|
| Pas d'accès direct à la DB | Prisma migrations + seed scripts |
| Données de test | Fixtures et factories |
| Migrations production | Scripts documentés |

## Contournements Recommandés

### Pour les Tests Visuels
```typescript
// Au lieu de tester visuellement, utiliser:
// 1. Tests de snapshot avec Vitest
expect(component).toMatchSnapshot();

// 2. Tests de composants avec Testing Library
expect(screen.getByRole('button')).toBeVisible();

// 3. Tests E2E avec Playwright
await expect(page.locator('.hero')).toBeVisible();
```

### Pour les Intégrations Tierces
```typescript
// Créer des mocks complets pour les services externes
// lib/mocks/stripe.ts
export const mockStripe = {
  checkout: {
    sessions: {
      create: async () => ({ url: 'https://checkout.stripe.com/test' })
    }
  }
};

// Utiliser en développement
const stripe = process.env.NODE_ENV === 'development'
  ? mockStripe
  : new Stripe(process.env.STRIPE_SECRET_KEY!);
```

### Pour le Déploiement
```yaml
# Utiliser des CI/CD plutôt que déployer manuellement
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm build
      - uses: amondnet/vercel-action@v25
```

## Ce que Je Peux Faire vs Ce que Je Ne Peux Pas

### JE PEUX
- Créer des projets complets de A à Z
- Écrire du code de qualité production
- Configurer CI/CD
- Créer des tests automatisés
- Documenter le code
- Débugger des erreurs
- Refactorer du code
- Migrer des projets
- Optimiser les performances

### JE NE PEUX PAS (directement)
- Voir l'interface graphique
- Exécuter du code natif mobile
- Accéder à des services nécessitant une authentification interactive
- Faire du drag & drop dans une UI
- Tester sur des devices physiques

### JE PEUX AVEC AIDE DE L'UTILISATEUR
- Valider visuellement le résultat
- Configurer des services externes (Stripe, Supabase, etc.)
- Tester sur différents devices
- Approuver les déploiements production

## Stratégies de Contournement

### 1. Pattern "Generate & Validate"
```
1. Je génère le code
2. Je lance les tests automatiques
3. Je lance le build
4. L'utilisateur valide visuellement
5. J'ajuste si nécessaire
```

### 2. Pattern "Template First"
```
1. Utiliser un template éprouvé
2. Customiser selon les besoins
3. Le visuel est déjà validé par le template
```

### 3. Pattern "Contract Testing"
```
1. Définir les interfaces/types d'abord
2. Implémenter les mocks
3. Implémenter le vrai code
4. Les tests valident le contrat
```

## Recommandations pour l'Utilisateur

### Pour Maximiser l'Efficacité
1. **Fournir des screenshots** quand il y a un problème visuel
2. **Décrire précisément** le comportement attendu vs actuel
3. **Partager les erreurs** complètes (pas juste "ça marche pas")
4. **Utiliser les commandes** `/debug`, `/refactor`, `/validate`

### Pour les Projets Complexes
1. **Découper en phases** plutôt que tout demander d'un coup
2. **Valider chaque phase** avant de passer à la suivante
3. **Utiliser la mémoire** `/memory save` pour les contextes importants
4. **Documenter les décisions** au fur et à mesure

### Pour la Production
1. **Toujours tester** avant de déployer
2. **Review le code** généré pour les parties critiques
3. **Configurer les secrets** manuellement (jamais dans le code)
4. **Avoir un rollback plan**

## Amélioration Continue

Ce système s'améliore au fil du temps grâce aux learnings:
- Chaque projet terminé génère un learning
- Les patterns réussis sont sauvegardés
- Les erreurs sont documentées pour ne pas les répéter
- Les templates sont mis à jour avec les meilleures pratiques
