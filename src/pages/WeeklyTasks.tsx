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
import { EmptyState } from '../components/EmptyState'
import { Drag, Trash } from '../components/icons'
import { resolveChildTask } from '../lib/resolveTask'
import type { WeeklyTaskItem, Weekday } from '../types'
import { WEEKDAYS, WEEKDAY_LABELS } from '../types'

export default function WeeklyTasks() {
  const { childId } = useParams<{ childId: string }>()
  const navigate = useNavigate()
  const child = useAppStore((s) => (childId ? s.children[childId] : undefined))
  const weeklyTasks = useAppStore((s) => s.weeklyTasks)
  const addWeeklyTask = useAppStore((s) => s.addWeeklyTask)
  const reorderWeeklyDay = useAppStore((s) => s.reorderWeeklyDay)
  const copyWeeklyDay = useAppStore((s) => s.copyWeeklyDay)
  const show = useToastStore((s) => s.show)

  const [day, setDay] = useState<Weekday>('seg')
  const [addOpen, setAddOpen] = useState(false)
  const [copyOpen, setCopyOpen] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  if (!child || !childId) return null

  const dayItems = Object.values(weeklyTasks)
    .filter((w) => w.childId === childId && w.day === day)
    .sort((a, b) => a.order - b.order)

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = dayItems.findIndex((it) => it.id === active.id)
    const newIndex = dayItems.findIndex((it) => it.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(dayItems, oldIndex, newIndex)
    reorderWeeklyDay(childId!, day, reordered.map((it) => it.id))
  }

  return (
    <AppShell title="Tarefas da semana" onBack={() => navigate('/painel')}>
      <div className="flex flex-col gap-4 pt-2">
        <p className="text-sm text-ink-soft">
          Responsabilidades específicas de cada dia — elas não substituem a rotina básica de {child.name}.
        </p>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 no-scrollbar">
          {WEEKDAYS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDay(d)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                day === d ? 'bg-mint text-white' : 'bg-white text-ink-soft'
              }`}
            >
              {WEEKDAY_LABELS[d].slice(0, 3).toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex-1 rounded-2xl bg-mint py-3 text-sm font-bold text-white active:scale-95"
          >
            + Adicionar tarefa
          </button>
          <button
            type="button"
            onClick={() => setCopyOpen(true)}
            className="flex-1 rounded-2xl border-2 border-line bg-white py-3 text-sm font-bold text-ink-soft active:scale-95"
          >
            📋 Copiar dia
          </button>
        </div>

        {dayItems.length === 0 ? (
          <EmptyState emoji="📌" title={`Nenhuma tarefa para ${WEEKDAY_LABELS[day]}`} description="Adicione a primeira responsabilidade específica deste dia." />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={dayItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {dayItems.map((item) => (
                  <WeeklyRow key={item.id} item={item} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {addOpen && (
        <AddTaskSheet
          childId={childId}
          onClose={() => setAddOpen(false)}
          onPick={(childTaskId) => {
            addWeeklyTask(childId, day, childTaskId)
            show('Tarefa adicionada.')
            setAddOpen(false)
          }}
        />
      )}

      {copyOpen && (
        <CopyDaySheet
          fromDay={day}
          onClose={() => setCopyOpen(false)}
          onConfirm={(days) => {
            copyWeeklyDay(childId, day, days)
            show('Dia copiado com sucesso.')
            setCopyOpen(false)
          }}
        />
      )}

      <BottomNav childId={childId} />
    </AppShell>
  )
}

function WeeklyRow({ item }: { item: WeeklyTaskItem }) {
  const customTasks = useAppStore((s) => s.customTasks)
  const childTask = useAppStore((s) => s.childTasks[item.childTaskId])
  const updateWeeklyTask = useAppStore((s) => s.updateWeeklyTask)
  const removeWeeklyTask = useAppStore((s) => s.removeWeeklyTask)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  if (!childTask) return null
  const resolved = resolveChildTask(childTask, customTasks)
  if (!resolved) return null

  return (
    <div ref={setNodeRef} style={style} className="card flex items-center gap-2 px-2.5 py-2.5">
      <button {...attributes} {...listeners} className="cursor-grab touch-none text-ink-soft/50 active:cursor-grabbing">
        <Drag />
      </button>
      <span className="text-xl">{resolved.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-ink">{resolved.name}</p>
      </div>
      <input
        type="time"
        value={item.time ?? ''}
        onChange={(e) => updateWeeklyTask(item.id, { time: e.target.value })}
        className="rounded-lg border border-line bg-white px-1.5 py-1 text-xs"
      />
      <button
        type="button"
        onClick={() => updateWeeklyTask(item.id, { status: item.status === 'ativa' ? 'concluida' : 'ativa' })}
        className={`rounded-full px-2 py-1 text-xs font-bold ${item.status === 'concluida' ? 'bg-mint/20 text-mint' : 'bg-cloud text-ink-soft'}`}
      >
        {item.status === 'concluida' ? '✓' : '○'}
      </button>
      <button type="button" onClick={() => setConfirmOpen(true)} className="text-coral-dark/70">
        <Trash />
      </button>
      <ConfirmDialog
        open={confirmOpen}
        title="Remover esta tarefa da semana?"
        confirmLabel="Remover"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          removeWeeklyTask(item.id)
          setConfirmOpen(false)
        }}
      />
    </div>
  )
}
