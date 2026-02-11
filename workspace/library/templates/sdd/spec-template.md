# Feature Specification: {{FEATURE_NUMBER}}-{{FEATURE_NAME}}

> **Status**: {{STATUS}} (Draft | Review | Approved | Implemented)
> **Author**: {{AUTHOR}}
> **Created**: {{CREATED_DATE}}
> **Last Updated**: {{UPDATED_DATE}}

---

## Overview

{{FEATURE_DESCRIPTION}}

### Problem Statement

{{PROBLEM_STATEMENT}}

### Proposed Solution

{{SOLUTION_SUMMARY}}

---

## User Stories

### US-1: {{USER_STORY_1_TITLE}}

**As a** {{ROLE}}
**I want to** {{ACTION}}
**So that** {{BENEFIT}}

#### Acceptance Criteria

- [ ] AC-1.1: {{CRITERION_1}}
- [ ] AC-1.2: {{CRITERION_2}}
- [ ] AC-1.3: {{CRITERION_3}}

#### Edge Cases

- EC-1.1: {{EDGE_CASE_1}}
- EC-1.2: {{EDGE_CASE_2}}

---

### US-2: {{USER_STORY_2_TITLE}}

**As a** {{ROLE}}
**I want to** {{ACTION}}
**So that** {{BENEFIT}}

#### Acceptance Criteria

- [ ] AC-2.1: {{CRITERION_1}}
- [ ] AC-2.2: {{CRITERION_2}}

---

## Non-Functional Requirements

### Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| Response Time | {{RESPONSE_TIME}} | P95 latency |
| Throughput | {{THROUGHPUT}} | Requests/second |
| Resource Usage | {{RESOURCE_LIMIT}} | CPU/Memory |

### Security

- [ ] {{SECURITY_REQ_1}}
- [ ] {{SECURITY_REQ_2}}
- [ ] Input validation on all user inputs
- [ ] Authentication required: {{AUTH_REQUIRED}}

### Scalability

- Horizontal scaling: {{HORIZONTAL_SCALING}}
- Data growth: {{DATA_GROWTH_PROJECTION}}

### Accessibility

- WCAG compliance level: {{WCAG_LEVEL}}

---

## Clarifications Needed

> Items that MUST be resolved before implementation begins.

- [ ] `[NEEDS CLARIFICATION]` {{AMBIGUITY_1}}
- [ ] `[NEEDS CLARIFICATION]` {{AMBIGUITY_2}}

---

## Assumptions

> Decisions made in absence of explicit requirements.

- `[ASSUMPTION]` {{ASSUMPTION_1}} - Rationale: {{RATIONALE_1}}
- `[ASSUMPTION]` {{ASSUMPTION_2}} - Rationale: {{RATIONALE_2}}

---

## Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| {{RISK_1}} | High/Medium/Low | High/Medium/Low | {{MITIGATION_1}} |
| {{RISK_2}} | High/Medium/Low | High/Medium/Low | {{MITIGATION_2}} |

---

## Out of Scope

> Explicitly excluded from this feature.

- {{OUT_OF_SCOPE_1}}
- {{OUT_OF_SCOPE_2}}
- {{OUT_OF_SCOPE_3}}

---

## Dependencies

### Internal Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| {{INTERNAL_DEP_1}} | Feature/Service | {{STATUS}} |

### External Dependencies

| Dependency | Type | Owner |
|------------|------|-------|
| {{EXTERNAL_DEP_1}} | API/Service | {{OWNER}} |

---

## Success Metrics

| Metric | Baseline | Target | Measurement Method |
|--------|----------|--------|-------------------|
| {{METRIC_1}} | {{BASELINE}} | {{TARGET}} | {{METHOD}} |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | {{PO_NAME}} | {{DATE}} | [ ] Approved |
| Tech Lead | {{TECH_LEAD}} | {{DATE}} | [ ] Approved |
| QA Lead | {{QA_LEAD}} | {{DATE}} | [ ] Approved |

---

*Specification follows SDD methodology. See constitution.md for governing principles.*
