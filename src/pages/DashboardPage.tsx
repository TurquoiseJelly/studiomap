import { Link } from 'react-router-dom'
import { useUserStore } from '@/stores/user-store'
import { Button, Card, CardContent, ProgressRing, MasteryBadge } from '@/components/ui'
import { useGearPack } from '@/hooks/useGearPack'

export function DashboardPage() {
  const { ownedGear, recentlyViewed, getFavorites } = useUserStore()
  const favorites = getFavorites()

  if (ownedGear.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-surface-100 dark:bg-surface-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold">No gear yet</h2>
        <p className="mt-2 text-center text-[var(--color-text-secondary)]">
          Add your first piece of gear to start exploring its documentation.
        </p>
        <Link to="/browse" className="mt-6">
          <Button>
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Gear
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Gear</h1>
        <Link to="/browse">
          <Button>
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Gear
          </Button>
        </Link>
      </div>

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Favorites</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((gear) => (
              <GearCard key={gear.gearId} gearId={gear.gearId} isFavorite />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Recently Viewed</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentlyViewed.slice(0, 3).map((recent) => (
              <GearCard key={recent.gearId} gearId={recent.gearId} />
            ))}
          </div>
        </section>
      )}

      {/* All Gear */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">All Gear</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ownedGear.map((gear) => (
            <GearCard key={gear.gearId} gearId={gear.gearId} />
          ))}
        </div>
      </section>
    </div>
  )
}

function GearCard({ gearId, isFavorite }: { gearId: string; isFavorite?: boolean }) {
  const { manifest } = useGearPack(gearId)
  const { getGearProgress, getGearMasteryLevel } = useUserStore()

  const totalSections = manifest?.sections?.length ?? 0
  const progress = getGearProgress(gearId, totalSections)
  const masteryLevel = getGearMasteryLevel(gearId, totalSections)

  return (
    <Link to={`/gear/${gearId}`}>
      <Card hoverable className="h-full">
        <CardContent>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {/* Progress Ring */}
              {totalSections > 0 && (
                <ProgressRing progress={progress} masteryLevel={masteryLevel} size="sm" showPercentage={false} />
              )}
              <div>
                <h3 className="font-semibold">{formatGearId(gearId)}</h3>
                {totalSections > 0 && masteryLevel !== 'none' ? (
                  <MasteryBadge level={masteryLevel} size="sm" showLabel={true} />
                ) : (
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Click to explore
                  </p>
                )}
              </div>
            </div>
            {isFavorite && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function formatGearId(gearId: string): string {
  return gearId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
