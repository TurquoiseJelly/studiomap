import { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSearch } from '@/hooks/useSearch'
import type { SearchResult } from '@/services/search-service'

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const { query, setQuery, results, isLoading, isIndexReady } = useSearch()
  const hasInitialized = useRef(false)

  // Sync URL query with search state on mount only
  useEffect(() => {
    if (!hasInitialized.current && initialQuery) {
      setQuery(initialQuery)
      hasInitialized.current = true
    }
  }, [initialQuery, setQuery])

  // Update URL when query changes
  useEffect(() => {
    if (query) {
      setSearchParams({ q: query }, { replace: true })
    } else if (searchParams.has('q')) {
      setSearchParams({}, { replace: true })
    }
  }, [query, setSearchParams, searchParams])

  const typeIcons: Record<SearchResult['type'], React.ReactNode> = {
    section: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    workflow: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    shortcut: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    glossary: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    hotspot: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Search</h1>
        {query && (
          <p className="mt-1 text-[var(--color-text-secondary)]">
            Showing results for "{query}"
          </p>
        )}
      </div>

      {/* Search input */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <svg className="h-5 w-5 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isIndexReady ? 'Search gear, docs, shortcuts...' : 'Building search index...'}
          disabled={!isIndexReady}
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] py-3 pl-12 pr-4 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
            <svg className="h-5 w-5 animate-spin text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="py-12 text-center">
          <svg className="mx-auto h-8 w-8 animate-spin text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-3 text-[var(--color-text-secondary)]">Searching...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-2">
          {results.map((result) => (
            <Link
              key={result.id}
              to={result.path}
              className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] p-4 transition hover:border-primary-500/50 hover:bg-[var(--color-bg-secondary)]"
            >
              <span className="flex-shrink-0 text-[var(--color-text-secondary)]">
                {typeIcons[result.type]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{result.title}</p>
                {result.description && (
                  <p className="mt-0.5 truncate text-sm text-[var(--color-text-secondary)]">
                    {result.description}
                  </p>
                )}
              </div>
              <span className="flex-shrink-0 rounded-full bg-[var(--color-bg-secondary)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-text-secondary)]">
                {typeLabels[result.type]}
              </span>
            </Link>
          ))}
        </div>
      ) : query ? (
        <div className="py-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-4 text-[var(--color-text-secondary)]">
            No results found for "{query}"
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Try different keywords or check your spelling
          </p>
        </div>
      ) : (
        <div className="py-16 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="mt-4 text-[var(--color-text-secondary)]">
            Enter a search query to find gear, documentation, and shortcuts.
          </p>
        </div>
      )}
    </div>
  )
}
