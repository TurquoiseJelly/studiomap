import { useState, useEffect, useCallback, useRef } from 'react'
import { search, buildSearchIndex, isSearchReady, type SearchResult } from '@/services/search-service'
import { getAvailableGearPacks } from '@/services/gear-pack-loader'

interface UseSearchResult {
  query: string
  setQuery: (query: string) => void
  results: SearchResult[]
  isLoading: boolean
  isIndexReady: boolean
}

export function useSearch(debounceMs = 200): UseSearchResult {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isIndexReady, setIsIndexReady] = useState(false)
  const timeoutRef = useRef<number | undefined>(undefined)

  // Build index on mount
  useEffect(() => {
    if (!isSearchReady()) {
      const gearIds = getAvailableGearPacks().map((g) => g.id)
      buildSearchIndex(gearIds).then(() => {
        setIsIndexReady(true)
      })
    } else {
      setIsIndexReady(true)
    }
  }, [])

  // Debounced search
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const searchResults = await search(searchQuery)
        setResults(searchResults)
      } catch (e) {
        console.error('Search failed:', e)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (!query.trim()) {
      setResults([])
      return
    }

    timeoutRef.current = window.setTimeout(() => {
      performSearch(query)
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [query, debounceMs, performSearch])

  return {
    query,
    setQuery,
    results,
    isLoading,
    isIndexReady,
  }
}
