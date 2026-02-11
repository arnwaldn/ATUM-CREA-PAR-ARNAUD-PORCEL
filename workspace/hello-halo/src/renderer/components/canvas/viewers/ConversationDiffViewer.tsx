/**
 * Conversation Diff Viewer - Aggregated file changes across all messages
 *
 * Shows every Write/Edit from the current conversation in one view.
 * Reuses FileChangesList for the file list and DiffModal for per-file diffs.
 */

import { useState, useMemo } from 'react'
import { GitCompareArrows, FileText, FilePlus } from 'lucide-react'
import { useChatStore } from '../../../stores/chat.store'
import { extractConversationFileChanges, getAllFileChanges, hasFileChanges } from '../../diff/utils'
import { FileChangesList } from '../../diff/FileChangesList'
import { DiffModal } from '../../diff/DiffModal'
import type { FileChange, DiffModalState } from '../../diff/types'
import { useTranslation } from '../../../i18n'

export function ConversationDiffViewer() {
  const { t } = useTranslation()
  const { getCurrentConversation } = useChatStore()
  const conversation = getCurrentConversation()
  const messages = conversation?.messages || []

  // Aggregate all file changes
  const changes = useMemo(() => extractConversationFileChanges(messages), [messages])
  const allFiles = useMemo(() => getAllFileChanges(changes), [changes])

  // Diff modal state
  const [diffModal, setDiffModal] = useState<DiffModalState>({
    isOpen: false,
    currentFile: null,
    allFiles: [],
    currentIndex: 0,
  })

  const handleFileClick = (file: FileChange) => {
    const index = allFiles.findIndex(f => f.id === file.id)
    setDiffModal({
      isOpen: true,
      currentFile: file,
      allFiles,
      currentIndex: index >= 0 ? index : 0,
    })
  }

  const handleModalNavigate = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev'
      ? diffModal.currentIndex - 1
      : diffModal.currentIndex + 1

    if (newIndex >= 0 && newIndex < allFiles.length) {
      setDiffModal(prev => ({
        ...prev,
        currentIndex: newIndex,
        currentFile: allFiles[newIndex],
      }))
    }
  }

  const handleModalClose = () => {
    setDiffModal(prev => ({ ...prev, isOpen: false }))
  }

  if (!hasFileChanges(changes)) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <GitCompareArrows className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="text-sm text-muted-foreground">
          {t('No file changes in this conversation')}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with stats */}
      <div className="px-4 py-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-3">
          <GitCompareArrows className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t('All Changes')}</span>
          <div className="flex items-center gap-3 ml-auto text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {changes.edits.length} {t('modified')}
            </span>
            <span className="flex items-center gap-1">
              <FilePlus className="w-3 h-3" />
              {changes.writes.length} {t('created')}
            </span>
            <span className="text-green-400 font-mono">+{changes.totalAdded}</span>
            {changes.totalRemoved > 0 && (
              <span className="text-red-400 font-mono">-{changes.totalRemoved}</span>
            )}
          </div>
        </div>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-auto p-4">
        <FileChangesList changes={changes} onFileClick={handleFileClick} />
      </div>

      {/* Diff modal */}
      <DiffModal
        isOpen={diffModal.isOpen}
        file={diffModal.currentFile}
        allFiles={diffModal.allFiles}
        currentIndex={diffModal.currentIndex}
        onClose={handleModalClose}
        onNavigate={handleModalNavigate}
      />
    </div>
  )
}
