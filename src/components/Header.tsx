import { useEffect, useRef, useState, type RefObject } from 'react'
import {
  ArrowUpDown,
  Check,
  ChevronRight,
  Columns3,
  ListFilter,
  Plus,
  Search,
  Table2,
  X,
} from 'lucide-react'
import { STAGES, STAGE_META, type SortKey, type Stage, type View } from '../lib/types'
import { cn, contactCountLabel } from '../lib/utils'
import { Kbd } from './Primitives'

interface HeaderProps {
  workspace: string
  contactCount: number
  totalCount: number
  query: string
  onQueryChange: (query: string) => void
  searchRef: RefObject<HTMLInputElement | null>
  stageFilter: Stage[]
  onToggleStage: (stage: Stage) => void
  onClearFilter: () => void
  stageCounts: Record<Stage, number>
  sort: SortKey
  onSortChange: (sort: SortKey) => void
  view: View
  onViewChange: (view: View) => void
  onAddContact: () => void
}

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'added', label: 'Recently added' },
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'company', label: 'Company (A–Z)' },
  { value: 'stage', label: 'Stage' },
]

export function Header({
  workspace,
  contactCount,
  totalCount,
  query,
  onQueryChange,
  searchRef,
  stageFilter,
  onToggleStage,
  onClearFilter,
  stageCounts,
  sort,
  onSortChange,
  view,
  onViewChange,
  onAddContact,
}: HeaderProps) {
  const [openMenu, setOpenMenu] = useState<'filter' | 'sort' | null>(null)
  const menuAreaRef = useRef<HTMLDivElement>(null)
  const filterButtonRef = useRef<HTMLButtonElement>(null)
  const sortButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!openMenu) return
    const onPointerDown = (event: PointerEvent) => {
      if (!menuAreaRef.current?.contains(event.target as Node)) setOpenMenu(null)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenu(null)
        if (openMenu === 'filter') filterButtonRef.current?.focus()
        else sortButtonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [openMenu])

  return (
    <header className="shrink-0 border-b border-line/80 bg-canvas px-6 pb-4 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-[0.6875rem] font-medium text-muted"
          >
            <span className="max-w-40 truncate">{workspace}</span>
            <ChevronRight size={11} className="text-faint" aria-hidden="true" />
            <span className="text-ink-soft" aria-current="page">
              Contacts
            </span>
          </nav>
          <div className="mt-1.5 flex items-center gap-2.5">
            <h1 className="text-[1.625rem] font-semibold leading-none tracking-[-0.025em] text-ink">
              Contacts
            </h1>
            <span
              aria-live="polite"
              className="inline-flex h-5.25 items-center rounded-full border border-line bg-white px-2 text-[0.65625rem] font-medium tabular text-ink-soft shadow-[0_0.0625rem_0.0625rem_rgba(24,24,27,0.02)]"
            >
              {contactCountLabel(contactCount, totalCount)}
            </span>
          </div>
        </div>

        <div ref={menuAreaRef} className="relative flex flex-wrap items-center gap-2">
          <div className="group relative flex h-8 w-55 items-center rounded-lg border border-line bg-white shadow-[0_0.0625rem_0.0625rem_rgba(24,24,27,0.02)] transition focus-within:border-accent/45 focus-within:ring-3 focus-within:ring-accent/10 max-[73.75rem]:w-42.5">
            <Search
              size={14}
              className="pointer-events-none absolute left-2.5 text-faint"
              aria-hidden="true"
            />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search contacts…"
              aria-label="Search contacts"
              className="h-full w-full rounded-lg bg-transparent pl-8 pr-14 text-[0.75rem] text-ink outline-none placeholder:text-faint max-[73.75rem]:pr-8"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  onQueryChange('')
                  searchRef.current?.focus()
                }}
                aria-label="Clear search"
                className="absolute right-1.5 grid size-5 place-items-center rounded text-faint transition hover:bg-[#F1F1EC] hover:text-ink-soft"
              >
                <X size={12} />
              </button>
            ) : (
              <span className="pointer-events-none absolute right-1.5 max-[73.75rem]:hidden">
                <Kbd>⌘K</Kbd>
              </span>
            )}
          </div>

          <div className="relative">
            <button
              ref={filterButtonRef}
              type="button"
              onClick={() => setOpenMenu((menu) => (menu === 'filter' ? null : 'filter'))}
              aria-haspopup="dialog"
              aria-expanded={openMenu === 'filter'}
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[0.75rem] font-medium shadow-[0_0.0625rem_0.0625rem_rgba(24,24,27,0.02)] transition',
                stageFilter.length > 0
                  ? 'border-accent/25 bg-accent-soft text-accent-ink'
                  : 'border-line bg-white text-ink-soft hover:border-line-strong hover:text-ink',
              )}
            >
              <ListFilter
                size={13.5}
                className={stageFilter.length > 0 ? 'text-accent' : 'text-muted'}
                aria-hidden="true"
              />
              <span className="max-[73.75rem]:hidden">Filter</span>
              {stageFilter.length > 0 && (
                <span className="ml-0.5 rounded-full bg-accent/10 px-1.5 text-[0.59375rem] tabular text-accent-ink">
                  {stageFilter.length}
                </span>
              )}
            </button>

            {openMenu === 'filter' && (
              <div
                role="dialog"
                aria-label="Filter contacts by stage"
                className="absolute left-0 top-full z-50 mt-2 w-58 animate-pop-in rounded-xl border border-line bg-white p-1.5 shadow-pop"
              >
                <div className="flex items-center justify-between px-2 pb-1.5 pt-1">
                  <p className="text-[0.59375rem] font-medium uppercase tracking-[0.08em] text-faint">
                    Filter by stage
                  </p>
                  <button
                    type="button"
                    onClick={onClearFilter}
                    disabled={stageFilter.length === 0}
                    className="rounded px-1 text-[0.65625rem] font-medium text-muted transition hover:text-ink disabled:cursor-default disabled:opacity-40"
                  >
                    Clear
                  </button>
                </div>
                {STAGES.map((stage) => {
                  const checked = stageFilter.includes(stage)
                  return (
                    <button
                      key={stage}
                      type="button"
                      role="checkbox"
                      aria-checked={checked}
                      onClick={() => onToggleStage(stage)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.75 text-left text-[0.75rem] text-ink-soft transition hover:bg-[#F5F5F1] hover:text-ink"
                    >
                      <span
                        className={cn(
                          'grid size-3.5 shrink-0 place-items-center rounded-sm border transition',
                          checked
                            ? 'border-accent bg-accent text-white'
                            : 'border-line-strong bg-white text-transparent',
                        )}
                      >
                        <Check size={10} strokeWidth={2.6} />
                      </span>
                      <span className={cn('size-1.5 rounded-full', STAGE_META[stage].dot)} />
                      <span className="flex-1">{stage}</span>
                      <span className="text-[0.65625rem] tabular text-faint">
                        {stageCounts[stage]}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              ref={sortButtonRef}
              type="button"
              onClick={() => setOpenMenu((menu) => (menu === 'sort' ? null : 'sort'))}
              aria-haspopup="menu"
              aria-expanded={openMenu === 'sort'}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 text-[0.75rem] font-medium text-ink-soft shadow-[0_0.0625rem_0.0625rem_rgba(24,24,27,0.02)] transition hover:border-line-strong hover:text-ink"
            >
              <ArrowUpDown size={13} className="text-muted" aria-hidden="true" />
              <span className="max-[73.75rem]:hidden">Sort</span>
            </button>

            {openMenu === 'sort' && (
              <div
                role="menu"
                aria-label="Sort contacts"
                className="absolute right-0 top-full z-50 mt-2 w-49 animate-pop-in rounded-xl border border-line bg-white p-1.5 shadow-pop"
              >
                <p className="px-2 pb-1.5 pt-1 text-[0.59375rem] font-medium uppercase tracking-[0.08em] text-faint">
                  Sort by
                </p>
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={sort === option.value}
                    onClick={() => {
                      onSortChange(option.value)
                      setOpenMenu(null)
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.75 text-left text-[0.75rem] text-ink-soft transition hover:bg-[#F5F5F1] hover:text-ink"
                  >
                    <span className="flex-1">{option.label}</span>
                    {sort === option.value && <Check size={13} className="text-accent" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            role="group"
            aria-label="Contact view"
            className="flex h-8 items-center rounded-lg border border-line bg-[#EDEDE8] p-0.5"
          >
            <button
              type="button"
              aria-pressed={view === 'table'}
              onClick={() => onViewChange('table')}
              className={cn(
                'flex h-6.5 items-center gap-1.5 rounded-md px-2.5 text-[0.71875rem] font-medium transition',
                view === 'table'
                  ? 'bg-white text-ink shadow-[0_0.0625rem_0.125rem_rgba(24,24,27,0.08)]'
                  : 'text-muted hover:text-ink-soft',
              )}
            >
              <Table2 size={13} aria-hidden="true" />
              Table
            </button>
            <button
              type="button"
              aria-pressed={view === 'board'}
              onClick={() => onViewChange('board')}
              className={cn(
                'flex h-6.5 items-center gap-1.5 rounded-md px-2.5 text-[0.71875rem] font-medium transition',
                view === 'board'
                  ? 'bg-white text-ink shadow-[0_0.0625rem_0.125rem_rgba(24,24,27,0.08)]'
                  : 'text-muted hover:text-ink-soft',
              )}
            >
              <Columns3 size={13} aria-hidden="true" />
              Board
            </button>
          </div>

          <button
            type="button"
            onClick={onAddContact}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-[#1C1C20] px-3 text-[0.75rem] font-medium text-white shadow-[0_0.0625rem_0.125rem_rgba(24,24,27,0.14)] transition hover:bg-[#2B2B31] active:translate-y-px"
          >
            <Plus size={14} strokeWidth={2.2} aria-hidden="true" />
            Add contact
          </button>
        </div>
      </div>
    </header>
  )
}
