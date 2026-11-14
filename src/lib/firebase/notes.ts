import { FirebaseError } from 'firebase/app'
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import { db } from './firebase'

/** App-facing note. UI should never need Firestore document types. */
export type Note = {
  id: string
  title: string
  content: string
  updatedAt: string
}

function notesCollection(uid: string) {
  return collection(db, 'users', uid, 'notes')
}

function formatUpdatedAt(value: Timestamp) {
  return value.toDate().toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function toNote(id: string, data: Record<string, unknown>): Note {
  const updatedAt = data.updatedAt
  return {
    id,
    title: typeof data.title === 'string' ? data.title : '',
    content: typeof data.content === 'string' ? data.content : '',
    updatedAt:
      updatedAt instanceof Timestamp ? formatUpdatedAt(updatedAt) : 'Unknown',
  }
}

function getNotesErrorMessage(error: unknown, fallback: string) {
  if (error instanceof FirebaseError) {
    if (error.code === 'permission-denied') {
      return 'You do not have permission to access these notes.'
    }
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}

function subscribe(
  uid: string,
  onChange: (notes: Note[]) => void,
  onError?: (message: string) => void,
) {
  const notesQuery = query(notesCollection(uid), orderBy('updatedAt', 'desc'))

  return onSnapshot(
    notesQuery,
    (snapshot) => {
      onChange(snapshot.docs.map((noteDoc) => toNote(noteDoc.id, noteDoc.data())))
    },
    (error) => {
      onError?.(getNotesErrorMessage(error, 'Could not load notes.'))
    },
  )
}

async function create(uid: string, title: string, content: string) {
  const trimmedTitle = title.trim()
  if (!trimmedTitle) {
    throw new Error('Title is required.')
  }
  if (trimmedTitle.length > 200) {
    throw new Error('Title must be 200 characters or fewer.')
  }
  if (content.length > 50000) {
    throw new Error('Content must be 50,000 characters or fewer.')
  }

  const now = Timestamp.now()
  try {
    await addDoc(notesCollection(uid), {
      title: trimmedTitle,
      content,
      createdAt: now,
      updatedAt: now,
    })
  } catch (error) {
    throw new Error(getNotesErrorMessage(error, 'Could not create note.'))
  }
}

async function remove(uid: string, noteId: string) {
  try {
    await deleteDoc(doc(db, 'users', uid, 'notes', noteId))
  } catch (error) {
    throw new Error(getNotesErrorMessage(error, 'Could not delete note.'))
  }
}

export const notes = {
  subscribe,
  create,
  remove,
}
