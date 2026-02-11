# Project Constitution: {{PROJECT_NAME}}

> This document establishes the governing principles for the {{PROJECT_NAME}} project.
> All specifications, plans, and implementations MUST comply with these articles.

---

## Article I: Library-First Principle

Every feature MUST be implementable as a standalone, reusable library.

**Rationale**: Libraries are testable in isolation, composable, and maintainable.

**Compliance Check**:
- [ ] Feature can be extracted as npm/pip package
- [ ] No hard dependencies on application framework
- [ ] Clear public API defined

---

## Article II: CLI Interface Mandate

All libraries MUST expose CLI interfaces with text I/O and JSON support.

**Rationale**: CLI interfaces enable automation, testing, and AI agent integration.

**Compliance Check**:
- [ ] `--help` flag implemented
- [ ] `--json` output mode available
- [ ] Exit codes follow conventions (0=success, 1=error)

---

## Article III: Test-First Imperative

Tests MUST be written and approved BEFORE implementation code.

**Rationale**: Tests define expected behavior and prevent scope creep.

**Workflow**:
1. RED: Write test that fails
2. GREEN: Write minimal code to pass
3. VERIFY: Validate against spec

**Compliance Check**:
- [ ] Test file exists before implementation
- [ ] Tests cover all acceptance criteria
- [ ] No implementation without failing test first

---

## Article IV: Specification Authority

Specifications are the source of truth. Code implements specs, not vice versa.

**Rationale**: Specs provide traceability and documentation.

**Compliance Check**:
- [ ] Every feature has a spec.md file
- [ ] Code changes reference spec sections
- [ ] Spec updated before code if requirements change

---

## Article V: Uncertainty Marking

All ambiguities MUST be marked `[NEEDS CLARIFICATION]` and resolved before implementation.

**Rationale**: Assumptions lead to rework. Explicit uncertainty enables resolution.

**Markers**:
- `[NEEDS CLARIFICATION]` - Requirement unclear
- `[ASSUMPTION]` - Decision made without explicit requirement
- `[RISK]` - Potential issue identified

**Compliance Check**:
- [ ] No `[NEEDS CLARIFICATION]` markers in approved specs
- [ ] All `[ASSUMPTION]` markers documented with rationale
- [ ] All `[RISK]` markers have mitigation plans

---

## Article VI: Simplicity Gate

Maximum 3 sub-projects initially. Complexity requires explicit justification.

**Rationale**: Complexity is the enemy of delivery. Start simple, expand deliberately.

**Thresholds**:
- Initial scope: Max 3 sub-projects
- Each addition requires: Business justification + Architecture review

**Compliance Check**:
- [ ] Project count within limit
- [ ] Complexity justified if exceeded

---

## Article VII: Integration Testing

Tests MUST use realistic environments (real DB, actual services) not mocks.

**Rationale**: Mocks hide integration issues. Real tests catch real bugs.

**Allowed Exceptions**:
- External paid APIs (use sandboxes)
- Rate-limited services (use recorded responses)

**Compliance Check**:
- [ ] Integration tests use real database
- [ ] E2E tests run against actual services
- [ ] Mock usage documented and justified

---

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | {{FRONTEND_STACK}} | {{FRONTEND_VERSION}} |
| Backend | {{BACKEND_STACK}} | {{BACKEND_VERSION}} |
| Database | {{DATABASE}} | {{DATABASE_VERSION}} |
| Testing | {{TESTING_FRAMEWORK}} | {{TESTING_VERSION}} |
| Deployment | {{DEPLOYMENT_PLATFORM}} | - |

---

## Non-Negotiables

These constraints cannot be overridden without explicit stakeholder approval:

1. {{NON_NEGOTIABLE_1}}
2. {{NON_NEGOTIABLE_2}}
3. {{NON_NEGOTIABLE_3}}

---

## Amendments

| Date | Article | Change | Approved By |
|------|---------|--------|-------------|
| {{DATE}} | Initial | Constitution created | {{APPROVER}} |

---

*This constitution governs all work on {{PROJECT_NAME}}. Violations require explicit waiver.*
