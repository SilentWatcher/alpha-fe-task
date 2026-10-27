import { useEffect, useRef, useState } from 'react'
import { UserRound, X } from 'lucide-react'
import {
  OWNERS,
  OWNER_NAMES,
  STAGES,
  STAGE_META,
  type ContactDraft,
  type Stage,
} from '../lib/types'
import { cn, isValidEmail } from '../lib/utils'
import { Avatar, LabelChip } from './Primitives'
import { SelectMenu, type SelectOption } from './SelectMenu'

interface ContactDrawerProps {
  mode: 'edit' | 'create'
  recordKey: string
  draft: ContactDraft
  unsaved: boolean
  onChange: (patch: Partial<ContactDraft>) => void
  onSave: () => void
  onCancel: () => void
  onClose: () => void
}

const STAGE_OPTIONS: SelectOption[] = STAGES.map((stage) => ({
  value: stage,
  label: stage,
  dot: STAGE_META[stage].dot,
}))

const OWNER_OPTIONS: SelectOption[] = [
  { value: '', label: 'Unassigned' },
  ...OWNERS.map((owner) => ({
    value: owner,
    label: OWNER_NAMES[owner],
    avatarName: OWNER_NAMES[owner],
  })),
]

const inputClasses =
  'h-9 w-full rounded-lg border border-line bg-white px-2.5 text-[0.75rem] text-ink shadow-[0_0.0625rem_0.0625rem_rgba(24,24,27,0.02)] outline-none transition placeholder:text-faint hover:border-line-strong focus:border-accent/45 focus:ring-3 focus:ring-accent/10'

export function ContactDrawer({
  mode,
  recordKey,
  draft,
  unsaved,
  onChange,
  onSave,
  onCancel,
  onClose,
}: ContactDrawerProps) {
  const [attempted, setAttempted] = useState(false)
  const [labelInput, setLabelInput] = useState('')
  const drawerRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  const nameInvalid = attempted && !draft.name.trim()
  const emailInvalid = attempted && Boolean(draft.email.trim()) && !isValidEmail(draft.email)
  const canSubmit = unsaved

  useEffect(() => {
    setAttempted(false)
    setLabelInput('')
    requestAnimationFrame(() => closeButtonRef.current?.focus())
  }, [recordKey])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!drawerRef.current?.contains(event.target as Node)) return
      if (event.key === 'Escape' && !event.defaultPrevented) {
        event.preventDefault()
        onClose()
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        if (canSubmit) attemptSave()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  })

  const attemptSave = () => {
    setAttempted(true)
    if (!draft.name.trim()) {
      nameRef.current?.focus()
      return
    }
    if (draft.email.trim() && !isValidEmail(draft.email)) {
      emailRef.current?.focus()
      return
    }
    setAttempted(false)
    onSave()
  }

  const addLabel = () => {
    const next = labelInput.trim().replace(/,+$/, '')
    if (!next) return
    const exists = draft.labels.some((label) => label.toLowerCase() === next.toLowerCase())
    if (!exists && draft.labels.length < 6) {
      onChange({ labels: [...draft.labels, next] })
    }
    setLabelInput('')
  }

  return (
    <aside
      ref={drawerRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="contact-drawer-title"
      className="relative z-10 flex h-full w-106 shrink-0 animate-drawer-in flex-col border-l border-line bg-white shadow-[-1.125rem_0_3rem_-2.25rem_rgba(24,24,27,0.28)] max-[73.75rem]:w-101 max-[57.5rem]:fixed max-[57.5rem]:inset-y-0 max-[57.5rem]:right-0 max-[57.5rem]:z-40 max-[57.5rem]:max-w-full max-[57.5rem]:shadow-drawer"
    >
      <div className="shrink-0 border-b border-line/80 px-5 pb-3.5 pt-4">
        <div className="flex items-start gap-3">
          {draft.name.trim() ? (
            <Avatar name={draft.name} size="lg" />
          ) : (
            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-[#F7F7F3] text-faint">
              <UserRound size={18} strokeWidth={1.7} aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0 flex-1 pt-0.5">
            <h2
              id="contact-drawer-title"
              className="truncate text-[0.9375rem] font-semibold tracking-[-0.015em] text-ink"
            >
              {draft.name.trim() || (mode === 'create' ? 'New contact' : 'Untitled contact')}
            </h2>
            <p className="mt-0.5 text-[0.65625rem] text-muted">
              {mode === 'create' ? 'Add someone to your workspace' : 'Contact details'}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close contact details"
            title="Close panel (Esc)"
            className="-mr-1 grid size-7 shrink-0 place-items-center rounded-md text-muted transition hover:bg-[#F4F4EF] hover:text-ink"
          >
            <X size={15} />
          </button>
        </div>

        {unsaved && (
          <div
            aria-live="polite"
            className="mt-3 flex h-7 animate-unsaved-in items-center gap-1.5 rounded-md border border-amber-200/70 bg-amber-50 px-2 text-[0.65625rem] font-medium text-amber-800"
          >
            <span className="size-1.5 rounded-full bg-amber-500" />
            {mode === 'create' ? 'New contact not saved' : 'Unsaved changes'}
            <span className="ml-auto font-normal text-amber-800">
              {mode === 'create' ? 'Create to add it to both views' : 'Save to update both views'}
            </span>
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-3.5">
          <div>
            <label
              htmlFor="contact-name"
              className="mb-1.5 flex items-center gap-1 text-[0.65625rem] font-medium text-ink-soft"
            >
              Name <span className="text-rose-500">*</span>
            </label>
            <input
              ref={nameRef}
              id="contact-name"
              value={draft.name}
              onChange={(event) => onChange({ name: event.target.value })}
              placeholder="Full name"
              aria-invalid={nameInvalid}
              aria-describedby={nameInvalid ? 'contact-name-error' : undefined}
              className={cn(
                inputClasses,
                nameInvalid && 'border-rose-300 focus:border-rose-400 focus:ring-rose-100',
              )}
            />
            {nameInvalid && (
              <p id="contact-name-error" className="mt-1 text-[0.65625rem] text-rose-600">
                Add a name for this contact.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="contact-email"
              className="mb-1.5 block text-[0.65625rem] font-medium text-ink-soft"
            >
              Email
            </label>
            <input
              ref={emailRef}
              id="contact-email"
              type="email"
              value={draft.email}
              onChange={(event) => onChange({ email: event.target.value })}
              placeholder="name@company.com"
              aria-invalid={emailInvalid}
              aria-describedby={emailInvalid ? 'contact-email-error' : undefined}
              className={cn(
                inputClasses,
                emailInvalid && 'border-rose-300 focus:border-rose-400 focus:ring-rose-100',
              )}
            />
            {emailInvalid && (
              <p id="contact-email-error" className="mt-1 text-[0.65625rem] text-rose-600">
                Enter a valid email address.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="contact-company"
                className="mb-1.5 block text-[0.65625rem] font-medium text-ink-soft"
              >
                Company
              </label>
              <input
                id="contact-company"
                value={draft.company}
                onChange={(event) => onChange({ company: event.target.value })}
                placeholder="Company"
                className={inputClasses}
              />
            </div>
            <div>
              <label
                htmlFor="contact-role"
                className="mb-1.5 block text-[0.65625rem] font-medium text-ink-soft"
              >
                Role
              </label>
              <input
                id="contact-role"
                value={draft.role}
                onChange={(event) => onChange({ role: event.target.value })}
                placeholder="Role"
                className={inputClasses}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SelectMenu
              label="Owner"
              kind="owner"
              value={draft.owner}
              options={OWNER_OPTIONS}
              onChange={(owner) => onChange({ owner: owner as ContactDraft['owner'] })}
            />
            <SelectMenu
              label="Stage"
              value={draft.stage}
              options={STAGE_OPTIONS}
              onChange={(stage) => onChange({ stage: stage as Stage })}
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-[0.65625rem] font-medium text-ink-soft">Labels</span>
              <span className="text-[0.59375rem] text-faint">Enter to add</span>
            </div>
            <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-line bg-white px-2 py-1.5 shadow-[0_0.0625rem_0.0625rem_rgba(24,24,27,0.02)] transition focus-within:border-accent/45 focus-within:ring-3 focus-within:ring-accent/10">
              {draft.labels.map((label) => (
                <LabelChip
                  key={label}
                  label={label}
                  onRemove={() =>
                    onChange({ labels: draft.labels.filter((item) => item !== label) })
                  }
                />
              ))}
              <input
                value={labelInput}
                onChange={(event) => setLabelInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ',') {
                    event.preventDefault()
                    addLabel()
                  }
                  if (event.key === 'Backspace' && !labelInput && draft.labels.length > 0) {
                    onChange({ labels: draft.labels.slice(0, -1) })
                  }
                }}
                onBlur={addLabel}
                maxLength={28}
                placeholder={draft.labels.length ? 'Add label…' : 'Add a label…'}
                aria-label="Add a label"
                className="h-5 min-w-19 flex-1 bg-transparent text-[0.71875rem] text-ink outline-none placeholder:text-faint"
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <label htmlFor="contact-notes" className="text-[0.65625rem] font-medium text-ink-soft">
                Notes
              </label>
              <span className="text-[0.59375rem] text-faint">Only in details</span>
            </div>
            <textarea
              id="contact-notes"
              value={draft.notes}
              onChange={(event) => onChange({ notes: event.target.value })}
              placeholder="Add context, next steps, or meeting notes…"
              className="min-h-28 w-full resize-y rounded-lg border border-line bg-white px-2.5 py-2 text-[0.75rem] leading-relaxed text-ink shadow-[0_0.0625rem_0.0625rem_rgba(24,24,27,0.02)] outline-none transition placeholder:text-faint hover:border-line-strong focus:border-accent/45 focus:ring-3 focus:ring-accent/10"
            />
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-line/80 bg-[#FBFBF8] px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-9 rounded-lg border border-line bg-white px-3 text-[0.75rem] font-medium text-ink-soft shadow-[0_0.0625rem_0.0625rem_rgba(24,24,27,0.02)] transition hover:border-line-strong hover:text-ink"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            {unsaved && (
              <span className="hidden text-[0.59375rem] text-faint sm:block">⌘S</span>
            )}
            <button
              type="button"
              onClick={attemptSave}
              disabled={!canSubmit}
              className="h-9 rounded-lg bg-[#1C1C20] px-3.5 text-[0.75rem] font-medium text-white shadow-[0_0.0625rem_0.125rem_rgba(24,24,27,0.14)] transition hover:bg-[#2B2B31] disabled:cursor-not-allowed disabled:bg-[#ECECE7] disabled:text-faint disabled:shadow-none"
            >
              {mode === 'create' ? 'Create contact' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
