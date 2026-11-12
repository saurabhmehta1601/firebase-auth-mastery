import { cn } from './cn'
import { AlertCircleIcon, CheckCircleIcon } from './icons'
import { Spinner } from './Spinner'

type StatusIconTone = 'loading' | 'success' | 'danger'

const tones: Record<StatusIconTone, string> = {
  loading: 'bg-accent-soft ring-accent-soft/50',
  success: 'bg-emerald-50 text-emerald-600 ring-emerald-50/60',
  danger: 'bg-rose-50 text-rose-600 ring-rose-50/60',
}

export function StatusIcon({ tone }: { tone: StatusIconTone }) {
  return (
    <span
      className={cn(
        'grid size-14 animate-pop place-items-center rounded-full ring-8',
        tones[tone],
      )}
    >
      {tone === 'loading' ? <Spinner size="md" /> : null}
      {tone === 'success' ? <CheckCircleIcon className="size-7" /> : null}
      {tone === 'danger' ? <AlertCircleIcon className="size-7" /> : null}
    </span>
  )
}
