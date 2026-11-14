export type Note = {
  id: string
  title: string
  content: string
  updatedAt: string
}

export const dummyNotes: Note[] = [
  {
    id: '1',
    title: 'Weekly planning',
    content:
      'Ship the notes UI first. Wire up Firebase Auth next. Keep the sidebar simple until routes are protected.',
    updatedAt: 'Nov 10, 2026 · 9:10 AM',
  },
  {
    id: '2',
    title: 'Grocery list',
    content: 'Oat milk, sourdough, spinach, coffee beans, lemons.',
    updatedAt: 'Nov 9, 2026 · 6:42 PM',
  },
  {
    id: '3',
    title: 'App ideas',
    content:
      'AI Notetaker with per-user ownership. Later: shared notebooks and tags.',
    updatedAt: 'Nov 8, 2026 · 11:05 AM',
  },
]
