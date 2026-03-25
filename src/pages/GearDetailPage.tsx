import { useEffect } from 'react'
import { useParams, Link, Outlet, useLocation } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger, Button, ProgressRing, MasteryBadge } from '@/components/ui'
import { useUserStore } from '@/stores/user-store'
import { useGearPack } from '@/hooks/useGearPack'
import { InteractiveDiagram } from '@/components/gear'

export function GearDetailPage() {
  const { gearId } = useParams<{ gearId: string }>()
  const location = useLocation()
  const { hasGear, addGear, removeGear, toggleFavorite, isFavorite, addRecentlyViewed, getGearProgress, getGearMasteryLevel } = useUserStore()
  const { manifest } = useGearPack(gearId)

  const owned = hasGear(gearId!)
  const favorite = isFavorite(gearId!)
  const totalSections = manifest?.sections?.length ?? 0
  const progress = owned && gearId ? getGearProgress(gearId, totalSections) : 0
  const masteryLevel = owned && gearId ? getGearMasteryLevel(gearId, totalSections) : 'none'

  // Get the first workflow ID from the manifest, with fallback
  const firstWorkflowId = manifest?.workflows?.[0]?.id

  // Track recently viewed
  useEffect(() => {
    if (gearId) {
      addRecentlyViewed(gearId)
    }
  }, [gearId, addRecentlyViewed])

  // Determine active tab from URL
  const getActiveTab = () => {
    const path = location.pathname
    if (path.includes('/section/')) return 'sections'
    if (path.includes('/workflow/')) return 'workflows'
    if (path.includes('/quick-ref')) return 'quick-ref'
    if (path.includes('/glossary')) return 'glossary'
    return 'overview'
  }

  const formatGearName = (id: string) => {
    return id
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {/* Progress Ring - only for owned gear with sections */}
          {owned && totalSections > 0 && (
            <ProgressRing progress={progress} masteryLevel={masteryLevel} size="lg" />
          )}

          <div>
            <Link
              to="/dashboard"
              className="mb-2 inline-flex items-center text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </Link>
            <h1 className="text-2xl font-bold">{formatGearName(gearId!)}</h1>
            <div className="flex items-center gap-2">
              <p className="text-[var(--color-text-secondary)]">Novation</p>
              {owned && totalSections > 0 && masteryLevel !== 'none' && (
                <MasteryBadge level={masteryLevel} size="sm" />
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {owned && (
            <Button
              variant="ghost"
              onClick={() => toggleFavorite(gearId!)}
              aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {favorite ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              )}
            </Button>
          )}

          {owned ? (
            <Button variant="secondary" onClick={() => removeGear(gearId!)}>
              Remove from Library
            </Button>
          ) : (
            <Button onClick={() => addGear(gearId!)}>
              Add to Library
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={getActiveTab()}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <Link to={`/gear/${gearId}`}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </Link>
          <Link to={`/gear/${gearId}/section/overview`}>
            <TabsTrigger value="sections">Documentation</TabsTrigger>
          </Link>
          {firstWorkflowId ? (
            <Link to={`/gear/${gearId}/workflow/${firstWorkflowId}`}>
              <TabsTrigger value="workflows">Workflows</TabsTrigger>
            </Link>
          ) : (
            <TabsTrigger value="workflows" disabled>Workflows</TabsTrigger>
          )}
          <Link to={`/gear/${gearId}/quick-ref`}>
            <TabsTrigger value="quick-ref">Quick Reference</TabsTrigger>
          </Link>
          <Link to={`/gear/${gearId}/glossary`}>
            <TabsTrigger value="glossary">Glossary</TabsTrigger>
          </Link>
        </TabsList>
      </Tabs>

      {/* Content - either child route or overview */}
      <Outlet />

      {/* Show overview content if at base gear URL */}
      {location.pathname === `/gear/${gearId}` && <GearOverview gearId={gearId!} />}
    </div>
  )
}

function GearOverview({ gearId }: { gearId: string }) {
  const { manifest, isLoading, error } = useGearPack(gearId)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_380px]">
      {/* Interactive Diagram */}
      <div className="min-h-[300px] lg:min-h-0">
        {isLoading ? (
          <div className="flex aspect-video items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
            <div className="text-center">
              <svg className="mx-auto h-8 w-8 animate-spin text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Loading diagram...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex aspect-video items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2 text-sm text-red-500">Failed to load diagram</p>
            </div>
          </div>
        ) : manifest ? (
          <InteractiveDiagram gearId={gearId} manifest={manifest} />
        ) : null}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <div className="rounded-xl border border-[var(--color-border)] p-4">
          <h3 className="font-semibold">Get Started</h3>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            New to {gearId.split('-').slice(1).join(' ')}? Start with these guides:
          </p>
          <div className="mt-4 space-y-2">
            {manifest?.workflows?.[0] && (
              <Link
                to={`/gear/${gearId}/workflow/${manifest.workflows[0].id}`}
                className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] p-3 hover:bg-[var(--color-bg-secondary)]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  <span className="text-sm font-semibold">1</span>
                </div>
                <div>
                  <p className="font-medium">{manifest.workflows[0].title}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{manifest.workflows[0].difficulty} workflow</p>
                </div>
              </Link>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] p-4">
          <h3 className="font-semibold">Quick Reference</h3>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Common shortcuts and button combinations
          </p>
          <Link to={`/gear/${gearId}/quick-ref`}>
            <Button variant="secondary" size="sm" className="mt-3">
              View All Shortcuts
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
