import { useState } from 'react'
import { usePWA } from '@/hooks/usePWA'
import { Button } from './Button'

export function InstallPrompt() {
  const { isInstallable, isInstalled, promptInstall } = usePWA()
  const [dismissed, setDismissed] = useState(false)

  if (isInstalled || !isInstallable || dismissed) return null

  const handleInstall = async () => {
    const success = await promptInstall()
    if (!success) {
      setDismissed(true)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-xl">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">Install StudioMap</h3>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Install the app for quick access and offline use.
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={handleInstall}>
              Install
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setDismissed(true)}>
              Not now
            </Button>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="rounded-lg p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
