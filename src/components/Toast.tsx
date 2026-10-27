import { Check, Info } from 'lucide-react'

export interface ToastData {
  id: number
  message: string
  tone?: 'success' | 'info'
}

export function Toast({ toast }: { toast: ToastData | null }) {
  if (!toast) return null
  return (
    <div
      key={toast.id}
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-5 left-63 z-60 flex h-9 animate-toast-in items-center gap-2 rounded-lg bg-[#1C1C20] px-3.5 text-[0.71875rem] font-medium text-white shadow-[0_0.5rem_1.5rem_-0.5rem_rgba(24,24,27,0.4)] max-[73.75rem]:left-22"
    >
      {toast.tone === 'info' ? (
        <Info size={13} className="text-zinc-400" aria-hidden="true" />
      ) : (
        <Check size={13} strokeWidth={2.4} className="text-emerald-400" aria-hidden="true" />
      )}
      {toast.message}
    </div>
  )
}
