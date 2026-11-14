import { useState, type FormEvent } from 'react'
import { auth } from '../lib/firebase/auth'
import {
  Alert,
  ArrowLeftIcon,
  AuthForm,
  AuthShell,
  Button,
  LinkButton,
  TextField,
  type AuthMode,
} from './ui'

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [mfaStep, setMfaStep] = useState(false)
  const [mfaCode, setMfaCode] = useState('')

  function beginMfa(err: unknown) {
    if (!auth.captureMfaChallenge(err)) {
      return false
    }

    setMfaStep(true)
    setMfaCode('')
    setError('')
    setSuccess('')
    return true
  }

  function cancelMfa() {
    auth.cancelMfaChallenge()
    setMfaStep(false)
    setMfaCode('')
    setError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      if (mode === 'forgot-password') {
        await auth.sendPasswordReset(email.trim())
        setSuccess(
          'If an account exists for that email, a password reset link has been sent.',
        )
      } else if (mode === 'login') {
        await auth.login(email.trim(), password)
      } else {
        await auth.register(email.trim(), password)
      }
    } catch (err) {
      if (!beginMfa(err)) {
        setError(auth.getSignInErrorMessage(err))
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogleAuth() {
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      await auth.loginWithGoogle()
    } catch (err) {
      if (!beginMfa(err)) {
        setError(auth.getSignInErrorMessage(err))
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGithubAuth() {
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      await auth.loginWithGithub()
    } catch (err) {
      if (!beginMfa(err)) {
        setError(auth.getSignInErrorMessage(err))
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleMfaSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!auth.hasTotpMfaChallenge()) return

    setError('')
    setSubmitting(true)

    try {
      await auth.completeMfaChallenge(mfaCode.trim())
      setMfaStep(false)
    } catch (err) {
      setError(auth.getSignInErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (mfaStep) {
    const totpReady = auth.hasTotpMfaChallenge()
    const hintLabel = auth.mfaChallengeLabel()

    return (
      <AuthShell>
        <div className="grid gap-2 text-center">
          <h1 className="text-[28px] leading-tight">Authenticator code</h1>
          <p className="text-sm leading-6 text-ink-soft">
            Enter the code from {hintLabel || 'your authenticator app'}.
          </p>
        </div>

        <form className="mt-8 grid gap-5" onSubmit={handleMfaSubmit}>
          {error ? <Alert status="danger">{error}</Alert> : null}

          {totpReady ? (
            <>
              <TextField
                label="Authenticator code"
                required
                name="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                minLength={6}
                maxLength={6}
                placeholder="123456"
                value={mfaCode}
                onChange={(event) =>
                  setMfaCode(event.target.value.replace(/\D/g, '').slice(0, 6))
                }
              />
              <Button
                type="submit"
                size="lg"
                fullWidth
                loading={submitting}
                disabled={submitting || mfaCode.length !== 6}
              >
                {submitting ? 'Verifying…' : 'Verify and sign in'}
              </Button>
            </>
          ) : (
            <Alert status="danger">
              This account uses a second factor this app cannot complete.
            </Alert>
          )}
        </form>

        <div className="mt-8 flex justify-center border-t border-line pt-6">
          <LinkButton onClick={cancelMfa}>
            <ArrowLeftIcon />
            Back to sign in
          </LinkButton>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthForm
      mode={mode}
      email={email}
      password={password}
      error={error}
      success={success}
      submitting={submitting}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      onGoogleAuth={handleGoogleAuth}
      onGithubAuth={handleGithubAuth}
      onModeChange={(nextMode) => {
        setMode(nextMode)
        setError('')
        setSuccess('')
      }}
    />
  )
}
