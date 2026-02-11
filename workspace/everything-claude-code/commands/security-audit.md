# Security Audit

Run a comprehensive security audit on the codebase:

1. Dependency vulnerability scan:
   - `npm audit --audit-level=high`
   - Parse results, categorize by severity (critical, high, moderate, low)
   - Check if `npm audit fix` can resolve issues
   - Flag any critical CVEs that require manual intervention

2. Secrets detection:
   - Grep for hardcoded API keys, passwords, tokens, private keys
   - Patterns: `api[_-]?key`, `password`, `secret`, `token`, `private[_-]?key`, `-----BEGIN`
   - Check .env files are not committed (verify .gitignore)
   - Scan git history for leaked secrets: `git log -p --all -S "password"`

3. Static analysis with semgrep (if available):
   - `npx @semgrep/semgrep --config=auto .`
   - Focus on OWASP Top 10 patterns
   - SQL injection, XSS, command injection, SSRF

4. OWASP checklist:
   - Input validation on all user inputs
   - Parameterized queries (no string concatenation in SQL)
   - Output escaping (no innerHTML with user data)
   - Authentication on all protected endpoints
   - Authorization checks (not just authentication)
   - Rate limiting on sensitive endpoints
   - CSRF protection enabled
   - Security headers set (CSP, HSTS, X-Frame-Options)
   - HTTPS enforced

5. Generate report with:
   - Severity: CRITICAL, HIGH, MEDIUM, LOW
   - File location and line numbers
   - Issue description and impact
   - Recommended fix with code example
   - CVE references where applicable

6. Block deployment if CRITICAL issues found

Use the **security-reviewer** agent for deep analysis.
Never approve code with unresolved critical vulnerabilities!
