/**
 * Voice IPC Handlers
 * Handles speech-to-text transcription via OpenAI Whisper API
 */

import { ipcMain } from 'electron'
import { getConfig } from '../services/config.service'
import { decryptString } from '../services/secure-storage.service'
import type { AISourcesConfig, AISource } from '../../shared/types'

/**
 * Providers that do NOT support the OpenAI Whisper transcription endpoint.
 * These use different API formats (Anthropic Messages API, Google Gemini API, etc.)
 */
const INCOMPATIBLE_PROVIDERS = new Set(['anthropic', 'google'])

/**
 * Check if a source is compatible with OpenAI Whisper API.
 * A source is compatible if:
 * - It's explicitly 'openai' provider, OR
 * - It's not in the incompatible list (most third-party providers are OpenAI-compatible)
 */
function isWhisperCompatible(source: AISource): boolean {
  if (INCOMPATIBLE_PROVIDERS.has(source.provider)) return false
  // Also check the URL — if it points to anthropic.com or googleapis.com, skip it
  if (source.apiUrl?.includes('anthropic.com')) return false
  if (source.apiUrl?.includes('googleapis.com')) return false
  return true
}

/**
 * Resolve API credentials for voice transcription.
 * Whisper API is only available on OpenAI and OpenAI-compatible providers.
 *
 * Priority:
 * 1. Current source if it's OpenAI-compatible
 * 2. Any other OpenAI-compatible source (prefer 'openai' provider)
 * 3. Legacy api config if OpenAI-compatible
 */
function resolveVoiceCredentials(): { apiKey: string; baseUrl: string } | null {
  const config = getConfig() as Record<string, any>

  // v2 aiSources format
  if (config.aiSources?.version === 2 && Array.isArray(config.aiSources.sources)) {
    const sources = config.aiSources.sources as AISource[]
    const currentId = config.aiSources.currentId

    console.log('[Voice] Resolving credentials. Sources:', sources.map(s => ({
      id: s.id.slice(0, 8) + '...',
      provider: s.provider,
      apiUrl: s.apiUrl,
      hasApiKey: !!s.apiKey,
      hasAccessToken: !!s.accessToken,
      authType: s.authType,
    })))
    console.log('[Voice] Current source ID:', currentId)

    // 1. Try current source if compatible
    const currentSource = sources.find((s) => s.id === currentId)
    if (currentSource) {
      const compatible = isWhisperCompatible(currentSource)
      console.log(`[Voice] Current source: provider=${currentSource.provider}, compatible=${compatible}, hasKey=${!!currentSource.apiKey}`)
      if (compatible && currentSource.apiKey) {
        const apiKey = decryptString(currentSource.apiKey)
        const baseUrl = currentSource.apiUrl || 'https://api.openai.com/v1'
        console.log('[Voice] Using current source, baseUrl:', baseUrl)
        return { apiKey, baseUrl }
      }
    }

    // 2. Try to find an explicit OpenAI source
    const openaiSource = sources.find(
      (s) => s.provider === 'openai' && s.apiKey
    )
    if (openaiSource) {
      const apiKey = decryptString(openaiSource.apiKey!)
      const baseUrl = openaiSource.apiUrl || 'https://api.openai.com/v1'
      console.log('[Voice] Using OpenAI source, baseUrl:', baseUrl)
      return { apiKey, baseUrl }
    }

    // 3. Try any other compatible source (DeepSeek, SiliconFlow, etc.)
    const compatibleSource = sources.find(
      (s) => isWhisperCompatible(s) && s.apiKey
    )
    if (compatibleSource) {
      const apiKey = decryptString(compatibleSource.apiKey!)
      const baseUrl = compatibleSource.apiUrl || 'https://api.openai.com/v1'
      console.log('[Voice] Using compatible source:', compatibleSource.provider, 'baseUrl:', baseUrl)
      return { apiKey, baseUrl }
    }

    console.log('[Voice] No compatible source found among', sources.length, 'sources')
  } else {
    console.log('[Voice] No v2 aiSources config found, trying legacy...')
  }

  // Legacy api config fallback
  if (config.api?.apiKey) {
    const apiKey = decryptString(config.api.apiKey)
    const baseUrl = config.api?.apiUrl || 'https://api.openai.com/v1'
    // Skip if legacy config points to Anthropic
    if (baseUrl.includes('anthropic.com')) {
      console.log('[Voice] Legacy config points to Anthropic, skipping')
      return null
    }
    console.log('[Voice] Using legacy API config, baseUrl:', baseUrl)
    return { apiKey, baseUrl }
  }

  console.log('[Voice] No credentials found at all')
  return null
}

export function registerVoiceHandlers(): void {
  /**
   * Transcribe audio using OpenAI Whisper API
   * Receives: { audioData: number[], mimeType: string, language?: string }
   * Returns: { success: true, data: { text: string } } or { success: false, error: string }
   */
  ipcMain.handle('voice:transcribe', async (_event, request: {
    audioData: number[]
    mimeType: string
    language?: string
  }) => {
    console.log('[Voice] Transcription request received, audio size:', request.audioData.length, 'bytes')

    try {
      const credentials = resolveVoiceCredentials()
      if (!credentials) {
        return {
          success: false,
          error: 'Pour la dictee vocale, ajoutez une source OpenAI dans Reglages > Sources IA (elle coexiste avec Anthropic). La cle OpenAI sera utilisee uniquement pour la transcription Whisper.'
        }
      }

      // Convert number array back to Buffer
      const audioBuffer = Buffer.from(request.audioData)

      // Determine file extension from MIME type
      const extMap: Record<string, string> = {
        'audio/webm': 'webm',
        'audio/webm;codecs=opus': 'webm',
        'audio/ogg': 'ogg',
        'audio/ogg;codecs=opus': 'ogg',
        'audio/mp4': 'mp4',
        'audio/mpeg': 'mp3',
        'audio/wav': 'wav',
      }
      const ext = extMap[request.mimeType] || 'webm'

      // Build multipart form data manually (Node.js doesn't have FormData natively in all versions)
      const boundary = '----VoiceBoundary' + Date.now().toString(36)
      const parts: Buffer[] = []

      // File part
      parts.push(Buffer.from(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="file"; filename="audio.${ext}"\r\n` +
        `Content-Type: ${request.mimeType}\r\n\r\n`
      ))
      parts.push(audioBuffer)
      parts.push(Buffer.from('\r\n'))

      // Model part
      parts.push(Buffer.from(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="model"\r\n\r\n` +
        `whisper-1\r\n`
      ))

      // Language part (optional)
      if (request.language) {
        parts.push(Buffer.from(
          `--${boundary}\r\n` +
          `Content-Disposition: form-data; name="language"\r\n\r\n` +
          `${request.language}\r\n`
        ))
      }

      // Closing boundary
      parts.push(Buffer.from(`--${boundary}--\r\n`))

      const body = Buffer.concat(parts)

      // Normalize base URL and build transcription endpoint
      // baseUrl is typically "https://api.openai.com/v1" or "https://api.deepseek.com/v1"
      let baseUrl = credentials.baseUrl.replace(/\/+$/, '')
      // Ensure it ends with /v1 (OpenAI convention)
      if (!baseUrl.endsWith('/v1')) {
        baseUrl += '/v1'
      }
      const transcriptionUrl = `${baseUrl}/audio/transcriptions`

      console.log('[Voice] Sending to Whisper API:', transcriptionUrl)

      const response = await fetch(transcriptionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.apiKey}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
        body: body,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[Voice] Whisper API error:', response.status, errorText)
        return {
          success: false,
          error: `Transcription failed (${response.status}): ${errorText}`
        }
      }

      const result = await response.json() as { text: string }
      console.log('[Voice] Transcription successful, text length:', result.text?.length || 0)

      return {
        success: true,
        data: { text: result.text || '' }
      }
    } catch (error: unknown) {
      const err = error as Error
      console.error('[Voice] Transcription error:', err.message)
      return {
        success: false,
        error: `Transcription error: ${err.message}`
      }
    }
  })

  console.log('[Voice] Voice handlers registered')
}
