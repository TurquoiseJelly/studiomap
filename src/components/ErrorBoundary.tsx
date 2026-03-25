import { Component, type ReactNode, type ErrorInfo } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo })
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
  }

  handleReload = (): void => {
    window.location.reload()
  }

  handleClearStorageAndReload = async (): Promise<void> => {
    try {
      // Clear IndexedDB
      const databases = await indexedDB.databases()
      for (const db of databases) {
        if (db.name) {
          indexedDB.deleteDatabase(db.name)
        }
      }

      // Clear localStorage
      localStorage.clear()

      // Clear sessionStorage
      sessionStorage.clear()

      // Reload
      window.location.reload()
    } catch (e) {
      console.error('[ErrorBoundary] Failed to clear storage:', e)
      window.location.reload()
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isStorageError = this.state.error?.message?.toLowerCase().includes('indexeddb') ||
        this.state.error?.message?.toLowerCase().includes('storage') ||
        this.state.error?.name === 'QuotaExceededError'

      return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] p-4">
          <div className="max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <svg
                className="h-6 w-6 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="mt-4 text-lg font-semibold text-[var(--color-text)]">
              Something went wrong
            </h2>

            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              {isStorageError
                ? "There was a problem with your browser's storage. This might be due to storage limits or corrupted data."
                : 'An unexpected error occurred. Try refreshing the page.'}
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-[var(--color-text-secondary)]">
                  Error details
                </summary>
                <pre className="mt-2 max-h-40 overflow-auto rounded bg-surface-100 p-2 text-xs dark:bg-surface-800">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={this.handleReload}
                className="w-full rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
              >
                Refresh Page
              </button>

              {isStorageError && (
                <button
                  onClick={this.handleClearStorageAndReload}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"
                >
                  Clear Storage & Refresh
                </button>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
