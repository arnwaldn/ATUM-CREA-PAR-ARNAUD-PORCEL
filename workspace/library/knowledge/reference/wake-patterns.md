# Wake-Windows Patterns - Terminal History for ULTRA-CREATE

> **Version**: v29.4 WAKE INTEGRATION
> **Purpose**: Capture and recall terminal history to complement Hindsight semantic memory

## Overview

Wake-Windows is a Windows-native terminal history system that captures PowerShell commands and outputs, making them available to Claude Code via MCP.

### Complementarity with Hindsight

| Aspect | wake-windows | Hindsight |
|--------|--------------|-----------|
| **Focus** | Terminal activity (commands, outputs) | Semantic memory (patterns, learnings) |
| **Captures** | What you DID | What you LEARNED |
| **Storage** | SQLite (~/.wake-windows/) | Vector DB |
| **Retention** | 21 days | Permanent |
| **Search** | Exact match, keyword | Semantic similarity |

**Philosophy**: "Wake captures what you did, Hindsight retains what you learned."

## MCP Tools

### terminal_history
Get recent terminal commands.

```javascript
// Get last 20 commands
wake_mcp.terminal_history({ limit: 20 })

// Get commands with output
wake_mcp.terminal_history({ limit: 10, include_output: true })

// Get commands from specific session
wake_mcp.terminal_history({ session_id: 123 })
```

### terminal_search
Search commands by pattern.

```javascript
// Find npm commands
wake_mcp.terminal_search({ pattern: "npm" })

// Find git commits
wake_mcp.terminal_search({ pattern: "git commit" })

// Find errors
wake_mcp.terminal_search({ pattern: "error", limit: 50 })
```

### terminal_context
Get current terminal context for smart suggestions.

```javascript
// Returns: cwd, shell, recent commands, recent errors
wake_mcp.terminal_context()
```

### terminal_stats
Get usage statistics.

```javascript
// Returns: total commands, today's count, failure rate
wake_mcp.terminal_stats()
```

### terminal_output
Get output of a specific command.

```javascript
// Get output by command ID
wake_mcp.terminal_output({ command_id: 456 })
```

### terminal_record
Record a command (for PowerShell hook integration).

```javascript
wake_mcp.terminal_record({
  command: "npm run build",
  cwd: "C:/Projects/myapp",
  exit_code: 0,
  output: "Build successful",
  duration_ms: 5432
})
```

### terminal_import
Import existing PowerShell history.

```javascript
// Import from PSReadLine history file
wake_mcp.terminal_import()
```

### terminal_prune
Clean up old entries.

```javascript
// Preview what would be deleted
wake_mcp.terminal_prune({ dry_run: true })

// Actually delete old entries
wake_mcp.terminal_prune({ dry_run: false })
```

## Triggers (FR/EN)

### French Triggers
- "historique terminal"
- "qu'ai-je fait"
- "commandes recentes"
- "derniere commande"
- "avant cette session"

### English Triggers
- "terminal history"
- "what did I do"
- "recent commands"
- "last command"
- "before this session"

## PowerShell Integration

### Installation

Add to your PowerShell profile:

```powershell
# Open profile
notepad $PROFILE

# Add this line:
. "C:\Claude-Code-Creation\scripts\hooks\wake-windows-hook.ps1"
```

Or run:

```powershell
Add-Content $PROFILE '. "C:\Claude-Code-Creation\scripts\hooks\wake-windows-hook.ps1"'
```

### Manual Control

```powershell
# Enable/disable capture
Enable-WakeWindows
Disable-WakeWindows

# Check status
Get-WakeWindowsStatus
```

## Database Schema

```sql
-- Sessions table
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY,
  started_at TEXT,
  ended_at TEXT,
  shell TEXT DEFAULT 'powershell',
  cwd TEXT,
  hostname TEXT,
  username TEXT
);

-- Commands table
CREATE TABLE commands (
  id INTEGER PRIMARY KEY,
  session_id INTEGER,
  command TEXT NOT NULL,
  cwd TEXT,
  started_at TEXT,
  ended_at TEXT,
  exit_code INTEGER,
  output TEXT,
  duration_ms INTEGER
);
```

## Configuration

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `WAKE_DB_DIR` | ~/.wake-windows | Database directory |
| `WAKE_DB_PATH` | ~/.wake-windows/history.db | Database file |
| `WAKE_RETENTION_DAYS` | 21 | Days to keep history |
| `WAKE_MAX_OUTPUT_MB` | 5 | Max output size per command |

## Use Cases

### 1. Debug Context
When debugging an issue, recall what commands were run:

```
User: "What did I run before this error?"
Claude: Uses terminal_context to show recent commands and errors
```

### 2. Reproduce Steps
Recall exact commands for documentation:

```
User: "How did I set up the database?"
Claude: Uses terminal_search({ pattern: "database" })
```

### 3. Error Analysis
Find commands that failed:

```
User: "Show me recent failures"
Claude: Uses terminal_history with exit_code filter
```

### 4. Session Continuity
Resume work across Claude sessions:

```
User: "Continue where I left off"
Claude: Uses terminal_context for recent activity
```

## Integration with ULTRA-CREATE

### Autonomous Routing

The `mcp-auto-router.js` hook automatically routes to wake-mcp when terminal-related keywords are detected:

```javascript
terminalHistory: {
  mcps: ['wake-mcp'],
  triggers: [
    'historique terminal', 'terminal history',
    'qu\'ai fait', 'what did I do',
    'commandes recentes', 'recent commands'
  ]
}
```

### Context Loader

The `smart-context-loader.js` checks Wake availability and injects context:

```javascript
// If Wake available and terminal intent detected:
[WAKE] Terminal history available via wake-mcp
```

### Autonomy Tiers

Wake operations are in Tier 0 (auto-approve):
- `wake_terminal_history`
- `wake_terminal_search`
- `wake_terminal_context`
- `wake_terminal_stats`

## Troubleshooting

### MCP Not Responding

```bash
# Test the server
node C:/Claude-Code-Creation/scripts/engines/wake-windows-mcp/index.js --test
```

### Database Issues

```powershell
# Check database location
ls ~/.wake-windows/

# View database stats
sqlite3 ~/.wake-windows/history.db "SELECT COUNT(*) FROM commands;"
```

### PowerShell Hook Not Working

```powershell
# Verify hook is loaded
Get-WakeWindowsStatus

# Check if prompt function is set
$function:prompt
```

## Version History

- **v1.0.0** (2026-01-26): Initial Windows-native implementation
  - MCP server with 8 tools
  - PowerShell hook for command capture
  - SQLite storage with 21-day retention
  - Full compatibility with wake-mcp API
