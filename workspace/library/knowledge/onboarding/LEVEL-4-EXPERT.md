# ULTRA-CREATE Expert Customization

> **Level 4** | For power users | Create and customize system components

---

## Prerequisites

Complete Levels 1-3 first.

---

## Creating Custom Agents

### Agent Definition Structure

```markdown
# Agent Name

> **Category**: meta | core | specialized | ...
> **Version**: 1.0.0
> **Purpose**: Brief description
> **Trigger**: When to activate

---

## Description
Detailed description of agent capabilities.

## Capabilities
- Capability 1
- Capability 2

## MCPs Required
- mcp1
- mcp2

## Workflow
1. Step 1
2. Step 2

## Integration
How this agent works with others.

## Output Format
Expected output structure.
```

### Adding to Registry

Edit `agents/registry.json`:

```json
{
  "id": "my-custom-agent",
  "name": "My Custom Agent",
  "category": "specialized",
  "path": "agents/specialized/my-custom-agent.md",
  "description": "What it does",
  "capabilities": ["cap1", "cap2"],
  "triggers": ["keyword1", "keyword2"],
  "mcps": ["mcp1", "mcp2"],
  "priority": "medium",
  "autoTrigger": {
    "condition": "when_to_auto_activate",
    "integration": "parent-agent"
  }
}
```

---

## Creating Custom Hooks

### Hook Structure

```javascript
#!/usr/bin/env node
/**
 * Hook Name - ULTRA-CREATE v27.18
 * @purpose What this hook does
 * @trigger PreToolUse | PostToolUse | Stop
 * @tools Which tools trigger this
 */

const fs = require('fs');

async function main() {
  let input = '';

  // Read hook input from stdin
  process.stdin.setEncoding('utf8');
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  try {
    const data = JSON.parse(input);

    // Your hook logic here
    const result = processHook(data);

    // Return result
    console.log(JSON.stringify(result));
    process.exit(0);
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }));
    process.exit(1);
  }
}

function processHook(data) {
  // Implement your logic
  return { success: true };
}

main();
```

### Registering Hook

Add to `config/hook-registry.json`:

```json
{
  "id": "my-custom-hook",
  "script": "my-custom-hook.js",
  "priority": 5,
  "description": "What this hook does",
  "depends": [],
  "timeout": 3000,
  "tools": ["Write", "Edit"]
}
```

Then add to `settings.json` hooks section.

---

## Creating Custom Templates

### Template Structure

```
templates/
└── my-template/
    ├── template.json       # Metadata
    ├── README.md           # Documentation
    ├── src/                # Source code
    ├── package.json        # Dependencies
    └── ...
```

### template.json

```json
{
  "id": "my-template",
  "name": "My Custom Template",
  "description": "What this template creates",
  "category": "web",
  "stack": ["next.js-15", "react-19", "typescript-5.7"],
  "features": ["auth", "database", "api"],
  "difficulty": "intermediate",
  "mcps": ["supabase", "github"],
  "agents": ["fullstack-super"],
  "nlTriggers": ["my keyword", "another trigger"]
}
```

### Adding to Manifest

Edit `templates/manifest.json`:

```json
{
  "templates": [
    {
      "id": "my-template",
      "path": "templates/my-template",
      ...
    }
  ]
}
```

---

## Creating Custom Skills

### Skill Definition

Edit `skills/skill-library.json`:

```json
{
  "id": "my-custom-skill",
  "name": "My Custom Skill",
  "description": "What this skill does",
  "verified": true,
  "category": "automation",
  "mcps": ["mcp1"],
  "inputs": {
    "param1": { "type": "string", "required": true }
  },
  "outputs": {
    "result": { "type": "string" }
  },
  "sequence": [
    "step1()",
    "step2()",
    "step3()"
  ],
  "successMetric": "result.length > 0"
}
```

---

## Creating Custom Workflows

### Workflow Structure

```markdown
# Workflow Name

## Phases

### Phase 1: Name
- Step 1
- Step 2

### Phase 2: Name
- Step 3
- Step 4

## Agents Involved
- agent1 (Phase 1)
- agent2 (Phase 2)

## MCPs Required
- mcp1
- mcp2

## Parallel Execution
Phases 1 and 2 can run in parallel: YES/NO
```

Save in `workflows/my-workflow.md`

---

## Extending Knowledge Base

### Adding Knowledge Files

1. Create markdown file in `knowledge/`
2. Add to `knowledge/NAVIGATOR.md` (quick-find)
3. Update `config/knowledge-mapping.json`:

```json
{
  "intents": {
    "my-topic": {
      "files": ["knowledge/my-topic.md"],
      "agents": ["relevant-agent"],
      "keywords": ["keyword1", "keyword2"]
    }
  }
}
```

---

## Custom MCP Integration

### Adding New MCP

1. Install MCP server (npm, uvx, etc.)
2. Add to `.mcp.json`:

```json
{
  "mcpServers": {
    "my-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "my-mcp-server"],
      "env": {
        "API_KEY": "${MY_API_KEY}"
      }
    }
  }
}
```

3. Add permissions to `settings.json`

### MCP in Agents

Reference MCPs in agent definitions:

```json
{
  "mcps": ["my-mcp"]
}
```

---

## Customizing Behavioral Modes

Edit `config/behavioral-modes.json`:

```json
{
  "modes": {
    "my-mode": {
      "description": "Custom mode",
      "maxParallelAgents": 8,
      "validation": {
        "lint": true,
        "typeCheck": true,
        "testCoverage": 50
      },
      "autoActivate": ["agent1", "agent2"],
      "disable": ["slow-agent"]
    }
  }
}
```

---

## Customizing Vibe-Coding

### Adjust Vibe Thresholds

Edit `config/vibe-metrics.json`:

```json
{
  "states": {
    "FLOW": { "minScore": 85 },
    "GOOD": { "minScore": 65 },
    "STRUGGLING": { "minScore": 45 }
  }
}
```

### Add Custom Indicators

```json
{
  "vibeIndicators": {
    "positive": {
      "my_indicator": {
        "threshold": 0.8,
        "weight": 0.10,
        "measurement": "custom_metric >= 0.8"
      }
    }
  }
}
```

---

## Testing Customizations

### Test Agent

```bash
# Read agent file
Read agents/specialized/my-agent.md

# Trigger agent manually
"Activate my-custom-agent for this task"
```

### Test Hook

```bash
# Run hook directly
node scripts/hooks/my-hook.js < test-input.json
```

### Test Template

```bash
/scaffold my-template test-project
```

---

## Debugging

### Enable Debug Mode

```
/wake --expert
```

### View Hook Execution

Check `logs/hooks.log`

### View Agent Selection

```
"Show me which agents are being selected for this task"
```

---

## Best Practices

### Agents

- Keep focused (single responsibility)
- Define clear triggers
- Document integration points
- Test with edge cases

### Hooks

- Fast execution (< 3s timeout)
- Handle errors gracefully
- Log important events
- Don't block critical paths

### Templates

- Production-ready code
- Clear documentation
- Sensible defaults
- Easy customization

### Knowledge

- Keep up-to-date
- Cross-reference related files
- Use consistent formatting
- Include examples

---

## Contributing Back

Share customizations:

1. Fork repository
2. Add your customization
3. Test thoroughly
4. Submit PR with documentation

---

*ULTRA-CREATE v27.18 | Level 4 Expert*
