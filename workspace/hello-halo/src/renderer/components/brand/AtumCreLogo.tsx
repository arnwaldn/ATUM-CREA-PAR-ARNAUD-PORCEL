/**
 * AtumCreLogo - Brand logo component (ATUM golden scarab beetle)
 * Used across the app for loading states and branding
 *
 * Usage:
 *   <AtumCreLogo size="sm" />      // 28px - for inline/small areas
 *   <AtumCreLogo size="md" />      // 48px - for medium contexts
 *   <AtumCreLogo size="lg" />      // 96px - for large displays (like splash)
 *   <AtumCreLogo size={64} />      // custom size in pixels
 */

import atumLogoSrc from '@/assets/atum-logo.png'

interface AtumCreLogoProps {
  /** Size preset or custom pixel value */
  size?: 'sm' | 'md' | 'lg' | number
  /** Optional additional class names */
  className?: string
  /** Whether to show breathing animation (default: true) */
  animated?: boolean
}

// Size presets in pixels
const SIZE_PRESETS = {
  sm: 28,
  md: 48,
  lg: 96
} as const

export function AtumCreLogo({ size = 'md', className = '', animated = true }: AtumCreLogoProps) {
  const pixelSize = typeof size === 'number' ? size : SIZE_PRESETS[size]

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {/* Subtle glow behind the logo */}
      {animated && (
        <div
          className="absolute inset-0 rounded-full bg-amber-500/15 blur-xl atum-breathe"
          style={{ width: pixelSize, height: pixelSize }}
        />
      )}

      {/* Scarab beetle logo */}
      <img
        src={atumLogoSrc}
        alt="ATUM"
        draggable={false}
        className={`relative object-contain select-none ${animated ? 'atum-breathe' : ''}`}
        style={{
          width: pixelSize,
          height: pixelSize,
          filter: 'drop-shadow(0 0 8px rgba(180, 140, 50, 0.3))'
        }}
      />
    </div>
  )
}
