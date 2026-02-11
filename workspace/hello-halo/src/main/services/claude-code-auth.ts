/**
 * Claude Code Native Auth - Auto-detection and configuration
 *
 * Detects existing Claude Code CLI credentials (~/.claude/.credentials.json)
 * and auto-configures an AI source so the setup flow is skipped.
 *
 * The Claude Agent SDK spawns `claude` CLI as a subprocess.
 * When CLAUDE_CONFIG_DIR points to ~/.claude/ and ANTHROPIC_API_KEY is NOT set,
 * the subprocess uses the existing OAuth token from the Claude Code subscription.
 * This means zero API cost - it uses the user's Claude Code / Claude Max plan.
 */

import { homedir } from 'os'
import { join } from 'path'
import { existsSync, readFileSync } from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { getConfig, saveConfig } from './config.service'
import { AVAILABLE_MODELS, DEFAULT_MODEL } from '../../shared/types/ai-sources'
import type { AISource, AISourcesConfig } from '../../shared/types/ai-sources'

/** Sentinel value for Claude Code native auth - detected by buildSdkEnv() */
export const CLAUDE_CODE_NATIVE_KEY = '__CLAUDE_CODE_NATIVE__'

/** Provider ID for Claude Code native sources */
export const CLAUDE_CODE_PROVIDER = 'anthropic'

/**
 * Get the path to Claude Code's credentials file
 */
export function getClaudeCredentialsPath(): string {
  return join(homedir(), '.claude', '.credentials.json')
}

/**
 * Get the path to Claude Code's config directory
 */
export function getClaudeConfigDir(): string {
  return join(homedir(), '.claude')
}

/**
 * Check if Claude Code is installed and authenticated
 */
export function isClaudeCodeAuthenticated(): boolean {
  const credPath = getClaudeCredentialsPath()
  if (!existsSync(credPath)) return false

  try {
    const raw = readFileSync(credPath, 'utf-8')
    const creds = JSON.parse(raw)
    // Claude Code stores OAuth tokens under claudeAiOauth
    return !!(creds?.claudeAiOauth?.accessToken)
  } catch {
    return false
  }
}

/**
 * Auto-detect Claude Code and configure AI source if needed.
 * Called at startup before the renderer loads.
 *
 * If Claude Code is authenticated and no AI source exists,
 * creates a source with a sentinel API key that buildSdkEnv() will detect.
 */
export function autoDetectClaudeCode(): boolean {
  if (!isClaudeCodeAuthenticated()) {
    console.log('[ClaudeCodeAuth] No Claude Code credentials found at', getClaudeCredentialsPath())
    return false
  }

  console.log('[ClaudeCodeAuth] Claude Code credentials detected')

  const config = getConfig()
  const aiSources = config.aiSources

  // Check if a Claude Code native source already exists
  const hasNativeSource = aiSources?.version === 2
    && Array.isArray(aiSources.sources)
    && aiSources.sources.some(s => s.apiKey === CLAUDE_CODE_NATIVE_KEY)

  if (hasNativeSource) {
    console.log('[ClaudeCodeAuth] Native source already configured')
    // Ensure isFirstLaunch is false
    if (config.isFirstLaunch) {
      saveConfig({ isFirstLaunch: false })
    }
    return true
  }

  // Check if user already has other sources configured
  const hasAnySources = aiSources?.version === 2
    && Array.isArray(aiSources.sources)
    && aiSources.sources.length > 0

  if (hasAnySources) {
    console.log('[ClaudeCodeAuth] User already has configured sources, skipping auto-detect')
    return false
  }

  // Create a new AI source for Claude Code native auth
  const now = new Date().toISOString()
  const sourceId = uuidv4()

  const claudeCodeSource: AISource = {
    id: sourceId,
    name: 'Claude Code (Subscription)',
    provider: CLAUDE_CODE_PROVIDER,
    authType: 'api-key',
    apiUrl: 'https://api.anthropic.com',
    apiKey: CLAUDE_CODE_NATIVE_KEY,
    model: DEFAULT_MODEL,
    availableModels: AVAILABLE_MODELS.map(m => ({ id: m.id, name: m.name })),
    createdAt: now,
    updatedAt: now
  }

  const newAiSources: AISourcesConfig = {
    version: 2,
    currentId: sourceId,
    sources: [claudeCodeSource]
  }

  saveConfig({
    aiSources: newAiSources,
    isFirstLaunch: false
  } as any)

  console.log('[ClaudeCodeAuth] Auto-configured Claude Code native source:', sourceId)
  return true
}

/**
 * Check if a given API key is the Claude Code native sentinel
 */
export function isClaudeCodeNativeKey(apiKey: string): boolean {
  return apiKey === CLAUDE_CODE_NATIVE_KEY
}
