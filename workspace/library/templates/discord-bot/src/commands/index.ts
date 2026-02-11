import { client } from '../client.js'
import { pingCommand } from './ping.js'
import { helpCommand } from './help.js'
import { userinfoCommand } from './userinfo.js'
import { serverinfoCommand } from './serverinfo.js'

const commands = [
  pingCommand,
  helpCommand,
  userinfoCommand,
  serverinfoCommand,
]

export async function loadCommands() {
  for (const command of commands) {
    client.commands.set(command.data.name, command)
    console.log(`📦 Loaded command: ${command.data.name}`)
  }

  console.log(`✅ Loaded ${commands.length} commands`)
}

export { commands }
