import { useState } from 'react'
import { AuthPage } from './components/AuthPage'
import { NotesPanel } from './components/NotesPanel'
import { ProfilePanel } from './components/ProfilePanel'
import { SessionLoadingPage } from './components/SessionLoadingPage'
import { Sidebar, type Tab } from './components/Sidebar'
import { ResetPasswordPage } from './components/ResetPasswordPage'
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

  if (mode === 'resetPassword' && oobCode) {
    return <ResetPasswordPage oobCode={oobCode} />
  }

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
    <div className="grid min-h-svh min-[841px]:grid-cols-[260px_minmax(0,1fr)]">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        email={user.email ?? 'Signed in'}
        onLogout={logout}
      />

      <main className="min-w-0 px-5 py-8 sm:px-10 sm:py-12 lg:px-14">
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
