import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAppStore } from '../store/useAppStore'
import { useToastStore } from '../store/useToastStore'
import { AppShell } from '../components/AppShell'
import { AddTaskSheet } from '../components/AddTaskSheet'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Drag, Plus, Trash } from '../components/icons'
import { resolveChildTask } from '../lib/resolveTask'
import type { PeriodOfDay, RoutineItem } from '../types'
import { PERIODS, PERIOD_LABELS } from '../types'

const PERIOD_EMOJI: Record<PeriodOfDay, string> = { manha: '🌤️', tarde: '☀️', noite: '🌙' }

export default function SpecialRoutineEditor() {
  const { childId, specialId } = useParams<{ childId: string; specialId: string }>()
  const navigate = useNavigate()
  const routine = useAppStore((s) => (specialId ? s.specialRoutines[specialId] : undefined))
  const updateSpecialRoutine = useAppStore((s) => s.updateSpecialRoutine)
  const show = useToastStore((s) => s.show)
  const [addPeriod, setAddPeriod] = useState<PeriodOfDay | null>(null)

  if (!routine || !childId || !specialId) return null

  return (
    <AppShell title={routine.title} onBack={() => navigate(`/crianca/${childId}/especiais`)}>
      <div className="flex flex-col gap-4 pt-2">
        <div className="card flex flex-col gap-3 p-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold text-ink">Nome</span>
            <input className="input" value={routine.title} onChange={(e) => updateSpecialRoutine(specialId, { title: e.target.value })} />
          </label>
          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-sm font-bold text-ink">Data inicial</span>
              <input className="input" type="date" value={routine.startDate} onChange={(e) => updateSpecialRoutine(specialId, { startDate: e.target.value })} />
            </label>
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-sm font-bold text-ink">Data final</span>
              <input
                className="input"
                type="date"
                value={routine.endDate ?? ''}
                onChange={(e) => updateSpecialRoutine(specialId, { endDate: e.target.value || null })}
              />
            </label>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold text-ink">Observação</span>
            <textarea
              className="input min-h-16 resize-none"
              value={routine.description ?? ''}
              onChange={(e) => updateSpecialRoutine(specialId, { description: e.target.value })}
            />
          </label>
        </div>

        {PERIODS.map((period) => (
          <SpecialPeriodBlock key={period} specialId={specialId} period={period} items={routine.periods[period]} onAdd={() => setAddPeriod(period)} />
        ))}

        <button
          type="button"
          onClick={() => {
            updateSpecialRoutine(specialId, { status: 'ativa' })
            show('Rotina especial salva.')
            navigate(`/crianca/${childId}/especiais`)
          }}
          className="rounded-2xl bg-lilac py-4 font-display text-base font-bold text-white shadow-md active:scale-[0.98]"
        >
          Salvar rotina especial
        </button>
      </div>

      {addPeriod && (
        <AddTaskSheet
          childId={childId}
          onClose={() => setAddPeriod(null)}
          onPick={(childTaskId) => {
            useAppStore.getState().addSpecialRoutineItem(specialId, addPeriod, childTaskId)
            show('Tarefa adicionada.')
            setAddPeriod(null)
          }}
        />
      )}
    </AppShell>
  )
}

function SpecialPeriodBlock({
  specialId,
  period,
  items,
  onAdd,
}: {
  specialId: string
  period: PeriodOfDay
  items: RoutineItem[]
  onAdd: () => void
}) {
  const reorderSpecialRoutinePeriod = useAppStore((s) => s.reorderSpecialRoutinePeriod)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((it) => it.id === active.id)
    const newIndex = items.findIndex((it) => it.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(items, oldIndex, newIndex)
    reorderSpecialRoutinePeriod(specialId, period, reordered.map((it) => it.id))
  }

  return (
    <div className="card p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-display font-bold text-ink">
          {PERIOD_EMOJI[period]} {PERIOD_LABELS[period]}
        </p>
        <button type="button" onClick={onAdd} className="flex items-center gap-1 rounded-full bg-cloud px-3 py-1.5 text-xs font-bold text-ink-soft">
          <Plus /> Adicionar
        </button>
      </div>
      {items.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-line px-3 py-4 text-center text-xs text-ink-soft">Nenhuma tarefa ainda.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <SpecialItemRow key={item.id} specialId={specialId} period={period} item={item} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

function SpecialItemRow({ specialId, period, item }: { specialId: string; period: PeriodOfDay; item: RoutineItem }) {
  const customTasks = useAppStore((s) => s.customTasks)
  const childTask = useAppStore((s) => s.childTasks[item.childTaskId])
  const removeSpecialRoutineItem = useAppStore((s) => s.removeSpecialRoutineItem)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  if (!childTask) return null
  const resolved = resolveChildTask(childTask, customTasks)
  if (!resolved) return null

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 rounded-2xl bg-cloud px-2.5 py-2">
      <button {...attributes} {...listeners} className="cursor-grab touch-none text-ink-soft/50 active:cursor-grabbing">
        <Drag />
      </button>
      <span className="text-xl">{resolved.icon}</span>
      <p className="flex-1 truncate text-sm font-bold text-ink">{resolved.name}</p>
      <button type="button" onClick={() => setConfirmOpen(true)} className="text-coral-dark/70">
        <Trash />
      </button>
      <ConfirmDialog
        open={confirmOpen}
        title="Remover esta tarefa?"
        confirmLabel="Remover"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          removeSpecialRoutineItem(specialId, period, item.id)
          setConfirmOpen(false)
        }}
      />
    </div>
  )
}
