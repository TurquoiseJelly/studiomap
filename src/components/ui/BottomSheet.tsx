import { useRef, useEffect, useState } from 'react'
import { useSpring, animated, config } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'

const SHEET_HEIGHT = 300

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const contentHeightRef = useRef(SHEET_HEIGHT)
  const [contentHeight, setContentHeight] = useState(SHEET_HEIGHT)

  const [{ y }, api] = useSpring(() => ({
    y: SHEET_HEIGHT,
    config: config.stiff,
  }))

  useEffect(() => {
    if (sheetRef.current) {
      const height = sheetRef.current.offsetHeight
      contentHeightRef.current = height
      setContentHeight(height)
    }
  }, [children])

  useEffect(() => {
    api.start({ y: isOpen ? 0 : contentHeightRef.current })
  }, [isOpen, api])

  const bind = useDrag(
    ({ last, velocity: [, vy], direction: [, dy], movement: [, my], cancel }) => {
      // Only allow dragging down
      if (my < 0) {
        cancel()
        return
      }

      if (last) {
        // Close if dragged down more than 100px or velocity is high
        if (my > 100 || (vy > 0.5 && dy > 0)) {
          api.start({ y: contentHeightRef.current, onRest: onClose })
        } else {
          api.start({ y: 0 })
        }
      } else {
        api.start({ y: my, immediate: true })
      }
    },
    {
      from: () => [0, y.get()],
      filterTaps: true,
      bounds: { top: 0 },
      rubberband: true,
    }
  )

  const handleBackdropClick = () => {
    api.start({ y: contentHeightRef.current, onRest: onClose })
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <animated.div
        className="fixed inset-0 z-40 bg-black/50"
        style={{
          opacity: y.to([0, contentHeight], [1, 0]),
        }}
        onClick={handleBackdropClick}
      />

      {/* Sheet */}
      <animated.div
        ref={sheetRef}
        {...bind()}
        className="fixed inset-x-0 bottom-0 z-50 touch-none rounded-t-2xl bg-[var(--color-bg)] shadow-2xl"
        style={{
          y,
          maxHeight: '85vh',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-surface-300 dark:bg-surface-600" />
        </div>

        {/* Header */}
        {title && (
          <div className="border-b border-[var(--color-border)] px-4 pb-3">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">{title}</h3>
          </div>
        )}

        {/* Content */}
        <div className="overflow-auto p-4" style={{ maxHeight: 'calc(85vh - 4rem)' }}>
          {children}
        </div>
      </animated.div>
    </>
  )
}
