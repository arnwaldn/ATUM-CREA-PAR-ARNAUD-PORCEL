---
description: Generation documentation technique (user)
---

# /docs - Documentation Generation

## USAGE
```
/docs api "src/api/"
/docs component "src/components/Button.tsx"
/docs readme
/docs changelog
/docs architecture
```

## MODES

### api
Documentation API (OpenAPI/Swagger style)
```
/docs api "src/api/routes/"
```
Output: Documentation endpoints

### component
Documentation composant
```
/docs component "src/components/DataTable.tsx"
```
Output: Props, usage, examples

### readme
Generer/updater README.md
```
/docs readme
```
Output: README complet

### changelog
Generer CHANGELOG
```
/docs changelog
```
Output: CHANGELOG.md depuis git

### architecture
Documentation architecture
```
/docs architecture
```
Output: Diagrammes + decisions

## FORMAT API DOC

```yaml
# GET /api/users/:id
endpoint:
  method: GET
  path: /api/users/:id
  description: Retrieve user by ID

  parameters:
    - name: id
      in: path
      required: true
      type: string
      description: User ID

  responses:
    200:
      description: User found
      schema:
        type: object
        properties:
          id: string
          name: string
          email: string

    404:
      description: User not found

  example:
    request: GET /api/users/123
    response: |
      {
        "id": "123",
        "name": "John Doe",
        "email": "john@example.com"
      }
```

## FORMAT COMPONENT DOC

```markdown
# DataTable

Interactive data table with sorting, filtering, and pagination.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | T[] | required | Array of data items |
| columns | Column[] | required | Column definitions |
| pageSize | number | 10 | Items per page |
| onRowClick | (row: T) => void | - | Row click handler |

## Usage

\`\`\`tsx
import { DataTable } from '@/components/DataTable'

<DataTable
  data={users}
  columns={[
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
  ]}
  pageSize={20}
/>
\`\`\`

## Examples

### Basic Table
...

### With Sorting
...
```

## README TEMPLATE

```markdown
# Project Name

> Short description

## Features
- Feature 1
- Feature 2

## Quick Start
\`\`\`bash
npm install
npm run dev
\`\`\`

## Tech Stack
- Next.js 15
- TypeScript
- Tailwind CSS

## Project Structure
\`\`\`
src/
  app/        # Routes
  components/ # UI Components
  lib/        # Utilities
\`\`\`

## API Reference
[Link to API docs]

## Contributing
...

## License
MIT
```

## OPTIONS
| Option | Description |
|--------|-------------|
| --format=X | md, html, json |
| --output=X | Fichier destination |
| --toc | Table of contents |
| --examples | Inclure exemples |

## MCP UTILISES
- Read (analyse code)
- Mermaid (diagrammes)
- Write (output docs)
