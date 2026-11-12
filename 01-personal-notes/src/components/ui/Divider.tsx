import type { ReactNode } from 'react'
import { cn } from './cn'

type DividerProps = {
  children?: ReactNode
  className?: string
}

export function Divider({ children, className }: DividerProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase',
        className,
      )}
    >
      <span className="h-px flex-1 bg-line" />
      {children}
      {children ? <span className="h-px flex-1 bg-line" /> : null}
    </div>
  )
}
