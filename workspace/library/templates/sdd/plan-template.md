# Technical Plan: {{FEATURE_NUMBER}}-{{FEATURE_NAME}}

> **Spec Reference**: [spec.md](./spec.md)
> **Status**: {{STATUS}} (Draft | Review | Approved)
> **Author**: {{AUTHOR}}
> **Created**: {{CREATED_DATE}}

---

## Constitution Compliance

| Article | Status | Notes |
|---------|--------|-------|
| I. Library-First | [ ] Compliant | {{NOTES}} |
| II. CLI Interface | [ ] Compliant | {{NOTES}} |
| III. Test-First | [ ] Compliant | {{NOTES}} |
| IV. Specification Authority | [ ] Compliant | {{NOTES}} |
| V. Uncertainty Marking | [ ] Compliant | {{NOTES}} |
| VI. Simplicity Gate | [ ] Compliant | {{NOTES}} |
| VII. Integration Testing | [ ] Compliant | {{NOTES}} |

---

## Architecture Overview

### High-Level Design

```
{{ASCII_ARCHITECTURE_DIAGRAM}}

Example:
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   API       │────▶│  Database   │
│   (React)   │     │   (Hono)    │     │  (Postgres) │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Cache     │
                    │   (Redis)   │
                    └─────────────┘
```

### Component Breakdown

| Component | Responsibility | Technology |
|-----------|---------------|------------|
| {{COMPONENT_1}} | {{RESPONSIBILITY_1}} | {{TECH_1}} |
| {{COMPONENT_2}} | {{RESPONSIBILITY_2}} | {{TECH_2}} |
| {{COMPONENT_3}} | {{RESPONSIBILITY_3}} | {{TECH_3}} |

---

## Data Flow

### Primary Flow: {{FLOW_NAME}}

```
1. User → {{ACTION_1}}
2. Frontend → {{ACTION_2}}
3. API → {{ACTION_3}}
4. Database → {{ACTION_4}}
5. Response → User
```

### Error Flow

```
1. Error occurs at {{COMPONENT}}
2. Error logged to {{LOGGING_SERVICE}}
3. User receives {{ERROR_RESPONSE}}
4. Retry policy: {{RETRY_POLICY}}
```

---

## API Contracts

### Endpoint: {{ENDPOINT_1}}

```
{{HTTP_METHOD}} {{PATH}}

Request:
{
  "{{FIELD_1}}": "{{TYPE_1}}",
  "{{FIELD_2}}": "{{TYPE_2}}"
}

Response (200):
{
  "{{RESPONSE_FIELD_1}}": "{{TYPE}}",
  "{{RESPONSE_FIELD_2}}": "{{TYPE}}"
}

Response (400):
{
  "error": "{{ERROR_MESSAGE}}",
  "code": "{{ERROR_CODE}}"
}
```

### Endpoint: {{ENDPOINT_2}}

```
{{HTTP_METHOD}} {{PATH}}
...
```

---

## State Management

### Frontend State

| State | Location | Persistence |
|-------|----------|-------------|
| {{STATE_1}} | {{LOCATION}} | {{PERSISTENCE}} |
| {{STATE_2}} | {{LOCATION}} | {{PERSISTENCE}} |

### Backend State

| State | Storage | TTL |
|-------|---------|-----|
| {{STATE_1}} | {{STORAGE}} | {{TTL}} |

---

## Security Considerations

### Authentication

- Method: {{AUTH_METHOD}}
- Token storage: {{TOKEN_STORAGE}}
- Session duration: {{SESSION_DURATION}}

### Authorization

| Resource | Read | Write | Delete |
|----------|------|-------|--------|
| {{RESOURCE_1}} | {{ROLES}} | {{ROLES}} | {{ROLES}} |

### Data Protection

- Encryption at rest: {{ENCRYPTION_REST}}
- Encryption in transit: {{ENCRYPTION_TRANSIT}}
- PII handling: {{PII_POLICY}}

---

## Performance Strategy

### Caching

| Cache | Strategy | TTL | Invalidation |
|-------|----------|-----|--------------|
| {{CACHE_1}} | {{STRATEGY}} | {{TTL}} | {{TRIGGER}} |

### Optimization

- Database: {{DB_OPTIMIZATION}}
- Frontend: {{FE_OPTIMIZATION}}
- API: {{API_OPTIMIZATION}}

---

## Testing Strategy

### Unit Tests

| Component | Coverage Target | Framework |
|-----------|----------------|-----------|
| {{COMPONENT}} | {{COVERAGE}}% | {{FRAMEWORK}} |

### Integration Tests

| Flow | Test Type | Environment |
|------|-----------|-------------|
| {{FLOW}} | {{TYPE}} | {{ENV}} |

### E2E Tests

| Scenario | Tool | Frequency |
|----------|------|-----------|
| {{SCENARIO}} | {{TOOL}} | {{FREQUENCY}} |

---

## Migration Plan

### Database Migrations

```sql
-- Migration: {{MIGRATION_NAME}}
-- Version: {{VERSION}}

{{SQL_STATEMENTS}}
```

### Rollback Plan

```sql
-- Rollback: {{MIGRATION_NAME}}

{{ROLLBACK_SQL}}
```

---

## Deployment Strategy

### Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| Development | {{DEV_URL}} | Feature development |
| Staging | {{STAGING_URL}} | Integration testing |
| Production | {{PROD_URL}} | Live traffic |

### Rollout Plan

1. Deploy to staging
2. Run integration tests
3. Canary deployment ({{CANARY_PERCENT}}%)
4. Monitor for {{MONITOR_DURATION}}
5. Full rollout

---

## Monitoring & Observability

### Metrics

| Metric | Alert Threshold | Action |
|--------|-----------------|--------|
| {{METRIC}} | {{THRESHOLD}} | {{ACTION}} |

### Logging

| Log Level | Retention | Storage |
|-----------|-----------|---------|
| Error | {{RETENTION}} | {{STORAGE}} |
| Info | {{RETENTION}} | {{STORAGE}} |

---

## Related Documents

- [Data Model](./data-model.md)
- [Task Breakdown](./tasks.md)
- [API Contracts](./contracts/)

---

*Technical plan follows SDD methodology. Implementation begins only after approval.*
