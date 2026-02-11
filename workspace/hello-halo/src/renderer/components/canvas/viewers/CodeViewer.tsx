/**
 * Code Viewer - Read-first code viewer with edit capability
 *
 * Features:
 * - CodeMirror 6 powered with virtual scrolling (large file support)
 * - Default read-only mode (99% use case)
 * - Optional edit mode with save/cancel
 * - Syntax highlighting for 20+ languages
 * - Code folding, search (Cmd+F), line numbers
 * - Scroll position preservation
 * - Copy to clipboard, open external
 */

import { useRef, useState, useCallback, useMemo } from 'react'
import {
  Copy,
  Check,
  ExternalLink,
  Pencil,
  Save,
  X,
  FileCode,
  WrapText,
  CornerDownLeft,
} from 'lucide-react'
import { api } from '../../../api'
import type { CanvasTab } from '../../../stores/canvas.store'
import { useTranslation } from '../../../i18n'
import { CodeMirrorEditor, type CodeMirrorEditorRef } from './CodeMirrorEditor'
import { setWordWrap as cmSetWordWrap, goToLine as cmGoToLine } from '../../../lib/codemirror-setup'

// ============================================
// Types
// ============================================

interface CodeViewerProps {
  tab: CanvasTab
  onScrollChange?: (position: number) => void
  onContentChange?: (content: string) => void
  onSaveComplete?: (content: string) => void
}

// ============================================
// Component
// ============================================

export function CodeViewer({ tab, onScrollChange, onContentChange, onSaveComplete }: CodeViewerProps) {
  const { t } = useTranslation()
  const editorRef = useRef<CodeMirrorEditorRef>(null)

  // State
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [wordWrap, setWordWrap] = useState(false)
  const [showGoToLine, setShowGoToLine] = useState(false)
  const [goToLineValue, setGoToLineValue] = useState('')

  // Computed values
  const canOpenExternal = !api.isRemoteMode() && tab.path
  const canEdit = !!tab.path // Can only edit files with a path
  const lineCount = useMemo(() => (tab.content || '').split('\n').length, [tab.content])

  // ============================================
  // Handlers
  // ============================================

  // Copy content to clipboard
  const handleCopy = useCallback(async () => {
    const content = editorRef.current?.getContent() || tab.content
    if (!content) return

    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [tab.content])

  // Open with external application
  const handleOpenExternal = useCallback(async () => {
    if (!tab.path) return
    try {
      await api.openArtifact(tab.path)
    } catch (err) {
      console.error('Failed to open with external app:', err)
    }
  }, [tab.path])

  // Enter edit mode
  const handleEnterEdit = useCallback(() => {
    setIsEditing(true)
    setSaveError(null)
    // Focus editor after mode switch
    setTimeout(() => {
      editorRef.current?.focus()
    }, 100)
  }, [])

  // Cancel edit mode
  const handleCancelEdit = useCallback(() => {
    // Restore original content
    if (editorRef.current) {
      editorRef.current.setContent(tab.content || '')
    }
    setIsEditing(false)
    setSaveError(null)
  }, [tab.content])

  // Save changes
  const handleSave = useCallback(async () => {
    if (!tab.path || !editorRef.current) return

    const newContent = editorRef.current.getContent()

    // Check if content actually changed
    if (!editorRef.current.hasChanges()) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      const result = await api.saveArtifactContent(tab.path, newContent)

      if (result.success) {
        // Mark tab as saved (clears dirty flag) via callback
        if (onSaveComplete) {
          onSaveComplete(newContent)
        }
        setIsEditing(false)
      } else {
        setSaveError(result.error || t('Failed to save file'))
      }
    } catch (err) {
      console.error('Failed to save:', err)
      setSaveError((err as Error).message || t('Failed to save file'))
    } finally {
      setIsSaving(false)
    }
  }, [tab.path, onSaveComplete, t])

  // Toggle word wrap
  const handleToggleWordWrap = useCallback(() => {
    const view = editorRef.current?.getView()
    if (view) {
      const newValue = !wordWrap
      setWordWrap(newValue)
      cmSetWordWrap(view, newValue)
    }
  }, [wordWrap])

  // Go to line
  const handleGoToLine = useCallback(() => {
    const lineNum = parseInt(goToLineValue, 10)
    if (!isNaN(lineNum) && lineNum > 0) {
      const view = editorRef.current?.getView()
      if (view) {
        cmGoToLine(view, lineNum)
      }
    }
    setShowGoToLine(false)
    setGoToLineValue('')
  }, [goToLineValue])

  // Handle scroll
  const handleScroll = useCallback(
    (position: number) => {
      if (onScrollChange) {
        onScrollChange(position)
      }
    },
    [onScrollChange]
  )

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Cmd/Ctrl + S to save in edit mode
      if (isEditing && (e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      // Escape to cancel edit or close go-to-line
      if (e.key === 'Escape') {
        e.preventDefault()
        if (showGoToLine) {
          setShowGoToLine(false)
          setGoToLineValue('')
        } else if (isEditing) {
          handleCancelEdit()
        }
      }
      // Ctrl+G to open go-to-line dialog
      if ((e.metaKey || e.ctrlKey) && e.key === 'g') {
        e.preventDefault()
        setShowGoToLine(prev => !prev)
        setGoToLineValue('')
      }
    },
    [isEditing, showGoToLine, handleSave, handleCancelEdit]
  )

  // ============================================
  // Render
  // ============================================

  return (
    <div
      className="relative flex flex-col h-full bg-background"
      onKeyDown={handleKeyDown}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card/50">
        {/* Left: File info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileCode className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span className="font-mono">{tab.language || 'text'}</span>
          <span className="text-muted-foreground/50">·</span>
          <span>{t('{{count}} lines', { count: lineCount })}</span>
          {/* mimeType hidden - redundant with language in most cases */}
          {/* {tab.mimeType && (
            <>
              <span className="text-muted-foreground/50">·</span>
              <span>{tab.mimeType}</span>
            </>
          )} */}
          {isEditing && (
            <>
              <span className="text-muted-foreground/50">·</span>
              <span className="text-primary font-medium">{t('Editing')}</span>
            </>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {isEditing ? (
            // Edit mode actions
            <>
              {/* Save error message */}
              {saveError && (
                <span className="text-xs text-destructive mr-2">{saveError}</span>
              )}

              {/* Cancel button */}
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-2 py-1 text-xs rounded
                         hover:bg-secondary transition-colors text-muted-foreground
                         disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('Cancel (Esc)')}
              >
                <X className="w-3.5 h-3.5" />
                <span>{t('Cancel')}</span>
              </button>

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-2 py-1 text-xs rounded
                         bg-primary text-primary-foreground hover:bg-primary/90
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('Save (⌘S)')}
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? t('Saving...') : t('Save')}</span>
              </button>
            </>
          ) : (
            // View mode actions
            <>
              {/* Word wrap toggle */}
              <button
                onClick={handleToggleWordWrap}
                className={`p-1.5 rounded transition-colors ${
                  wordWrap
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-secondary text-muted-foreground'
                }`}
                title={wordWrap ? t('Disable word wrap') : t('Enable word wrap')}
              >
                <WrapText className="w-4 h-4" />
              </button>

              {/* Go to line */}
              <button
                onClick={() => { setShowGoToLine(prev => !prev); setGoToLineValue('') }}
                className="p-1.5 rounded hover:bg-secondary transition-colors"
                title={t('Go to line (Ctrl+G)')}
              >
                <CornerDownLeft className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Separator */}
              <div className="w-px h-4 bg-border/50 mx-0.5" />

              {/* Edit button */}
              {canEdit && (
                <button
                  onClick={handleEnterEdit}
                  className="p-1.5 rounded hover:bg-secondary transition-colors"
                  title={t('Edit file')}
                >
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
              )}

              {/* Copy button */}
              <button
                onClick={handleCopy}
                className="p-1.5 rounded hover:bg-secondary transition-colors"
                title={t('Copy code')}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {/* Open with external app */}
              {canOpenExternal && (
                <button
                  onClick={handleOpenExternal}
                  className="p-1.5 rounded hover:bg-secondary transition-colors"
                  title={t('Open in external application')}
                >
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Go to line dialog */}
      {showGoToLine && (
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-muted/30">
          <label className="text-xs text-muted-foreground">{t('Go to line')}:</label>
          <input
            type="number"
            min={1}
            max={lineCount}
            value={goToLineValue}
            onChange={e => setGoToLineValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleGoToLine()
              }
              if (e.key === 'Escape') {
                e.preventDefault()
                setShowGoToLine(false)
                setGoToLineValue('')
              }
            }}
            autoFocus
            placeholder={`1-${lineCount}`}
            className="w-24 px-2 py-0.5 text-xs rounded border border-border bg-background
                     focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={handleGoToLine}
            className="px-2 py-0.5 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {t('Go')}
          </button>
          <button
            onClick={() => { setShowGoToLine(false); setGoToLineValue('') }}
            className="p-0.5 rounded hover:bg-secondary transition-colors"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Code Editor */}
      <div className="flex-1 overflow-hidden">
        <CodeMirrorEditor
          ref={editorRef}
          content={tab.content || ''}
          language={tab.language}
          readOnly={!isEditing}
          onChange={isEditing ? onContentChange : undefined}
          onScroll={handleScroll}
          scrollPosition={tab.scrollPosition}
        />
      </div>
    </div>
  )
}
