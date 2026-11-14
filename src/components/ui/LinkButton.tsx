import type { ButtonHTMLAttributes } from 'react'
import { cn, focusRing } from './cn'

type LinkButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export function LinkButton({ type = 'button', className, ...props }: LinkButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-accent underline-offset-4 transition-colors hover:text-accent-strong hover:underline disabled:pointer-events-none disabled:opacity-55',
        focusRing,
        className,
      )}
      {...props}
    />
  )
}
