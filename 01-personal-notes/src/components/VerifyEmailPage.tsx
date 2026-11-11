import { useEffect, useState } from 'react'
import { Alert, Button, Card, Spinner } from '@heroui/react'
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
    <div className="grid min-h-svh place-items-center p-6">
      <Card className="w-full max-w-[420px]">
        <Card.Header className="items-center">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-accent font-display text-lg font-semibold text-accent-foreground">
              N
            </span>
            <p className="font-bold text-foreground">Personal Notes</p>
          </div>
        </Card.Header>

        <Card.Content className="items-center gap-4 text-center">
          {status === 'verifying' ? (
            <>
              <Spinner size="lg" color="accent" />
              <h1 className="text-3xl">Verifying your email</h1>
              <p className="text-sm leading-6 text-muted">
                Hang tight — we are confirming your address.
              </p>
            </>
          ) : null}

          {status === 'success' ? (
            <Alert status="success">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Email verified</Alert.Title>
                <Alert.Description>
                  Your address is confirmed. You can continue into your notes.
                </Alert.Description>
              </Alert.Content>
            </Alert>
          ) : null}

          {status === 'error' ? (
            <Alert status="danger">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Couldn’t verify email</Alert.Title>
                <Alert.Description>
                  {error ||
                    'This link is invalid or expired. Request a new verification email from your profile.'}
                </Alert.Description>
              </Alert.Content>
            </Alert>
          ) : null}
        </Card.Content>

        {status !== 'verifying' ? (
          <Card.Footer>
            <Button fullWidth onPress={continueToApp}>
              {status === 'success' ? 'Continue to app' : 'Back to app'}
            </Button>
          </Card.Footer>
        ) : null}
      </Card>
    </div>
  )
}
