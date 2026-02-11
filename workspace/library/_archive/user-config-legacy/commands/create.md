---
description: "Cree un nouveau projet depuis une description en langage naturel"
---

# Mode CREATE Active

Creation de projet: **$ARGUMENTS**

## WORKFLOW

1. **Intent Parser** - Analyser la description
2. **Wizard Agent** - Questions si confidence < 70%
3. **Template Matching** - Consulter `templates/manifest.json`
4. **Context7** - Charger documentation du stack
5. **Hindsight Recall** - Patterns similaires precedents
6. **Fullstack Super** - Generation du code
7. **Hindsight Retain** - Sauvegarder nouveaux patterns

## AGENTS IMPLIQUES

| Role | Agent |
|------|-------|
| Primary | `wizard-agent` |
| Secondary | `intent-parser`, `fullstack-super` |

## MCPs REQUIS

- `context7` - Documentation frameworks
- `hindsight` - Memoire patterns

## MCPs OPTIONNELS

- `supabase` - Si backend requis
- `github` - Si repo a creer

## STACK PAR DEFAUT (2025)

| Composant | Technologie |
|-----------|-------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.7 strict |
| Styling | TailwindCSS 4 + shadcn/ui |
| Database | Supabase |
| Auth | Clerk ou Supabase Auth |
| Payments | Stripe (si necessaire) |

## EXEMPLES

```
/create un SaaS de facturation
/create une landing page pour startup IA
/create un dashboard admin avec authentification
/create une app mobile de fitness avec Expo
```

## PROCESS

1. Analyser la demande utilisateur
2. Identifier le type de projet (SaaS, landing, mobile, etc.)
3. Selectionner le template approprie
4. Poser des questions clarificatrices si necessaire
5. Generer le projet complet avec structure best-practices
6. Configurer les dependances et l'environnement

## GO!

Analyse la demande et cree le projet demande.
