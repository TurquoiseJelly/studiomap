import { clsx } from 'clsx'
import type { MasteryLevel } from '@/types/gear-pack.types'

export type ProgressRingSize = 'sm' | 'md' | 'lg'

export interface ProgressRingProps {
  progress: number
  masteryLevel?: MasteryLevel
  size?: ProgressRingSize
  showPercentage?: boolean
  className?: string
}

const sizeConfig: Record<ProgressRingSize, { size: number; strokeWidth: number; fontSize: string }> = {
  sm: { size: 32, strokeWidth: 3, fontSize: 'text-[8px]' },
  md: { size: 48, strokeWidth: 4, fontSize: 'text-xs' },
  lg: { size: 64, strokeWidth: 5, fontSize: 'text-sm' },
}

const levelColors: Record<MasteryLevel, { stroke: string; text: string }> = {
  none: {
    stroke: 'stroke-surface-300 dark:stroke-surface-600',
    text: 'text-surface-500 dark:text-surface-400',
  },
  beginner: {
    stroke: 'stroke-green-500 dark:stroke-green-400',
    text: 'text-green-600 dark:text-green-400',
  },
  intermediate: {
    stroke: 'stroke-blue-500 dark:stroke-blue-400',
    text: 'text-blue-600 dark:text-blue-400',
  },
  advanced: {
    stroke: 'stroke-yellow-500 dark:stroke-yellow-400',
    text: 'text-yellow-600 dark:text-yellow-400',
  },
  master: {
    stroke: 'stroke-purple-500 dark:stroke-purple-400',
    text: 'text-purple-600 dark:text-purple-400',
  },
}

function getMasteryLevelFromProgress(progress: number): MasteryLevel {
  if (progress === 100) return 'master'
  if (progress >= 75) return 'advanced'
  if (progress >= 50) return 'intermediate'
  if (progress >= 25) return 'beginner'
  return 'none'
}

export function ProgressRing({
  progress,
  masteryLevel,
  size = 'md',
  showPercentage = true,
  className,
}: ProgressRingProps) {
  const config = sizeConfig[size]
  const level = masteryLevel ?? getMasteryLevelFromProgress(progress)
  const colors = levelColors[level]

  const radius = (config.size - config.strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={clsx('relative inline-flex items-center justify-center', className)}>
      <svg
        width={config.size}
        height={config.size}
        className="-rotate-90 transform"
      >
        {/* Background circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          strokeWidth={config.strokeWidth}
          fill="none"
          className="stroke-surface-200 dark:stroke-surface-700"
        />
        {/* Progress circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          strokeWidth={config.strokeWidth}
          fill="none"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            transition: 'stroke-dashoffset 0.3s ease-in-out',
          }}
          className={colors.stroke}
        />
      </svg>
      {showPercentage && (
        <span
          className={clsx(
            'absolute font-semibold',
            config.fontSize,
            colors.text
          )}
        >
          {progress}%
        </span>
      )}
    </div>
  )
}
