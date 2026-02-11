import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import Redis from 'ioredis'
import nodemailer from 'nodemailer'

const app = new Hono()

// Redis for pub/sub
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
const subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

// Email transporter (configure for production)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// In-memory notification store (use DB in production)
const notifications: Array<{
  id: string
  type: string
  userId: string
  message: string
  read: boolean
  createdAt: Date
}> = []

// Subscribe to events
subscriber.subscribe('order:created', 'user:registered')

subscriber.on('message', async (channel, message) => {
  const data = JSON.parse(message)

  switch (channel) {
    case 'order:created':
      await handleOrderCreated(data)
      break
    case 'user:registered':
      await handleUserRegistered(data)
      break
  }
})

async function handleOrderCreated(data: { orderId: string; userId: string; total: number }) {
  // Create notification
  const notification = {
    id: crypto.randomUUID(),
    type: 'order_created',
    userId: data.userId,
    message: `Your order #${data.orderId} has been placed. Total: $${data.total}`,
    read: false,
    createdAt: new Date(),
  }
  notifications.push(notification)

  console.log(`📧 Notification created for order ${data.orderId}`)
}

async function handleUserRegistered(data: { userId: string; email: string; name: string }) {
  // Send welcome email
  try {
    await transporter.sendMail({
      from: '"App" <noreply@app.com>',
      to: data.email,
      subject: 'Welcome!',
      text: `Hello ${data.name}, welcome to our platform!`,
      html: `<h1>Hello ${data.name}</h1><p>Welcome to our platform!</p>`,
    })
    console.log(`📧 Welcome email sent to ${data.email}`)
  } catch (error) {
    console.error('Failed to send email:', error)
  }
}

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'notification-service' })
})

// Notification Routes
app.get('/notifications/:userId', (c) => {
  const userId = c.req.param('userId')
  const userNotifications = notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  return c.json(userNotifications)
})

app.post('/notifications/:id/read', (c) => {
  const id = c.req.param('id')
  const notification = notifications.find((n) => n.id === id)

  if (!notification) {
    return c.json({ error: 'Notification not found' }, 404)
  }

  notification.read = true
  return c.json(notification)
})

app.post('/notifications/send', async (c) => {
  const { type, userId, message, email } = await c.req.json()

  // Create notification
  const notification = {
    id: crypto.randomUUID(),
    type,
    userId,
    message,
    read: false,
    createdAt: new Date(),
  }
  notifications.push(notification)

  // Send email if provided
  if (email) {
    try {
      await transporter.sendMail({
        from: '"App" <noreply@app.com>',
        to: email,
        subject: type,
        text: message,
      })
    } catch (error) {
      console.error('Failed to send email:', error)
    }
  }

  return c.json(notification)
})

// Start server
const port = parseInt(process.env.PORT || '3003')
console.log(`🔔 Notification Service running on port ${port}`)

serve({ fetch: app.fetch, port })
