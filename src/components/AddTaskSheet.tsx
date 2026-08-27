import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { resolveChildTask } from '../lib/resolveTask'

export function AddTaskSheet({
  childId,
  onPick,
  onClose,
}: {
  childId: string
  onPick: (childTaskId: string) => void
  onClose: () => void
}) {
  const navigate = useNavigate()
  const customTasks = useAppStore((s) => s.customTasks)
  const childTasks = useAppStore((s) => s.childTasks)

  const available = Object.values(childTasks)
    .filter((ct) => ct.childId === childId)
    .map((ct) => ({ ct, resolved: resolveChildTask(ct, customTasks) }))
    .filter((x) => x.resolved)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 md:items-center md:p-4" onClick={onClose}>
      <div
        className="max-h-[75vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 md:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-lg font-bold text-ink">Adicionar tarefa</p>
          <button type="button" onClick={onClose} className="text-sm font-bold text-ink-soft">
            Fechar
          </button>
        </div>

        {available.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-soft">
            Você ainda não escolheu responsabilidades. Volte para a tela de responsabilidades ou crie uma tarefa própria.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {available.map(({ ct, resolved }) => (
              <button
                key={ct.id}
                type="button"
                onClick={() => onPick(ct.id)}
                className="card flex flex-col items-start gap-1 border-2 border-transparent p-3 text-left active:scale-95"
              >
                <span className="text-2xl">{resolved!.icon}</span>
                <span className="font-display text-sm font-bold text-ink">{resolved!.name}</span>
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate(`/crianca/${childId}/tarefa-propria`)}
          className="mt-4 w-full rounded-2xl border-2 border-dashed border-primary bg-primary/5 py-3 text-sm font-bold text-primary-dark"
        >
          + Criar uma nova tarefa
        </button>
      </div>
    </div>
  )
}
