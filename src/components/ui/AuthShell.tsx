import type { ReactNode } from 'react'
import { BrandMark } from './BrandMark'
import { Card } from './Card'

type AuthShellProps = {
  children: ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative grid min-h-svh place-items-center overflow-hidden px-5 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 50% 35% at 50% 0%, rgb(30 107 84 / 0.12), transparent 70%)',
        }}
      />
      <div className="relative w-full max-w-[420px] animate-rise">
        <div className="mb-8 flex justify-center">
          <BrandMark />
        </div>
        <Card className="p-7 shadow-elevated sm:p-9">{children}</Card>
      </div>
    </div>
  )
}
