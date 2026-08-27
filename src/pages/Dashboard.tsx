import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { AppShell, BottomNav } from '../components/AppShell'
import { EmptyState } from '../components/EmptyState'

export default function Dashboard() {
  const navigate = useNavigate()
  const currentUserId = useAppStore((s) => s.currentUserId)
  const user = useAppStore((s) => (currentUserId ? s.users[currentUserId] : null))
  const family = useAppStore((s) => (user?.familyId ? s.families[user.familyId] : null))
  const children = useAppStore((s) => s.children)
  const activeChildId = useAppStore((s) => s.activeChildId)
  const setActiveChild = useAppStore((s) => s.setActiveChild)
  const customTasks = useAppStore((s) => s.customTasks)
  const howToCards = useAppStore((s) => s.howToCards)
  const specialRoutines = useAppStore((s) => s.specialRoutines)
  const pdfs = useAppStore((s) => s.pdfs)
  const logOut = useAppStore((s) => s.logOut)

  const childList = (family?.childrenIds ?? []).map((id) => children[id]).filter(Boolean)
  const activeChild = activeChildId ? children[activeChildId] : childList[0]

  if (childList.length === 0) {
    return (
      <AppShell title="Painel da família" rightSlot={<LogoutButton onClick={() => { logOut(); navigate('/') }} />}>
        <div className="pt-6">
          <EmptyState
            emoji="👶"
            title="Vamos cadastrar a primeira criança?"
            description="Assim que ela estiver pronta, você poderá montar a rotina dela."
            action={
              <button type="button" onClick={() => navigate('/familia')} className="mt-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white">
                + Adicionar criança
              </button>
            }
          />
        </div>
      </AppShell>
    )
  }

  const displayedChild = activeChild ?? childList[0]

  const childCards = displayedChild?.selectedTaskIds.length ?? 0
  const childHowTo = Object.values(howToCards).filter((c) => c.childId === displayedChild?.id).length
  const childSpecial = Object.values(specialRoutines).filter((r) => r.childId === displayedChild?.id).length
  const childPdfs = Object.values(pdfs).filter((p) => p.childId === displayedChild?.id).length

  const quickActions = [
    { label: 'Montar rotina', emoji: '🗓️', bg: 'bg-primary/10', to: `/crianca/${displayedChild?.id}/rotina` },
    { label: 'Tarefas da semana', emoji: '📌', bg: 'bg-mint/15', to: `/crianca/${displayedChild?.id}/semana` },
    { label: 'Rotinas especiais', emoji: '✨', bg: 'bg-lilac/15', to: `/crianca/${displayedChild?.id}/especiais` },
    { label: 'Como fazer', emoji: '📋', bg: 'bg-sky/15', to: `/crianca/${displayedChild?.id}/como-fazer` },
    { label: 'Responsabilidades', emoji: '⭐', bg: 'bg-sunshine/25', to: `/crianca/${displayedChild?.id}/responsabilidades` },
    { label: 'Gerar PDF', emoji: '📄', bg: 'bg-bubblegum/15', to: `/crianca/${displayedChild?.id}/rotina/preview` },
  ]

  return (
    <AppShell
      title={`Olá, ${user?.name?.split(' ')[0] ?? ''}! 👋`}
      rightSlot={
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-base shadow-sm">🔔</span>
          <LogoutButton onClick={() => { logOut(); navigate('/') }} />
        </div>
      }
    >
      <div className="flex flex-col gap-5 pt-2">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 no-scrollbar">
          {childList.map((child) => (
            <button
              key={child.id}
              type="button"
              onClick={() => setActiveChild(child.id)}
              className={`flex shrink-0 flex-col items-center gap-1 rounded-2xl px-4 py-2 ${
                displayedChild?.id === child.id ? 'bg-primary/10 ring-2 ring-primary' : 'bg-white'
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-lilac/20 text-lg">
                {child.photo ? <img src={child.photo} alt="" className="h-full w-full object-cover" /> : '🧒'}
              </div>
              <span className="text-xs font-bold text-ink">{child.name || 'Sem nome'}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => navigate('/familia')}
            className="flex shrink-0 flex-col items-center gap-1 rounded-2xl bg-white px-4 py-2 text-ink-soft"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cloud text-lg">+</div>
            <span className="text-xs font-bold">Adicionar</span>
          </button>
        </div>

        <div>
          <p className="mb-2 font-display text-sm font-bold text-ink-soft">Ações rápidas para {displayedChild?.name}</p>
          <div className="grid grid-cols-3 gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate(action.to)}
                className="card flex flex-col items-center gap-1.5 py-4 text-center text-xs font-bold text-ink active:scale-95"
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-2xl text-xl ${action.bg}`}>{action.emoji}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 font-display text-sm font-bold text-ink-soft">Biblioteca de {displayedChild?.name}</p>
          <div className="grid grid-cols-4 gap-2">
            <StatCard emoji="⭐" value={childCards} label="Tarefas" />
            <StatCard emoji="✨" value={childSpecial} label="Especiais" />
            <StatCard emoji="📋" value={childHowTo} label="Cards" />
            <StatCard emoji="📄" value={childPdfs} label="PDFs" />
          </div>
        </div>

        <div className="card p-4">
          <p className="font-display text-sm font-bold text-ink">Biblioteca da família</p>
          <p className="mt-1 text-xs text-ink-soft">{Object.keys(customTasks).length} tarefas personalizadas criadas por vocês.</p>
        </div>
      </div>
      <BottomNav childId={displayedChild?.id ?? ''} />
    </AppShell>
  )
}

function StatCard({ emoji, value, label }: { emoji: string; value: number; label: string }) {
  return (
    <div className="card flex flex-col items-center gap-1 py-3 text-center">
      <span className="text-xl">{emoji}</span>
      <span className="font-display text-lg font-extrabold text-ink">{value}</span>
      <span className="text-[10px] font-bold text-ink-soft">{label}</span>
    </div>
  )
}

function LogoutButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-ink-soft shadow-sm">
      Sair
    </button>
  )
}
