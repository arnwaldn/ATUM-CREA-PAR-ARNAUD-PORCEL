# /analyze - Codebase Analysis with code2prompt

## USAGE
```
/analyze [path] [options]
```

## DESCRIPTION
Analyze a codebase directory and generate LLM-friendly context using code2prompt.
Useful for understanding project structure, estimating token usage, and preparing context for coding tasks.

## OPTIONS
| Option | Description |
|--------|-------------|
| path | Directory to analyze (default: current directory) |
| --depth N | Tree depth level: 1=minimal, 2=standard, 3=deep (default: 2) |
| --focus GLOB | Focus on specific files (e.g., "src/**/*.ts", "*.py") |
| --save | Save analysis to Hindsight for future sessions |
| --tokens | Show detailed token estimation |
| --tree-only | Only show directory tree, no file contents |

## WORKFLOW

### 1. Analyze Codebase
```javascript
// Use code2prompt MCP
code2prompt_analyze({
  path: targetPath,
  extensions: focusExtensions || [],
  maxFiles: depth === 1 ? 50 : depth === 2 ? 100 : 200,
  includeContent: !treeOnly
})
```

### 2. Generate Report
Output format:
```
PROJECT ANALYSIS
================
Path: /absolute/path/to/project
Type: Node.js / Python / Rust / etc.

STRUCTURE
---------
[Directory tree]

STATISTICS
----------
Total Files: N
Token Estimate: ~N tokens

BY EXTENSION
------------
.ts: N files
.js: N files
...

KEY FILES
---------
- package.json
- README.md
- tsconfig.json
...
```

### 3. Optional: Save to Hindsight
If --save flag:
```javascript
hindsight_retain({
  bank: 'patterns',
  content: `PROJECT CONTEXT: ${projectPath}
Type: ${projectType}
Structure: ${treeSummary}
Key files: ${keyFiles.join(', ')}
Last analyzed: ${timestamp}`
})
```

## EXAMPLES

### Basic analysis
```
/analyze
```
Analyzes current directory with default settings.

### Analyze specific path
```
/analyze C:/Projects/my-app
```

### Focus on TypeScript files
```
/analyze --focus "*.ts,*.tsx"
```

### Deep analysis with save
```
/analyze --depth 3 --save
```
Full analysis saved to Hindsight for cross-session recall.

### Quick tree view
```
/analyze --tree-only
```
Just the directory structure, no file contents.

## OUTPUT STORAGE

Analysis is automatically saved to:
- `~/.ultra-state/codebase-context.json` (temporary, current session)
- Hindsight `patterns` bank (if --save flag used, persistent)

## INTEGRATION

This command integrates with:
- **code2prompt MCP**: For codebase analysis
- **Hindsight**: For persistent storage (--save)
- **consciousness-loader**: Loads saved context on /wake

## RELATED COMMANDS
- `/wake` - Load consciousness including codebase context
- `/create` - Create new project (uses /analyze internally)
- `/debug` - Debug issues (can use /analyze for context)
