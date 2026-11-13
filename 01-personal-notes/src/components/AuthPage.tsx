import { useState, type FormEvent } from 'react'
import type { MultiFactorResolver } from 'firebase/auth'
import { auth } from '../lib/firebase/auth'
import { findTotpFactor, getSignInErrorMessage, isMultiFactorError } from '../lib/firebase/utils'
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
  const [mfaResolver, setMfaResolver] = useState<MultiFactorResolver | null>(null)
  const [mfaCode, setMfaCode] = useState('')

  function beginMfa(err: unknown) {
    if (!isMultiFactorError(err)) {
      return false
    }

    setMfaResolver(auth.resolverFromError(err))
    setMfaCode('')
    setError('')
    setSuccess('')
    return true
  }

  function cancelMfa() {
    setMfaResolver(null)
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
        setError(getSignInErrorMessage(err))
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
        setError(getSignInErrorMessage(err))
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
        setError(getSignInErrorMessage(err))
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleMfaSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!mfaResolver) return

    const hint = findTotpFactor(mfaResolver.hints)
    if (!hint) return

    setError('')
    setSubmitting(true)

    try {
      await auth.resolveTotpSignIn(mfaResolver, mfaCode.trim())
    } catch (err) {
      setError(getSignInErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (mfaResolver) {
    const totpHint = findTotpFactor(mfaResolver.hints)

    return (
      <AuthShell>
        <div className="grid gap-2 text-center">
          <h1 className="text-[28px] leading-tight">Authenticator code</h1>
          <p className="text-sm leading-6 text-ink-soft">
            Enter the code from {totpHint?.displayName || 'your authenticator app'}.
          </p>
        </div>

        <form className="mt-8 grid gap-5" onSubmit={handleMfaSubmit}>
          {error ? <Alert status="danger">{error}</Alert> : null}

          {totpHint ? (
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
