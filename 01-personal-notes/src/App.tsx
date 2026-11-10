import { useState } from 'react'
import { NotesPanel } from './components/NotesPanel'
import { ProfilePanel } from './components/ProfilePanel'
import { Sidebar, type Tab } from './components/Sidebar'
import { dummyNotes, dummyProfile } from './data/dummy'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('notes')

  return (
    <div className="app-shell">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        email={dummyProfile.email}
      />

      <main className="main-panel">
        {activeTab === 'notes' ? (
          <NotesPanel notes={dummyNotes} />
        ) : (
          <ProfilePanel profile={dummyProfile} />
        )}
      </main>
    </div>
  )
}
