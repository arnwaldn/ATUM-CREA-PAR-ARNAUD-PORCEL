/**
 * Windows Firewall Management for Remote Access
 * Automatically adds/removes firewall rules when remote access is enabled/disabled
 * Uses netsh via child_process with elevation via PowerShell when needed
 */

import { exec } from 'child_process'
import { platform } from 'os'

const RULE_NAME = 'ATUM CREA Remote Access'

/**
 * Check if a firewall rule already exists for ATUM CREA
 */
export async function hasFirewallRule(): Promise<boolean> {
  if (platform() !== 'win32') return true // Non-Windows: assume no firewall issue

  return new Promise((resolve) => {
    exec(
      `netsh advfirewall firewall show rule name="${RULE_NAME}"`,
      { windowsHide: true },
      (error, stdout) => {
        if (error) {
          resolve(false)
          return
        }
        resolve(stdout.includes(RULE_NAME))
      }
    )
  })
}

/**
 * Add a Windows Firewall inbound rule for the given port
 * Tries without elevation first, then with PowerShell elevation
 */
export async function addFirewallRule(port: number): Promise<{ success: boolean; elevated: boolean }> {
  if (platform() !== 'win32') return { success: true, elevated: false }

  // First check if rule already exists
  const exists = await hasFirewallRule()
  if (exists) {
    console.log('[Firewall] Rule already exists, updating port...')
    await removeFirewallRuleQuiet()
  }

  // Try without elevation first (works if running as admin)
  const directResult = await tryAddRule(port)
  if (directResult) {
    console.log('[Firewall] Rule added successfully (direct)')
    return { success: true, elevated: false }
  }

  // Try with PowerShell elevation (shows UAC prompt)
  console.log('[Firewall] Direct add failed, trying with elevation...')
  const elevatedResult = await tryAddRuleElevated(port)
  if (elevatedResult) {
    console.log('[Firewall] Rule added successfully (elevated)')
    return { success: true, elevated: true }
  }

  console.warn('[Firewall] Failed to add firewall rule - LAN access may be blocked')
  return { success: false, elevated: false }
}

/**
 * Remove the firewall rule
 */
export async function removeFirewallRule(): Promise<boolean> {
  if (platform() !== 'win32') return true

  const exists = await hasFirewallRule()
  if (!exists) return true

  return new Promise((resolve) => {
    exec(
      `netsh advfirewall firewall delete rule name="${RULE_NAME}"`,
      { windowsHide: true },
      (error) => {
        if (error) {
          // Try elevated
          exec(
            `powershell -Command "Start-Process -FilePath 'netsh' -ArgumentList 'advfirewall firewall delete rule name=\\\"${RULE_NAME}\\\"' -Verb RunAs -Wait -WindowStyle Hidden"`,
            { windowsHide: true },
            (elevError) => {
              resolve(!elevError)
            }
          )
        } else {
          resolve(true)
        }
      }
    )
  })
}

/**
 * Try to add rule directly (without elevation)
 */
function tryAddRule(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const cmd = `netsh advfirewall firewall add rule name="${RULE_NAME}" dir=in action=allow protocol=TCP localport=${port} description="Allow remote access to ATUM CREA"`
    exec(cmd, { windowsHide: true }, (error) => {
      resolve(!error)
    })
  })
}

/**
 * Try to add rule with PowerShell elevation (UAC prompt)
 */
function tryAddRuleElevated(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const netshArgs = `advfirewall firewall add rule name=\\\"${RULE_NAME}\\\" dir=in action=allow protocol=TCP localport=${port} description=\\\"Allow remote access to ATUM CREA\\\"`
    const cmd = `powershell -Command "Start-Process -FilePath 'netsh' -ArgumentList '${netshArgs}' -Verb RunAs -Wait -WindowStyle Hidden"`

    exec(cmd, { windowsHide: true, timeout: 30000 }, (error) => {
      if (error) {
        console.warn('[Firewall] Elevated add failed:', error.message)
        resolve(false)
      } else {
        // Verify the rule was actually added
        hasFirewallRule().then(resolve)
      }
    })
  })
}

/**
 * Remove rule silently (no error reporting)
 */
function removeFirewallRuleQuiet(): Promise<void> {
  return new Promise((resolve) => {
    exec(
      `netsh advfirewall firewall delete rule name="${RULE_NAME}"`,
      { windowsHide: true },
      () => resolve()
    )
  })
}
