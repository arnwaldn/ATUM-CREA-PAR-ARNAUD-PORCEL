# {{APP_NAME}} - AI Assistant

A modern AI chat assistant built with Next.js 15, Claude API, and Vercel AI SDK with tool use support.

## Features

- **Claude Integration** - Claude claude-sonnet-4-20250514 or Opus via Anthropic API
- **Tool Use** - Custom tools for enhanced capabilities
- **Streaming** - Real-time streaming responses
- **Chat History** - Persistent conversation history
- **Modern UI** - Clean interface with shadcn/ui components
- **Dark Mode** - Automatic theme support

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI**: Anthropic Claude API, Vercel AI SDK
- **UI**: TailwindCSS 4, shadcn/ui
- **State**: React hooks
- **Language**: TypeScript

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

```bash
cp .env.example .env.local
```

Add your Anthropic API key to `.env.local`.

### 3. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts       # Chat API endpoint
│   ├── layout.tsx
│   ├── page.tsx               # Main chat page
│   └── globals.css
├── components/
│   ├── chat-interface.tsx     # Main chat UI
│   ├── message-list.tsx       # Message display
│   ├── chat-input.tsx         # Message input
│   └── tool-result.tsx        # Tool result display
├── lib/
│   ├── anthropic.ts           # Claude client
│   └── utils.ts
└── tools/
    ├── index.ts               # Tool definitions
    ├── weather.ts             # Weather tool
    └── search.ts              # Search tool
```

## Adding Custom Tools

Define tools in `src/tools/`:

```typescript
// src/tools/my-tool.ts
import { tool } from 'ai';
import { z } from 'zod';

export const myTool = tool({
  description: 'Description of what the tool does',
  parameters: z.object({
    param1: z.string().describe('Parameter description'),
  }),
  execute: async ({ param1 }) => {
    // Tool implementation
    return { result: 'Tool result' };
  },
});
```

Register in `src/tools/index.ts`:

```typescript
export const tools = {
  myTool,
  // ... other tools
};
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `NEXT_PUBLIC_APP_NAME` | Application name |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Send message and get AI response |

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

### Docker

```bash
docker build -t {{APP_NAME}} .
docker run -p 3000:3000 -e ANTHROPIC_API_KEY=your_key {{APP_NAME}}
```

## License

MIT
