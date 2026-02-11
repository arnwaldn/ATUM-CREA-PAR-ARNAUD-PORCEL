/**
 * MessageItem - Single message display with enhanced streaming visualization
 * Includes collapsible thought process and file changes footer for assistant messages
 *
 * Working State Design:
 * - During generation: subtle breathing glow + "AI working" indicator
 * - The indicator is gentle, not intrusive, letting user focus on content
 * - When complete: indicator fades out smoothly
 */

import { useState, useMemo, useCallback, useRef, memo } from 'react'
import {
  Lightbulb,
  Wrench,
  CheckCircle2,
  XCircle,
  Info,
  FileText,
  ChevronRight,
  Sparkles,
  Copy,
  Check,
  Volume2,
  VolumeX,
  RefreshCw,
  Trash2,
  Pencil,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react'
import { getToolIcon } from '../icons/ToolIcons'
import { BrowserTaskCard, isBrowserTool } from '../tool/BrowserTaskCard'
import { MarkdownRenderer } from './MarkdownRenderer'
import { FileChangesFooter } from '../diff'
import { MessageImages } from './ImageAttachmentPreview'
import { TokenUsageIndicator } from './TokenUsageIndicator'
import { truncateText, getToolFriendlyFormat } from './thought-utils'
import { useTextToSpeech } from '../../hooks/useTextToSpeech'
import type { Message, Thought } from '../../types'
import { useTranslation } from '../../i18n'
import { VariantNavigator } from './VariantNavigator'
import atumLogoSrc from '@/assets/atum-logo.png'

interface MessageItemProps {
  message: Message
  previousCost?: number  // Previous message's cumulative cost
  hideThoughts?: boolean
  isInContainer?: boolean
  isWorking?: boolean  // True when AI is still generating (not yet complete)
  isWaitingMore?: boolean  // True when content paused (e.g., during tool call), show "..." animation
  isLastAssistant?: boolean  // True if this is the last assistant message (shows regenerate button)
  onRegenerate?: () => void
  onDelete?: (messageId: string) => void
  onEdit?: (messageId: string, newContent: string) => void
  onSwitchVariant?: (messageId: string, variantIndex: number | undefined) => void
}

// Collapsible thought history component
function ThoughtHistory({ thoughts }: { thoughts: Thought[] }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { t } = useTranslation()

  // Filter out result type (final reply is in message bubble)
  const displayThoughts = thoughts.filter(t => t.type !== 'result')

  if (displayThoughts.length === 0) return null

  // Stats
  const thinkingCount = thoughts.filter(t => t.type === 'thinking').length
  const toolCount = thoughts.filter(t => t.type === 'tool_use').length

  return (
    <div className="mt-3 border-t border-border/30 pt-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        <ChevronRight
          size={12}
          className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
        />
        <span>{t('View thought process')}</span>
        <span className="text-muted-foreground/50">
          ({thinkingCount > 0 && `${thinkingCount} ${t('thoughts')}`}
          {thinkingCount > 0 && toolCount > 0 && ', '}
          {toolCount > 0 && `${toolCount} ${t('tools')}`})
        </span>
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2 animate-slide-down">
          {displayThoughts.map((thought, index) => (
            <ThoughtItem key={`${thought.id}-${index}`} thought={thought} />
          ))}
        </div>
      )}
    </div>
  )
}


// Format tool result output for display
function formatResultOutput(output: string, maxLen = 300) {
  if (!output) return ''
  try {
    const parsed = JSON.parse(output)
    const formatted = JSON.stringify(parsed, null, 2)
    return formatted.length > maxLen ? formatted.substring(0, maxLen) + '...' : formatted
  } catch {
    return output.length > maxLen ? output.substring(0, maxLen) + '...' : output
  }
}

// Single thought item
function ThoughtItem({ thought }: { thought: Thought }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showResult, setShowResult] = useState(true)  // Default show result
  const { t } = useTranslation()

  // Check if tool has result (merged tool_result)
  const hasToolResult = thought.type === 'tool_use' && thought.toolResult

  const getTypeInfo = () => {
    switch (thought.type) {
      case 'thinking':
        return { label: t('Thinking'), color: 'text-blue-400', Icon: Lightbulb }
      case 'tool_use':
        return {
          label: `${t('Calling')} ${thought.toolName}`,
          color: 'text-amber-400',
          Icon: thought.toolName ? getToolIcon(thought.toolName) : Wrench
        }
      case 'tool_result':
        return {
          label: t('Tool result'),
          color: thought.isError ? 'text-red-400' : 'text-green-400',
          Icon: thought.isError ? XCircle : CheckCircle2
        }
      case 'system':
        return { label: t('System'), color: 'text-muted-foreground', Icon: Info }
      case 'error':
        return { label: t('Error'), color: 'text-red-400', Icon: XCircle }
      default:
        return { label: thought.type, color: 'text-muted-foreground', Icon: FileText }
    }
  }

  const info = getTypeInfo()
  // Use friendly format for tool_use
  const content = thought.type === 'tool_use'
    ? getToolFriendlyFormat(thought.toolName || '', thought.toolInput)
    : thought.type === 'tool_result'
      ? thought.toolOutput
      : thought.content

  const previewLength = 100
  const needsTruncate = content && content.length > previewLength

  return (
    <div className="flex gap-2 text-xs">
      <info.Icon size={14} className={info.color} />
      <div className="flex-1 min-w-0">
        <span className={`font-medium ${info.color}`}>{info.label}</span>
        {content && (
          <div className="mt-0.5 text-muted-foreground/70">
            <span className="whitespace-pre-wrap break-words">
              {isExpanded || !needsTruncate ? content : content.substring(0, previewLength) + '...'}
            </span>
            {needsTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-1 text-primary/60 hover:text-primary"
              >
                {isExpanded ? t('Collapse') : t('Expand')}
              </button>
            )}
          </div>
        )}
        {/* Show/Hide result button for tool_use with result */}
        {hasToolResult && thought.toolResult!.output && (
          <div className="mt-1">
            <button
              onClick={() => setShowResult(!showResult)}
              className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              {showResult ? t('Hide result') : t('Show result')}
            </button>
            {showResult && (
              <div className={`mt-1 p-1.5 rounded text-[10px] overflow-x-auto ${
                thought.toolResult!.isError
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-muted/30 text-muted-foreground'
              }`}>
                <pre className="whitespace-pre-wrap break-words">
                  {formatResultOutput(thought.toolResult!.output, isExpanded ? 10000 : 300)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export const MessageItem = memo(function MessageItem({ message, previousCost = 0, hideThoughts = false, isInContainer = false, isWorking = false, isWaitingMore = false, isLastAssistant = false, onRegenerate, onDelete, onEdit, onSwitchVariant }: MessageItemProps) {
  const isUser = message.role === 'user'
  const isStreaming = (message as any).isStreaming
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const [reaction, setReaction] = useState<'up' | 'down' | null>(null)
  const editRef = useRef<HTMLTextAreaElement>(null)
  const { t } = useTranslation()
  const { isSpeaking, toggle: toggleSpeech, isSupported: ttsSupported } = useTextToSpeech()

  // Resolve display content: variant content when viewing a variant, otherwise message content
  const activeVariant = !isUser && message.variantIndex !== undefined && message.variants
    ? message.variants[message.variantIndex]
    : undefined
  const displayContent = activeVariant ? activeVariant.content : message.content
  const displayThoughtsData = activeVariant?.thoughts ?? message.thoughts

  // Handle copying message content to clipboard
  const handleCopyMessage = useCallback(async () => {
    if (!displayContent) return
    try {
      await navigator.clipboard.writeText(displayContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy message:', err)
    }
  }, [displayContent])

  // Extract browser tools from thoughts (tool_use type with browser tool names)
  // Note: Tool calls are stored in thoughts, not in message.toolCalls
  const browserToolCalls = useMemo(() => {
    const thoughts = message.thoughts || []
    return thoughts
      .filter(t => t.type === 'tool_use' && t.toolName && isBrowserTool(t.toolName))
      .map(t => ({
        id: t.id,
        name: t.toolName!,
        status: 'success' as const,  // Thoughts are recorded after completion
        input: t.toolInput || {},
      }))
  }, [message.thoughts])

  // Check if there are running browser tools (based on isWorking state)
  const hasBrowserActivity = isWorking && browserToolCalls.length > 0

  // Message bubble content
  const bubble = (
    <div
      className={`rounded-2xl px-4 py-3 ${
        isUser ? 'message-user' : 'message-assistant'
      } ${isStreaming ? 'streaming-message' : ''} ${isWorking ? 'message-working' : ''} ${!isInContainer ? 'max-w-[85%]' : 'w-full'}`}
    >
      {/* Working indicator - shows when AI is working */}
      {isWorking && !isUser && (
        <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-border/30 working-indicator-fade">
          <img src={atumLogoSrc} alt="" className="w-3 h-3 object-contain animate-pulse-gentle opacity-60" draggable={false} />
          <span className="text-xs text-muted-foreground/70">{t('ATUM CREA is working')}</span>
        </div>
      )}

      {/* User message images (displayed before text) */}
      {isUser && message.images && message.images.length > 0 && (
        <MessageImages images={message.images} />
      )}

      {/* Message content with streaming cursor */}
      <div className="break-words leading-relaxed" data-message-content>
        {displayContent && (
          isUser ? (
            isEditing ? (
              // Edit mode: textarea with save/cancel buttons
              <div className="flex flex-col gap-2">
                <textarea
                  ref={editRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-white/10 border border-border rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  rows={Math.min(editContent.split('\n').length + 1, 8)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      if (editContent.trim() && onEdit) {
                        onEdit(message.id, editContent.trim())
                        setIsEditing(false)
                      }
                    }
                    if (e.key === 'Escape') setIsEditing(false)
                  }}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground rounded-md transition-colors"
                  >{t('Cancel')}</button>
                  <button
                    onClick={() => {
                      if (editContent.trim() && onEdit) {
                        onEdit(message.id, editContent.trim())
                        setIsEditing(false)
                      }
                    }}
                    className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/80 transition-colors"
                  >{t('Save & Regenerate')}</button>
                </div>
              </div>
            ) : (
              // User messages: simple whitespace-preserving text
              <span className="whitespace-pre-wrap">{displayContent}</span>
            )
          ) : (
            // Assistant messages: full markdown rendering
            <MarkdownRenderer content={displayContent} />
          )
        )}
        {/* Streaming cursor when actively receiving tokens */}
        {isStreaming && (
          <span className="inline-block w-0.5 h-5 ml-0.5 bg-primary streaming-cursor align-middle" />
        )}
        {/* Waiting dots when content paused but still working (e.g., tool call in progress) */}
        {isWaitingMore && !isStreaming && (
          <span className="waiting-dots ml-1 text-muted-foreground/60" />
        )}
      </div>

      {/* Browser task card - browser tools displayed separately */}
      {browserToolCalls.length > 0 && (
        <BrowserTaskCard
          browserToolCalls={browserToolCalls}
          isActive={isWorking || hasBrowserActivity}
        />
      )}

      {/* Thought history - only for assistant messages with thoughts (when not hidden) */}
      {!hideThoughts && !isUser && displayThoughtsData && displayThoughtsData.length > 0 && (
        <ThoughtHistory thoughts={displayThoughtsData} />
      )}

      {/* File changes footer - only for assistant messages with thoughts */}
      {!isUser && displayThoughtsData && displayThoughtsData.length > 0 && (
        <FileChangesFooter thoughts={displayThoughtsData} />
      )}

      {/* Action buttons footer — for completed messages (not during generation) */}
      {!isWorking && !isStreaming && (
        <div className="flex justify-between items-center mt-2 pt-1">
          {/* Left: message actions (delete, edit for user; regenerate for last AI) */}
          <div className="flex items-center gap-1">
            {/* Delete button (all messages) */}
            {onDelete && (
              <button
                onClick={() => onDelete(message.id)}
                className="flex items-center gap-1 px-1.5 py-0.5 text-xs text-muted-foreground/40
                  hover:text-red-400 hover:bg-red-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                title={t('Delete message')}
              >
                <Trash2 size={12} />
              </button>
            )}
            {/* Edit button (user messages only) */}
            {isUser && onEdit && (
              <button
                onClick={() => { setEditContent(message.content); setIsEditing(true) }}
                className="flex items-center gap-1 px-1.5 py-0.5 text-xs text-muted-foreground/40
                  hover:text-primary hover:bg-primary/10 rounded transition-all opacity-0 group-hover:opacity-100"
                title={t('Edit message')}
              >
                <Pencil size={12} />
              </button>
            )}
            {/* Regenerate button (last assistant message only) */}
            {!isUser && isLastAssistant && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1 px-1.5 py-0.5 text-xs text-muted-foreground/40
                  hover:text-primary hover:bg-primary/10 rounded transition-all opacity-0 group-hover:opacity-100"
                title={t('Regenerate response')}
              >
                <RefreshCw size={12} />
              </button>
            )}
            {/* Variant navigator (assistant messages with variants) */}
            {!isUser && message.variants && message.variants.length > 0 && onSwitchVariant && (
              <VariantNavigator
                variantCount={message.variants.length}
                activeVariantIndex={message.variantIndex}
                onSwitch={(idx) => onSwitchVariant(message.id, idx)}
              />
            )}
            {/* Thumbs up/down reactions (assistant messages) */}
            {!isUser && displayContent && (
              <>
                <button
                  onClick={() => setReaction(reaction === 'up' ? null : 'up')}
                  className={`flex items-center px-1.5 py-0.5 text-xs rounded transition-all
                    ${reaction === 'up'
                      ? 'text-green-400 bg-green-500/10'
                      : 'text-muted-foreground/40 hover:text-green-400 hover:bg-green-500/10 opacity-0 group-hover:opacity-100'
                    }`}
                  title={t('Good response')}
                >
                  <ThumbsUp size={12} />
                </button>
                <button
                  onClick={() => setReaction(reaction === 'down' ? null : 'down')}
                  className={`flex items-center px-1.5 py-0.5 text-xs rounded transition-all
                    ${reaction === 'down'
                      ? 'text-red-400 bg-red-500/10'
                      : 'text-muted-foreground/40 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100'
                    }`}
                  title={t('Poor response')}
                >
                  <ThumbsDown size={12} />
                </button>
              </>
            )}
          </div>

          {/* Right: token usage + copy + TTS */}
          {!isUser && message.tokenUsage && (
            <div className="flex items-center gap-2">
              <TokenUsageIndicator tokenUsage={message.tokenUsage} previousCost={previousCost} />
              {ttsSupported && displayContent && (
                <button
                  onClick={() => toggleSpeech(displayContent!)}
                  className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-md transition-all
                    ${isSpeaking
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground/60 hover:text-foreground hover:bg-white/5'
                    }
                  `}
                  title={isSpeaking ? t('Stop reading') : t('Read aloud')}
                >
                  {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
              )}
              <button
                onClick={handleCopyMessage}
                className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground/60
                  hover:text-foreground hover:bg-white/5 rounded-md transition-all"
                title={t('Copy message')}
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-green-400" />
                    <span className="text-green-400">{t('Copied')}</span>
                  </>
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )

  // When in container, just return the bubble without wrapper
  if (isInContainer) {
    // Even in container, we need data-message-id for search navigation
    return (
      <div data-message-id={message.id}>
        {bubble}
      </div>
    )
  }

  // Normal case: wrap with flex container
  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in group`}
      data-message-id={message.id}
    >
      {bubble}
    </div>
  )
})
