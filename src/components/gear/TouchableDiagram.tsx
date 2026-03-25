import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSpring, animated, config } from '@react-spring/web'
import { useGesture } from '@use-gesture/react'
import type { GearPackManifest, HotspotDefinition } from '@/types/gear-pack.types'
import { loadDiagramSvg } from '@/services/gear-pack-loader'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'

interface TouchableDiagramProps {
  gearId: string
  manifest: GearPackManifest
  highlightedHotspots?: string[]
  onHotspotClick?: (hotspot: HotspotDefinition) => void
}

const MIN_SCALE = 0.5
const MAX_SCALE = 4
const DOUBLE_TAP_SCALE = 2

export function TouchableDiagram({
  gearId,
  manifest,
  highlightedHotspots = [],
  onHotspotClick,
}: TouchableDiagramProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotDefinition | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const prefersReducedMotion = usePrefersReducedMotion()

  const [{ scale, x, y }, api] = useSpring(() => ({
    scale: 1,
    x: 0,
    y: 0,
    config: prefersReducedMotion ? { duration: 0 } : config.default,
  }))

  useEffect(() => {
    setIsLoading(true)
    loadDiagramSvg(gearId)
      .then(setSvgContent)
      .catch(setError)
      .finally(() => setIsLoading(false))
  }, [gearId])

  const resetTransform = useCallback(() => {
    api.start({ scale: 1, x: 0, y: 0 })
  }, [api])

  const handleHotspotTap = useCallback(
    (hotspotId: string) => {
      const hotspot = manifest.diagram.hotspots[hotspotId]
      if (!hotspot) return

      if (onHotspotClick) {
        onHotspotClick(hotspot)
      } else {
        setSelectedHotspot(hotspot)
      }
    },
    [manifest.diagram.hotspots, onHotspotClick]
  )

  const handleNavigateToSection = useCallback(() => {
    if (!selectedHotspot?.linkedSection) return

    const { sectionId, headingId } = selectedHotspot.linkedSection
    const path = headingId
      ? `/gear/${gearId}/section/${sectionId}#${headingId}`
      : `/gear/${gearId}/section/${sectionId}`

    setSelectedHotspot(null)
    navigate(path)
  }, [selectedHotspot, gearId, navigate])

  // Gesture handling
  const lastTapTime = useRef(0)
  const bind = useGesture(
    {
      onDrag: ({ offset: [ox, oy], pinching, cancel }) => {
        if (pinching) {
          cancel()
          return
        }
        api.start({ x: ox, y: oy })
      },
      onPinch: ({ offset: [s], origin: [ox, oy] }) => {
        const clampedScale = Math.min(Math.max(s, MIN_SCALE), MAX_SCALE)
        api.start({ scale: clampedScale, x: ox, y: oy })
      },
      onDoubleClick: ({ event }) => {
        event.preventDefault()
        const currentScale = scale.get()
        if (currentScale > 1) {
          resetTransform()
        } else {
          api.start({ scale: DOUBLE_TAP_SCALE })
        }
      },
    },
    {
      drag: {
        from: () => [x.get(), y.get()],
        filterTaps: true,
      },
      pinch: {
        scaleBounds: { min: MIN_SCALE, max: MAX_SCALE },
        rubberband: true,
      },
    }
  )

  // Set up hotspot event listeners
  useEffect(() => {
    if (!svgRef.current || !svgContent) return

    const svgElement = svgRef.current.querySelector('svg')
    if (!svgElement) return

    const hotspotElements = svgElement.querySelectorAll('[id]')
    const listeners: Array<{ element: Element; handler: EventListener }> = []

    hotspotElements.forEach((element) => {
      const hotspotId = element.id
      if (!manifest.diagram.hotspots[hotspotId]) return

      // Use pointerup for better touch handling
      const handler = (e: Event) => {
        const now = Date.now()
        const timeSinceLastTap = now - lastTapTime.current
        lastTapTime.current = now

        // Detect single tap (not double tap)
        if (timeSinceLastTap > 300) {
          e.stopPropagation()
          handleHotspotTap(hotspotId)
        }
      }

      element.addEventListener('pointerup', handler)
      listeners.push({ element, handler })

      // Add touch-friendly styles
      ;(element as HTMLElement).style.cursor = 'pointer'
      ;(element as HTMLElement).style.touchAction = 'manipulation'

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
    svgElement.appendChild(style)

    return () => {
      listeners.forEach(({ element, handler }) => {
        element.removeEventListener('pointerup', handler)
      })
    }
  }, [svgContent, manifest.diagram.hotspots, highlightedHotspots, handleHotspotTap])

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
      {/* Zoom Controls */}
      <div className="absolute right-2 top-2 z-10 flex flex-col gap-1">
        <button
          onClick={() => api.start({ scale: Math.min(scale.get() * 1.5, MAX_SCALE) })}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] shadow-md hover:bg-[var(--color-bg-secondary)]"
          aria-label="Zoom in"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
          </svg>
        </button>
        <button
          onClick={() => api.start({ scale: Math.max(scale.get() / 1.5, MIN_SCALE) })}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] shadow-md hover:bg-[var(--color-bg-secondary)]"
          aria-label="Zoom out"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
        <button
          onClick={resetTransform}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] shadow-md hover:bg-[var(--color-bg-secondary)]"
          aria-label="Reset zoom"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </button>
      </div>

      {/* Diagram Container */}
      <div
        ref={containerRef}
        className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
        style={{ touchAction: 'none' }}
      >
        <animated.div
          {...bind()}
          ref={svgRef}
          className="origin-center p-4"
          style={{
            scale,
            x,
            y,
            touchAction: 'none',
          }}
          dangerouslySetInnerHTML={{ __html: svgContent || '' }}
        />
      </div>

      {/* Instructions */}
      <p className="mt-2 text-center text-xs text-[var(--color-text-secondary)]">
        Pinch to zoom, drag to pan, tap controls for details
      </p>

      {/* Bottom Sheet for Hotspot Details */}
      <BottomSheet
        isOpen={selectedHotspot !== null}
        onClose={() => setSelectedHotspot(null)}
        title={selectedHotspot?.tooltip.title}
      >
        {selectedHotspot && (
          <div className="space-y-4">
            <p className="text-[var(--color-text)]">{selectedHotspot.tooltip.description}</p>

            {selectedHotspot.tooltip.tip && (
              <div className="rounded-lg bg-primary-500/10 p-3">
                <p className="text-sm">
                  <span className="font-medium text-primary-600 dark:text-primary-400">Tip: </span>
                  <span className="text-[var(--color-text-secondary)]">
                    {selectedHotspot.tooltip.tip}
                  </span>
                </p>
              </div>
            )}

            {selectedHotspot.linkedSection && (
              <button
                onClick={handleNavigateToSection}
                className="w-full rounded-lg bg-primary-500 px-4 py-3 font-medium text-white transition-colors hover:bg-primary-600"
              >
                Learn more
              </button>
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
