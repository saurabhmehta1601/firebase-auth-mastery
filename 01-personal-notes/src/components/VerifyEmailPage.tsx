import { useEffect, useState } from 'react'
import { applyActionCode } from 'firebase/auth'
import { auth } from '../firebase'

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
        await applyActionCode(auth, oobCode)
        if (auth.currentUser) {
          await auth.currentUser.reload()
        }
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
    <div className="auth-page verify-page">
      <div className="auth-card verify-card" data-status={status}>
        <div className="verify-brand">
          <span className="brand-mark">N</span>
          <p className="brand-name">Personal Notes</p>
        </div>

        {status === 'verifying' ? (
          <>
            <div className="verify-icon verify-icon-pending" aria-hidden="true">
              <span className="verify-spinner" />
            </div>
            <h1>Verifying your email</h1>
            <p className="muted">
              Hang tight — we are confirming your address.
            </p>
          </>
        ) : null}

        {status === 'success' ? (
          <>
            <div className="verify-icon verify-icon-success" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1>Email verified</h1>
            <p className="muted">
              Your address is confirmed. You can continue into your notes.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={continueToApp}
            >
              Continue to app
            </button>
          </>
        ) : null}

        {status === 'error' ? (
          <>
            <div className="verify-icon verify-icon-error" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M7 7l10 10M17 7L7 17"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h1>Couldn’t verify email</h1>
            <p className="muted">
              {error ||
                'This link is invalid or expired. Request a new verification email from your profile.'}
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={continueToApp}
            >
              Back to app
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}
