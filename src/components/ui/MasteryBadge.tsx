import { clsx } from 'clsx'
import type { MasteryLevel } from '@/types/gear-pack.types'

export type MasteryBadgeSize = 'sm' | 'md' | 'lg'

export interface MasteryBadgeProps {
  level: MasteryLevel
  size?: MasteryBadgeSize
  showLabel?: boolean
  className?: string
}

const levelConfig: Record<MasteryLevel, { icon: string; label: string; colors: string }> = {
  none: {
    icon: '',
    label: 'Not Started',
    colors: 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400',
  },
  beginner: {
    icon: '🌱',
    label: 'Beginner',
    colors: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  intermediate: {
    icon: '📘',
    label: 'Intermediate',
    colors: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  advanced: {
    icon: '⭐',
    label: 'Advanced',
    colors: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  master: {
    icon: '🏆',
    label: 'Master',
    colors: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  },
}

const sizeStyles: Record<MasteryBadgeSize, { container: string; icon: string; label: string }> = {
  sm: {
    container: 'px-1.5 py-0.5 gap-1',
    icon: 'text-xs',
    label: 'text-xs',
  },
  md: {
    container: 'px-2 py-1 gap-1.5',
    icon: 'text-sm',
    label: 'text-sm',
  },
  lg: {
    container: 'px-3 py-1.5 gap-2',
    icon: 'text-base',
    label: 'text-base font-medium',
  },
}

export function MasteryBadge({ level, size = 'md', showLabel = true, className }: MasteryBadgeProps) {
  const config = levelConfig[level]
  const sizeStyle = sizeStyles[size]

  if (level === 'none' && !showLabel) {
    return null
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full',
        config.colors,
        sizeStyle.container,
        className
      )}
    >
      {config.icon && <span className={sizeStyle.icon}>{config.icon}</span>}
      {showLabel && <span className={sizeStyle.label}>{config.label}</span>}
    </span>
  )
}
