import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '../lib/utils'
import { Avatar } from './Primitives'

export interface SelectOption {
  value: string
  label: string
  dot?: string
  avatarName?: string
}

interface SelectMenuProps {
  label: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  kind?: 'stage' | 'owner'
  placeholder?: string
}

export function SelectMenu({
  label,
  value,
  options,
  onChange,
  kind = 'stage',
  placeholder = 'Select…',
}: SelectMenuProps) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const labelId = useId()

  const selected = options.find((option) => option.value === value)

  useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => {
      const list = listRef.current
      if (!list) return
      const target =
        list.querySelector<HTMLElement>('[aria-selected="true"]') ??
        list.querySelector<HTMLElement>('[role="option"]')
      target?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const closeAndRestore = () => {
    setOpen(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  const focusOption = (direction: 1 | -1) => {
    const list = listRef.current
    if (!list) return
    const items = Array.from(list.querySelectorAll<HTMLElement>('[role="option"]'))
    if (items.length === 0) return
    const currentIndex = items.indexOf(document.activeElement as HTMLElement)
    const nextIndex =
      currentIndex === -1
        ? direction === 1
          ? 0
          : items.length - 1
        : (currentIndex + direction + items.length) % items.length
    items[nextIndex]?.focus()
  }

  return (
    <div ref={wrapperRef} className="relative">
      <span
        id={labelId}
        className="mb-1.5 block text-[0.65625rem] font-medium text-ink-soft"
      >
        {label}
      </span>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            setOpen(true)
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${labelId} ${labelId}-value`}
        className={cn(
          'flex h-9 w-full items-center gap-2 rounded-lg border bg-white px-2.5 text-left text-[0.75rem] shadow-[0_0.0625rem_0.0625rem_rgba(24,24,27,0.02)] transition',
          open
            ? 'border-accent/45 ring-3 ring-accent/10'
            : 'border-line hover:border-line-strong',
        )}
      >
        {kind === 'owner' ? (
          selected?.avatarName ? (
            <Avatar name={selected.avatarName} size="xs" />
          ) : (
            <span className="size-4.5 shrink-0 rounded-full border border-dashed border-line-strong" />
          )
        ) : (
          <span
            className={cn('size-1.75 shrink-0 rounded-full', selected?.dot ?? 'bg-zinc-300')}
          />
        )}
        <span
          id={`${labelId}-value`}
          className={cn(
            'min-w-0 flex-1 truncate',
            selected ? 'text-ink' : 'text-faint',
          )}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={13}
          className={cn(
            'shrink-0 text-faint transition-transform duration-150',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          aria-labelledby={labelId}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              focusOption(1)
            } else if (event.key === 'ArrowUp') {
              event.preventDefault()
              focusOption(-1)
            } else if (event.key === 'Home') {
              event.preventDefault()
              listRef.current?.querySelector<HTMLElement>('[role="option"]')?.focus()
            } else if (event.key === 'End') {
              event.preventDefault()
              const items = listRef.current?.querySelectorAll<HTMLElement>('[role="option"]')
              items?.[items.length - 1]?.focus()
            } else if (event.key === 'Escape') {
              event.preventDefault()
              event.stopPropagation()
              closeAndRestore()
            } else if (event.key === 'Tab') {
              setOpen(false)
            }
          }}
          className="absolute left-0 top-[calc(100%+0.375rem)] z-50 w-full min-w-46 animate-pop-in rounded-lg border border-line bg-white p-1 shadow-pop"
        >
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <button
                key={option.value || 'unassigned'}
                type="button"
                role="option"
                aria-selected={isSelected}
                tabIndex={-1}
                onClick={() => {
                  onChange(option.value)
                  closeAndRestore()
                }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-[0.3125rem] px-2 py-1.75 text-left text-[0.75rem] outline-none transition',
                  isSelected
                    ? 'bg-accent-soft/80 text-ink'
                    : 'text-ink-soft hover:bg-[#F5F5F1] focus:bg-[#F5F5F1] hover:text-ink focus:text-ink',
                )}
              >
                {kind === 'owner' ? (
                  option.avatarName ? (
                    <Avatar name={option.avatarName} size="xs" />
                  ) : (
                    <span className="size-4.5 shrink-0 rounded-full border border-dashed border-line-strong" />
                  )
                ) : (
                  <span className={cn('size-1.75 shrink-0 rounded-full', option.dot)} />
                )}
                <span className="flex-1 truncate">{option.label}</span>
                {isSelected && <Check size={13} className="shrink-0 text-accent" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
