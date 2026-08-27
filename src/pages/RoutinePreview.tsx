import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { useToastStore } from '../store/useToastStore'
import { AppShell, BottomNav } from '../components/AppShell'
import { resolveChildTask } from '../lib/resolveTask'
import { generateRoutinePdf } from '../lib/pdfGenerator'
import type { PeriodOfDay, Weekday } from '../types'
import { PERIODS, PERIOD_LABELS, WEEKDAYS, WEEKDAY_LABELS } from '../types'

const PERIOD_STYLE: Record<PeriodOfDay, { bg: string; emoji: string }> = {
  manha: { bg: 'bg-sunshine/30', emoji: '🌤️' },
  tarde: { bg: 'bg-sky/20', emoji: '☀️' },
  noite: { bg: 'bg-lilac/20', emoji: '🌙' },
}

export default function RoutinePreview() {
  const { childId } = useParams<{ childId: string }>()
  const navigate = useNavigate()
  const child = useAppStore((s) => (childId ? s.children[childId] : undefined))
  const routines = useAppStore((s) => s.routines)
  const weeklyTasks = useAppStore((s) => s.weeklyTasks)
  const childTasks = useAppStore((s) => s.childTasks)
  const customTasks = useAppStore((s) => s.customTasks)
  const addGeneratedPdf = useAppStore((s) => s.addGeneratedPdf)
  const show = useToastStore((s) => s.show)
  const [day, setDay] = useState<Weekday>('seg')
  const [generating, setGenerating] = useState(false)

  if (!child || !childId) return null

  const routine = routines[`${childId}__${day}`]
  const weeklyForChild = Object.values(weeklyTasks).filter((w) => w.childId === childId)

  function handleGenerate() {
    if (!routine) return
    setGenerating(true)
    setTimeout(() => {
      const doc = generateRoutinePdf({ child: child!, day, routine, weeklyTasks: weeklyForChild, childTasks, customTasks })
      const dataUrl = doc.output('datauristring')
      addGeneratedPdf(childId!, 'rotina', dataUrl, routine.version)
      setGenerating(false)
      show('PDF gerado com sucesso!')
      navigate(`/crianca/${childId}/rotina/pdf`)
    }, 350)
  }

  return (
    <AppShell title="Prévia da rotina" onBack={() => navigate(`/crianca/${childId}/rotina`)}>
      <div className="flex flex-col gap-4 pt-2">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 no-scrollbar">
          {WEEKDAYS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDay(d)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                day === d ? 'bg-primary text-white' : 'bg-white text-ink-soft'
              }`}
            >
              {WEEKDAY_LABELS[d].slice(0, 3).toUpperCase()}
            </button>
          ))}
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center gap-3 bg-gradient-to-r from-sunshine/30 to-coral/10 p-4">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white text-2xl">
              {child.photo ? <img src={child.photo} alt="" className="h-full w-full object-cover" /> : '🧒'}
            </div>
            <div>
              <p className="font-display text-lg font-extrabold text-ink">Minha rotina</p>
              <p className="font-display text-base font-bold text-coral-dark">
                {child.name?.toUpperCase()} • {WEEKDAY_LABELS[day]}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
            {PERIODS.map((period) => (
              <div key={period} className={`rounded-2xl p-3 ${PERIOD_STYLE[period].bg}`}>
                <p className="mb-2 font-display text-sm font-bold text-ink">
                  {PERIOD_STYLE[period].emoji} {PERIOD_LABELS[period]}
                </p>
                <div className="flex flex-col gap-2">
                  {(routine?.periods[period] ?? []).length === 0 && (
                    <p className="text-xs text-ink-soft/70">Nenhuma tarefa</p>
                  )}
                  {(routine?.periods[period] ?? []).map((item) => {
                    const ct = childTasks[item.childTaskId]
                    const resolved = ct ? resolveChildTask(ct, customTasks) : null
                    if (!resolved) return null
                    return (
                      <div key={item.id} className="flex items-center gap-2 rounded-xl bg-white/80 px-2 py-1.5">
                        <span className="text-lg">{resolved.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-ink">{resolved.name}</p>
                          {item.time && <p className="text-[10px] text-ink-soft">{item.time}</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-line bg-mint/10 p-4">
            <p className="mb-2 font-display text-sm font-bold text-ink">Tarefas da semana</p>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 no-scrollbar">
              {WEEKDAYS.map((d) => {
                const items = weeklyForChild.filter((w) => w.day === d)
                return (
                  <div key={d} className={`w-20 shrink-0 rounded-xl p-2 text-center ${d === day ? 'bg-primary/10' : 'bg-white/70'}`}>
                    <p className="text-[10px] font-bold text-ink-soft">{WEEKDAY_LABELS[d].slice(0, 3).toUpperCase()}</p>
                    {items.length === 0 ? (
                      <p className="mt-1 text-[10px] text-ink-soft/50">—</p>
                    ) : (
                      items.slice(0, 3).map((w) => {
                        const ct = childTasks[w.childTaskId]
                        const resolved = ct ? resolveChildTask(ct, customTasks) : null
                        return (
                          <p key={w.id} className="mt-1 truncate text-[10px] font-semibold text-ink">
                            {resolved?.icon} {resolved?.name}
                          </p>
                        )
                      })
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(`/crianca/${childId}/rotina`)}
            className="flex-1 rounded-2xl border-2 border-line bg-white py-3.5 font-display text-sm font-bold text-ink-soft active:scale-95"
          >
            Editar rotina
          </button>
          <button
            type="button"
            disabled={generating}
            onClick={handleGenerate}
            className="flex-1 rounded-2xl bg-primary py-3.5 font-display text-sm font-bold text-white shadow-md shadow-primary/30 active:scale-95 disabled:opacity-60"
          >
            {generating ? 'Gerando...' : 'Gerar PDF'}
          </button>
        </div>
      </div>
      <BottomNav childId={childId} />
    </AppShell>
  )
}
