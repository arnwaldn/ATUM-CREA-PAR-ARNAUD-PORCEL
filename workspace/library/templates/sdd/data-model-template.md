# Data Model: {{FEATURE_NUMBER}}-{{FEATURE_NAME}}

> **Spec Reference**: [spec.md](./spec.md)
> **Plan Reference**: [plan.md](./plan.md)
> **Status**: {{STATUS}} (Draft | Review | Approved)

---

## Entity Relationship Diagram

```
{{ERD_DIAGRAM}}

Example:
┌──────────────┐       ┌──────────────┐
│    User      │       │    Order     │
├──────────────┤       ├──────────────┤
│ id (PK)      │──┐    │ id (PK)      │
│ email        │  │    │ user_id (FK) │──┐
│ name         │  └───▶│ status       │  │
│ created_at   │       │ total        │  │
└──────────────┘       │ created_at   │  │
                       └──────────────┘  │
                              │          │
                              ▼          │
                       ┌──────────────┐  │
                       │  OrderItem   │  │
                       ├──────────────┤  │
                       │ id (PK)      │  │
                       │ order_id (FK)│◀─┘
                       │ product_id   │
                       │ quantity     │
                       │ price        │
                       └──────────────┘
```

---

## Entities

### {{ENTITY_1_NAME}}

**Description**: {{ENTITY_DESCRIPTION}}

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Primary identifier |
| {{FIELD_1}} | {{TYPE}} | {{CONSTRAINTS}} | {{DESCRIPTION}} |
| {{FIELD_2}} | {{TYPE}} | {{CONSTRAINTS}} | {{DESCRIPTION}} |
| {{FIELD_3}} | {{TYPE}} | {{CONSTRAINTS}} | {{DESCRIPTION}} |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes**:
- `idx_{{entity}}_{{field}}` on ({{FIELD}}) - {{PURPOSE}}
- `idx_{{entity}}_{{field1}}_{{field2}}` on ({{FIELD1}}, {{FIELD2}}) - {{PURPOSE}}

**Constraints**:
- `chk_{{entity}}_{{field}}`: {{CONSTRAINT_DEFINITION}}

---

### {{ENTITY_2_NAME}}

**Description**: {{ENTITY_DESCRIPTION}}

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Primary identifier |
| {{FK_FIELD}} | UUID | FK → {{PARENT_TABLE}}.id, NOT NULL | Reference to {{PARENT}} |
| {{FIELD_1}} | {{TYPE}} | {{CONSTRAINTS}} | {{DESCRIPTION}} |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Foreign Keys**:
- `fk_{{entity}}_{{parent}}`: {{FK_FIELD}} → {{PARENT_TABLE}}.id
  - ON DELETE: {{CASCADE|RESTRICT|SET NULL}}
  - ON UPDATE: {{CASCADE|RESTRICT}}

---

## Enumerations

### {{ENUM_NAME}}

| Value | Description |
|-------|-------------|
| {{VALUE_1}} | {{DESCRIPTION}} |
| {{VALUE_2}} | {{DESCRIPTION}} |
| {{VALUE_3}} | {{DESCRIPTION}} |

---

## SQL Schema

```sql
-- Schema: {{SCHEMA_NAME}}
-- Version: {{VERSION}}
-- Generated: {{DATE}}

-- Enums
CREATE TYPE {{enum_name}} AS ENUM (
  '{{VALUE_1}}',
  '{{VALUE_2}}',
  '{{VALUE_3}}'
);

-- Tables
CREATE TABLE {{table_name}} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  {{field_1}} {{TYPE}} {{CONSTRAINTS}},
  {{field_2}} {{TYPE}} {{CONSTRAINTS}},
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_{{table}}_{{field}} ON {{table_name}}({{field}});

-- Foreign Keys
ALTER TABLE {{child_table}}
ADD CONSTRAINT fk_{{child}}_{{parent}}
FOREIGN KEY ({{fk_field}}) REFERENCES {{parent_table}}(id)
ON DELETE {{ACTION}};

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_{{table}}_updated_at
BEFORE UPDATE ON {{table_name}}
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## TypeScript Types

```typescript
// Generated from data model
// Feature: {{FEATURE_NAME}}

export interface {{Entity1}} {
  id: string;
  {{field1}}: {{TypeScriptType}};
  {{field2}}: {{TypeScriptType}};
  createdAt: Date;
  updatedAt: Date;
}

export interface {{Entity2}} {
  id: string;
  {{parentId}}: string;
  {{field1}}: {{TypeScriptType}};
  createdAt: Date;
  updatedAt: Date;
}

export type {{EnumName}} = '{{VALUE_1}}' | '{{VALUE_2}}' | '{{VALUE_3}}';

// Relations
export interface {{Entity1}}WithRelations extends {{Entity1}} {
  {{relation}}: {{Entity2}}[];
}
```

---

## Prisma Schema

```prisma
// Feature: {{FEATURE_NAME}}

enum {{EnumName}} {
  {{VALUE_1}}
  {{VALUE_2}}
  {{VALUE_3}}
}

model {{Entity1}} {
  id        String   @id @default(uuid())
  {{field1}} {{PrismaType}} {{@ATTRIBUTES}}
  {{field2}} {{PrismaType}} {{@ATTRIBUTES}}

  // Relations
  {{relation}} {{Entity2}}[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("{{table_name}}")
}

model {{Entity2}} {
  id         String @id @default(uuid())
  {{parentId}} String @map("{{parent_id}}")

  // Relations
  {{parent}} {{Entity1}} @relation(fields: [{{parentId}}], references: [id])

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("{{table_name}}")
}
```

---

## Data Validation Rules

| Entity | Field | Validation | Error Message |
|--------|-------|------------|---------------|
| {{Entity}} | {{field}} | {{RULE}} | {{MESSAGE}} |
| {{Entity}} | {{field}} | {{RULE}} | {{MESSAGE}} |

---

## Migration Notes

### Breaking Changes

- {{BREAKING_CHANGE_1}}
- {{BREAKING_CHANGE_2}}

### Data Migration Required

```sql
-- Migrate existing data
UPDATE {{table}} SET {{field}} = {{value}} WHERE {{condition}};
```

### Rollback SQL

```sql
-- Rollback migration
DROP TABLE IF EXISTS {{new_table}};
ALTER TABLE {{table}} DROP COLUMN IF EXISTS {{new_column}};
```

---

*Data model follows SDD methodology. Schema changes require spec approval.*
