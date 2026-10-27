import { useEffect, useMemo, useRef, useState } from 'react'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { TableView } from './components/TableView'
import { BoardView } from './components/BoardView'
import { ContactDrawer } from './components/ContactDrawer'
import { ConfirmDialog } from './components/ConfirmDialog'
import { Toast, type ToastData } from './components/Toast'
import { EMPTY_DRAFT, INITIAL_CONTACTS } from './lib/data'
import {
  STAGES,
  type Contact,
  type ContactDraft,
  type SortKey,
  type Stage,
  type View,
} from './lib/types'
import {
  draftFromContact,
  draftsEqual,
  isDraftEmpty,
  sortValue,
} from './lib/utils'

type EditorState =
  | { mode: 'edit'; id: string; draft: ContactDraft }
  | { mode: 'create'; draft: ContactDraft }

type PendingAction =
  | { type: 'select'; id: string }
  | { type: 'close' }
  | { type: 'create'; stage: Stage }

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS)
  const [view, setView] = useState<View>('table')
  const [query, setQuery] = useState('')
  const [stageFilter, setStageFilter] = useState<Stage[]>([])
  const [sort, setSort] = useState<SortKey>('added')
  const [workspace, setWorkspace] = useState('Alpha Workspace')
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [toast, setToast] = useState<ToastData | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  const selectedContact = useMemo(() => {
    if (editor?.mode !== 'edit') return undefined
    return contacts.find((contact) => contact.id === editor.id)
  }, [contacts, editor])

  const dirty = Boolean(
    editor?.mode === 'edit' &&
      selectedContact &&
      !draftsEqual(editor.draft, draftFromContact(selectedContact)),
  )

  const createDirty = Boolean(editor?.mode === 'create' && !isDraftEmpty(editor.draft))
  const hasUnsavedChanges = dirty || createDirty

  const stageCounts = useMemo(() => {
    const counts = Object.fromEntries(STAGES.map((stage) => [stage, 0])) as Record<
      Stage,
      number
    >
    for (const contact of contacts) counts[contact.stage] += 1
    return counts
  }, [contacts])

  const visibleContacts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const filtered = contacts.filter((contact) => {
      const matchesStage =
        stageFilter.length === 0 || stageFilter.includes(contact.stage)
      if (!matchesStage) return false
      if (!normalizedQuery) return true
      return [
        contact.name,
        contact.email,
        contact.company,
        contact.role,
        contact.owner,
        ...contact.labels,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    })

    return [...filtered].sort((a, b) => sortValue(a, b, sort))
  }, [contacts, query, stageFilter, sort])

  const filtersActive = query.trim().length > 0 || stageFilter.length > 0

  const notify = (message: string, tone: ToastData['tone'] = 'success') => {
    setToast({ id: Date.now(), message, tone })
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2600)
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current)
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.select()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const openContact = (id: string) => {
    const contact = contacts.find((item) => item.id === id)
    if (!contact) return
    setEditor({ mode: 'edit', id, draft: draftFromContact(contact) })
  }

  const openCreate = (stage: Stage = 'Lead') => {
    setEditor({ mode: 'create', draft: { ...EMPTY_DRAFT, stage } })
  }

  const closeEditor = () => {
    const contactId = editor?.mode === 'edit' ? editor.id : null
    setEditor(null)
    if (contactId) {
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>(`[data-contact-id="${contactId}"]`)?.focus()
      })
    }
  }

  const requestSelect = (id: string) => {
    if (editor?.mode === 'edit' && editor.id === id) return
    if (hasUnsavedChanges) {
      setPendingAction({ type: 'select', id })
      return
    }
    openContact(id)
  }

  const requestClose = () => {
    if (hasUnsavedChanges) {
      setPendingAction({ type: 'close' })
      return
    }
    closeEditor()
  }

  const requestCreate = (stage: Stage = 'Lead') => {
    if (hasUnsavedChanges) {
      setPendingAction({ type: 'create', stage })
      return
    }
    openCreate(stage)
  }

  const handleDraftChange = (patch: Partial<ContactDraft>) => {
    setEditor((current) => {
      if (!current) return current
      return { ...current, draft: { ...current.draft, ...patch } }
    })
  }

  const handleSave = () => {
    if (!editor) return
    const normalized = normalizeDraft(editor.draft)

    if (editor.mode === 'create') {
      const newContact: Contact = {
        ...normalized,
        id: `c-${crypto.randomUUID()}`,
        createdAt: new Date().toISOString(),
      }
      setContacts((current) => [newContact, ...current])
      setEditor({
        mode: 'edit',
        id: newContact.id,
        draft: draftFromContact(newContact),
      })
      notify('Contact created')
      return
    }

    const id = editor.id
    setContacts((current) =>
      current.map((contact) =>
        contact.id === id ? { ...contact, ...normalized } : contact,
      ),
    )
    setEditor({ mode: 'edit', id, draft: normalized })
    notify('Changes saved')
  }

  const handleCancel = () => {
    if (!editor) return
    if (editor.mode === 'create') {
      closeEditor()
      return
    }
    if (dirty && selectedContact) {
      setEditor({
        mode: 'edit',
        id: selectedContact.id,
        draft: draftFromContact(selectedContact),
      })
      notify('Changes discarded', 'info')
      return
    }
    closeEditor()
  }

  const resolvePending = (discard: boolean) => {
    const action = pendingAction
    setPendingAction(null)
    if (!discard || !action) return
    if (action.type === 'select') openContact(action.id)
    else if (action.type === 'create') openCreate(action.stage)
    else closeEditor()
  }

  const handleToggleStage = (stage: Stage) => {
    setStageFilter((current) =>
      current.includes(stage)
        ? current.filter((item) => item !== stage)
        : [...current, stage],
    )
  }

  const clearAllFilters = () => {
    setQuery('')
    setStageFilter([])
  }

  const handleWorkspaceChange = (nextWorkspace: string) => {
    if (nextWorkspace === workspace) return
    setWorkspace(nextWorkspace)
    notify(`Switched to ${nextWorkspace}`, 'info')
  }

  const pendingDescription =
    editor?.mode === 'create'
      ? 'Your new contact hasn’t been created yet. Anything you’ve entered will be lost.'
      : `Your edits to ${selectedContact?.name ?? 'this contact'} will be lost. This can’t be undone.`

  return (
    <div className="flex h-full overflow-hidden bg-canvas">
      <Sidebar
        workspace={workspace}
        onWorkspaceChange={handleWorkspaceChange}
        contactCount={contacts.length}
        onPlaceholder={(label) =>
          notify(`${label} is a placeholder in this prototype.`, 'info')
        }
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          workspace={workspace}
          contactCount={visibleContacts.length}
          totalCount={contacts.length}
          query={query}
          onQueryChange={setQuery}
          searchRef={searchRef}
          stageFilter={stageFilter}
          onToggleStage={handleToggleStage}
          onClearFilter={() => setStageFilter([])}
          stageCounts={stageCounts}
          sort={sort}
          onSortChange={setSort}
          view={view}
          onViewChange={setView}
          onAddContact={() => requestCreate('Lead')}
        />

        <div className="flex min-h-0 flex-1">
          <main className="flex min-h-0 min-w-0 flex-1 flex-col px-6 pb-5 pt-5">
            {view === 'table' ? (
              <TableView
                contacts={visibleContacts}
                totalCount={contacts.length}
                selectedId={editor?.mode === 'edit' ? editor.id : null}
                onSelect={requestSelect}
                filtersActive={filtersActive}
                onClearAll={clearAllFilters}
                onAddContact={() => requestCreate('Lead')}
              />
            ) : (
              <BoardView
                contacts={visibleContacts}
                selectedId={editor?.mode === 'edit' ? editor.id : null}
                filtersActive={filtersActive}
                onSelect={requestSelect}
                onAddContact={requestCreate}
              />
            )}
          </main>

          {editor && (
            <ContactDrawer
              mode={editor.mode}
              recordKey={editor.mode === 'edit' ? `edit:${editor.id}` : 'create'}
              draft={editor.draft}
              unsaved={hasUnsavedChanges}
              onChange={handleDraftChange}
              onSave={handleSave}
              onCancel={handleCancel}
              onClose={requestClose}
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={pendingAction !== null}
        title="Discard unsaved changes?"
        description={pendingDescription}
        confirmLabel="Discard changes"
        onConfirm={() => resolvePending(true)}
        onCancel={() => resolvePending(false)}
      />

      <Toast toast={toast} />
    </div>
  )
}

function normalizeDraft(draft: ContactDraft): ContactDraft {
  const labels: string[] = []
  const seen = new Set<string>()
  for (const rawLabel of draft.labels) {
    const label = rawLabel.trim()
    const key = label.toLowerCase()
    if (label && !seen.has(key)) {
      seen.add(key)
      labels.push(label)
    }
  }

  return {
    name: draft.name.trim(),
    email: draft.email.trim(),
    company: draft.company.trim(),
    role: draft.role.trim(),
    owner: draft.owner,
    labels: labels.slice(0, 6),
    stage: draft.stage,
    notes: draft.notes.trim(),
  }
}
