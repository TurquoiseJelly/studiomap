import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'

export function HomePage() {
  return (
    <div className="mx-auto max-w-4xl py-12 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Master Your Music Gear
      </h1>
      <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
        Interactive diagrams, searchable documentation, and step-by-step workflows
        to replace dense PDF manuals with an explorable interface.
      </p>

      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link to="/dashboard">
          <Button size="lg">
            Get Started
          </Button>
        </Link>
        <Link to="/browse">
          <Button variant="secondary" size="lg">
            Browse Gear
          </Button>
        </Link>
      </div>

      {/* Features */}
      <div className="mt-16 grid gap-8 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--color-border)] p-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </div>
          <h3 className="font-semibold">Interactive Diagrams</h3>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Click on any control to learn what it does. Hover for quick tooltips.
          </p>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] p-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="font-semibold">Instant Search</h3>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Find any feature, shortcut, or concept instantly. Works offline.
          </p>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] p-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="font-semibold">Step-by-Step Guides</h3>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Follow along with visual workflows. Track your progress.
          </p>
        </div>
      </div>
    </div>
  )
}
