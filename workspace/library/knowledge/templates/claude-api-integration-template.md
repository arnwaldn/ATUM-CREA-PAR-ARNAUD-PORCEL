# Template: Claude API Integration

## Overview

Template complet pour intégrer l'API Claude (Anthropic) dans vos applications. Couvre tous les SDKs officiels, patterns d'utilisation, streaming, tool use, et bonnes pratiques.

---

## SDKS OFFICIELS ANTHROPIC

| Langage | Package | Version | Statut |
|---------|---------|---------|--------|
| **Python** | `anthropic` | Latest | Stable |
| **TypeScript/JS** | `@anthropic-ai/sdk` | Latest | Stable |
| **Java** | `anthropic-java` | 2.10.0 | Stable |
| **Go** | `anthropic-sdk-go` | 0.4.4 | Stable |
| **C#** | `Anthropic` | Latest | Beta |
| **Ruby** | `anthropic` | 1.13.0 | Stable |
| **PHP** | `anthropic-ai/sdk` | 0.3.0 | Beta |

---

## INSTALLATION

### Python

```bash
pip install anthropic
```

### TypeScript/JavaScript

```bash
npm install @anthropic-ai/sdk
# ou
pnpm add @anthropic-ai/sdk
# ou
yarn add @anthropic-ai/sdk
```

### Java (Gradle)

```groovy
implementation("com.anthropic:anthropic-java:2.10.0")
```

### Java (Maven)

```xml
<dependency>
    <groupId>com.anthropic</groupId>
    <artifactId>anthropic-java</artifactId>
    <version>2.10.0</version>
</dependency>
```

### Go

```bash
go get -u 'github.com/anthropics/anthropic-sdk-go@v0.4.4'
```

### C#

```bash
dotnet add package Anthropic
```

### Ruby

```ruby
# Gemfile
gem "anthropic", "~> 1.13.0"
```

### PHP

```bash
composer require "anthropic-ai/sdk:0.3.0"
```

---

## CONFIGURATION

### Variables d'environnement

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
CLAUDE_MODEL=claude-sonnet-4-20250514
```

### Modèles disponibles (Décembre 2025)

| Modèle | ID | Usage |
|--------|-----|-------|
| **Claude Opus 4.5** | `claude-opus-4-5-20251101` | Tâches complexes, raisonnement avancé |
| **Claude Sonnet 4** | `claude-sonnet-4-20250514` | Équilibré performance/coût |
| **Claude Haiku 3.5** | `claude-3-5-haiku-20241022` | Rapide, économique |

---

## USAGE DE BASE

### Python

```python
from anthropic import Anthropic

# Initialisation
client = Anthropic()  # Utilise ANTHROPIC_API_KEY automatiquement

# Message simple
message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Explique-moi les design patterns en Python"}
    ]
)

print(message.content[0].text)
```

### TypeScript

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

async function chat(prompt: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      { role: 'user', content: prompt }
    ]
  });

  return message.content[0].type === 'text'
    ? message.content[0].text
    : '';
}

// Usage
const response = await chat('Hello Claude!');
console.log(response);
```

### Java

```java
import com.anthropic.Anthropic;
import com.anthropic.models.*;

public class ClaudeExample {
    public static void main(String[] args) {
        Anthropic client = Anthropic.builder().build();

        Message message = client.messages().create(
            MessageCreateParams.builder()
                .model("claude-sonnet-4-20250514")
                .maxTokens(1024)
                .addMessage(MessageParam.builder()
                    .role(Role.USER)
                    .content("Hello Claude!")
                    .build())
                .build()
        );

        System.out.println(message.content().get(0).text());
    }
}
```

### Go

```go
package main

import (
    "context"
    "fmt"
    "github.com/anthropics/anthropic-sdk-go"
)

func main() {
    client := anthropic.NewClient()

    message, err := client.Messages.New(context.Background(), anthropic.MessageNewParams{
        Model:     anthropic.ModelClaudeSonnet4_20250514,
        MaxTokens: 1024,
        Messages: []anthropic.MessageParam{
            anthropic.NewUserMessage(anthropic.NewTextBlock("Hello Claude!")),
        },
    })

    if err != nil {
        panic(err)
    }

    fmt.Println(message.Content[0].Text)
}
```

---

## STREAMING

### Python Streaming

```python
from anthropic import Anthropic

client = Anthropic()

# Streaming avec context manager
with client.messages.stream(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Écris une histoire courte"}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)

print()  # Nouvelle ligne à la fin
```

### TypeScript Streaming

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

async function streamChat(prompt: string): Promise<void> {
  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }]
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      process.stdout.write(event.delta.text);
    }
  }

  console.log(); // Nouvelle ligne
}

await streamChat('Écris une histoire courte');
```

### Next.js API Route avec Streaming

```typescript
// app/api/chat/route.ts
import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages,
  });

  // Retourner un ReadableStream
  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(new TextEncoder().encode(event.delta.text));
          }
        }
        controller.close();
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    }
  );
}
```

---

## TOOL USE (Function Calling)

### Python Tool Use

```python
from anthropic import Anthropic

client = Anthropic()

# Définition des tools
tools = [
    {
        "name": "get_weather",
        "description": "Obtient la météo actuelle pour une ville",
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "Nom de la ville"
                },
                "unit": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"],
                    "description": "Unité de température"
                }
            },
            "required": ["city"]
        }
    },
    {
        "name": "search_database",
        "description": "Recherche dans la base de données",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "limit": {"type": "integer", "default": 10}
            },
            "required": ["query"]
        }
    }
]

# Fonction pour exécuter les tools
def execute_tool(name: str, input: dict) -> str:
    if name == "get_weather":
        # Simulation API météo
        return f"Il fait 22°C à {input['city']}, ensoleillé"
    elif name == "search_database":
        # Simulation recherche DB
        return f"Trouvé 5 résultats pour '{input['query']}'"
    return "Tool non reconnu"

# Conversation avec tools
messages = [
    {"role": "user", "content": "Quelle est la météo à Paris et cherche 'claude' dans la base"}
]

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    tools=tools,
    messages=messages
)

# Traiter les tool calls
while response.stop_reason == "tool_use":
    tool_results = []

    for block in response.content:
        if block.type == "tool_use":
            result = execute_tool(block.name, block.input)
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": result
            })

    # Ajouter la réponse de Claude et les résultats des tools
    messages.append({"role": "assistant", "content": response.content})
    messages.append({"role": "user", "content": tool_results})

    # Continuer la conversation
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        tools=tools,
        messages=messages
    )

# Réponse finale
print(response.content[0].text)
```

### TypeScript Tool Use

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

interface Tool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

const tools: Tool[] = [
  {
    name: 'get_stock_price',
    description: 'Obtient le prix actuel d\'une action',
    input_schema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Symbole boursier (ex: AAPL, GOOGL)'
        }
      },
      required: ['symbol']
    }
  },
  {
    name: 'place_order',
    description: 'Place un ordre d\'achat ou de vente',
    input_schema: {
      type: 'object',
      properties: {
        symbol: { type: 'string' },
        action: { type: 'string', enum: ['buy', 'sell'] },
        quantity: { type: 'number' }
      },
      required: ['symbol', 'action', 'quantity']
    }
  }
];

async function executeToolCall(name: string, input: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'get_stock_price':
      // Simulation API bourse
      return JSON.stringify({ symbol: input.symbol, price: 150.25, change: '+2.3%' });
    case 'place_order':
      // Simulation ordre
      return JSON.stringify({ status: 'executed', orderId: 'ORD-12345' });
    default:
      return 'Unknown tool';
  }
}

async function chatWithTools(userMessage: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: userMessage }
  ];

  let response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    tools,
    messages
  });

  // Boucle de traitement des tools
  while (response.stop_reason === 'tool_use') {
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === 'tool_use') {
        const result = await executeToolCall(block.name, block.input as Record<string, unknown>);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result
        });
      }
    }

    messages.push({ role: 'assistant', content: response.content });
    messages.push({ role: 'user', content: toolResults });

    response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      tools,
      messages
    });
  }

  const textBlock = response.content.find(b => b.type === 'text');
  return textBlock?.type === 'text' ? textBlock.text : '';
}

// Usage
const result = await chatWithTools('Quel est le prix de AAPL et achète 10 actions');
console.log(result);
```

---

## VISION (Images)

### Python Vision

```python
import anthropic
import base64
import httpx

client = anthropic.Anthropic()

# Depuis URL
message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "url",
                        "url": "https://example.com/image.jpg",
                    },
                },
                {
                    "type": "text",
                    "text": "Décris cette image en détail"
                }
            ],
        }
    ],
)

# Depuis fichier local (base64)
def encode_image(image_path: str) -> str:
    with open(image_path, "rb") as image_file:
        return base64.standard_b64encode(image_file.read()).decode("utf-8")

image_data = encode_image("screenshot.png")

message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": image_data,
                    },
                },
                {
                    "type": "text",
                    "text": "Analyse cette capture d'écran et génère le code React correspondant"
                }
            ],
        }
    ],
)

print(message.content[0].text)
```

### TypeScript Vision

```typescript
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';

const client = new Anthropic();

// Depuis fichier local
async function analyzeImage(imagePath: string, prompt: string): Promise<string> {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');

  // Déterminer le media type
  const ext = imagePath.split('.').pop()?.toLowerCase();
  const mediaType = ext === 'png' ? 'image/png' :
                    ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
                    ext === 'gif' ? 'image/gif' :
                    'image/webp';

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: prompt
          }
        ],
      }
    ],
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}

// Usage
const code = await analyzeImage(
  './design-mockup.png',
  'Génère le code React avec TailwindCSS pour reproduire ce design'
);
console.log(code);
```

---

## SYSTEM PROMPTS

### Python avec System Prompt

```python
from anthropic import Anthropic

client = Anthropic()

# System prompt pour personnaliser le comportement
TRADING_ASSISTANT_PROMPT = """Tu es un assistant de trading expert spécialisé dans:
- L'analyse technique (patterns, indicateurs)
- La gestion du risque
- Les stratégies de trading algorithmique

Règles:
1. Toujours mentionner les risques associés
2. Ne jamais donner de conseils financiers directs
3. Utiliser des données factuelles
4. Expliquer le raisonnement derrière chaque analyse
"""

message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=2048,
    system=TRADING_ASSISTANT_PROMPT,
    messages=[
        {"role": "user", "content": "Analyse le pattern tête-épaules sur EURUSD"}
    ]
)

print(message.content[0].text)
```

### Multi-turn Conversation

```python
from anthropic import Anthropic

client = Anthropic()

class ChatSession:
    def __init__(self, system_prompt: str = None):
        self.client = Anthropic()
        self.messages = []
        self.system = system_prompt

    def chat(self, user_message: str) -> str:
        self.messages.append({"role": "user", "content": user_message})

        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2048,
            system=self.system,
            messages=self.messages
        )

        assistant_message = response.content[0].text
        self.messages.append({"role": "assistant", "content": assistant_message})

        return assistant_message

    def reset(self):
        self.messages = []

# Usage
session = ChatSession(system_prompt="Tu es un expert en Python et architecture logicielle.")

print(session.chat("Comment implémenter un pattern Observer?"))
print(session.chat("Peux-tu me donner un exemple concret?"))
print(session.chat("Comment le tester avec pytest?"))
```

---

## INTEGRATION NEXT.JS COMPLETE

### Structure du projet

```
my-claude-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   └── StreamingMessage.tsx
│   │   └── ui/
│   ├── hooks/
│   │   └── useChat.ts
│   ├── lib/
│   │   ├── anthropic.ts
│   │   └── types.ts
│   └── stores/
│       └── chat.store.ts
├── .env.local
└── package.json
```

### Configuration Anthropic Client

```typescript
// src/lib/anthropic.ts
import Anthropic from '@anthropic-ai/sdk';

// Client côté serveur uniquement
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const MODELS = {
  OPUS: 'claude-opus-4-5-20251101',
  SONNET: 'claude-sonnet-4-20250514',
  HAIKU: 'claude-3-5-haiku-20241022',
} as const;

export type ModelId = typeof MODELS[keyof typeof MODELS];
```

### Types

```typescript
// src/lib/types.ts
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  messages: Message[];
  model?: string;
  systemPrompt?: string;
}

export interface StreamChunk {
  type: 'text' | 'error' | 'done';
  content: string;
}
```

### API Route avec Streaming

```typescript
// src/app/api/chat/route.ts
import { anthropic, MODELS } from '@/lib/anthropic';
import { NextRequest } from 'next/server';

export const runtime = 'edge'; // Optionnel: Edge Runtime pour performance

export async function POST(req: NextRequest) {
  try {
    const { messages, model = MODELS.SONNET, systemPrompt } = await req.json();

    // Convertir les messages au format Anthropic
    const anthropicMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    const stream = await anthropic.messages.stream({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    // Créer un ReadableStream pour le streaming
    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const chunk = JSON.stringify({ type: 'text', content: event.delta.text }) + '\n';
              controller.enqueue(encoder.encode(chunk));
            }
          }

          controller.enqueue(encoder.encode(JSON.stringify({ type: 'done', content: '' }) + '\n'));
          controller.close();
        } catch (error) {
          const errorChunk = JSON.stringify({ type: 'error', content: 'Stream error' }) + '\n';
          controller.enqueue(encoder.encode(errorChunk));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

### Hook useChat

```typescript
// src/hooks/useChat.ts
'use client';

import { useState, useCallback } from 'react';
import { Message, StreamChunk } from '@/lib/types';
import { nanoid } from 'nanoid';

interface UseChatOptions {
  systemPrompt?: string;
  model?: string;
  onError?: (error: Error) => void;
}

export function useChat(options: UseChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: nanoid(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setStreamingContent('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model: options.model,
          systemPrompt: options.systemPrompt,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n').filter(Boolean);

        for (const line of lines) {
          const chunk: StreamChunk = JSON.parse(line);

          if (chunk.type === 'text') {
            fullContent += chunk.content;
            setStreamingContent(fullContent);
          } else if (chunk.type === 'done') {
            const assistantMessage: Message = {
              id: nanoid(),
              role: 'assistant',
              content: fullContent,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, assistantMessage]);
            setStreamingContent('');
          } else if (chunk.type === 'error') {
            throw new Error(chunk.content);
          }
        }
      }
    } catch (error) {
      options.onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [messages, options]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingContent('');
  }, []);

  return {
    messages,
    isLoading,
    streamingContent,
    sendMessage,
    clearMessages,
  };
}
```

### Composant Chat

```tsx
// src/components/chat/ChatWindow.tsx
'use client';

import { useChat } from '@/hooks/useChat';
import { useState } from 'react';
import { Send, Loader2, Trash2 } from 'lucide-react';

export function ChatWindow() {
  const [input, setInput] = useState('');
  const { messages, isLoading, streamingContent, sendMessage, clearMessages } = useChat({
    systemPrompt: 'Tu es un assistant helpful et concis.',
    onError: (error) => console.error('Chat error:', error),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold">Chat avec Claude</h2>
        <button
          onClick={clearMessages}
          className="p-2 hover:bg-muted rounded-md"
          title="Effacer la conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {/* Streaming message */}
        {streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
              <p className="whitespace-pre-wrap">{streamingContent}</p>
              <span className="inline-block w-2 h-4 bg-foreground/50 animate-pulse ml-1" />
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && !streamingContent && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écris ton message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
```

---

## INTEGRATION TRADING BRAIN

### Exemple: Assistant Trading avec Claude

```typescript
// src/lib/trading-assistant.ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const TRADING_SYSTEM_PROMPT = `Tu es l'assistant IA de Trading Brain, spécialisé dans:

1. ANALYSE TECHNIQUE
   - Patterns de chandelier (doji, hammer, engulfing...)
   - Indicateurs (RSI, MACD, Bollinger, EMA...)
   - Support/Résistance, Fibonacci

2. GESTION DU RISQUE
   - Position sizing
   - Stop-loss / Take-profit
   - Risk/Reward ratio

3. EXÉCUTION MT5
   - Tu peux analyser les données de MetaTrader 5
   - Tu peux suggérer des trades (mais pas les exécuter directement)

RÈGLES:
- Toujours mentionner les risques
- Ne jamais garantir de profits
- Expliquer le raisonnement
- Utiliser les données fournies par les tools

FORMAT:
- Utilise des emojis pour la lisibilité
- Structure en sections claires
- Inclus des niveaux de prix précis quand pertinent
`;

// Tools pour l'assistant trading
const tradingTools: Anthropic.Tool[] = [
  {
    name: 'get_market_data',
    description: 'Obtient les données de marché actuelles pour un symbole',
    input_schema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Symbole (ex: EURUSD, BTCUSD)' },
        timeframe: { type: 'string', enum: ['M1', 'M5', 'M15', 'H1', 'H4', 'D1'] }
      },
      required: ['symbol']
    }
  },
  {
    name: 'calculate_indicators',
    description: 'Calcule les indicateurs techniques',
    input_schema: {
      type: 'object',
      properties: {
        symbol: { type: 'string' },
        indicators: {
          type: 'array',
          items: { type: 'string' },
          description: 'Liste des indicateurs (RSI, MACD, EMA, BB)'
        }
      },
      required: ['symbol', 'indicators']
    }
  },
  {
    name: 'get_account_info',
    description: 'Obtient les informations du compte de trading',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  }
];

export class TradingAssistant {
  private messages: Anthropic.MessageParam[] = [];

  async analyze(userMessage: string): Promise<string> {
    this.messages.push({ role: 'user', content: userMessage });

    let response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: TRADING_SYSTEM_PROMPT,
      tools: tradingTools,
      messages: this.messages
    });

    // Traiter les tool calls
    while (response.stop_reason === 'tool_use') {
      const toolResults = await this.executeTools(response.content);

      this.messages.push({ role: 'assistant', content: response.content });
      this.messages.push({ role: 'user', content: toolResults });

      response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: TRADING_SYSTEM_PROMPT,
        tools: tradingTools,
        messages: this.messages
      });
    }

    const textContent = response.content.find(b => b.type === 'text');
    const assistantMessage = textContent?.type === 'text' ? textContent.text : '';

    this.messages.push({ role: 'assistant', content: assistantMessage });

    return assistantMessage;
  }

  private async executeTools(content: Anthropic.ContentBlock[]): Promise<Anthropic.ToolResultBlockParam[]> {
    const results: Anthropic.ToolResultBlockParam[] = [];

    for (const block of content) {
      if (block.type === 'tool_use') {
        let result: string;

        switch (block.name) {
          case 'get_market_data':
            result = await this.getMarketData(block.input as any);
            break;
          case 'calculate_indicators':
            result = await this.calculateIndicators(block.input as any);
            break;
          case 'get_account_info':
            result = await this.getAccountInfo();
            break;
          default:
            result = 'Tool not found';
        }

        results.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result
        });
      }
    }

    return results;
  }

  // Ces méthodes appellent ton backend MT5
  private async getMarketData(input: { symbol: string; timeframe?: string }): Promise<string> {
    // Appel à ton API MT5
    const response = await fetch(`/api/mt5/market-data?symbol=${input.symbol}&timeframe=${input.timeframe || 'H1'}`);
    return JSON.stringify(await response.json());
  }

  private async calculateIndicators(input: { symbol: string; indicators: string[] }): Promise<string> {
    const response = await fetch('/api/mt5/indicators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    return JSON.stringify(await response.json());
  }

  private async getAccountInfo(): Promise<string> {
    const response = await fetch('/api/mt5/account');
    return JSON.stringify(await response.json());
  }

  reset() {
    this.messages = [];
  }
}
```

---

## BONNES PRATIQUES

### Rate Limiting

```typescript
// src/lib/rate-limiter.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requêtes par minute
  analytics: true,
});

export async function checkRateLimit(identifier: string): Promise<boolean> {
  const { success } = await ratelimit.limit(identifier);
  return success;
}
```

### Error Handling

```typescript
// src/lib/errors.ts
export class AnthropicError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number
  ) {
    super(message);
    this.name = 'AnthropicError';
  }
}

export function handleAnthropicError(error: unknown): never {
  if (error instanceof Anthropic.APIError) {
    throw new AnthropicError(
      error.message,
      error.code || 'UNKNOWN',
      error.status
    );
  }
  throw error;
}
```

### Caching

```typescript
// src/lib/cache.ts
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function getCachedResponse(key: string): Promise<string | null> {
  return redis.get(key);
}

export async function setCachedResponse(
  key: string,
  response: string,
  ttl: number = 3600
): Promise<void> {
  await redis.setex(key, ttl, response);
}

// Génère une clé de cache basée sur les messages
export function generateCacheKey(messages: any[]): string {
  const content = JSON.stringify(messages);
  return `claude:${Buffer.from(content).toString('base64').slice(0, 64)}`;
}
```

---

## COMMANDES DE GÉNÉRATION

```bash
# Créer une app avec intégration Claude
/create saas MyChatApp --with-claude-api

# Ajouter Claude à un projet existant
/generate feature claude-chat

# Créer un assistant spécialisé
/generate feature claude-assistant --domain trading
```

---

## RESSOURCES

| Ressource | URL |
|-----------|-----|
| Documentation API | https://docs.anthropic.com/en/api |
| Python SDK GitHub | https://github.com/anthropics/anthropic-sdk-python |
| TypeScript SDK GitHub | https://github.com/anthropics/anthropic-sdk-typescript |
| Cookbook | https://github.com/anthropics/anthropic-cookbook |
| Tarification | https://www.anthropic.com/pricing |

---

**Version:** 1.0
**Stack:** Anthropic SDK + Next.js 15 + TypeScript
**Dernière mise à jour:** 2025-12-09
