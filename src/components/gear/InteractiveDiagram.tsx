import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { GearPackManifest, HotspotDefinition } from '@/types/gear-pack.types'
import { loadDiagramSvg } from '@/services/gear-pack-loader'
import { useIsTouchDevice } from '@/hooks/useMediaQuery'
import { TouchableDiagram } from './TouchableDiagram'

interface InteractiveDiagramProps {
  gearId: string
  manifest: GearPackManifest
  highlightedHotspots?: string[]
  onHotspotClick?: (hotspot: HotspotDefinition) => void
}

function DesktopDiagram({
  gearId,
  manifest,
  highlightedHotspots = [],
  onHotspotClick,
}: InteractiveDiagramProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [hoveredHotspot, setHoveredHotspot] = useState<HotspotDefinition | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    setIsLoading(true)
    loadDiagramSvg(gearId)
      .then(setSvgContent)
      .catch(setError)
      .finally(() => setIsLoading(false))
  }, [gearId])

  const handleHotspotInteraction = useCallback(
    (event: Event, hotspotId: string, action: 'enter' | 'leave' | 'click') => {
      const hotspot = manifest.diagram.hotspots[hotspotId]
      if (!hotspot) return

      if (action === 'enter') {
        const mouseEvent = event as MouseEvent
        setHoveredHotspot(hotspot)
        setTooltipPosition({ x: mouseEvent.clientX, y: mouseEvent.clientY })
      } else if (action === 'leave') {
        setHoveredHotspot(null)
      } else if (action === 'click') {
        if (onHotspotClick) {
          onHotspotClick(hotspot)
        } else if (hotspot.linkedSection) {
          const { sectionId, headingId } = hotspot.linkedSection
          const path = headingId
            ? `/gear/${gearId}/section/${sectionId}#${headingId}`
            : `/gear/${gearId}/section/${sectionId}`
          navigate(path)
        }
      }
    },
    [manifest.diagram.hotspots, gearId, navigate, onHotspotClick]
  )

  useEffect(() => {
    if (!containerRef.current || !svgContent) return

    const container = containerRef.current
    const svg = container.querySelector('svg')
    if (!svg) return

    // Add event listeners to hotspots
    const hotspotElements = svg.querySelectorAll('[id]')
    const listeners: Array<{ element: Element; type: string; handler: EventListener }> = []

    hotspotElements.forEach((element) => {
      const hotspotId = element.id
      if (!manifest.diagram.hotspots[hotspotId]) return

      const enterHandler = (e: Event) => handleHotspotInteraction(e, hotspotId, 'enter')
      const leaveHandler = (e: Event) => handleHotspotInteraction(e, hotspotId, 'leave')
      const clickHandler = (e: Event) => handleHotspotInteraction(e, hotspotId, 'click')

      element.addEventListener('mouseenter', enterHandler)
      element.addEventListener('mouseleave', leaveHandler)
      element.addEventListener('click', clickHandler)

      listeners.push(
        { element, type: 'mouseenter', handler: enterHandler },
        { element, type: 'mouseleave', handler: leaveHandler },
        { element, type: 'click', handler: clickHandler }
      )

      // Apply highlight class if needed
      if (highlightedHotspots.includes(hotspotId)) {
        element.classList.add('hotspot-highlighted')
      }
    })

    // Add highlight styles
    const style = document.createElement('style')
    style.textContent = `
      .hotspot-highlighted {
        animation: pulse-highlight 1.5s ease-in-out infinite;
      }
      @keyframes pulse-highlight {
        0%, 100% { opacity: 1; filter: drop-shadow(0 0 4px #e94560); }
        50% { opacity: 0.8; filter: drop-shadow(0 0 12px #e94560); }
      }
    `
    svg.appendChild(style)

    return () => {
      listeners.forEach(({ element, type, handler }) => {
        element.removeEventListener(type, handler)
      })
    }
  }, [svgContent, manifest.diagram.hotspots, highlightedHotspots, handleHotspotInteraction])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <div className="animate-pulse text-[var(--color-text-secondary)]">Loading diagram...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5">
        <div className="text-red-500">Failed to load diagram</div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="diagram-container overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 [&_svg]:h-auto [&_svg]:max-w-full [&_svg]:w-full"
        dangerouslySetInnerHTML={{ __html: svgContent || '' }}
      />

      {/* Tooltip */}
      {hoveredHotspot && (
        <div
          className="pointer-events-none fixed z-50 max-w-xs rounded-lg bg-surface-900 px-4 py-3 text-white shadow-xl dark:bg-surface-100 dark:text-surface-900"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y + 10,
          }}
        >
          <div className="font-semibold">{hoveredHotspot.tooltip.title}</div>
          <div className="mt-1 text-sm opacity-90">{hoveredHotspot.tooltip.description}</div>
          {hoveredHotspot.tooltip.tip && (
            <div className="mt-2 text-xs opacity-75">
              <span className="font-medium">Tip:</span> {hoveredHotspot.tooltip.tip}
            </div>
          )}
          {hoveredHotspot.linkedSection && (
            <div className="mt-2 text-xs text-primary-400">Click to learn more</div>
          )}
        </div>
      )}
    </div>
  )
}

export function InteractiveDiagram(props: InteractiveDiagramProps) {
  const isTouchDevice = useIsTouchDevice()

  return isTouchDevice ? <TouchableDiagram {...props} /> : <DesktopDiagram {...props} />
}
