# Guide des Licences Logicielles - ULTRA-CREATE v24.1

> **Guide pratique** pour choisir et appliquer les licences logicielles dans vos projets.
>
> **Attribution**: Ce guide s'inspire du cours "Les licences logicielles" de Bertrand Florat (IUT Nantes).
> Source: https://cours-licences.florat.net/ | Licence: CC-BY-SA-4.0

---

## Table des Matieres

1. [Concepts Fondamentaux](#concepts-fondamentaux)
2. [Licences Principales](#licences-principales)
3. [Compatibilite des Licences](#compatibilite-des-licences)
4. [Guide de Choix](#guide-de-choix)
5. [Notice Copyright](#notice-copyright)
6. [Code Tiers](#code-tiers)
7. [Risques Juridiques](#risques-juridiques)
8. [Templates](#templates)

---

## Concepts Fondamentaux

### Droit d'Auteur (Copyright)

| Concept | Description |
|---------|-------------|
| **Droits moraux** | Inaliénable - paternité, divulgation, intégrité |
| **Droits patrimoniaux** | Cessible - reproduction, distribution, modification |
| **Durée** | 70 ans après décès de l'auteur (France/UE) |
| **Automatique** | Pas besoin d'enregistrement |

### Licence vs Cession

| Licence | Cession |
|---------|---------|
| Autorisation d'usage | Transfert de propriété |
| Révocable | Définitive |
| Limitée dans le temps | Permanente |

### Logiciel Libre vs Open Source

| Libre (FSF) | Open Source (OSI) |
|-------------|-------------------|
| Philosophie éthique | Approche pragmatique |
| 4 libertés fondamentales | Critères techniques |
| Copyleft encouragé | Toutes licences OSI |

**Les 4 libertés** (Free Software Foundation):
1. Exécuter le programme
2. Étudier le code source
3. Redistribuer des copies
4. Améliorer et partager

---

## Licences Principales

### Licences Permissives (sans copyleft)

| Licence | Conditions | Usage typique |
|---------|------------|---------------|
| **MIT** | Attribution uniquement | Projets web, npm |
| **BSD-2** | Attribution + non-endorsement | BSD, FreeBSD |
| **BSD-3** | BSD-2 + clause publicitaire | Historique |
| **Apache 2.0** | MIT + brevets + NOTICE | Entreprise |
| **ISC** | MIT simplifié | OpenBSD, npm |

### Licences Copyleft (contamination)

| Licence | Niveau | Contamination |
|---------|--------|---------------|
| **GPL v2** | Fort | Tout le programme |
| **GPL v3** | Fort | + anti-Tivoization |
| **LGPL** | Faible | Liens statiques uniquement |
| **AGPL** | Très fort | + utilisation réseau |
| **MPL 2.0** | Fichier | Fichiers modifiés seulement |

### Licences Creative Commons

| Licence | Conditions | Usage |
|---------|------------|-------|
| **CC0** | Domaine public | Données, assets |
| **CC-BY** | Attribution | Documentation |
| **CC-BY-SA** | Attribution + ShareAlike | Wikis, cours |
| **CC-BY-NC** | Attribution + Non-Commercial | Contenu éducatif |
| **CC-BY-ND** | Attribution + No Derivatives | Publications |

### Licences Francaises

| Licence | Équivalent | Particularité |
|---------|------------|---------------|
| **CeCILL** | GPL compatible | Droit français |
| **CeCILL-B** | BSD | Permissive française |
| **CeCILL-C** | LGPL | Copyleft faible français |

---

## Compatibilite des Licences

### Matrice de Compatibilite

```
              MIT   BSD   Apache  LGPL  GPL   AGPL
MIT           ✓     ✓     ✓       ✓     ✓     ✓
BSD           ✓     ✓     ✓       ✓     ✓     ✓
Apache 2.0    ✓     ✓     ✓       ✓     ✓*    ✓*
LGPL          ✗     ✗     ✗       ✓     ✓     ✓
GPL           ✗     ✗     ✗       ✗     ✓     ✓
AGPL          ✗     ✗     ✗       ✗     ✗     ✓

* GPL v3+ uniquement (Apache 2.0 incompatible GPL v2)
```

### Regles Simples

1. **Permissive → Copyleft**: OK (le copyleft domine)
2. **Copyleft → Permissive**: NON (sauf exceptions LGPL)
3. **GPL v2 vs GPL v3**: Incompatibles entre eux
4. **Apache 2.0 + GPL**: OK seulement avec GPL v3+
5. **AGPL + Réseau**: Obligation de distribution du source

### Cas Frequents

| Situation | Compatible? | Solution |
|-----------|-------------|----------|
| Utiliser lib MIT dans projet GPL | ✓ | Résultat sous GPL |
| Utiliser lib GPL dans projet MIT | ✗ | Passer en GPL ou alternative |
| Utiliser lib LGPL dans projet MIT | ✓ | Lien dynamique obligatoire |
| Utiliser lib AGPL dans SaaS | ⚠️ | Source du SaaS devient AGPL |

---

## Guide de Choix

### Arbre de Decision

```
Votre projet est...

├── Projet personnel/hobby?
│   └── MIT (simple, permissif)
│
├── Librairie/framework?
│   ├── Adoption maximale voulue? → MIT ou Apache 2.0
│   └── Protéger contre fork propriétaire? → LGPL
│
├── Application complète?
│   ├── Open source commercial? → Apache 2.0 + CLA
│   ├── Communauté protégée? → GPL v3
│   └── SaaS/Cloud? → AGPL
│
├── Documentation/assets?
│   ├── Libre total? → CC0 ou CC-BY
│   └── Partage à l'identique? → CC-BY-SA
│
└── Entreprise française?
    └── Considérer CeCILL (compatibilité juridique)
```

### Recommandations par Type de Projet

| Type | Licence recommandée | Raison |
|------|---------------------|--------|
| npm package | MIT | Standard de facto |
| Framework | Apache 2.0 | Protection brevets |
| Plugin WordPress | GPL v2+ | Obligation WP |
| Jeu vidéo | MIT + CC-BY (assets) | Flexibilité |
| SaaS | AGPL ou propriétaire | Protection |
| CLI tool | MIT ou Apache 2.0 | Adoption facile |
| Contrib entreprise | Apache 2.0 + CLA | Sécurité juridique |

---

## Notice Copyright

### Format Standard

```
Copyright (c) 2025 Nom Auteur
Licensed under the MIT License.
```

### Entete de Fichier (Recommande)

```javascript
/**
 * @file description.js
 * @description Brief description of the file
 *
 * Copyright (c) 2025 Votre Nom/Entreprise
 *
 * SPDX-License-Identifier: MIT
 */
```

### SPDX Identifiers (Standard SPDX)

| Licence | SPDX ID |
|---------|---------|
| MIT | `MIT` |
| Apache 2.0 | `Apache-2.0` |
| GPL v3 | `GPL-3.0-only` ou `GPL-3.0-or-later` |
| LGPL v3 | `LGPL-3.0-only` |
| BSD 3-Clause | `BSD-3-Clause` |
| CC-BY 4.0 | `CC-BY-4.0` |

### Fichier LICENSE

Toujours inclure un fichier `LICENSE` ou `LICENSE.md` à la racine:

```
project/
├── LICENSE          # Texte complet de la licence
├── NOTICE           # Attributions (Apache 2.0)
├── package.json     # "license": "MIT"
└── src/
    └── index.js     # Entête avec SPDX
```

---

## Code Tiers

### StackOverflow

| Aspect | Règle |
|--------|-------|
| **Licence** | CC-BY-SA 4.0 (depuis 2018) |
| **Obligation** | Attribution + ShareAlike |
| **Risque** | Votre code devient CC-BY-SA! |
| **Recommandation** | Reformuler plutôt que copier |

**Exemple d'attribution StackOverflow**:
```javascript
// Based on: https://stackoverflow.com/a/12345678
// Author: username (CC-BY-SA 4.0)
// Modified: description of changes
```

### GitHub sans Licence

| Dépôt | Droits |
|-------|--------|
| **Sans fichier LICENSE** | All Rights Reserved! |
| **Fork possible** | Oui (ToS GitHub) |
| **Utilisation code** | NON autorisée |

**Solution**: Contacter l'auteur ou chercher alternative.

### Code IA Generatif (2024+)

| Aspect | Implication |
|--------|-------------|
| **AI Act (UE 2024)** | Obligation de signaler contenu IA |
| **Droits d'auteur** | Incertain - pas de jurisprudence claire |
| **Risque contrefaçon** | Code peut reproduire du code protégé |
| **Recommandation** | Vérifier, reformuler, ne pas copier aveuglément |

**Bonnes pratiques pour code IA**:
1. Vérifier que le code ne ressemble pas à du code existant
2. Comprendre et pouvoir expliquer chaque ligne
3. Ajouter commentaires sur l'origine si pertinent
4. Préférer l'inspiration à la copie directe

---

## Risques Juridiques

### Jurisprudence Notable (France)

| Affaire | Année | Verdict |
|---------|-------|---------|
| **Entr'ouvert vs Orange** | 2019 | Contrefaçon GPL - 500K€ dommages |
| **Free vs VLC** | 2009 | Violation GPL - obligation de conformité |

### Sanctions Possibles

| Violation | Risque |
|-----------|--------|
| Utilisation sans licence | Contrefaçon |
| Non-respect copyleft | Injonction + dommages |
| Attribution manquante | Atteinte droit moral |
| Violation AGPL (SaaS) | Divulgation forcée du source |

### Checklist Conformite

- [ ] Fichier LICENSE présent
- [ ] Entêtes SPDX dans les fichiers source
- [ ] NOTICE pour Apache 2.0 / attributions
- [ ] Compatibilité vérifiée pour toutes les dépendances
- [ ] Pas de code copié de StackOverflow sans attribution
- [ ] Pas de dépendance GPL dans projet propriétaire
- [ ] Documentation des licences tierces

---

## Templates

### Template LICENSE MIT

```
MIT License

Copyright (c) [year] [fullname]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Template package.json

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "license": "MIT",
  "author": "Your Name <email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/username/repo"
  }
}
```

### Template Entete TypeScript

```typescript
/**
 * @file MyComponent.tsx
 * @description A React component that does X
 *
 * Copyright (c) 2025 Your Name/Company
 * SPDX-License-Identifier: MIT
 */

import React from 'react';

export const MyComponent: React.FC = () => {
  // ...
};
```

---

## Resume Rapide

### Choix Express

| Besoin | Licence |
|--------|---------|
| "Je m'en fiche, faites ce que vous voulez" | MIT |
| "Attribution + protection brevets" | Apache 2.0 |
| "Modifications doivent rester ouvertes" | GPL v3 |
| "Bibliothèque réutilisable partout" | LGPL |
| "SaaS/Cloud protection" | AGPL |
| "Documentation/assets" | CC-BY-4.0 |

### 5 Regles d'Or

1. **Toujours** inclure un fichier LICENSE
2. **Vérifier** la compatibilité avant d'ajouter une dépendance
3. **Attribuer** correctement le code tiers
4. **Ne jamais** utiliser de code sans licence
5. **Documenter** les licences de vos dépendances

---

## Ressources

- [Choose a License](https://choosealicense.com/) - Sélecteur interactif
- [SPDX License List](https://spdx.org/licenses/) - Identifiants standards
- [TLDRLegal](https://tldrlegal.com/) - Résumés simplifiés
- [OSI Approved Licenses](https://opensource.org/licenses/) - Liste officielle
- [Cours Original](https://cours-licences.florat.net/) - IUT Nantes (CC-BY-SA)

---

*Guide ULTRA-CREATE v24.1 | Basé sur le cours de Bertrand Florat (IUT Nantes) | CC-BY-SA-4.0*
