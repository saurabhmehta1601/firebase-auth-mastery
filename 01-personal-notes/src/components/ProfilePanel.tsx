import { useState } from 'react'
import type { User } from 'firebase/auth'
import { Alert, Button, Card, Chip } from '@heroui/react'
import { useAuth } from '../context/AuthContext'

type ProfilePanelProps = {
  user: User
}

export function ProfilePanel({ user }: ProfilePanelProps) {
  const { sendVerificationEmail } = useAuth()
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const createdAt = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleString()
    : 'Unknown'
  const lastSignIn = user.metadata.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleString()
    : 'Unknown'

  async function handleSendVerification() {
    setMessage('')
    setError('')
    setSending(true)

    try {
      await sendVerificationEmail()
      setMessage('Verification email sent. Check your inbox.')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not send verification email.',
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="grid w-full max-w-3xl gap-5">
      <header>
        <h1 className="text-3xl sm:text-4xl">Profile</h1>
        <p className="mt-1 text-sm text-muted">
          Your Firebase Auth user information.
        </p>
      </header>

      {error ? (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}
      {message ? (
        <Alert status="success">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{message}</Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}

      <Card>
        <Card.Content>
          <dl className="grid gap-4">
            <div>
              <dt className="text-xs font-bold tracking-wide text-muted uppercase">
                Email
              </dt>
              <dd className="mt-1 text-foreground">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold tracking-wide text-muted uppercase">
                User ID
              </dt>
              <dd className="mt-1 font-mono text-sm break-all text-foreground">{user.uid}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold tracking-wide text-muted uppercase">
                Email verified
              </dt>
              <dd className="mt-1 flex flex-wrap items-center gap-3">
                <Chip
                  color={user.emailVerified ? 'success' : 'warning'}
                  size="sm"
                  variant="soft"
                >
                  {user.emailVerified ? 'Verified' : 'Not verified'}
                </Chip>
                {!user.emailVerified ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    isDisabled={sending}
                    onPress={handleSendVerification}
                  >
                    {sending ? 'Sending…' : 'Send Verification Email'}
                  </Button>
                ) : null}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold tracking-wide text-muted uppercase">
                Account created
              </dt>
              <dd className="mt-1 text-foreground">{createdAt}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold tracking-wide text-muted uppercase">
                Last sign-in
              </dt>
              <dd className="mt-1 text-foreground">{lastSignIn}</dd>
            </div>
          </dl>
        </Card.Content>
      </Card>
    </div>
  )
}
