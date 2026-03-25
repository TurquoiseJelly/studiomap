import { useParams } from 'react-router-dom'
import { useGearPack, useSection } from '@/hooks/useGearPack'
import { SectionContent, SectionNav, InteractiveDiagram } from '@/components/gear'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { MarkAsReadButton } from '@/components/ui'
import { useUserStore } from '@/stores/user-store'
import { useState } from 'react'

export function SectionPage() {
  const { gearId, sectionId } = useParams<{ gearId: string; sectionId: string }>()
  const { manifest } = useGearPack(gearId)
  const { section, isLoading, error } = useSection(gearId, sectionId)
  const { isSectionComplete, markSectionComplete, unmarkSectionComplete, hasGear } = useUserStore()
  const [highlightedHotspots, setHighlightedHotspots] = useState<string[]>([])
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [isDiagramOpen, setIsDiagramOpen] = useState(false)

  const isComplete = gearId && sectionId ? isSectionComplete(gearId, sectionId) : false
  const owned = gearId ? hasGear(gearId) : false

  const handleToggleComplete = () => {
    if (!gearId || !sectionId) return
    if (isComplete) {
      unmarkSectionComplete(gearId, sectionId)
    } else {
      markSectionComplete(gearId, sectionId)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-pulse text-[var(--color-text-secondary)]">Loading...</div>
      </div>
    )
  }

  if (error || !section) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-red-500">Failed to load section</div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Navigation Bar */}
      {manifest && (
        <div className="sticky top-14 z-10 -mx-4 mb-4 flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 lg:hidden">
          <button
            onClick={() => setIsNavOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[var(--color-bg-secondary)] px-3 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-primary-100 dark:hover:bg-primary-900/30"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Sections
          </button>
          <button
            onClick={() => setIsDiagramOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[var(--color-bg-secondary)] px-3 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-primary-100 dark:hover:bg-primary-900/30"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            Diagram
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[250px_1fr] xl:grid-cols-[250px_1fr_350px]">
        {/* Navigation sidebar - Desktop only */}
        {manifest && (
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <SectionNav sections={manifest.sections} workflows={manifest.workflows} />
            </div>
          </aside>
        )}

        {/* Main content */}
        <main className="min-w-0">
          <SectionContent section={section} onHotspotHighlight={setHighlightedHotspots} />

          {/* Mark as Read button - only show for owned gear */}
          {owned && (
            <div className="mt-8 border-t border-[var(--color-border)] pt-6">
              <MarkAsReadButton isComplete={isComplete} onToggle={handleToggleComplete} />
            </div>
          )}
        </main>

        {/* Diagram sidebar - XL desktop only */}
        {manifest && (
          <aside className="hidden xl:block">
            <div className="sticky top-20">
              <InteractiveDiagram
                gearId={gearId!}
                manifest={manifest}
                highlightedHotspots={highlightedHotspots}
              />
            </div>
          </aside>
        )}
      </div>

      {/* Mobile Navigation Bottom Sheet */}
      {manifest && (
        <BottomSheet
          isOpen={isNavOpen}
          onClose={() => setIsNavOpen(false)}
          title="Navigate"
        >
          <SectionNav
            sections={manifest.sections}
            workflows={manifest.workflows}
            onNavigate={() => setIsNavOpen(false)}
          />
        </BottomSheet>
      )}

      {/* Mobile Diagram Bottom Sheet */}
      {manifest && (
        <BottomSheet
          isOpen={isDiagramOpen}
          onClose={() => setIsDiagramOpen(false)}
          title="Interactive Diagram"
        >
          <InteractiveDiagram
            gearId={gearId!}
            manifest={manifest}
            highlightedHotspots={highlightedHotspots}
          />
        </BottomSheet>
      )}
    </>
  )
}
