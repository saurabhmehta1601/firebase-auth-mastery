import type { ComponentType } from 'react'
import { BrandMark, Button, LogOutIcon, NotesIcon, UserIcon } from './ui'
import { cn, focusRing } from './ui/cn'

export type Tab = 'profile' | 'notes'

type SidebarProps = {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  email: string
  onLogout: () => void | Promise<void>
}

type NavItemProps = {
  label: string
  icon: ComponentType<{ className?: string }>
  active: boolean
  onSelect: () => void
}

function NavItem({ label, icon: Icon, active, onSelect }: NavItemProps) {
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      onClick={onSelect}
      className={cn(
        'group flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors',
        focusRing,
        active
          ? 'bg-accent-soft text-accent-strong'
          : 'text-ink-soft hover:bg-ink/[0.04] hover:text-ink',
      )}
    >
      <Icon
        className={cn(
          'size-[18px] transition-colors',
          active ? 'text-accent' : 'text-muted group-hover:text-ink-soft',
        )}
      />
      {label}
    </button>
  )
}

export function Sidebar({
  activeTab,
  onTabChange,
  email,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="flex flex-col gap-6 border-b border-line bg-surface/70 px-4 py-5 backdrop-blur-xl min-[841px]:sticky min-[841px]:top-0 min-[841px]:h-svh min-[841px]:gap-8 min-[841px]:border-r min-[841px]:border-b-0 min-[841px]:py-6">
      <div className="px-2">
        <BrandMark />
      </div>

      <nav className="grid grid-cols-2 gap-1 min-[841px]:grid-cols-1" aria-label="Main">
        <NavItem
          label="My Notes"
          icon={NotesIcon}
          active={activeTab === 'notes'}
          onSelect={() => onTabChange('notes')}
        />
        <NavItem
          label="Profile"
          icon={UserIcon}
          active={activeTab === 'profile'}
          onSelect={() => onTabChange('profile')}
        />
      </nav>

      <div className="mt-auto flex items-center gap-3 rounded-xl border border-line bg-surface p-2.5 shadow-xs">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-bold text-accent-strong uppercase">
          {email.charAt(0)}
        </span>
        <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink" title={email}>
          {email}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="size-8 px-0"
          aria-label="Log out"
          title="Log out"
          onClick={() => onLogout()}
        >
          <LogOutIcon />
        </Button>
      </div>
    </aside>
  )
}
