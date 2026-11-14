import type { ReactNode } from 'react'
import { cn } from './cn'

type BadgeTone = 'success' | 'warning'

const tones: Record<BadgeTone, { badge: string; dot: string }> = {
  success: {
    badge: 'bg-emerald-50 text-emerald-800 ring-emerald-600/15',
    dot: 'bg-emerald-500',
  },
  warning: {
    badge: 'bg-amber-50 text-amber-800 ring-amber-600/20',
    dot: 'bg-amber-500',
  },
}

type BadgeProps = {
  tone: BadgeTone
  children: ReactNode
}

export function Badge({ tone, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        tones[tone].badge,
      )}
    >
      <span className={cn('size-1.5 rounded-full', tones[tone].dot)} />
      {children}
    </span>
  )
}
