import { Message } from 'discord.js'
import { Event } from '../types/index.js'
import { addXp, getOrCreateUser } from '../lib/database.js'
import { createEmbed, Colors } from '../lib/utils.js'

// XP cooldown to prevent spam (60 seconds)
const xpCooldowns = new Map<string, number>()
const XP_COOLDOWN = 60 * 1000
const XP_PER_MESSAGE = { min: 15, max: 25 }
const XP_PER_LEVEL = 100

export const messageCreateEvent: Event = {
  name: 'messageCreate',
  once: false,

  async execute(message: Message) {
    // Ignore bots and DMs
    if (message.author.bot) return
    if (!message.guild) return

    // Handle XP system
    await handleXpGain(message)

    // Add custom message handlers here
    // Example: auto-responses, keyword triggers, etc.
  },
}

async function handleXpGain(message: Message) {
  const userId = message.author.id
  const now = Date.now()

  // Check cooldown
  const lastXp = xpCooldowns.get(userId) ?? 0
  if (now - lastXp < XP_COOLDOWN) return

  // Set cooldown
  xpCooldowns.set(userId, now)

  // Calculate random XP
  const xpGained =
    Math.floor(Math.random() * (XP_PER_MESSAGE.max - XP_PER_MESSAGE.min + 1)) +
    XP_PER_MESSAGE.min

  // Get current user data
  const userData = await getOrCreateUser(userId)
  const oldLevel = userData.level

  // Add XP
  const newData = await addXp(userId, xpGained)

  // Check for level up
  if (newData.level > oldLevel) {
    await sendLevelUpMessage(message, newData.level)
  }
}

async function sendLevelUpMessage(message: Message, newLevel: number) {
  const embed = createEmbed({
    title: '🎉 Level Up!',
    description: `Congratulations ${message.author}! You reached **Level ${newLevel}**!`,
    color: Colors.Success,
    thumbnail: message.author.displayAvatarURL({ size: 128 }),
  })

  // Add level rewards info
  const rewards = getLevelRewards(newLevel)
  if (rewards.length > 0) {
    embed.addFields({
      name: '🎁 Rewards Unlocked',
      value: rewards.join('\n'),
      inline: false,
    })
  }

  try {
    await message.channel.send({ embeds: [embed] })
  } catch (error) {
    console.error('Failed to send level up message:', error)
  }
}

function getLevelRewards(level: number): string[] {
  const rewards: string[] = []

  // Customize rewards based on level
  switch (level) {
    case 5:
      rewards.push('• Custom nickname color')
      break
    case 10:
      rewards.push('• Access to exclusive channels')
      break
    case 25:
      rewards.push('• VIP role')
      break
    case 50:
      rewards.push('• Legendary status')
      break
  }

  return rewards
}
