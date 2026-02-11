import { GuildMember, TextChannel } from 'discord.js'
import { Event } from '../types/index.js'
import { createEmbed, Colors } from '../lib/utils.js'
import { getOrCreateUser, getOrCreateGuild } from '../lib/database.js'

export const guildMemberAddEvent: Event = {
  name: 'guildMemberAdd',
  once: false,

  async execute(member: GuildMember) {
    console.log(`👋 ${member.user.tag} joined ${member.guild.name}`)

    // Create user in database
    await getOrCreateUser(member.id)
    const guildData = await getOrCreateGuild(member.guild.id)

    // Check if welcome channel is configured
    if (!guildData.welcomeChannel) return

    const channel = member.guild.channels.cache.get(guildData.welcomeChannel) as TextChannel
    if (!channel) return

    // Create welcome embed
    const embed = createEmbed({
      title: `Welcome to ${member.guild.name}! 🎉`,
      description: [
        `Hey ${member}, welcome to the server!`,
        '',
        `You're our **${member.guild.memberCount}th** member!`,
        '',
        '**Getting Started:**',
        '• Check out the rules channel',
        '• Introduce yourself',
        '• Use `/help` to see available commands',
      ].join('\n'),
      thumbnail: member.user.displayAvatarURL({ size: 256 }),
      color: Colors.Success,
      footer: `User ID: ${member.id}`,
    })

    // Add account age warning if new account
    const accountAge = Date.now() - member.user.createdTimestamp
    const sevenDays = 7 * 24 * 60 * 60 * 1000

    if (accountAge < sevenDays) {
      embed.addFields({
        name: '⚠️ New Account',
        value: `This account was created <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
        inline: false,
      })
    }

    try {
      await channel.send({ embeds: [embed] })
    } catch (error) {
      console.error(`Failed to send welcome message in ${member.guild.name}:`, error)
    }

    // Auto-role (if configured)
    // Uncomment and configure as needed:
    // const autoRoleId = 'YOUR_ROLE_ID'
    // try {
    //   await member.roles.add(autoRoleId)
    // } catch (error) {
    //   console.error('Failed to add auto-role:', error)
    // }
  },
}
