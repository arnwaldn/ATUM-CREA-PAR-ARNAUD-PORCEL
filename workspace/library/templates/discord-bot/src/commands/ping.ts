import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { Command } from '../types/index.js'
import { successEmbed } from '../lib/utils.js'

export const pingCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency and response time'),

  cooldown: 5,

  async execute(interaction: ChatInputCommandInteraction) {
    const sent = await interaction.deferReply({ fetchReply: true })

    const roundtrip = sent.createdTimestamp - interaction.createdTimestamp
    const wsLatency = interaction.client.ws.ping

    const embed = successEmbed('Pong!', [
      `📡 **Roundtrip:** ${roundtrip}ms`,
      `💓 **WebSocket:** ${wsLatency}ms`,
      `⏱️ **Uptime:** ${formatUptime(interaction.client.uptime ?? 0)}`,
    ].join('\n'))

    await interaction.editReply({ embeds: [embed] })
  },
}

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}
