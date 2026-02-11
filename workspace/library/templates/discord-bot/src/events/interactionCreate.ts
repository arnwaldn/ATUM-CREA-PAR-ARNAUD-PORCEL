import {
  ChatInputCommandInteraction,
  Interaction,
  StringSelectMenuInteraction,
} from 'discord.js'
import { Event } from '../types/index.js'
import { client } from '../client.js'
import { createEmbed, Colors } from '../lib/utils.js'

// Track cooldowns
const cooldowns = new Map<string, Map<string, number>>()

export const interactionCreateEvent: Event = {
  name: 'interactionCreate',
  once: false,

  async execute(interaction: Interaction) {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      await handleCommand(interaction)
      return
    }

    // Handle select menus
    if (interaction.isStringSelectMenu()) {
      await handleSelectMenu(interaction)
      return
    }

    // Handle buttons
    if (interaction.isButton()) {
      // Add button handling here
      return
    }
  },
}

async function handleCommand(interaction: ChatInputCommandInteraction) {
  const command = client.commands.get(interaction.commandName)

  if (!command) {
    await interaction.reply({
      content: '❌ This command no longer exists.',
      ephemeral: true,
    })
    return
  }

  // Check if command is guild-only
  if (command.guildOnly && !interaction.guild) {
    await interaction.reply({
      content: '❌ This command can only be used in a server.',
      ephemeral: true,
    })
    return
  }

  // Check cooldown
  if (command.cooldown) {
    const cooldownKey = `${interaction.commandName}-${interaction.user.id}`

    if (!cooldowns.has(interaction.commandName)) {
      cooldowns.set(interaction.commandName, new Map())
    }

    const timestamps = cooldowns.get(interaction.commandName)!
    const cooldownAmount = command.cooldown * 1000

    if (timestamps.has(interaction.user.id)) {
      const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount

      if (Date.now() < expirationTime) {
        const timeLeft = (expirationTime - Date.now()) / 1000
        await interaction.reply({
          content: `⏰ Please wait ${timeLeft.toFixed(1)} seconds before using \`/${command.data.name}\` again.`,
          ephemeral: true,
        })
        return
      }
    }

    timestamps.set(interaction.user.id, Date.now())
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount)
  }

  // Execute command
  try {
    await command.execute(interaction)
    console.log(
      `📝 ${interaction.user.tag} used /${interaction.commandName} in ${interaction.guild?.name ?? 'DM'}`
    )
  } catch (error) {
    console.error(`Error executing /${interaction.commandName}:`, error)

    const errorMessage = {
      content: '❌ An error occurred while executing this command.',
      ephemeral: true,
    }

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage)
    } else {
      await interaction.reply(errorMessage)
    }
  }
}

async function handleSelectMenu(interaction: StringSelectMenuInteraction) {
  // Handle help command select menu
  if (interaction.customId === 'help-select') {
    const commandName = interaction.values[0]
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

    await interaction.reply({ embeds: [embed], ephemeral: true })
    return
  }

  // Add more select menu handlers here
}
