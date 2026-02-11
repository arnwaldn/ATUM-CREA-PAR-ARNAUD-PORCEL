---
description: Initialiser documentation projet (user)
---

# /init-docs - Initialize Project Documentation

## USAGE
```
/init-docs
/init-docs --template=saas
/init-docs --minimal
```

## DESCRIPTION
Creer la structure de documentation complete
pour un projet existant ou nouveau.

## FICHIERS CREES

```
docs/
  README.md           # Documentation principale
  CONTRIBUTING.md     # Guide contribution
  CHANGELOG.md        # Historique versions
  ARCHITECTURE.md     # Decisions architecture
  API.md              # Reference API
  DEPLOYMENT.md       # Guide deploiement

.github/
  ISSUE_TEMPLATE/
    bug_report.md
    feature_request.md
  PULL_REQUEST_TEMPLATE.md
  CODEOWNERS
```

## TEMPLATES

### default
Structure standard
```
/init-docs
```

### saas
Pour projets SaaS
```
/init-docs --template=saas
```
Ajoute: PRICING.md, SECURITY.md, SLA.md

### oss
Pour open-source
```
/init-docs --template=oss
```
Ajoute: CODE_OF_CONDUCT.md, SECURITY.md

### minimal
Minimum viable
```
/init-docs --minimal
```
Seulement: README.md, CONTRIBUTING.md

## CONTENU README

```markdown
# ${projectName}

> ${description}

[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)]()

## Features

- Feature 1
- Feature 2
- Feature 3

## Prerequisites

- Node.js 18+
- npm/pnpm

## Installation

\`\`\`bash
git clone https://github.com/user/repo
cd repo
npm install
\`\`\`

## Development

\`\`\`bash
npm run dev
\`\`\`

## Testing

\`\`\`bash
npm test
\`\`\`

## Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT - See [LICENSE](LICENSE)
```

## WORKFLOW

### 1. Analyse projet
```javascript
// Detecter stack, structure
Glob('**/*.{json,ts,tsx}')
Read('package.json')
```

### 2. Generation adaptee
Adapter contenu selon:
- Stack detecte
- Structure existante
- Conventions trouvees

### 3. Creation fichiers
```javascript
Write('README.md', content)
Write('CONTRIBUTING.md', contributing)
// etc.
```

### 4. Git setup
```bash
git add docs/ README.md CONTRIBUTING.md
git commit -m "docs: initialize project documentation"
```

## OPTIONS
| Option | Description |
|--------|-------------|
| --template=X | Template a utiliser |
| --minimal | Version minimale |
| --force | Ecraser existants |
| --dry-run | Preview sans ecrire |

## VERIFICATIONS

Apres creation, verifier:
- [ ] README complet et accurate
- [ ] Links fonctionnels
- [ ] Code examples testables
- [ ] Contact/support info
