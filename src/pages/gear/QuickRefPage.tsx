import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { loadQuickReference } from '@/services/gear-pack-loader'
import type { QuickReference, QuickReferenceEntry } from '@/types/gear-pack.types'
import { Input, Button } from '@/components/ui'

export function QuickRefPage() {
  const { gearId } = useParams<{ gearId: string }>()
  const [quickRef, setQuickRef] = useState<QuickReference | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    if (!gearId) return

    setIsLoading(true)
    loadQuickReference(gearId)
      .then(setQuickRef)
      .catch(setError)
      .finally(() => setIsLoading(false))
  }, [gearId])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-pulse text-[var(--color-text-secondary)]">Loading...</div>
      </div>
    )
  }

  if (error || !quickRef) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-red-500">Failed to load quick reference</div>
      </div>
    )
  }

  const filteredEntries = quickRef.entries.filter((entry) => {
    const matchesSearch =
      !searchQuery ||
      entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.shortcut.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = !selectedCategory || entry.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const groupedEntries = filteredEntries.reduce(
    (acc, entry) => {
      if (!acc[entry.category]) {
        acc[entry.category] = []
      }
      acc[entry.category].push(entry)
      return acc
    },
    {} as Record<string, QuickReferenceEntry[]>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quick Reference</h1>
        <p className="mt-1 text-[var(--color-text-secondary)]">
          Shortcuts and button combinations for fast access.
        </p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search shortcuts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {quickRef.categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Entries by category */}
      <div className="space-y-8">
        {Object.entries(groupedEntries).map(([category, entries]) => (
          <div key={category}>
            <h2 className="mb-4 text-lg font-semibold">{category}</h2>
            <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
              <table className="w-full">
                <thead className="bg-[var(--color-bg-secondary)]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-secondary)]">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-secondary)]">
                      Shortcut
                    </th>
                    <th className="hidden px-4 py-3 text-left text-sm font-medium text-[var(--color-text-secondary)] sm:table-cell">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-[var(--color-bg-secondary)]/50">
                      <td className="px-4 py-3 font-medium">{entry.action}</td>
                      <td className="px-4 py-3">
                        <kbd className="rounded bg-surface-100 px-2 py-1 font-mono text-sm dark:bg-surface-800">
                          {entry.shortcut}
                        </kbd>
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-[var(--color-text-secondary)] sm:table-cell">
                        {entry.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {filteredEntries.length === 0 && (
        <div className="py-12 text-center text-[var(--color-text-secondary)]">
          No shortcuts found matching your search.
        </div>
      )}
    </div>
  )
}
