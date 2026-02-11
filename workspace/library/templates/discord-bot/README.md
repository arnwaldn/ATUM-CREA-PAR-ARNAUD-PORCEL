# Discord Bot Template

Modern Discord bot template with TypeScript, discord.js v14, and Prisma.

## Features

- **discord.js v14** - Latest Discord API with slash commands
- **TypeScript** - Full type safety with strict mode
- **Prisma ORM** - Type-safe database with SQLite (easily switchable)
- **Slash Commands** - Modern Discord interactions
- **Event System** - Modular event handlers
- **XP/Leveling** - Built-in user progression system
- **Cooldowns** - Command rate limiting
- **Docker Ready** - Production containerization

## Quick Start

### Prerequisites

- Node.js 20+
- Discord Application ([Create one here](https://discord.com/developers/applications))

### Setup

1. **Clone and install**:
```bash
cd discord-bot
npm install
```

2. **Configure environment**:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id
DISCORD_GUILD_ID=your_test_server_id  # Optional, for dev
```

3. **Setup database**:
```bash
npx prisma generate
npx prisma db push
```

4. **Deploy commands**:
```bash
npm run deploy
```

5. **Start the bot**:
```bash
npm run dev
```

## Commands

| Command | Description |
|---------|-------------|
| `/ping` | Check bot latency |
| `/help [command]` | Show all commands or command details |
| `/userinfo [user]` | Display user information |
| `/serverinfo` | Display server information |

## Project Structure

```
src/
├── index.ts          # Entry point
├── client.ts         # Discord client setup
├── deploy-commands.ts # Slash command deployment
├── commands/         # Slash commands
│   ├── index.ts      # Command loader
│   ├── ping.ts
│   ├── help.ts
│   ├── userinfo.ts
│   └── serverinfo.ts
├── events/           # Event handlers
│   ├── index.ts      # Event loader
│   ├── ready.ts
│   ├── interactionCreate.ts
│   ├── guildMemberAdd.ts
│   └── messageCreate.ts
├── lib/
│   ├── database.ts   # Prisma helpers
│   └── utils.ts      # Utilities
└── types/
    └── index.ts      # Type definitions

prisma/
└── schema.prisma     # Database schema
```

## Adding Commands

1. Create a new file in `src/commands/`:

```typescript
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { Command } from '../types/index.js'

export const myCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('mycommand')
    .setDescription('My custom command'),

  cooldown: 5, // Optional: seconds
  guildOnly: true, // Optional: server only

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply('Hello!')
  },
}
```

2. Add to `src/commands/index.ts`:

```typescript
import { myCommand } from './mycommand.js'

const commands = [
  // ... existing commands
  myCommand,
]
```

3. Deploy: `npm run deploy`

## Adding Events

1. Create a new file in `src/events/`:

```typescript
import { Event } from '../types/index.js'

export const myEvent: Event = {
  name: 'eventName',
  once: false, // true = run once, false = run every time

  async execute(...args) {
    // Handle event
  },
}
```

2. Add to `src/events/index.ts`

## Database

### Models

- **User** - Discord users with XP/level tracking
- **Guild** - Server configurations
- **Warning** - User moderation warnings
- **Note** - User notes for moderators

### Switch Database

Edit `prisma/schema.prisma`:

```prisma
// PostgreSQL
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// MySQL
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

Then run:
```bash
npx prisma generate
npx prisma db push
```

## Docker Deployment

```bash
# Build
docker build -t discord-bot .

# Run
docker run -d \
  --name my-discord-bot \
  --env-file .env \
  -v ./data:/app/data \
  discord-bot
```

### Docker Compose

```yaml
version: '3.8'
services:
  bot:
    build: .
    restart: unless-stopped
    env_file: .env
    volumes:
      - ./data:/app/data
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Production start |
| `npm run deploy` | Deploy slash commands |
| `npm run db:push` | Sync database schema |
| `npm run db:studio` | Open Prisma Studio |

## Bot Permissions

Required permissions for full functionality:

- Send Messages
- Embed Links
- Read Message History
- Use Application Commands
- Manage Roles (for auto-roles)
- Kick/Ban Members (for moderation)

### Invite URL

```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DISCORD_TOKEN` | ✅ | Bot token from Discord Developer Portal |
| `DISCORD_CLIENT_ID` | ✅ | Application ID |
| `DISCORD_GUILD_ID` | ❌ | Test server ID (faster command updates) |
| `DATABASE_URL` | ❌ | Database connection (default: SQLite) |

## Resources

- [discord.js Documentation](https://discord.js.org/)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Discord API Documentation](https://discord.com/developers/docs)

## License

MIT
