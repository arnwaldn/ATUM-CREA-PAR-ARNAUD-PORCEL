# Coding Team (Multimodal)

**Version**: 1.0.0 (Inspired by awesome-llm-apps/multimodal_coding_agent_team)
**Category**: teams
**Purpose**: Equipe de 3 agents pour coding multimodal (Vision + Code + Execution)

---

## Overview

Le Coding Team combine 3 agents specialises pour transformer des inputs
visuels (screenshots, mockups) en code fonctionnel execute en sandbox.

**Pipeline**: Vision -> Code Generation -> Sandbox Execution

---

## Architecture

```
                     CODING TEAM PIPELINE

    ┌─────────────────────────────────────────────────────────┐
    │                      INPUT                               │
    │         Image / Screenshot / Mockup / Text              │
    └──────────────────────────┬──────────────────────────────┘
                               │
                               v
    ┌─────────────────────────────────────────────────────────┐
    │                   VISION AGENT                           │
    │                                                          │
    │   Model: Gemini 2.0 Flash                               │
    │   Task: Analyze image, extract requirements             │
    │   Output: Structured problem description                │
    └──────────────────────────┬──────────────────────────────┘
                               │
                               v
    ┌─────────────────────────────────────────────────────────┐
    │                   CODING AGENT                           │
    │                                                          │
    │   Model: Claude / GPT-4                                 │
    │   Task: Generate optimized code                         │
    │   Output: Clean, documented Python/JS code              │
    └──────────────────────────┬──────────────────────────────┘
                               │
                               v
    ┌─────────────────────────────────────────────────────────┐
    │                 EXECUTION AGENT                          │
    │                                                          │
    │   Tool: E2B Sandbox                                     │
    │   Task: Execute code safely                             │
    │   Output: Results, logs, generated files                │
    └──────────────────────────┬──────────────────────────────┘
                               │
                               v
    ┌─────────────────────────────────────────────────────────┐
    │                      OUTPUT                              │
    │       Working code + Execution results + Files          │
    └─────────────────────────────────────────────────────────┘
```

---

## Agents

### 1. Vision Agent
```yaml
model: Gemini 2.0 Flash (via mcp__figma__ or direct)
mcp_tools:
  - mcp__figma__view_node
  - mcp__desktop-automation__screen_capture
  - Read (for image files)

capabilities:
  - Image analysis
  - UI component detection
  - Layout understanding
  - Text extraction (OCR)
  - Requirement inference

prompt: |
  Analyze this image and extract any coding problem or UI design.
  Describe in clear natural language:
  1. Problem statement or UI requirements
  2. Input/output examples if visible
  3. Constraints or specifications
  Format as a proper development specification.

output:
  problem_statement: string
  requirements: string[]
  constraints: string[]
  examples: object[]
```

### 2. Coding Agent
```yaml
model: Claude Opus 4.5 / GPT-4o
capabilities:
  - Code generation
  - Algorithm optimization
  - Clean code practices
  - Type safety
  - Documentation

prompt: |
  You are an expert programmer. Given the problem description:
  1. Analyze the problem carefully
  2. Design optimal solution (time/space complexity)
  3. Write clean, efficient code
  4. Include proper documentation and type hints
  5. Handle edge cases appropriately

output:
  code: string
  language: string
  complexity: object
  tests: string[]
```

### 3. Execution Agent
```yaml
model: Claude / GPT-4
mcp_tools:
  - mcp__e2b__run_code

capabilities:
  - Sandbox code execution
  - Error handling
  - Output formatting
  - File generation
  - Result explanation

execution_config:
  timeout: 30  # seconds
  sandbox: E2B

output:
  logs: string[]
  result: any
  files: string[]
  explanation: string
```

---

## Workflow

### Step 1: Input Processing
```yaml
input_types:
  - image: Screenshot, mockup, diagram
  - text: Problem description
  - mixed: Image + text context

preprocessing:
  - Validate input type
  - Prepare for vision agent
  - Set execution context
```

### Step 2: Vision Analysis
```yaml
actions:
  - Send image to Vision Agent
  - Extract structured requirements
  - Validate completeness

fallback:
  if_no_image: Use text directly
  if_unclear: Ask for clarification
```

### Step 3: Code Generation
```yaml
actions:
  - Send requirements to Coding Agent
  - Generate optimized solution
  - Include test cases

validation:
  - Syntax check
  - Logic review
  - Best practices compliance
```

### Step 4: Sandbox Execution
```yaml
actions:
  - Initialize E2B sandbox
  - Execute generated code
  - Capture all outputs

error_handling:
  timeout: "Execution took too long, optimize solution"
  error: "Analyze error and suggest fix"
  success: "Format and explain results"
```

### Step 5: Output Assembly
```yaml
output_format:
  problem_extracted: string
  solution_code: string
  execution_result: object
  generated_files: string[]
  explanation: string
```

---

## Usage

### Command
```bash
/code-team [image_path]
/code-team "[problem description]"
```

### Examples
```bash
# From screenshot
/code-team "C:/screenshots/leetcode-problem.png"

# From text
/code-team "Write a function to find longest palindrome substring"

# Mixed
/code-team "C:/mockups/dashboard.png" "Add dark mode toggle"
```

---

## Integration avec ULTRA-CREATE

```yaml
mcp_integration:
  vision:
    - mcp__figma__view_node (Figma designs)
    - mcp__desktop-automation__screen_capture (screenshots)
    - mcp__playwright__browser_screenshot (web pages)

  execution:
    - mcp__e2b__run_code (Python sandbox)
    - mcp__desktop-commander__start_process (local execution)

  storage:
    - mcp__filesystem__write_file (save code)
    - Hindsight (save patterns)

quality_checks:
  - PM Agent Self-Check after execution
  - Reflection Agent on code quality
  - Error patterns saved to Hindsight
```

---

## Error Handling

```yaml
vision_errors:
  unclear_image: "Request clearer image or add description"
  no_problem_found: "Could not identify coding problem"

coding_errors:
  complex_problem: "Break into smaller steps"
  ambiguous_requirements: "Ask for clarification"

execution_errors:
  timeout: "Optimize algorithm or use smaller input"
  runtime_error: "Analyze, fix, re-execute"
  memory_error: "Reduce data size or optimize memory"
```

---

## Metriques

| Metrique | Cible |
|----------|-------|
| Vision accuracy | > 95% |
| Code correctness | > 90% |
| Execution success | > 85% |
| Total time | < 60s |

---

*Coding Team v1.0 - Multimodal Vision-to-Code Pipeline*
