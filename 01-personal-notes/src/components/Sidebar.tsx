import { Button } from '@heroui/react'

export type Tab = 'profile' | 'notes'

type SidebarProps = {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  email: string
  onLogout: () => void | Promise<void>
}

export function Sidebar({
  activeTab,
  onTabChange,
  email,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="flex flex-col gap-6 border-b border-line bg-elevated/90 px-4 py-6 min-[841px]:border-r min-[841px]:border-b-0">
      <div className="flex items-center gap-3 px-1.5">
        <span className="grid size-10 place-items-center rounded-xl bg-accent font-display text-lg font-semibold text-accent-foreground">
          N
        </span>
        <p className="font-bold text-ink">Personal Notes</p>
      </div>

      <nav className="grid grid-cols-2 gap-1.5 min-[841px]:grid-cols-1" aria-label="Main">
        <Button
          fullWidth
          variant={activeTab === 'notes' ? 'primary' : 'ghost'}
          className="justify-start"
          onPress={() => onTabChange('notes')}
        >
          My Notes
        </Button>
        <Button
          fullWidth
          variant={activeTab === 'profile' ? 'primary' : 'ghost'}
          className="justify-start"
          onPress={() => onTabChange('profile')}
        >
          Profile
        </Button>
      </nav>

      <div className="mt-auto grid gap-3 px-1.5">
        <p className="truncate text-sm text-muted" title={email}>
          {email}
        </p>
        <Button variant="outline" fullWidth onPress={() => onLogout()}>
          Log out
        </Button>
      </div>
    </aside>
  )
}
