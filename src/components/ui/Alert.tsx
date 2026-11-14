import type { ReactNode } from 'react'
import { cn, focusRing } from './cn'
import { AlertCircleIcon, AlertTriangleIcon, CheckCircleIcon, CloseIcon } from './icons'

type AlertStatus = 'success' | 'danger' | 'warning'

const styles: Record<AlertStatus, { container: string; icon: string; dismiss: string }> = {
  success: {
    container: 'border-emerald-200/70 bg-emerald-50/80 text-emerald-950',
    icon: 'text-emerald-600',
    dismiss: 'text-emerald-700/70 hover:bg-emerald-100 hover:text-emerald-900',
  },
  danger: {
    container: 'border-rose-200/70 bg-rose-50/80 text-rose-950',
    icon: 'text-rose-600',
    dismiss: 'text-rose-700/70 hover:bg-rose-100 hover:text-rose-900',
  },
  warning: {
    container: 'border-amber-200/80 bg-amber-50/80 text-amber-950',
    icon: 'text-amber-600',
    dismiss: 'text-amber-700/70 hover:bg-amber-100 hover:text-amber-900',
  },
}

const icons: Record<AlertStatus, typeof CheckCircleIcon> = {
  success: CheckCircleIcon,
  danger: AlertCircleIcon,
  warning: AlertTriangleIcon,
}

type AlertProps = {
  status: AlertStatus
  title?: string
  children?: ReactNode
  action?: ReactNode
  onDismiss?: () => void
  dismissLabel?: string
  className?: string
}

export function Alert({
  status,
  title,
  children,
  action,
  onDismiss,
  dismissLabel = 'Dismiss',
  className,
}: AlertProps) {
  const style = styles[status]
  const Icon = icons[status]

  return (
    <div
      role={status === 'danger' ? 'alert' : 'status'}
      className={cn(
        'flex animate-rise items-start gap-3 rounded-xl border px-4 py-3.5 text-sm leading-6',
        style.container,
        className,
      )}
    >
      <Icon className={cn('mt-[3px] size-[18px]', style.icon)} />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={cn(title && 'opacity-85')}>{children}</div> : null}
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          aria-label={dismissLabel}
          onClick={onDismiss}
          className={cn(
            '-mt-0.5 -mr-1.5 grid size-7 shrink-0 place-items-center rounded-lg transition-colors',
            focusRing,
            style.dismiss,
          )}
        >
          <CloseIcon />
        </button>
      ) : null}
    </div>
  )
}
