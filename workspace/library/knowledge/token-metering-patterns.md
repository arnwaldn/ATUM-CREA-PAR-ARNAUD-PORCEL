# Token Metering Patterns - ULTRA-CREATE v27.9

> **Source**: Analyse du repository [github.com/stripe/ai](https://github.com/stripe/ai)
> **Pattern**: LLM usage billing via Stripe
> **Version**: 27.9 "STRIPE INTEGRATION"

---

## Table des Matieres

1. [Concept](#concept)
2. [Architecture](#architecture)
3. [Provider Detection](#provider-detection)
4. [Token Counting](#token-counting)
5. [Stripe Billing Integration](#stripe-billing-integration)
6. [Implementation TypeScript](#implementation-typescript)
7. [Implementation Python](#implementation-python)
8. [Streaming Support](#streaming-support)
9. [Dashboard & Analytics](#dashboard--analytics)
10. [Best Practices](#best-practices)

---

## Concept

Le **Token Metering** permet de facturer l'usage LLM en temps reel via Stripe:

```
LLM Request → Token Counter → Stripe Meter Event → Invoice
```

### Use Cases

- **SaaS AI** - Facturer les utilisateurs par token
- **API Wrapper** - Monetiser un wrapper LLM
- **Internal** - Tracking des couts par equipe/projet
- **Hybrid** - Mix forfait + usage

---

## Architecture

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                      TOKEN METERING                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐    ┌──────────────┐    ┌─────────────────┐   │
│  │   LLM    │───>│ Token Meter  │───>│ Stripe Billing  │   │
│  │ Response │    │   Wrapper    │    │  Meter Events   │   │
│  └──────────┘    └──────────────┘    └─────────────────┘   │
│                         │                     │             │
│                         ▼                     ▼             │
│                  ┌─────────────┐      ┌─────────────┐      │
│                  │  Analytics  │      │   Invoice   │      │
│                  │  Dashboard  │      │  Generation │      │
│                  └─────────────┘      └─────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Composants

| Composant | Role |
|-----------|------|
| **Token Meter** | Compte les tokens par provider |
| **Stripe Meter** | Enregistre les events d'usage |
| **Billing Portal** | Interface client facturation |
| **Analytics** | Dashboard couts/usage |

---

## Provider Detection

### Detection Automatique

Le token meter detecte automatiquement le provider depuis la structure de la reponse.

```typescript
type SupportedProvider = 'openai' | 'anthropic' | 'google' | 'unknown';

interface DetectedResponse {
  provider: SupportedProvider;
  inputTokens: number;
  outputTokens: number;
  model?: string;
}

function detectProvider(response: unknown): DetectedResponse | null {
  // OpenAI Format
  if (hasOpenAIStructure(response)) {
    return {
      provider: 'openai',
      inputTokens: response.usage?.prompt_tokens ?? 0,
      outputTokens: response.usage?.completion_tokens ?? 0,
      model: response.model
    };
  }

  // Anthropic Format
  if (hasAnthropicStructure(response)) {
    return {
      provider: 'anthropic',
      inputTokens: response.usage?.input_tokens ?? 0,
      outputTokens: response.usage?.output_tokens ?? 0,
      model: response.model
    };
  }

  // Google Gemini Format
  if (hasGoogleStructure(response)) {
    const metadata = response.usageMetadata;
    return {
      provider: 'google',
      inputTokens: metadata?.promptTokenCount ?? 0,
      outputTokens: metadata?.candidatesTokenCount ?? 0,
      model: response.modelVersion
    };
  }

  return null;
}

// Type guards
function hasOpenAIStructure(r: unknown): r is OpenAI.ChatCompletion {
  return typeof r === 'object' && r !== null && 'choices' in r && 'usage' in r;
}

function hasAnthropicStructure(r: unknown): r is Anthropic.Message {
  return typeof r === 'object' && r !== null && 'content' in r && 'usage' in r;
}

function hasGoogleStructure(r: unknown): r is GenerateContentResult {
  return typeof r === 'object' && r !== null && 'candidates' in r;
}
```

---

## Token Counting

### Par Provider

| Provider | Input | Output | Pricing (GPT-4 equiv) |
|----------|-------|--------|----------------------|
| OpenAI | `prompt_tokens` | `completion_tokens` | $30/$60 per 1M |
| Anthropic | `input_tokens` | `output_tokens` | $15/$75 per 1M |
| Google | `promptTokenCount` | `candidatesTokenCount` | $3.50/$10.50 per 1M |

### Estimation Client-Side

Pour les streams ou quand usage n'est pas disponible:

```typescript
function estimateTokens(text: string): number {
  // Approximation GPT-4: ~4 chars = 1 token
  return Math.ceil(text.length / 4);
}

// Plus precis avec tiktoken
import { encoding_for_model } from 'tiktoken';

function countTokensExact(text: string, model: string = 'gpt-4'): number {
  const enc = encoding_for_model(model);
  return enc.encode(text).length;
}
```

### Tokens Speciaux

```typescript
interface ExtendedTokenUsage {
  inputTokens: number;
  outputTokens: number;
  reasoningTokens?: number;    // Claude thinking, o1 reasoning
  cacheReadTokens?: number;    // Anthropic prompt caching
  cacheWriteTokens?: number;
  totalTokens: number;
}

function extractExtendedUsage(response: unknown): ExtendedTokenUsage {
  const base = detectProvider(response);

  // Anthropic extended thinking
  if (base?.provider === 'anthropic') {
    const msg = response as Anthropic.Message;
    return {
      ...base,
      reasoningTokens: msg.usage?.thinking_tokens,
      cacheReadTokens: msg.usage?.cache_read_input_tokens,
      cacheWriteTokens: msg.usage?.cache_creation_input_tokens,
      totalTokens: base.inputTokens + base.outputTokens
    };
  }

  return {
    inputTokens: base?.inputTokens ?? 0,
    outputTokens: base?.outputTokens ?? 0,
    totalTokens: (base?.inputTokens ?? 0) + (base?.outputTokens ?? 0)
  };
}
```

---

## Stripe Billing Integration

### Configuration Stripe Meter

```bash
# Creer un meter dans Stripe Dashboard ou via API
stripe billing meters create \
  --display-name="LLM Tokens" \
  --event-name="llm_tokens" \
  --default-aggregation=sum \
  --value-settings-event-payload-key="tokens"
```

### Meter Event API

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function reportTokenUsage(
  customerId: string,
  tokens: number,
  metadata?: Record<string, string>
): Promise<void> {
  await stripe.billing.meterEvents.create({
    event_name: 'llm_tokens',
    payload: {
      stripe_customer_id: customerId,
      value: tokens.toString(),
      ...metadata
    },
    timestamp: Math.floor(Date.now() / 1000)
  });
}
```

### Prix Base sur Usage

```typescript
// Creer un prix avec metering
const price = await stripe.prices.create({
  currency: 'usd',
  recurring: {
    interval: 'month',
    usage_type: 'metered'
  },
  billing_scheme: 'per_unit',
  unit_amount: 1,  // $0.01 per 1000 tokens
  transform_quantity: {
    divide_by: 1000,
    round: 'up'
  },
  product: 'prod_xxx',
  metadata: {
    meter: 'llm_tokens'
  }
});
```

---

## Implementation TypeScript

### Token Meter Class

```typescript
import Stripe from 'stripe';

interface MeterConfig {
  stripeSecretKey: string;
  eventName: string;
  async?: boolean;  // Fire-and-forget mode
}

interface UsageReport {
  customerId: string;
  inputTokens: number;
  outputTokens: number;
  model?: string;
  metadata?: Record<string, string>;
}

class TokenMeter {
  private stripe: Stripe;
  private eventName: string;
  private async: boolean;

  constructor(config: MeterConfig) {
    this.stripe = new Stripe(config.stripeSecretKey);
    this.eventName = config.eventName;
    this.async = config.async ?? true;
  }

  /**
   * Report token usage to Stripe
   */
  async report(usage: UsageReport): Promise<void> {
    const totalTokens = usage.inputTokens + usage.outputTokens;

    const eventPromise = this.stripe.billing.meterEvents.create({
      event_name: this.eventName,
      payload: {
        stripe_customer_id: usage.customerId,
        value: totalTokens.toString(),
        input_tokens: usage.inputTokens.toString(),
        output_tokens: usage.outputTokens.toString(),
        model: usage.model ?? 'unknown',
        ...usage.metadata
      },
      timestamp: Math.floor(Date.now() / 1000)
    });

    if (this.async) {
      // Fire-and-forget
      eventPromise.catch(console.error);
    } else {
      await eventPromise;
    }
  }

  /**
   * Track usage from LLM response automatically
   */
  trackResponse<T>(response: T, customerId: string): T {
    const detected = detectProvider(response);

    if (detected) {
      this.report({
        customerId,
        inputTokens: detected.inputTokens,
        outputTokens: detected.outputTokens,
        model: detected.model
      });
    }

    return response;  // Pass-through
  }

  /**
   * Wrap a stream with token tracking
   */
  wrapStream<T extends AsyncIterable<any>>(
    stream: T,
    customerId: string,
    estimator: (chunk: any) => number
  ): T {
    const meter = this;
    let totalTokens = 0;

    return {
      async *[Symbol.asyncIterator]() {
        for await (const chunk of stream) {
          totalTokens += estimator(chunk);
          yield chunk;
        }

        // Report at end of stream
        meter.report({
          customerId,
          inputTokens: 0,
          outputTokens: totalTokens
        });
      }
    } as T;
  }
}

// Export singleton
export const tokenMeter = new TokenMeter({
  stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
  eventName: 'llm_tokens',
  async: true
});
```

### Usage avec OpenAI

```typescript
import OpenAI from 'openai';
import { tokenMeter } from './token-meter';

const openai = new OpenAI();

async function chat(customerId: string, message: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: message }]
  });

  // Track usage automatiquement
  return tokenMeter.trackResponse(response, customerId);
}

// Streaming
async function chatStream(customerId: string, message: string) {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: message }],
    stream: true
  });

  return tokenMeter.wrapStream(
    stream,
    customerId,
    (chunk) => chunk.choices[0]?.delta?.content?.length / 4 ?? 0
  );
}
```

---

## Implementation Python

### Token Meter Class

```python
import stripe
import asyncio
from dataclasses import dataclass
from typing import Optional, Dict, Any, AsyncIterator
from time import time

@dataclass
class UsageReport:
    customer_id: str
    input_tokens: int
    output_tokens: int
    model: Optional[str] = None
    metadata: Optional[Dict[str, str]] = None

class TokenMeter:
    def __init__(
        self,
        stripe_secret_key: str,
        event_name: str = "llm_tokens",
        async_mode: bool = True
    ):
        stripe.api_key = stripe_secret_key
        self.event_name = event_name
        self.async_mode = async_mode

    async def report(self, usage: UsageReport) -> None:
        """Report token usage to Stripe."""
        total_tokens = usage.input_tokens + usage.output_tokens

        payload = {
            "stripe_customer_id": usage.customer_id,
            "value": str(total_tokens),
            "input_tokens": str(usage.input_tokens),
            "output_tokens": str(usage.output_tokens),
            "model": usage.model or "unknown"
        }

        if usage.metadata:
            payload.update(usage.metadata)

        if self.async_mode:
            # Fire-and-forget
            asyncio.create_task(self._create_event(payload))
        else:
            await self._create_event(payload)

    async def _create_event(self, payload: Dict[str, Any]) -> None:
        try:
            stripe.billing.MeterEvent.create(
                event_name=self.event_name,
                payload=payload,
                timestamp=int(time())
            )
        except Exception as e:
            print(f"Token metering error: {e}")

    def track_response(self, response: Any, customer_id: str) -> Any:
        """Track usage from LLM response."""
        usage = self._detect_usage(response)

        if usage:
            asyncio.create_task(self.report(UsageReport(
                customer_id=customer_id,
                input_tokens=usage["input"],
                output_tokens=usage["output"],
                model=usage.get("model")
            )))

        return response

    def _detect_usage(self, response: Any) -> Optional[Dict[str, int]]:
        """Detect token usage from response structure."""
        # OpenAI
        if hasattr(response, 'usage') and hasattr(response.usage, 'prompt_tokens'):
            return {
                "input": response.usage.prompt_tokens,
                "output": response.usage.completion_tokens,
                "model": getattr(response, 'model', None)
            }

        # Anthropic
        if hasattr(response, 'usage') and hasattr(response.usage, 'input_tokens'):
            return {
                "input": response.usage.input_tokens,
                "output": response.usage.output_tokens,
                "model": getattr(response, 'model', None)
            }

        return None

    async def wrap_stream(
        self,
        stream: AsyncIterator,
        customer_id: str,
        estimator: callable
    ) -> AsyncIterator:
        """Wrap stream with token tracking."""
        total_tokens = 0

        async for chunk in stream:
            total_tokens += estimator(chunk)
            yield chunk

        # Report at end
        await self.report(UsageReport(
            customer_id=customer_id,
            input_tokens=0,
            output_tokens=total_tokens
        ))


# Usage
token_meter = TokenMeter(
    stripe_secret_key=os.environ["STRIPE_SECRET_KEY"]
)

# Avec OpenAI
from openai import AsyncOpenAI

client = AsyncOpenAI()

async def chat(customer_id: str, message: str):
    response = await client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[{"role": "user", "content": message}]
    )

    return token_meter.track_response(response, customer_id)
```

---

## Streaming Support

### OpenAI Streaming

```typescript
async function* trackOpenAIStream(
  stream: AsyncIterable<OpenAI.Chat.ChatCompletionChunk>,
  customerId: string
): AsyncIterable<OpenAI.Chat.ChatCompletionChunk> {
  let outputTokens = 0;

  for await (const chunk of stream) {
    // Estimer tokens par chunk
    const content = chunk.choices[0]?.delta?.content ?? '';
    outputTokens += Math.ceil(content.length / 4);

    yield chunk;
  }

  // Report apres completion
  tokenMeter.report({
    customerId,
    inputTokens: 0,  // Non disponible en streaming
    outputTokens
  });
}
```

### Anthropic Streaming

```typescript
async function* trackAnthropicStream(
  stream: AsyncIterable<Anthropic.MessageStreamEvent>,
  customerId: string
): AsyncIterable<Anthropic.MessageStreamEvent> {
  let inputTokens = 0;
  let outputTokens = 0;

  for await (const event of stream) {
    // Capturer usage depuis events
    if (event.type === 'message_start') {
      inputTokens = event.message.usage.input_tokens;
    }
    if (event.type === 'message_delta') {
      outputTokens = event.usage.output_tokens;
    }

    yield event;
  }

  tokenMeter.report({
    customerId,
    inputTokens,
    outputTokens
  });
}
```

---

## Dashboard & Analytics

### Stripe Dashboard Integration

Stripe fournit des dashboards natifs pour les meters:
- Usage par client
- Tendances temporelles
- Revenue projete

### Custom Analytics

```typescript
interface UsageAnalytics {
  totalTokens: number;
  totalCost: number;
  byModel: Record<string, number>;
  byDay: Record<string, number>;
}

async function getUsageAnalytics(
  customerId: string,
  startDate: Date,
  endDate: Date
): Promise<UsageAnalytics> {
  const events = await stripe.billing.meterEventSummaries.list({
    customer: customerId,
    start_time: Math.floor(startDate.getTime() / 1000),
    end_time: Math.floor(endDate.getTime() / 1000)
  });

  return processEvents(events.data);
}
```

### Pricing Calculator

```typescript
const PRICING = {
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-4o': { input: 0.005, output: 0.015 },
  'claude-3-opus': { input: 0.015, output: 0.075 },
  'claude-3-sonnet': { input: 0.003, output: 0.015 }
};

function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = PRICING[model] ?? { input: 0.01, output: 0.03 };

  const inputCost = (inputTokens / 1000) * pricing.input;
  const outputCost = (outputTokens / 1000) * pricing.output;

  return inputCost + outputCost;
}
```

---

## Best Practices

### DO (Faire)

1. **Async metering** - Ne pas bloquer les requetes
2. **Batching** - Grouper les reports si haute frequence
3. **Fallback** - Estimer si usage non disponible
4. **Logging** - Logger les erreurs de metering
5. **Monitoring** - Alerter sur anomalies

### DON'T (Ne pas faire)

1. **Sync blocking** - Ne jamais bloquer pour metering
2. **Over-report** - Eviter les doublons
3. **Skip errors** - Toujours logger les echecs
4. **Trust estimates** - Preferer usage reel si disponible

### Error Handling

```typescript
class ResilientTokenMeter extends TokenMeter {
  private queue: UsageReport[] = [];
  private retryCount = 0;

  async report(usage: UsageReport): Promise<void> {
    try {
      await super.report(usage);
      this.retryCount = 0;
    } catch (error) {
      // Queue pour retry
      this.queue.push(usage);
      this.scheduleRetry();
    }
  }

  private scheduleRetry(): void {
    if (this.retryCount >= 3) return;

    setTimeout(async () => {
      this.retryCount++;
      const batch = this.queue.splice(0, 10);

      for (const usage of batch) {
        await this.report(usage);
      }
    }, Math.pow(2, this.retryCount) * 1000);
  }
}
```

---

## Keywords Auto-Discovery

```
token metering, llm billing, usage tracking, ai billing,
token count, cost tracking, metering, stripe meter,
usage-based pricing, pay per token, api monetization
```

---

*ULTRA-CREATE v27.9 | Token Metering Patterns | Source: github.com/stripe/ai*
