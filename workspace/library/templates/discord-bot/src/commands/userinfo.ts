import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from 'discord.js'
import { Command } from '../types/index.js'
import { createEmbed, Colors } from '../lib/utils.js'
import { getUserXp } from '../lib/database.js'

export const userinfoCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get information about a user')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to get info about')
        .setRequired(false)
    ),

  guildOnly: true,

  async execute(interaction: ChatInputCommandInteraction) {
    const targetUser = interaction.options.getUser('user') ?? interaction.user
    const member = interaction.guild?.members.cache.get(targetUser.id) as GuildMember | undefined

    // Get XP data from database
    const xpData = await getUserXp(targetUser.id)

    const embed = createEmbed({
      title: targetUser.displayName,
      thumbnail: targetUser.displayAvatarURL({ size: 256 }),
      color: member?.displayColor || Colors.Primary,
      fields: [
        {
          name: '👤 User',
          value: [
            `**Username:** ${targetUser.username}`,
            `**ID:** ${targetUser.id}`,
            `**Bot:** ${targetUser.bot ? 'Yes' : 'No'}`,
            `**Created:** <t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`,
          ].join('\n'),
          inline: true,
        },
        {
          name: '📊 Stats',
          value: [
            `**Level:** ${xpData.level}`,
            `**XP:** ${xpData.xp}`,
            `**Progress:** ${xpData.xp % 100}/100`,
          ].join('\n'),
          inline: true,
        },
      ],
    })

    if (member) {
      embed.addFields({
        name: '🏠 Server',
        value: [
          `**Nickname:** ${member.nickname ?? 'None'}`,
          `**Joined:** <t:${Math.floor((member.joinedTimestamp ?? 0) / 1000)}:R>`,
          `**Roles:** ${member.roles.cache.size - 1}`,
          `**Highest Role:** ${member.roles.highest.name}`,
        ].join('\n'),
        inline: false,
      })
    }

    await interaction.reply({ embeds: [embed] })
  },
}
