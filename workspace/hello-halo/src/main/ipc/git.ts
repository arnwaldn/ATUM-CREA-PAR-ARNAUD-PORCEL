/**
 * Git IPC Handlers - Read-only git operations for Canvas
 */

import { ipcMain } from 'electron'
import { getSpace } from '../services/space.service'
import {
  isGitRepo,
  getGitStatus,
  getGitBranches,
  getGitLog,
  getGitDiff,
  getGitDiffStaged,
} from '../services/git.service'

export function registerGitHandlers(): void {
  // Check if workspace is a git repo
  ipcMain.handle('git:is-repo', async (_event, spaceId: string) => {
    try {
      const space = getSpace(spaceId)
      if (!space) return { success: false, error: 'Space not found' }
      const result = await isGitRepo(space.path)
      return { success: true, data: result }
    } catch (error) {
      const err = error as Error
      return { success: false, error: err.message }
    }
  })

  // Get git status
  ipcMain.handle('git:status', async (_event, spaceId: string) => {
    try {
      const space = getSpace(spaceId)
      if (!space) return { success: false, error: 'Space not found' }
      const status = await getGitStatus(space.path)
      return { success: true, data: status }
    } catch (error) {
      const err = error as Error
      return { success: false, error: err.message }
    }
  })

  // Get branches
  ipcMain.handle('git:branches', async (_event, spaceId: string) => {
    try {
      const space = getSpace(spaceId)
      if (!space) return { success: false, error: 'Space not found' }
      const branches = await getGitBranches(space.path)
      return { success: true, data: branches }
    } catch (error) {
      const err = error as Error
      return { success: false, error: err.message }
    }
  })

  // Get commit log
  ipcMain.handle('git:log', async (_event, spaceId: string, count?: number) => {
    try {
      const space = getSpace(spaceId)
      if (!space) return { success: false, error: 'Space not found' }
      const log = await getGitLog(space.path, count)
      return { success: true, data: log }
    } catch (error) {
      const err = error as Error
      return { success: false, error: err.message }
    }
  })

  // Get diff (unstaged)
  ipcMain.handle('git:diff', async (_event, spaceId: string, file?: string) => {
    try {
      const space = getSpace(spaceId)
      if (!space) return { success: false, error: 'Space not found' }
      const diff = await getGitDiff(space.path, file)
      return { success: true, data: diff }
    } catch (error) {
      const err = error as Error
      return { success: false, error: err.message }
    }
  })

  // Get diff (staged)
  ipcMain.handle('git:diff-staged', async (_event, spaceId: string, file?: string) => {
    try {
      const space = getSpace(spaceId)
      if (!space) return { success: false, error: 'Space not found' }
      const diff = await getGitDiffStaged(space.path, file)
      return { success: true, data: diff }
    } catch (error) {
      const err = error as Error
      return { success: false, error: err.message }
    }
  })
}
