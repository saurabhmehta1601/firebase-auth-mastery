import { useEffect, useState, type FormEvent } from 'react'
import {
  Alert,
  Button,
  Card,
  Input,
  Label,
  Spinner,
  TextField,
} from '@heroui/react'
import { FirebaseError } from 'firebase/app'
import {
  confirmPasswordReset,
  verifyPasswordResetCode,
} from 'firebase/auth'
import { auth } from '../firebase'

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

  return (
    <div className="relative grid min-h-svh place-items-center overflow-hidden p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 60% 40% at 50% -10%, rgb(120 160 140 / 0.28), transparent), radial-gradient(circle at 85% 80%, rgb(180 200 188 / 0.35), transparent 42%)',
        }}
      />

      <Card className="relative w-full max-w-[420px] animate-[rise_0.45s_ease_both] shadow-[var(--shadow-card)]">
        <Card.Header className="gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-accent font-display text-lg font-semibold text-accent-foreground">
              N
            </span>
            <p className="font-bold text-foreground">Personal Notes</p>
          </div>

          {status === 'checking' ? (
            <div className="grid justify-items-center gap-3 py-6 text-center">
              <Spinner size="lg" color="accent" />
              <h1 className="text-3xl">Checking your link</h1>
              <p className="text-sm leading-6 text-muted">
                One moment while we confirm this reset request.
              </p>
            </div>
          ) : null}

          {status === 'success' ? (
            <div className="grid gap-2">
              <h1 className="text-3xl">Password updated</h1>
              <Card.Description>
                Your new password is ready. Sign in to get back to your notes.
              </Card.Description>
            </div>
          ) : null}

          {status === 'error' && !email ? (
            <div className="grid gap-2">
              <h1 className="text-3xl">Link unavailable</h1>
              <Card.Description>
                This password reset link can’t be used anymore.
              </Card.Description>
            </div>
          ) : null}

          {status === 'ready' || status === 'submitting' ? (
            <div className="grid gap-2">
              <h1 className="text-3xl">Choose a new password</h1>
              <Card.Description>
                {email
                  ? `Create a new password for ${email}.`
                  : 'Create a new password for your account.'}
              </Card.Description>
            </div>
          ) : null}
        </Card.Header>

        {status === 'ready' || status === 'submitting' ? (
          <form className="contents" onSubmit={handleSubmit}>
            <Card.Content>
              <div className="grid gap-4">
                {error ? (
                  <Alert status="danger">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Description className="whitespace-pre-line">
                        {error}
                      </Alert.Description>
                    </Alert.Content>
                  </Alert>
                ) : null}

                <TextField
                  isRequired
                  fullWidth
                  variant="secondary"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  value={password}
                  onChange={setPassword}
                  isDisabled={status === 'submitting'}
                >
                  <Label>New password</Label>
                  <Input />
                </TextField>

                <TextField
                  isRequired
                  fullWidth
                  variant="secondary"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  isDisabled={status === 'submitting'}
                >
                  <Label>Confirm password</Label>
                  <Input />
                </TextField>
              </div>
            </Card.Content>

            <Card.Footer className="flex-col gap-2">
              <Button
                type="submit"
                fullWidth
                isDisabled={status === 'submitting'}
              >
                {status === 'submitting' ? 'Saving…' : 'Save new password'}
              </Button>
            </Card.Footer>
          </form>
        ) : null}

        {status === 'success' ? (
          <Card.Content>
            <Alert status="success">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>All set</Alert.Title>
                <Alert.Description>
                  You can sign in with your new password whenever you’re ready.
                </Alert.Description>
              </Alert.Content>
            </Alert>
          </Card.Content>
        ) : null}

        {status === 'error' && !email ? (
          <Card.Content>
            <Alert status="danger">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Couldn’t open reset link</Alert.Title>
                <Alert.Description>
                  {error ||
                    'Request a fresh password reset email from the sign-in page.'}
                </Alert.Description>
              </Alert.Content>
            </Alert>
          </Card.Content>
        ) : null}

        {status === 'success' || (status === 'error' && !email) ? (
          <Card.Footer>
            <Button fullWidth onPress={continueToSignIn}>
              {status === 'success' ? 'Continue to sign in' : 'Back to sign in'}
            </Button>
          </Card.Footer>
        ) : null}
      </Card>
    </div>
  )
}
