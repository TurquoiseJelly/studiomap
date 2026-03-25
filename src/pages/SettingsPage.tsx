import { useState } from 'react'
import { useUIStore } from '@/stores/ui-store'
import { useUserStore } from '@/stores/user-store'
import { Button } from '@/components/ui'
import { StorageSettings } from '@/components/settings/StorageSettings'
import { SyncStatus } from '@/components/ui/SyncStatus'
import { clearCache } from '@/services/gear-pack-loader'
import { clearSearchIndex } from '@/services/search-service'
import { clearAllStores } from '@/services/storage'

export function SettingsPage() {
  const { theme, setTheme, viewMode, setViewMode } = useUIStore()
  const { clearAllData } = useUserStore()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleClearData = async () => {
    clearAllData()
    await clearSearchIndex()
    clearCache()
    await clearAllStores()
    setShowConfirm(false)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-[var(--color-text-secondary)]">
          Customize your StudioMap experience.
        </p>
      </div>

      {/* Sync Status (only shows if there are pending items) */}
      <SyncStatus variant="detailed" />

      {/* Appearance */}
      <section className="rounded-xl border border-[var(--color-border)] p-6">
        <h2 className="text-lg font-semibold">Appearance</h2>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium">Theme</label>
            <div className="mt-2 flex gap-2">
              <Button
                variant={theme === 'light' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setTheme('light')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setTheme('dark')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setTheme('system')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.321a.75.75 0 01-.557 1.394l-1.25-.5a.75.75 0 01-.471-.621L11.36 15H8.64l-.067.532a.75.75 0 01-.47.621l-1.25.5a.75.75 0 01-.557-1.394l.803-.32.123-.489H5a2 2 0 01-2-2V5zm2 0h10v8H5V5z" clipRule="evenodd" />
                </svg>
                System
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">View Mode</label>
            <div className="mt-2 flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                List
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Storage & Cache */}
      <section className="rounded-xl border border-[var(--color-border)] p-6">
        <h2 className="text-lg font-semibold">Storage & Cache</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Manage cached content for offline access and storage usage.
        </p>

        <div className="mt-4">
          <StorageSettings />
        </div>
      </section>

      {/* Data */}
      <section className="rounded-xl border border-[var(--color-border)] p-6">
        <h2 className="text-lg font-semibold">Data</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Your gear library and preferences are stored locally in your browser using IndexedDB.
        </p>

        <div className="mt-4">
          {showConfirm ? (
            <div className="space-y-3">
              <p className="text-sm text-red-600 dark:text-red-400">
                This will permanently delete all your gear, progress, recently viewed items, and cached data. Are you sure?
              </p>
              <div className="flex gap-2">
                <Button variant="danger" size="sm" onClick={handleClearData}>
                  Yes, Clear Everything
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setShowConfirm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="danger" size="sm" onClick={() => setShowConfirm(true)}>
              Clear All Data
            </Button>
          )}
        </div>
      </section>

      {/* About */}
      <section className="rounded-xl border border-[var(--color-border)] p-6">
        <h2 className="text-lg font-semibold">About StudioMap</h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          StudioMap is an interactive music gear knowledge base that replaces dense PDF manuals
          with explorable interfaces, clickable diagrams, and step-by-step workflows.
        </p>
        <div className="mt-4 space-y-1">
          <p className="text-xs text-[var(--color-text-secondary)]">
            Version 0.1.0
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            PWA with offline support enabled
          </p>
        </div>
      </section>
    </div>
  )
}
