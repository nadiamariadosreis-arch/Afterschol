import type { ReactNode } from 'react'

export function EmptyState({
  emoji,
  title,
  description,
  action,
}: {
  emoji: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-line bg-white/60 px-6 py-12 text-center">
      <span className="text-5xl">{emoji}</span>
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {description && <p className="max-w-xs text-sm text-ink-soft">{description}</p>}
      {action}
    </div>
  )
}
