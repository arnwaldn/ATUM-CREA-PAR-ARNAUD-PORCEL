import { client } from '../client.js'
import { readyEvent } from './ready.js'
import { interactionCreateEvent } from './interactionCreate.js'
import { guildMemberAddEvent } from './guildMemberAdd.js'
import { messageCreateEvent } from './messageCreate.js'

const events = [
  readyEvent,
  interactionCreateEvent,
  guildMemberAddEvent,
  messageCreateEvent,
]

export async function loadEvents() {
  for (const event of events) {
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args))
    } else {
      client.on(event.name, (...args) => event.execute(...args))
    }
    console.log(`🎧 Loaded event: ${event.name}`)
  }

  console.log(`✅ Loaded ${events.length} events`)
}

export { events }
