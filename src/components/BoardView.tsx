import { useEffect, useRef, useState } from 'react'
import { Inbox, Plus, SearchX } from 'lucide-react'
import { OWNER_NAMES, STAGES, STAGE_META, type Contact, type Stage } from '../lib/types'
import { cn } from '../lib/utils'
import { Avatar, LabelChip } from './Primitives'

interface BoardViewProps {
  contacts: Contact[]
  selectedId: string | null
  filtersActive: boolean
  onSelect: (id: string) => void
  onAddContact: (stage: Stage) => void
}

export function BoardView({
  contacts,
  selectedId,
  filtersActive,
  onSelect,
  onAddContact,
}: BoardViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollState, setScrollState] = useState({
    overflow: false,
    atStart: true,
    atEnd: false,
  })
  const selectedStage = contacts.find((contact) => contact.id === selectedId)?.stage ?? null

  useEffect(() => {
    const element = scrollRef.current
    if (!element) return
    const checkOverflow = () => {
      setScrollState({
        overflow: element.scrollWidth - element.clientWidth > 1,
        atStart: element.scrollLeft <= 2,
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

  useEffect(() => {
    if (!selectedId) return
    const frame = requestAnimationFrame(() => {
      const card = scrollRef.current?.querySelector<HTMLElement>(
        `[data-contact-id="${selectedId}"]`,
      )
      card?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    })
    return () => cancelAnimationFrame(frame)
  }, [selectedId, selectedStage])

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        onScroll={() => {
          const element = scrollRef.current
          if (!element) return
          setScrollState({
            overflow: element.scrollWidth - element.clientWidth > 1,
            atStart: element.scrollLeft <= 2,
            atEnd: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
          })
        }}
        className="h-full min-h-0 overflow-x-auto pb-1"
      >
        <div className="grid h-full min-w-215 grid-cols-4 gap-3">
          {STAGES.map((stage) => {
            const stageContacts = contacts.filter((contact) => contact.stage === stage)
            const meta = STAGE_META[stage]
            return (
              <section
                key={stage}
                aria-label={`${stage} contacts`}
                className="flex min-h-0 flex-col rounded-xl border border-line/80 bg-[#F2F2EE]"
              >
                <header className="flex h-10 shrink-0 items-center gap-2 px-2.5">
                  <span className={cn('size-1.75 shrink-0 rounded-full', meta.dot)} />
                  <h2 className="text-[0.75rem] font-semibold tracking-[-0.005em] text-ink">
                    {stage}
                  </h2>
                  <span className="rounded-full border border-line/80 bg-white/70 px-1.5 text-[0.59375rem] font-medium tabular leading-4 text-muted">
                    {stageContacts.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => onAddContact(stage)}
                    aria-label={`Add contact to ${stage}`}
                    title={`Add contact to ${stage}`}
                    className="ml-auto grid size-5 place-items-center rounded text-faint transition hover:bg-white/80 hover:text-ink-soft"
                  >
                    <Plus size={13} strokeWidth={2} />
                  </button>
                </header>

                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-2 pb-2">
                  {stageContacts.length === 0 ? (
                    <EmptyColumn
                      stage={stage}
                      filtersActive={filtersActive}
                      onAdd={() => onAddContact(stage)}
                    />
                  ) : (
                    stageContacts.map((contact) => (
                      <ContactCard
                        key={contact.id}
                        contact={contact}
                        selected={contact.id === selectedId}
                        onSelect={() => onSelect(contact.id)}
                      />
                    ))
                  )}
                </div>
              </section>
            )
          })}
        </div>
      </div>
      {scrollState.overflow && !scrollState.atStart && (
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-canvas via-canvas/90 to-transparent" />
      )}
      {scrollState.overflow && !scrollState.atEnd && (
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-canvas via-canvas/70 to-transparent" />
      )}
    </div>
  )
}

function EmptyColumn({
  stage,
  filtersActive,
  onAdd,
}: {
  stage: Stage
  filtersActive: boolean
  onAdd: () => void
}) {
  const isLead = stage === 'Lead'
  return (
    <div className="flex h-full min-h-47.5 flex-col items-center justify-center rounded-lg border border-dashed border-line-strong/90 bg-white/35 px-4 text-center">
      <div className="grid size-8 place-items-center rounded-full border border-line bg-white text-faint shadow-[0_0.0625rem_0.0625rem_rgba(24,24,27,0.02)]">
        {filtersActive ? (
          <SearchX size={14} strokeWidth={1.8} />
        ) : (
          <Inbox size={14} strokeWidth={1.8} />
        )}
      </div>
      <p className="mt-2.5 text-[0.71875rem] font-medium text-ink-soft">
        {filtersActive ? 'No matches' : 'No contacts yet'}
      </p>
      <p className="mt-1 max-w-37.5 text-[0.65625rem] leading-[1.45] text-faint">
        {filtersActive
          ? 'No contacts in this view. Try clearing your filters.'
          : isLead
            ? 'Contacts added as leads will appear here.'
            : `No contacts at the ${stage.toLowerCase()} stage.`}
      </p>
      {!filtersActive && isLead && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-3 text-[0.65625rem] font-medium text-accent transition hover:text-accent-ink"
        >
          + Add contact
        </button>
      )}
    </div>
  )
}

function ContactCard({
  contact,
  selected,
  onSelect,
}: {
  contact: Contact
  selected: boolean
  onSelect: () => void
}) {
  const ownerName = contact.owner ? OWNER_NAMES[contact.owner] : ''
  const secondary = contact.role || contact.email

  return (
    <button
      type="button"
      onClick={onSelect}
      data-contact-id={contact.id}
      aria-pressed={selected}
      className={cn(
        'group flex min-h-30.5 w-full flex-col rounded-lg border bg-white p-2.5 text-left shadow-[0_0.0625rem_0.125rem_rgba(24,24,27,0.035)] transition',
        selected
          ? 'border-accent/45 ring-2 ring-accent/15'
          : 'border-line/90 hover:border-line-strong hover:shadow-[0_0.125rem_0.375rem_rgba(24,24,27,0.06)]',
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Avatar name={contact.name} size="sm" />
        <span className="min-w-0 flex-1 truncate text-[0.75rem] font-medium leading-4 text-ink">
          {contact.name}
        </span>
      </div>

      <div className="mt-2 min-h-7.5">
        {contact.company && (
          <p className="truncate text-[0.65625rem] leading-3.75 text-muted" title={contact.company}>
            {contact.company}
          </p>
        )}
        <p
          className="truncate text-[0.65625rem] leading-3.75 text-faint"
          title={secondary || undefined}
        >
          {secondary || '—'}
        </p>
      </div>

      <div className="mt-auto flex items-end justify-between gap-2 pt-2.5">
        <span className="flex min-w-0 items-center gap-1 overflow-hidden">
          {contact.labels.slice(0, 2).map((label) => (
            <LabelChip key={label} label={label} className="max-w-20.5" />
          ))}
          {contact.labels.length > 2 && (
            <span className="text-[0.59375rem] font-medium text-faint">
              +{contact.labels.length - 2}
            </span>
          )}
        </span>

        {contact.owner ? (
          <span
            className="flex shrink-0 items-center gap-1 text-[0.59375rem] font-medium text-muted"
            title={`Owner: ${ownerName}`}
          >
            <Avatar name={ownerName} size="xs" />
            {contact.owner}
          </span>
        ) : (
          <span className="shrink-0 text-[0.59375rem] text-faint" title="No owner assigned">
            Unassigned
          </span>
        )}
      </div>
    </button>
  )
}
