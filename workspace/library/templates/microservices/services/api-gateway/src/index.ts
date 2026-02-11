import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { timing } from 'hono/timing'

const app = new Hono()

// Middleware
app.use('*', cors())
app.use('*', logger())
app.use('*', timing())

// Service URLs from environment
const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:3001'
const ORDER_SERVICE = process.env.ORDER_SERVICE_URL || 'http://localhost:3002'
const NOTIFICATION_SERVICE = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003'

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'api-gateway' })
})

// Proxy helper
async function proxyRequest(serviceUrl: string, path: string, c: any) {
  const url = `${serviceUrl}${path}`
  const method = c.req.method
  const headers = new Headers(c.req.header())
  headers.delete('host')

  const options: RequestInit = {
    method,
    headers,
  }

  if (method !== 'GET' && method !== 'HEAD') {
    options.body = await c.req.text()
  }

  try {
    const response = await fetch(url, options)
    const data = await response.json()
    return c.json(data, response.status as any)
  } catch (error) {
    return c.json({ error: 'Service unavailable' }, 503)
  }
}

// User Service Routes
app.all('/api/users/*', async (c) => {
  const path = c.req.path.replace('/api/users', '')
  return proxyRequest(USER_SERVICE, `/users${path}`, c)
})

app.all('/api/auth/*', async (c) => {
  const path = c.req.path.replace('/api/auth', '')
  return proxyRequest(USER_SERVICE, `/auth${path}`, c)
})

// Order Service Routes
app.all('/api/orders/*', async (c) => {
  const path = c.req.path.replace('/api/orders', '')
  return proxyRequest(ORDER_SERVICE, `/orders${path}`, c)
})

// Notification Service Routes
app.all('/api/notifications/*', async (c) => {
  const path = c.req.path.replace('/api/notifications', '')
  return proxyRequest(NOTIFICATION_SERVICE, `/notifications${path}`, c)
})

// Service status
app.get('/api/status', async (c) => {
  const checkService = async (name: string, url: string) => {
    try {
      const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(2000) })
      return { name, status: res.ok ? 'healthy' : 'unhealthy' }
    } catch {
      return { name, status: 'unavailable' }
    }
  }

  const services = await Promise.all([
    checkService('user-service', USER_SERVICE),
    checkService('order-service', ORDER_SERVICE),
    checkService('notification-service', NOTIFICATION_SERVICE),
  ])

  return c.json({ gateway: 'healthy', services })
})

// Start server
const port = parseInt(process.env.PORT || '3000')
console.log(`🚀 API Gateway running on port ${port}`)

serve({ fetch: app.fetch, port })
