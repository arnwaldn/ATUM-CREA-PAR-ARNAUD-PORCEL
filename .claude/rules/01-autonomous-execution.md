# Rule: Autonomous Execution Protocol

## Auto-Recovery (MANDATORY)
When ANY error occurs during execution:
1. Analyze root cause immediately (use extended thinking for complex errors)
2. Fix the issue without asking the user
3. Retry the operation
4. If same approach fails, try a genuinely different strategy
5. Only escalate after 3+ failed attempts with different approaches
Never stop on first failure. Never ask the user to run commands themselves.

## Auto-Detection & Auto-Invoke
- New feature request -> automatically use TDD (write tests first)
- Auth/payment/PII code written -> automatically run security review
- UI component changed -> automatically verify with AI Browser (3 viewports: mobile 375px, tablet 768px, desktop 1440px)
- Build fails -> automatically fix and retry
- Type errors -> automatically resolve
- >50 lines of new code -> automatically trigger code review
- Database schema change -> automatically generate migration
- Before any commit -> automatically run verification

## Context Hygiene
- Use `/clear` between unrelated tasks to prevent context pollution
- After 2+ failed corrections on same issue: `/clear` and start fresh with better prompt
- Delegate heavy research to sub-agents (Explore) to keep main context clean
- Long sessions with irrelevant context reduce performance

## Parallelization Strategy
ALWAYS maximize throughput:
- Launch independent Task agents in parallel (batch of 3-5)
- Run Gate A (code) and Gate B (UX) simultaneously
- Explore multiple codebase areas concurrently
- Run build + lint + type-check in parallel when possible

## Decision Authority
Make decisions autonomously for:
- Technology choices within the established stack
- File organization and naming
- Error handling patterns
- Component structure
- API design following REST conventions
- Database schema design

Ask the user ONLY for:
- Business logic ambiguity
- Design/UX preferences not covered by design-intelligence.md
- Third-party service selection (which payment provider, etc.)
- Scope changes or feature additions beyond the request
