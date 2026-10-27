import { useEffect, useRef, useState } from 'react'
import { ArrowRight, SearchX, UserRoundSearch } from 'lucide-react'
import { OWNER_NAMES, type Contact } from '../lib/types'
import { cn, contactCountLabel } from '../lib/utils'
import { Avatar, EmptyValue, LabelChip, StageBadge } from './Primitives'

interface TableViewProps {
  contacts: Contact[]
  totalCount: number
  selectedId: string | null
  onSelect: (id: string) => void
  filtersActive: boolean
  onClearAll: () => void
  onAddContact: () => void
}

const COLUMNS = [
  { key: 'name', label: 'Name', width: '14.125rem' },
  { key: 'email', label: 'Email', width: '12.5rem' },
  { key: 'company', label: 'Company', width: '9.375rem' },
  { key: 'role', label: 'Role', width: '10rem' },
  { key: 'owner', label: 'Owner', width: '7rem' },
  { key: 'labels', label: 'Labels', width: '10.5rem' },
  { key: 'stage', label: 'Stage', width: '6.5rem' },
] as const

export function TableView({
  contacts,
  totalCount,
  selectedId,
  onSelect,
  filtersActive,
  onClearAll,
  onAddContact,
}: TableViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollState, setScrollState] = useState({ overflow: false, atEnd: false })

  useEffect(() => {
    const element = scrollRef.current
    if (!element) return
    const checkOverflow = () => {
      setScrollState({
        overflow: element.scrollWidth - element.clientWidth > 1,
        atEnd: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
      })
    }
    checkOverflow()
    const observer = new ResizeObserver(checkOverflow)
    observer.observe(element)
    window.addEventListener('resize', checkOverflow)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', checkOverflow)
    }
  }, [])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-line bg-white shadow-card">
      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          onScroll={() => {
            const element = scrollRef.current
            if (!element) return
            setScrollState({
              overflow: element.scrollWidth - element.clientWidth > 1,
              atEnd: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
            })
          }}
          className="h-full overflow-auto"
        >
        <table className="contacts-table w-full min-w-280 border-separate border-spacing-0">
          <colgroup>
            {COLUMNS.map((column) => (
              <col key={column.key} style={{ width: column.width }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {COLUMNS.map((column, index) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'sticky top-0 h-9 border-b border-line bg-[#FBFBF8] px-3.5 text-left text-[0.625rem] font-medium uppercase tracking-[0.075em] text-faint',
                    index === 0 &&
                      'left-0 z-30 border-r border-line/70 bg-[#FBFBF8] px-4',
                    index === 0 && 'shadow-[0.0625rem_0_0_rgba(231,231,225,0.75)]',
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length}>
                  <div className="flex min-h-95 flex-col items-center justify-center px-6 py-16 text-center">
                    <div className="grid size-10 place-items-center rounded-full border border-line bg-[#FAFAF7] text-muted">
                      {filtersActive ? (
                        <SearchX size={18} strokeWidth={1.7} />
                      ) : (
                        <UserRoundSearch size={18} strokeWidth={1.7} />
                      )}
                    </div>
                    <p className="mt-3 text-[0.8125rem] font-medium text-ink">
                      {filtersActive ? 'No contacts match this view' : 'No contacts yet'}
                    </p>
                    <p className="mt-1 max-w-70 text-[0.71875rem] leading-relaxed text-muted">
                      {filtersActive
                        ? 'Try a different search, or clear your filters to see every contact.'
                        : 'Add your first contact to start building the shared database.'}
                    </p>
                    <button
                      type="button"
                      onClick={filtersActive ? onClearAll : onAddContact}
                      className="mt-4 flex h-8 items-center rounded-lg border border-line bg-white px-3 text-[0.71875rem] font-medium text-ink-soft shadow-[0_0.0625rem_0.0625rem_rgba(24,24,27,0.02)] transition hover:border-line-strong hover:text-ink"
                    >
                      {filtersActive ? 'Clear search and filters' : 'Add contact'}
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <ContactRow
                  key={contact.id}
                  contact={contact}
                  selected={contact.id === selectedId}
                  onSelect={() => onSelect(contact.id)}
                />
              ))
            )}
          </tbody>
        </table>
        </div>
        {scrollState.overflow && !scrollState.atEnd && (
          <div className="pointer-events-none absolute inset-y-0 right-0 w-7 bg-gradient-to-l from-white via-white/75 to-transparent" />
        )}
      </div>

      {contacts.length > 0 && (
        <div className="flex h-10 shrink-0 items-center justify-between border-t border-line/80 bg-[#FBFBF8] px-4">
          <span className="text-[0.65625rem] font-medium tabular text-muted">
            Showing {contactCountLabel(contacts.length, totalCount)}
          </span>
          <span className="hidden text-[0.65625rem] text-faint sm:flex sm:items-center sm:gap-1">
            {scrollState.overflow ? (
              <>
                Scroll horizontally to see all columns
                <ArrowRight size={11} aria-hidden="true" />
              </>
            ) : (
              'Select a contact to view details'
            )}
          </span>
        </div>
      )}
    </div>
  )
}

interface ContactRowProps {
  contact: Contact
  selected: boolean
  onSelect: () => void
}

function ContactRow({ contact, selected, onSelect }: ContactRowProps) {
  const ownerName = contact.owner ? OWNER_NAMES[contact.owner] : ''

  return (
    <tr
      tabIndex={0}
      data-contact-id={contact.id}
      aria-current={selected ? 'true' : undefined}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
      className={cn(
        'group cursor-pointer outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent/55',
        selected ? 'bg-[#F7F7FC]' : 'hover:bg-[#FAFAF7]',
      )}
    >
      <td
        className={cn(
          'sticky left-0 z-20 h-13 border-b border-r border-line/70 px-4 transition-colors',
          selected
            ? 'bg-[#F7F7FC] shadow-[inset_0.125rem_0_0_#5657C7]'
            : 'bg-white group-hover:bg-[#FAFAF7]',
          'group-focus-visible:bg-[#F5F5FA]',
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar name={contact.name} size="md" />
          <span className="truncate text-[0.78125rem] font-medium text-ink">{contact.name}</span>
        </div>
      </td>

      <td className="h-13 border-b border-line/70 px-3.5">
        {contact.email ? (
          <span className="block truncate text-[0.75rem] text-ink-soft" title={contact.email}>
            {contact.email}
          </span>
        ) : (
          <EmptyValue />
        )}
      </td>

      <td className="h-13 border-b border-line/70 px-3.5">
        {contact.company ? (
          <span className="block truncate text-[0.75rem] text-ink-soft" title={contact.company}>
            {contact.company}
          </span>
        ) : (
          <EmptyValue />
        )}
      </td>

      <td className="h-13 border-b border-line/70 px-3.5">
        {contact.role ? (
          <span className="block truncate text-[0.75rem] text-ink-soft" title={contact.role}>
            {contact.role}
          </span>
        ) : (
          <EmptyValue />
        )}
      </td>

      <td className="h-13 border-b border-line/70 px-3.5">
        {contact.owner ? (
          <span className="flex min-w-0 items-center gap-1.5" title={ownerName}>
            <Avatar name={ownerName} size="xs" />
            <span className="truncate text-[0.75rem] text-ink-soft">{contact.owner}</span>
          </span>
        ) : (
          <EmptyValue />
        )}
      </td>

      <td className="h-13 border-b border-line/70 px-3.5">
        {contact.labels.length > 0 ? (
          <span className="flex items-center gap-1 overflow-hidden">
            {contact.labels.slice(0, 2).map((label) => (
              <LabelChip key={label} label={label} />
            ))}
            {contact.labels.length > 2 && (
              <span className="text-[0.625rem] font-medium text-faint">
                +{contact.labels.length - 2}
              </span>
            )}
          </span>
        ) : (
          <EmptyValue />
        )}
      </td>

      <td className="h-13 border-b border-line/70 px-3.5">
        <StageBadge stage={contact.stage} />
      </td>
    </tr>
  )
}
