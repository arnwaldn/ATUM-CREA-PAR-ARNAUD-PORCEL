/**
 * ATUM CREA - ECC Environment Injection for Agent Processes
 *
 * Injects Everything Claude Code (ECC) configuration markers into
 * the environment of every Claude Code session spawned by ATUM CREA.
 *
 * This ensures each session benefits from ECC's agents, rules, skills,
 * and commands installed in ~/.claude/.
 */

import { existsSync, readdirSync, statSync } from 'fs'
import path from 'path'
import { homedir } from 'os'

/**
 * Phase-to-context mapping for ECC behavioral contexts
 */
const PHASE_CONTEXT_MAP: Readonly<Record<string, string>> = {
  setup: 'research',
  planning: 'research',
  spec_creation: 'research',
  coding: 'dev',
  implementation: 'dev',
  testing: 'dev',
  qa_review: 'review',
  qa_fix: 'dev',
  review: 'review',
  merge: 'review',
  documentation: 'review',
}

/**
 * Get the user's ~/.claude directory path
 */
function getClaudeDir(): string {
  return path.join(homedir(), '.claude')
}

/**
 * Count .md files in a directory (non-recursive)
 */
function countMdFiles(dirPath: string): number {
  if (!existsSync(dirPath)) return 0
  try {
    return readdirSync(dirPath).filter(f => f.endsWith('.md')).length
  } catch {
    return 0
  }
}

/**
 * Count .md files recursively (for rules/ which has subdirectories)
 */
function countMdFilesRecursive(dirPath: string): number {
  if (!existsSync(dirPath)) return 0
  try {
    let count = 0
    const entries = readdirSync(dirPath, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        count++
      } else if (entry.isDirectory()) {
        count += countMdFilesRecursive(path.join(dirPath, entry.name))
      }
    }
    return count
  } catch {
    return 0
  }
}

/**
 * Count skill directories (containing SKILL.md)
 */
function countSkillDirs(dirPath: string): number {
  if (!existsSync(dirPath)) return 0
  try {
    return readdirSync(dirPath).filter(name => {
      const skillPath = path.join(dirPath, name, 'SKILL.md')
      try {
        return statSync(path.join(dirPath, name)).isDirectory() && existsSync(skillPath)
      } catch {
        return false
      }
    }).length
  } catch {
    return 0
  }
}

/**
 * Build ATUM CREA environment variables to inject into agent processes.
 *
 * @param phase - The current phase (coding, qa_review, etc.)
 * @returns Record of environment variables to merge into process env
 */
export function getECCEnvVars(phase: string = 'coding'): Record<string, string> {
  const claudeDir = getClaudeDir()
  const env: Record<string, string> = {}

  // Signal that ATUM CREA is active
  env['ATUM_CREA_ENABLED'] = 'true'
  env['ATUM_CREA_ECC_DIR'] = claudeDir

  // Count detected ECC components
  env['ATUM_CREA_AGENTS_COUNT'] = String(countMdFiles(path.join(claudeDir, 'agents')))
  env['ATUM_CREA_RULES_COUNT'] = String(countMdFilesRecursive(path.join(claudeDir, 'rules')))
  env['ATUM_CREA_SKILLS_COUNT'] = String(countSkillDirs(path.join(claudeDir, 'skills')))
  env['ATUM_CREA_COMMANDS_COUNT'] = String(countMdFilesRecursive(path.join(claudeDir, 'commands')))

  // Set phase and context
  env['ATUM_CREA_PHASE'] = phase
  env['ATUM_CREA_CONTEXT'] = PHASE_CONTEXT_MAP[phase] || 'dev'

  return env
}
