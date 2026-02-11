# Rule: Memory Protocol (Hindsight)

## BEFORE Starting Work
ALWAYS recall relevant memories:
```
hindsight_recall({bank: 'errors', query: '<current problem domain>'})
hindsight_recall({bank: 'patterns', query: '<current tech stack>'})
hindsight_recall({bank: 'development', query: '<project type>'})
```

Use `layer: 1` for summaries (saves tokens), `layer: 3` for full details when needed.

## AFTER Solving a Problem
ALWAYS retain the solution:
```
hindsight_retain({bank: 'errors', content: 'Problem: ... Solution: ... Context: ...'})
```

## AFTER Discovering a Pattern
ALWAYS retain the pattern:
```
hindsight_retain({bank: 'patterns', content: 'Pattern: ... When to use: ... Example: ...'})
```

## AFTER Project Completion
Retain project learnings:
```
hindsight_retain({bank: 'development', content: 'Project: ... Stack: ... Key decisions: ... Lessons: ...'})
```

## Periodically: Reflect on Accumulated Knowledge
Use `hindsight_reflect` to discover trends across sessions:
```
hindsight_reflect({bank: 'errors', query: 'common error patterns in Next.js'})
```

## Memory Banks Reference (Complete List)
- `errors` - Bugs, errors, and their solutions
- `patterns` - Reusable code patterns and architecture decisions
- `development` - Project-level learnings and stack choices
- `projects` - Active project context and status
- `skills` - Learned capabilities and techniques
- `experiences` - General development experiences
- `user_preferences` - User's coding style and preferences
- `world_facts` - General knowledge and facts
- `trading` - Trading strategies and market patterns
