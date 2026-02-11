/**
 * MCP Category Header
 *
 * Separator component showing category label, enabled count, and optional Core badge.
 * Used by McpServerList to group MCP servers by category.
 */

import {
  Star,
  Search,
  Wrench,
  Rocket,
  Plug,
  Bot,
} from 'lucide-react'
import type { McpCategory } from '../../../shared/constants/mcp-registry'
import { useTranslation } from '../../i18n'
import atumLogoSrc from '@/assets/atum-logo.png'

// Small inline component to render the ATUM scarab as a lucide-like icon
function AtumIcon({ className = '' }: { className?: string }) {
  return <img src={atumLogoSrc} alt="ATUM" draggable={false} className={`object-contain ${className}`} />
}

const CATEGORY_ICONS: Record<McpCategory, typeof Star | typeof AtumIcon> = {
  'core': Star,
  'search': Search,
  'dev-tools': Wrench,
  'deployment': Rocket,
  'external-services': Plug,
  'automation': Bot,
  'specialty': AtumIcon,
}

interface McpCategoryHeaderProps {
  category: McpCategory
  labelKey: string
  enabledCount: number
  totalCount: number
}

export function McpCategoryHeader({
  category,
  labelKey,
  enabledCount,
  totalCount,
}: McpCategoryHeaderProps) {
  const { t } = useTranslation()
  const Icon = CATEGORY_ICONS[category] || Star
  const isCore = category === 'core'

  return (
    <div className="flex items-center gap-2 pt-4 pb-1.5 first:pt-0">
      <Icon className={`w-4 h-4 flex-shrink-0 ${isCore ? 'text-primary' : 'text-muted-foreground'}`} />
      <span className={`text-sm font-semibold uppercase tracking-wide ${isCore ? 'text-primary' : 'text-muted-foreground'}`}>
        {t(labelKey)}
      </span>
      <div className="flex-1 border-t border-border/50" />
      <span className="text-xs text-muted-foreground tabular-nums">
        {enabledCount}/{totalCount}
      </span>
    </div>
  )
}
