import { useState } from 'react'
import { AuthPage } from './components/AuthPage'
import { NotesPanel } from './components/NotesPanel'
import { ProfilePanel } from './components/ProfilePanel'
import { SessionLoadingPage } from './components/SessionLoadingPage'
import { Sidebar, type Tab } from './components/Sidebar'
import { VerifyEmailPage } from './components/VerifyEmailPage'
import { AuthProvider, useAuth } from './context/AuthContext'
import { dummyNotes } from './data/dummy'

function getEmailActionParams() {
  const params = new URLSearchParams(window.location.search)
  return {
    mode: params.get('mode'),
    oobCode: params.get('oobCode'),
  }
}

function AppShell() {
  const { user, loading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('notes')
  const { mode, oobCode } = getEmailActionParams()

  if (mode === 'verifyEmail' && oobCode) {
    return <VerifyEmailPage oobCode={oobCode} />
  }

  if (loading) {
    return <SessionLoadingPage />
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <div className="app-shell">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        email={user.email ?? 'Signed in'}
        onLogout={logout}
      />

      <main className="main-panel">
        {activeTab === 'notes' ? (
          <NotesPanel notes={dummyNotes} />
        ) : (
          <ProfilePanel user={user} />
        )}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}
