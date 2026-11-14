import { useEffect, useState, type FormEvent } from 'react'
import { auth } from '../lib/firebase/auth'
import { Alert, AuthShell, Button, StatusIcon, TextField } from './ui'

type Status = 'checking' | 'ready' | 'submitting' | 'success' | 'error'

type ResetPasswordPageProps = {
  oobCode: string
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
        const accountEmail = await auth.checkPasswordResetCode(oobCode)
        if (!cancelled) {
          setEmail(accountEmail)
          setStatus('ready')
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error')
          setError(auth.getPasswordResetErrorMessage(err))
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
      await auth.completePasswordReset(oobCode, password)
      setStatus('success')
    } catch (err) {
      setStatus('ready')
      setError(auth.getPasswordResetErrorMessage(err))
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
