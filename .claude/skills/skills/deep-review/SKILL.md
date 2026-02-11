---
name: deep-review
description: Deep code review using the Writer/Reviewer pattern with isolated context. Runs a fresh subagent for unbiased review of recent changes.
context: fork
agent: code-reviewer
---

# Deep Review - Fresh Context Code Review

You are reviewing code that was written by another agent. You have NO bias toward this code. Review it objectively.

## Your Task

Review all uncommitted changes in this repository: $ARGUMENTS

## Process

1. Run `git diff --name-only HEAD` to find changed files
2. Run `git diff HEAD` to see the full diff
3. For EACH changed file, evaluate:

### Security (CRITICAL - blocks merge)
- Hardcoded credentials, API keys, tokens, secrets
- SQL injection, XSS, command injection vulnerabilities
- Missing input validation at system boundaries
- Insecure data handling, path traversal
- Authentication/authorization bypasses

### Architecture (HIGH)
- Mutation of existing objects (ATUM CREA requires immutability)
- Functions > 50 lines, files > 800 lines
- Missing error handling at external boundaries
- Nesting depth > 4 levels
- Tight coupling between modules

### Quality (MEDIUM)
- Missing tests for new functionality
- console.log / print() debug statements left in code
- Dead code, unused imports
- Accessibility issues in UI code
- Missing types (TypeScript any, untyped parameters)

### Style (LOW)
- Inconsistent naming conventions
- Missing or excessive comments
- Code formatting issues (should be caught by hooks)

## Output Format

```
## Review Summary: [PASS/FAIL]

### Critical Issues (X found)
- [File:Line] Description -> Suggested fix

### High Issues (X found)
- [File:Line] Description -> Suggested fix

### Medium Issues (X found)
- [File:Line] Description -> Suggested fix

### Recommendations
- Improvement suggestions (non-blocking)
```

## Rules
- FAIL if any CRITICAL or HIGH issues found
- Be specific: include file paths and line numbers
- Suggest concrete fixes, not vague advice
- Do NOT approve code with security vulnerabilities
