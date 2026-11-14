import { useState } from 'react'
import type { Note } from '../data/dummy'
import { useAuth } from '../context/AuthContext'
import { auth } from '../lib/firebase/auth'
import { isEmailPasswordUser } from '../lib/firebase/utils'
import { Alert, Button, Card, NotesIcon, PageHeader } from './ui'

type NotesPanelProps = {
  notes: Note[]
}

export function NotesPanel({ notes }: NotesPanelProps) {
  const { user } = useAuth()
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
      await auth.sendVerificationEmail()
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
      <PageHeader title="My Notes" description="Dummy notes belonging to the current user." />

      {showVerifyAlert || error || message ? (
        <div className="grid gap-3">
          {showVerifyAlert ? (
            <Alert
              status="warning"
              title="Verify your email"
              dismissLabel="Dismiss email verification alert"
              onDismiss={() => setDismissed(true)}
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  loading={sending}
                  disabled={sending}
                  onClick={handleVerifyNow}
                >
                  {sending ? 'Sending…' : 'Send verification email'}
                </Button>
              }
            >
              You still haven&apos;t verified your email.
            </Alert>
          ) : null}
          {error ? <Alert status="danger">{error}</Alert> : null}
          {message ? <Alert status="success">{message}</Alert> : null}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2" aria-label="Your notes">
        {notes.length === 0 ? (
          <div className="grid justify-items-center gap-3 rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center sm:col-span-2">
            <span className="grid size-11 place-items-center rounded-full bg-accent-soft text-accent">
              <NotesIcon className="size-5" />
            </span>
            <p className="text-sm font-medium text-ink-soft">No notes yet.</p>
          </div>
        ) : (
          notes.map((note) => (
            <Card key={note.id} className="flex flex-col gap-3 p-6">
              <div className="grid gap-1">
                <h2 className="text-xl leading-snug">{note.title}</h2>
                <p className="text-xs font-medium text-muted">Updated {note.updatedAt}</p>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink-soft">
                {note.content}
              </p>
            </Card>
          ))
        )}
      </section>
    </div>
  )
}
