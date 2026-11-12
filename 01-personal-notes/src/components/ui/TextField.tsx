import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from './cn'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  labelAction?: ReactNode
}

export function TextField({ label, labelAction, id, className, ...props }: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={cn('grid gap-2', className)}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={inputId} className="text-[13px] font-semibold text-ink">
          {label}
        </label>
        {labelAction}
      </div>
      <input
        id={inputId}
        className="h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-[15px] text-ink shadow-xs transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-muted/70 hover:border-line-strong focus:border-accent focus:ring-4 focus:ring-accent/12 disabled:cursor-not-allowed disabled:bg-paper disabled:opacity-70"
        {...props}
      />
    </div>
  )
}
