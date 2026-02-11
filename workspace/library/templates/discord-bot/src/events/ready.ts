import { ActivityType, Client } from 'discord.js'
import { Event } from '../types/index.js'

export const readyEvent: Event = {
  name: 'ready',
  once: true,

  async execute(client: Client<true>) {
    console.log(`\n🤖 Logged in as ${client.user.tag}`)
    console.log(`📊 Serving ${client.guilds.cache.size} servers`)
    console.log(`👥 ${client.users.cache.size} users cached`)
    console.log(`📅 Started at ${new Date().toLocaleString()}`)
    console.log('─'.repeat(40))

    // Set bot status
    client.user.setPresence({
      status: 'online',
      activities: [
        {
          name: '/help',
          type: ActivityType.Listening,
        },
      ],
    })

    // Rotate status every 30 seconds
    const statuses = [
      { name: '/help', type: ActivityType.Listening },
      { name: `${client.guilds.cache.size} servers`, type: ActivityType.Watching },
      { name: `${client.users.cache.size} users`, type: ActivityType.Watching },
    ]

    let currentStatus = 0
    setInterval(() => {
      currentStatus = (currentStatus + 1) % statuses.length
      client.user.setActivity(statuses[currentStatus].name, {
        type: statuses[currentStatus].type,
      })
    }, 30000)
  },
}
