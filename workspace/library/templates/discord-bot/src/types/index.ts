import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  ContextMenuCommandBuilder,
  UserContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction,
} from 'discord.js'

export interface Command {
  data:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
    | ContextMenuCommandBuilder
  cooldown?: number // in seconds
  guildOnly?: boolean
  ownerOnly?: boolean
  permissions?: bigint[]
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>
}

export interface UserContextCommand {
  data: ContextMenuCommandBuilder
  execute: (interaction: UserContextMenuCommandInteraction) => Promise<void>
}

export interface MessageContextCommand {
  data: ContextMenuCommandBuilder
  execute: (interaction: MessageContextMenuCommandInteraction) => Promise<void>
}

export interface Event {
  name: string
  once?: boolean
  execute: (...args: unknown[]) => Promise<void> | void
}

export interface CooldownInfo {
  command: string
  userId: string
  expiresAt: number
}
