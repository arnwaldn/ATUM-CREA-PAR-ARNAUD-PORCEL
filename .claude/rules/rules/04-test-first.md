# Rule: Test-First Development

## Workflow (MANDATORY for all new code)
1. Write test -> 2. See it fail -> 3. Write minimal code -> 4. See it pass -> 5. Refactor

## Coverage Requirements
- Minimum 80% coverage (lines, branches, functions, statements)
- All public functions must have tests
- All error paths must be tested
- All edge cases (null, undefined, empty, boundary values)

## Test Organization
- Unit tests: co-located with source (`Component.test.tsx` next to `Component.tsx`)
- Integration tests: in `__tests__/` or `tests/integration/`
- E2E tests: in `e2e/` directory root

## Test Quality
- Each test tests ONE behavior (single assertion focus)
- Tests are independent (no shared mutable state)
- Tests use descriptive names: `it('returns empty array when no markets match query')`
- Use AAA pattern: Arrange, Act, Assert
- Mock external dependencies, never mock the unit under test

## Framework Detection
- package.json has vitest -> use Vitest
- package.json has jest -> use Jest
- package.json has playwright -> use Playwright for E2E
- pyproject.toml or setup.py -> use pytest
- go.mod -> use go test with table-driven tests
- pom.xml -> use JUnit 5 + Mockito

## When Tests Are Optional
- Pure configuration files (JSON, YAML, env)
- Static content (markdown, images)
- One-off scripts or migrations
- Prototype/spike code (but add tests before merging)
