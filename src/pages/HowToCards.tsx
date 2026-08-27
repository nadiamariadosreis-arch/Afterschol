import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { useToastStore } from '../store/useToastStore'
import { AppShell, BottomNav } from '../components/AppShell'
import { EmptyState } from '../components/EmptyState'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { AddTaskSheet } from '../components/AddTaskSheet'
import { resolveChildTask } from '../lib/resolveTask'

export default function HowToCards() {
  const { childId } = useParams<{ childId: string }>()
  const navigate = useNavigate()
  const child = useAppStore((s) => (childId ? s.children[childId] : undefined))
  const howToCards = useAppStore((s) => s.howToCards)
  const createHowToCard = useAppStore((s) => s.createHowToCard)
  const deleteHowToCard = useAppStore((s) => s.deleteHowToCard)
  const childTasks = useAppStore((s) => s.childTasks)
  const customTasks = useAppStore((s) => s.customTasks)
  const show = useToastStore((s) => s.show)

  const [pickerOpen, setPickerOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  if (!child || !childId) return null

  const cards = Object.values(howToCards).filter((c) => c.childId === childId)

  function handlePick(childTaskId: string) {
    const ct = childTasks[childTaskId]
    const resolved = ct ? resolveChildTask(ct, customTasks) : null
    if (!resolved) return
    const id = createHowToCard({
      childId,
      taskId: ct.taskId,
      customTaskId: ct.customTaskId,
      title: `Como fazer: ${resolved.name}`,
    })
    setPickerOpen(false)
    navigate(`/crianca/${childId}/como-fazer/${id}`)
  }

  return (
    <AppShell title="Como fazer" onBack={() => navigate('/painel')}>
      <div className="flex flex-col gap-4 pt-2">
        <p className="text-sm text-ink-soft">Crie um passo a passo visual para ensinar {child.name} a fazer uma tarefa sozinha.</p>

        <button type="button" onClick={() => setPickerOpen(true)} className="rounded-2xl bg-sky py-3.5 font-display text-sm font-bold text-white active:scale-95">
          + Criar novo card
        </button>

        {cards.length === 0 ? (
          <EmptyState emoji="📋" title="Você ainda não criou nenhum card Como fazer" description="Escolha uma tarefa para começar." />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {cards.map((card) => (
              <div key={card.id} className="card relative flex flex-col gap-1 p-3">
                <button type="button" onClick={() => navigate(`/crianca/${childId}/como-fazer/${card.id}`)} className="flex flex-1 flex-col items-start gap-1 text-left">
                  <span className="text-2xl">📋</span>
                  <span className="font-display text-sm font-bold leading-tight text-ink">{card.title}</span>
                  <span className="text-xs text-ink-soft">{card.steps.length} passo(s)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(card.id)}
                  className="absolute right-2 top-2 text-xs font-bold text-coral-dark/70"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {pickerOpen && <AddTaskSheet childId={childId} onClose={() => setPickerOpen(false)} onPick={handlePick} />}

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir este card?"
        description="Essa ação não poderá ser desfeita."
        confirmLabel="Excluir"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteHowToCard(deleteId)
          show('Card excluído.')
          setDeleteId(null)
        }}
      />

      <BottomNav childId={childId} />
    </AppShell>
  )
}
