import { useState, useEffect } from 'react'
import { Button } from '@/components/ui'
import { getStorageUsage, clearGearPackCache, getCachedGearIds } from '@/services/storage'
import { clearSearchIndex } from '@/services/search-service'
import { getAvailableGearPacks } from '@/services/gear-pack-loader'
import { useOfflineStore } from '@/stores'
import { useStorageQuota } from '@/hooks'
import { useNetwork } from '@/contexts/NetworkContext'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

interface StorageUsage {
  userData: number
  gearPacks: number
  searchIndices: number
  syncQueue: number
  total: number
}

interface CachedGearPack {
  id: string
  name: string
  isCached: boolean
}

function CircularProgress({ percentage }: { percentage: number }) {
  const radius = 10
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <svg className="h-6 w-6 -rotate-90" viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-surface-200 dark:text-surface-700"
      />
      <circle
        cx="12"
        cy="12"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        className="text-primary-500 transition-all duration-300"
      />
    </svg>
  )
}

export function StorageSettings() {
  const [usage, setUsage] = useState<StorageUsage | null>(null)
  const [cachedGearPacks, setCachedGearPacks] = useState<CachedGearPack[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isClearing, setIsClearing] = useState<string | null>(null)

  const { isOnline } = useNetwork()
  const storageQuota = useStorageQuota()
  const {
    downloads,
    startDownload,
    cancelDownload,
    retryDownload,
    downloadAll,
    clearDownloadState,
  } = useOfflineStore()

  const loadStorageInfo = async () => {
    setIsLoading(true)
    try {
      const [storageUsage, cachedIds] = await Promise.all([
        getStorageUsage(),
        getCachedGearIds(),
      ])

      setUsage(storageUsage)

      const available = getAvailableGearPacks()
      const cachedSet = new Set(cachedIds)
      setCachedGearPacks(
        available.map((gp) => ({
          id: gp.id,
          name: gp.name,
          isCached: cachedSet.has(gp.id),
        }))
      )
    } catch (error) {
      console.error('[StorageSettings] Failed to load storage info:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStorageInfo()
  }, [])

  // Refresh storage info when a download completes
  useEffect(() => {
    const completedDownloads = Object.entries(downloads).filter(
      ([, state]) => state.status === 'completed'
    )
    if (completedDownloads.length > 0) {
      loadStorageInfo()
    }
  }, [downloads])

  const handleClearGearPackCache = async (gearId: string) => {
    setIsClearing(gearId)
    try {
      await clearGearPackCache(gearId)
      clearDownloadState(gearId)
      await loadStorageInfo()
    } finally {
      setIsClearing(null)
    }
  }

  const handleClearAllCache = async () => {
    setIsClearing('all')
    try {
      await clearGearPackCache()
      await clearSearchIndex()
      // Clear all download states
      cachedGearPacks.forEach((gp) => clearDownloadState(gp.id))
      await loadStorageInfo()
    } finally {
      setIsClearing(null)
    }
  }

  const handleDownloadAll = () => {
    const uncachedIds = cachedGearPacks
      .filter((gp) => !gp.isCached && downloads[gp.id]?.status !== 'completed')
      .map((gp) => gp.id)
    downloadAll(uncachedIds)
  }

  const getGearPackState = (gearId: string, isCached: boolean) => {
    const downloadState = downloads[gearId]

    if (downloadState?.status === 'downloading') {
      return 'downloading'
    }
    if (downloadState?.status === 'error') {
      return 'error'
    }
    if (downloadState?.status === 'completed' || isCached) {
      return 'cached'
    }
    return 'not-cached'
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-1/3 rounded bg-surface-200 dark:bg-surface-700" />
        <div className="h-20 rounded-lg bg-surface-200 dark:bg-surface-700" />
        <div className="h-20 rounded-lg bg-surface-200 dark:bg-surface-700" />
      </div>
    )
  }

  const uncachedCount = cachedGearPacks.filter(
    (gp) => !gp.isCached && downloads[gp.id]?.status !== 'completed'
  ).length

  return (
    <div className="space-y-6">
      {/* Storage Warning Banners */}
      {storageQuota.isSupported && storageQuota.isCritical && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">Storage Almost Full</p>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                Your device storage is {storageQuota.usagePercentage.toFixed(0)}% full. Clear some
                cached data to free up space.
              </p>
            </div>
          </div>
        </div>
      )}

      {storageQuota.isSupported && storageQuota.isLow && !storageQuota.isCritical && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">Storage Running Low</p>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                Your device storage is {storageQuota.usagePercentage.toFixed(0)}% full. Consider
                clearing unused cached data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Storage Usage Breakdown */}
      <div>
        <h3 className="text-sm font-medium text-[var(--color-text)]">Storage Usage</h3>
        <div className="mt-3 rounded-lg border border-[var(--color-border)] p-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">User Data</span>
              <span className="font-medium text-[var(--color-text)]">
                {formatBytes(usage?.userData ?? 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">Gear Packs</span>
              <span className="font-medium text-[var(--color-text)]">
                {formatBytes(usage?.gearPacks ?? 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">Search Index</span>
              <span className="font-medium text-[var(--color-text)]">
                {formatBytes(usage?.searchIndices ?? 0)}
              </span>
            </div>
            {(usage?.syncQueue ?? 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-secondary)]">Pending Sync</span>
                <span className="font-medium text-[var(--color-text)]">
                  {formatBytes(usage?.syncQueue ?? 0)}
                </span>
              </div>
            )}
            <div className="border-t border-[var(--color-border)] pt-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-[var(--color-text)]">Total</span>
                <span className="font-medium text-[var(--color-text)]">
                  {formatBytes(usage?.total ?? 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cached Gear Packs */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-[var(--color-text)]">Offline Gear Packs</h3>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              Download gear packs for offline use. Clear cache to free up space.
            </p>
          </div>
          {uncachedCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadAll}
              disabled={!isOnline}
            >
              Download All ({uncachedCount})
            </Button>
          )}
        </div>

        <div className="mt-3 space-y-2">
          {cachedGearPacks.map((gp) => {
            const state = getGearPackState(gp.id, gp.isCached)
            const downloadState = downloads[gp.id]

            return (
              <div
                key={gp.id}
                className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3"
              >
                <div className="flex items-center gap-3">
                  {/* Status Icon */}
                  {state === 'downloading' && (
                    <CircularProgress percentage={downloadState?.progress ?? 0} />
                  )}
                  {state === 'cached' && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <svg
                        className="h-4 w-4 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                  )}
                  {state === 'error' && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                      <svg
                        className="h-4 w-4 text-red-600 dark:text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </span>
                  )}
                  {state === 'not-cached' && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-100 dark:bg-surface-800">
                      <svg
                        className="h-4 w-4 text-surface-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                        />
                      </svg>
                    </span>
                  )}

                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">{gp.name}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {state === 'downloading' && `Downloading... ${downloadState?.progress ?? 0}%`}
                      {state === 'cached' && 'Available offline'}
                      {state === 'error' && (
                        <span className="text-red-600 dark:text-red-400">
                          {downloadState?.error ?? 'Download failed'}
                        </span>
                      )}
                      {state === 'not-cached' && 'Not downloaded'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {state === 'downloading' && (
                    <Button variant="ghost" size="sm" onClick={() => cancelDownload(gp.id)}>
                      Cancel
                    </Button>
                  )}

                  {state === 'error' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => retryDownload(gp.id)}
                      disabled={!isOnline}
                    >
                      Retry
                    </Button>
                  )}

                  {state === 'not-cached' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startDownload(gp.id)}
                      disabled={!isOnline}
                    >
                      Download
                    </Button>
                  )}

                  {state === 'cached' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleClearGearPackCache(gp.id)}
                      isLoading={isClearing === gp.id}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Clear All Cache */}
      <div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleClearAllCache}
          isLoading={isClearing === 'all'}
        >
          Clear All Cached Data
        </Button>
        <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
          This will remove all cached gear packs and search indices. Your personal data (owned
          gear, favorites, notes) will be preserved.
        </p>
      </div>
    </div>
  )
}
