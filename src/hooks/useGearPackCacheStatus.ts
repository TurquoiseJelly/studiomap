import { useState, useEffect } from 'react'
import { getGearPackCacheStatus, isGearPackFullyCached } from '@/services/storage'

export type CacheStatus = 'cached' | 'caching' | 'not-cached'

interface CacheStatusResult {
  status: CacheStatus
  cachedResources: number
  totalResources: number
  progress: number
}

export function useGearPackCacheStatus(gearId: string | undefined): CacheStatusResult {
  const [result, setResult] = useState<CacheStatusResult>({
    status: 'not-cached',
    cachedResources: 0,
    totalResources: 0,
    progress: 0,
  })

  useEffect(() => {
    if (!gearId) {
      setResult({
        status: 'not-cached',
        cachedResources: 0,
        totalResources: 0,
        progress: 0,
      })
      return
    }

    let mounted = true

    const checkStatus = async () => {
      try {
        const { isCached, cachedResources, totalResources } = await getGearPackCacheStatus(gearId)

        if (!mounted) return

        const progress = totalResources > 0 ? cachedResources / totalResources : 0
        const status: CacheStatus =
          isCached ? 'cached' : cachedResources > 0 ? 'caching' : 'not-cached'

        setResult({
          status,
          cachedResources,
          totalResources,
          progress,
        })
      } catch (error) {
        console.error('[CacheStatus] Failed to check cache status:', error)
        if (mounted) {
          setResult({
            status: 'not-cached',
            cachedResources: 0,
            totalResources: 0,
            progress: 0,
          })
        }
      }
    }

    checkStatus()

    // Poll for updates while caching
    const interval = setInterval(checkStatus, 2000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [gearId])

  return result
}

export function useIsGearPackCached(gearId: string | undefined): boolean {
  const [isCached, setIsCached] = useState(false)

  useEffect(() => {
    if (!gearId) {
      setIsCached(false)
      return
    }

    let mounted = true

    const check = async () => {
      try {
        const cached = await isGearPackFullyCached(gearId)
        if (mounted) setIsCached(cached)
      } catch {
        if (mounted) setIsCached(false)
      }
    }

    check()

    return () => {
      mounted = false
    }
  }, [gearId])

  return isCached
}
