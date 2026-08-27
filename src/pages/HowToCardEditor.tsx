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
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Drag, Trash } from '../components/icons'
import { generateHowToPdf, slugify } from '../lib/pdfGenerator'
import { getTaskById } from '../data/taskBank'
import type { HowToStep } from '../types'

export default function HowToCardEditor() {
  const { childId, cardId } = useParams<{ childId: string; cardId: string }>()
  const navigate = useNavigate()
  const card = useAppStore((s) => (cardId ? s.howToCards[cardId] : undefined))
  const child = useAppStore((s) => (childId ? s.children[childId] : undefined))
  const customTasks = useAppStore((s) => s.customTasks)
  const updateHowToCard = useAppStore((s) => s.updateHowToCard)
  const addHowToStep = useAppStore((s) => s.addHowToStep)
  const reorderHowToSteps = useAppStore((s) => s.reorderHowToSteps)
  const show = useToastStore((s) => s.show)
  const [newStepText, setNewStepText] = useState('')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  if (!card || !childId || !cardId || !child) return null

  const taskName = card.taskId ? getTaskById(card.taskId)?.name ?? card.title : card.customTaskId ? customTasks[card.customTaskId]?.name ?? card.title : card.title
  const taskCategory = card.taskId
    ? (getTaskById(card.taskId)?.category ?? 'outro')
    : card.customTaskId
      ? (customTasks[card.customTaskId]?.category ?? 'outro')
      : 'outro'

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const steps = [...card!.steps].sort((a, b) => a.order - b.order)
    const oldIndex = steps.findIndex((s) => s.id === active.id)
    const newIndex = steps.findIndex((s) => s.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    reorderHowToSteps(cardId!, arrayMove(steps, oldIndex, newIndex).map((s) => s.id))
  }

  function handleAddStep() {
    if (!newStepText.trim()) return
    addHowToStep(cardId!, newStepText.trim())
    setNewStepText('')
  }

  function handleGeneratePdf() {
    const doc = generateHowToPdf({ card: card!, taskName, childName: child!.name, category: taskCategory })
    const dataUrl = doc.output('datauristring')
    const filename = `Como-Fazer-${slugify(taskName)}-${slugify(child!.name)}.pdf`
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = filename
    a.click()
    show('PDF do card gerado.')
  }

  const steps = [...card.steps].sort((a, b) => a.order - b.order)

  return (
    <AppShell title="Como fazer" onBack={() => navigate(`/crianca/${childId}/como-fazer`)}>
      <div className="flex flex-col gap-4 pt-2 pb-6">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-ink">Título do card</span>
          <input className="input" value={card.title} onChange={(e) => updateHowToCard(cardId, { title: e.target.value })} />
        </label>

        <div>
          <p className="mb-2 font-display text-sm font-bold text-ink-soft">Passo a passo</p>
          {steps.length === 0 ? (
            <p className="rounded-2xl border-2 border-dashed border-line px-3 py-6 text-center text-sm text-ink-soft">Adicione o primeiro passo abaixo.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                  {steps.map((step, idx) => (
                    <StepRow key={step.id} cardId={cardId} step={step} index={idx + 1} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Descreva o próximo passo..."
            value={newStepText}
            onChange={(e) => setNewStepText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
          />
          <button type="button" onClick={handleAddStep} className="rounded-2xl bg-sky px-4 py-3 text-sm font-bold text-white active:scale-95">
            Adicionar
          </button>
        </div>

        <div className="card p-4">
          <p className="mb-3 font-display text-sm font-bold text-ink-soft">Prévia</p>
          <div className="rounded-2xl bg-lilac/10 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-lilac">Como fazer</p>
            <p className="font-display text-lg font-extrabold text-ink">{card.title}</p>
            <div className="mt-3 flex flex-col gap-2">
              {steps.map((step, idx) => (
                <div key={step.id} className="flex items-start gap-2 rounded-xl bg-white p-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{idx + 1}</span>
                  <p className="text-sm text-ink">{step.text}</p>
                </div>
              ))}
              {steps.length === 0 && <p className="text-sm text-ink-soft">Nenhum passo ainda.</p>}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            show('Card salvo.')
            navigate(`/crianca/${childId}/como-fazer`)
          }}
          className="rounded-2xl bg-ink py-4 font-display text-sm font-bold text-white active:scale-95"
        >
          Salvar card
        </button>
        <button
          type="button"
          onClick={handleGeneratePdf}
          className="rounded-2xl bg-sky py-4 font-display text-sm font-bold text-white shadow-md active:scale-95"
        >
          Gerar PDF do card
        </button>
      </div>
    </AppShell>
  )
}

function StepRow({ cardId, step, index }: { cardId: string; step: HowToStep; index: number }) {
  const updateHowToStep = useAppStore((s) => s.updateHowToStep)
  const removeHowToStep = useAppStore((s) => s.removeHowToStep)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="card flex items-center gap-2 p-2.5">
      <button {...attributes} {...listeners} className="cursor-grab touch-none text-ink-soft/50 active:cursor-grabbing">
        <Drag />
      </button>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary-dark">{index}</span>
      <input
        className="min-w-0 flex-1 rounded-xl border border-line bg-cloud px-2 py-1.5 text-sm"
        value={step.text}
        onChange={(e) => updateHowToStep(cardId, step.id, { text: e.target.value })}
      />
      <button type="button" onClick={() => setConfirmOpen(true)} className="text-coral-dark/70">
        <Trash />
      </button>
      <ConfirmDialog
        open={confirmOpen}
        title="Remover este passo?"
        confirmLabel="Remover"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          removeHowToStep(cardId, step.id)
          setConfirmOpen(false)
        }}
      />
    </div>
  )
}
