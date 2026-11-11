import { useState } from 'react'
import type { User } from 'firebase/auth'
import { Alert, Button, Card, CloseButton, EmptyState } from '@heroui/react'
import type { Note } from '../data/dummy'
import { useAuth } from '../context/AuthContext'

type NotesPanelProps = {
  notes: Note[]
}

function isEmailPasswordUser(user: User) {
  return user.providerData.some((provider) => provider.providerId === 'password')
}

export function NotesPanel({ notes }: NotesPanelProps) {
  const { user, sendVerificationEmail } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const showVerifyAlert =
    !!user && isEmailPasswordUser(user) && !user.emailVerified && !dismissed

  async function handleVerifyNow() {
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
      {showVerifyAlert ? (
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>
              You still haven&apos;t verified your email.
            </Alert.Description>
            <Button
              className="mt-2"
              size="sm"
              variant="tertiary"
              isDisabled={sending}
              onPress={handleVerifyNow}
            >
              {sending ? 'Sending…' : 'Click here to verify now.'}
            </Button>
          </Alert.Content>
          <CloseButton
            aria-label="Dismiss email verification alert"
            onPress={() => setDismissed(true)}
          />
        </Alert>
      ) : null}

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

      <header>
        <h1 className="text-3xl sm:text-4xl">My Notes</h1>
        <p className="mt-1 text-sm text-muted">
          Dummy notes belonging to the current user.
        </p>
      </header>

      <section className="grid gap-3" aria-label="Your notes">
        {notes.length === 0 ? (
          <EmptyState>No notes yet.</EmptyState>
        ) : (
          notes.map((note) => (
            <Card key={note.id}>
              <Card.Header>
                <Card.Title>{note.title}</Card.Title>
                <Card.Description>Updated {note.updatedAt}</Card.Description>
              </Card.Header>
              <Card.Content>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{note.content}</p>
              </Card.Content>
            </Card>
          ))
        )}
      </section>
    </div>
  )
}
