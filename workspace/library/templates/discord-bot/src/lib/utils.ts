import { EmbedBuilder, ColorResolvable, GuildMember, PermissionFlagsBits } from 'discord.js'

// Colors for embeds
export const Colors = {
  Primary: 0x5865f2,
  Success: 0x57f287,
  Warning: 0xfee75c,
  Error: 0xed4245,
  Info: 0x5865f2,
} as const

// Create a standard embed
export function createEmbed(options: {
  title?: string
  description?: string
  color?: ColorResolvable
  footer?: string
  thumbnail?: string
  image?: string
  fields?: { name: string; value: string; inline?: boolean }[]
}) {
  const embed = new EmbedBuilder()
    .setColor(options.color ?? Colors.Primary)
    .setTimestamp()

  if (options.title) embed.setTitle(options.title)
  if (options.description) embed.setDescription(options.description)
  if (options.footer) embed.setFooter({ text: options.footer })
  if (options.thumbnail) embed.setThumbnail(options.thumbnail)
  if (options.image) embed.setImage(options.image)
  if (options.fields) embed.addFields(options.fields)

  return embed
}

// Success embed
export function successEmbed(title: string, description?: string) {
  return createEmbed({
    title: `✅ ${title}`,
    description,
    color: Colors.Success,
  })
}

// Error embed
export function errorEmbed(title: string, description?: string) {
  return createEmbed({
    title: `❌ ${title}`,
    description,
    color: Colors.Error,
  })
}

// Warning embed
export function warningEmbed(title: string, description?: string) {
  return createEmbed({
    title: `⚠️ ${title}`,
    description,
    color: Colors.Warning,
  })
}

// Info embed
export function infoEmbed(title: string, description?: string) {
  return createEmbed({
    title: `ℹ️ ${title}`,
    description,
    color: Colors.Info,
  })
}

// Format milliseconds to human readable
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

// Check if member has permission
export function hasPermission(member: GuildMember, permission: bigint): boolean {
  return member.permissions.has(permission)
}

// Check if member is admin
export function isAdmin(member: GuildMember): boolean {
  return member.permissions.has(PermissionFlagsBits.Administrator)
}

// Check if member is moderator (kick + ban)
export function isModerator(member: GuildMember): boolean {
  return (
    member.permissions.has(PermissionFlagsBits.KickMembers) &&
    member.permissions.has(PermissionFlagsBits.BanMembers)
  )
}

// Truncate string
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length - 3) + '...'
}

// Random integer between min and max (inclusive)
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Sleep utility
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Parse duration string (e.g., "1d", "2h", "30m") to milliseconds
export function parseDuration(duration: string): number | null {
  const match = duration.match(/^(\d+)(s|m|h|d|w)$/)
  if (!match) return null

  const value = parseInt(match[1])
  const unit = match[2]

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
  }

  return value * multipliers[unit]
}
