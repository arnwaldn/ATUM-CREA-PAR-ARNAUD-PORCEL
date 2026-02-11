# Verification Report: {{FEATURE_NUMBER}}-{{FEATURE_NAME}}

> **Spec Reference**: [spec.md](./spec.md)
> **Plan Reference**: [plan.md](./plan.md)
> **Tasks Reference**: [tasks.md](./tasks.md)
> **Status**: {{STATUS}} (In Progress | Passed | Failed | Blocked)
> **Verified By**: {{VERIFIER}}
> **Date**: {{DATE}}

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Acceptance Criteria | {{TOTAL_AC}} |
| Passed | {{PASSED}} |
| Failed | {{FAILED}} |
| Blocked | {{BLOCKED}} |
| **Pass Rate** | {{PASS_RATE}}% |

**Verdict**: {{APPROVED | NEEDS_WORK | REJECTED}}

---

## Acceptance Criteria Verification

### User Story 1: {{US_1_TITLE}}

| AC ID | Criterion | Status | Evidence | Notes |
|-------|-----------|--------|----------|-------|
| AC-1.1 | {{CRITERION}} | PASS / FAIL / BLOCKED | {{EVIDENCE_LINK}} | {{NOTES}} |
| AC-1.2 | {{CRITERION}} | PASS / FAIL / BLOCKED | {{EVIDENCE_LINK}} | {{NOTES}} |
| AC-1.3 | {{CRITERION}} | PASS / FAIL / BLOCKED | {{EVIDENCE_LINK}} | {{NOTES}} |

### User Story 2: {{US_2_TITLE}}

| AC ID | Criterion | Status | Evidence | Notes |
|-------|-----------|--------|----------|-------|
| AC-2.1 | {{CRITERION}} | PASS / FAIL / BLOCKED | {{EVIDENCE_LINK}} | {{NOTES}} |
| AC-2.2 | {{CRITERION}} | PASS / FAIL / BLOCKED | {{EVIDENCE_LINK}} | {{NOTES}} |

---

## Non-Functional Requirements Verification

### Performance

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Response Time (P95) | < {{TARGET}}ms | {{ACTUAL}}ms | PASS / FAIL |
| Throughput | > {{TARGET}} req/s | {{ACTUAL}} req/s | PASS / FAIL |
| Memory Usage | < {{TARGET}}MB | {{ACTUAL}}MB | PASS / FAIL |

**Test Evidence**: {{PERFORMANCE_TEST_LINK}}

### Security

| Requirement | Status | Test Method | Notes |
|-------------|--------|-------------|-------|
| {{SECURITY_REQ}} | PASS / FAIL | {{METHOD}} | {{NOTES}} |
| Input Validation | PASS / FAIL | Fuzz testing | {{NOTES}} |
| Authentication | PASS / FAIL | Penetration test | {{NOTES}} |

**Security Scan Report**: {{SECURITY_REPORT_LINK}}

### Accessibility

| WCAG Criterion | Level | Status | Tool |
|----------------|-------|--------|------|
| {{CRITERION}} | A / AA / AAA | PASS / FAIL | {{TOOL}} |

**Accessibility Report**: {{A11Y_REPORT_LINK}}

---

## Test Results Summary

### Unit Tests

| Suite | Total | Passed | Failed | Skipped | Coverage |
|-------|-------|--------|--------|---------|----------|
| {{SUITE_1}} | {{TOTAL}} | {{PASSED}} | {{FAILED}} | {{SKIPPED}} | {{COVERAGE}}% |
| {{SUITE_2}} | {{TOTAL}} | {{PASSED}} | {{FAILED}} | {{SKIPPED}} | {{COVERAGE}}% |
| **Total** | {{TOTAL}} | {{PASSED}} | {{FAILED}} | {{SKIPPED}} | {{COVERAGE}}% |

**Target Coverage**: {{TARGET_COVERAGE}}%
**Actual Coverage**: {{ACTUAL_COVERAGE}}%
**Status**: PASS / FAIL

### Integration Tests

| Test | Status | Duration | Notes |
|------|--------|----------|-------|
| {{TEST_NAME}} | PASS / FAIL | {{DURATION}}s | {{NOTES}} |

### E2E Tests

| Scenario | Browser | Status | Screenshot |
|----------|---------|--------|------------|
| {{SCENARIO}} | Chrome | PASS / FAIL | {{LINK}} |
| {{SCENARIO}} | Firefox | PASS / FAIL | {{LINK}} |
| {{SCENARIO}} | Safari | PASS / FAIL | {{LINK}} |

---

## Constitution Compliance

| Article | Compliant | Evidence |
|---------|-----------|----------|
| I. Library-First | YES / NO | {{EVIDENCE}} |
| II. CLI Interface | YES / NO | {{EVIDENCE}} |
| III. Test-First | YES / NO | {{EVIDENCE}} |
| IV. Specification Authority | YES / NO | {{EVIDENCE}} |
| V. Uncertainty Marking | YES / NO | All [NEEDS CLARIFICATION] resolved |
| VI. Simplicity Gate | YES / NO | {{EVIDENCE}} |
| VII. Integration Testing | YES / NO | {{EVIDENCE}} |

---

## Issues Found

### Critical Issues (Blockers)

| ID | Description | AC Affected | Status |
|----|-------------|-------------|--------|
| ISS-001 | {{DESCRIPTION}} | AC-{{ID}} | Open / Fixed / Won't Fix |

### Major Issues

| ID | Description | AC Affected | Status |
|----|-------------|-------------|--------|
| ISS-002 | {{DESCRIPTION}} | AC-{{ID}} | Open / Fixed |

### Minor Issues

| ID | Description | AC Affected | Status |
|----|-------------|-------------|--------|
| ISS-003 | {{DESCRIPTION}} | AC-{{ID}} | Open / Fixed |

---

## Regression Check

| Existing Feature | Status | Test |
|------------------|--------|------|
| {{FEATURE}} | PASS / FAIL | {{TEST_LINK}} |

---

## Sign-Off

### Verification Checklist

- [ ] All acceptance criteria verified
- [ ] All tests passing
- [ ] Coverage targets met
- [ ] Performance targets met
- [ ] Security requirements satisfied
- [ ] Accessibility requirements satisfied
- [ ] No critical or major issues open
- [ ] Constitution compliance verified
- [ ] Regression tests passing

### Approvals

| Role | Name | Decision | Date | Signature |
|------|------|----------|------|-----------|
| QA Lead | {{NAME}} | Approved / Rejected | {{DATE}} | [ ] |
| Tech Lead | {{NAME}} | Approved / Rejected | {{DATE}} | [ ] |
| Product Owner | {{NAME}} | Approved / Rejected | {{DATE}} | [ ] |

---

## Appendix

### Test Execution Logs

```
{{TEST_OUTPUT}}
```

### Screenshots

| Description | Link |
|-------------|------|
| {{DESCRIPTION}} | {{LINK}} |

### Related Documents

- [Test Plan](./test-plan.md)
- [Bug Reports](./bugs/)
- [Performance Report](./performance-report.md)

---

*Verification report follows SDD methodology. Feature releases only after all approvals.*
