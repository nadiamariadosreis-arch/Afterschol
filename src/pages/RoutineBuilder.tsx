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
import { AppShell, BottomNav } from '../components/AppShell'
import { AddTaskSheet } from '../components/AddTaskSheet'
import { CopyDaySheet } from '../components/CopyDaySheet'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Drag, Plus, Trash } from '../components/icons'
import { resolveChildTask } from '../lib/resolveTask'
import type { PeriodOfDay, RoutineItem, Weekday } from '../types'
import { PERIODS, PERIOD_LABELS, WEEKDAYS, WEEKDAY_LABELS } from '../types'

const PERIOD_EMOJI: Record<PeriodOfDay, string> = { manha: '🌤️', tarde: '☀️', noite: '🌙' }

export default function RoutineBuilder() {
  const { childId } = useParams<{ childId: string }>()
  const navigate = useNavigate()
  const child = useAppStore((s) => (childId ? s.children[childId] : undefined))
  const routines = useAppStore((s) => s.routines)
  const getOrCreateRoutine = useAppStore((s) => s.getOrCreateRoutine)
  const copyRoutineDay = useAppStore((s) => s.copyRoutineDay)
  const show = useToastStore((s) => s.show)

  const [day, setDay] = useState<Weekday>('seg')
  const [addSheetPeriod, setAddSheetPeriod] = useState<PeriodOfDay | null>(null)
  const [copyOpen, setCopyOpen] = useState(false)

  if (!child || !childId) return null

  const routine = routines[`${childId}__${day}`] ?? getOrCreateRoutine(childId, day)

  return (
    <AppShell title="Montar rotina" onBack={() => navigate('/painel')}>
      <div className="flex flex-col gap-4 pt-2">
        <div className="card flex items-center gap-3 p-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lilac/20 text-2xl">
            {child.photo ? <img src={child.photo} alt="" className="h-12 w-12 rounded-full object-cover" /> : '🧒'}
          </div>
          <div>
            <p className="font-display font-bold text-ink">{child.name}</p>
            <p className="text-xs text-ink-soft">{child.age ? `${child.age} anos` : ''}</p>
          </div>
        </div>

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

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCopyOpen(true)}
            className="flex-1 rounded-2xl border-2 border-line bg-white py-2.5 text-sm font-bold text-ink-soft active:scale-95"
          >
            📋 Copiar dia
          </button>
          <button
            type="button"
            onClick={() => navigate(`/crianca/${childId}/rotina/preview`)}
            className="flex-1 rounded-2xl border-2 border-line bg-white py-2.5 text-sm font-bold text-ink-soft active:scale-95"
          >
            👁️ Ver prévia
          </button>
        </div>

        {PERIODS.map((period) => (
          <PeriodBlock
            key={period}
            childId={childId}
            day={day}
            period={period}
            items={routine.periods[period]}
            onAdd={() => setAddSheetPeriod(period)}
          />
        ))}

        <button
          type="button"
          onClick={() => {
            show('Rotina salva.')
            navigate(`/crianca/${childId}/rotina/preview`)
          }}
          className="rounded-2xl bg-ink py-4 font-display text-base font-bold text-white shadow-md active:scale-[0.98]"
        >
          Salvar rotina de {WEEKDAY_LABELS[day]}
        </button>
      </div>

      {addSheetPeriod && (
        <AddTaskSheet
          childId={childId}
          onClose={() => setAddSheetPeriod(null)}
          onPick={(childTaskId) => {
            useAppStore.getState().addRoutineItem(childId, day, addSheetPeriod, childTaskId)
            show('Tarefa adicionada.')
            setAddSheetPeriod(null)
          }}
        />
      )}

      {copyOpen && (
        <CopyDaySheet
          fromDay={day}
          onClose={() => setCopyOpen(false)}
          onConfirm={(days) => {
            copyRoutineDay(childId, day, days)
            show('Dia copiado com sucesso.')
            setCopyOpen(false)
          }}
        />
      )}

      <BottomNav childId={childId} />
    </AppShell>
  )
}

function PeriodBlock({
  childId,
  day,
  period,
  items,
  onAdd,
}: {
  childId: string
  day: Weekday
  period: PeriodOfDay
  items: RoutineItem[]
  onAdd: () => void
}) {
  const reorderRoutinePeriod = useAppStore((s) => s.reorderRoutinePeriod)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((it) => it.id === active.id)
    const newIndex = items.findIndex((it) => it.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(items, oldIndex, newIndex)
    reorderRoutinePeriod(childId, day, period, reordered.map((it) => it.id))
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
        <p className="rounded-2xl border-2 border-dashed border-line px-3 py-4 text-center text-xs text-ink-soft">
          Nenhuma tarefa ainda neste período.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <RoutineItemRow key={item.id} childId={childId} day={day} period={period} item={item} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

function RoutineItemRow({
  childId,
  day,
  period,
  item,
}: {
  childId: string
  day: Weekday
  period: PeriodOfDay
  item: RoutineItem
}) {
  const customTasks = useAppStore((s) => s.customTasks)
  const childTask = useAppStore((s) => s.childTasks[item.childTaskId])
  const updateRoutineItem = useAppStore((s) => s.updateRoutineItem)
  const removeRoutineItem = useAppStore((s) => s.removeRoutineItem)
  const moveRoutineItem = useAppStore((s) => s.moveRoutineItem)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [showTime, setShowTime] = useState(!!item.time)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  if (!childTask) return null
  const resolved = resolveChildTask(childTask, customTasks)
  if (!resolved) return null

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 rounded-2xl bg-cloud px-2.5 py-2">
      <button {...attributes} {...listeners} className="cursor-grab touch-none text-ink-soft/50 active:cursor-grabbing" aria-label="Arrastar">
        <Drag />
      </button>
      <span className="text-xl">{resolved.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-ink">{resolved.name}</p>
        {showTime && (
          <input
            type="time"
            value={item.time ?? ''}
            onChange={(e) => updateRoutineItem(childId, day, period, item.id, { time: e.target.value })}
            className="mt-0.5 rounded-lg border border-line bg-white px-1.5 py-0.5 text-xs"
          />
        )}
      </div>
      <select
        value={period}
        onChange={(e) => moveRoutineItem(childId, day, period, e.target.value as PeriodOfDay, item.id, 0)}
        className="rounded-lg border border-line bg-white px-1 py-1 text-xs text-ink-soft"
        aria-label="Mover para outro período"
      >
        {PERIODS.map((p) => (
          <option key={p} value={p}>
            {PERIOD_LABELS[p]}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => setShowTime((v) => !v)}
        className="rounded-lg px-1.5 py-1 text-xs font-bold text-ink-soft"
        title="Horário opcional"
      >
        🕒
      </button>
      <button type="button" onClick={() => setConfirmOpen(true)} className="text-coral-dark/70" aria-label="Remover tarefa">
        <Trash />
      </button>

      <ConfirmDialog
        open={confirmOpen}
        title="Remover esta tarefa da rotina?"
        confirmLabel="Remover"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          removeRoutineItem(childId, day, period, item.id)
          setConfirmOpen(false)
        }}
      />
    </div>
  )
}
