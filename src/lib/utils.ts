import {
  DEFAULT_LABEL_TONE,
  LABEL_TONES,
  STAGES,
  type Contact,
  type ContactDraft,
} from './types'

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function initials(name: string, max = 2) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, max)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

const AVATAR_TONES = [
  'bg-[#EDE8FE] text-[#5B3FBF]',
  'bg-[#DFF1FE] text-[#075E8D]',
  'bg-[#DDF5E8] text-[#116B43]',
  'bg-[#FCEFD2] text-[#95600A]',
  'bg-[#FCE4EA] text-[#A61E4D]',
  'bg-[#DDF4F1] text-[#0D665D]',
  'bg-[#E5EAFB] text-[#3448A4]',
  'bg-[#F3E5FC] text-[#7326A8]',
]

export function avatarTone(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return AVATAR_TONES[hash % AVATAR_TONES.length]
}

export function labelTone(label: string) {
  return LABEL_TONES[label] ?? DEFAULT_LABEL_TONE
}

export function draftFromContact(contact: Contact): ContactDraft {
  return {
    name: contact.name,
    email: contact.email,
    company: contact.company,
    role: contact.role,
    owner: contact.owner,
    labels: [...contact.labels],
    stage: contact.stage,
    notes: contact.notes,
  }
}

export function draftsEqual(a: ContactDraft, b: ContactDraft) {
  return (
    a.name === b.name &&
    a.email === b.email &&
    a.company === b.company &&
    a.role === b.role &&
    a.owner === b.owner &&
    a.stage === b.stage &&
    a.notes === b.notes &&
    a.labels.length === b.labels.length &&
    a.labels.every((label, index) => label === b.labels[index])
  )
}

export function isDraftEmpty(draft: ContactDraft) {
  return (
    !draft.name.trim() &&
    !draft.email.trim() &&
    !draft.company.trim() &&
    !draft.role.trim() &&
    !draft.owner &&
    draft.labels.length === 0 &&
    draft.stage === 'Lead' &&
    !draft.notes.trim()
  )
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function contactCountLabel(count: number, total?: number) {
  if (total !== undefined && total !== count) {
    return `${count} of ${total} contacts`
  }
  return `${count} ${count === 1 ? 'contact' : 'contacts'}`
}

export function sortValue(a: Contact, b: Contact, sort: 'added' | 'name' | 'company' | 'stage') {
  switch (sort) {
    case 'name':
      return a.name.localeCompare(b.name)
    case 'company':
      return (a.company || 'zzzz').localeCompare(b.company || 'zzzz')
    case 'stage':
      return STAGES.indexOf(a.stage) - STAGES.indexOf(b.stage)
    default:
      return b.createdAt.localeCompare(a.createdAt)
  }
}
