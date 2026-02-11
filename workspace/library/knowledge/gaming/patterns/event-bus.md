# Event Bus Pattern

## Purpose
Decouple game systems through publish/subscribe messaging.

## Implementation

```typescript
type EventCallback = (...args: any[]) => void

class EventBus {
  private events = new Map<string, Set<EventCallback>>()

  on(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event)!.add(callback)

    // Return unsubscribe function
    return () => this.off(event, callback)
  }

  off(event: string, callback: EventCallback) {
    this.events.get(event)?.delete(callback)
  }

  emit(event: string, ...args: any[]) {
    this.events.get(event)?.forEach(cb => cb(...args))
  }

  once(event: string, callback: EventCallback) {
    const wrapper = (...args: any[]) => {
      callback(...args)
      this.off(event, wrapper)
    }
    this.on(event, wrapper)
  }
}

// Global instance
export const events = new EventBus()
```

## Game Events

```typescript
// Common game events
events.emit('player:damage', { amount: 10, source: 'enemy' })
events.emit('score:update', 1000)
events.emit('level:complete', { time: 45.2 })
events.emit('item:pickup', { type: 'coin', value: 10 })
events.emit('enemy:death', { enemy, position })

// Listening
events.on('player:damage', ({ amount }) => {
  this.health -= amount
  this.flashRed()
})
```

## Benefits
- Systems don't need references to each other
- Easy to add new listeners
- Good for achievements, analytics, sound triggers
