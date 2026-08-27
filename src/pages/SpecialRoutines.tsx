import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { useToastStore } from '../store/useToastStore'
import { AppShell, BottomNav } from '../components/AppShell'
import { EmptyState } from '../components/EmptyState'
import { ConfirmDialog } from '../components/ConfirmDialog'
import type { SpecialRoutineType } from '../types'

const TYPE_OPTIONS: { value: SpecialRoutineType; label: string; emoji: string }[] = [
  { value: 'medico', label: 'Consulta médica', emoji: '🩺' },
  { value: 'viagem', label: 'Viagem', emoji: '✈️' },
  { value: 'passeio', label: 'Passeio', emoji: '🚗' },
  { value: 'ferias', label: 'Férias', emoji: '🏖️' },
  { value: 'aniversario', label: 'Aniversário', emoji: '🎉' },
  { value: 'dia_sem_escola', label: 'Dia sem escola', emoji: '🏡' },
  { value: 'evento', label: 'Evento', emoji: '🎈' },
  { value: 'outro', label: 'Outro', emoji: '✨' },
]

export default function SpecialRoutines() {
  const { childId } = useParams<{ childId: string }>()
  const navigate = useNavigate()
  const child = useAppStore((s) => (childId ? s.children[childId] : undefined))
  const specialRoutines = useAppStore((s) => s.specialRoutines)
  const createSpecialRoutine = useAppStore((s) => s.createSpecialRoutine)
  const deleteSpecialRoutine = useAppStore((s) => s.deleteSpecialRoutine)
  const show = useToastStore((s) => s.show)

  const [creating, setCreating] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<SpecialRoutineType>('passeio')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [description, setDescription] = useState('')

  if (!child || !childId) return null

  const list = Object.values(specialRoutines).filter((r) => r.childId === childId)

  function handleCreate() {
    if (!title.trim() || !startDate) return
    const id = createSpecialRoutine({
      childId: childId!,
      title: title.trim(),
      description: description || null,
      type,
      startDate,
      endDate: endDate || null,
    })
    show('Rotina especial criada.')
    setCreating(false)
    setTitle('')
    setDescription('')
    setStartDate('')
    setEndDate('')
    navigate(`/crianca/${childId}/especiais/${id}`)
  }

  return (
    <AppShell title="Rotinas especiais" onBack={() => navigate('/painel')}>
      <div className="flex flex-col gap-4 pt-2">
        <p className="text-sm text-ink-soft">
          Para dias fora do comum — a rotina normal de {child.name} continua intacta.
        </p>

        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-2xl bg-lilac py-3.5 font-display text-sm font-bold text-white active:scale-95"
        >
          + Criar rotina especial
        </button>

        {list.length === 0 ? (
          <EmptyState emoji="✨" title="Nenhuma rotina especial ainda" description="Crie uma para consultas, viagens, passeios ou dias fora da rotina." />
        ) : (
          <div className="flex flex-col gap-2">
            {list.map((r) => {
              const typeInfo = TYPE_OPTIONS.find((t) => t.value === r.type)
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => navigate(`/crianca/${childId}/especiais/${r.id}`)}
                  className="card flex items-center gap-3 p-3.5 text-left active:scale-[0.99]"
                >
                  <span className="text-2xl">{typeInfo?.emoji ?? '✨'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-bold text-ink">{r.title}</p>
                    <p className="text-xs text-ink-soft">
                      {r.startDate}
                      {r.endDate ? ` a ${r.endDate}` : ''}
                    </p>
                  </div>
                  <span
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteId(r.id)
                    }}
                    className="rounded-full px-2 py-1 text-xs font-bold text-coral-dark/70"
                  >
                    Excluir
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {creating && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 md:items-center md:p-4" onClick={() => setCreating(false)}>
          <div className="w-full max-w-md rounded-t-3xl bg-white p-5 md:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <p className="mb-3 font-display text-lg font-bold text-ink">Nova rotina especial</p>
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-bold text-ink">Nome</span>
                <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Consulta médica" />
              </label>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-bold text-ink">Tipo</span>
                <div className="flex flex-wrap gap-2">
                  {TYPE_OPTIONS.map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setType(opt.value)} className={`chip ${type === opt.value ? 'chip-active' : ''}`}>
                      {opt.emoji} {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <label className="flex flex-1 flex-col gap-1.5">
                  <span className="text-sm font-bold text-ink">Data inicial</span>
                  <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </label>
                <label className="flex flex-1 flex-col gap-1.5">
                  <span className="text-sm font-bold text-ink">Data final (opcional)</span>
                  <input className="input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </label>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-bold text-ink">Observação (opcional)</span>
                <textarea className="input min-h-16 resize-none" value={description} onChange={(e) => setDescription(e.target.value)} />
              </label>
            </div>
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={() => setCreating(false)} className="flex-1 rounded-2xl border-2 border-line py-3 text-sm font-bold text-ink-soft">
                Cancelar
              </button>
              <button type="button" onClick={handleCreate} className="flex-1 rounded-2xl bg-lilac py-3 text-sm font-bold text-white">
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir esta rotina especial?"
        description="Essa ação não poderá ser desfeita."
        confirmLabel="Excluir"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteSpecialRoutine(deleteId)
          show('Rotina especial excluída.')
          setDeleteId(null)
        }}
      />

      <BottomNav childId={childId} />
    </AppShell>
  )
}
