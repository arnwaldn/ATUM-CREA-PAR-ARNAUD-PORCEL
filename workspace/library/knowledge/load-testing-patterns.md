# Load Testing Patterns - k6

> **Version**: v1.0 | ATUM CREA
> **Outil**: k6 (grafana/k6) - Go-based, scripts JavaScript
> **CI**: GitHub Actions avec `grafana/run-k6-action`

---

## Installation

```bash
# macOS
brew install k6

# Windows
winget install k6 --source winget

# Docker
docker run --rm -i grafana/k6 run - < script.js
```

---

## Script de base

```javascript
// tests/load/api-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Metriques custom
const errorRate = new Rate('errors');
const apiDuration = new Trend('api_duration');

// Configuration des scenarios
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up a 10 users
    { duration: '1m', target: 50 },    // Ramp up a 50 users
    { duration: '2m', target: 50 },    // Maintenir 50 users
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],   // 95% des requetes < 500ms
    http_req_failed: ['rate<0.01'],     // Moins de 1% d'erreurs
    errors: ['rate<0.05'],              // Custom: moins de 5% d'erreurs
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test page d'accueil
  const homeRes = http.get(`${BASE_URL}/`);
  check(homeRes, {
    'home status is 200': (r) => r.status === 200,
    'home loads in < 2s': (r) => r.timings.duration < 2000,
  });

  // Test API
  const apiRes = http.get(`${BASE_URL}/api/products`, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(apiRes, {
    'api status is 200': (r) => r.status === 200,
    'api returns array': (r) => JSON.parse(r.body).length > 0,
    'api response < 500ms': (r) => r.timings.duration < 500,
  });
  errorRate.add(apiRes.status !== 200);
  apiDuration.add(apiRes.timings.duration);

  sleep(1); // Pause 1s entre iterations
}
```

---

## Scenarios avances

```javascript
// tests/load/scenarios.js
export const options = {
  scenarios: {
    // Trafic constant
    constant_load: {
      executor: 'constant-vus',
      vus: 50,
      duration: '5m',
    },

    // Montee progressive
    ramp_up: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 0 },
      ],
    },

    // Spike test
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 200 },  // Spike brutal
        { duration: '1m', target: 200 },
        { duration: '10s', target: 0 },
      ],
    },

    // Soak test (endurance)
    soak: {
      executor: 'constant-vus',
      vus: 30,
      duration: '30m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};
```

---

## Test d'authentification

```javascript
// tests/load/auth-flow.js
import http from 'k6/http';
import { check, group, sleep } from 'k6';

export const options = {
  vus: 20,
  duration: '2m',
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    'group_duration{group:::Login Flow}': ['avg<2000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  group('Login Flow', () => {
    // 1. Obtenir le formulaire
    const loginPage = http.get(`${BASE_URL}/login`);
    check(loginPage, { 'login page loads': (r) => r.status === 200 });

    // 2. Soumettre le login
    const loginRes = http.post(
      `${BASE_URL}/api/auth/login`,
      JSON.stringify({
        email: `user${__VU}@test.com`,
        password: 'testpassword123',
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    check(loginRes, {
      'login succeeds': (r) => r.status === 200,
      'returns token': (r) => JSON.parse(r.body).token !== undefined,
    });

    if (loginRes.status === 200) {
      const token = JSON.parse(loginRes.body).token;

      // 3. Acceder a une route protegee
      const dashRes = http.get(`${BASE_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      check(dashRes, {
        'dashboard accessible': (r) => r.status === 200,
      });
    }
  });

  sleep(2);
}
```

---

## Integration GitHub Actions

```yaml
# .github/workflows/load-test.yml
name: Load Tests

on:
  workflow_dispatch:
    inputs:
      target_url:
        description: 'URL to test'
        required: true
        default: 'https://staging.monapp.com'
  schedule:
    - cron: '0 6 * * 1'  # Chaque lundi a 6h

jobs:
  load-test:
    name: k6 Load Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup k6
        uses: grafana/setup-k6-action@v1

      - name: Run load tests
        uses: grafana/run-k6-action@v1
        with:
          path: tests/load/api-load.js
          flags: --out json=results.json
        env:
          BASE_URL: ${{ github.event.inputs.target_url || 'https://staging.monapp.com' }}

      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: k6-results
          path: results.json
```

---

## Seuils recommandes par type d'app

| Type | p(95) latence | Error rate | VUs recommandes |
|------|--------------|------------|-----------------|
| **Landing page** | < 300ms | < 0.1% | 100 |
| **SaaS Dashboard** | < 500ms | < 1% | 50 |
| **API REST** | < 200ms | < 0.5% | 200 |
| **E-commerce** | < 400ms | < 0.1% | 150 |

---

## Checklist

- [ ] k6 installe (local ou Docker)
- [ ] Scripts de test par endpoint critique
- [ ] Thresholds definis (latence p95, error rate)
- [ ] Checks de validation des reponses
- [ ] Scenarios: ramp-up, constant, spike, soak
- [ ] Integration GitHub Actions (schedule ou manual)
- [ ] Tests sur environnement staging (pas production)
- [ ] Resultats archives en artifacts

---

*Knowledge ATUM CREA | Sources: grafana/k6, grafana/run-k6-action*
