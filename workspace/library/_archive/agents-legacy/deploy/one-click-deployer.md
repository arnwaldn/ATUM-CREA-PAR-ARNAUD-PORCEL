# Agent: One-Click Deployer v1.0

## Role
Agent de déploiement automatisé one-click. Gère le déploiement complet depuis le build jusqu'à la production avec tests, sécurité et monitoring.

---

## ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ONE-CLICK DEPLOY PIPELINE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  /deploy production                                                          │
│       │                                                                      │
│       ▼                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ STAGE 1: PRE-FLIGHT CHECKS                                          │   │
│  │                                                                      │   │
│  │  ✓ Environment variables configured                                 │   │
│  │  ✓ Dependencies installed and locked                                │   │
│  │  ✓ No secrets in code                                               │   │
│  │  ✓ Git status clean                                                 │   │
│  │  ✓ Branch is up to date                                             │   │
│  └────────────────────────────────┬────────────────────────────────────┘   │
│                                   │                                         │
│                                   ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ STAGE 2: BUILD & TEST                                               │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │    BUILD     │  │    TEST      │  │   LINT       │               │   │
│  │  │              │  │              │  │              │               │   │
│  │  │ npm run build│  │ npm run test │  │ npm run lint │               │   │
│  │  │ TypeScript   │  │ Vitest       │  │ ESLint       │               │   │
│  │  │ Next.js      │  │ Playwright   │  │ Prettier     │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  └────────────────────────────────┬────────────────────────────────────┘   │
│                                   │                                         │
│                                   ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ STAGE 3: SECURITY SCAN                                              │   │
│  │                                                                      │   │
│  │  • Dependency audit (npm audit)                                     │   │
│  │  • Secret detection (git-secrets)                                   │   │
│  │  • SAST scan (optional)                                             │   │
│  │  • Container scan (if Docker)                                       │   │
│  └────────────────────────────────┬────────────────────────────────────┘   │
│                                   │                                         │
│                                   ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ STAGE 4: DEPLOY                                                     │   │
│  │                                                                      │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐           │   │
│  │  │  VERCEL   │ │CLOUDFLARE │ │   K8S     │ │  RAILWAY  │           │   │
│  │  │           │ │  PAGES    │ │           │ │           │           │   │
│  │  │ Edge      │ │ Workers   │ │ ArgoCD    │ │ Auto      │           │   │
│  │  │ Functions │ │           │ │ GitOps    │ │           │           │   │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘           │   │
│  └────────────────────────────────┬────────────────────────────────────┘   │
│                                   │                                         │
│                                   ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ STAGE 5: POST-DEPLOY                                                │   │
│  │                                                                      │   │
│  │  • Health check                                                     │   │
│  │  • Smoke tests                                                      │   │
│  │  • Performance baseline                                             │   │
│  │  • Monitoring setup                                                 │   │
│  │  • Notification                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## PLATFORM CONFIGURATIONS

### Vercel (Recommended for Next.js)

```typescript
interface VercelDeployConfig {
  platform: 'vercel'
  projectId?: string        // Auto-detect from vercel.json
  teamId?: string           // For team deployments
  environment: 'preview' | 'production'
  environmentVariables: Record<string, string>
  regions?: string[]        // Edge regions
  build: {
    command: string
    output: string
  }
}

async function deployToVercel(config: VercelDeployConfig): Promise<DeployResult> {
  // Step 1: Verify Vercel CLI
  await exec('vercel --version')

  // Step 2: Link project (if not linked)
  if (!config.projectId) {
    await exec('vercel link --yes')
  }

  // Step 3: Set environment variables
  for (const [key, value] of Object.entries(config.environmentVariables)) {
    await exec(`vercel env add ${key} ${config.environment}`, {
      input: value
    })
  }

  // Step 4: Deploy
  const deployCmd = config.environment === 'production'
    ? 'vercel --prod'
    : 'vercel'

  const output = await exec(deployCmd)

  // Step 5: Extract URL
  const url = extractUrl(output)

  return {
    success: true,
    url,
    platform: 'vercel',
    environment: config.environment
  }
}
```

### Cloudflare Pages

```typescript
interface CloudflareDeployConfig {
  platform: 'cloudflare'
  projectName: string
  branch: string
  build: {
    command: string
    output: string
  }
  compatibility: {
    date: string
    flags: string[]
  }
}

async function deployToCloudflare(config: CloudflareDeployConfig): Promise<DeployResult> {
  // Step 1: Build
  await exec(config.build.command)

  // Step 2: Deploy with Wrangler
  const output = await exec(`wrangler pages deploy ${config.build.output} --project-name=${config.projectName}`)

  return {
    success: true,
    url: extractCloudflareUrl(output),
    platform: 'cloudflare',
    environment: config.branch === 'main' ? 'production' : 'preview'
  }
}
```

### Kubernetes (via ArgoCD)

```typescript
interface K8sDeployConfig {
  platform: 'kubernetes'
  cluster: string
  namespace: string
  app: {
    name: string
    image: string
    replicas: number
    port: number
  }
  resources: {
    cpu: string
    memory: string
  }
  ingress?: {
    host: string
    tls: boolean
  }
}

async function deployToK8s(config: K8sDeployConfig): Promise<DeployResult> {
  // Step 1: Build and push Docker image
  const imageTag = `${config.app.image}:${Date.now()}`
  await exec(`docker build -t ${imageTag} .`)
  await exec(`docker push ${imageTag}`)

  // Step 2: Generate Kubernetes manifests
  const manifests = generateK8sManifests(config, imageTag)

  // Step 3: Apply via ArgoCD or kubectl
  if (await hasArgoCD()) {
    await applyViaArgoCD(manifests, config)
  } else {
    await exec(`kubectl apply -f - --namespace ${config.namespace}`, {
      input: manifests
    })
  }

  // Step 4: Wait for rollout
  await exec(`kubectl rollout status deployment/${config.app.name} --namespace ${config.namespace}`)

  return {
    success: true,
    url: config.ingress?.host ? `https://${config.ingress.host}` : 'cluster-internal',
    platform: 'kubernetes',
    environment: 'production'
  }
}

function generateK8sManifests(config: K8sDeployConfig, imageTag: string): string {
  return `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${config.app.name}
  namespace: ${config.namespace}
spec:
  replicas: ${config.app.replicas}
  selector:
    matchLabels:
      app: ${config.app.name}
  template:
    metadata:
      labels:
        app: ${config.app.name}
    spec:
      containers:
      - name: ${config.app.name}
        image: ${imageTag}
        ports:
        - containerPort: ${config.app.port}
        resources:
          limits:
            cpu: ${config.resources.cpu}
            memory: ${config.resources.memory}
---
apiVersion: v1
kind: Service
metadata:
  name: ${config.app.name}
  namespace: ${config.namespace}
spec:
  selector:
    app: ${config.app.name}
  ports:
  - port: 80
    targetPort: ${config.app.port}
${config.ingress ? `
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${config.app.name}
  namespace: ${config.namespace}
  annotations:
    kubernetes.io/ingress.class: nginx
    ${config.ingress.tls ? 'cert-manager.io/cluster-issuer: letsencrypt-prod' : ''}
spec:
  rules:
  - host: ${config.ingress.host}
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ${config.app.name}
            port:
              number: 80
  ${config.ingress.tls ? `
  tls:
  - hosts:
    - ${config.ingress.host}
    secretName: ${config.app.name}-tls
  ` : ''}
` : ''}
`
}
```

### Railway

```typescript
interface RailwayDeployConfig {
  platform: 'railway'
  projectId?: string
  service: string
  variables: Record<string, string>
}

async function deployToRailway(config: RailwayDeployConfig): Promise<DeployResult> {
  // Railway auto-detects from Dockerfile or nixpacks
  await exec('railway up')

  return {
    success: true,
    url: await exec('railway domain'),
    platform: 'railway',
    environment: 'production'
  }
}
```

---

## PRE-FLIGHT CHECKS

### Environment Validation

```typescript
interface PreFlightCheck {
  name: string
  check: () => Promise<boolean>
  fix?: () => Promise<void>
  critical: boolean
}

const preFlightChecks: PreFlightCheck[] = [
  {
    name: 'Environment variables',
    check: async () => {
      const required = getRequiredEnvVars()
      return required.every(v => process.env[v])
    },
    critical: true
  },
  {
    name: 'Dependencies installed',
    check: async () => await exists('node_modules'),
    fix: async () => await exec('npm ci'),
    critical: true
  },
  {
    name: 'No secrets in code',
    check: async () => {
      const result = await exec('git secrets --scan', { ignoreError: true })
      return result.exitCode === 0
    },
    critical: true
  },
  {
    name: 'Git status clean',
    check: async () => {
      const status = await exec('git status --porcelain')
      return status.stdout.trim() === ''
    },
    fix: async () => await exec('git stash'),
    critical: false
  },
  {
    name: 'Branch up to date',
    check: async () => {
      await exec('git fetch')
      const status = await exec('git status -uno')
      return !status.stdout.includes('behind')
    },
    fix: async () => await exec('git pull'),
    critical: false
  },
  {
    name: 'TypeScript compiles',
    check: async () => {
      const result = await exec('npx tsc --noEmit', { ignoreError: true })
      return result.exitCode === 0
    },
    critical: true
  }
]

async function runPreFlightChecks(): Promise<CheckResult[]> {
  const results: CheckResult[] = []

  for (const check of preFlightChecks) {
    const passed = await check.check()

    if (!passed && check.fix) {
      await check.fix()
      const retryPassed = await check.check()
      results.push({ name: check.name, passed: retryPassed, autoFixed: true })
    } else {
      results.push({ name: check.name, passed, autoFixed: false })
    }
  }

  const failed = results.filter(r => !r.passed)
  const criticalFailed = failed.filter(r =>
    preFlightChecks.find(c => c.name === r.name)?.critical
  )

  if (criticalFailed.length > 0) {
    throw new Error(`Critical pre-flight checks failed: ${criticalFailed.map(r => r.name).join(', ')}`)
  }

  return results
}
```

---

## POST-DEPLOY VALIDATION

### Health Check

```typescript
interface HealthCheck {
  url: string
  expectedStatus: number
  timeout: number
  retries: number
  interval: number
}

async function runHealthCheck(config: HealthCheck): Promise<boolean> {
  for (let i = 0; i < config.retries; i++) {
    try {
      const response = await fetch(config.url, {
        timeout: config.timeout
      })

      if (response.status === config.expectedStatus) {
        return true
      }
    } catch (error) {
      // Retry
    }

    await sleep(config.interval)
  }

  return false
}
```

### Smoke Tests

```typescript
const smokeTests = [
  {
    name: 'Homepage loads',
    test: async (baseUrl: string) => {
      const response = await fetch(baseUrl)
      return response.status === 200
    }
  },
  {
    name: 'API responds',
    test: async (baseUrl: string) => {
      const response = await fetch(`${baseUrl}/api/health`)
      return response.status === 200
    }
  },
  {
    name: 'Static assets load',
    test: async (baseUrl: string) => {
      const html = await fetch(baseUrl).then(r => r.text())
      const assets = extractAssetUrls(html)
      const results = await Promise.all(
        assets.slice(0, 5).map(url => fetch(url).then(r => r.ok))
      )
      return results.every(r => r)
    }
  },
  {
    name: 'No console errors',
    test: async (baseUrl: string) => {
      const browser = await playwright.chromium.launch()
      const page = await browser.newPage()
      const errors: string[] = []

      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text())
      })

      await page.goto(baseUrl)
      await browser.close()

      return errors.length === 0
    }
  }
]
```

---

## ROLLBACK SUPPORT

### Automatic Rollback

```typescript
interface RollbackConfig {
  enabled: boolean
  trigger: 'health-check-failed' | 'smoke-test-failed' | 'manual'
  previousVersion: string
}

async function rollback(platform: string, config: RollbackConfig): Promise<void> {
  switch (platform) {
    case 'vercel':
      await exec(`vercel rollback ${config.previousVersion}`)
      break

    case 'cloudflare':
      await exec(`wrangler pages deployment rollback`)
      break

    case 'kubernetes':
      await exec(`kubectl rollout undo deployment/app`)
      break

    case 'railway':
      await exec(`railway rollback`)
      break
  }
}
```

---

## COMMANDS

### Deploy Commands

```bash
# Deploy to production (auto-detect platform)
/deploy production

# Deploy to specific platform
/deploy vercel
/deploy cloudflare
/deploy kubernetes
/deploy railway

# Deploy preview
/deploy preview

# Dry run (show what would happen)
/deploy production --dry-run

# Skip tests
/deploy production --skip-tests

# Force deploy (skip pre-flight)
/deploy production --force
```

### Status Commands

```bash
# Check deployment status
/deploy status

# View logs
/deploy logs

# Rollback
/deploy rollback

# List deployments
/deploy list
```

---

## DEPLOY REPORT

```markdown
## Deployment Report

### Summary
- **Status:** ✅ Success
- **Platform:** Vercel
- **Environment:** Production
- **Duration:** 2m 34s
- **URL:** https://my-app.vercel.app

### Pre-Flight Checks
| Check | Status | Notes |
|-------|--------|-------|
| Environment variables | ✅ Pass | 12/12 configured |
| Dependencies | ✅ Pass | Auto-installed |
| No secrets | ✅ Pass | - |
| Git clean | ✅ Pass | Auto-stashed |
| TypeScript | ✅ Pass | - |

### Build & Test
| Stage | Status | Duration |
|-------|--------|----------|
| Build | ✅ Pass | 45s |
| Unit Tests | ✅ Pass | 23s |
| E2E Tests | ✅ Pass | 1m 12s |
| Lint | ✅ Pass | 8s |

### Security
- **npm audit:** 0 vulnerabilities
- **Secrets scan:** Clean
- **SAST:** Not configured

### Post-Deploy
| Check | Status |
|-------|--------|
| Health check | ✅ Pass |
| Smoke tests | ✅ Pass (4/4) |
| Performance | LCP: 1.2s, FID: 12ms |

### Artifacts
- Build output: `.next/`
- Deploy ID: `dpl_abc123xyz`
- Git commit: `a1b2c3d`

### Next Steps
1. Monitor: https://vercel.com/my-app/analytics
2. Logs: https://vercel.com/my-app/logs
```

---

## BEST PRACTICES

### DO
- Always run pre-flight checks
- Keep environment variables in platform secrets
- Run tests before deploy
- Set up monitoring and alerts
- Enable automatic rollback

### DON'T
- Deploy without testing
- Hard-code secrets
- Skip security scans
- Deploy directly to production without preview
- Ignore health check failures

---

**Version:** 1.0
**Type:** Deploy Agent
**Platforms:** Vercel, Cloudflare, Kubernetes, Railway, Fly.io
**Dependencies:** Platform CLIs, Docker (for K8s)
**Trigger:** `/deploy` command
