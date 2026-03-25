import { clsx } from 'clsx'

export interface MarkAsReadButtonProps {
  isComplete: boolean
  onToggle: () => void
  className?: string
}

export function MarkAsReadButton({ isComplete, onToggle, className }: MarkAsReadButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={clsx(
        'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        isComplete
          ? 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
          : 'bg-surface-100 text-surface-700 hover:bg-surface-200 focus:ring-surface-500 dark:bg-surface-700 dark:text-surface-300 dark:hover:bg-surface-600',
        className
      )}
    >
      {isComplete ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Completed</span>
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Mark as Read</span>
        </>
      )}
    </button>
  )
}
