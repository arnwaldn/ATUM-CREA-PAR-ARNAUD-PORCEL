import { PrismaClient } from '@prisma/client'

// Prevent multiple instances of Prisma Client in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const db = globalThis.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db
}

// User helpers
export async function getOrCreateUser(userId: string, username: string) {
  return db.user.upsert({
    where: { id: userId },
    update: { username },
    create: { id: userId, username },
  })
}

export async function getUserXp(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true },
  })
  return user ?? { xp: 0, level: 1 }
}

export async function addXp(userId: string, username: string, amount: number) {
  const user = await getOrCreateUser(userId, username)
  const newXp = user.xp + amount

  // Calculate new level (100 XP per level)
  const newLevel = Math.floor(newXp / 100) + 1
  const leveledUp = newLevel > user.level

  await db.user.update({
    where: { id: userId },
    data: { xp: newXp, level: newLevel },
  })

  return { newXp, newLevel, leveledUp }
}

// Guild helpers
export async function getOrCreateGuild(guildId: string, name: string) {
  return db.guild.upsert({
    where: { id: guildId },
    update: { name },
    create: { id: guildId, name },
  })
}

export async function getGuildSettings(guildId: string) {
  return db.guild.findUnique({
    where: { id: guildId },
  })
}

export async function updateGuildSettings(
  guildId: string,
  settings: { prefix?: string; welcomeChannel?: string; logsChannel?: string }
) {
  return db.guild.update({
    where: { id: guildId },
    data: settings,
  })
}

// Warning helpers
export async function addWarning(
  userId: string,
  guildId: string,
  moderatorId: string,
  reason: string
) {
  return db.warning.create({
    data: {
      userId,
      guildId,
      moderatorId,
      reason,
    },
  })
}

export async function getUserWarnings(userId: string, guildId: string) {
  return db.warning.findMany({
    where: { userId, guildId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function clearWarnings(userId: string, guildId: string) {
  return db.warning.deleteMany({
    where: { userId, guildId },
  })
}
