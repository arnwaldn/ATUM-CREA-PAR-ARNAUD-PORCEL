/**
 * Variant Navigator - Navigate between regenerated responses
 *
 * Shows "< 2 / 3 >" navigation for messages with multiple variants.
 * Variants are saved automatically when the user regenerates a response.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface VariantNavigatorProps {
  /** Total number of variants (not including main content) */
  variantCount: number
  /** Currently active variant index (undefined = main/latest content) */
  activeVariantIndex: number | undefined
  /** Switch to a different variant */
  onSwitch: (variantIndex: number | undefined) => void
}

export function VariantNavigator({ variantCount, activeVariantIndex, onSwitch }: VariantNavigatorProps) {
  // Total versions = variants + 1 (the main/latest response)
  const total = variantCount + 1

  if (total <= 1) return null

  // Current position: 0..variantCount-1 = variants, variantCount = main content
  const currentPos = activeVariantIndex !== undefined ? activeVariantIndex : variantCount
  const displayPos = currentPos + 1 // 1-based for UI

  const hasPrev = currentPos > 0
  const hasNext = currentPos < total - 1

  const handlePrev = () => {
    const newPos = currentPos - 1
    onSwitch(newPos < variantCount ? newPos : undefined)
  }

  const handleNext = () => {
    const newPos = currentPos + 1
    onSwitch(newPos < variantCount ? newPos : undefined)
  }

  return (
    <div className="flex items-center gap-1 mt-1">
      <button
        onClick={handlePrev}
        disabled={!hasPrev}
        className={`p-0.5 rounded transition-colors ${
          hasPrev
            ? 'hover:bg-muted text-muted-foreground hover:text-foreground'
            : 'text-muted-foreground/20 cursor-not-allowed'
        }`}
        aria-label="Previous variant"
      >
        <ChevronLeft size={14} />
      </button>
      <span className="text-[11px] text-muted-foreground/60 tabular-nums min-w-[3ch] text-center">
        {displayPos}/{total}
      </span>
      <button
        onClick={handleNext}
        disabled={!hasNext}
        className={`p-0.5 rounded transition-colors ${
          hasNext
            ? 'hover:bg-muted text-muted-foreground hover:text-foreground'
            : 'text-muted-foreground/20 cursor-not-allowed'
        }`}
        aria-label="Next variant"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  )
}
