# ULTRA-CREATE Intermediate Guide (30 minutes)

> **Level 2** | For users comfortable with basics | Read time: 30 minutes

---

## Prerequisites

Complete Level 1 Quickstart first.

---

## Expanded Command Set (15 Commands)

### Development Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `/create [desc]` | New project | `/create a blog with auth` |
| `/scaffold [template]` | From template | `/scaffold saas my-app` |
| `/generate [type]` | Generate code | `/generate component UserCard` |
| `/refactor [target]` | Improve code | `/refactor this function` |

### Quality Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `/debug [error]` | Fix errors | `/debug TypeError...` |
| `/test` | Run tests | `/test` |
| `/review` | Code review | `/review src/` |
| `/analyze [path]` | Analyze code | `/analyze ./` |

### Research Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `/research [topic]` | Quick research | `/research OAuth 2.0` |
| `/deep-research [topic]` | Thorough research | `/deep-research microservices` |
| `/papers [topic]` | ArXiv papers | `/papers transformer attention` |

### Deployment Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `/deploy` | Deploy to prod | `/deploy` |
| `/docs` | Generate docs | `/docs` |

### System Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `/wake` | Full activation | `/wake` |
| `/wake --quick` | Minimal load | `/wake --quick` |

---

## Understanding Templates

### Available Template Categories

| Category | Templates | Use Case |
|----------|-----------|----------|
| Web | SaaS, Landing, Blog | Business websites |
| E-commerce | Store, Marketplace | Online sales |
| Games | 2D, 3D, Multiplayer | Entertainment |
| Mobile | Expo, Native | Phone apps |
| Desktop | Tauri, Electron | Desktop apps |
| API | REST, GraphQL | Backend services |

### Using Templates

```
/scaffold saas my-startup
/scaffold game-2d space-shooter
/scaffold mobile fitness-app
```

### Template Features

Every template includes:
- Production-ready structure
- Auth configuration
- Database setup
- Deployment config
- Testing setup

---

## Memory System

### How Memory Works

ULTRA-CREATE has 6 memory banks:

| Bank | Contents | Auto-Recall |
|------|----------|-------------|
| `patterns` | Reusable code patterns | On similar tasks |
| `errors` | Fixed errors + solutions | On same error |
| `development` | Project learnings | On project resume |
| `documents` | Analyzed PDFs | On mention |
| `research` | ArXiv papers | On topic match |
| `trading` | Trading strategies | On MQL5 tasks |

### Manual Memory Operations

```javascript
// Recall manually
hindsight_recall({bank: 'patterns', query: 'auth implementation', top_k: 5})

// Save manually
hindsight_retain({bank: 'patterns', content: 'Pattern description here'})
```

---

## MCP (Model Context Protocol)

### What Are MCPs?

MCPs are specialized tools Claude can use. Think of them as plugins.

### Essential MCPs

| MCP | Purpose | When Used |
|-----|---------|-----------|
| `context7` | Framework documentation | Any framework code |
| `shadcn` | UI components | Frontend development |
| `supabase` | Database + Auth | Backend development |
| `hindsight` | Memory system | Always |
| `github` | Repository operations | Version control |
| `playwright` | Browser automation | Testing, scraping |

### MCPs Load Automatically

Based on your task, ULTRA-CREATE loads the right MCPs. You don't need to specify them.

---

## Agents

### What Are Agents?

Agents are specialized personas Claude adopts for specific tasks.

### Key Agents

| Agent | Specialty | Auto-Trigger |
|-------|-----------|--------------|
| `frontend-developer` | React, UI | Frontend tasks |
| `backend-developer` | APIs, DB | Backend tasks |
| `fullstack-super` | Everything | Complex projects |
| `debugger` | Error fixing | Debug commands |
| `security-auditor` | Security | Security scans |
| `game-architect` | Games | Game development |

### Agent Synergies

For complex tasks, multiple agents work together:

```
SaaS Project:
wizard-agent → pm-agent → fullstack-super → payment-expert
```

---

## Behavioral Modes

### Available Modes

| Mode | Agents | Validation | Use Case |
|------|--------|------------|----------|
| Standard | 10 | Lint + Types | Daily work |
| Speed | 25 | None | Prototypes |
| Quality | 5 | 80% coverage | Production |
| Architect | 3 | Design only | Planning |

### Changing Modes

```
"Switch to quality mode"
"Use speed mode for this prototype"
```

---

## Project Patterns

### Starting a Project

```
1. Describe your project naturally
2. ULTRA-CREATE asks clarifying questions if needed
3. Receives confirmation on tech stack
4. Generates complete project
5. Provides run instructions
```

### Resuming a Project

```
1. Navigate to project directory
2. Say "Resume work on this project"
3. ULTRA-CREATE recalls project context from memory
4. Continue where you left off
```

### Adding Features

```
"Add user authentication to this project"
"Implement a shopping cart"
"Add real-time notifications"
```

---

## Debugging Workflow

### Automatic Debug

```
1. Paste error message
2. ULTRA-CREATE recalls similar errors from memory
3. Checks Context7 for framework-specific solutions
4. Proposes and implements fix
5. Saves solution to memory for future
```

### Manual Debug

```
/debug --verbose  # More detailed output
/debug --trace    # Full stack trace analysis
```

---

## Best Practices

### DO

- Be specific about requirements
- Mention tech preferences if any
- Provide context for existing projects
- Let Claude ask questions

### DON'T

- Assume Claude knows your project
- Skip error messages (paste full text)
- Interrupt multi-step processes
- Forget to test generated code

---

## Common Scenarios

### "I need a landing page"

```
Create a landing page for a fitness app with:
- Hero section with CTA
- Features grid
- Pricing table
- Contact form
```

### "My API is slow"

```
Analyze and optimize the performance of my API routes
```

### "Add Stripe payments"

```
Add Stripe subscription payments to this SaaS
```

---

## What's Next?

- **Level 3**: Full reference (all 43 commands, 148 agents, 157 templates)
- **Level 4**: Customize ULTRA-CREATE (hooks, agents, templates)

---

*ULTRA-CREATE v27.18 | Level 2 Intermediate*
