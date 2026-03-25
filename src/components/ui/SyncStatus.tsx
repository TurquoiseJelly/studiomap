import { useSyncStatus } from '@/hooks/useSyncStatus'
import { useNetwork } from '@/hooks/useNetwork'

interface SyncStatusProps {
  variant?: 'badge' | 'inline' | 'detailed'
  className?: string
}

export function SyncStatus({ variant = 'badge', className = '' }: SyncStatusProps) {
  const { pendingCount, isSyncing } = useSyncStatus()
  const { isOnline } = useNetwork()

  // Don't show if nothing is pending
  if (pendingCount === 0) return null

  if (variant === 'badge') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
          isSyncing
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        } ${className}`}
        role="status"
      >
        {isSyncing ? (
          <svg
            className="h-3 w-3 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
        <span>{pendingCount}</span>
      </span>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`} role="status">
        {isSyncing ? (
          <>
            <svg
              className="h-4 w-4 animate-spin text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-[var(--color-text-secondary)]">Syncing changes...</span>
          </>
        ) : (
          <>
            <svg
              className="h-4 w-4 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-[var(--color-text-secondary)]">
              {pendingCount} pending change{pendingCount !== 1 ? 's' : ''}
              {!isOnline && ' (waiting for network)'}
            </span>
          </>
        )}
      </div>
    )
  }

  // Detailed variant
  return (
    <div className={`rounded-lg border border-[var(--color-border)] p-4 ${className}`} role="status">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-[var(--color-text)]">Sync Status</h4>
        {isSyncing && (
          <svg
            className="h-5 w-5 animate-spin text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
      </div>

      <div className="mt-2 space-y-1">
        <p className="text-sm text-[var(--color-text-secondary)]">
          {isSyncing
            ? `Syncing ${pendingCount} change${pendingCount !== 1 ? 's' : ''}...`
            : `${pendingCount} change${pendingCount !== 1 ? 's' : ''} pending`}
        </p>

        {!isOnline && (
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            Changes will sync when you're back online
          </p>
        )}
      </div>
    </div>
  )
}
