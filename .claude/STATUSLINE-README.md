# ATUM CREA Status Line Configuration

## Overview
The Claude Code status line has been configured to display ATUM CREA workflow context at the bottom of your terminal.

## Display Format
```
[Model] Phase | Directory | Context% | Cost | Time
```

Example:
```
[Opus] CONSTRUIRE | my-app | 45% | $1.23 | 14:30
```

## Phase Indicators
The status line automatically shows your current ATUM CREA cycle phase based on context usage:

| Context Usage | Phase         | Meaning |
|--------------|---------------|---------|
| 0-19%        | RECHERCHER    | Research phase - searching memory, docs, codebase |
| 20-39%       | PLANIFIER     | Planning phase - creating todos, architecture |
| 40-59%       | CONSTRUIRE    | Building phase - active development |
| 60-79%       | VERIFIER      | Verification phase - testing, reviews, quality gates |
| 80-100%      | MEMORISER     | Memorization phase - saving patterns, near context limit |

## What's Displayed

- **[Model]**: Current Claude model (Opus, Sonnet, Haiku)
- **Phase**: Current ATUM CREA cycle phase
- **Directory**: Current project directory name
- **Branch**: Git branch name (if in a git repository)
- **Context%**: Percentage of context window used
- **Cost**: Session cost in USD
- **Time**: Current time (HH:MM format)

## Files Created

1. **C:\Users\arnau\.claude\statusline.js** - Node.js script that generates the status line
2. **C:\Users\arnau\.claude\settings.json** - Updated with statusLine configuration

## Configuration Location

The statusLine configuration in `settings.json`:
```json
"statusLine": {
  "type": "command",
  "command": "node \"C:\\Users\\arnau\\.claude\\statusline.js\"",
  "padding": 0
}
```

## When It Updates

The status line refreshes automatically:
- After each assistant message
- When permission mode changes
- When vim mode toggles
- Updates are debounced at 300ms

## Customization

To modify the display, edit `C:\Users\arnau\.claude\statusline.js`:

- Change phase thresholds (lines 20-22)
- Modify output format (line 37)
- Add/remove displayed fields
- Change time format (line 34)

## Disabling

To disable the status line:
1. Remove the `statusLine` section from `settings.json`, OR
2. Run `/statusline` and ask Claude to remove it

## Troubleshooting

If the status line doesn't appear:
- Restart Claude Code
- Check that Node.js is installed: `node --version`
- Verify the script exists: `dir C:\Users\arnau\.claude\statusline.js`
- Check for errors in the script output

## References

- [Official Claude Code Status Line Documentation](https://code.claude.com/docs/en/statusline)
- ATUM CREA workflow: `C:\Users\arnau\.claude\CLAUDE.md`
