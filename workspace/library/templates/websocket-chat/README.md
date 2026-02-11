# {{APP_NAME}} - Real-time Chat

A modern real-time chat application built with Next.js 15, Supabase Realtime, and Prisma.

## Features

- 💬 **Real-time messaging** - Instant message delivery via Supabase Realtime
- ✍️ **Typing indicators** - See when others are typing
- 👥 **Presence system** - Online/offline status for users
- 📺 **Channels** - Organize conversations by topic
- 🎨 **Modern UI** - Clean interface with dark mode support
- 📱 **Responsive** - Works on desktop and mobile

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: TailwindCSS 4, shadcn/ui components
- **Database**: PostgreSQL via Prisma
- **Realtime**: Supabase Realtime (WebSocket)
- **State**: Zustand
- **Language**: TypeScript

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
```

Edit `.env` with your database and Supabase credentials.

### 3. Set up database

```bash
npx prisma generate
npx prisma db push
```

### 4. Seed initial data (optional)

```bash
npx prisma db seed
```

### 5. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy the URL and anon key to your `.env`
4. Enable Realtime in Database > Replication for the `messages` table

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── channels/     # Channel CRUD
│   │   └── messages/     # Message CRUD
│   ├── layout.tsx
│   ├── page.tsx          # Main chat page
│   └── globals.css
├── components/
│   ├── chat-sidebar.tsx  # Channel list & users
│   ├── chat-messages.tsx # Message display
│   └── chat-input.tsx    # Message composer
└── lib/
    ├── prisma.ts         # Prisma client
    ├── supabase.ts       # Supabase client
    ├── store.ts          # Zustand store
    ├── use-realtime.ts   # Realtime hook
    └── utils.ts          # Utilities
```

## Database Schema

```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String?
  avatar    String?
  messages  Message[]
  channels  ChannelMember[]
}

model Channel {
  id          String          @id @default(cuid())
  name        String
  description String?
  isPrivate   Boolean         @default(false)
  messages    Message[]
  members     ChannelMember[]
}

model Message {
  id        String   @id @default(cuid())
  content   String
  channelId String
  userId    String
  createdAt DateTime @default(now())
}
```

## Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

### Docker

```bash
docker build -t {{APP_NAME}} .
docker run -p 3000:3000 {{APP_NAME}}
```

## License

MIT
