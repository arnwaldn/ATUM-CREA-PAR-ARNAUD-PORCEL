/**
 * Git Viewer - Read-only git integration in Canvas
 *
 * Shows git status, branches, and commit log for the current workspace.
 * All operations are read-only.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  GitBranch,
  GitCommit as GitCommitIcon,
  RefreshCw,
  FileText,
  Plus,
  Minus,
  Edit3,
  AlertCircle,
  ChevronRight,
  FolderGit2,
} from 'lucide-react'
import { useSpaceStore } from '../../../stores/space.store'
import { api } from '../../../api'
import { useTranslation } from '../../../i18n'

// ============================================
// Types (mirror git.service.ts)
// ============================================

interface GitStatus {
  branch: string
  ahead: number
  behind: number
  staged: Array<{ file: string; status: 'added' | 'modified' | 'deleted' | 'renamed' }>
  unstaged: Array<{ file: string; status: 'added' | 'modified' | 'deleted' | 'renamed' }>
  untracked: string[]
}

interface GitBranchInfo {
  name: string
  isCurrent: boolean
  isRemote: boolean
}

interface GitCommitInfo {
  hash: string
  shortHash: string
  message: string
  author: string
  date: string
}

type GitTab = 'status' | 'branches' | 'log'

// ============================================
// Sub-components
// ============================================

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'added': return <Plus size={12} className="text-green-400" />
    case 'deleted': return <Minus size={12} className="text-red-400" />
    case 'modified': return <Edit3 size={12} className="text-yellow-400" />
    case 'renamed': return <ChevronRight size={12} className="text-blue-400" />
    default: return <FileText size={12} className="text-muted-foreground" />
  }
}

function GitStatusView({ status }: { status: GitStatus }) {
  const { t } = useTranslation()

  const isEmpty = status.staged.length === 0 && status.unstaged.length === 0 && status.untracked.length === 0

  return (
    <div className="space-y-4 p-4">
      {/* Branch info */}
      <div className="flex items-center gap-2 text-sm">
        <GitBranch size={16} className="text-primary" />
        <span className="font-medium">{status.branch}</span>
        {(status.ahead > 0 || status.behind > 0) && (
          <span className="text-xs text-muted-foreground">
            {status.ahead > 0 && `+${status.ahead}`}
            {status.ahead > 0 && status.behind > 0 && ' / '}
            {status.behind > 0 && `-${status.behind}`}
          </span>
        )}
      </div>

      {isEmpty && (
        <p className="text-sm text-muted-foreground/60">{t('Working tree clean')}</p>
      )}

      {/* Staged */}
      {status.staged.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-green-400 uppercase tracking-wider mb-2">
            {t('Staged')} ({status.staged.length})
          </h4>
          <div className="space-y-1">
            {status.staged.map(f => (
              <div key={`s-${f.file}`} className="flex items-center gap-2 text-xs font-mono text-foreground/80 py-0.5">
                <StatusIcon status={f.status} />
                <span className="truncate">{f.file}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unstaged */}
      {status.unstaged.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-yellow-400 uppercase tracking-wider mb-2">
            {t('Modified')} ({status.unstaged.length})
          </h4>
          <div className="space-y-1">
            {status.unstaged.map(f => (
              <div key={`u-${f.file}`} className="flex items-center gap-2 text-xs font-mono text-foreground/80 py-0.5">
                <StatusIcon status={f.status} />
                <span className="truncate">{f.file}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Untracked */}
      {status.untracked.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {t('Untracked')} ({status.untracked.length})
          </h4>
          <div className="space-y-1">
            {status.untracked.map(f => (
              <div key={`?-${f}`} className="flex items-center gap-2 text-xs font-mono text-foreground/60 py-0.5">
                <FileText size={12} className="text-muted-foreground/40" />
                <span className="truncate">{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function GitBranchesView({ branches }: { branches: GitBranchInfo[] }) {
  const { t } = useTranslation()
  const localBranches = branches.filter(b => !b.isRemote)
  const remoteBranches = branches.filter(b => b.isRemote)

  return (
    <div className="space-y-4 p-4">
      {/* Local */}
      <div>
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          {t('Local')} ({localBranches.length})
        </h4>
        <div className="space-y-1">
          {localBranches.map(b => (
            <div
              key={b.name}
              className={`flex items-center gap-2 text-xs py-1 px-2 rounded ${
                b.isCurrent ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/80'
              }`}
            >
              <GitBranch size={12} />
              <span className="truncate">{b.name}</span>
              {b.isCurrent && <span className="text-[10px] text-primary/60">*</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Remote */}
      {remoteBranches.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {t('Remote')} ({remoteBranches.length})
          </h4>
          <div className="space-y-1">
            {remoteBranches.map(b => (
              <div key={b.name} className="flex items-center gap-2 text-xs text-foreground/60 py-1 px-2">
                <GitBranch size={12} className="text-muted-foreground/40" />
                <span className="truncate">{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function GitLogView({ commits }: { commits: GitCommitInfo[] }) {
  return (
    <div className="p-4">
      <div className="space-y-0.5">
        {commits.map(c => (
          <div key={c.hash} className="flex items-start gap-3 py-1.5 text-xs">
            <span className="font-mono text-primary/70 shrink-0 w-[60px]">{c.shortHash}</span>
            <span className="flex-1 truncate text-foreground/80">{c.message}</span>
            <span className="text-muted-foreground/50 shrink-0">{c.author}</span>
            <span className="text-muted-foreground/40 shrink-0 w-[80px] text-right">{c.date}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function GitViewer() {
  const { t } = useTranslation()
  const { currentSpace } = useSpaceStore()

  const [activeTab, setActiveTab] = useState<GitTab>('status')
  const [isRepo, setIsRepo] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data
  const [status, setStatus] = useState<GitStatus | null>(null)
  const [branches, setBranches] = useState<GitBranchInfo[]>([])
  const [commits, setCommits] = useState<GitCommitInfo[]>([])

  const spaceId = currentSpace?.id

  // Load data
  const loadData = useCallback(async () => {
    if (!spaceId) return

    setIsLoading(true)
    setError(null)

    try {
      // Check if repo
      const repoResult = await api.gitIsRepo(spaceId)
      if (!repoResult.success || !repoResult.data) {
        setIsRepo(false)
        setIsLoading(false)
        return
      }
      setIsRepo(true)

      // Load all data in parallel
      const [statusResult, branchesResult, logResult] = await Promise.all([
        api.gitStatus(spaceId),
        api.gitBranches(spaceId),
        api.gitLog(spaceId, 50),
      ])

      if (statusResult.success) setStatus(statusResult.data as GitStatus)
      if (branchesResult.success) setBranches(branchesResult.data as GitBranchInfo[])
      if (logResult.success) setCommits(logResult.data as GitCommitInfo[])
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [spaceId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Not a git repo
  if (isRepo === false) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <FolderGit2 className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <h3 className="text-sm font-medium text-foreground/80 mb-1">{t('Not a Git Repository')}</h3>
        <p className="text-xs text-muted-foreground/60">{t('This workspace is not initialized as a git repository.')}</p>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <AlertCircle className="w-12 h-12 text-destructive/30 mb-4" />
        <h3 className="text-sm font-medium text-destructive/80 mb-1">{t('Git Error')}</h3>
        <p className="text-xs text-muted-foreground/60">{error}</p>
        <button
          onClick={loadData}
          className="mt-3 px-3 py-1 text-xs rounded bg-secondary hover:bg-secondary/80 transition-colors"
        >
          {t('Retry')}
        </button>
      </div>
    )
  }

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  const tabs: { id: GitTab; label: string; icon: typeof GitBranch }[] = [
    { id: 'status', label: t('Status'), icon: FileText },
    { id: 'branches', label: t('Branches'), icon: GitBranch },
    { id: 'log', label: t('Log'), icon: GitCommitIcon },
  ]

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card/50">
        <div className="flex items-center gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={loadData}
          className="p-1.5 rounded hover:bg-secondary transition-colors"
          title={t('Refresh')}
        >
          <RefreshCw size={14} className="text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'status' && status && <GitStatusView status={status} />}
        {activeTab === 'branches' && <GitBranchesView branches={branches} />}
        {activeTab === 'log' && <GitLogView commits={commits} />}
      </div>
    </div>
  )
}
