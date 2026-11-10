export type Tab = 'profile' | 'notes'

type SidebarProps = {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  email: string
}

export function Sidebar({ activeTab, onTabChange, email }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">N</span>
        <div>
          <p className="brand-name">Personal Notes</p>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Main">
        <button
          type="button"
          className={activeTab === 'notes' ? 'nav-link active' : 'nav-link'}
          onClick={() => onTabChange('notes')}
        >
          My Notes
        </button>
        <button
          type="button"
          className={activeTab === 'profile' ? 'nav-link active' : 'nav-link'}
          onClick={() => onTabChange('profile')}
        >
          Profile
        </button>
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-email" title={email}>
          {email}
        </p>
      </div>
    </aside>
  )
}
