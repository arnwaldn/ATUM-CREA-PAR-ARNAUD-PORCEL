# Command Pattern

## Purpose
Encapsulate actions as objects for undo/redo, replays, and input buffering.

## Implementation

```typescript
interface Command {
  execute(): void
  undo(): void
}

class MoveCommand implements Command {
  constructor(
    private entity: Entity,
    private dx: number,
    private dy: number
  ) {}

  execute() {
    this.entity.x += this.dx
    this.entity.y += this.dy
  }

  undo() {
    this.entity.x -= this.dx
    this.entity.y -= this.dy
  }
}

class CommandHistory {
  private history: Command[] = []
  private index = -1

  execute(command: Command) {
    // Remove any undone commands
    this.history = this.history.slice(0, this.index + 1)

    command.execute()
    this.history.push(command)
    this.index++
  }

  undo() {
    if (this.index >= 0) {
      this.history[this.index].undo()
      this.index--
    }
  }

  redo() {
    if (this.index < this.history.length - 1) {
      this.index++
      this.history[this.index].execute()
    }
  }
}
```

## Use Cases

### Input Buffering
```typescript
class InputBuffer {
  private buffer: Command[] = []
  private bufferTime = 150 // ms

  add(command: Command) {
    this.buffer.push(command)
    setTimeout(() => {
      const idx = this.buffer.indexOf(command)
      if (idx !== -1) this.buffer.splice(idx, 1)
    }, this.bufferTime)
  }

  consume(): Command | undefined {
    return this.buffer.shift()
  }
}
```

### Replay System
```typescript
class ReplayRecorder {
  private commands: { frame: number; command: Command }[] = []

  record(frame: number, command: Command) {
    this.commands.push({ frame, command })
  }

  replay(onFrame: (frame: number) => void) {
    this.commands.forEach(({ frame, command }) => {
      onFrame(frame)
      command.execute()
    })
  }
}
```
