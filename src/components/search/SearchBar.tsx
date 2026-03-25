import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearch } from '@/hooks/useSearch'
import type { SearchResult } from '@/services/search-service'

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false)
  const { query, setQuery, results, isLoading, isIndexReady } = useSearch()
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleResultClick = useCallback(
    (result: SearchResult) => {
      navigate(result.path)
      setIsOpen(false)
      setQuery('')
    },
    [navigate, setQuery]
  )

  const typeIcons: Record<SearchResult['type'], React.ReactNode> = {
    section: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    workflow: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    shortcut: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    glossary: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    hotspot: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    ),
  }

  const typeLabels: Record<SearchResult['type'], string> = {
    section: 'Documentation',
    workflow: 'Workflow',
    shortcut: 'Shortcut',
    glossary: 'Glossary',
    hotspot: 'Control',
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full max-w-xl items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-text-secondary)]"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="flex-1 text-left">Search gear, docs, shortcuts...</span>
        <kbd className="hidden rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-1.5 py-0.5 text-xs sm:inline">
          K
        </kbd>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Search dialog */}
          <div className="relative z-10 w-full max-w-xl rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-2xl">
            {/* Input */}
            <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4">
              <svg className="h-5 w-5 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isIndexReady ? 'Search...' : 'Building index...'}
                className="flex-1 bg-transparent py-4 text-base outline-none placeholder:text-[var(--color-text-secondary)]"
                disabled={!isIndexReady}
              />
              {isLoading && (
                <svg className="h-5 w-5 animate-spin text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-1.5 py-0.5 text-xs text-[var(--color-text-secondary)]">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-auto p-2">
              {query && results.length === 0 && !isLoading && (
                <div className="py-8 text-center text-[var(--color-text-secondary)]">
                  No results found for "{query}"
                </div>
              )}

              {results.length > 0 && (
                <ul className="space-y-1">
                  {results.map((result) => (
                    <li key={result.id}>
                      <button
                        onClick={() => handleResultClick(result)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-[var(--color-bg-secondary)]"
                      >
                        <span className="text-[var(--color-text-secondary)]">
                          {typeIcons[result.type]}
                        </span>
                        <span className="flex-1 truncate">{result.title}</span>
                        <span className="rounded bg-[var(--color-bg-secondary)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)]">
                          {typeLabels[result.type]}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {!query && (
                <div className="py-8 text-center text-[var(--color-text-secondary)]">
                  <p>Start typing to search</p>
                  <p className="mt-2 text-xs">
                    Search documentation, workflows, shortcuts, and more
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
