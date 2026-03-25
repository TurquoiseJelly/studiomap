import { useState, useEffect } from 'react'
import { useNetwork } from '@/hooks/useNetwork'

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

export function OfflineIndicator() {
  const { isOnline, timeSinceOffline } = useNetwork()
  const [isDismissed, setIsDismissed] = useState(false)
  const [showReconnected, setShowReconnected] = useState(false)
  const [wasOffline, setWasOffline] = useState(false)

  // Reset dismissed state when coming back online
  useEffect(() => {
    if (isOnline) {
      if (wasOffline) {
        setShowReconnected(true)
        const timeout = setTimeout(() => setShowReconnected(false), 3000)
        return () => clearTimeout(timeout)
      }
      setIsDismissed(false)
    } else {
      setWasOffline(true)
    }
  }, [isOnline, wasOffline])

  // Show "reconnected" toast briefly
  if (showReconnected) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-lg transition-opacity duration-300">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Back online
      </div>
    )
  }

  if (isOnline || isDismissed) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm rounded-lg bg-yellow-500 px-4 py-3 text-yellow-950 shadow-lg">
      <div className="flex items-start gap-3">
        <svg
          className="mt-0.5 h-5 w-5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
          />
        </svg>
        <div className="flex-1">
          <p className="font-medium">You're offline</p>
          <p className="mt-0.5 text-sm opacity-90">
            {timeSinceOffline
              ? `Disconnected for ${formatDuration(timeSinceOffline)}`
              : 'No internet connection'}
          </p>
          <p className="mt-1 text-xs opacity-75">
            Your cached gear packs are still available.
          </p>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="flex-shrink-0 rounded-md p-1 hover:bg-yellow-400/50"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
