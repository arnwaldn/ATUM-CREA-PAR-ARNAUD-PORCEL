# HuggingFace Integration Template - ULTRA-CREATE v13.0

## Overview

Ce template permet d'integrer l'ecosysteme HuggingFace dans les applications generees par ULTRA-CREATE, donnant acces a 200k+ modeles ML et des capacites d'agents avances.

---

## 1. TECHNOLOGIES DISPONIBLES

### Matrice d'Integration

| Technologie | Runtime | Use Case Principal | Integration ULTRA-CREATE |
|-------------|---------|-------------------|-------------------------|
| **@huggingface/inference** | Node.js/Browser | API 200k+ modeles | Backend AI features |
| **Transformers.js** | Browser (ONNX) | ML cote client | Frontend AI sans serveur |
| **smolagents** | Python | Agents code-first | Enhanced autonomous agents |
| **@huggingface/mcp-client** | Node.js | MCP + Agents | Alternative MCP provider |
| **Gradio** | Python | Demos ML rapides | Prototypage interfaces |

---

## 2. @HUGGINGFACE/INFERENCE - 200k+ Modeles

### Installation

```bash
npm install @huggingface/inference
# ou
pnpm add @huggingface/inference
```

### Configuration Environnement

```env
# .env.local
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxx
```

### Client de Base

```typescript
// src/lib/huggingface.ts
import { HfInference } from '@huggingface/inference';

// Client singleton
export const hf = new HfInference(process.env.HF_TOKEN);

// Avec inference providers (plus rapide, plus fiable)
export const hfProvider = new HfInference(process.env.HF_TOKEN);
```

### Text Generation

```typescript
// Generation de texte simple
const result = await hf.textGeneration({
  model: 'mistralai/Mistral-7B-Instruct-v0.2',
  inputs: 'Explain quantum computing in simple terms:',
  parameters: {
    max_new_tokens: 200,
    temperature: 0.7,
    top_p: 0.95,
  }
});

console.log(result.generated_text);
```

### Chat Completion

```typescript
// Chat avec messages
const chatResponse = await hf.chatCompletion({
  model: 'meta-llama/Llama-3.2-3B-Instruct',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is the capital of France?' }
  ],
  max_tokens: 500,
});

console.log(chatResponse.choices[0].message.content);
```

### Streaming Chat

```typescript
// Streaming pour UI reactive
const stream = hf.chatCompletionStream({
  model: 'meta-llama/Llama-3.2-3B-Instruct',
  messages: [
    { role: 'user', content: 'Write a short poem about coding' }
  ],
  max_tokens: 200,
});

for await (const chunk of stream) {
  if (chunk.choices[0]?.delta?.content) {
    process.stdout.write(chunk.choices[0].delta.content);
  }
}
```

### Image Generation

```typescript
// Generation d'images avec FLUX ou Stable Diffusion
const imageBlob = await hf.textToImage({
  model: 'black-forest-labs/FLUX.1-dev',
  inputs: 'A futuristic city with flying cars at sunset',
  parameters: {
    guidance_scale: 7.5,
    num_inference_steps: 50,
  }
});

// Convertir en base64 pour affichage
const buffer = await imageBlob.arrayBuffer();
const base64 = Buffer.from(buffer).toString('base64');
const imageUrl = `data:image/png;base64,${base64}`;
```

### Image-to-Text (Vision)

```typescript
// Analyse d'image
const caption = await hf.imageToText({
  model: 'Salesforce/blip-image-captioning-large',
  data: await fetch('https://example.com/image.jpg').then(r => r.blob()),
});

console.log(caption.generated_text);
```

### Text Embeddings

```typescript
// Embeddings pour RAG / Semantic Search
const embeddings = await hf.featureExtraction({
  model: 'sentence-transformers/all-MiniLM-L6-v2',
  inputs: 'This is a sample sentence for embedding',
});

// embeddings est un tableau de nombres (vector)
console.log(embeddings.length); // 384 dimensions
```

### Speech-to-Text

```typescript
// Transcription audio
const transcription = await hf.automaticSpeechRecognition({
  model: 'openai/whisper-large-v3',
  data: audioBlob, // Blob audio
});

console.log(transcription.text);
```

### Text-to-Speech

```typescript
// Synthese vocale
const audioBlob = await hf.textToSpeech({
  model: 'facebook/mms-tts-eng',
  inputs: 'Hello, this is a test of text to speech.',
});

// Jouer l'audio
const audioUrl = URL.createObjectURL(audioBlob);
const audio = new Audio(audioUrl);
audio.play();
```

### Zero-Shot Classification

```typescript
// Classification sans entrainement
const classification = await hf.zeroShotClassification({
  model: 'facebook/bart-large-mnli',
  inputs: 'I love programming in TypeScript!',
  parameters: {
    candidate_labels: ['technology', 'sports', 'politics', 'entertainment']
  }
});

console.log(classification.labels[0]); // 'technology'
```

### Object Detection

```typescript
// Detection d'objets dans images
const objects = await hf.objectDetection({
  model: 'facebook/detr-resnet-50',
  data: imageBlob,
});

objects.forEach(obj => {
  console.log(`${obj.label}: ${(obj.score * 100).toFixed(1)}%`);
  console.log(`  Box: ${JSON.stringify(obj.box)}`);
});
```

---

## 3. TRANSFORMERS.JS - ML Cote Client

### Installation

```bash
npm install @huggingface/transformers
```

### Configuration Next.js

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'sharp$': false,
      'onnxruntime-node$': false,
    };
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['@huggingface/transformers'],
  },
};

module.exports = nextConfig;
```

### Pipeline API (Browser)

```typescript
// src/lib/transformers-client.ts
import { pipeline, env } from '@huggingface/transformers';

// Configurer pour browser
env.allowLocalModels = false;
env.useBrowserCache = true;

// Singleton pour eviter rechargement
let sentimentPipeline: any = null;

export async function analyzeSentiment(text: string) {
  if (!sentimentPipeline) {
    sentimentPipeline = await pipeline(
      'sentiment-analysis',
      'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
    );
  }

  const result = await sentimentPipeline(text);
  return result[0]; // { label: 'POSITIVE', score: 0.99 }
}
```

### Text Classification (Browser)

```typescript
import { pipeline } from '@huggingface/transformers';

// Classification de texte
const classifier = await pipeline(
  'text-classification',
  'Xenova/toxic-bert'
);

const result = await classifier('This is a friendly message');
// [{ label: 'non-toxic', score: 0.98 }]
```

### Feature Extraction / Embeddings (Browser)

```typescript
import { pipeline } from '@huggingface/transformers';

const extractor = await pipeline(
  'feature-extraction',
  'Xenova/all-MiniLM-L6-v2'
);

const embeddings = await extractor('Sample text for embedding', {
  pooling: 'mean',
  normalize: true,
});

// Utilisable pour similarity search cote client
```

### Question Answering (Browser)

```typescript
import { pipeline } from '@huggingface/transformers';

const qa = await pipeline(
  'question-answering',
  'Xenova/distilbert-base-uncased-distilled-squad'
);

const result = await qa({
  question: 'What is the capital of France?',
  context: 'France is a country in Europe. Paris is the capital of France.'
});

// { answer: 'Paris', score: 0.98, start: 42, end: 47 }
```

### Image Classification (Browser)

```typescript
import { pipeline } from '@huggingface/transformers';

const classifier = await pipeline(
  'image-classification',
  'Xenova/vit-base-patch16-224'
);

// Depuis URL ou File
const result = await classifier('https://example.com/cat.jpg');
// [{ label: 'tabby cat', score: 0.92 }, ...]
```

### Object Detection (Browser)

```typescript
import { pipeline } from '@huggingface/transformers';

const detector = await pipeline(
  'object-detection',
  'Xenova/detr-resnet-50'
);

const result = await detector('https://example.com/street.jpg');
// [{ label: 'car', score: 0.95, box: { xmin, ymin, xmax, ymax } }, ...]
```

### React Hook pour Transformers.js

```typescript
// src/hooks/useTransformers.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { pipeline, PipelineType } from '@huggingface/transformers';

interface UseTransformersOptions {
  task: PipelineType;
  model: string;
}

export function useTransformers<T>({ task, model }: UseTransformersOptions) {
  const [pipe, setPipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadPipeline = async () => {
      try {
        const loadedPipe = await pipeline(task, model, {
          progress_callback: (data: any) => {
            if (data.status === 'progress' && mounted) {
              setProgress(Math.round(data.progress));
            }
          },
        });

        if (mounted) {
          setPipe(() => loadedPipe);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    loadPipeline();

    return () => {
      mounted = false;
    };
  }, [task, model]);

  const run = useCallback(async (input: any, options?: any): Promise<T> => {
    if (!pipe) throw new Error('Pipeline not loaded');
    return pipe(input, options);
  }, [pipe]);

  return { run, loading, error, progress, ready: !!pipe };
}
```

### Composant React Sentiment Analyzer

```tsx
// src/components/SentimentAnalyzer.tsx
'use client';

import { useState } from 'react';
import { useTransformers } from '@/hooks/useTransformers';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface SentimentResult {
  label: string;
  score: number;
}

export function SentimentAnalyzer() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const { run, loading, progress, ready } = useTransformers<SentimentResult[]>({
    task: 'sentiment-analysis',
    model: 'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
  });

  const analyze = async () => {
    if (!text.trim() || !ready) return;

    setAnalyzing(true);
    try {
      const results = await run(text);
      setResult(results[0]);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Sentiment Analysis
          {loading && (
            <Badge variant="secondary">
              Loading model... {progress}%
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to analyze..."
          rows={4}
        />

        <Button
          onClick={analyze}
          disabled={!ready || analyzing || !text.trim()}
          className="w-full"
        >
          {analyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Sentiment'
          )}
        </Button>

        {result && (
          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center justify-between">
              <span className="font-medium">Result:</span>
              <Badge variant={result.label === 'POSITIVE' ? 'default' : 'destructive'}>
                {result.label}
              </Badge>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Confidence: {(result.score * 100).toFixed(1)}%
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 4. SMOLAGENTS - Agents Code-First (Python)

### Installation

```bash
pip install smolagents
# Avec support MCP
pip install smolagents[mcp]
```

### Agent Basique

```python
# agents/basic_agent.py
from smolagents import CodeAgent, HfApiModel

# Modele via HuggingFace Inference API
model = HfApiModel(model_id="Qwen/Qwen2.5-Coder-32B-Instruct")

# Agent qui ecrit du code pour accomplir les taches
agent = CodeAgent(
    tools=[],  # Outils disponibles
    model=model,
    max_steps=10,
)

# Executer une tache
result = agent.run("What is 2 + 2?")
print(result)
```

### Agent avec Outils Custom

```python
from smolagents import CodeAgent, HfApiModel, tool

@tool
def get_weather(city: str) -> str:
    """
    Obtient la meteo actuelle pour une ville.

    Args:
        city: Nom de la ville

    Returns:
        Description de la meteo
    """
    # Simulation - remplacer par vraie API
    return f"Il fait 22°C et ensoleille a {city}"

@tool
def search_web(query: str) -> str:
    """
    Recherche sur le web.

    Args:
        query: Requete de recherche

    Returns:
        Resultats de recherche
    """
    # Implementation reelle avec API de recherche
    return f"Resultats pour '{query}': ..."

# Agent avec outils
agent = CodeAgent(
    tools=[get_weather, search_web],
    model=HfApiModel(),
)

result = agent.run("What's the weather like in Paris and find news about it?")
```

### Agent avec MCP Server

```python
from smolagents import CodeAgent, HfApiModel
from smolagents.mcp import MCPClient

# Connecter a un serveur MCP existant
mcp_client = MCPClient(
    server_command=["npx", "-y", "@modelcontextprotocol/server-filesystem", "/tmp"]
)

# Obtenir les outils du serveur MCP
mcp_tools = mcp_client.get_tools()

# Agent utilisant les outils MCP
agent = CodeAgent(
    tools=mcp_tools,
    model=HfApiModel(),
)

result = agent.run("List all files in the current directory")
```

### Multi-Agent System

```python
from smolagents import CodeAgent, HfApiModel, ManagedAgent

# Agent specialise recherche
research_agent = ManagedAgent(
    agent=CodeAgent(tools=[search_tool], model=HfApiModel()),
    name="researcher",
    description="Recherche des informations sur le web"
)

# Agent specialise analyse
analysis_agent = ManagedAgent(
    agent=CodeAgent(tools=[analyze_tool], model=HfApiModel()),
    name="analyst",
    description="Analyse des donnees et genere des rapports"
)

# Agent manager qui orchestre
manager = CodeAgent(
    tools=[],
    model=HfApiModel(),
    managed_agents=[research_agent, analysis_agent],
)

# Le manager delegue aux agents specialises
result = manager.run(
    "Research the latest AI trends and provide an analysis report"
)
```

### Execution Securisee (Sandbox)

```python
from smolagents import CodeAgent, HfApiModel
from smolagents.sandbox import E2BSandbox

# Sandbox E2B pour execution securisee
sandbox = E2BSandbox()

agent = CodeAgent(
    tools=[],
    model=HfApiModel(),
    sandbox=sandbox,  # Code execute dans sandbox isole
)

# Code potentiellement dangereux execute en securite
result = agent.run("Write and run a Python script that lists system info")
```

---

## 5. @HUGGINGFACE/MCP-CLIENT

### Installation

```bash
npm install @huggingface/mcp-client
```

### Client MCP Basique

```typescript
// src/lib/hf-mcp.ts
import { McpClient } from '@huggingface/mcp-client';

const client = new McpClient({
  provider: 'anthropic', // ou 'openai', 'huggingface'
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Connecter a un serveur MCP
await client.connect({
  command: 'npx',
  args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
});

// Lister les outils disponibles
const tools = await client.listTools();
console.log(tools);

// Executer un outil
const result = await client.callTool('read_file', {
  path: '/tmp/test.txt'
});
```

### Tiny Agent avec MCP

```typescript
import { Agent } from '@huggingface/mcp-client';

const agent = new Agent({
  provider: 'anthropic',
  model: 'claude-sonnet-4-20250514',
  apiKey: process.env.ANTHROPIC_API_KEY,
  servers: [
    {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '/workspace'],
    },
    {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-fetch'],
    },
  ],
});

// L'agent utilise automatiquement les outils MCP
const response = await agent.run(
  'Read the README.md file and summarize its contents'
);

console.log(response);
```

---

## 6. NEXT.JS FULL INTEGRATION

### Structure Projet

```
src/
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   ├── chat/route.ts          # Chat avec HF models
│   │   │   ├── image/route.ts         # Generation images
│   │   │   ├── embed/route.ts         # Embeddings
│   │   │   └── transcribe/route.ts    # Speech-to-text
│   │   └── ...
│   ├── ai-demo/
│   │   └── page.tsx                   # Demo page
│   └── ...
├── components/
│   ├── ai/
│   │   ├── ChatInterface.tsx
│   │   ├── ImageGenerator.tsx
│   │   ├── SentimentAnalyzer.tsx
│   │   └── AudioTranscriber.tsx
│   └── ...
├── lib/
│   ├── huggingface.ts                 # HF Inference client
│   └── transformers-client.ts         # Transformers.js utils
└── hooks/
    └── useTransformers.ts             # React hook
```

### API Route - Chat

```typescript
// src/app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HF_TOKEN);

export async function POST(req: NextRequest) {
  try {
    const { messages, model = 'meta-llama/Llama-3.2-3B-Instruct' } = await req.json();

    const response = await hf.chatCompletion({
      model,
      messages,
      max_tokens: 1000,
    });

    return NextResponse.json({
      content: response.choices[0].message.content,
      usage: response.usage,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
```

### API Route - Chat Streaming

```typescript
// src/app/api/ai/chat/stream/route.ts
import { NextRequest } from 'next/server';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HF_TOKEN);

export async function POST(req: NextRequest) {
  const { messages, model = 'meta-llama/Llama-3.2-3B-Instruct' } = await req.json();

  const stream = hf.chatCompletionStream({
    model,
    messages,
    max_tokens: 1000,
  });

  const encoder = new TextEncoder();

  return new Response(
    new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
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

### API Route - Image Generation

```typescript
// src/app/api/ai/image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HF_TOKEN);

export async function POST(req: NextRequest) {
  try {
    const { prompt, model = 'black-forest-labs/FLUX.1-schnell' } = await req.json();

    const imageBlob = await hf.textToImage({
      model,
      inputs: prompt,
      parameters: {
        guidance_scale: 7.5,
        num_inference_steps: 4, // schnell est rapide
      },
    });

    const buffer = await imageBlob.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    return NextResponse.json({
      image: `data:image/png;base64,${base64}`,
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
```

### Composant Chat Interface

```tsx
// src/components/ai/ChatInterface.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.content }
      ]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[600px] w-full max-w-2xl">
      <div className="p-4 border-b">
        <h2 className="font-semibold flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Chat (HuggingFace)
        </h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              {msg.role === 'assistant' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                </Avatar>
              )}
              <div
                className={`rounded-lg p-3 max-w-[80%] ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
```

### Composant Image Generator

```tsx
// src/components/ai/ImageGenerator.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ImageIcon, Download } from 'lucide-react';

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setImage(null);

    try {
      const response = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      setImage(data.image);
    } catch (error) {
      console.error('Image generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!image) return;
    const link = document.createElement('a');
    link.href = image;
    link.download = `generated-${Date.now()}.png`;
    link.click();
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          AI Image Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A futuristic city at sunset..."
            disabled={loading}
          />
          <Button onClick={generateImage} disabled={loading || !prompt.trim()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Generate'
            )}
          </Button>
        </div>

        {loading && (
          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Generating image...</p>
            </div>
          </div>
        )}

        {image && !loading && (
          <div className="relative">
            <img
              src={image}
              alt="Generated"
              className="w-full rounded-lg"
            />
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-2 right-2"
              onClick={downloadImage}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 7. MODELES RECOMMANDES

### Text Generation

| Modele | Taille | Speed | Quality | Use Case |
|--------|--------|-------|---------|----------|
| `meta-llama/Llama-3.2-3B-Instruct` | 3B | Fast | Good | Chat, general |
| `Qwen/Qwen2.5-Coder-32B-Instruct` | 32B | Medium | Excellent | Code generation |
| `mistralai/Mistral-7B-Instruct-v0.2` | 7B | Fast | Good | Balanced |
| `deepseek-ai/DeepSeek-R1` | Large | Slow | Best | Complex reasoning |

### Image Generation

| Modele | Speed | Quality | Style |
|--------|-------|---------|-------|
| `black-forest-labs/FLUX.1-schnell` | Very Fast | Good | Versatile |
| `black-forest-labs/FLUX.1-dev` | Medium | Excellent | Photorealistic |
| `stabilityai/stable-diffusion-xl-base-1.0` | Fast | Good | Artistic |

### Embeddings

| Modele | Dimensions | Speed | Use Case |
|--------|------------|-------|----------|
| `sentence-transformers/all-MiniLM-L6-v2` | 384 | Very Fast | General |
| `BAAI/bge-large-en-v1.5` | 1024 | Medium | High quality |
| `Xenova/all-MiniLM-L6-v2` | 384 | Browser | Client-side |

### Speech

| Modele | Task | Language |
|--------|------|----------|
| `openai/whisper-large-v3` | STT | Multilingual |
| `facebook/mms-tts-eng` | TTS | English |
| `facebook/mms-tts-fra` | TTS | French |

---

## 8. BEST PRACTICES

### Performance

1. **Singleton clients** - Eviter recreation HfInference
2. **Cache modeles Transformers.js** - `useBrowserCache: true`
3. **Streaming** - Pour UX reactive sur long responses
4. **Batch requests** - Grouper embeddings quand possible

### Security

1. **Server-side API calls** - Ne jamais exposer HF_TOKEN
2. **Rate limiting** - Proteger endpoints API
3. **Input validation** - Sanitizer prompts utilisateur
4. **Sandbox execution** - Pour smolagents en production

### Cost Optimization

1. **Modeles schnell/fast** - Pour prototypage
2. **Transformers.js** - Zero cost inference cote client
3. **Caching** - Mettre en cache resultats repetes
4. **Inference Providers** - Plus rapide/fiable que direct

---

## 9. INTEGRATION TRADING BRAIN

### Analyse Sentiment News

```typescript
// Analyser sentiment news financieres
const analyzeTradingNews = async (news: string[]) => {
  const hf = new HfInference(process.env.HF_TOKEN);

  const results = await Promise.all(
    news.map(async (headline) => {
      const sentiment = await hf.textClassification({
        model: 'ProsusAI/finbert',
        inputs: headline,
      });
      return {
        headline,
        sentiment: sentiment[0].label, // positive/negative/neutral
        confidence: sentiment[0].score,
      };
    })
  );

  return results;
};
```

### OCR Chart Pattern

```typescript
// Detecter patterns sur charts
const analyzeChart = async (chartImage: Blob) => {
  // Vision model pour decrire le chart
  const description = await hf.imageToText({
    model: 'Salesforce/blip-image-captioning-large',
    data: chartImage,
  });

  // Classification du pattern
  const pattern = await hf.zeroShotClassification({
    model: 'facebook/bart-large-mnli',
    inputs: description.generated_text,
    parameters: {
      candidate_labels: [
        'bullish trend',
        'bearish trend',
        'consolidation',
        'breakout',
        'support test',
        'resistance test'
      ]
    }
  });

  return {
    description: description.generated_text,
    pattern: pattern.labels[0],
    confidence: pattern.scores[0],
  };
};
```

---

## 10. TROUBLESHOOTING

### Token Rate Limits

```typescript
// Retry avec backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.status === 429 && i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

### Model Loading Lent

```typescript
// Preload modeles au demarrage
// src/app/layout.tsx
import { preloadModels } from '@/lib/transformers-client';

// Preload en background
if (typeof window !== 'undefined') {
  preloadModels(['sentiment-analysis', 'feature-extraction']);
}
```

### CORS Issues Transformers.js

```typescript
// Utiliser proxy pour modeles
env.remoteHost = '/api/hf-proxy';
env.remotePathTemplate = '{model}';
```

---

**"200k+ modeles ML a portee de main, du serveur au navigateur."**
