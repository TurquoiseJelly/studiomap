import { type ReactNode } from 'react'
import { useNetwork } from '@/hooks/useNetwork'
import { useIsGearPackCached } from '@/hooks/useGearPackCacheStatus'

interface OfflineAwareWrapperProps {
  children: ReactNode
  gearId?: string
  fallback?: ReactNode
  showOfflineMessage?: boolean
}

export function OfflineAwareWrapper({
  children,
  gearId,
  fallback,
  showOfflineMessage = true,
}: OfflineAwareWrapperProps) {
  const { isOnline } = useNetwork()
  const isCached = useIsGearPackCached(gearId)

  // If online, always show content
  if (isOnline) {
    return <>{children}</>
  }

  // If offline but content is cached, show it with optional badge
  if (isCached) {
    return (
      <div className="relative">
        {showOfflineMessage && (
          <div className="absolute right-2 top-2 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Offline
            </span>
          </div>
        )}
        {children}
      </div>
    )
  }

  // If offline and not cached, show fallback
  if (fallback) {
    return <>{fallback}</>
  }

  // Default fallback
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 text-center">
      <svg
        className="h-12 w-12 text-[var(--color-text-secondary)]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
        />
      </svg>
      <div>
        <h3 className="font-semibold text-[var(--color-text)]">Content not available offline</h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          This content hasn't been cached yet. Connect to the internet to view it.
        </p>
      </div>
    </div>
  )
}

interface OfflineBadgeProps {
  className?: string
}

export function OfflineBadge({ className = '' }: OfflineBadgeProps) {
  const { isOnline } = useNetwork()

  if (isOnline) return null

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 ${className}`}
    >
      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829"
        />
      </svg>
      Offline
    </span>
  )
}
