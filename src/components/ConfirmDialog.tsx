import { useEffect, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    requestAnimationFrame(() => cancelRef.current?.focus())

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancel()
        return
      }
      if (event.key !== 'Tab') return
      const dialog = dialogRef.current
      if (!dialog) return
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus()
      }
    }
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-zinc-950/20 p-6 backdrop-blur-[0.09375rem]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="discard-title"
        aria-describedby="discard-description"
        className="w-95.5 max-w-full animate-modal-in rounded-xl border border-line bg-white p-5 shadow-pop"
      >
        <div className="grid size-8 place-items-center rounded-full border border-amber-200/80 bg-amber-50 text-amber-600">
          <AlertTriangle size={15} strokeWidth={1.9} aria-hidden="true" />
        </div>
        <h2
          id="discard-title"
          className="mt-3 text-[0.875rem] font-semibold tracking-[-0.01em] text-ink"
        >
          {title}
        </h2>
        <p
          id="discard-description"
          className="mt-1.5 text-[0.71875rem] leading-relaxed text-muted"
        >
          {description}
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="h-8 rounded-lg border border-line bg-white px-3 text-[0.71875rem] font-medium text-ink-soft shadow-[0_0.0625rem_0.0625rem_rgba(24,24,27,0.02)] transition hover:border-line-strong hover:text-ink"
          >
            Keep editing
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-8 rounded-lg bg-[#B42318] px-3 text-[0.71875rem] font-medium text-white shadow-[0_0.0625rem_0.125rem_rgba(180,35,24,0.18)] transition hover:bg-[#971C13]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
