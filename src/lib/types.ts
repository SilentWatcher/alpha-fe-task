export const STAGES = ['Lead', 'Prospect', 'Qualified', 'Customer'] as const

export type Stage = (typeof STAGES)[number]

export const OWNERS = ['Alex', 'Sam', 'Jordan'] as const

export type Owner = (typeof OWNERS)[number] | ''

export interface Contact {
  id: string
  name: string
  email: string
  company: string
  role: string
  owner: Owner
  labels: string[]
  stage: Stage
  notes: string
  createdAt: string
}

export type ContactDraft = Omit<Contact, 'id' | 'createdAt'>

export type View = 'table' | 'board'

export type SortKey = 'added' | 'name' | 'company' | 'stage'

export interface StageMeta {
  label: Stage
  dot: string
  badge: string
  soft: string
}

export const STAGE_META: Record<Stage, StageMeta> = {
  Lead: {
    label: 'Lead',
    dot: 'bg-zinc-400',
    badge: 'border-zinc-200/80 bg-zinc-100/80 text-zinc-600',
    soft: 'bg-zinc-100',
  },
  Prospect: {
    label: 'Prospect',
    dot: 'bg-sky-500',
    badge: 'border-sky-100 bg-sky-50 text-sky-700',
    soft: 'bg-sky-50',
  },
  Qualified: {
    label: 'Qualified',
    dot: 'bg-violet-500',
    badge: 'border-violet-100 bg-violet-50 text-violet-700',
    soft: 'bg-violet-50',
  },
  Customer: {
    label: 'Customer',
    dot: 'bg-emerald-500',
    badge: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    soft: 'bg-emerald-50',
  },
}

export const OWNER_NAMES: Record<Exclude<Owner, ''>, string> = {
  Alex: 'Alex Morgan',
  Sam: 'Sam Rivera',
  Jordan: 'Jordan Lee',
}

export const LABEL_TONES: Record<string, string> = {
  Design: 'border-violet-100 bg-violet-50/90 text-violet-700',
  SaaS: 'border-sky-100 bg-sky-50/90 text-sky-700',
  Enterprise: 'border-slate-200/80 bg-slate-100/80 text-slate-600',
  Marketing: 'border-rose-100 bg-rose-50/90 text-rose-700',
  Operations: 'border-amber-100 bg-amber-50/90 text-amber-700',
  Consulting: 'border-teal-100 bg-teal-50/90 text-teal-700',
}

export const DEFAULT_LABEL_TONE =
  'border-zinc-200/80 bg-zinc-50 text-zinc-600'
