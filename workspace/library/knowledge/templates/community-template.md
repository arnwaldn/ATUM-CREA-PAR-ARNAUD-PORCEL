# Template: Community Platform

## Overview

Template complet pour créer une plateforme communautaire avec forums, discussions en temps réel, gamification, modération, et analytics.

---

## STACK TECHNIQUE

| Couche | Technologie | Raison |
|--------|-------------|--------|
| **Framework** | Next.js 15 (App Router) | SSR, RSC, API Routes |
| **Auth** | Clerk | Social login, moderation |
| **Database** | Supabase (PostgreSQL) | Realtime subscriptions |
| **Realtime** | Supabase Realtime | Live updates |
| **ORM** | Prisma | Type-safe queries |
| **Storage** | Supabase Storage | User avatars, attachments |
| **UI** | shadcn/ui + TailwindCSS | Composants accessibles |
| **Rich Text** | Tiptap | WYSIWYG editor |
| **Notifications** | Knock / Novu | Multi-channel |

---

## ARCHITECTURE COMMUNITY

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMMUNITY PLATFORM                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         CONTENT LAYER                                │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │    FORUMS    │  │  DISCUSSIONS │  │    POSTS     │               │   │
│  │  │              │  │              │  │              │               │   │
│  │  │ • Categories │  │ • Threads    │  │ • Articles   │               │   │
│  │  │ • Topics     │  │ • Replies    │  │ • Questions  │               │   │
│  │  │ • Pinned     │  │ • Realtime   │  │ • Answers    │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         USER ENGAGEMENT                              │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │ GAMIFICATION │  │    SOCIAL    │  │NOTIFICATIONS │               │   │
│  │  │              │  │              │  │              │               │   │
│  │  │ • Points     │  │ • Following  │  │ • In-app     │               │   │
│  │  │ • Badges     │  │ • Mentions   │  │ • Email      │               │   │
│  │  │ • Levels     │  │ • DMs        │  │ • Push       │               │   │
│  │  │ • Leaderboard│  │ • Groups     │  │ • Digest     │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         MODERATION                                   │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │    ROLES     │  │   REPORTS    │  │     TOOLS    │               │   │
│  │  │              │  │              │  │              │               │   │
│  │  │ • Admin      │  │ • Flag       │  │ • Ban        │               │   │
│  │  │ • Moderator  │  │ • Review     │  │ • Mute       │               │   │
│  │  │ • Member     │  │ • Action     │  │ • Delete     │               │   │
│  │  │ • Guest      │  │ • Appeal     │  │ • Lock       │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## STRUCTURE PROJET

```
my-community/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   │
│   │   ├── (community)/
│   │   │   ├── page.tsx                     # Homepage/feed
│   │   │   ├── forums/
│   │   │   │   ├── page.tsx                 # Forum list
│   │   │   │   └── [slug]/
│   │   │   │       ├── page.tsx             # Forum threads
│   │   │   │       └── [threadId]/page.tsx  # Thread detail
│   │   │   ├── discussions/
│   │   │   │   ├── page.tsx                 # All discussions
│   │   │   │   ├── new/page.tsx             # New discussion
│   │   │   │   └── [id]/page.tsx            # Discussion detail
│   │   │   ├── questions/
│   │   │   │   ├── page.tsx                 # Q&A section
│   │   │   │   ├── ask/page.tsx             # Ask question
│   │   │   │   └── [id]/page.tsx            # Question detail
│   │   │   ├── members/
│   │   │   │   ├── page.tsx                 # Member directory
│   │   │   │   └── [username]/page.tsx      # Profile
│   │   │   ├── groups/
│   │   │   │   ├── page.tsx                 # Groups list
│   │   │   │   ├── create/page.tsx          # Create group
│   │   │   │   └── [slug]/page.tsx          # Group detail
│   │   │   ├── leaderboard/page.tsx         # Leaderboard
│   │   │   └── search/page.tsx              # Search
│   │   │
│   │   ├── (user)/
│   │   │   ├── settings/page.tsx            # User settings
│   │   │   ├── notifications/page.tsx       # Notifications
│   │   │   └── messages/
│   │   │       ├── page.tsx                 # Inbox
│   │   │       └── [conversationId]/page.tsx
│   │   │
│   │   ├── (moderation)/
│   │   │   ├── mod/
│   │   │   │   ├── dashboard/page.tsx       # Mod dashboard
│   │   │   │   ├── queue/page.tsx           # Moderation queue
│   │   │   │   ├── reports/page.tsx         # Reports
│   │   │   │   └── logs/page.tsx            # Action logs
│   │   │
│   │   ├── (admin)/
│   │   │   ├── admin/
│   │   │   │   ├── dashboard/page.tsx       # Admin dashboard
│   │   │   │   ├── analytics/page.tsx       # Analytics
│   │   │   │   ├── users/page.tsx           # User management
│   │   │   │   ├── forums/page.tsx          # Forum settings
│   │   │   │   └── settings/page.tsx        # Platform settings
│   │   │
│   │   ├── api/
│   │   │   ├── posts/route.ts
│   │   │   ├── comments/route.ts
│   │   │   ├── reactions/route.ts
│   │   │   ├── notifications/route.ts
│   │   │   └── moderation/route.ts
│   │   │
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── feed/
│   │   │   ├── post-card.tsx
│   │   │   ├── post-form.tsx
│   │   │   └── infinite-feed.tsx
│   │   ├── forum/
│   │   │   ├── thread-list.tsx
│   │   │   ├── thread-card.tsx
│   │   │   └── reply-form.tsx
│   │   ├── editor/
│   │   │   ├── rich-text-editor.tsx
│   │   │   └── mention-plugin.tsx
│   │   ├── gamification/
│   │   │   ├── badge.tsx
│   │   │   ├── points-display.tsx
│   │   │   ├── level-progress.tsx
│   │   │   └── leaderboard-table.tsx
│   │   ├── social/
│   │   │   ├── user-avatar.tsx
│   │   │   ├── follow-button.tsx
│   │   │   └── reaction-buttons.tsx
│   │   ├── moderation/
│   │   │   ├── report-button.tsx
│   │   │   ├── mod-actions.tsx
│   │   │   └── report-card.tsx
│   │   └── ui/
│   │
│   └── lib/
│       ├── supabase-realtime.ts
│       ├── gamification.ts
│       ├── notifications.ts
│       └── moderation.ts
│
├── prisma/
│   └── schema.prisma
└── ...
```

---

## MODÈLES DE DONNÉES

```prisma
// prisma/schema.prisma

model User {
  id          String   @id // Clerk user ID
  username    String   @unique
  email       String   @unique
  displayName String?
  bio         String?
  avatarUrl   String?
  coverUrl    String?

  // Gamification
  points      Int      @default(0)
  level       Int      @default(1)
  badges      UserBadge[]

  // Status
  role        UserRole @default(MEMBER)
  status      UserStatus @default(ACTIVE)
  isBanned    Boolean  @default(false)
  banReason   String?
  banExpiresAt DateTime?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  posts       Post[]
  comments    Comment[]
  reactions   Reaction[]
  following   Follow[]  @relation("Following")
  followers   Follow[]  @relation("Followers")
  sentMessages Message[] @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
  notifications Notification[]
  reports     Report[]  @relation("Reporter")
  modActions  ModAction[]

  @@map("users")
}

enum UserRole {
  GUEST
  MEMBER
  MODERATOR
  ADMIN
  SUPER_ADMIN
}

enum UserStatus {
  ACTIVE
  MUTED
  SUSPENDED
  BANNED
}

// Forum Category
model ForumCategory {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  icon        String?
  color       String?
  order       Int      @default(0)

  parentId    String?
  parent      ForumCategory? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    ForumCategory[] @relation("CategoryHierarchy")

  forums      Forum[]

  @@map("forum_categories")
}

// Forum
model Forum {
  id          String   @id @default(cuid())
  categoryId  String
  category    ForumCategory @relation(fields: [categoryId], references: [id])

  name        String
  slug        String   @unique
  description String?
  icon        String?

  // Settings
  isPrivate   Boolean  @default(false)
  isLocked    Boolean  @default(false)
  requireApproval Boolean @default(false)

  // Stats
  threadCount Int      @default(0)
  postCount   Int      @default(0)
  lastPostAt  DateTime?

  threads     Thread[]

  @@map("forums")
}

// Thread
model Thread {
  id          String   @id @default(cuid())
  forumId     String
  forum       Forum    @relation(fields: [forumId], references: [id])
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])

  title       String
  slug        String
  content     String   @db.Text

  // Status
  isPinned    Boolean  @default(false)
  isLocked    Boolean  @default(false)
  isAnswered  Boolean  @default(false) // For Q&A

  // Stats
  viewCount   Int      @default(0)
  replyCount  Int      @default(0)
  lastReplyAt DateTime?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  replies     Reply[]

  @@unique([forumId, slug])
  @@map("threads")
}

// Reply
model Reply {
  id          String   @id @default(cuid())
  threadId    String
  thread      Thread   @relation(fields: [threadId], references: [id])
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])

  content     String   @db.Text
  isAccepted  Boolean  @default(false) // For Q&A

  // Nested replies
  parentId    String?
  parent      Reply?   @relation("ReplyHierarchy", fields: [parentId], references: [id])
  children    Reply[]  @relation("ReplyHierarchy")

  reactions   Reaction[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("replies")
}

// Post (for feed/discussions)
model Post {
  id          String   @id @default(cuid())
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])

  type        PostType @default(DISCUSSION)
  title       String?
  content     String   @db.Text
  images      String[]
  tags        String[]

  // Status
  isPinned    Boolean  @default(false)
  isLocked    Boolean  @default(false)

  // Stats
  viewCount   Int      @default(0)
  commentCount Int     @default(0)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  comments    Comment[]
  reactions   Reaction[]

  @@map("posts")
}

enum PostType {
  DISCUSSION
  QUESTION
  ANNOUNCEMENT
  POLL
}

// Comment
model Comment {
  id          String   @id @default(cuid())
  postId      String
  post        Post     @relation(fields: [postId], references: [id])
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])

  content     String   @db.Text

  // Nested
  parentId    String?
  parent      Comment? @relation("CommentHierarchy", fields: [parentId], references: [id])
  children    Comment[] @relation("CommentHierarchy")

  reactions   Reaction[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("comments")
}

// Reactions
model Reaction {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])

  type        ReactionType

  // Polymorphic relation
  postId      String?
  post        Post?    @relation(fields: [postId], references: [id])
  commentId   String?
  comment     Comment? @relation(fields: [commentId], references: [id])
  replyId     String?
  reply       Reply?   @relation(fields: [replyId], references: [id])

  createdAt   DateTime @default(now())

  @@unique([userId, postId])
  @@unique([userId, commentId])
  @@unique([userId, replyId])
  @@map("reactions")
}

enum ReactionType {
  LIKE
  LOVE
  HELPFUL
  INSIGHTFUL
  FUNNY
}

// Follow
model Follow {
  id          String   @id @default(cuid())
  followerId  String
  follower    User     @relation("Following", fields: [followerId], references: [id])
  followingId String
  following   User     @relation("Followers", fields: [followingId], references: [id])

  createdAt   DateTime @default(now())

  @@unique([followerId, followingId])
  @@map("follows")
}

// Badges
model Badge {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String
  icon        String
  color       String
  requirement String   // JSON description of how to earn

  users       UserBadge[]

  @@map("badges")
}

model UserBadge {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  badgeId     String
  badge       Badge    @relation(fields: [badgeId], references: [id])

  earnedAt    DateTime @default(now())

  @@unique([userId, badgeId])
  @@map("user_badges")
}

// Notifications
model Notification {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])

  type        NotificationType
  title       String
  content     String
  link        String?
  data        Json?

  isRead      Boolean  @default(false)
  readAt      DateTime?

  createdAt   DateTime @default(now())

  @@map("notifications")
}

enum NotificationType {
  NEW_FOLLOWER
  MENTION
  REPLY
  REACTION
  BADGE_EARNED
  LEVEL_UP
  POST_APPROVED
  REPORT_RESOLVED
}

// Moderation
model Report {
  id          String   @id @default(cuid())
  reporterId  String
  reporter    User     @relation("Reporter", fields: [reporterId], references: [id])

  reason      ReportReason
  description String?

  // Target (polymorphic)
  targetType  String
  targetId    String

  status      ReportStatus @default(PENDING)
  resolution  String?
  resolvedBy  String?
  resolvedAt  DateTime?

  createdAt   DateTime @default(now())

  @@map("reports")
}

enum ReportReason {
  SPAM
  HARASSMENT
  HATE_SPEECH
  VIOLENCE
  MISINFORMATION
  INAPPROPRIATE
  COPYRIGHT
  OTHER
}

enum ReportStatus {
  PENDING
  REVIEWING
  RESOLVED
  DISMISSED
}

model ModAction {
  id          String   @id @default(cuid())
  moderatorId String
  moderator   User     @relation(fields: [moderatorId], references: [id])

  action      ModActionType
  reason      String?
  targetType  String
  targetId    String

  createdAt   DateTime @default(now())

  @@map("mod_actions")
}

enum ModActionType {
  WARN
  MUTE
  BAN
  UNBAN
  DELETE_POST
  DELETE_COMMENT
  LOCK_THREAD
  PIN_POST
  EDIT_CONTENT
}
```

---

## REALTIME FEATURES

### Supabase Realtime Integration

```typescript
// src/lib/supabase-realtime.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Subscribe to thread replies
export function subscribeToThread(threadId: string, onReply: (reply: Reply) => void) {
  const channel = supabase
    .channel(`thread:${threadId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'replies',
        filter: `thread_id=eq.${threadId}`
      },
      (payload) => {
        onReply(payload.new as Reply)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Subscribe to notifications
export function subscribeToNotifications(userId: string, onNotification: (notification: Notification) => void) {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        onNotification(payload.new as Notification)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Presence (who's online)
export function trackPresence(userId: string, location: string) {
  const channel = supabase.channel('online-users')

  channel.on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState()
    console.log('Online users:', state)
  })

  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        user_id: userId,
        location,
        online_at: new Date().toISOString()
      })
    }
  })

  return () => {
    channel.untrack()
    supabase.removeChannel(channel)
  }
}
```

### React Hook

```typescript
// src/hooks/use-realtime-thread.ts
"use client"

import { useEffect, useState } from 'react'
import { subscribeToThread } from '@/lib/supabase-realtime'

export function useRealtimeThread(threadId: string, initialReplies: Reply[]) {
  const [replies, setReplies] = useState(initialReplies)

  useEffect(() => {
    const unsubscribe = subscribeToThread(threadId, (newReply) => {
      setReplies((prev) => [...prev, newReply])
    })

    return () => {
      unsubscribe()
    }
  }, [threadId])

  return replies
}
```

---

## GAMIFICATION SYSTEM

```typescript
// src/lib/gamification.ts

interface PointAction {
  action: string
  points: number
  limit?: { count: number; period: 'day' | 'week' }
}

const POINT_ACTIONS: PointAction[] = [
  { action: 'create_post', points: 10, limit: { count: 5, period: 'day' } },
  { action: 'create_reply', points: 5, limit: { count: 20, period: 'day' } },
  { action: 'receive_like', points: 2 },
  { action: 'receive_helpful', points: 5 },
  { action: 'post_marked_answer', points: 25 },
  { action: 'first_post', points: 50 },
  { action: 'streak_7_days', points: 100 },
  { action: 'streak_30_days', points: 500 },
]

const LEVELS = [
  { level: 1, minPoints: 0, title: 'Newcomer' },
  { level: 2, minPoints: 100, title: 'Member' },
  { level: 3, minPoints: 500, title: 'Regular' },
  { level: 4, minPoints: 1500, title: 'Active' },
  { level: 5, minPoints: 5000, title: 'Veteran' },
  { level: 6, minPoints: 15000, title: 'Expert' },
  { level: 7, minPoints: 50000, title: 'Master' },
  { level: 8, minPoints: 100000, title: 'Legend' },
]

export async function awardPoints(userId: string, action: string): Promise<{ points: number; levelUp: boolean }> {
  const pointAction = POINT_ACTIONS.find(a => a.action === action)
  if (!pointAction) return { points: 0, levelUp: false }

  // Check daily/weekly limits
  if (pointAction.limit) {
    const count = await getActionCount(userId, action, pointAction.limit.period)
    if (count >= pointAction.limit.count) {
      return { points: 0, levelUp: false }
    }
  }

  // Award points
  const user = await db.user.update({
    where: { id: userId },
    data: { points: { increment: pointAction.points } }
  })

  // Check for level up
  const newLevel = calculateLevel(user.points)
  const levelUp = newLevel > user.level

  if (levelUp) {
    await db.user.update({
      where: { id: userId },
      data: { level: newLevel }
    })

    // Send level up notification
    await createNotification(userId, 'LEVEL_UP', {
      title: `Level Up! You're now level ${newLevel}`,
      content: `Congratulations! You've reached ${LEVELS[newLevel - 1].title} status.`
    })
  }

  return { points: pointAction.points, levelUp }
}

export function calculateLevel(points: number): number {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      return LEVELS[i].level
    }
  }
  return 1
}
```

---

## MODERATION TOOLS

```typescript
// src/lib/moderation.ts

interface ModerationAction {
  moderatorId: string
  targetType: 'user' | 'post' | 'comment' | 'thread'
  targetId: string
  action: ModActionType
  reason?: string
}

export async function moderateContent(action: ModerationAction): Promise<void> {
  // Log the action
  await db.modAction.create({
    data: {
      moderatorId: action.moderatorId,
      action: action.action,
      reason: action.reason,
      targetType: action.targetType,
      targetId: action.targetId
    }
  })

  switch (action.action) {
    case 'DELETE_POST':
      await db.post.delete({ where: { id: action.targetId } })
      break

    case 'DELETE_COMMENT':
      await db.comment.delete({ where: { id: action.targetId } })
      break

    case 'LOCK_THREAD':
      await db.thread.update({
        where: { id: action.targetId },
        data: { isLocked: true }
      })
      break

    case 'MUTE':
      await db.user.update({
        where: { id: action.targetId },
        data: { status: 'MUTED' }
      })
      break

    case 'BAN':
      await db.user.update({
        where: { id: action.targetId },
        data: {
          status: 'BANNED',
          isBanned: true,
          banReason: action.reason
        }
      })
      break

    case 'UNBAN':
      await db.user.update({
        where: { id: action.targetId },
        data: {
          status: 'ACTIVE',
          isBanned: false,
          banReason: null,
          banExpiresAt: null
        }
      })
      break
  }

  // Notify user if applicable
  if (['WARN', 'MUTE', 'BAN'].includes(action.action)) {
    await createNotification(action.targetId, 'MODERATION', {
      title: `Account Action: ${action.action}`,
      content: action.reason || 'Your account has been actioned by a moderator.'
    })
  }
}
```

---

## FEATURES INCLUSES

### MVP (Phase 1)
- [x] User authentication & profiles
- [x] Forum categories and threads
- [x] Posts and comments
- [x] Reactions (like, helpful, etc.)
- [x] Basic notifications
- [x] Moderation tools

### Phase 2
- [ ] Realtime updates
- [ ] Gamification (points, badges, levels)
- [ ] Direct messages
- [ ] Following system
- [ ] Rich text editor

### Phase 3
- [ ] Groups
- [ ] Events
- [ ] Polls
- [ ] Advanced analytics
- [ ] Mobile app

---

## COMMANDES DE GÉNÉRATION

```bash
# Créer community
/create community MyCommunity

# Avec options
/create community MyCommunity --with-gamification --with-realtime

# Ajouter features
/generate feature forums
/generate feature gamification
/generate feature moderation
```

---

**Version:** 1.0
**Stack:** Next.js 15 + Supabase Realtime + Clerk
**Temps estimé:** 4-6 heures pour MVP
