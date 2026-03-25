import { NavLink, useParams } from 'react-router-dom'
import { clsx } from 'clsx'
import type { SectionIndex, WorkflowIndex } from '@/types/gear-pack.types'
import { useUserStore } from '@/stores/user-store'

interface SectionNavProps {
  sections: SectionIndex[]
  workflows: WorkflowIndex[]
  onNavigate?: () => void
}

export function SectionNav({ sections, workflows, onNavigate }: SectionNavProps) {
  const { gearId } = useParams<{ gearId: string }>()
  const { isSectionComplete, hasGear } = useUserStore()
  const owned = gearId ? hasGear(gearId) : false

  const handleClick = () => {
    onNavigate?.()
  }

  return (
    <nav className="space-y-6">
      {/* Sections */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Documentation
        </h3>
        <ul className="space-y-1">
          {sections
            .sort((a, b) => a.order - b.order)
            .map((section) => {
              const isComplete = owned && gearId ? isSectionComplete(gearId, section.id) : false
              return (
                <li key={section.id}>
                  <NavLink
                    to={`/gear/${gearId}/section/${section.id}`}
                    onClick={handleClick}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors',
                        isActive
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]'
                      )
                    }
                  >
                    <span>{section.title}</span>
                    {isComplete && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 flex-shrink-0 text-green-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </NavLink>
                </li>
              )
            })}
        </ul>
      </div>

      {/* Workflows */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Workflows
        </h3>
        <ul className="space-y-1">
          {workflows.map((workflow) => (
            <li key={workflow.id}>
              <NavLink
                to={`/gear/${gearId}/workflow/${workflow.id}`}
                onClick={handleClick}
                className={({ isActive }) =>
                  clsx(
                    'block rounded-lg px-3 py-2.5 text-sm transition-colors',
                    isActive
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]'
                  )
                }
              >
                <span className="flex items-center justify-between">
                  {workflow.title}
                  <span
                    className={clsx(
                      'rounded-full px-2 py-0.5 text-xs',
                      workflow.difficulty === 'beginner' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                      workflow.difficulty === 'intermediate' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                      workflow.difficulty === 'advanced' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    )}
                  >
                    {workflow.difficulty}
                  </span>
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Reference
        </h3>
        <ul className="space-y-1">
          <li>
            <NavLink
              to={`/gear/${gearId}/quick-ref`}
              onClick={handleClick}
              className={({ isActive }) =>
                clsx(
                  'block rounded-lg px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]'
                )
              }
            >
              Quick Reference
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`/gear/${gearId}/glossary`}
              onClick={handleClick}
              className={({ isActive }) =>
                clsx(
                  'block rounded-lg px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]'
                )
              }
            >
              Glossary
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  )
}
