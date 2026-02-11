type MessageType = 'combat' | 'item' | 'info'

interface LogEntry {
  message: string
  type: MessageType
  timestamp: number
}

export class GameLog {
  private container: HTMLElement
  private entries: LogEntry[] = []
  private maxEntries = 100

  constructor(container: HTMLElement) {
    this.container = container
  }

  add(message: string, type: MessageType = 'info'): void {
    const entry: LogEntry = {
      message,
      type,
      timestamp: Date.now()
    }

    this.entries.push(entry)

    if (this.entries.length > this.maxEntries) {
      this.entries.shift()
    }

    this.render()
  }

  private render(): void {
    // Show last 5 messages
    const recent = this.entries.slice(-5)
    this.container.innerHTML = recent
      .map(entry => `<div class="${entry.type}">${entry.message}</div>`)
      .join('')

    // Scroll to bottom
    this.container.scrollTop = this.container.scrollHeight
  }

  clear(): void {
    this.entries = []
    this.container.innerHTML = ''
  }

  getEntries(): LogEntry[] {
    return [...this.entries]
  }
}
