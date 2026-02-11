---
name: interview
description: Interview the user to build a complete spec before implementing a complex feature or project. Use for any non-trivial project creation.
disable-model-invocation: true
---

# Interview Mode - Build Complete Specs Before Coding

Interview the user about: $ARGUMENTS

## Process

1. **Understand the core request** - What is the user trying to build?

2. **Ask targeted questions using AskUserQuestion** - Cover these areas:
   - **Functional scope**: What are the must-have features vs nice-to-have?
   - **Target users**: Who will use this? Technical level? Device preferences?
   - **UI/UX preferences**: Design style? Color scheme? Reference sites?
   - **Technical constraints**: Existing codebase? Required integrations? Hosting preference?
   - **Data model**: What entities? What relationships? What scale?
   - **Authentication**: Who can access what? Roles? Permissions?
   - **Edge cases**: What happens when things fail? Offline support? Rate limits?
   - **Performance**: Expected traffic? Response time requirements? SEO needs?
   - **Budget/Services**: Paid APIs acceptable? Which cloud services?

3. **Do NOT ask obvious questions** - Skip anything inferable from the project type

4. **Keep interviewing** until all hard decisions are covered

5. **Write the complete spec** to `SPEC.md` in the project root:
   ```markdown
   # Project Spec: [Name]

   ## Overview
   [1-2 sentence summary]

   ## Features
   ### Must-have
   - [ ] Feature 1
   ### Nice-to-have
   - [ ] Feature 2

   ## Technical Stack
   [Stack chosen based on project-routing skill]

   ## Data Model
   [Entities, relationships, key fields]

   ## Pages / Screens
   [List with descriptions]

   ## API Endpoints
   [If applicable]

   ## Authentication & Authorization
   [Auth flow, roles, permissions]

   ## Design Direction
   [Style, colors, typography, references]

   ## Edge Cases & Error Handling
   [Key scenarios]

   ## Deployment
   [Hosting, CI/CD, environment setup]
   ```

6. **Present the spec** to the user for approval before any implementation begins
