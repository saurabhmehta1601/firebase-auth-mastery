import { useEffect, useState, type FormEvent } from 'react'
import { FirebaseError } from 'firebase/app'
import {
  confirmPasswordReset,
  verifyPasswordResetCode,
} from 'firebase/auth'
import { auth } from '../firebase'
import { Alert, AuthShell, Button, StatusIcon, TextField } from './ui'

type Status = 'checking' | 'ready' | 'submitting' | 'success' | 'error'

type ResetPasswordPageProps = {
  oobCode: string
}

function getResetErrorMessage(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return 'Something went wrong. Please try again.'
  }

  switch (error.code) {
    case 'auth/expired-action-code':
      return 'This reset link has expired. Request a new one from the sign-in page.'
    case 'auth/invalid-action-code':
      return 'This reset link is invalid or has already been used.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.'
    case 'auth/password-does-not-meet-requirements': {
      const match = error.message.match(/\[([^\]]+)\]/)
      if (!match) {
        return 'Password does not meet the requirements.'
      }
      const requirements = match[1]
        .split(',')
        .map((requirement) => requirement.trim().replace(/^Password\s+/i, ''))
        .filter(Boolean)
      if (requirements.length === 0) {
        return 'Password does not meet the requirements.'
      }
      return `Password does not meet requirements:\n${requirements
        .map((requirement) => `• ${requirement}`)
        .join('\n')}`
    }
    default:
      return error.message
  }
}

export function ResetPasswordPage({ oobCode }: ResetPasswordPageProps) {
  const [status, setStatus] = useState<Status>('checking')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function verifyCode() {
      try {
        const accountEmail = await verifyPasswordResetCode(auth, oobCode)
        if (!cancelled) {
          setEmail(accountEmail)
          setStatus('ready')
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error')
          setError(getResetErrorMessage(err))
        }
      }
    }

    void verifyCode()

    return () => {
      cancelled = true
    }
  }, [oobCode])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setStatus('submitting')

    try {
      await confirmPasswordReset(auth, oobCode, password)
      setStatus('success')
    } catch (err) {
      setStatus('ready')
      setError(getResetErrorMessage(err))
    }
  }

  function continueToSignIn() {
    window.history.replaceState({}, '', '/')
    window.location.assign('/')
  }

  if (status === 'ready' || status === 'submitting') {
    return (
      <AuthShell>
        <div className="grid gap-2 text-center">
          <h1 className="text-[28px] leading-tight">Choose a new password</h1>
          <p className="text-sm leading-6 text-ink-soft">
            {email
              ? `Create a new password for ${email}.`
              : 'Create a new password for your account.'}
          </p>
        </div>

        <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
          {error ? (
            <Alert status="danger">
              <span className="whitespace-pre-line">{error}</span>
            </Alert>
          ) : null}

          <TextField
            label="New password"
            required
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            placeholder="At least 6 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={status === 'submitting'}
          />

          <TextField
            label="Confirm password"
            required
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={6}
            placeholder="Repeat your new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={status === 'submitting'}
          />

          <Button
            type="submit"
            size="lg"
            fullWidth
            className="mt-1"
            loading={status === 'submitting'}
            disabled={status === 'submitting'}
          >
            {status === 'submitting' ? 'Saving…' : 'Save new password'}
          </Button>
        </form>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <div className="grid justify-items-center gap-5 py-2 text-center">
        {status === 'checking' ? (
          <>
            <StatusIcon tone="loading" />
            <div className="grid gap-2">
              <h1 className="text-[28px] leading-tight">Checking your link</h1>
              <p className="text-sm leading-6 text-ink-soft">
                One moment while we confirm this reset request.
              </p>
            </div>
          </>
        ) : null}

        {status === 'success' ? (
          <>
            <StatusIcon tone="success" />
            <div className="grid gap-2">
              <h1 className="text-[28px] leading-tight">Password updated</h1>
              <p className="text-sm leading-6 text-ink-soft">
                Your new password is ready. Sign in to get back to your notes.
              </p>
            </div>
          </>
        ) : null}

        {status === 'error' ? (
          <>
            <StatusIcon tone="danger" />
            <div className="grid gap-2">
              <h1 className="text-[28px] leading-tight">Link unavailable</h1>
              <p className="text-sm leading-6 text-ink-soft">
                {error || 'Request a fresh password reset email from the sign-in page.'}
              </p>
            </div>
          </>
        ) : null}

        {status === 'success' || status === 'error' ? (
          <Button size="lg" fullWidth className="mt-2" onClick={continueToSignIn}>
            {status === 'success' ? 'Continue to sign in' : 'Back to sign in'}
          </Button>
        ) : null}
      </div>
    </AuthShell>
  )
}
