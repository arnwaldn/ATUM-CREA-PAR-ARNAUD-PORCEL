/**
 * HTML Inspector Panel - Element info, computed styles, and console output
 *
 * Displays information captured from the iframe via postMessage.
 * Three tabs: Elements, Styles, Console.
 */

import { useState } from 'react'
import { Box, Palette, Terminal, Trash2 } from 'lucide-react'
import { useTranslation } from '../../../i18n'

// ============================================
// Types
// ============================================

export interface InspectorElement {
  tagName: string
  id?: string
  classes: string[]
  styles: Record<string, string>
  dimensions: { x: number; y: number; width: number; height: number }
  textPreview: string
  attributes: Record<string, string>
}

export interface ConsoleEntry {
  level: 'log' | 'warn' | 'error' | 'info'
  args: string[]
  timestamp: number
}

type InspectorTab = 'elements' | 'styles' | 'console'

interface HtmlInspectorProps {
  selectedElement: InspectorElement | null
  hoveredElement: InspectorElement | null
  consoleEntries: ConsoleEntry[]
  onClearConsole: () => void
}

// ============================================
// Sub-components
// ============================================

function ElementsView({ element }: { element: InspectorElement | null }) {
  const { t } = useTranslation()

  if (!element) {
    return (
      <p className="text-xs text-muted-foreground/50 p-3">{t('Click an element in the preview to inspect it')}</p>
    )
  }

  return (
    <div className="p-3 space-y-3 text-xs">
      {/* Tag */}
      <div>
        <span className="text-purple-400 font-mono">{'<'}</span>
        <span className="text-blue-400 font-mono font-medium">{element.tagName}</span>
        {element.id && (
          <span className="text-green-400 font-mono"> id="{element.id}"</span>
        )}
        {element.classes.length > 0 && (
          <span className="text-yellow-400 font-mono"> class="{element.classes.join(' ')}"</span>
        )}
        {Object.entries(element.attributes).map(([key, val]) => (
          <span key={key} className="text-muted-foreground font-mono"> {key}="{val}"</span>
        ))}
        <span className="text-purple-400 font-mono">{'>'}</span>
      </div>

      {/* Dimensions */}
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground">{t('Size')}:</span>
        <span className="font-mono">{element.dimensions.width} x {element.dimensions.height}</span>
        <span className="text-muted-foreground">{t('Position')}:</span>
        <span className="font-mono">{element.dimensions.x}, {element.dimensions.y}</span>
      </div>

      {/* Text preview */}
      {element.textPreview && (
        <div>
          <span className="text-muted-foreground">{t('Text')}: </span>
          <span className="text-foreground/70 italic">
            {element.textPreview.length > 80 ? element.textPreview.slice(0, 80) + '...' : element.textPreview}
          </span>
        </div>
      )}
    </div>
  )
}

function StylesView({ element }: { element: InspectorElement | null }) {
  const { t } = useTranslation()

  if (!element) {
    return (
      <p className="text-xs text-muted-foreground/50 p-3">{t('Select an element to view its computed styles')}</p>
    )
  }

  const entries = Object.entries(element.styles)

  return (
    <div className="p-3">
      <div className="space-y-0.5">
        {entries.map(([prop, value]) => (
          <div key={prop} className="flex items-baseline gap-2 text-xs font-mono py-0.5">
            <span className="text-blue-400 shrink-0">{prop}</span>
            <span className="text-muted-foreground/40">:</span>
            <span className="text-foreground/80 truncate">{value}</span>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-muted-foreground/50">{t('No computed styles')}</p>
        )}
      </div>
    </div>
  )
}

function ConsoleView({ entries, onClear }: { entries: ConsoleEntry[]; onClear: () => void }) {
  const { t } = useTranslation()

  const levelColors: Record<string, string> = {
    log: 'text-foreground/70',
    info: 'text-blue-400',
    warn: 'text-yellow-400',
    error: 'text-red-400',
  }

  return (
    <div className="flex flex-col h-full">
      {/* Console toolbar */}
      <div className="flex items-center justify-between px-3 py-1 border-b border-border/30">
        <span className="text-[10px] text-muted-foreground/50">{entries.length} {t('entries')}</span>
        <button
          onClick={onClear}
          className="p-0.5 rounded hover:bg-secondary transition-colors"
          title={t('Clear console')}
        >
          <Trash2 size={10} className="text-muted-foreground/40" />
        </button>
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-auto p-2 space-y-0.5">
        {entries.length === 0 && (
          <p className="text-[10px] text-muted-foreground/40 text-center py-4">{t('Console output will appear here')}</p>
        )}
        {entries.map((entry, i) => (
          <div
            key={i}
            className={`text-[11px] font-mono py-0.5 px-1.5 rounded ${
              entry.level === 'error' ? 'bg-red-500/5' :
              entry.level === 'warn' ? 'bg-yellow-500/5' : ''
            }`}
          >
            <span className={levelColors[entry.level] || 'text-foreground/70'}>
              {entry.args.join(' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function HtmlInspector({ selectedElement, hoveredElement, consoleEntries, onClearConsole }: HtmlInspectorProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<InspectorTab>('elements')

  // Show hovered element info if no selection yet
  const displayElement = selectedElement || hoveredElement

  const tabs: { id: InspectorTab; label: string; icon: typeof Box }[] = [
    { id: 'elements', label: t('Elements'), icon: Box },
    { id: 'styles', label: t('Styles'), icon: Palette },
    { id: 'console', label: t('Console'), icon: Terminal },
  ]

  return (
    <div className="flex flex-col h-full border-t border-border bg-card/30">
      {/* Tab bar */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-border/50 bg-card/50">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1 px-2 py-0.5 text-[11px] rounded transition-colors ${
              activeTab === tab.id
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground/60 hover:text-muted-foreground hover:bg-secondary/50'
            }`}
          >
            <tab.icon size={10} />
            {tab.label}
            {tab.id === 'console' && consoleEntries.length > 0 && (
              <span className="ml-1 px-1 min-w-[14px] text-center text-[9px] rounded-full bg-muted-foreground/20">
                {consoleEntries.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'elements' && <ElementsView element={displayElement} />}
        {activeTab === 'styles' && <StylesView element={displayElement} />}
        {activeTab === 'console' && <ConsoleView entries={consoleEntries} onClear={onClearConsole} />}
      </div>
    </div>
  )
}
