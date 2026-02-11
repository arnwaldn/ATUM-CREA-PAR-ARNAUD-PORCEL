import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js'
import type { Command } from './types/index.js'

// Create Discord client with required intents
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember,
  ],
})

// Extend client with commands collection
declare module 'discord.js' {
  interface Client {
    commands: Collection<string, Command>
  }
}

client.commands = new Collection()
