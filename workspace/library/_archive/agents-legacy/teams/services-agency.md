# Services Agency Team

**Version**: 1.0.0 (Inspired by Agency-Swarm pattern)
**Category**: teams
**Purpose**: Equipe multi-agents avec roles definis (CEO/CTO/PM/Dev/Client)

---

## Overview

L'Agency Team implemente un pattern hierarchique d'agents specialises
qui collaborent pour analyser et executer des projets complexes.

**Pattern**: Agency-Swarm (hierarchie + communication)

---

## Architecture

```
                        SERVICES AGENCY

            ┌─────────────────────────────────────┐
            │           PROJECT DIRECTOR          │
            │              (CEO)                  │
            │     Strategic vision + Decisions    │
            └──────────────┬──────────────────────┘
                           │
         ┌─────────────────┼─────────────────────┐
         │                 │                     │
         v                 v                     v
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   TECHNICAL     │ │    PRODUCT      │ │   CLIENT        │
│   ARCHITECT     │ │    MANAGER      │ │   MANAGER       │
│     (CTO)       │ │     (PM)        │ │                 │
└────────┬────────┘ └────────┬────────┘ └─────────────────┘
         │                   │
         v                   v
┌─────────────────┐ ┌─────────────────┐
│     LEAD        │ │   DESIGNER      │
│   DEVELOPER     │ │                 │
└─────────────────┘ └─────────────────┘
```

---

## Agents Roles

### 1. Project Director (CEO)
```yaml
role: Strategic leadership
responsibilities:
  - Analyze project requirements
  - Evaluate feasibility
  - Make strategic decisions
  - Budget validation

tools:
  - AnalyzeProjectRequirements
  - FeasibilityAssessment

output:
  - Project analysis
  - Go/No-Go decision
  - Strategic recommendations
```

### 2. Technical Architect (CTO)
```yaml
role: Technical vision
responsibilities:
  - Architecture design
  - Technology selection
  - Scalability planning
  - Security considerations

tools:
  - CreateTechnicalSpecification
  - ArchitectureReview

output:
  - Technical specification
  - Architecture diagrams
  - Technology stack
```

### 3. Product Manager (PM)
```yaml
role: Product excellence
responsibilities:
  - Define product roadmap
  - Prioritize features
  - Manage scope
  - Coordinate teams

tools:
  - RoadmapGenerator
  - FeaturePrioritization

output:
  - Product roadmap
  - Feature list
  - Sprint planning
```

### 4. Lead Developer
```yaml
role: Implementation lead
responsibilities:
  - Technical implementation planning
  - Effort estimation
  - Code review standards
  - Best practices

tools:
  - EffortEstimator
  - TechStackValidator

output:
  - Implementation plan
  - Effort estimates
  - Technical guidelines
```

### 5. Client Success Manager
```yaml
role: Client satisfaction
responsibilities:
  - Stakeholder communication
  - Expectation management
  - Feedback collection
  - Go-to-market strategy

tools:
  - GoToMarketPlanner
  - ClientFeedbackAnalyzer

output:
  - Communication plan
  - Launch strategy
  - Success metrics
```

---

## Communication Flow

```yaml
communication_matrix:
  project_director:
    can_talk_to: [technical_architect, product_manager, lead_developer, client_manager]

  technical_architect:
    can_talk_to: [project_director, lead_developer]
    reports_to: project_director

  product_manager:
    can_talk_to: [project_director, lead_developer, client_manager]
    reports_to: project_director

  lead_developer:
    can_talk_to: [technical_architect, product_manager]
    reports_to: technical_architect

  client_manager:
    can_talk_to: [project_director, product_manager]
    reports_to: project_director
```

---

## Workflow Execution

### Phase 1: Project Intake
```yaml
trigger: New project request
actors: [project_director]
actions:
  - Receive project details
  - Initial feasibility check
  - Assign to technical review
```

### Phase 2: Technical Analysis
```yaml
trigger: Project approved by CEO
actors: [technical_architect, lead_developer]
actions:
  - Architecture design
  - Technology selection
  - Effort estimation
parallel: true
```

### Phase 3: Product Planning
```yaml
trigger: Technical spec complete
actors: [product_manager]
actions:
  - Feature prioritization
  - Roadmap creation
  - Sprint planning
```

### Phase 4: Client Strategy
```yaml
trigger: Product plan ready
actors: [client_manager]
actions:
  - Go-to-market strategy
  - Communication plan
  - Success metrics definition
```

### Phase 5: Synthesis
```yaml
trigger: All analyses complete
actors: [project_director]
actions:
  - Consolidate all inputs
  - Final recommendations
  - Present to stakeholders
```

---

## Usage

### Command
```bash
/agency [project_type] "[description]"
```

### Example
```bash
/agency saas "Plateforme de gestion de projet avec collaboration temps reel"
```

### Output Format
```markdown
# Agency Analysis: [Project Name]

## Tab 1: CEO Strategic Analysis
[Strategic vision and go/no-go]

## Tab 2: CTO Technical Specification
[Architecture and tech stack]

## Tab 3: PM Product Roadmap
[Features and timeline]

## Tab 4: Lead Developer Implementation Plan
[Technical details and estimates]

## Tab 5: Client Success Strategy
[Launch and growth plan]
```

---

## Integration avec ULTRA-CREATE

```yaml
integration:
  pm_agent: Validates all outputs
  hindsight: Saves patterns and learnings
  todowrite: Tracks execution progress

triggers:
  - /agency command
  - Complex project detection
  - Multi-stakeholder requirements
```

---

## Shared State

```yaml
shared_state:
  project_analysis: {}      # CEO output
  technical_specification: {}  # CTO output
  product_roadmap: {}       # PM output
  implementation_plan: {}   # Dev output
  client_strategy: {}       # Client output

  # Prevents duplicate work
  validation:
    - Each tool checks shared_state before execution
    - Raises error if prerequisite missing
```

---

## Metriques

| Metrique | Cible |
|----------|-------|
| Analysis completeness | 100% |
| Cross-team alignment | > 90% |
| Decision time | < 5 min |
| Stakeholder satisfaction | > 95% |

---

*Services Agency v1.0 - Multi-agent hierarchical collaboration*
