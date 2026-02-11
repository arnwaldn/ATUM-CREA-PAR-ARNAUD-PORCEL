import { REST, Routes } from 'discord.js'
import { config } from 'dotenv'
import { commands } from './commands/index.js'

config()

const token = process.env.DISCORD_TOKEN
const clientId = process.env.DISCORD_CLIENT_ID
const guildId = process.env.DISCORD_GUILD_ID

if (!token || !clientId) {
  console.error('❌ Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in .env')
  process.exit(1)
}

const commandsData = commands.map((cmd) => cmd.data.toJSON())

const rest = new REST().setToken(token)

async function deployCommands() {
  try {
    console.log(`🔄 Started refreshing ${commandsData.length} application (/) commands.`)

    if (guildId) {
      // Guild-specific commands (instant update, for development)
      const data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: commandsData,
      })
      console.log(
        `✅ Successfully registered ${(data as unknown[]).length} guild commands.`
      )
      console.log(`📍 Guild ID: ${guildId}`)
    } else {
      // Global commands (can take up to 1 hour to propagate)
      const data = await rest.put(Routes.applicationCommands(clientId), {
        body: commandsData,
      })
      console.log(
        `✅ Successfully registered ${(data as unknown[]).length} global commands.`
      )
      console.log('⏰ Global commands may take up to 1 hour to appear.')
    }

    console.log('\n📝 Registered commands:')
    commandsData.forEach((cmd) => {
      console.log(`   /${cmd.name} - ${cmd.description}`)
    })
  } catch (error) {
    console.error('❌ Error deploying commands:', error)
    process.exit(1)
  }
}

// Run deployment
deployCommands()
