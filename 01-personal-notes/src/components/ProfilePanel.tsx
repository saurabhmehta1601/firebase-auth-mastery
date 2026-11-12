import { useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { useAuth } from '../context/AuthContext'
import { Alert, Badge, Button, Card, PageHeader } from './ui'

type ProfilePanelProps = {
  user: User
}

function ProfileRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5 px-6 py-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-6">
      <dt className="text-[13px] font-semibold text-muted">{label}</dt>
      <dd className="text-[15px] text-ink">{children}</dd>
    </div>
  )
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
    <div className="grid w-full max-w-3xl animate-rise gap-8">
      <PageHeader title="Profile" description="Your Firebase Auth user information." />

      {error || message ? (
        <div className="grid gap-3">
          {error ? <Alert status="danger">{error}</Alert> : null}
          {message ? <Alert status="success">{message}</Alert> : null}
        </div>
      ) : null}

      <Card>
        <dl className="divide-y divide-line">
          <ProfileRow label="Email">{user.email}</ProfileRow>
          <ProfileRow label="User ID">
            <span className="font-mono text-[13px] break-all text-ink-soft">{user.uid}</span>
          </ProfileRow>
          <ProfileRow label="Email verified">
            <span className="flex flex-wrap items-center gap-3">
              <Badge tone={user.emailVerified ? 'success' : 'warning'}>
                {user.emailVerified ? 'Verified' : 'Not verified'}
              </Badge>
              {!user.emailVerified ? (
                <Button
                  variant="secondary"
                  size="sm"
                  loading={sending}
                  disabled={sending}
                  onClick={handleSendVerification}
                >
                  {sending ? 'Sending…' : 'Send Verification Email'}
                </Button>
              ) : null}
            </span>
          </ProfileRow>
          <ProfileRow label="Account created">{createdAt}</ProfileRow>
          <ProfileRow label="Last sign-in">{lastSignIn}</ProfileRow>
        </dl>
      </Card>
    </div>
  )
}
