import { useGearPackCacheStatus, type CacheStatus } from '@/hooks/useGearPackCacheStatus'

interface CacheStatusIndicatorProps {
  gearId: string
  variant?: 'badge' | 'inline' | 'detailed'
  className?: string
}

const statusLabels: Record<CacheStatus, string> = {
  cached: 'Available offline',
  caching: 'Syncing...',
  'not-cached': 'Online only',
}

const statusIcons: Record<CacheStatus, React.ReactNode> = {
  cached: (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  caching: (
    <svg
      className="h-3.5 w-3.5 animate-spin"
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
  ),
  'not-cached': (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
      />
    </svg>
  ),
}

export function CacheStatusIndicator({
  gearId,
  variant = 'badge',
  className = '',
}: CacheStatusIndicatorProps) {
  const { status, progress } = useGearPackCacheStatus(gearId)

  if (variant === 'badge') {
    const statusColors: Record<CacheStatus, string> = {
      cached: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      caching: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'not-cached': 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
    }

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[status]} ${className}`}
        role="status"
        aria-label={statusLabels[status]}
      >
        {statusIcons[status]}
        <span className="sr-only">{statusLabels[status]}</span>
      </span>
    )
  }

  if (variant === 'inline') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-sm ${className}`}
        role="status"
      >
        {statusIcons[status]}
        <span className="text-surface-600 dark:text-surface-400">
          {statusLabels[status]}
        </span>
      </span>
    )
  }

  // Detailed variant with progress bar
  return (
    <div className={`space-y-1 ${className}`} role="status">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5">
          {statusIcons[status]}
          <span className="text-surface-600 dark:text-surface-400">
            {statusLabels[status]}
          </span>
        </span>
        {status === 'caching' && (
          <span className="text-xs text-surface-500 dark:text-surface-500">
            {Math.round(progress * 100)}%
          </span>
        )}
      </div>
      {status === 'caching' && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-surface-200 dark:bg-surface-700">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}
