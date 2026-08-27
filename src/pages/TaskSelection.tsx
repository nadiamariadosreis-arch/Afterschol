import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { useToastStore } from '../store/useToastStore'
import { AppShell } from '../components/AppShell'
import { EmptyState } from '../components/EmptyState'
import { suggestTasksForChild } from '../lib/suggestionEngine'
import type { PeriodOfDay, TaskCategory } from '../types'
import { PERIOD_LABELS } from '../types'

const CATEGORY_LABELS: Record<TaskCategory, string> = {
  higiene: 'Higiene',
  organizacao: 'Organização',
  alimentacao: 'Alimentação',
  estudos: 'Estudos',
  casa: 'Casa',
  animais: 'Animais',
  jardim: 'Jardim',
  autocuidado: 'Autocuidado',
  social: 'Social',
  lazer: 'Lazer',
  outro: 'Outro',
}

export default function TaskSelection() {
  const { childId } = useParams<{ childId: string }>()
  const navigate = useNavigate()
  const child = useAppStore((s) => (childId ? s.children[childId] : undefined))
  const currentUserId = useAppStore((s) => s.currentUserId)
  const user = useAppStore((s) => (currentUserId ? s.users[currentUserId] : null))
  const family = useAppStore((s) => (user?.familyId ? s.families[user.familyId] : null))
  const customTasks = useAppStore((s) => s.customTasks)
  const childTasks = useAppStore((s) => s.childTasks)
  const setSelectedBankTasks = useAppStore((s) => s.setSelectedBankTasks)
  const linkCustomTaskToChild = useAppStore((s) => s.linkCustomTaskToChild)
  const removeChildTask = useAppStore((s) => s.removeChildTask)
  const show = useToastStore((s) => s.show)

  const [category, setCategory] = useState<TaskCategory | null>(null)
  const [period, setPeriod] = useState<PeriodOfDay | null>(null)
  const [search, setSearch] = useState('')

  const suggestions = useMemo(() => {
    if (!child) return []
    return suggestTasksForChild(child, family, {
      category: category ?? undefined,
      period: period ?? undefined,
      search: search || undefined,
    })
  }, [child, family, category, period, search])

  const familyCustomTasks = (family?.customTaskIds ?? []).map((id) => customTasks[id]).filter(Boolean)

  const selectedCustomTaskIds = useMemo(
    () => new Set(Object.values(childTasks).filter((ct) => ct.childId === childId && ct.customTaskId).map((ct) => ct.customTaskId)),
    [childTasks, childId],
  )

  if (!child || !childId) return null

  function toggleBankTask(taskId: string) {
    const current = new Set(child!.selectedTaskIds)
    if (current.has(taskId)) current.delete(taskId)
    else current.add(taskId)
    setSelectedBankTasks(childId!, Array.from(current))
  }

  function toggleCustomTask(customTaskId: string) {
    if (selectedCustomTaskIds.has(customTaskId)) {
      const link = Object.values(childTasks).find((ct) => ct.childId === childId && ct.customTaskId === customTaskId)
      if (link) removeChildTask(link.id)
    } else {
      linkCustomTaskToChild(childId!, customTaskId)
    }
  }

  return (
    <AppShell title="Responsabilidades" onBack={() => navigate(`/crianca/${childId}/perfil/4`)}>
      <div className="flex flex-col gap-5 pt-2">
        <div>
          <p className="font-display text-xl font-bold text-ink">
            Estas são algumas responsabilidades que podem combinar com {child.name || 'ela'}.
          </p>
          <p className="mt-1 text-sm text-ink-soft">Escolha quantas fizerem sentido. Nada aqui é obrigatório — você decide.</p>
        </div>

        <input
          className="input"
          placeholder="Buscar tarefa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
          <button type="button" onClick={() => setCategory(null)} className={`chip shrink-0 ${category === null ? 'chip-active' : ''}`}>
            Todas categorias
          </button>
          {(Object.keys(CATEGORY_LABELS) as TaskCategory[]).map((cat) => (
            <button key={cat} type="button" onClick={() => setCategory(cat)} className={`chip shrink-0 ${category === cat ? 'chip-active' : ''}`}>
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
          <button type="button" onClick={() => setPeriod(null)} className={`chip shrink-0 ${period === null ? 'chip-active' : ''}`}>
            Qualquer momento
          </button>
          {(Object.keys(PERIOD_LABELS) as PeriodOfDay[]).map((p) => (
            <button key={p} type="button" onClick={() => setPeriod(p)} className={`chip shrink-0 ${period === p ? 'chip-active' : ''}`}>
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => navigate(`/crianca/${childId}/tarefa-propria`)}
          className="rounded-2xl border-2 border-dashed border-primary bg-primary/5 py-3.5 text-sm font-bold text-primary-dark active:scale-[0.98]"
        >
          + Criar minha própria tarefa
        </button>

        {familyCustomTasks.length > 0 && (
          <div>
            <p className="mb-2 font-display text-sm font-bold text-ink-soft">Tarefas da nossa família</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {familyCustomTasks.map((task) => (
                <TaskPickCard
                  key={task.id}
                  icon={task.icon}
                  name={task.name}
                  description={task.description}
                  selected={selectedCustomTaskIds.has(task.id)}
                  onClick={() => toggleCustomTask(task.id)}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 font-display text-sm font-bold text-ink-soft">Sugestões do banco de tarefas</p>
          {suggestions.length === 0 ? (
            <EmptyState emoji="🔍" title="Nada por aqui" description="Tente outro filtro ou crie uma tarefa própria." />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {suggestions.map((task) => (
                <TaskPickCard
                  key={task.id}
                  icon={task.icon}
                  name={task.name}
                  description={task.description}
                  duration={task.durationMinutes}
                  selected={child.selectedTaskIds.includes(task.id)}
                  onClick={() => toggleBankTask(task.id)}
                />
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            show('Responsabilidades salvas.')
            navigate(`/crianca/${childId}/rotina`)
          }}
          className="sticky bottom-4 rounded-2xl bg-primary py-4 font-display text-base font-bold text-white shadow-lg shadow-primary/30 active:scale-[0.98]"
        >
          Continuar — Montar rotina
        </button>
      </div>
    </AppShell>
  )
}

function TaskPickCard({
  icon,
  name,
  description,
  duration,
  selected,
  onClick,
}: {
  icon: string
  name: string
  description: string
  duration?: number
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`card relative flex flex-col items-start gap-1 border-2 p-3 text-left transition active:scale-95 ${
        selected ? 'border-primary bg-primary/5' : 'border-transparent'
      }`}
    >
      {selected && (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">✓</span>
      )}
      <span className="text-2xl">{icon}</span>
      <span className="font-display text-sm font-bold leading-tight text-ink">{name}</span>
      <span className="line-clamp-2 text-xs text-ink-soft">{description}</span>
      {duration !== undefined && <span className="text-[11px] font-semibold text-mint">{duration} min</span>}
    </button>
  )
}
