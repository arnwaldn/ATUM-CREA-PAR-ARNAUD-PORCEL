# REST API Design Rules

## Consistent Resource Naming

ALWAYS use plural nouns and kebab-case:

```
CORRECT:
  GET    /api/v1/users
  GET    /api/v1/users/{id}
  GET    /api/v1/users/{id}/order-items
  POST   /api/v1/users

WRONG:
  GET    /api/v1/getUsers          (verb in URL)
  GET    /api/v1/user/{id}         (singular)
  GET    /api/v1/userOrderItems    (camelCase)
  GET    /api/v1/user_order_items  (snake_case)
```

Rules:
- Max 3 levels of nesting: `/users/{id}/orders` (not `/users/{id}/orders/{oid}/items/{iid}/comments`)
- Flatten deep nesting with query params: `/order-items?orderId=123`
- No trailing slashes: `/users` (not `/users/`)
- No file extensions: `/users/123` (not `/users/123.json`)

## Proper HTTP Methods

ALWAYS match the method to the operation:

| Method | Purpose | Idempotent | Safe | Cacheable |
|--------|---------|------------|------|-----------|
| GET | Read resource(s) | Yes | Yes | Yes |
| POST | Create resource | No | No | No |
| PUT | Full replace | Yes | No | No |
| PATCH | Partial update | Yes | No | No |
| DELETE | Remove resource | Yes | No | No |

Rules:
- GET must NEVER modify state (side-effect free)
- POST for creation, returns 201 with Location header
- PUT replaces entire resource (send all fields)
- PATCH updates partial fields (send only changed fields)
- DELETE returns 204 No Content (no body)

## Pagination

ALWAYS paginate collection endpoints:

```
Cursor-based (PREFERRED for large/real-time data):
  GET /api/v1/users?cursor=eyJpZCI6MTAwfQ&limit=20

  Response:
  {
    "data": [...],
    "pagination": {
      "cursor": "eyJpZCI6MTIwfQ",
      "hasMore": true,
      "limit": 20
    }
  }

Offset-based (for simple cases with stable data):
  GET /api/v1/users?page=2&limit=20

  Response:
  {
    "data": [...],
    "pagination": {
      "page": 2,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
```

Rules:
- Default limit: 20, max limit: 100
- Always return pagination metadata
- Cursor-based for real-time data (prevents duplicates on page boundaries)
- Offset-based only for admin dashboards or reporting

## Filtering and Sorting

ALWAYS support filtering on collection endpoints:

```
Filtering:
  GET /api/v1/products?category=electronics&inStock=true&minPrice=100

Sorting:
  GET /api/v1/products?sort=price:asc,createdAt:desc

Field Selection:
  GET /api/v1/users?fields=id,name,email

Search:
  GET /api/v1/products?q=wireless+headphones

Date Ranges:
  GET /api/v1/orders?createdAfter=2024-01-01&createdBefore=2024-12-31
```

Rules:
- Use query parameters for all filtering
- Sort format: `field:direction` (asc/desc)
- Default sort must be deterministic (include id as tiebreaker)
- Document all available filters in OpenAPI spec

## Error Responses (RFC 7807)

ALWAYS return errors in RFC 7807 Problem Details format:

```json
{
  "type": "https://api.example.com/errors/validation-error",
  "title": "Validation Error",
  "status": 422,
  "detail": "The request body contains invalid fields.",
  "instance": "/api/v1/users",
  "traceId": "abc-123-def-456",
  "errors": [
    {
      "field": "email",
      "message": "Must be a valid email address",
      "code": "INVALID_FORMAT"
    }
  ]
}
```

Rules:
- Content-Type: `application/problem+json`
- `type` is a URI identifying the error category
- `title` is a short human-readable summary (same for all instances of this type)
- `detail` is specific to this occurrence
- `status` matches the HTTP status code
- `traceId` for debugging and log correlation
- `errors` array for validation errors (field-level detail)
- NEVER expose stack traces, SQL queries, or internal paths in error responses

## Status Codes

ALWAYS use the correct status code:

```
Success:
  200 OK              - GET, PUT, PATCH, DELETE with body
  201 Created         - POST (include Location header)
  204 No Content      - DELETE without body

Client Errors:
  400 Bad Request     - Malformed syntax (unparseable JSON)
  401 Unauthorized    - Missing or invalid authentication
  403 Forbidden       - Authenticated but insufficient permissions
  404 Not Found       - Resource does not exist
  409 Conflict        - State conflict (duplicate key, version mismatch)
  422 Unprocessable   - Valid syntax but invalid semantics (validation)
  429 Too Many Reqs   - Rate limited (include Retry-After header)

Server Errors:
  500 Internal Error  - Unexpected server failure
  502 Bad Gateway     - Upstream service failure
  503 Unavailable     - Temporary overload (include Retry-After header)
```

## Versioning

ALWAYS version your API from day one:

```
URL versioning (RECOMMENDED):
  /api/v1/users
  /api/v2/users

Rules:
  - Increment major version for breaking changes
  - Support N-1 versions (current + previous)
  - Deprecate with Sunset header before removal
  - Add Deprecation header to deprecated endpoints
  - Document migration guide between versions
```

Breaking changes that require a version bump:
- Removing an endpoint or field
- Changing a field type
- Making an optional field required
- Renaming a field or endpoint
- Changing authentication scheme

Non-breaking changes (safe without version bump):
- Adding a new endpoint
- Adding an optional field
- Adding a new query parameter
- Adding a new enum value

## Rate Limiting

ALWAYS include rate limit headers:

```
Response Headers:
  X-RateLimit-Limit: 1000
  X-RateLimit-Remaining: 987
  X-RateLimit-Reset: 1640000000
  Retry-After: 30  (on 429 responses)
```

## Security

MANDATORY for every API:
- Authentication required on all endpoints (except health/status)
- Input validation on all parameters (type, range, length)
- CORS configured to specific origins (not `*` in production)
- HTTPS enforced (redirect HTTP to HTTPS)
- Request size limits enforced
- SQL injection prevention (parameterized queries only)

## Agent Support

- **api-designer** - Use for comprehensive API design reviews and OpenAPI validation
