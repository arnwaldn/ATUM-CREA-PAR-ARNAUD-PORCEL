# Stream Wrapping Patterns - ULTRA-CREATE v27.9

> **Source**: Analyse du repository [github.com/stripe/ai](https://github.com/stripe/ai)
> **Pattern**: Non-intrusive stream middleware
> **Version**: 27.9 "STRIPE INTEGRATION"

---

## Table des Matieres

1. [Concept](#concept)
2. [Stream.tee() Pattern](#streamtee-pattern)
3. [Fire-and-Forget Async](#fire-and-forget-async)
4. [Implementation TypeScript](#implementation-typescript)
5. [Implementation Python](#implementation-python)
6. [Use Cases](#use-cases)
7. [Integration ULTRA-CREATE](#integration-ultra-create)
8. [Best Practices](#best-practices)

---

## Concept

Le **Stream Wrapping Pattern** permet d'observer et de traiter un stream sans le consommer ni le modifier. C'est essentiel pour:

- **Logging** sans impacter la performance
- **Metering** (comptage tokens) transparent
- **Analytics** en temps reel
- **Middleware** non-intrusif

### Principe Cle

```
Original Stream ──┬──> Consumer (unchanged)
                  │
                  └──> Observer (peek only)
```

---

## Stream.tee() Pattern

### Concept Web Streams API

`stream.tee()` divise un ReadableStream en deux streams identiques:

```typescript
const [stream1, stream2] = originalStream.tee();
// stream1: Pour observation (logging, metering)
// stream2: Retourne au consumer (inchange)
```

### Avantages

1. **Non-destructif** - Le stream original n'est pas consomme
2. **Synchrone** - Pas de latence ajoutee
3. **Memory efficient** - Pas de buffering complet
4. **Transparent** - Consumer ne voit aucune difference

---

## Fire-and-Forget Async

### Pattern

Le traitement du stream observe se fait de maniere asynchrone sans bloquer le flux principal.

```typescript
function wrapStream<T>(stream: ReadableStream<T>): ReadableStream<T> {
  const [peekStream, returnStream] = stream.tee();

  // Fire-and-forget: ne pas await
  processAsync(peekStream).catch(console.error);

  return returnStream; // Retour immediat
}

async function processAsync<T>(stream: ReadableStream<T>): Promise<void> {
  const reader = stream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Traitement asynchrone (logging, metering, etc.)
      await logChunk(value);
    }
  } finally {
    reader.releaseLock();
  }
}
```

---

## Implementation TypeScript

### Stream Wrapper Generique

```typescript
type StreamProcessor<T> = (chunk: T) => void | Promise<void>;

class StreamWrapper<T> {
  private processors: StreamProcessor<T>[] = [];

  /**
   * Ajoute un processeur qui sera appele pour chaque chunk
   */
  addProcessor(processor: StreamProcessor<T>): this {
    this.processors.push(processor);
    return this;
  }

  /**
   * Wrap le stream avec observation non-intrusive
   */
  wrap(stream: ReadableStream<T>): ReadableStream<T> {
    const [peekStream, returnStream] = stream.tee();

    // Lancer le traitement en arriere-plan
    this.processStream(peekStream);

    return returnStream;
  }

  private async processStream(stream: ReadableStream<T>): Promise<void> {
    const reader = stream.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Appeler tous les processeurs en parallele
        await Promise.allSettled(
          this.processors.map(p => p(value))
        );
      }
    } catch (error) {
      console.error('Stream processing error:', error);
    } finally {
      reader.releaseLock();
    }
  }
}

// Usage
const wrapper = new StreamWrapper<Uint8Array>()
  .addProcessor(chunk => console.log('Chunk size:', chunk.length))
  .addProcessor(async chunk => await logToDatabase(chunk));

const wrappedStream = wrapper.wrap(originalStream);
```

### OpenAI Stream Wrapper (Stripe Pattern)

```typescript
import OpenAI from 'openai';

interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

function wrapOpenAIStream(
  stream: AsyncIterable<OpenAI.Chat.ChatCompletionChunk>,
  onComplete: (usage: TokenUsage) => void
): AsyncIterable<OpenAI.Chat.ChatCompletionChunk> {
  let completionTokens = 0;

  return {
    async *[Symbol.asyncIterator]() {
      for await (const chunk of stream) {
        // Compter les tokens (approximation)
        if (chunk.choices[0]?.delta?.content) {
          completionTokens += estimateTokens(chunk.choices[0].delta.content);
        }

        yield chunk; // Retourner chunk inchange
      }

      // Fire-and-forget: appeler callback apres completion
      Promise.resolve().then(() => {
        onComplete({
          promptTokens: 0, // Non disponible dans stream
          completionTokens,
          totalTokens: completionTokens
        });
      });
    }
  };
}

function estimateTokens(text: string): number {
  // Approximation: ~4 chars = 1 token
  return Math.ceil(text.length / 4);
}
```

### Anthropic Stream Wrapper

```typescript
import Anthropic from '@anthropic-ai/sdk';

function wrapAnthropicStream(
  stream: AsyncIterable<Anthropic.MessageStreamEvent>,
  onUsage: (inputTokens: number, outputTokens: number) => void
): AsyncIterable<Anthropic.MessageStreamEvent> {
  let inputTokens = 0;
  let outputTokens = 0;

  return {
    async *[Symbol.asyncIterator]() {
      for await (const event of stream) {
        // Capturer les infos de usage
        if (event.type === 'message_start') {
          inputTokens = event.message.usage.input_tokens;
        }
        if (event.type === 'message_delta') {
          outputTokens = event.usage.output_tokens;
        }

        yield event; // Passer l'event inchange
      }

      // Fire-and-forget callback
      Promise.resolve().then(() => onUsage(inputTokens, outputTokens));
    }
  };
}
```

---

## Implementation Python

### AsyncGenerator Wrapper

```python
from typing import AsyncIterator, TypeVar, Callable, Awaitable
import asyncio

T = TypeVar('T')

async def wrap_async_iterator(
    iterator: AsyncIterator[T],
    on_chunk: Callable[[T], Awaitable[None]],
    on_complete: Callable[[], Awaitable[None]] = None
) -> AsyncIterator[T]:
    """
    Wrap un async iterator avec observation non-intrusive.

    Args:
        iterator: L'iterateur original
        on_chunk: Callback appele pour chaque chunk (fire-and-forget)
        on_complete: Callback appele a la fin (optionnel)
    """
    try:
        async for chunk in iterator:
            # Fire-and-forget: lancer sans await
            asyncio.create_task(on_chunk(chunk))
            yield chunk  # Retourner chunk inchange
    finally:
        if on_complete:
            asyncio.create_task(on_complete())


# Usage avec OpenAI
from openai import AsyncOpenAI

client = AsyncOpenAI()

async def log_chunk(chunk):
    """Logging asynchrone non-bloquant."""
    if chunk.choices[0].delta.content:
        print(f"Token: {chunk.choices[0].delta.content}", end="", flush=True)

async def main():
    stream = await client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[{"role": "user", "content": "Hello!"}],
        stream=True
    )

    wrapped = wrap_async_iterator(
        stream,
        on_chunk=log_chunk,
        on_complete=lambda: print("\n[Stream complete]")
    )

    # Consumer utilise le stream normalement
    async for chunk in wrapped:
        # Traitement normal
        pass
```

### Context Manager Pattern

```python
from contextlib import asynccontextmanager
from typing import AsyncIterator

@asynccontextmanager
async def observed_stream(
    stream: AsyncIterator,
    observer: Callable
):
    """
    Context manager pour stream observe.
    """
    async def observed():
        async for chunk in stream:
            # Observer (fire-and-forget)
            asyncio.create_task(observer(chunk))
            yield chunk

    try:
        yield observed()
    finally:
        # Cleanup si necessaire
        pass


# Usage
async with observed_stream(api_stream, log_chunk) as stream:
    async for chunk in stream:
        process(chunk)
```

---

## Use Cases

### 1. Token Metering (Billing)

```typescript
const meteringWrapper = new StreamWrapper<ChatCompletionChunk>()
  .addProcessor(async (chunk) => {
    const tokens = countTokens(chunk);
    await stripeClient.billing.meterEvents.create({
      event_name: 'llm_tokens',
      payload: { tokens },
      customer_id: customerId
    });
  });
```

### 2. Real-time Analytics

```typescript
const analyticsWrapper = new StreamWrapper<MessageStreamEvent>()
  .addProcessor((event) => {
    analytics.track('llm_stream_event', {
      type: event.type,
      timestamp: Date.now()
    });
  });
```

### 3. Response Logging

```typescript
const loggingWrapper = new StreamWrapper<ChatCompletionChunk>()
  .addProcessor(async (chunk) => {
    await db.insert('stream_logs', {
      chunk_id: chunk.id,
      content: chunk.choices[0]?.delta?.content,
      timestamp: new Date()
    });
  });
```

### 4. Progress Tracking

```typescript
let totalChunks = 0;

const progressWrapper = new StreamWrapper<any>()
  .addProcessor(() => {
    totalChunks++;
    emitProgress({ chunks: totalChunks });
  });
```

---

## Integration ULTRA-CREATE

### Hook PostToolUse avec Stream Wrapping

```javascript
// scripts/hooks/stream-observer.js

const StreamWrapper = require('./lib/stream-wrapper');

/**
 * Hook pour observer les streams LLM sans les modifier
 */
async function observeStream(stream, context) {
  const wrapper = new StreamWrapper()
    .addProcessor(async (chunk) => {
      // Log dans Hindsight
      await hindsightRetain({
        bank: 'patterns',
        content: `LLM response chunk: ${JSON.stringify(chunk)}`
      });
    })
    .addProcessor((chunk) => {
      // Metriques temps reel
      updateMetrics({ chunksProcessed: 1 });
    });

  return wrapper.wrap(stream);
}

module.exports = { observeStream };
```

### Integration avec Existing Hooks

```javascript
// Modification de post-edit-learn.js

const { observeStream } = require('./stream-observer');

// Si la reponse est un stream, l'observer
if (response instanceof ReadableStream) {
  response = observeStream(response, { source: 'edit' });
}
```

---

## Best Practices

### DO (Faire)

1. **Toujours utiliser tee()** - Ne jamais consommer le stream original
2. **Fire-and-forget** - Ne pas await les operations d'observation
3. **Error handling** - Capturer les erreurs sans affecter le stream principal
4. **Memory** - Ne pas stocker tous les chunks en memoire
5. **Timeout** - Implementer des timeouts pour les observers lents

### DON'T (Ne pas faire)

1. **Bloquer le stream** - Ne jamais await dans le chemin critique
2. **Modifier les chunks** - Observer seulement, ne pas transformer
3. **Buffer complet** - Ne pas accumuler tout le stream
4. **Ignorer les erreurs** - Toujours catch les erreurs des observers

### Error Handling Pattern

```typescript
function safeProcessor<T>(
  processor: StreamProcessor<T>
): StreamProcessor<T> {
  return async (chunk) => {
    try {
      await Promise.race([
        processor(chunk),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
      ]);
    } catch (error) {
      console.error('Processor error:', error);
      // Ne pas propager l'erreur
    }
  };
}
```

---

## Performance Considerations

### Benchmarks

| Pattern | Latency Added | Memory Overhead |
|---------|---------------|-----------------|
| `stream.tee()` | < 1ms | 2x stream buffer |
| Fire-and-forget | 0ms (async) | Minimal |
| Sync observation | 10-100ms | Variable |

### Optimization Tips

1. **Batch processing** - Grouper les chunks avant traitement
2. **Rate limiting** - Limiter les appels aux services externes
3. **Lazy evaluation** - Ne pas traiter si pas necessaire
4. **Connection pooling** - Reutiliser les connexions DB

---

## Keywords Auto-Discovery

```
stream, tee, middleware, fire-and-forget, async logging,
non-intrusive, stream wrapping, observable, pipe, transform,
readable stream, async iterator, chunk processing
```

---

*ULTRA-CREATE v27.9 | Stream Patterns | Source: github.com/stripe/ai*
