import { useEffect, useId, useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { auth } from '../lib/firebase/auth'
import { notes, type Note } from '../lib/firebase/notes'
import { Alert, Button, Card, NotesIcon, PageHeader, Spinner, TextField } from './ui'

export function NotesPanel() {
  const { user } = useAuth()
  const contentId = useId()
  const [noteList, setNoteList] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)
  const [sending, setSending] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const showVerifyAlert =
    !!user && user.hasPasswordProvider && !user.emailVerified && !dismissed

  useEffect(() => {
    if (!user) {
      setNoteList([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    return notes.subscribe(
      user.uid,
      (nextNotes) => {
        setNoteList(nextNotes)
        setLoading(false)
      },
      (message) => {
        setError(message)
        setLoading(false)
      },
    )
  }, [user])

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

  async function handleCreateNote(event: FormEvent) {
    event.preventDefault()
    if (!user) return

    setMessage('')
    setError('')
    setCreating(true)

    try {
      await notes.create(user.uid, title, content)
      setTitle('')
      setContent('')
      setMessage('Note saved.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create note.')
    } finally {
      setCreating(false)
    }
  }

  async function handleDeleteNote(noteId: string) {
    if (!user) return

    setMessage('')
    setError('')
    setDeletingId(noteId)

    try {
      await notes.remove(user.uid, noteId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete note.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="grid w-full max-w-3xl animate-rise gap-8">
      <PageHeader
        title="My Notes"
        description="Notes stored in Firestore for your account only."
      />

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

      <form
        onSubmit={handleCreateNote}
        className="grid gap-4 rounded-2xl border border-line bg-surface p-5 shadow-xs"
      >
        <TextField
          label="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Note title"
          maxLength={200}
          required
          disabled={creating}
        />
        <div className="grid gap-2">
          <label htmlFor={contentId} className="text-[13px] font-semibold text-ink">
            Content
          </label>
          <textarea
            id={contentId}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write your note…"
            rows={4}
            maxLength={50000}
            disabled={creating}
            className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-[15px] text-ink shadow-xs transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-muted/70 hover:border-line-strong focus:border-accent focus:ring-4 focus:ring-accent/12 disabled:cursor-not-allowed disabled:bg-paper disabled:opacity-70"
          />
        </div>
        <div>
          <Button type="submit" loading={creating} disabled={creating || !title.trim()}>
            {creating ? 'Saving…' : 'Add note'}
          </Button>
        </div>
      </form>

      <section className="grid gap-4 sm:grid-cols-2" aria-label="Your notes">
        {loading ? (
          <div className="grid justify-items-center gap-3 px-6 py-14 text-center sm:col-span-2">
            <Spinner size="lg" />
            <p className="text-sm font-medium text-ink-soft">Loading notes…</p>
          </div>
        ) : noteList.length === 0 ? (
          <div className="grid justify-items-center gap-3 rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center sm:col-span-2">
            <span className="grid size-11 place-items-center rounded-full bg-accent-soft text-accent">
              <NotesIcon className="size-5" />
            </span>
            <p className="text-sm font-medium text-ink-soft">No notes yet.</p>
          </div>
        ) : (
          noteList.map((note) => (
            <Card key={note.id} className="flex flex-col gap-3 p-6">
              <div className="grid gap-1">
                <h2 className="text-xl leading-snug">{note.title}</h2>
                <p className="text-xs font-medium text-muted">Updated {note.updatedAt}</p>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink-soft">
                {note.content}
              </p>
              <div className="mt-auto pt-1">
                <Button
                  variant="danger"
                  size="sm"
                  loading={deletingId === note.id}
                  disabled={deletingId === note.id}
                  onClick={() => handleDeleteNote(note.id)}
                >
                  {deletingId === note.id ? 'Deleting…' : 'Delete'}
                </Button>
              </div>
            </Card>
          ))
        )}
      </section>
    </div>
  )
}
