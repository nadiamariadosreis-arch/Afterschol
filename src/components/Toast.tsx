import { useToastStore } from '../store/useToastStore'

export function Toast() {
  const message = useToastStore((s) => s.message)
  if (!message) return null
  return (
    <div className="toast-pop fixed bottom-24 left-1/2 z-50 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-lg md:bottom-8">
      {message}
    </div>
  )
}
