# Strix Security Patterns

> **Source**: Adapte de usestrix/strix pour ULTRA-CREATE v27.18
> **Version**: 1.0.0
> **Type**: Patterns de tests de securite autonomes

---

## Architecture Strix Adaptee

### Concept Central
Strix utilise des agents IA autonomes pour identifier et valider des vulnerabilites de securite. L'adaptation ULTRA-CREATE conserve les patterns de detection tout en limitant l'execution de PoC pour des raisons de securite.

### Differences avec l'Original
| Aspect | Strix Original | ULTRA-CREATE Adaptation |
|--------|----------------|-------------------------|
| Execution PoC | Automatique live | Validation statique |
| Agents | Spawn dynamique | Synergies predefinies |
| Sandbox | Full network | E2B isole |
| Cibles | Externes | Locales/autorisees |

---

## Pattern 1: Security Scan Orchestration

### Workflow
```
1. RECON (Reconnaissance)
   └─ Collecter endpoints, technologies, parametres

2. CLASSIFY (Classification)
   └─ Categoriser par type de vulnerabilite potentielle

3. GENERATE (Generation)
   └─ Creer payloads adaptes au contexte

4. VALIDATE (Validation)
   └─ Verifier validite syntaxique et semantique

5. REPORT (Rapport)
   └─ Generer rapport structure avec severite
```

### Implementation
```javascript
// Orchestration via strix-coordinator
const securityScan = {
  phases: ['recon', 'classify', 'generate', 'validate', 'report'],
  maxDepth: 3,  // Limite recursion
  timeout: 300000,  // 5 min max
  agents: {
    recon: 'security-scanner-expert',
    classify: 'strix-coordinator',
    generate: 'payload-engineer',
    validate: 'exploit-validator',
    report: 'security-auditor'
  }
};
```

---

## Pattern 2: Adaptive Payload Generation

### Concept
Generation de payloads contextuels bases sur les technologies detectees.

### Framework Detection
```javascript
const frameworkSignatures = {
  'react': ['__REACT_DEVTOOLS', 'data-reactroot'],
  'angular': ['ng-version', 'ng-app'],
  'vue': ['data-v-', '__VUE__'],
  'django': ['csrfmiddlewaretoken', 'Django'],
  'rails': ['authenticity_token', 'Rails'],
  'express': ['X-Powered-By: Express'],
  'spring': ['JSESSIONID', 'Spring'],
  'laravel': ['XSRF-TOKEN', 'laravel_session']
};
```

### Payload Adaptation
```javascript
function generatePayload(vulnType, framework, context) {
  const basePayloads = PAYLOADS[vulnType];

  // Adapter au framework
  const adapted = basePayloads.map(p => {
    if (framework === 'react') {
      return adaptForReact(p, context);
    }
    if (framework === 'django') {
      return adaptForDjango(p, context);
    }
    return p;
  });

  // Encoder selon contexte
  return adapted.map(p => encodeForContext(p, context));
}

function encodeForContext(payload, context) {
  switch(context) {
    case 'url': return encodeURIComponent(payload);
    case 'html_attr': return htmlAttributeEncode(payload);
    case 'json': return JSON.stringify(payload);
    case 'base64': return btoa(payload);
    default: return payload;
  }
}
```

---

## Pattern 3: Confidence-Based Severity

### Calcul de Confiance
```javascript
function calculateConfidence(finding) {
  let confidence = 0;

  // Evidence directe (+40%)
  if (finding.directEvidence) confidence += 40;

  // Comportement anormal (+30%)
  if (finding.anomalyDetected) confidence += 30;

  // Pattern match (+20%)
  if (finding.patternMatch) confidence += 20;

  // Contexte favorable (+10%)
  if (finding.contextRelevant) confidence += 10;

  return Math.min(confidence, 100);
}
```

### Seuils de Rapport
| Confidence | Action |
|------------|--------|
| 90-100% | Rapport immediat, haute priorite |
| 70-89% | Rapport avec validation recommandee |
| 50-69% | Note pour investigation |
| < 50% | Log seulement, pas de rapport |

---

## Pattern 4: DAG Constraint

### Probleme
Eviter les boucles infinies dans l'orchestration multi-agents.

### Solution
```javascript
const DAGConstraint = {
  maxDepth: 3,
  visitedAgents: new Set(),

  canInvoke(agentId, currentDepth) {
    if (currentDepth >= this.maxDepth) return false;
    if (this.visitedAgents.has(agentId)) return false;
    return true;
  },

  markVisited(agentId) {
    this.visitedAgents.add(agentId);
  },

  reset() {
    this.visitedAgents.clear();
  }
};
```

---

## Pattern 5: Security Report Structure

### Format Standard
```json
{
  "scan_id": "uuid",
  "timestamp": "ISO-8601",
  "target": {
    "url": "string",
    "type": "web|api|mobile"
  },
  "findings": [
    {
      "id": "FINDING-001",
      "type": "SQLi|XSS|IDOR|...",
      "severity": "CRITICAL|HIGH|MEDIUM|LOW|INFO",
      "confidence": 0-100,
      "location": {
        "endpoint": "/api/users",
        "parameter": "id",
        "method": "GET"
      },
      "evidence": {
        "request": "...",
        "response": "...",
        "payload": "..."
      },
      "remediation": "Description de la correction",
      "references": ["CWE-XXX", "OWASP-XX"]
    }
  ],
  "summary": {
    "total": 10,
    "critical": 1,
    "high": 3,
    "medium": 4,
    "low": 2
  }
}
```

---

## Pattern 6: Safe Execution Boundary

### Principe
Jamais executer de PoC sur cibles live sans autorisation explicite.

### Implementation
```javascript
const SafetyBoundary = {
  allowedTargets: [
    'localhost',
    '127.0.0.1',
    '*.local',
    '*.test',
    '*.example'
  ],

  blockedActions: [
    'data_exfiltration',
    'persistent_backdoor',
    'dos_attack',
    'lateral_movement'
  ],

  isTargetAllowed(target) {
    const url = new URL(target);
    return this.allowedTargets.some(pattern => {
      if (pattern.startsWith('*')) {
        return url.hostname.endsWith(pattern.slice(1));
      }
      return url.hostname === pattern;
    });
  },

  isActionAllowed(action) {
    return !this.blockedActions.includes(action);
  }
};
```

---

## Pattern 7: Multi-Vector Analysis

### Concept
Analyser une vulnerabilite potentielle sous plusieurs angles.

### Vectors
```javascript
const AnalysisVectors = {
  syntactic: {
    description: 'Analyse de la structure du code/requete',
    weight: 0.2
  },
  semantic: {
    description: 'Analyse du sens et contexte',
    weight: 0.3
  },
  behavioral: {
    description: 'Analyse des reponses et comportements',
    weight: 0.3
  },
  historical: {
    description: 'Comparaison avec vulns connues',
    weight: 0.2
  }
};

function multiVectorAnalysis(finding) {
  const scores = {};
  for (const [vector, config] of Object.entries(AnalysisVectors)) {
    scores[vector] = analyzeVector(finding, vector) * config.weight;
  }
  return Object.values(scores).reduce((a, b) => a + b, 0);
}
```

---

## Pattern 8: Progressive Disclosure Security

### Niveaux de Detail
| Niveau | Contenu | Audience |
|--------|---------|----------|
| Executive | Counts + severites | Management |
| Technical | + endpoints + types | Dev team |
| Detailed | + payloads + evidence | Security team |
| Full | + reproduction steps | Pentesters |

### Implementation
```javascript
function generateReport(findings, level) {
  switch(level) {
    case 'executive':
      return {
        summary: summarize(findings),
        risk_score: calculateRiskScore(findings)
      };
    case 'technical':
      return {
        ...generateReport(findings, 'executive'),
        findings: findings.map(f => ({
          type: f.type,
          endpoint: f.location.endpoint,
          severity: f.severity
        }))
      };
    case 'detailed':
      return {
        ...generateReport(findings, 'technical'),
        findings: findings.map(f => ({
          ...f,
          evidence: f.evidence
        }))
      };
    case 'full':
      return { findings };
  }
}
```

---

## Integration Hindsight

### Banks Utilisees
```javascript
const SecurityMemory = {
  // Stocker patterns de vuln resolues
  retain: {
    bank: 'patterns',
    tags: ['security', vulnType],
    content: finding
  },

  // Rechercher vulns similaires
  recall: {
    bank: 'errors',
    query: `security ${vulnType} ${framework}`,
    top_k: 5
  }
};
```

---

## Commande /security-scan

### Usage
```bash
# Scan complet
/security-scan https://localhost:3000

# Scan cible
/security-scan https://localhost:3000 --type SQLi,XSS

# Scan avec rapport
/security-scan https://localhost:3000 --report detailed

# Scan API
/security-scan https://localhost:3000/api --type IDOR,AuthBypass
```

### Options
| Option | Description | Default |
|--------|-------------|---------|
| `--type` | Types de vuln a tester | all |
| `--report` | Niveau de rapport | technical |
| `--timeout` | Timeout en secondes | 300 |
| `--depth` | Profondeur analyse | 2 |

---

## Limites ULTRA-CREATE

### Ce qu'on fait
- Detection de patterns vulnerables
- Generation de payloads contextuels
- Validation syntaxique/semantique
- Rapports structures
- Recommandations de remediation

### Ce qu'on ne fait PAS
- Execution de PoC sur systemes live
- Exfiltration de donnees
- Persistence/backdoors
- Attaques DoS
- Tests sans autorisation

---

## Disclaimer

> **USAGE AUTORISE UNIQUEMENT**
> - Tests sur applications locales/de developpement
> - CTF et challenges de securite
> - Audits avec autorisation ecrite
> - Recherche defensive
> - Education en cybersecurite

---

*ULTRA-CREATE v27.18 - Strix Patterns - Adapte de usestrix/strix*
