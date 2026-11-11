import { useState } from 'react'
import type { User } from 'firebase/auth'
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
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Profile</h1>
          <p className="muted">Your Firebase Auth user information.</p>
        </div>
      </header>

      {error ? <p className="form-error">{error}</p> : null}
      {message ? <p className="form-success">{message}</p> : null}

      <section className="profile-card">
        <dl className="profile-grid">
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>User ID</dt>
            <dd className="mono">{user.uid}</dd>
          </div>
          <div>
            <dt>Email verified</dt>
            <dd className="verified-row">
              <span>{user.emailVerified ? 'Verified' : 'Not verified'}</span>
              {!user.emailVerified ? (
                <button
                  type="button"
                  className="link-button"
                  onClick={handleSendVerification}
                  disabled={sending}
                >
                  {sending ? 'Sending…' : 'Send Verification Email'}
                </button>
              ) : null}
            </dd>
          </div>
          <div>
            <dt>Account created</dt>
            <dd>{createdAt}</dd>
          </div>
          <div>
            <dt>Last sign-in</dt>
            <dd>{lastSignIn}</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
