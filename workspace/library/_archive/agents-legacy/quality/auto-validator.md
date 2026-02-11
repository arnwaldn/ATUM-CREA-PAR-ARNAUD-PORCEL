# Agent: Auto-Validator

## Role
Agent de validation automatique qui vérifie la qualité du code après chaque modification.

## Pipeline de Validation

### 1. Pre-Commit Checks
```yaml
checks:
  - lint: "Vérification ESLint"
  - format: "Vérification Prettier"
  - types: "Vérification TypeScript"
  - imports: "Vérification imports inutilisés"
```

### 2. Build Validation
```yaml
checks:
  - compile: "Compilation réussie"
  - bundle_size: "Taille bundle acceptable"
  - no_errors: "Pas d'erreurs de build"
```

### 3. Test Validation
```yaml
checks:
  - unit_tests: "Tests unitaires passent"
  - coverage: "Couverture > 80%"
  - no_skipped: "Pas de tests skipés"
```

### 4. Security Validation
```yaml
checks:
  - dependencies: "Pas de vulnérabilités connues"
  - secrets: "Pas de secrets exposés"
  - xss: "Protection XSS"
  - sql_injection: "Protection SQL injection"
```

### 5. Performance Validation
```yaml
checks:
  - lighthouse: "Score > 90"
  - bundle_analysis: "Pas de bloat"
  - lazy_loading: "Images lazy loadées"
```

## Implémentation

### Script de Validation Principal
```typescript
// scripts/validate.ts
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface ValidationResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

async function runValidation(
  name: string,
  command: string
): Promise<ValidationResult> {
  const start = Date.now();
  try {
    await execAsync(command);
    return {
      name,
      passed: true,
      message: "OK",
      duration: Date.now() - start,
    };
  } catch (error: any) {
    return {
      name,
      passed: false,
      message: error.stderr || error.message,
      duration: Date.now() - start,
    };
  }
}

async function validate() {
  console.log("🔍 Démarrage de la validation...\n");

  const results: ValidationResult[] = [];

  // Lint
  results.push(await runValidation("ESLint", "pnpm lint"));

  // TypeScript
  results.push(await runValidation("TypeScript", "pnpm tsc --noEmit"));

  // Tests
  results.push(await runValidation("Tests", "pnpm test --run"));

  // Build
  results.push(await runValidation("Build", "pnpm build"));

  // Results
  console.log("\n📊 Résultats:\n");

  let allPassed = true;
  results.forEach((result) => {
    const icon = result.passed ? "✅" : "❌";
    console.log(`${icon} ${result.name} (${result.duration}ms)`);
    if (!result.passed) {
      console.log(`   ${result.message}`);
      allPassed = false;
    }
  });

  console.log("\n");

  if (allPassed) {
    console.log("✨ Toutes les validations ont réussi!");
    process.exit(0);
  } else {
    console.log("❌ Certaines validations ont échoué.");
    process.exit(1);
  }
}

validate();
```

### Configuration ESLint Stricte
```javascript
// eslint.config.js
import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": typescript,
      react,
      "react-hooks": reactHooks,
      import: importPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      // TypeScript
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "error",

      // React
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Import
      "import/no-unused-modules": "error",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
        },
      ],

      // General
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
    },
  },
];
```

### Hook Pre-Commit (Husky + lint-staged)
```json
// package.json
{
  "scripts": {
    "prepare": "husky install",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "validate": "pnpm lint && pnpm typecheck && pnpm test --run"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

### GitHub Actions Workflow
```yaml
# .github/workflows/validate.yml
name: Validate

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm typecheck

      - name: Test
        run: pnpm test --run --coverage

      - name: Build
        run: pnpm build

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Métriques de Qualité

### Seuils Acceptables
| Métrique | Minimum | Recommandé |
|----------|---------|------------|
| Test Coverage | 70% | 85%+ |
| Lighthouse Performance | 80 | 95+ |
| Lighthouse Accessibility | 90 | 100 |
| Bundle Size (gzip) | < 500KB | < 200KB |
| Build Time | < 5min | < 2min |
| TypeScript Strictness | Strict | Strict |

### Dashboard de Qualité
```typescript
// Générer rapport de qualité
interface QualityReport {
  timestamp: Date;
  scores: {
    lint: number;
    tests: number;
    coverage: number;
    lighthouse: number;
    security: number;
  };
  issues: Array<{
    severity: "error" | "warning" | "info";
    message: string;
    file?: string;
    line?: number;
  }>;
}
```

## Commandes

```
/validate          - Validation complète
/validate quick    - Lint + Types seulement
/validate full     - Tout incluant Lighthouse
/validate fix      - Auto-fix ce qui peut l'être
```

## Intégration Continue

### À chaque commit
1. Lint-staged vérifie les fichiers modifiés
2. Prettier formate automatiquement
3. Commit bloqué si erreurs

### À chaque PR
1. CI run validation complète
2. Tests + Coverage
3. Build de preview
4. Lighthouse audit

### Avant déploiement
1. Validation full
2. Security audit
3. Performance check
4. Smoke tests
