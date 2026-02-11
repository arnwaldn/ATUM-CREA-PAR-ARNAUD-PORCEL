import 'dotenv/config'
import { client } from './client.js'
import { loadCommands } from './commands/index.js'
import { loadEvents } from './events/index.js'
import { db } from './lib/database.js'

async function main() {
  console.log('🤖 Starting Discord Bot...')

  // Load commands and events
  await loadCommands()
  await loadEvents()

  // Connect to database
  await db.$connect()
  console.log('✅ Database connected')

  // Login to Discord
  const token = process.env.DISCORD_TOKEN
  if (!token) {
    throw new Error('DISCORD_TOKEN is not defined in environment variables')
  }

  await client.login(token)
}

main().catch((error) => {
  console.error('❌ Failed to start bot:', error)
  process.exit(1)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...')
  await db.$disconnect()
  client.destroy()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down...')
  await db.$disconnect()
  client.destroy()
  process.exit(0)
})
