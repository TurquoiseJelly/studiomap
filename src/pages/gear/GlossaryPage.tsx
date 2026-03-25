import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { loadGlossary } from '@/services/gear-pack-loader'
import type { Glossary, GlossaryTerm } from '@/types/gear-pack.types'
import { Input } from '@/components/ui'

export function GlossaryPage() {
  const { gearId } = useParams<{ gearId: string }>()
  const [glossary, setGlossary] = useState<Glossary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)

  useEffect(() => {
    if (!gearId) return

    setIsLoading(true)
    loadGlossary(gearId)
      .then(setGlossary)
      .catch(setError)
      .finally(() => setIsLoading(false))
  }, [gearId])

  const sortedTerms = useMemo(() => {
    if (!glossary) return []
    return [...glossary.terms].sort((a, b) => a.term.localeCompare(b.term))
  }, [glossary])

  const letters = useMemo(() => {
    const uniqueLetters = new Set(sortedTerms.map((t) => t.term[0].toUpperCase()))
    return Array.from(uniqueLetters).sort()
  }, [sortedTerms])

  const filteredTerms = useMemo(() => {
    return sortedTerms.filter((term) => {
      const matchesSearch =
        !searchQuery ||
        term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesLetter = !selectedLetter || term.term[0].toUpperCase() === selectedLetter

      return matchesSearch && matchesLetter
    })
  }, [sortedTerms, searchQuery, selectedLetter])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-pulse text-[var(--color-text-secondary)]">Loading...</div>
      </div>
    )
  }

  if (error || !glossary) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-red-500">Failed to load glossary</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Glossary</h1>
        <p className="mt-1 text-[var(--color-text-secondary)]">
          Terminology and definitions used throughout the documentation.
        </p>
      </div>

      {/* Search */}
      <Input
        placeholder="Search terms..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value)
          setSelectedLetter(null)
        }}
      />

      {/* Alphabet navigation */}
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => setSelectedLetter(null)}
          className={`rounded px-2 py-1 text-sm font-medium ${
            selectedLetter === null
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
          }`}
        >
          All
        </button>
        {letters.map((letter) => (
          <button
            key={letter}
            onClick={() => {
              setSelectedLetter(letter)
              setSearchQuery('')
            }}
            className={`rounded px-2 py-1 text-sm font-medium ${
              selectedLetter === letter
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Terms */}
      <div className="space-y-4">
        {filteredTerms.map((term) => (
          <GlossaryTermCard key={term.id} term={term} gearId={gearId!} allTerms={glossary.terms} />
        ))}
      </div>

      {filteredTerms.length === 0 && (
        <div className="py-12 text-center text-[var(--color-text-secondary)]">
          No terms found matching your search.
        </div>
      )}
    </div>
  )
}

function GlossaryTermCard({
  term,
  gearId,
  allTerms,
}: {
  term: GlossaryTerm
  gearId: string
  allTerms: GlossaryTerm[]
}) {
  const relatedTermObjects = term.relatedTerms
    ?.map((id) => allTerms.find((t) => t.id === id))
    .filter(Boolean) as GlossaryTerm[] | undefined

  return (
    <div id={term.id} className="scroll-mt-20 rounded-xl border border-[var(--color-border)] p-4">
      <h3 className="text-lg font-semibold">{term.term}</h3>
      <p className="mt-2 text-[var(--color-text-secondary)]">{term.definition}</p>

      {/* Related terms */}
      {relatedTermObjects && relatedTermObjects.length > 0 && (
        <div className="mt-3">
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
            Related:{' '}
          </span>
          {relatedTermObjects.map((related, i) => (
            <span key={related.id}>
              <a
                href={`#${related.id}`}
                className="text-primary-600 hover:underline dark:text-primary-400"
              >
                {related.term}
              </a>
              {i < relatedTermObjects.length - 1 && ', '}
            </span>
          ))}
        </div>
      )}

      {/* Linked sections */}
      {term.linkedSections && term.linkedSections.length > 0 && (
        <div className="mt-3">
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
            See also:{' '}
          </span>
          {term.linkedSections.map((link, i) => (
            <span key={i}>
              <Link
                to={`/gear/${gearId}/section/${link.sectionId}${link.headingId ? `#${link.headingId}` : ''}`}
                className="text-primary-600 hover:underline dark:text-primary-400"
              >
                {link.sectionId}
              </Link>
              {i < term.linkedSections!.length - 1 && ', '}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
