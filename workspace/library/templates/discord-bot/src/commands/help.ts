import { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js'
import { Command } from '../types/index.js'
import { createEmbed, Colors } from '../lib/utils.js'
import { client } from '../client.js'

export const helpCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands')
    .addStringOption((option) =>
      option
        .setName('command')
        .setDescription('Get help for a specific command')
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const commandName = interaction.options.getString('command')

    if (commandName) {
      // Show help for specific command
      const command = client.commands.get(commandName)

      if (!command) {
        await interaction.reply({
          content: `❌ Command \`${commandName}\` not found.`,
          ephemeral: true,
        })
        return
      }

      const embed = createEmbed({
        title: `📖 /${command.data.name}`,
        description: command.data.description,
        color: Colors.Primary,
        fields: [
          {
            name: 'Cooldown',
            value: command.cooldown ? `${command.cooldown} seconds` : 'None',
            inline: true,
          },
          {
            name: 'Guild Only',
            value: command.guildOnly ? 'Yes' : 'No',
            inline: true,
          },
        ],
      })

      await interaction.reply({ embeds: [embed] })
      return
    }

    // Show all commands
    const commands = [...client.commands.values()]

    const embed = createEmbed({
      title: '📚 Bot Commands',
      description: `Use \`/help <command>\` for more info on a specific command.\n\n${commands
        .map((cmd) => `**/${cmd.data.name}** - ${cmd.data.description}`)
        .join('\n')}`,
      color: Colors.Primary,
      footer: `${commands.length} commands available`,
    })

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('help-select')
        .setPlaceholder('Select a command for more info')
        .addOptions(
          commands.slice(0, 25).map((cmd) =>
            new StringSelectMenuOptionBuilder()
              .setLabel(`/${cmd.data.name}`)
              .setDescription(cmd.data.description.slice(0, 100))
              .setValue(cmd.data.name)
          )
        )
    )

    await interaction.reply({
      embeds: [embed],
      components: [row],
    })
  },
}
