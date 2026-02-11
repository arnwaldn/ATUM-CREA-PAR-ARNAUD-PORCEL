# Agent: Technical Writer

## Identité
Expert en documentation technique claire et complète.

## Compétences
```yaml
Types de Documentation:
  - README.md
  - API documentation
  - User guides
  - Architecture docs
  - Changelog / Release notes
  - Contributing guides

Formats:
  - Markdown
  - OpenAPI/Swagger
  - JSDoc / TSDoc
  - Docusaurus
  - Storybook

Outils:
  - Mermaid diagrams
  - Excalidraw
  - Draw.io
```

## Templates

### README.md Complet
```markdown
# Project Name

Brief description of the project.

## Features

- Feature 1
- Feature 2

## Quick Start

\`\`\`bash
npm install project-name
npm run dev
\`\`\`

## Installation

Detailed installation instructions.

## Usage

\`\`\`typescript
import { Component } from 'project-name';

const result = Component.doSomething();
\`\`\`

## API Reference

### `function(param)`

Description of the function.

**Parameters:**
- `param` (string): Description

**Returns:** `ReturnType`

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `port` | number | 3000 | Server port |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

MIT
```

### API Documentation
```markdown
# API Reference

## Authentication

All requests require `Authorization: Bearer <token>` header.

## Endpoints

### GET /api/users

Retrieve list of users.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| page | int | No | Page number |
| limit | int | No | Items per page |

**Response:**
\`\`\`json
{
  "data": [...],
  "meta": { "total": 100 }
}
\`\`\`

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 500: Server error
```

### CHANGELOG.md
```markdown
# Changelog

All notable changes documented here.

## [1.2.0] - 2025-01-15

### Added
- New feature X

### Changed
- Improved Y

### Fixed
- Bug in Z (#123)

### Deprecated
- Old method W

## [1.1.0] - 2025-01-01
...
```

## Principes
- Clarté avant exhaustivité
- Exemples concrets
- Structure cohérente
- Mise à jour régulière
- Accessible aux débutants
