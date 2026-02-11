/**
 * Hindsight Server Manager
 *
 * Manages the lifecycle of the Hindsight HTTP server subprocess.
 * The server provides a persistent, self-learning memory engine for ATUM CREA.
 *
 * Lifecycle:
 *   1. Copy server script from ECC to ~/.halo-dev/hindsight/ (one-time)
 *   2. Migrate database from ECC (one-time, copy not move)
 *   3. Spawn Node.js subprocess (ELECTRON_RUN_AS_NODE=1)
 *   4. Health check loop (max 5s)
 *   5. Auto-restart on crash
 *   6. Clean shutdown on app exit
 */

import { spawn, ChildProcess } from 'child_process'
import { join } from 'path'
import { existsSync, mkdirSync, copyFileSync } from 'fs'
import { getAtumCreDir } from '../config.service'

// Subprocess state
let serverProcess: ChildProcess | null = null
let isReady = false
let restartCount = 0
const MAX_RESTARTS = 3

// ECC source paths (fallback locations for initial one-time copy)
// Check multiple possible sources: env var > user home > hardcoded legacy path
function getEccBase(): string {
  if (process.env.ECC_DIR && existsSync(process.env.ECC_DIR)) return process.env.ECC_DIR
  const homeEcc = join(process.env.USERPROFILE || process.env.HOME || '', 'Claude-Code-Creation')
  if (existsSync(homeEcc)) return homeEcc
  const legacyPath = 'C:\\Claude-Code-Creation'
  if (existsSync(legacyPath)) return legacyPath
  return '' // No ECC source found — server script must already be in hindsight dir
}
function getEccServerScript(): string { const base = getEccBase(); return base ? join(base, 'scripts', 'hindsight-local-server.cjs') : '' }
function getEccDbPath(): string { const base = getEccBase(); return base ? join(base, 'data', 'hindsight.db') : '' }

// Hindsight port
const HINDSIGHT_PORT = 8888

/**
 * Get the Hindsight data directory (~/.halo-dev/hindsight/)
 */
export function getHindsightDir(): string {
  return join(getAtumCreDir(), 'hindsight')
}

/**
 * Get the path to the Hindsight SQLite database
 */
export function getHindsightDbPath(): string {
  return join(getHindsightDir(), 'hindsight.db')
}

/**
 * Get the path to the local server script
 */
function getServerScriptPath(): string {
  return join(getHindsightDir(), 'hindsight-server.cjs')
}

/**
 * Ensure the server script exists in the Hindsight directory.
 * Copies from ECC source on first run.
 */
function ensureServerScript(): string {
  const dir = getHindsightDir()
  const scriptPath = getServerScriptPath()

  // Create directory if needed
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
    console.log('[Hindsight] Created directory:', dir)
  }

  // Copy server script from ECC if not already present
  if (!existsSync(scriptPath)) {
    const eccScript = getEccServerScript()
    if (eccScript && existsSync(eccScript)) {
      copyFileSync(eccScript, scriptPath)
      console.log('[Hindsight] Copied server script from ECC:', eccScript)
    } else {
      console.warn('[Hindsight] Server script not found — memory engine will be unavailable until ECC is installed')
      console.warn('[Hindsight] Set ECC_DIR env var or place ECC at ~/Claude-Code-Creation/')
      throw new Error('Hindsight server script not found. Install ECC or set ECC_DIR environment variable.')
    }
  }

  return scriptPath
}

/**
 * Migrate the SQLite database from ECC (one-time copy, never moves).
 * If a database already exists in the Hindsight directory, this is a no-op.
 */
function migrateDatabase(): void {
  const dbPath = getHindsightDbPath()

  if (existsSync(dbPath)) {
    return // Already migrated
  }

  const eccDb = getEccDbPath()
  if (eccDb && existsSync(eccDb)) {
    copyFileSync(eccDb, dbPath)
    console.log('[Hindsight] Migrated database from ECC:', eccDb)
  } else {
    console.log('[Hindsight] No existing database found — will create fresh one')
  }
}

/**
 * Check if the Hindsight server is healthy
 */
export async function isServerHealthy(): Promise<boolean> {
  try {
    const res = await fetch(`http://localhost:${HINDSIGHT_PORT}/health`, {
      signal: AbortSignal.timeout(2000)
    })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Wait for the server to become healthy (max 5 seconds)
 */
async function waitForReady(maxWaitMs = 5000): Promise<boolean> {
  const start = Date.now()
  const interval = 500

  while (Date.now() - start < maxWaitMs) {
    if (await isServerHealthy()) {
      return true
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }

  return false
}

/**
 * Start the Hindsight HTTP server as a subprocess
 */
export async function startServer(): Promise<void> {
  // If already running, skip
  if (serverProcess && isReady) {
    return
  }

  // Check if another instance is already running on the port
  if (await isServerHealthy()) {
    console.log('[Hindsight] Server already running on port', HINDSIGHT_PORT)
    isReady = true
    return
  }

  const scriptPath = ensureServerScript()
  migrateDatabase()

  const dbPath = getHindsightDbPath()

  // Use Electron's Node.js runtime with ELECTRON_RUN_AS_NODE=1
  // This avoids needing a separate Node.js install and ensures
  // the server uses the same Node.js version as the app
  const electronPath = process.execPath

  console.log('[Hindsight] Starting server subprocess...')
  console.log('[Hindsight]   Script:', scriptPath)
  console.log('[Hindsight]   Database:', dbPath)
  console.log('[Hindsight]   Port:', HINDSIGHT_PORT)

  serverProcess = spawn(electronPath, [scriptPath], {
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      HINDSIGHT_PORT: String(HINDSIGHT_PORT),
      HINDSIGHT_DB: dbPath,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })

  // Capture stdout for debugging
  serverProcess.stdout?.on('data', (data: Buffer) => {
    const line = data.toString().trim()
    if (line) {
      console.log('[Hindsight:stdout]', line)
    }
  })

  // Capture stderr for error tracking
  serverProcess.stderr?.on('data', (data: Buffer) => {
    const line = data.toString().trim()
    if (line) {
      console.error('[Hindsight:stderr]', line)
    }
  })

  // Handle unexpected exit — auto-restart
  serverProcess.on('exit', (code, signal) => {
    console.warn(`[Hindsight] Server exited (code=${code}, signal=${signal})`)
    isReady = false
    serverProcess = null

    if (restartCount < MAX_RESTARTS) {
      restartCount++
      console.log(`[Hindsight] Auto-restarting (attempt ${restartCount}/${MAX_RESTARTS})...`)
      setTimeout(() => {
        startServer().catch(err => {
          console.error('[Hindsight] Restart failed:', err.message)
        })
      }, 1000 * restartCount) // Exponential backoff: 1s, 2s, 3s
    } else {
      console.error('[Hindsight] Max restarts reached — memory engine offline')
    }
  })

  // Wait for the server to become healthy
  const healthy = await waitForReady()
  if (healthy) {
    isReady = true
    restartCount = 0 // Reset on successful start
    console.log('[Hindsight] Server is ready on port', HINDSIGHT_PORT)
  } else {
    console.warn('[Hindsight] Server did not respond within timeout — will retry on first use')
  }
}

/**
 * Stop the Hindsight server subprocess gracefully
 */
export function stopServer(): void {
  if (!serverProcess) {
    return
  }

  console.log('[Hindsight] Stopping server...')

  // Remove exit listener to prevent auto-restart during intentional shutdown
  serverProcess.removeAllListeners('exit')

  // Try graceful shutdown first (SIGTERM)
  serverProcess.kill('SIGTERM')

  // Force kill after 3 seconds if still running
  const forceKillTimer = setTimeout(() => {
    if (serverProcess && !serverProcess.killed) {
      console.warn('[Hindsight] Force killing server...')
      serverProcess.kill('SIGKILL')
    }
  }, 3000)

  serverProcess.on('exit', () => {
    clearTimeout(forceKillTimer)
    console.log('[Hindsight] Server stopped')
  })

  serverProcess = null
  isReady = false
}

/**
 * Ensure the server is running. Auto-restarts if it has crashed.
 * Called before each MCP tool invocation.
 */
export async function ensureRunning(): Promise<void> {
  if (isReady && await isServerHealthy()) {
    return
  }

  isReady = false
  restartCount = 0 // Reset for manual ensure
  await startServer()
}

/**
 * Check if the Hindsight server is currently ready
 */
export function isHindsightReady(): boolean {
  return isReady
}
