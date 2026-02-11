import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const app = new Hono()
const prisma = new PrismaClient()

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'user-service' })
})

// Auth Routes
app.post('/auth/register', async (c) => {
  try {
    const { email, password, name } = await c.req.json()

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return c.json({ error: 'Email already exists' }, 400)
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
      select: { id: true, email: true, name: true, role: true },
    })

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    })

    return c.json({ user, token })
  } catch (error) {
    return c.json({ error: 'Registration failed' }, 500)
  }
})

app.post('/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    })

    return c.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    })
  } catch (error) {
    return c.json({ error: 'Login failed' }, 500)
  }
})

// User Routes
app.get('/users', async (c) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })
  return c.json(users)
})

app.get('/users/:id', async (c) => {
  const id = c.req.param('id')
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json(user)
})

app.patch('/users/:id', async (c) => {
  const id = c.req.param('id')
  const data = await c.req.json()

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { name: data.name },
      select: { id: true, email: true, name: true, role: true },
    })
    return c.json(user)
  } catch {
    return c.json({ error: 'User not found' }, 404)
  }
})

app.delete('/users/:id', async (c) => {
  const id = c.req.param('id')

  try {
    await prisma.user.delete({ where: { id } })
    return c.json({ success: true })
  } catch {
    return c.json({ error: 'User not found' }, 404)
  }
})

// Start server
const port = parseInt(process.env.PORT || '3001')
console.log(`👤 User Service running on port ${port}`)

serve({ fetch: app.fetch, port })
