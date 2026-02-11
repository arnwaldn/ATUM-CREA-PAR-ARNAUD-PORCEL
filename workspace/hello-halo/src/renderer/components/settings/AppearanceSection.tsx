/**
 * Appearance Section Component
 * Manages theme and language settings
 */

import { useState, useCallback } from 'react'
import type { AtumCreConfig, ThemeMode } from '../../types'
import { useTranslation, setLanguage, getCurrentLanguage, SUPPORTED_LOCALES, type LocaleCode } from '../../i18n'
import { api } from '../../api'

interface AppearanceSectionProps {
  config: AtumCreConfig | null
  setConfig: (config: AtumCreConfig) => void
}

export function AppearanceSection({ config, setConfig }: AppearanceSectionProps) {
  const { t } = useTranslation()

  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(config?.appearance?.theme || 'system')

  // Notification sound state (defaults to enabled)
  const [notificationSound, setNotificationSound] = useState<boolean>(
    config?.appearance?.notificationSound !== false
  )

  // Auto-save helper for appearance settings
  const autoSave = useCallback(async (partialConfig: Partial<AtumCreConfig>) => {
    const newConfig = { ...config, ...partialConfig } as AtumCreConfig
    await api.setConfig(partialConfig)
    setConfig(newConfig)
  }, [config, setConfig])

  // Handle notification sound toggle with auto-save
  const handleNotificationSoundChange = async (enabled: boolean) => {
    setNotificationSound(enabled)
    await autoSave({
      appearance: { ...config?.appearance, notificationSound: enabled }
    })
  }

  // Handle theme change with auto-save
  const handleThemeChange = async (value: ThemeMode) => {
    setTheme(value)
    // Sync to localStorage immediately (for anti-flash on reload)
    try {
      localStorage.setItem('atum-theme', value)
    } catch (e) { /* ignore */ }
    await autoSave({
      appearance: { theme: value }
    })
  }

  return (
    <section id="appearance" className="bg-card rounded-xl border border-border p-6">
      <h2 className="text-lg font-medium mb-4">{t('Appearance')}</h2>

      <div className="space-y-6">
        {/* Theme */}
        <div>
          <label className="block text-sm text-muted-foreground mb-2">{t('Theme')}</label>
          <div className="flex gap-4">
            {(['light', 'dark', 'system'] as ThemeMode[]).map((themeMode) => (
              <button
                key={themeMode}
                onClick={() => handleThemeChange(themeMode)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  theme === themeMode
                    ? 'bg-primary/20 text-primary border border-primary'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                {themeMode === 'light' ? t('Light') : themeMode === 'dark' ? t('Dark') : t('Follow System')}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm text-muted-foreground mb-2">{t('Language')}</label>
          <select
            value={getCurrentLanguage()}
            onChange={(e) => setLanguage(e.target.value as LocaleCode)}
            className="w-full px-4 py-2 bg-input rounded-lg border border-border focus:border-primary focus:outline-none transition-colors"
          >
            {Object.entries(SUPPORTED_LOCALES).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Notification Sound */}
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium">{t('Notification Sound')}</label>
            <p className="text-xs text-muted-foreground mt-0.5">{t('Play a chime when a task completes')}</p>
          </div>
          <button
            onClick={() => handleNotificationSoundChange(!notificationSound)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notificationSound ? 'bg-primary' : 'bg-secondary'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                notificationSound ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </section>
  )
}
