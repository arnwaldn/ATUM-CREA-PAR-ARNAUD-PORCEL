/**
 * Input Area - Enhanced message input with bottom toolbar
 *
 * Layout (following industry standard - Qwen, ChatGPT, Baidu):
 * ┌──────────────────────────────────────────────────────┐
 * │ [Image previews]                                     │
 * │ ┌──────────────────────────────────────────────────┐ │
 * │ │ Textarea                                         │ │
 * │ └──────────────────────────────────────────────────┘ │
 * │ [+] [⚛]─────────────────────────────────  [Send] │
 * │      Bottom toolbar: always visible, expandable     │
 * └──────────────────────────────────────────────────────┘
 *
 * Features:
 * - Auto-resize textarea
 * - Keyboard shortcuts (Enter to send, Shift+Enter newline)
 * - Image paste/drop support with compression
 * - Extended thinking mode toggle (theme-colored)
 * - Bottom toolbar for future extensibility
 */

import { useState, useRef, useEffect, useCallback, KeyboardEvent, ClipboardEvent, DragEvent } from 'react'
import { Plus, ImagePlus, FileText, Loader2, AlertCircle, Atom, Globe, Mic } from 'lucide-react'
import { useOnboardingStore } from '../../stores/onboarding.store'
import { useAIBrowserStore } from '../../stores/ai-browser.store'
import { getOnboardingPrompt } from '../onboarding/onboardingData'
import { ImageAttachmentPreview } from './ImageAttachmentPreview'
import { FileAttachmentPreview } from './FileAttachmentPreview'
import { processImage, isValidImageType, formatFileSize } from '../../utils/imageProcessor'
import { useVoiceDictation } from '../../hooks/useVoiceDictation'
import type { ImageAttachment, FileAttachment } from '../../types'
import { TEXT_FILE_EXTENSIONS, MAX_FILE_SIZE, MAX_FILES } from '../../types'
import { useTranslation } from '../../i18n'

interface InputAreaProps {
  onSend: (content: string, images?: ImageAttachment[], thinkingEnabled?: boolean, files?: FileAttachment[]) => void
  onStop: () => void
  isGenerating: boolean
  placeholder?: string
  isCompact?: boolean
}

// Image constraints
const MAX_IMAGE_SIZE = 20 * 1024 * 1024  // 20MB max per image (before compression)
const MAX_IMAGES = 10  // Max images per message

// Error message type
interface ImageError {
  id: string
  message: string
}

export function InputArea({ onSend, onStop, isGenerating, placeholder, isCompact = false }: InputAreaProps) {
  const { t } = useTranslation()
  const [content, setContent] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [images, setImages] = useState<ImageAttachment[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessingImages, setIsProcessingImages] = useState(false)
  const [imageError, setImageError] = useState<ImageError | null>(null)
  const [files, setFiles] = useState<FileAttachment[]>([])
  const [thinkingEnabled, setThinkingEnabled] = useState(false)  // Extended thinking mode
  const [showAttachMenu, setShowAttachMenu] = useState(false)  // Attachment menu visibility
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)
  const attachMenuRef = useRef<HTMLDivElement>(null)

  // AI Browser state
  const { enabled: aiBrowserEnabled, setEnabled: setAIBrowserEnabled } = useAIBrowserStore()

  // Voice dictation (STT)
  const handleTranscript = useCallback((text: string) => {
    setContent(prev => prev ? `${prev} ${text}` : text)
    // Focus textarea after transcript
    textareaRef.current?.focus()
  }, [])

  const {
    state: voiceState,
    toggleRecording,
    isRecording,
    isTranscribing,
  } = useVoiceDictation({
    onTranscript: handleTranscript,
    onError: (err) => showError(err),
  })

  // Auto-clear error after 3 seconds
  useEffect(() => {
    if (imageError) {
      const timer = setTimeout(() => setImageError(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [imageError])

  // Close attachment menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) {
        setShowAttachMenu(false)
      }
    }

    if (showAttachMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAttachMenu])

  // Show error to user
  const showError = (message: string) => {
    setImageError({ id: `err-${Date.now()}`, message })
  }

  // Onboarding state
  const { isActive: isOnboarding, currentStep } = useOnboardingStore()
  const isOnboardingSendStep = isOnboarding && currentStep === 'send-message'

  // In onboarding send step, show prefilled prompt
  const onboardingPrompt = getOnboardingPrompt(t)
  const displayContent = isOnboardingSendStep ? onboardingPrompt : content

  // Process file to ImageAttachment with professional compression
  const processFileWithCompression = async (file: File): Promise<ImageAttachment | null> => {
    // Validate type
    if (!isValidImageType(file)) {
      showError(t('Unsupported image format: {{type}}', { type: file.type || t('Unknown') }))
      return null
    }

    // Validate size (before compression)
    if (file.size > MAX_IMAGE_SIZE) {
      showError(t('Image too large ({{size}}), max 20MB', { size: formatFileSize(file.size) }))
      return null
    }

    try {
      // Use professional image processor for compression
      const processed = await processImage(file)

      return {
        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'image',
        mediaType: processed.mediaType,
        data: processed.data,
        name: file.name,
        size: processed.compressedSize
      }
    } catch (error) {
      console.error(`Failed to process image: ${file.name}`, error)
      showError(t('Failed to process image: {{name}}', { name: file.name }))
      return null
    }
  }

  // Add images (with limit check and loading state)
  const addImages = async (files: File[]) => {
    const remainingSlots = MAX_IMAGES - images.length
    if (remainingSlots <= 0) return

    const filesToProcess = files.slice(0, remainingSlots)

    // Show loading state during compression
    setIsProcessingImages(true)

    try {
      const newImages = await Promise.all(filesToProcess.map(processFileWithCompression))
      const validImages = newImages.filter((img): img is ImageAttachment => img !== null)

      if (validImages.length > 0) {
        setImages(prev => [...prev, ...validImages])
      }
    } finally {
      setIsProcessingImages(false)
    }
  }

  // Remove image
  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  // Read a text file as UTF-8
  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error(`Failed to read ${file.name}`))
      reader.readAsText(file, 'utf-8')
    })
  }

  // Get file extension
  const getExtension = (name: string): string => {
    const parts = name.split('.')
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
  }

  // Add text files
  const addFiles = async (rawFiles: File[]) => {
    const remainingSlots = MAX_FILES - files.length
    if (remainingSlots <= 0) {
      showError(t('Maximum {{max}} files per message', { max: String(MAX_FILES) }))
      return
    }

    const filesToProcess = rawFiles.slice(0, remainingSlots)
    setIsProcessingImages(true)

    try {
      const results: FileAttachment[] = []
      for (const file of filesToProcess) {
        const ext = getExtension(file.name)
        if (!TEXT_FILE_EXTENSIONS.has(ext)) {
          showError(t('Unsupported file type: .{{ext}}', { ext }))
          continue
        }
        if (file.size > MAX_FILE_SIZE) {
          showError(t('File too large: {{name}} (max 1MB)', { name: file.name }))
          continue
        }
        try {
          const content = await readTextFile(file)
          results.push({
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            content,
            size: file.size,
            extension: ext,
          })
        } catch {
          showError(t('Failed to read file: {{name}}', { name: file.name }))
        }
      }
      if (results.length > 0) {
        setFiles(prev => [...prev, ...results])
      }
    } finally {
      setIsProcessingImages(false)
    }
  }

  // Remove file
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  // Handle doc file input change
  const handleDocInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files || [])
    if (rawFiles.length > 0) {
      await addFiles(rawFiles)
    }
    if (docInputRef.current) {
      docInputRef.current.value = ''
    }
  }

  // Handle file button click (from attachment menu)
  const handleFileButtonClick = () => {
    setShowAttachMenu(false)
    docInputRef.current?.click()
  }

  // Handle paste event
  const handlePaste = async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    const imageFiles: File[] = []

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          imageFiles.push(file)
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault()  // Prevent default only if we're handling images
      await addImages(imageFiles)
    }
  }

  // Handle drag events
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    if (!isDragOver) setIsDragOver(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    const imageFiles = droppedFiles.filter(file => isValidImageType(file))
    const textFiles = droppedFiles.filter(file => {
      const ext = getExtension(file.name)
      return TEXT_FILE_EXTENSIONS.has(ext)
    })

    if (imageFiles.length > 0) {
      await addImages(imageFiles)
    }
    if (textFiles.length > 0) {
      await addFiles(textFiles)
    }
  }

  // Handle file input change
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      await addImages(files)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle image button click (from attachment menu)
  const handleImageButtonClick = () => {
    setShowAttachMenu(false)
    fileInputRef.current?.click()
  }

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [displayContent])

  // Focus on mount
  useEffect(() => {
    if (!isGenerating && !isOnboardingSendStep) {
      textareaRef.current?.focus()
    }
  }, [isGenerating, isOnboardingSendStep])

  // Handle send
  const handleSend = () => {
    const textToSend = isOnboardingSendStep ? onboardingPrompt : content.trim()
    const hasContent = textToSend || images.length > 0 || files.length > 0

    if (hasContent && !isGenerating) {
      // Prepend file contents to message text
      let finalText = textToSend
      if (files.length > 0) {
        const fileBlocks = files.map(f =>
          `[File: ${f.name}]\n\`\`\`${f.extension}\n${f.content}\n\`\`\``
        ).join('\n\n')
        finalText = files.length > 0 && textToSend
          ? `${fileBlocks}\n\n${textToSend}`
          : fileBlocks
      }

      onSend(finalText, images.length > 0 ? images : undefined, thinkingEnabled, files.length > 0 ? files : undefined)

      if (!isOnboardingSendStep) {
        setContent('')
        setImages([])
        setFiles([])
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
        }
      }
    }
  }

  // Detect mobile device (touch + narrow screen)
  const isMobile = () => {
    return 'ontouchstart' in window && window.innerWidth < 768
  }

  // Handle key press
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Ignore key events during IME composition (Chinese/Japanese/Korean input)
    // This prevents Enter from sending the message while confirming IME candidates
    if (e.nativeEvent.isComposing) return

    // Mobile: Enter for newline, send via button only
    // PC: Enter to send, Shift+Enter for newline
    if (e.key === 'Enter' && !e.shiftKey && !isMobile()) {
      e.preventDefault()
      handleSend()
    }
    // Esc to stop
    if (e.key === 'Escape' && isGenerating) {
      e.preventDefault()
      onStop()
    }
  }

  // In onboarding mode, can always send (prefilled content)
  // Can send if has text OR has images (and not processing/generating)
  const canSend = isOnboardingSendStep || ((content.trim().length > 0 || images.length > 0 || files.length > 0) && !isGenerating && !isProcessingImages)
  const hasImages = images.length > 0
  const hasFiles = files.length > 0

  return (
    <div className={`
      border-t border-border/50 bg-background/80 backdrop-blur-sm
      transition-[padding] duration-300 ease-out
      ${isCompact ? 'px-3 py-2' : 'px-4 py-3'}
    `}>
      <div className={isCompact ? '' : 'max-w-3xl mx-auto'}>
        {/* Error toast notification */}
        {imageError && (
          <div className="mb-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20
            flex items-start gap-2 animate-fade-in">
            <AlertCircle size={16} className="text-destructive mt-0.5 flex-shrink-0" />
            <span className="text-sm text-destructive flex-1">{imageError.message}</span>
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />
        <input
          ref={docInputRef}
          type="file"
          accept=".txt,.csv,.md,.json,.xml,.yaml,.yml,.toml,.py,.js,.jsx,.ts,.tsx,.html,.css,.sql,.sh,.log,.env,.rs,.go,.rb,.java,.c,.cpp,.h,.hpp,.php,.swift,.kt,.lua,.r,.dart,.vue,.svelte,.ini,.cfg,.bat,.ps1"
          multiple
          className="hidden"
          onChange={handleDocInputChange}
        />

        {/* Input container */}
        <div
          className={`
            relative flex flex-col rounded-2xl transition-all duration-200
            ${isFocused
              ? 'ring-1 ring-primary/30 bg-card shadow-sm'
              : 'bg-secondary/50 hover:bg-secondary/70'
            }
            ${isGenerating ? 'opacity-60' : ''}
            ${isDragOver ? 'ring-2 ring-primary/50 bg-primary/5' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Image preview area */}
          {hasImages && (
            <ImageAttachmentPreview
              images={images}
              onRemove={removeImage}
            />
          )}

          {/* File preview area */}
          {hasFiles && (
            <FileAttachmentPreview
              files={files}
              onRemove={removeFile}
            />
          )}

          {/* Image processing indicator */}
          {isProcessingImages && (
            <div className="px-4 py-2 flex items-center gap-2 text-xs text-muted-foreground border-b border-border/30">
              <Loader2 size={14} className="animate-spin" />
              <span>{t('Processing image...')}</span>
            </div>
          )}

          {/* Drag overlay */}
          {isDragOver && (
            <div className="absolute inset-0 flex items-center justify-center
              bg-primary/5 rounded-2xl border-2 border-dashed border-primary/30
              pointer-events-none z-10">
              <div className="flex flex-col items-center gap-2 text-primary/70">
                <ImagePlus size={24} />
                <span className="text-sm font-medium">{t('Drop to add files')}</span>
              </div>
            </div>
          )}

          {/* Textarea area */}
          <div className="px-3 pt-3 pb-1">
            <textarea
              ref={textareaRef}
              value={displayContent}
              onChange={(e) => !isOnboardingSendStep && setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder || t('Type a message, let ATUM CREA help you...')}
              disabled={isGenerating}
              readOnly={isOnboardingSendStep}
              rows={1}
              className={`w-full bg-transparent resize-none
                focus:outline-none text-foreground placeholder:text-muted-foreground/50
                disabled:cursor-not-allowed min-h-[24px]
                ${isOnboardingSendStep ? 'cursor-default' : ''}`}
              style={{ maxHeight: '200px' }}
            />
          </div>

          {/* Bottom toolbar - always visible, industry standard layout */}
          <InputToolbar
            isGenerating={isGenerating}
            isOnboarding={isOnboardingSendStep}
            isProcessingImages={isProcessingImages}
            thinkingEnabled={thinkingEnabled}
            onThinkingToggle={() => setThinkingEnabled(!thinkingEnabled)}
            aiBrowserEnabled={aiBrowserEnabled}
            onAIBrowserToggle={() => setAIBrowserEnabled(!aiBrowserEnabled)}
            showAttachMenu={showAttachMenu}
            onAttachMenuToggle={() => setShowAttachMenu(!showAttachMenu)}
            onImageClick={handleImageButtonClick}
            onFileClick={handleFileButtonClick}
            imageCount={images.length}
            maxImages={MAX_IMAGES}
            fileCount={files.length}
            maxFiles={MAX_FILES}
            attachMenuRef={attachMenuRef}
            voiceState={voiceState}
            onVoiceToggle={toggleRecording}
            canSend={canSend}
            onSend={handleSend}
            onStop={onStop}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Input Toolbar - Bottom action bar
 * Extracted as a separate component for maintainability and future extensibility
 *
 * Layout: [+attachment] ──────────────────── [⚛ thinking] [send]
 */
interface InputToolbarProps {
  isGenerating: boolean
  isOnboarding: boolean
  isProcessingImages: boolean
  thinkingEnabled: boolean
  onThinkingToggle: () => void
  aiBrowserEnabled: boolean
  onAIBrowserToggle: () => void
  showAttachMenu: boolean
  onAttachMenuToggle: () => void
  onImageClick: () => void
  onFileClick: () => void
  imageCount: number
  maxImages: number
  fileCount: number
  maxFiles: number
  attachMenuRef: React.RefObject<HTMLDivElement | null>
  voiceState: 'idle' | 'recording' | 'transcribing'
  onVoiceToggle: () => void
  canSend: boolean
  onSend: () => void
  onStop: () => void
}

function InputToolbar({
  isGenerating,
  isOnboarding,
  isProcessingImages,
  thinkingEnabled,
  onThinkingToggle,
  aiBrowserEnabled,
  onAIBrowserToggle,
  showAttachMenu,
  onAttachMenuToggle,
  onImageClick,
  onFileClick,
  imageCount,
  maxImages,
  fileCount,
  maxFiles,
  attachMenuRef,
  voiceState,
  onVoiceToggle,
  canSend,
  onSend,
  onStop
}: InputToolbarProps) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-between px-2 pb-2 pt-1">
      {/* Left section: attachment button + thinking toggle */}
      <div className="flex items-center gap-1">
        {/* Attachment menu */}
        {!isGenerating && !isOnboarding && (
          <div className="relative" ref={attachMenuRef}>
            <button
              onClick={onAttachMenuToggle}
              disabled={isProcessingImages}
              className={`w-8 h-8 flex items-center justify-center rounded-lg
                transition-all duration-150
                ${showAttachMenu
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/50'
                }
                ${isProcessingImages ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title={t('Add attachment')}
            >
              <Plus size={18} className={`transition-transform duration-200 ${showAttachMenu ? 'rotate-45' : ''}`} />
            </button>

            {/* Attachment menu dropdown */}
            {showAttachMenu && (
              <div className="absolute bottom-full left-0 mb-2 py-1.5 bg-popover border border-border
                rounded-xl shadow-lg min-w-[160px] z-20 animate-fade-in">
                <button
                  onClick={onImageClick}
                  disabled={imageCount >= maxImages}
                  className={`w-full px-3 py-2 flex items-center gap-3 text-sm
                    transition-colors duration-150
                    ${imageCount >= maxImages
                      ? 'text-muted-foreground/40 cursor-not-allowed'
                      : 'text-foreground hover:bg-muted/50'
                    }
                  `}
                >
                  <ImagePlus size={16} className="text-muted-foreground" />
                  <span>{t('Add image')}</span>
                  {imageCount > 0 && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {imageCount}/{maxImages}
                    </span>
                  )}
                </button>
                <button
                  onClick={onFileClick}
                  disabled={fileCount >= maxFiles}
                  className={`w-full px-3 py-2 flex items-center gap-3 text-sm
                    transition-colors duration-150
                    ${fileCount >= maxFiles
                      ? 'text-muted-foreground/40 cursor-not-allowed'
                      : 'text-foreground hover:bg-muted/50'
                    }
                  `}
                >
                  <FileText size={16} className="text-muted-foreground" />
                  <span>{t('Add file')}</span>
                  {fileCount > 0 && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {fileCount}/{maxFiles}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* AI Browser toggle */}
        {!isGenerating && !isOnboarding && (
          <button
            onClick={onAIBrowserToggle}
            className={`h-8 flex items-center gap-1.5 px-2.5 rounded-lg
              transition-colors duration-200 relative
              ${aiBrowserEnabled
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50'
              }
            `}
            title={aiBrowserEnabled ? t('AI Browser enabled (click to disable)') : t('Enable AI Browser')}
          >
            <Globe size={15} />
            <span className="text-xs">{t('Browser')}</span>
            {/* Active indicator dot */}
            {aiBrowserEnabled && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full" />
            )}
          </button>
        )}

        {/* Thinking mode toggle - always show full label, no expansion */}
        {!isGenerating && !isOnboarding && (
          <button
            onClick={onThinkingToggle}
            className={`h-8 flex items-center gap-1.5 px-2.5 rounded-lg
              transition-colors duration-200
              ${thinkingEnabled
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50'
              }
            `}
            title={thinkingEnabled ? t('Disable Deep Thinking') : t('Enable Deep Thinking')}
          >
            <Atom size={15} />
            <span className="text-xs">{t('Deep Thinking')}</span>
          </button>
        )}

        {/* Voice dictation toggle */}
        {!isGenerating && !isOnboarding && (
          <button
            onClick={onVoiceToggle}
            disabled={voiceState === 'transcribing'}
            className={`h-8 flex items-center gap-1.5 px-2.5 rounded-lg
              transition-colors duration-200 relative
              ${voiceState === 'recording'
                ? 'bg-destructive/10 text-destructive'
                : voiceState === 'transcribing'
                  ? 'bg-primary/10 text-primary opacity-70 cursor-wait'
                  : 'text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50'
              }
            `}
            title={
              voiceState === 'recording'
                ? t('Stop recording')
                : voiceState === 'transcribing'
                  ? t('Transcribing...')
                  : t('Voice input')
            }
          >
            {voiceState === 'transcribing' ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Mic size={15} />
            )}
            {/* Recording pulse indicator */}
            {voiceState === 'recording' && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-destructive rounded-full animate-pulse" />
            )}
          </button>
        )}
      </div>

      {/* Right section: action button only */}
      <div className="flex items-center">
        {isGenerating ? (
          <button
            onClick={onStop}
            className="w-8 h-8 flex items-center justify-center
              bg-destructive/10 text-destructive rounded-lg
              hover:bg-destructive/20 active:bg-destructive/30
              transition-all duration-150"
            title={t('Stop generation (Esc)')}
          >
            <div className="w-3 h-3 border-2 border-current rounded-sm" />
          </button>
        ) : (
          <button
            data-onboarding="send-button"
            onClick={onSend}
            disabled={!canSend}
            className={`
              w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200
              ${canSend
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95'
                : 'bg-muted/50 text-muted-foreground/40 cursor-not-allowed'
              }
            `}
            title={thinkingEnabled ? t('Send (Deep Thinking)') : t('Send')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
