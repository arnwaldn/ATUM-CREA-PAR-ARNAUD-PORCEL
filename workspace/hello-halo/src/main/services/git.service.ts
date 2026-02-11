/**
 * Git Service - Read-only git operations for Canvas Git Integration
 *
 * Executes git commands in the workspace directory.
 * All operations are read-only for safety.
 */

import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

// Git command timeout (10 seconds)
const GIT_TIMEOUT = 10_000

// ============================================
// Types
// ============================================

export interface GitStatus {
  branch: string
  ahead: number
  behind: number
  staged: Array<{ file: string; status: 'added' | 'modified' | 'deleted' | 'renamed' }>
  unstaged: Array<{ file: string; status: 'added' | 'modified' | 'deleted' | 'renamed' }>
  untracked: string[]
}

export interface GitBranch {
  name: string
  isCurrent: boolean
  isRemote: boolean
}

export interface GitCommit {
  hash: string
  shortHash: string
  message: string
  author: string
  date: string
}

// ============================================
// Helpers
// ============================================

async function runGit(cwd: string, args: string[]): Promise<string> {
  try {
    const { stdout } = await execFileAsync('git', args, {
      cwd,
      timeout: GIT_TIMEOUT,
      windowsHide: true,
      maxBuffer: 1024 * 1024, // 1MB
    })
    return stdout
  } catch (error: unknown) {
    const err = error as { code?: string; stderr?: string; message?: string }
    // Not a git repo
    if (err.stderr?.includes('not a git repository')) {
      throw new Error('NOT_GIT_REPO')
    }
    // Git not installed
    if (err.code === 'ENOENT') {
      throw new Error('GIT_NOT_FOUND')
    }
    throw new Error(err.stderr || err.message || 'Git command failed')
  }
}

function parseStatusCode(code: string): 'added' | 'modified' | 'deleted' | 'renamed' {
  switch (code) {
    case 'A': return 'added'
    case 'D': return 'deleted'
    case 'R': return 'renamed'
    default: return 'modified'
  }
}

// ============================================
// Public API
// ============================================

/**
 * Check if a directory is a git repository
 */
export async function isGitRepo(cwd: string): Promise<boolean> {
  try {
    await runGit(cwd, ['rev-parse', '--is-inside-work-tree'])
    return true
  } catch {
    return false
  }
}

/**
 * Get git status (branch, staged, unstaged, untracked)
 */
export async function getGitStatus(cwd: string): Promise<GitStatus> {
  const output = await runGit(cwd, ['status', '--porcelain', '-b', '--untracked-files=normal'])
  const lines = output.split('\n').filter(Boolean)

  const result: GitStatus = {
    branch: 'unknown',
    ahead: 0,
    behind: 0,
    staged: [],
    unstaged: [],
    untracked: [],
  }

  for (const line of lines) {
    // Branch line: ## main...origin/main [ahead 1, behind 2]
    if (line.startsWith('## ')) {
      const branchInfo = line.slice(3)
      const dotDotDot = branchInfo.indexOf('...')
      result.branch = dotDotDot >= 0 ? branchInfo.slice(0, dotDotDot) : branchInfo.split(' ')[0]

      const aheadMatch = branchInfo.match(/ahead (\d+)/)
      const behindMatch = branchInfo.match(/behind (\d+)/)
      if (aheadMatch) result.ahead = parseInt(aheadMatch[1], 10)
      if (behindMatch) result.behind = parseInt(behindMatch[1], 10)
      continue
    }

    const x = line[0] // Index (staged) status
    const y = line[1] // Working tree (unstaged) status
    const file = line.slice(3)

    // Untracked
    if (x === '?' && y === '?') {
      result.untracked.push(file)
      continue
    }

    // Staged changes
    if (x !== ' ' && x !== '?') {
      result.staged.push({ file, status: parseStatusCode(x) })
    }

    // Unstaged changes
    if (y !== ' ' && y !== '?') {
      result.unstaged.push({ file, status: parseStatusCode(y) })
    }
  }

  return result
}

/**
 * Get list of branches
 */
export async function getGitBranches(cwd: string): Promise<GitBranch[]> {
  const output = await runGit(cwd, ['branch', '-a', '--no-color'])
  const lines = output.split('\n').filter(Boolean)

  return lines.map(line => {
    const isCurrent = line.startsWith('* ')
    const name = line.replace(/^\*?\s+/, '').trim()
    const isRemote = name.startsWith('remotes/')

    return {
      name: isRemote ? name.replace('remotes/', '') : name,
      isCurrent,
      isRemote,
    }
  })
}

/**
 * Get recent commit log
 */
export async function getGitLog(cwd: string, count = 50): Promise<GitCommit[]> {
  const output = await runGit(cwd, [
    'log',
    `--oneline`,
    `-n`, String(count),
    '--format=%H|%h|%s|%an|%ar',
  ])
  const lines = output.split('\n').filter(Boolean)

  return lines.map(line => {
    const [hash, shortHash, message, author, date] = line.split('|')
    return { hash, shortHash, message, author, date }
  })
}

/**
 * Get diff for a specific file (unstaged changes)
 */
export async function getGitDiff(cwd: string, file?: string): Promise<string> {
  const args = ['diff', '--no-color']
  if (file) args.push('--', file)
  return runGit(cwd, args)
}

/**
 * Get diff for staged changes
 */
export async function getGitDiffStaged(cwd: string, file?: string): Promise<string> {
  const args = ['diff', '--cached', '--no-color']
  if (file) args.push('--', file)
  return runGit(cwd, args)
}
