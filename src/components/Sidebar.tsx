import { useEffect, useRef, useState } from 'react'
import {
  Building2,
  Check,
  ChevronsUpDown,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Avatar, LogoMark } from './Primitives'
import { cn } from '../lib/utils'

interface SidebarProps {
  workspace: string
  onWorkspaceChange: (workspace: string) => void
  contactCount: number
  onPlaceholder: (label: string) => void
}

const WORKSPACES = ['Alpha Workspace', 'Personal sandbox']

export function Sidebar({
  workspace,
  onWorkspaceChange,
  contactCount,
  onPlaceholder,
}: SidebarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  return (
    <aside
      aria-label="Primary"
      className="relative z-20 flex h-full w-58 shrink-0 flex-col border-r border-line bg-sidebar max-[73.75rem]:w-17"
    >
      <div className="flex h-13.5 shrink-0 items-center gap-2.5 px-4 max-[73.75rem]:justify-center max-[73.75rem]:px-0">
        <LogoMark />
        <span className="text-[0.90625rem] font-semibold tracking-[-0.015em] max-[73.75rem]:hidden">
          Alpha
        </span>
      </div>

      <div ref={menuRef} className="relative px-3 pb-4 max-[73.75rem]:px-3">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label={`Workspace: ${workspace}`}
          className={cn(
            'flex h-11.5 w-full items-center gap-2.5 rounded-lg border bg-white px-2.5 text-left transition',
            menuOpen
              ? 'border-line-strong shadow-[0_0_0_0.1875rem_rgba(86,87,199,0.08)]'
              : 'border-line shadow-[0_0.0625rem_0.0625rem_rgba(24,24,27,0.02)] hover:border-line-strong',
            'max-[73.75rem]:h-9 max-[73.75rem]:justify-center max-[73.75rem]:px-0',
          )}
        >
          <span className="grid size-6 shrink-0 place-items-center rounded-md bg-accent-soft text-[0.65625rem] font-semibold text-accent-ink">
            A
          </span>
          <span className="min-w-0 flex-1 max-[73.75rem]:hidden">
            <span className="block truncate text-[0.75rem] font-medium leading-4 text-ink">
              {workspace}
            </span>
            <span className="block truncate text-[0.625rem] leading-3.5 text-muted">
              Team workspace
            </span>
          </span>
          <ChevronsUpDown
            size={13}
            className="shrink-0 text-faint max-[73.75rem]:hidden"
            aria-hidden="true"
          />
        </button>

        {menuOpen && (
          <div
            role="menu"
            aria-label="Switch workspace"
            className="absolute left-3 top-[calc(100%-0.25rem)] z-50 w-54.5 animate-pop-in rounded-xl border border-line bg-white p-1.5 shadow-pop max-[73.75rem]:left-2"
          >
            <p className="px-2 pb-1.5 pt-1 text-[0.59375rem] font-medium uppercase tracking-[0.08em] text-faint">
              Workspaces
            </p>
            {WORKSPACES.map((name) => (
              <button
                key={name}
                type="button"
                role="menuitemradio"
                aria-checked={name === workspace}
                onClick={() => {
                  onWorkspaceChange(name)
                  setMenuOpen(false)
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[0.75rem] text-ink-soft transition hover:bg-[#F5F5F1] hover:text-ink"
              >
                <span className="grid size-5 place-items-center rounded-[0.3125rem] bg-accent-soft text-[0.53125rem] font-semibold text-accent-ink">
                  {name[0]}
                </span>
                <span className="flex-1 truncate">{name}</span>
                {name === workspace && <Check size={13} className="text-accent" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <nav aria-label="Workspace" className="px-2.5">
        <p className="mb-1.5 px-2 text-[0.59375rem] font-medium uppercase tracking-[0.1em] text-faint max-[73.75rem]:hidden">
          Workspace
        </p>
        <NavItem
          icon={Users}
          label="Contacts"
          active
          count={contactCount}
          onClick={() => undefined}
        />
        <NavItem
          icon={Building2}
          label="Companies"
          onClick={() => onPlaceholder('Companies')}
        />
      </nav>

      <div className="mt-auto px-2.5 pb-3">
        <NavItem
          icon={Settings}
          label="Settings"
          onClick={() => onPlaceholder('Settings')}
        />
        <div className="mx-2 my-2.5 h-px bg-line" />
        <button
          type="button"
          onClick={() => onPlaceholder('Profile')}
          aria-label="Open profile for Alex Morgan"
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition hover:bg-[#F0F0EB] max-[73.75rem]:justify-center max-[73.75rem]:px-0"
        >
          <Avatar name="Alex Morgan" size="md" />
          <span className="min-w-0 flex-1 max-[73.75rem]:hidden">
            <span className="block truncate text-[0.75rem] font-medium leading-4 text-ink">
              Alex Morgan
            </span>
            <span className="block truncate text-[0.625rem] leading-3.5 text-muted">
              alex@alpha.app
            </span>
          </span>
        </button>
      </div>
    </aside>
  )
}

interface NavItemProps {
  icon: LucideIcon
  label: string
  active?: boolean
  count?: number
  onClick: () => void
}

function NavItem({ icon: Icon, label, active = false, count, onClick }: NavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group mb-0.5 flex h-8 w-full items-center gap-2.5 rounded-md px-2 text-[0.78125rem] transition max-[73.75rem]:justify-center max-[73.75rem]:px-0',
        active
          ? 'bg-[#ECECE6] font-medium text-ink'
          : 'text-ink-soft hover:bg-[#F0F0EB] hover:text-ink',
      )}
    >
      <Icon
        size={15}
        strokeWidth={active ? 2 : 1.8}
        className={cn(
          'shrink-0',
          active ? 'text-accent' : 'text-muted group-hover:text-ink-soft',
        )}
        aria-hidden="true"
      />
      <span className="flex-1 text-left max-[73.75rem]:hidden">{label}</span>
      {count !== undefined && (
        <span className="rounded-full border border-line bg-white/80 px-1.5 py-px text-[0.59375rem] font-medium tabular text-muted max-[73.75rem]:hidden">
          {count}
        </span>
      )}
    </button>
  )
}
