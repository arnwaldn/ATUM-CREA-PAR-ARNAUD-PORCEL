# ULTRA-CREATE Complete Reference

> **Level 3** | Full system documentation | Reference guide

---

## System Overview

| Component | Count | Location |
|-----------|-------|----------|
| Agents | 148 | `agents/registry.json` |
| Templates | 157 | `templates/manifest.json` |
| Commands | 43 | `commands/dispatcher.md` |
| MCPs | 57 | `.mcp.json` |
| Hooks | 34 | `config/hook-registry.json` |
| Knowledge Files | 96+ | `knowledge/` |
| Memory Banks | 6 | Hindsight |

---

## All Commands (43)

### Core (7)

| Command | Agent | MCPs | Purpose |
|---------|-------|------|---------|
| `/wake` | intent-parser | hindsight, memory | System activation |
| `/create` | wizard-agent | context7, hindsight | New project |
| `/scaffold` | wizard-agent | context7, filesystem | From template |
| `/analyze` | code-reviewer | hindsight | Code analysis |
| `/debug` | debugger | hindsight, context7 | Error fixing |
| `/refactor` | refactoring-expert | context7 | Code improvement |
| `/deploy` | deploy-super | github, supabase | Deployment |

### Development (8)

| Command | Agent | MCPs | Purpose |
|---------|-------|------|---------|
| `/generate` | frontend-developer | context7, shadcn | Code generation |
| `/test` | tester | playwright, e2b | Run tests |
| `/tdd` | tester | e2b | Test-driven dev |
| `/review` | code-reviewer | hindsight | Code review |
| `/review-fix` | code-reviewer | hindsight | Review + auto-fix |
| `/optimize` | performance-optimizer | e2b | Optimization |
| `/migrate` | migration-expert | context7 | Framework migration |
| `/parallel` | queen-v18 | all | Parallel execution |

### Research (7)

| Command | Agent | MCPs | Purpose |
|---------|-------|------|---------|
| `/research` | research-super | exa, firecrawl | Quick research |
| `/deep-research` | research-super | firecrawl, tavily | Deep research |
| `/papers` | arxiv-researcher | arxiv | ArXiv papers |
| `/learn` | learning-agent | hindsight | Learn from source |
| `/learn-pdf` | docling-expert | docling | Analyze PDF |
| `/learn-video` | youtube-expert | youtube | Learn from video |
| `/profile` | github-analyst | github | GitHub analysis |

### Specialized (9)

| Command | Agent | MCPs | Purpose |
|---------|-------|------|---------|
| `/odoo` | odoo-expert | context7 | Odoo development |
| `/odoo-module` | odoo-expert | context7 | New Odoo module |
| `/odoo-migrate` | odoo-migration | context7 | Odoo migration |
| `/odoo-audit` | odoo-expert | context7 | Odoo audit |
| `/mql5` | mql5-expert | - | Trading EAs |
| `/game` | game-architect | - | Game development |
| `/3d` | threejs-expert | blender | 3D development |
| `/email` | email-agent | gmail | Email automation |
| `/browser` | browser-agent | playwright | Browser automation |

### Documentation (4)

| Command | Agent | MCPs | Purpose |
|---------|-------|------|---------|
| `/docs` | documentation-expert | - | Generate docs |
| `/init-docs` | documentation-expert | - | Initialize docs |
| `/code-team` | team-coordinator | - | Team coding |
| `/agency` | agency-orchestrator | - | Multi-agent |

### Advanced (8)

| Command | Agent | MCPs | Purpose |
|---------|-------|------|---------|
| `/turbo` | queen-v18 | all | Maximum speed |
| `/plan` | pm-agent | mermaid | Planning |
| `/workflow` | workflow-generator | - | Custom workflow |
| `/uiux` | ui-critic | figma | UI/UX review |
| `/awake` | intent-parser | all | Force full wake |
| `/super` | fullstack-super | all | Super mode |
| `/autoupgrade` | auto-upgrade-agent | hindsight | Self-improvement |
| `/security-scan` | security-scanner | firecrawl | Security audit |

---

## Agent Categories (32)

### Meta Agents

- intent-parser, pm-agent, confidence-checker
- self-checker, token-optimizer, wizard-agent
- vibe-state-detector, flow-recovery

### Core Agents

- frontend-developer, backend-developer, fullstack-super
- ui-designer, autonomous-executor, tester

### Super Agents

- fullstack-super, backend-super, ui-super
- deploy-super, quality-super, research-super

### Specialized Agents

- payment-expert, accessibility-auditor, seo-expert
- performance-optimizer, security-auditor, debugger

### Game Agents

- game-architect, phaser-expert, threejs-expert
- unity-expert, godot-expert, audio-expert

### AI/ML Agents

- ml-engineer, llm-integration, pytorch-expert
- prompt-engineer, mlops-engineer

### Orchestration

- queen-v18, task-decomposer, priority-queue
- swarm-coordinator, worker-protocol

---

## Template Categories (23)

### Web Applications

- saas, landing, blog, portfolio
- dashboard, admin, api

### E-commerce

- store, marketplace, checkout

### Games

- game-2d, game-3d, multiplayer
- roguelike, puzzle, platformer

### Mobile

- expo, react-native, flutter
- ios-native, android-native

### Desktop

- tauri, electron

### AI/RAG

- rag-chatbot, ai-assistant
- agent-team, multi-agent

---

## Memory Banks

| Bank | ID | Purpose | Auto-Recall |
|------|-----|---------|-------------|
| Patterns | ultra-patterns-memory | Reusable patterns | On similar tasks |
| Errors | ultra-errors-memory | Error solutions | On same error |
| Development | ultra-dev-memory | Project context | On project resume |
| Documents | ultra-documents-memory | PDF analysis | On topic match |
| Research | ultra-research-memory | ArXiv papers | On research tasks |
| Trading | ultra-trading-memory | Trading strategies | On MQL5 tasks |
| Vibe | ultra-vibe-memory | Vibe-coding history | On recovery |

---

## Hook System

### PreToolUse (10 hooks)

1. memory-first-protocol - Recall before action
2. pre-edit-check - Validate edits
3. knowledge-auto-load - Load relevant knowledge
4. mcp-auto-router - Select MCPs
5. agent-auto-router - Select agents
6. workflow-auto-router - Select workflow
7. mode-enforcer - Apply mode constraints
8. innovation-monitor - Detect patterns
9. security-sandbox-gate - Security validation
10. exploit-validator - Command validation

### PostToolUse (12 hooks)

1. activity-tracker - Track metrics
2. post-edit-learn - Learn from edits
3. auto-retain - Save patterns
4. self-healing-hook - Auto-fix
5. context-monitor - Track context
6. anti-hallucination - Fact check
7. auto-sync-hindsight - Sync memory
8. auto-rollback - Rollback on failure
9. auto-upgrade-trigger - Self-improve
10. reputation-tracker - Track agent reputation
11. skill-auto-retain - Save skills
12. outcome-validator - Validate results

---

## Configuration Files

| File | Purpose |
|------|---------|
| `agents/registry.json` | Agent definitions |
| `templates/manifest.json` | Template catalog |
| `config/agent-synergies.json` | Agent combinations |
| `config/mcp-profiles.json` | MCP selections |
| `config/complexity-scoring.json` | Task scoring |
| `config/agent-state-machine.json` | Agent states |
| `config/vibe-metrics.json` | Vibe indicators |
| `config/hook-registry.json` | Hook order |
| `config/hindsight-config.json` | Memory config |

---

## File Locations

```
C:\Claude-Code-Creation\
├── agents/                 # Agent definitions
│   ├── registry.json
│   ├── meta/
│   ├── core/
│   ├── specialized/
│   └── ...
├── templates/              # Project templates
│   └── manifest.json
├── commands/               # Command definitions
│   └── dispatcher.md
├── config/                 # Configuration
├── knowledge/              # Documentation
├── scripts/                # Automation
│   ├── hooks/
│   └── ...
├── skills/                 # Skill definitions
└── .mcp.json               # MCP configuration
```

---

## What's Next?

- **Level 4**: Customize ULTRA-CREATE (create agents, hooks, templates)

---

*ULTRA-CREATE v27.18 | Level 3 Reference*
