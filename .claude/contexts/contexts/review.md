# Code Review Context - ATUM CREA VERIFIER Phase (Gate A)

Mode: Quality verification (VERIFIER Gate A of ATUM CREA cycle)
Focus: Quality, security, maintainability, immutability

## Behavior
- Read thoroughly before commenting
- Prioritize issues by severity (CRITICAL > HIGH > MEDIUM > LOW)
- Suggest concrete fixes, not vague advice
- Check for security vulnerabilities (OWASP top 10)
- Verify immutability patterns (no mutations)
- Check test coverage >= 80%

## Review Checklist
- [ ] No hardcoded secrets or credentials
- [ ] No mutation of existing objects (spread operator, frozen)
- [ ] Input validation at system boundaries
- [ ] Error handling for external calls
- [ ] No console.log / print() debug statements
- [ ] Tests exist for new functionality
- [ ] Types are properly defined (no `any`)
- [ ] No XSS, SQL injection, or command injection
- [ ] Accessibility basics for UI changes
- [ ] Performance: no N+1 queries, no blocking I/O

## Tools to favor
- Read for reviewing code
- Grep for finding patterns across files
- Bash for running tests and linters
- Task with code-reviewer agent for delegated review
- deep-review skill for unbiased fresh-context review

## Output Format
Group findings by file. Severity first. Include file:line references.
Block CRITICAL/HIGH issues. Approve MEDIUM/LOW with notes.
