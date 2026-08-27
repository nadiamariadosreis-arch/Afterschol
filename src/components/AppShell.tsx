import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { ChevronLeft } from './icons'

export function AppShell({
  title,
  onBack,
  children,
  rightSlot,
}: {
  title?: string
  onBack?: () => void
  children: ReactNode
  rightSlot?: ReactNode
}) {
  const navigate = useNavigate()
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col pb-24 md:pb-8">
      {(title || onBack) && (
        <header className="sticky top-0 z-30 flex items-center gap-3 bg-cloud/90 px-4 py-4 backdrop-blur">
          {onBack && (
            <button
              type="button"
              onClick={() => (onBack ? onBack() : navigate(-1))}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-ink shadow-sm active:scale-95"
              aria-label="Voltar"
            >
              <ChevronLeft />
            </button>
          )}
          {title && <h1 className="font-display truncate text-xl font-bold text-ink">{title}</h1>}
          <div className="ml-auto">{rightSlot}</div>
        </header>
      )}
      <main className="flex-1 px-4">{children}</main>
    </div>
  )
}

export function BottomNav({ childId }: { childId: string }) {
  const base = `/crianca/${childId}`
  const items = [
    { to: '/painel', label: 'Início', emoji: '🏠' },
    { to: `${base}/rotina`, label: 'Rotina', emoji: '🗓️' },
    { to: `${base}/semana`, label: 'Semana', emoji: '📌' },
    { to: `${base}/especiais`, label: 'Especial', emoji: '✨' },
    { to: `${base}/como-fazer`, label: 'Como fazer', emoji: '📋' },
  ]
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-3xl items-center justify-between border-t border-line bg-white/95 px-2 py-2 backdrop-blur md:bottom-4 md:rounded-3xl md:border md:shadow-lg">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-bold transition ${
              isActive ? 'text-primary-dark' : 'text-ink-soft'
            }`
          }
        >
          <span className="text-xl">{item.emoji}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
