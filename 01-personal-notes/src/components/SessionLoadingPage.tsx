import { Spinner } from '@heroui/react'

export function SessionLoadingPage() {
  return (
    <div className="grid min-h-svh place-items-center p-6" role="status" aria-label="Loading">
      <Spinner size="lg" color="accent" />
    </div>
  )
}
