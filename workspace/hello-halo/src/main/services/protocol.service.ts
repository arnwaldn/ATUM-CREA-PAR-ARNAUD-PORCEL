/**
 * Protocol Service - Custom protocol registration for secure local resource access
 *
 * Provides atum-file:// protocol to bypass cross-origin restrictions when loading
 * local files from localhost (dev mode) or app:// (production mode).
 *
 * Usage:
 * - Images: <img src="atum-file:///path/to/image.png">
 * - PDF: BrowserView.loadURL("atum-file:///path/to/doc.pdf")
 * - Other media: Same pattern for video, audio, etc.
 *
 * Security:
 * - Only file:// URLs are allowed, no remote URLs pass through.
 * - Path traversal sequences (../) are blocked.
 * - Paths are validated against allowed workspace directories.
 */

import { protocol, net } from 'electron'
import { existsSync, realpathSync } from 'fs'
import { normalize, isAbsolute, relative } from 'path'
import { getAllSpacePaths } from './space.service'
import { getTempSpacePath } from './config.service'

/**
 * Validate that a resolved file path is within allowed directories.
 * Prevents path traversal attacks via the atum-file:// protocol.
 */
function isProtocolPathAllowed(filePath: string): boolean {
  // Block path traversal sequences before normalization
  if (filePath.includes('..')) return false

  const normalized = normalize(filePath)

  // Must be an absolute path
  if (!isAbsolute(normalized)) return false

  // Check against allowed directories
  if (!existsSync(normalized)) return false

  try {
    const realTarget = realpathSync(normalized)
    const tempPath = getTempSpacePath()
    const allowedBases = [...getAllSpacePaths(), tempPath].filter(p => existsSync(p))

    return allowedBases.some(base => {
      try {
        const realBase = realpathSync(base)
        const rel = relative(realBase, realTarget)
        return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel))
      } catch {
        return false
      }
    })
  } catch {
    return false
  }
}

/**
 * Register custom protocols for secure local resource access
 * Must be called after app.whenReady()
 */
export function registerProtocols(): void {
  // atum-file:// - Proxy to file:// for local resources
  // Chromium blocks file:// from localhost/app origins, this bypasses that
  protocol.handle('atum-file', (request) => {
    const filePath = decodeURIComponent(request.url.replace('atum-file://', ''))

    // Security: Validate path before serving
    if (!isProtocolPathAllowed(filePath)) {
      console.warn(`[Protocol] Blocked access to: ${filePath}`)
      return new Response('Forbidden', { status: 403 })
    }

    return net.fetch(`file://${filePath}`)
  })

  console.log('[Protocol] Registered atum-file:// protocol')
}
