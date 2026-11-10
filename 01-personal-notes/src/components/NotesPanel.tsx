import type { Note } from '../data/dummy'

type NotesPanelProps = {
  notes: Note[]
}

export function NotesPanel({ notes }: NotesPanelProps) {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>My Notes</h1>
          <p className="muted">Dummy notes belonging to the current user.</p>
        </div>
      </header>

      <section className="notes-list" aria-label="Your notes">
        {notes.length === 0 ? (
          <p className="empty-state">No notes yet.</p>
        ) : (
          notes.map((note) => (
            <article key={note.id} className="note-card">
              <div className="note-card-header">
                <h2>{note.title}</h2>
              </div>
              <p className="note-content">{note.content}</p>
              <p className="note-meta">Updated {note.updatedAt}</p>
            </article>
          ))
        )}
      </section>
    </div>
  )
}
