import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { useToastStore } from '../store/useToastStore'
import { AppShell } from '../components/AppShell'
import type { PeriodOfDay, TaskCategory } from '../types'
import { PERIOD_LABELS } from '../types'

const ICON_OPTIONS = ['🐔', '🐶', '🐱', '🪴', '🧹', '🧺', '🥕', '🎨', '📚', '🧸', '🛏️', '🚲', '⭐', '💧', '🧽']

const CATEGORY_OPTIONS: { value: TaskCategory; label: string }[] = [
  { value: 'casa', label: 'Casa' },
  { value: 'animais', label: 'Animais' },
  { value: 'jardim', label: 'Jardim' },
  { value: 'higiene', label: 'Higiene' },
  { value: 'organizacao', label: 'Organização' },
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'estudos', label: 'Estudos' },
  { value: 'autocuidado', label: 'Autocuidado' },
  { value: 'social', label: 'Social' },
  { value: 'lazer', label: 'Lazer' },
  { value: 'outro', label: 'Outro' },
]

export default function CustomTaskCreate() {
  const { childId } = useParams<{ childId: string }>()
  const navigate = useNavigate()
  const addCustomTask = useAppStore((s) => s.addCustomTask)
  const linkCustomTaskToChild = useAppStore((s) => s.linkCustomTaskToChild)
  const show = useToastStore((s) => s.show)

  const [name, setName] = useState('')
  const [icon, setIcon] = useState(ICON_OPTIONS[0])
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<TaskCategory>('casa')
  const [location, setLocation] = useState('')
  const [duration, setDuration] = useState(10)
  const [periods, setPeriods] = useState<PeriodOfDay[]>(['manha'])
  const [howToTip, setHowToTip] = useState('')
  const [availableForRoutine, setAvailableForRoutine] = useState(true)
  const [availableForWeekly, setAvailableForWeekly] = useState(true)
  const [availableForSpecial, setAvailableForSpecial] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function togglePeriod(p: PeriodOfDay) {
    setPeriods((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))
  }

  function handleSave() {
    if (!name.trim()) return setError('Dê um nome para a tarefa.')
    const id = addCustomTask({
      childId: childId ?? null,
      name: name.trim(),
      description,
      category,
      icon,
      location,
      durationMinutes: duration,
      period: periods.length ? periods : ['manha'],
      frequencySuggestion: 'diaria',
      howToTip: howToTip || null,
      availableForRoutine,
      availableForWeekly,
      availableForSpecial,
    })
    if (childId) linkCustomTaskToChild(childId, id)
    show('Tarefa criada e salva na biblioteca da família.')
    navigate(childId ? `/crianca/${childId}/responsabilidades` : '/painel')
  }

  return (
    <AppShell title="Criar minha própria tarefa" onBack={() => navigate(-1)}>
      <div className="mx-auto flex max-w-sm flex-col gap-4 pt-2 pb-6">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-ink">Nome da tarefa</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Dar comida para as galinhas" />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-ink">Ícone</span>
          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setIcon(opt)}
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border-2 text-xl ${icon === opt ? 'border-primary bg-primary/10' : 'border-line bg-white'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-ink">Descrição (opcional)</span>
          <textarea className="input min-h-20 resize-none" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-ink">Categoria</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((opt) => (
              <button key={opt.value} type="button" onClick={() => setCategory(opt.value)} className={`chip ${category === opt.value ? 'chip-active' : ''}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-sm font-bold text-ink">Local</span>
            <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex: quintal" />
          </label>
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-sm font-bold text-ink">Duração (min)</span>
            <input className="input" type="number" min={1} value={duration} onChange={(e) => setDuration(Number(e.target.value) || 1)} />
          </label>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-ink">Momento do dia</span>
          <div className="flex gap-2">
            {(Object.keys(PERIOD_LABELS) as PeriodOfDay[]).map((p) => (
              <button key={p} type="button" onClick={() => togglePeriod(p)} className={`chip flex-1 justify-center ${periods.includes(p) ? 'chip-active' : ''}`}>
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-ink">Onde essa tarefa pode aparecer?</span>
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" className="h-4 w-4 accent-primary" checked={availableForRoutine} onChange={(e) => setAvailableForRoutine(e.target.checked)} />
            Rotina diária
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" className="h-4 w-4 accent-primary" checked={availableForWeekly} onChange={(e) => setAvailableForWeekly(e.target.checked)} />
            Tarefas da semana
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" className="h-4 w-4 accent-primary" checked={availableForSpecial} onChange={(e) => setAvailableForSpecial(e.target.checked)} />
            Rotinas especiais
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-ink">Dica para explicar à criança (opcional)</span>
          <textarea className="input min-h-16 resize-none" value={howToTip} onChange={(e) => setHowToTip(e.target.value)} />
        </label>

        {error && <p className="rounded-xl bg-coral/10 px-3 py-2 text-sm font-semibold text-coral-dark">{error}</p>}

        <button
          type="button"
          onClick={handleSave}
          className="rounded-2xl bg-primary py-4 font-display text-base font-bold text-white shadow-md shadow-primary/30 active:scale-[0.98]"
        >
          Salvar tarefa
        </button>
      </div>
    </AppShell>
  )
}
