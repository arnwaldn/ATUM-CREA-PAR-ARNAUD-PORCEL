/**
 * MCP Server List Component
 * Displays list of configured MCP servers with expand/collapse editing
 * Uses CSS variables for theme support (light/dark)
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  Server,
  Plus,
  ChevronDown,
  ChevronRight,
  Trash2,
  Terminal,
  Globe,
  Radio,
  Check,
  X,
  Code,
  Settings2,
  AlertCircle,
  Loader2,
  Power,
  PowerOff,
  CircleDot,
  Circle,
  AlertTriangle,
  Clock,
  RefreshCw
} from 'lucide-react'
import type { McpServerConfig, McpServersConfig, McpServerStatus } from '../../types'
import { useAppStore } from '../../stores/app.store'
import { api } from '../../api'
import { validateMcpServerConfig } from '../../utils/mcpValidation'
import { useTranslation } from '../../i18n'
import { Link, Info, Shield } from 'lucide-react'
import { MCP_REGISTRY, MCP_CATEGORIES, getMcpMeta, getCoreMcpNames, getRecommendedMcpNames } from '../../../shared/constants/mcp-registry'
import type { McpCategory } from '../../../shared/constants/mcp-registry'
import { McpCategoryHeader } from './McpCategoryHeader'

interface McpServerListProps {
  servers: McpServersConfig
  onSave: (servers: McpServersConfig) => Promise<void>
}

// Status indicator component
function StatusIndicator({ status, t }: { status: McpServerStatus['status'] | null; t: (key: string) => string }) {
  if (!status) {
    // No status info available yet
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground" title={t('Status unknown - available after starting conversation')}>
        <Circle className="w-3 h-3" />
      </span>
    )
  }

  switch (status) {
    case 'connected':
      return (
        <span className="flex items-center gap-1 text-xs text-green-500" title={t('Connected')}>
          <CircleDot className="w-3 h-3" />
        </span>
      )
    case 'failed':
      return (
        <span className="flex items-center gap-1 text-xs text-red-500" title={t('Connection failed')}>
          <AlertTriangle className="w-3 h-3" />
        </span>
      )
    case 'needs-auth':
      return (
        <span className="flex items-center gap-1 text-xs text-amber-500" title={t('Authentication required')}>
          <AlertCircle className="w-3 h-3" />
        </span>
      )
    case 'pending':
      return (
        <span className="flex items-center gap-1 text-xs text-blue-500" title={t('Connecting...')}>
          <Clock className="w-3 h-3" />
        </span>
      )
    default:
      return null
  }
}

// OAuth status for HTTP MCP servers
function OAuthStatus({
  serverName,
  config,
  onConfigChange
}: {
  serverName: string
  config: McpServerConfig
  onConfigChange: () => void
}) {
  const { t } = useTranslation()
  const [connecting, setConnecting] = useState(false)
  const [authState, setAuthState] = useState<'none' | 'valid' | 'expired'>('none')
  const cleanupRef = useRef<(() => void) | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Only show for HTTP servers
  if (config.type !== 'http' || !('url' in config)) return null

  const oauth = (config as any).oauth as { accessToken?: string; expiresAt?: number } | undefined

  // Compute auth state from config prop
  const computedState = !oauth?.accessToken
    ? 'none'
    : (oauth.expiresAt && oauth.expiresAt < Date.now()) ? 'expired' : 'valid'

  // Update local state when config changes + cleanup on unmount
  useEffect(() => {
    setAuthState(computedState)
  }, [computedState])

  useEffect(() => {
    return () => {
      if (cleanupRef.current) cleanupRef.current()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleConnect = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setConnecting(true)

    try {
      const result = await api.mcpOAuthStart(serverName, (config as any).url)
      if (!result.success) {
        console.error('[OAuth]', result.error)
        setConnecting(false)
        return
      }

      // Listen for result via event
      const cleanup = api.onMcpOAuthResult((data) => {
        if (data.serverName === serverName) {
          setConnecting(false)
          if (data.success) {
            setAuthState('valid')
          }
          cleanup()
          cleanupRef.current = null
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          timeoutRef.current = null
          onConfigChange()
        }
      })
      cleanupRef.current = cleanup

      // Timeout after 5 minutes
      timeoutRef.current = setTimeout(() => {
        setConnecting(false)
        if (cleanupRef.current) {
          cleanupRef.current()
          cleanupRef.current = null
        }
        timeoutRef.current = null
      }, 5 * 60 * 1000)
    } catch {
      setConnecting(false)
    }
  }

  const handleDisconnect = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await api.mcpOAuthDisconnect(serverName)
    setAuthState('none')
    onConfigChange()
  }

  if (authState === 'none') {
    return (
      <button
        onClick={handleConnect}
        disabled={connecting}
        className="flex items-center gap-1 px-2 py-0.5 text-xs text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-50"
        title={t('Connect via OAuth')}
      >
        {connecting ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Link className="w-3 h-3" />
        )}
        {connecting ? t('Connecting...') : t('Connect')}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {authState === 'expired' ? (
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="flex items-center gap-1 px-2 py-0.5 text-xs text-amber-500 hover:bg-amber-500/10 rounded transition-colors"
          title={t('Token expired - reconnect')}
        >
          <AlertTriangle className="w-3 h-3" />
          {t('Expired')}
        </button>
      ) : (
        <span className="flex items-center gap-1 px-2 py-0.5 text-xs text-green-500" title={t('OAuth authenticated')}>
          <Check className="w-3 h-3" />
          {t('Auth')}
        </span>
      )}
      <button
        onClick={handleDisconnect}
        className="p-0.5 text-muted-foreground hover:text-red-500 rounded transition-colors"
        title={t('Disconnect OAuth')}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}

type EditMode = 'visual' | 'json'

// Get server type icon
function getServerTypeIcon(config: McpServerConfig) {
  const type = config.type || 'stdio'
  switch (type) {
    case 'stdio':
      return <Terminal className="w-4 h-4" />
    case 'http':
      return <Globe className="w-4 h-4" />
    case 'sse':
      return <Radio className="w-4 h-4" />
    default:
      return <Server className="w-4 h-4" />
  }
}

// Get server type label key (returns translation key)
function getServerTypeLabelKey(config: McpServerConfig): string {
  const type = config.type || 'stdio'
  switch (type) {
    case 'stdio':
      return 'Command line'
    case 'http':
      return 'HTTP'
    case 'sse':
      return 'SSE'
    default:
      return type
  }
}

// Server item component
function ServerItem({
  name,
  config,
  status,
  isExpanded,
  onToggleExpand,
  onToggleDisabled,
  onDelete,
  onSave,
  description,
  isCore
}: {
  name: string
  config: McpServerConfig
  status: McpServerStatus['status'] | null
  isExpanded: boolean
  onToggleExpand: () => void
  onToggleDisabled: () => void
  onDelete: () => void
  onSave: (newName: string, newConfig: McpServerConfig) => Promise<void>
  description?: string
  isCore?: boolean
}) {
  const { t } = useTranslation()
  const [editMode, setEditMode] = useState<EditMode>('visual')
  const [editingName, setEditingName] = useState(name)
  const [editingConfig, setEditingConfig] = useState<McpServerConfig>(config)
  const [jsonText, setJsonText] = useState('')
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize editing state when expanded
  useEffect(() => {
    if (isExpanded) {
      setEditingName(name)
      setEditingConfig(config)
      setJsonText(JSON.stringify(config, null, 2))
      setJsonError(null)
      setHasChanges(false)
    }
  }, [isExpanded, name, config])

  // Handle visual mode changes
  const updateVisualField = useCallback((field: string, value: unknown) => {
    setEditingConfig(prev => {
      const updated = { ...prev, [field]: value }
      setHasChanges(true)
      // Sync to JSON
      setJsonText(JSON.stringify(updated, null, 2))
      return updated
    })
  }, [])

  // Handle args change (array of strings)
  const updateArgs = useCallback((index: number, value: string) => {
    setEditingConfig(prev => {
      if (!('command' in prev)) return prev
      const args = [...(prev.args || [])]
      args[index] = value
      const updated = { ...prev, args }
      setHasChanges(true)
      setJsonText(JSON.stringify(updated, null, 2))
      return updated
    })
  }, [])

  const addArg = useCallback(() => {
    setEditingConfig(prev => {
      if (!('command' in prev)) return prev
      const args = [...(prev.args || []), '']
      const updated = { ...prev, args }
      setHasChanges(true)
      setJsonText(JSON.stringify(updated, null, 2))
      return updated
    })
  }, [])

  const removeArg = useCallback((index: number) => {
    setEditingConfig(prev => {
      if (!('command' in prev)) return prev
      const args = (prev.args || []).filter((_, i) => i !== index)
      const updated = { ...prev, args }
      setHasChanges(true)
      setJsonText(JSON.stringify(updated, null, 2))
      return updated
    })
  }, [])

  // Handle env var changes (key/value pairs)
  const updateEnvKey = useCallback((oldKey: string, newKey: string) => {
    setEditingConfig(prev => {
      if (!('command' in prev)) return prev
      const env = { ...(prev.env || {}) }
      const value = env[oldKey] ?? ''
      delete env[oldKey]
      env[newKey] = value
      const updated = { ...prev, env }
      setHasChanges(true)
      setJsonText(JSON.stringify(updated, null, 2))
      return updated
    })
  }, [])

  const updateEnvValue = useCallback((key: string, value: string) => {
    setEditingConfig(prev => {
      if (!('command' in prev)) return prev
      const env = { ...(prev.env || {}), [key]: value }
      const updated = { ...prev, env }
      setHasChanges(true)
      setJsonText(JSON.stringify(updated, null, 2))
      return updated
    })
  }, [])

  const addEnv = useCallback(() => {
    setEditingConfig(prev => {
      if (!('command' in prev)) return prev
      const env = { ...(prev.env || {}), '': '' }
      const updated = { ...prev, env }
      setHasChanges(true)
      setJsonText(JSON.stringify(updated, null, 2))
      return updated
    })
  }, [])

  const removeEnv = useCallback((key: string) => {
    setEditingConfig(prev => {
      if (!('command' in prev)) return prev
      const { [key]: _, ...rest } = (prev.env || {})
      const updated = { ...prev, env: Object.keys(rest).length > 0 ? rest : undefined }
      setHasChanges(true)
      setJsonText(JSON.stringify(updated, null, 2))
      return updated
    })
  }, [])

  // Handle JSON mode changes - validate on parse
  const handleJsonChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setJsonText(text)
    setHasChanges(true)
    try {
      const parsed = JSON.parse(text)
      // Validate config structure
      const validationError = validateMcpServerConfig(parsed)
      if (validationError) {
        setJsonError(validationError)
      } else {
        setEditingConfig(parsed)
        setJsonError(null)
      }
    } catch (err) {
      setJsonError((err as Error).message)
    }
  }, [])

  // Handle name change
  const handleNameChange = useCallback((value: string) => {
    setEditingName(value)
    setHasChanges(true)
  }, [])

  // Save changes
  const handleSave = async () => {
    if (jsonError) return
    // Final validation before save
    const validationError = validateMcpServerConfig(editingConfig)
    if (validationError) {
      setJsonError(validationError)
      return
    }
    setIsSaving(true)
    try {
      await onSave(editingName, editingConfig)
      setHasChanges(false)
    } finally {
      setIsSaving(false)
    }
  }

  // Cancel changes
  const handleCancel = () => {
    setEditingName(name)
    setEditingConfig(config)
    setJsonText(JSON.stringify(config, null, 2))
    setJsonError(null)
    setHasChanges(false)
    onToggleExpand()
  }

  const serverType = editingConfig.type || 'stdio'
  const isDisabled = config.disabled === true

  return (
    <div className={`border rounded-lg overflow-hidden transition-opacity ${
      isDisabled ? 'border-border/50 opacity-60' : 'border-border'
    }`}>
      {/* Header row */}
      <div
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
          isDisabled ? 'bg-muted/30 hover:bg-muted/50' : 'bg-secondary/50 hover:bg-secondary'
        }`}
        onClick={onToggleExpand}
      >
        {/* Expand/collapse arrow */}
        <div className="flex-shrink-0">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>

        {/* Content: name + status on first line, description on second */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {/* Status indicator */}
            {!isDisabled && (
              <StatusIndicator status={status} t={t} />
            )}
            <span className={`font-medium truncate ${isDisabled ? 'text-muted-foreground' : 'text-foreground'}`}>
              {name}
            </span>
            {isCore && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-primary/15 text-primary rounded flex-shrink-0">
                {t('mcp.badge.core')}
              </span>
            )}
            {isDisabled && (
              <span className="text-xs font-normal text-muted-foreground/70 flex-shrink-0">{t('Disabled')}</span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground/80 mt-0.5 pl-5 truncate">{t(description)}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 pl-5">
            <span>
              {t(getServerTypeLabelKey(config))}
              {config.type !== 'stdio' && 'url' in config && (
                <span className="ml-1.5 opacity-70">• {config.url}</span>
              )}
              {(!config.type || config.type === 'stdio') && 'command' in config && (
                <span className="ml-1.5 opacity-70">• {config.command}</span>
              )}
            </span>
            {!isDisabled && config.type === 'http' && (
              <OAuthStatus serverName={name} config={config} onConfigChange={() => {}} />
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={onToggleDisabled}
            className={`p-1.5 rounded transition-colors ${
              isDisabled
                ? 'text-muted-foreground hover:text-green-500 hover:bg-green-500/10'
                : 'text-green-500 hover:text-muted-foreground hover:bg-muted'
            }`}
            title={isDisabled ? t('Enable') : t('Disable')}
          >
            {isDisabled ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
            title={t('Delete')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded edit area */}
      {isExpanded && (
        <div className="border-t border-border">
          {/* Mode toggle */}
          <div className="flex items-center justify-between px-4 py-2 bg-muted/50">
            <div className="flex items-center gap-1 p-0.5 bg-secondary rounded-lg">
              <button
                onClick={() => setEditMode('visual')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  editMode === 'visual'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Settings2 className="w-3.5 h-3.5" />
                {t('Visual')}
              </button>
              <button
                onClick={() => setEditMode('json')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  editMode === 'json'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                JSON
              </button>
            </div>

            {hasChanges && (
              <span className="text-xs text-amber-500">
                {t('Unsaved changes')}
              </span>
            )}
          </div>

          {/* Edit content */}
          <div className="p-4">
            {editMode === 'visual' ? (
              <div className="space-y-4">
                {/* Server name */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    {t('Server name')}
                  </label>
                  <input
                    type="text"
                    value={editingName}
                    onChange={e => handleNameChange(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="my-mcp-server"
                  />
                </div>

                {/* Type selector */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    {t('Type')}
                  </label>
                  <select
                    value={serverType}
                    onChange={e => {
                      const newType = e.target.value as 'stdio' | 'http' | 'sse'
                      let newConfig: McpServerConfig
                      if (newType === 'stdio') {
                        newConfig = { type: 'stdio', command: '' }
                      } else if (newType === 'http') {
                        newConfig = { type: 'http', url: '' }
                      } else {
                        newConfig = { type: 'sse', url: '' }
                      }
                      setEditingConfig(newConfig)
                      setHasChanges(true)
                      setJsonText(JSON.stringify(newConfig, null, 2))
                    }}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  >
                    <option value="stdio">{t('Command line (stdio)')}</option>
                    <option value="http">HTTP</option>
                    <option value="sse">SSE (Server-Sent Events)</option>
                  </select>
                </div>

                {/* Type-specific fields */}
                {serverType === 'stdio' && 'command' in editingConfig && (
                  <>
                    {/* Command */}
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        {t('Command')}
                      </label>
                      <input
                        type="text"
                        value={(editingConfig as { command: string }).command}
                        onChange={e => updateVisualField('command', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm transition-colors"
                        placeholder="npx"
                      />
                    </div>

                    {/* Args */}
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        {t('Arguments')}
                      </label>
                      <div className="space-y-2">
                        {((editingConfig as { args?: string[] }).args || []).map((arg, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={arg}
                              onChange={e => updateArgs(index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm transition-colors"
                              placeholder={t('Argument value')}
                            />
                            <button
                              onClick={() => removeArg(index)}
                              className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={addArg}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          {t('Add argument')}
                        </button>
                      </div>
                    </div>

                    {/* Environment Variables */}
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        {t('Environment variables')}
                      </label>
                      <div className="space-y-2">
                        {Object.entries((editingConfig as { env?: Record<string, string> }).env || {}).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={key}
                              onChange={e => updateEnvKey(key, e.target.value)}
                              className="w-1/3 px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm transition-colors"
                              placeholder="KEY"
                            />
                            <input
                              type="text"
                              value={value}
                              onChange={e => updateEnvValue(key, e.target.value)}
                              className="flex-1 px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm transition-colors"
                              placeholder={t('Value')}
                            />
                            <button
                              onClick={() => removeEnv(key)}
                              className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={addEnv}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          {t('Add variable')}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {(serverType === 'http' || serverType === 'sse') && 'url' in editingConfig && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      URL
                    </label>
                    <input
                      type="text"
                      value={(editingConfig as { url: string }).url}
                      onChange={e => updateVisualField('url', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm transition-colors"
                      placeholder="https://api.example.com/mcp"
                    />
                  </div>
                )}
              </div>
            ) : (
              /* JSON mode */
              <div>
                <textarea
                  value={jsonText}
                  onChange={handleJsonChange}
                  spellCheck={false}
                  className="w-full h-48 px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm resize-none transition-colors"
                  placeholder='{ "command": "npx", "args": ["-y", "@example/mcp"] }'
                />
                {jsonError && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    {jsonError}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border bg-muted/30">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              {t('Cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={!!jsonError || isSaving || !hasChanges}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground rounded-lg transition-colors"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('Saving...')}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {t('Save')}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Add new server dialog - consistent with edit UI
function AddServerDialog({
  onAdd,
  onCancel
}: {
  onAdd: (name: string, config: McpServerConfig) => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  const [editMode, setEditMode] = useState<EditMode>('visual')
  const [name, setName] = useState('')
  const [serverType, setServerType] = useState<'stdio' | 'http' | 'sse'>('stdio')
  const [command, setCommand] = useState('')
  const [args, setArgs] = useState<string[]>([])
  const [envVars, setEnvVars] = useState<Array<{ key: string; value: string }>>([])
  const [url, setUrl] = useState('')
  const [jsonText, setJsonText] = useState('{\n  "command": "npx",\n  "args": ["-y", "@example/mcp-server"]\n}')
  const [jsonError, setJsonError] = useState<string | null>(null)

  // Build config from visual fields
  const buildConfigFromVisual = useCallback((): McpServerConfig => {
    if (serverType === 'stdio') {
      const env = Object.fromEntries(envVars.filter(e => e.key.trim()).map(e => [e.key, e.value]))
      return {
        command,
        args: args.filter(a => a.trim()),
        ...(Object.keys(env).length > 0 && { env })
      }
    } else if (serverType === 'http') {
      return { type: 'http', url }
    } else {
      return { type: 'sse', url }
    }
  }, [serverType, command, args, envVars, url])

  // Sync visual changes to JSON
  useEffect(() => {
    if (editMode === 'visual') {
      const config = buildConfigFromVisual()
      setJsonText(JSON.stringify(config, null, 2))
    }
  }, [editMode, buildConfigFromVisual])

  // Handle JSON mode changes
  const handleJsonChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setJsonText(text)
    try {
      const parsed = JSON.parse(text)
      const validationError = validateMcpServerConfig(parsed)
      if (validationError) {
        setJsonError(validationError)
      } else {
        // Sync parsed JSON back to visual fields
        if ('command' in parsed) {
          setServerType('stdio')
          setCommand(parsed.command || '')
          setArgs(parsed.args || [])
          setEnvVars(
            parsed.env
              ? Object.entries(parsed.env as Record<string, string>).map(([key, value]) => ({ key, value }))
              : []
          )
        } else if (parsed.type === 'http') {
          setServerType('http')
          setUrl(parsed.url || '')
        } else if (parsed.type === 'sse') {
          setServerType('sse')
          setUrl(parsed.url || '')
        }
        setJsonError(null)
      }
    } catch (err) {
      setJsonError((err as Error).message)
    }
  }, [])

  const handleSubmit = () => {
    if (!name.trim()) return

    if (editMode === 'json') {
      // Validate JSON before submit
      try {
        const parsed = JSON.parse(jsonText)
        const validationError = validateMcpServerConfig(parsed)
        if (validationError) {
          setJsonError(validationError)
          return
        }
        onAdd(name.trim(), parsed)
      } catch (err) {
        setJsonError((err as Error).message)
        return
      }
    } else {
      onAdd(name.trim(), buildConfigFromVisual())
    }
  }

  const addArg = () => setArgs([...args, ''])
  const updateArg = (index: number, value: string) => {
    const newArgs = [...args]
    newArgs[index] = value
    setArgs(newArgs)
  }
  const removeArg = (index: number) => setArgs(args.filter((_, i) => i !== index))

  const addEnvVar = () => setEnvVars([...envVars, { key: '', value: '' }])
  const updateEnvVarKey = (index: number, key: string) => {
    const updated = [...envVars]
    updated[index] = { ...updated[index], key }
    setEnvVars(updated)
  }
  const updateEnvVarValue = (index: number, value: string) => {
    const updated = [...envVars]
    updated[index] = { ...updated[index], value }
    setEnvVars(updated)
  }
  const removeEnvVar = (index: number) => setEnvVars(envVars.filter((_, i) => i !== index))

  const isValidVisual = name.trim() && (
    (serverType === 'stdio' && command.trim()) ||
    ((serverType === 'http' || serverType === 'sse') && url.trim())
  )
  const isValidJson = name.trim() && !jsonError && jsonText.trim()
  const isValid = editMode === 'visual' ? isValidVisual : isValidJson

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Mode toggle - same style as edit mode */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
        <h4 className="font-medium text-foreground text-sm">
          {t('Add new server')}
        </h4>
        <div className="flex items-center gap-1 p-0.5 bg-secondary rounded-lg">
          <button
            onClick={() => setEditMode('visual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
              editMode === 'visual'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            {t('Visual')}
          </button>
          <button
            onClick={() => setEditMode('json')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
              editMode === 'json'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            JSON
          </button>
        </div>
      </div>

      <div className="p-4">
        {editMode === 'visual' ? (
          <div className="space-y-4">
            {/* Server name */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t('Server name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="my-mcp-server"
                autoFocus
              />
            </div>

            {/* Type selector */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t('Type')}
              </label>
              <select
                value={serverType}
                onChange={e => setServerType(e.target.value as 'stdio' | 'http' | 'sse')}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              >
                <option value="stdio">{t('Command line (stdio)')}</option>
                <option value="http">HTTP</option>
                <option value="sse">SSE (Server-Sent Events)</option>
              </select>
            </div>

            {/* Type-specific fields */}
            {serverType === 'stdio' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    {t('Command')}
                  </label>
                  <input
                    type="text"
                    value={command}
                    onChange={e => setCommand(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm transition-colors"
                    placeholder="npx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    {t('Arguments')}
                  </label>
                  <div className="space-y-2">
                    {args.map((arg, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={arg}
                          onChange={e => updateArg(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm transition-colors"
                          placeholder={t('Argument value')}
                        />
                        <button
                          onClick={() => removeArg(index)}
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addArg}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {t('Add argument')}
                    </button>
                  </div>
                </div>

                {/* Environment Variables */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    {t('Environment variables')}
                  </label>
                  <div className="space-y-2">
                    {envVars.map((envVar, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={envVar.key}
                          onChange={e => updateEnvVarKey(index, e.target.value)}
                          className="w-1/3 px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm transition-colors"
                          placeholder="KEY"
                        />
                        <input
                          type="text"
                          value={envVar.value}
                          onChange={e => updateEnvVarValue(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm transition-colors"
                          placeholder={t('Value')}
                        />
                        <button
                          onClick={() => removeEnvVar(index)}
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addEnvVar}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {t('Add variable')}
                    </button>
                  </div>
                </div>
              </>
            )}

            {(serverType === 'http' || serverType === 'sse') && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm transition-colors"
                  placeholder="https://api.example.com/mcp"
                />
              </div>
            )}
          </div>
        ) : (
          /* JSON mode */
          <div className="space-y-4">
            {/* Server name - also needed in JSON mode */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t('Server name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="my-mcp-server"
                autoFocus
              />
            </div>

            {/* JSON config */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t('Configuration (JSON)')}
              </label>
              <textarea
                value={jsonText}
                onChange={handleJsonChange}
                spellCheck={false}
                className="w-full h-48 px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm resize-none transition-colors"
                placeholder='{ "command": "npx", "args": ["-y", "@example/mcp"] }'
              />
              {jsonError && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-500">
                  <AlertCircle className="w-4 h-4" />
                  {jsonError}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions - consistent with edit mode style */}
      <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border bg-muted/30">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
        >
          {t('Cancel')}
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('Add')}
        </button>
      </div>
    </div>
  )
}

// ============================================
// Sorting & Grouping
// ============================================

interface SortedServerEntry {
  name: string
  category: McpCategory | 'other'
  categorySortOrder: number
  sortOrder: number
  isCore: boolean
  descriptionKey?: string
}

/**
 * Sort servers by category, then by sortOrder within category.
 * Unknown servers go to "other" at the end.
 */
function getSortedServerEntries(servers: McpServersConfig): SortedServerEntry[] {
  return Object.keys(servers)
    .map((name): SortedServerEntry => {
      const meta = getMcpMeta(name)
      if (meta) {
        return {
          name,
          category: meta.category,
          categorySortOrder: MCP_CATEGORIES[meta.category].sortOrder,
          sortOrder: meta.sortOrder,
          isCore: meta.isCore,
          descriptionKey: meta.descriptionKey,
        }
      }
      return {
        name,
        category: 'other',
        categorySortOrder: 99,
        sortOrder: 0,
        isCore: false,
      }
    })
    .sort((a, b) => {
      if (a.categorySortOrder !== b.categorySortOrder) return a.categorySortOrder - b.categorySortOrder
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
      return a.name.localeCompare(b.name)
    })
}

/**
 * Group sorted entries by category (preserves order).
 */
function groupByCategory(entries: SortedServerEntry[]): Array<{
  category: McpCategory | 'other'
  labelKey: string
  entries: SortedServerEntry[]
}> {
  const groups: Array<{
    category: McpCategory | 'other'
    labelKey: string
    entries: SortedServerEntry[]
  }> = []

  let currentCategory: string | null = null

  for (const entry of entries) {
    if (entry.category !== currentCategory) {
      currentCategory = entry.category
      const labelKey = entry.category === 'other'
        ? 'mcp.category.other'
        : MCP_CATEGORIES[entry.category as McpCategory].labelKey
      groups.push({ category: entry.category, labelKey, entries: [] })
    }
    groups[groups.length - 1].entries.push(entry)
  }

  return groups
}

// Main component
export function McpServerList({ servers, onSave }: McpServerListProps) {
  const { t } = useTranslation()
  const [expandedServer, setExpandedServer] = useState<string | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [localServers, setLocalServers] = useState<McpServersConfig>(servers)
  const [isTesting, setIsTesting] = useState(false)
  const [testError, setTestError] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Get MCP status from global store
  const { mcpStatus, mcpStatusTimestamp } = useAppStore()

  // Create a map for quick status lookup
  const statusMap = new Map(mcpStatus.map(s => [s.name, s.status]))

  // Sync with props
  useEffect(() => {
    setLocalServers(servers)
  }, [servers])

  // Native components are invisible in Settings (Hindsight = core memory engine, not an MCP)
  const NATIVE_COMPONENTS = ['hindsight']

  // Filter out native components from the visible server list
  const visibleServers = useMemo(() => {
    const filtered: typeof localServers = {}
    for (const [name, config] of Object.entries(localServers)) {
      if (!NATIVE_COMPONENTS.includes(name)) {
        filtered[name] = config
      }
    }
    return filtered
  }, [localServers])

  const serverNames = Object.keys(visibleServers)
  const enabledCount = serverNames.filter(name => !visibleServers[name].disabled).length
  const connectedCount = serverNames.filter(name =>
    !visibleServers[name].disabled && statusMap.get(name) === 'connected'
  ).length

  // Test MCP connections
  const handleTestConnections = async () => {
    setIsTesting(true)
    setTestError(null)
    try {
      const result = await api.testMcpConnections()
      if (!result.success && result.error) {
        setTestError(result.error)
      }
    } catch (err) {
      setTestError((err as Error).message)
    } finally {
      setIsTesting(false)
    }
  }

  const handleToggleExpand = (name: string) => {
    if (isAddingNew) setIsAddingNew(false)
    setExpandedServer(prev => prev === name ? null : name)
  }

  const handleToggleDisabled = async (name: string) => {
    const config = localServers[name]
    const newConfig = { ...config, disabled: !config.disabled }
    const newServers = { ...localServers, [name]: newConfig }
    setLocalServers(newServers)
    await onSave(newServers)
  }

  const handleDelete = async (name: string) => {
    const { [name]: _, ...rest } = localServers
    setLocalServers(rest)
    await onSave(rest)
    if (expandedServer === name) {
      setExpandedServer(null)
    }
  }

  const handleSaveServer = async (oldName: string, newName: string, config: McpServerConfig) => {
    let newServers: McpServersConfig

    if (oldName !== newName) {
      // Name changed - remove old key and add new
      const { [oldName]: _, ...rest } = localServers
      newServers = { ...rest, [newName]: config }
    } else {
      newServers = { ...localServers, [newName]: config }
    }

    setLocalServers(newServers)
    await onSave(newServers)

    if (oldName !== newName) {
      setExpandedServer(newName)
    }
  }

  const handleAddServer = async (name: string, config: McpServerConfig) => {
    const newServers = { ...localServers, [name]: config }
    setLocalServers(newServers)
    await onSave(newServers)
    setIsAddingNew(false)
    setExpandedServer(name)
  }

  // Apply recommended defaults: enable recommended MCPs, disable all others
  // SAFETY: Only touches the `disabled` flag. Never modifies env, args, url, headers, oauth.
  const handleApplyRecommended = async () => {
    const recommendedNames = getRecommendedMcpNames()
    const newServers: McpServersConfig = {}

    for (const [name, config] of Object.entries(localServers)) {
      if (recommendedNames.includes(name)) {
        // Enable recommended: remove the disabled flag, keep everything else
        const { disabled, ...rest } = config as any
        newServers[name] = rest
      } else {
        // Disable non-recommended: add disabled flag, keep everything else
        newServers[name] = { ...config, disabled: true }
      }
    }

    setLocalServers(newServers)
    await onSave(newServers)
    setShowConfirmDialog(false)
  }

  // Compute sorted & grouped entries (using filtered visible servers)
  const sortedEntries = getSortedServerEntries(visibleServers)
  const categoryGroups = groupByCategory(sortedEntries)

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-primary" />
          <h3 className="font-medium text-foreground">
            {t('MCP Servers')}
          </h3>
          {serverNames.length > 0 && (
            <>
              <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                {enabledCount}/{serverNames.length}
              </span>
              {/* Show connection status if we have status info */}
              {mcpStatusTimestamp && enabledCount > 0 && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  connectedCount === enabledCount
                    ? 'bg-green-500/10 text-green-500'
                    : connectedCount > 0
                    ? 'bg-amber-500/10 text-amber-500'
                    : 'bg-red-500/10 text-red-500'
                }`}>
                  {connectedCount}/{enabledCount} {t('connected')}
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Test connections button */}
          {enabledCount > 0 && (
            <button
              onClick={handleTestConnections}
              disabled={isTesting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors disabled:opacity-50"
              title={t('Test all MCP server connections')}
            >
              <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
              {isTesting ? t('Testing...') : t('Test connections')}
            </button>
          )}

          <button
            onClick={() => {
              setExpandedServer(null)
              setIsAddingNew(true)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('Add')}
          </button>
        </div>
      </div>

      {/* Test error message */}
      {testError && (
        <div className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 bg-red-500/10 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{testError}</span>
          <button
            onClick={() => setTestError(null)}
            className="ml-auto p-0.5 hover:bg-red-500/20 rounded"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Description */}
      <p className="text-sm text-muted-foreground">
        {t('Configure MCP (Model Context Protocol) servers to extend AI capabilities. Format compatible with Cursor / Claude Desktop.')}
      </p>

      {/* Recommendation banner */}
      {serverNames.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{t('mcp.banner.title')}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t('mcp.banner.description')}</p>
          </div>
          <button
            onClick={() => setShowConfirmDialog(true)}
            className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 border border-primary/30 rounded-lg transition-colors"
          >
            {t('mcp.banner.applyButton')}
          </button>
        </div>
      )}

      {/* Confirmation dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowConfirmDialog(false)}>
          <div className="bg-background border border-border rounded-xl shadow-xl max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">{t('mcp.confirm.title')}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">{t('mcp.confirm.description')}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                {t('mcp.confirm.cancel')}
              </button>
              <button
                onClick={handleApplyRecommended}
                className="px-4 py-2 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
              >
                {t('mcp.confirm.apply')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Server list */}
      {serverNames.length === 0 && !isAddingNew ? (
        <div className="py-8 text-center">
          <Server className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">
            {t('No MCP servers configured yet')}
          </p>
          <button
            onClick={() => setIsAddingNew(true)}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('Add first server')}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {categoryGroups.map(group => (
            <div key={group.category}>
              <McpCategoryHeader
                category={group.category as McpCategory}
                labelKey={group.labelKey}
                enabledCount={group.entries.filter(e => !localServers[e.name].disabled).length}
                totalCount={group.entries.length}
              />
              <div className="space-y-2 mt-2">
                {group.entries.map(entry => (
                  <ServerItem
                    key={entry.name}
                    name={entry.name}
                    config={localServers[entry.name]}
                    status={statusMap.get(entry.name) || null}
                    isExpanded={expandedServer === entry.name}
                    onToggleExpand={() => handleToggleExpand(entry.name)}
                    onToggleDisabled={() => handleToggleDisabled(entry.name)}
                    onDelete={() => handleDelete(entry.name)}
                    onSave={(newName, config) => handleSaveServer(entry.name, newName, config)}
                    description={entry.descriptionKey}
                    isCore={entry.isCore}
                  />
                ))}
              </div>
            </div>
          ))}

          {isAddingNew && (
            <AddServerDialog
              onAdd={handleAddServer}
              onCancel={() => setIsAddingNew(false)}
            />
          )}
        </div>
      )}
    </div>
  )
}
