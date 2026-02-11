/**
 * FileAttachmentPreview - Display attached text files in input area
 * Shows file chips with name, size, and remove button
 */

import { X, FileText } from 'lucide-react'
import type { FileAttachment } from '../../types'
import { useTranslation } from '../../i18n'

interface FileAttachmentPreviewProps {
  files: FileAttachment[]
  onRemove: (id: string) => void
}

export function FileAttachmentPreview({ files, onRemove }: FileAttachmentPreviewProps) {
  const { t } = useTranslation()

  if (files.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 p-2 animate-fade-in">
      {files.map((file) => (
        <div
          key={file.id}
          className="relative group flex items-center gap-2 px-3 py-1.5 rounded-lg
            bg-secondary/50 border border-border/50 text-sm
            transition-all duration-200 hover:border-primary/30"
        >
          <FileText size={14} className="text-muted-foreground flex-shrink-0" />
          <span className="truncate max-w-[120px] text-foreground">{file.name}</span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {formatSize(file.size)}
          </span>
          <button
            onClick={() => onRemove(file.id)}
            className="ml-1 w-4 h-4 rounded-full flex items-center justify-center
              text-muted-foreground hover:text-destructive hover:bg-destructive/10
              transition-colors duration-150"
            title={t('Remove file')}
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        </div>
      ))}
    </div>
  )
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}
