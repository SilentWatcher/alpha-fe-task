import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { STAGE_META, type Stage } from '../lib/types'
import { avatarTone, cn, initials, labelTone } from '../lib/utils'

const AVATAR_SIZES = {
  xs: 'size-4.5 text-[0.46875rem]',
  sm: 'size-6 text-[0.5625rem]',
  md: 'size-7 text-[0.625rem]',
  lg: 'size-11 text-[0.84375rem]',
} as const

interface AvatarProps {
  name: string
  size?: keyof typeof AVATAR_SIZES
  className?: string
  muted?: boolean
}

export function Avatar({ name, size = 'md', className, muted = false }: AvatarProps) {
  const max = size === 'xs' ? 1 : 2
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold tracking-[0.01em]',
        AVATAR_SIZES[size],
        muted ? 'bg-zinc-100 text-zinc-500' : avatarTone(name),
        className,
      )}
    >
      {initials(name, max)}
    </span>
  )
}

export function StageBadge({ stage, className }: { stage: Stage; className?: string }) {
  const meta = STAGE_META[stage]
  return (
    <span
      className={cn(
        'inline-flex h-5.25 shrink-0 items-center gap-1.5 rounded-full border px-2 text-[0.6875rem] font-medium leading-none',
        meta.badge,
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', meta.dot)} />
      {stage}
    </span>
  )
}

interface LabelChipProps {
  label: string
  onRemove?: () => void
  className?: string
}

export function LabelChip({ label, onRemove, className }: LabelChipProps) {
  return (
    <span
      className={cn(
        'inline-flex h-5 max-w-37.5 items-center gap-1 rounded-[0.3125rem] border px-1.5 text-[0.65625rem] font-medium leading-none',
        labelTone(label),
        className,
      )}
    >
      <span className="truncate">{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="-mr-0.5 rounded-sm p-px opacity-60 transition hover:opacity-100 focus-visible:opacity-100"
          aria-label={`Remove ${label} label`}
        >
          <X size={10} strokeWidth={2.2} />
        </button>
      )}
    </span>
  )
}

export function EmptyValue() {
  return (
    <span className="text-[0.78125rem] text-faint" aria-label="Not provided">
      —
    </span>
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-sm border border-line bg-white px-1 font-sans text-[0.59375rem] font-medium text-faint shadow-[0_0.0625rem_0_rgba(0,0,0,0.02)]">
      {children}
    </kbd>
  )
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#1C1C20] text-white',
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="size-3.75" fill="none">
        <path
          d="M6.8 17.4 12 6.6l5.2 10.8M8.9 13.4h6.2"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
