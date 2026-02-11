import { SlashCommandBuilder, ChatInputCommandInteraction, ChannelType } from 'discord.js'
import { Command } from '../types/index.js'
import { createEmbed, Colors } from '../lib/utils.js'

export const serverinfoCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Get information about the server'),

  guildOnly: true,

  async execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild!

    // Fetch all members for accurate count
    await guild.members.fetch()

    const textChannels = guild.channels.cache.filter(
      (c) => c.type === ChannelType.GuildText
    ).size
    const voiceChannels = guild.channels.cache.filter(
      (c) => c.type === ChannelType.GuildVoice
    ).size
    const categories = guild.channels.cache.filter(
      (c) => c.type === ChannelType.GuildCategory
    ).size

    const onlineMembers = guild.members.cache.filter(
      (m) => m.presence?.status !== 'offline'
    ).size
    const botMembers = guild.members.cache.filter((m) => m.user.bot).size

    const embed = createEmbed({
      title: guild.name,
      thumbnail: guild.iconURL({ size: 256 }) ?? undefined,
      color: Colors.Primary,
      fields: [
        {
          name: '📋 General',
          value: [
            `**ID:** ${guild.id}`,
            `**Owner:** <@${guild.ownerId}>`,
            `**Created:** <t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
            `**Verification:** ${guild.verificationLevel}`,
          ].join('\n'),
          inline: true,
        },
        {
          name: '👥 Members',
          value: [
            `**Total:** ${guild.memberCount}`,
            `**Online:** ${onlineMembers}`,
            `**Humans:** ${guild.memberCount - botMembers}`,
            `**Bots:** ${botMembers}`,
          ].join('\n'),
          inline: true,
        },
        {
          name: '📺 Channels',
          value: [
            `**Categories:** ${categories}`,
            `**Text:** ${textChannels}`,
            `**Voice:** ${voiceChannels}`,
            `**Total:** ${guild.channels.cache.size}`,
          ].join('\n'),
          inline: true,
        },
        {
          name: '🎭 Other',
          value: [
            `**Roles:** ${guild.roles.cache.size}`,
            `**Emojis:** ${guild.emojis.cache.size}`,
            `**Stickers:** ${guild.stickers.cache.size}`,
            `**Boosts:** ${guild.premiumSubscriptionCount ?? 0}`,
          ].join('\n'),
          inline: true,
        },
      ],
      footer: `Requested by ${interaction.user.username}`,
    })

    if (guild.bannerURL()) {
      embed.setImage(guild.bannerURL({ size: 1024 })!)
    }

    await interaction.reply({ embeds: [embed] })
  },
}
