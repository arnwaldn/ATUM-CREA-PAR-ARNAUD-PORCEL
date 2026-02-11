# Task Breakdown: {{FEATURE_NUMBER}}-{{FEATURE_NAME}}

> **Spec Reference**: [spec.md](./spec.md)
> **Plan Reference**: [plan.md](./plan.md)
> **Status**: {{STATUS}} (Draft | Review | Approved | In Progress | Complete)
> **Total Tasks**: {{TOTAL_TASKS}}
> **Parallelizable**: {{PARALLEL_TASKS}}

---

## Task Overview

```
{{TASK_DEPENDENCY_DIAGRAM}}

Example:
T1 (Setup) ─────┬──▶ T2 (API) ────┬──▶ T5 (Integration)
                │                  │
                └──▶ T3 (UI) ─────┘
                │
                └──▶ T4 (Tests) ──────▶ T6 (E2E)
                     [PARALLEL]
```

---

## Task List

### Phase 1: Foundation

#### T1: {{TASK_1_TITLE}}

| Attribute | Value |
|-----------|-------|
| **ID** | T1 |
| **Type** | Setup / Feature / Fix / Refactor |
| **Priority** | P0 / P1 / P2 |
| **Complexity** | S / M / L / XL |
| **Parallelizable** | Yes / No |
| **Depends On** | - |
| **Blocks** | T2, T3, T4 |

**Description**:
{{TASK_DESCRIPTION}}

**Acceptance Criteria**:
- [ ] {{CRITERION_1}}
- [ ] {{CRITERION_2}}
- [ ] {{CRITERION_3}}

**Test Requirements** (Article III):
- [ ] Unit test: {{TEST_DESCRIPTION}}
- [ ] Test file: `{{TEST_FILE_PATH}}`

**Files to Create/Modify**:
- [ ] `{{FILE_PATH_1}}` - {{PURPOSE}}
- [ ] `{{FILE_PATH_2}}` - {{PURPOSE}}

---

#### T2: {{TASK_2_TITLE}}

| Attribute | Value |
|-----------|-------|
| **ID** | T2 |
| **Type** | Feature |
| **Priority** | P0 |
| **Complexity** | M |
| **Parallelizable** | Yes (with T3) |
| **Depends On** | T1 |
| **Blocks** | T5 |

**Description**:
{{TASK_DESCRIPTION}}

**Acceptance Criteria**:
- [ ] {{CRITERION_1}}
- [ ] {{CRITERION_2}}

**Test Requirements**:
- [ ] Unit test: {{TEST_DESCRIPTION}}
- [ ] Integration test: {{TEST_DESCRIPTION}}

**Files to Create/Modify**:
- [ ] `{{FILE_PATH}}`

---

### Phase 2: Core Implementation

#### T3: {{TASK_3_TITLE}} `[PARALLEL with T2]`

| Attribute | Value |
|-----------|-------|
| **ID** | T3 |
| **Type** | Feature |
| **Priority** | P0 |
| **Complexity** | M |
| **Parallelizable** | Yes (with T2) |
| **Depends On** | T1 |
| **Blocks** | T5 |

**Description**:
{{TASK_DESCRIPTION}}

**Acceptance Criteria**:
- [ ] {{CRITERION_1}}
- [ ] {{CRITERION_2}}

**Test Requirements**:
- [ ] Component test: {{TEST_DESCRIPTION}}

---

#### T4: {{TASK_4_TITLE}} `[PARALLEL with T2, T3]`

| Attribute | Value |
|-----------|-------|
| **ID** | T4 |
| **Type** | Testing |
| **Priority** | P1 |
| **Complexity** | S |
| **Parallelizable** | Yes |
| **Depends On** | T1 |
| **Blocks** | T6 |

**Description**:
{{TASK_DESCRIPTION}}

**Test Coverage Target**: {{COVERAGE}}%

---

### Phase 3: Integration

#### T5: {{TASK_5_TITLE}}

| Attribute | Value |
|-----------|-------|
| **ID** | T5 |
| **Type** | Integration |
| **Priority** | P0 |
| **Complexity** | L |
| **Parallelizable** | No |
| **Depends On** | T2, T3 |
| **Blocks** | T6 |

**Description**:
{{TASK_DESCRIPTION}}

**Integration Points**:
- [ ] {{INTEGRATION_1}}
- [ ] {{INTEGRATION_2}}

---

### Phase 4: Verification

#### T6: {{TASK_6_TITLE}}

| Attribute | Value |
|-----------|-------|
| **ID** | T6 |
| **Type** | E2E Testing |
| **Priority** | P0 |
| **Complexity** | M |
| **Parallelizable** | No |
| **Depends On** | T4, T5 |
| **Blocks** | - |

**Description**:
{{TASK_DESCRIPTION}}

**E2E Scenarios**:
- [ ] {{SCENARIO_1}}
- [ ] {{SCENARIO_2}}

---

## Execution Order

### Sequential (Critical Path)

```
T1 → T2 → T5 → T6
```

### Parallel Opportunities

| Batch | Tasks | Can Run After |
|-------|-------|---------------|
| Batch 1 | T2, T3, T4 | T1 complete |
| Batch 2 | T5, T6 | Batch 1 complete |

---

## Progress Tracking

| Task | Status | Assignee | Started | Completed |
|------|--------|----------|---------|-----------|
| T1 | [ ] Pending / [x] In Progress / [x] Complete | {{ASSIGNEE}} | {{DATE}} | {{DATE}} |
| T2 | [ ] Pending | - | - | - |
| T3 | [ ] Pending | - | - | - |
| T4 | [ ] Pending | - | - | - |
| T5 | [ ] Blocked by T2, T3 | - | - | - |
| T6 | [ ] Blocked by T4, T5 | - | - | - |

---

## Risk Register

| Task | Risk | Mitigation |
|------|------|------------|
| {{TASK_ID}} | {{RISK}} | {{MITIGATION}} |

---

## Notes

- Tasks marked `[PARALLEL]` can be executed simultaneously by multiple agents
- All tasks follow Article III (Test-First)
- Complexity estimates: S=1-2h, M=2-4h, L=4-8h, XL=8h+

---

*Task breakdown follows SDD methodology. Execute in order, respect dependencies.*
