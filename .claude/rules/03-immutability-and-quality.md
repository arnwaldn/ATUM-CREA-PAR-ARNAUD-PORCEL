# Rule: Immutability & Code Quality

## Immutability (NON-NEGOTIABLE)
- ALWAYS create new objects: `const updated = { ...original, key: newValue }`
- ALWAYS create new arrays: `const updated = [...items, newItem]`
- NEVER use .push(), .pop(), .splice() on existing arrays
- NEVER assign to object properties: `obj.key = value` is FORBIDDEN
- Use Object.freeze() for constants, Readonly<T> for TypeScript types
- Python: use frozen dataclasses, tuple instead of list for immutable data

## Type Safety
- NEVER use `any` in TypeScript - use `unknown` and narrow with type guards
- ALWAYS define interfaces/types for function parameters and return values
- Use discriminated unions for state variants
- Use Zod schemas for runtime validation at system boundaries

## Error Handling
- ALWAYS handle errors at external boundaries (API calls, DB, file I/O)
- Use typed error classes, never throw raw strings
- Implement graceful degradation with fallback behavior
- Log errors with context (what, where, input data)

## Functions
- Maximum 50 lines per function
- Maximum 4 levels of nesting (use early returns)
- Single responsibility - one function does one thing
- Pure functions preferred - minimize side effects

## Security Defaults
- ALWAYS validate user input with Zod or equivalent
- NEVER trust client-side data
- ALWAYS parameterize database queries (never string concatenation)
- ALWAYS sanitize HTML output to prevent XSS
- NEVER commit secrets, API keys, or credentials
- Use environment variables for all configuration
