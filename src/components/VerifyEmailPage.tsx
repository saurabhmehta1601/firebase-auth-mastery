import { useEffect, useState } from 'react'
import { auth } from '../lib/firebase/auth'
import { AuthShell, Button, StatusIcon } from './ui'

type Status = 'verifying' | 'success' | 'error'

type VerifyEmailPageProps = {
  oobCode: string
}

export function VerifyEmailPage({ oobCode }: VerifyEmailPageProps) {
  const [status, setStatus] = useState<Status>('verifying')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function verify() {
      try {
        await auth.applyEmailVerification(oobCode)
        if (!cancelled) {
          setStatus('success')
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error')
          setError(
            err instanceof Error
              ? err.message
              : 'This verification link is invalid or has expired.',
          )
        }
      }
    }

    void verify()

    return () => {
      cancelled = true
    }
  }, [oobCode])

  function continueToApp() {
    window.history.replaceState({}, '', '/')
    window.location.assign('/')
  }

  return (
    <AuthShell>
      <div className="grid justify-items-center gap-5 py-2 text-center">
        {status === 'verifying' ? (
          <>
            <StatusIcon tone="loading" />
            <div className="grid gap-2">
              <h1 className="text-[28px] leading-tight">Verifying your email</h1>
              <p className="text-sm leading-6 text-ink-soft">
                Hang tight — we are confirming your address.
              </p>
            </div>
          </>
        ) : null}

        {status === 'success' ? (
          <>
            <StatusIcon tone="success" />
            <div className="grid gap-2">
              <h1 className="text-[28px] leading-tight">Email verified</h1>
              <p className="text-sm leading-6 text-ink-soft">
                Your address is confirmed. You can continue into your notes.
              </p>
            </div>
          </>
        ) : null}

        {status === 'error' ? (
          <>
            <StatusIcon tone="danger" />
            <div className="grid gap-2">
              <h1 className="text-[28px] leading-tight">Couldn’t verify email</h1>
              <p className="text-sm leading-6 text-ink-soft">
                {error ||
                  'This link is invalid or expired. Request a new verification email from your profile.'}
              </p>
            </div>
          </>
        ) : null}

        {status !== 'verifying' ? (
          <Button size="lg" fullWidth className="mt-2" onClick={continueToApp}>
            {status === 'success' ? 'Continue to app' : 'Back to app'}
          </Button>
        ) : null}
      </div>
    </AuthShell>
  )
}
