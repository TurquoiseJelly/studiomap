import { useEffect, useRef } from 'react'
import { useUserStore, useUserStoreHydrated } from '@/stores/user-store'
import { preloadGearPack } from '@/services/gear-pack-loader'
import { isGearPackFullyCached } from '@/services/storage'

interface PreloadStatus {
  gearId: string
  status: 'pending' | 'loading' | 'cached' | 'error'
}

export function useGearPackPreloader(): void {
  const ownedGear = useUserStore((state) => state.ownedGear)
  const hasHydrated = useUserStoreHydrated()
  const preloadedRef = useRef<Set<string>>(new Set())
  const statusRef = useRef<Map<string, PreloadStatus>>(new Map())

  useEffect(() => {
    if (!hasHydrated) return
    if (ownedGear.length === 0) return

    const preloadNextGearPack = async () => {
      // Find gear packs that haven't been preloaded yet
      for (const gear of ownedGear) {
        if (preloadedRef.current.has(gear.gearId)) continue

        // Check if already fully cached
        const isCached = await isGearPackFullyCached(gear.gearId)
        if (isCached) {
          preloadedRef.current.add(gear.gearId)
          statusRef.current.set(gear.gearId, {
            gearId: gear.gearId,
            status: 'cached',
          })
          continue
        }

        // Mark as loading
        statusRef.current.set(gear.gearId, {
          gearId: gear.gearId,
          status: 'loading',
        })

        try {
          // Use requestIdleCallback for non-blocking preload
          if ('requestIdleCallback' in window) {
            await new Promise<void>((resolve) => {
              requestIdleCallback(
                async () => {
                  try {
                    await preloadGearPack(gear.gearId)
                    preloadedRef.current.add(gear.gearId)
                    statusRef.current.set(gear.gearId, {
                      gearId: gear.gearId,
                      status: 'cached',
                    })
                  } catch (error) {
                    console.error(`[Preloader] Failed to preload ${gear.gearId}:`, error)
                    statusRef.current.set(gear.gearId, {
                      gearId: gear.gearId,
                      status: 'error',
                    })
                  }
                  resolve()
                },
                { timeout: 5000 }
              )
            })
          } else {
            // Fallback for browsers without requestIdleCallback
            await preloadGearPack(gear.gearId)
            preloadedRef.current.add(gear.gearId)
            statusRef.current.set(gear.gearId, {
              gearId: gear.gearId,
              status: 'cached',
            })
          }
        } catch (error) {
          console.error(`[Preloader] Failed to preload ${gear.gearId}:`, error)
          statusRef.current.set(gear.gearId, {
            gearId: gear.gearId,
            status: 'error',
          })
        }

        // Only preload one at a time to avoid overwhelming the network
        break
      }

      // Check if there are more to preload
      const hasMore = ownedGear.some(
        (g) => !preloadedRef.current.has(g.gearId) && statusRef.current.get(g.gearId)?.status !== 'loading'
      )

      if (hasMore && navigator.onLine) {
        // Schedule next preload
        setTimeout(preloadNextGearPack, 1000)
      }
    }

    // Only preload when online
    if (navigator.onLine) {
      preloadNextGearPack()
    }

    // Listen for online event to resume preloading
    const handleOnline = () => {
      preloadNextGearPack()
    }

    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('online', handleOnline)
    }
  }, [ownedGear, hasHydrated])
}
