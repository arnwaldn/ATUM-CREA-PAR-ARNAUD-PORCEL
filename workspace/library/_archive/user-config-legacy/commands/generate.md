---
description: Code generation (components, routes, etc) (user)
---

# /generate - Code Generation

## USAGE
```
/generate component "UserCard"
/generate route "/api/users/[id]"
/generate model "Product"
/generate crud "posts"
/generate hook "useDebounce"
```

## GENERATORS

### component
React/Next.js component
```
/generate component "DataTable"
/generate component "Modal" --variant=dialog
```

### route
API route ou page
```
/generate route "/api/products"
/generate route "/dashboard/settings"
```

### model
Database model (Prisma)
```
/generate model "Order"
```

### crud
CRUD complet (model + API + UI)
```
/generate crud "products"
```

### hook
Custom React hook
```
/generate hook "useLocalStorage"
```

## COMPONENT GENERATOR

```
/generate component "ProductCard"
```

Output:
```tsx
// src/components/ProductCard.tsx
import { Card, CardHeader, CardContent } from "@/components/ui/card"

interface ProductCardProps {
  id: string
  name: string
  price: number
  image?: string
}

export function ProductCard({ id, name, price, image }: ProductCardProps) {
  return (
    <Card>
      <CardHeader>
        {image && <img src={image} alt={name} className="w-full h-48 object-cover" />}
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold">{name}</h3>
        <p className="text-muted-foreground">${price}</p>
      </CardContent>
    </Card>
  )
}
```

## CRUD GENERATOR

```
/generate crud "posts"
```

Cree:
```
src/
  app/api/posts/
    route.ts          # GET all, POST
    [id]/route.ts     # GET one, PUT, DELETE
  app/posts/
    page.tsx          # List page
    [id]/page.tsx     # Detail page
    new/page.tsx      # Create page
  components/posts/
    PostList.tsx
    PostCard.tsx
    PostForm.tsx
  lib/
    posts.ts          # Data layer
```

## HOOK GENERATOR

```
/generate hook "useDebounce"
```

Output:
```typescript
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
```

## OPTIONS
| Option | Description |
|--------|-------------|
| --variant=X | Variante specifique |
| --path=X | Chemin custom |
| --test | Generer tests aussi |
| --story | Generer Storybook |

## CONVENTIONS

### Naming
- Components: PascalCase
- Hooks: camelCase avec use prefix
- Routes: kebab-case
- Files: same as export name

### Structure
```
src/
  components/
    [ComponentName]/
      index.tsx
      [ComponentName].test.tsx
  hooks/
    use[HookName].ts
  app/
    api/
      [resource]/
        route.ts
```

## MCP UTILISES
- shadcn (composants UI)
- Write (creation fichiers)
- Context7 (best practices)
