import { useState } from 'react'
import type { Weekday } from '../types'
import { WEEKDAY_LABELS, WEEKDAYS } from '../types'

export function CopyDaySheet({
  fromDay,
  onConfirm,
  onClose,
}: {
  fromDay: Weekday
  onConfirm: (days: Weekday[]) => void
  onClose: () => void
}) {
  const [selected, setSelected] = useState<Weekday[]>([])

  function toggle(day: Weekday) {
    setSelected((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 md:items-center md:p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl bg-white p-5 md:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <p className="font-display text-lg font-bold text-ink">Copiar {WEEKDAY_LABELS[fromDay]} para...</p>
        <p className="mb-3 text-sm text-ink-soft">As cópias ficam independentes — alterar um dia não muda os outros.</p>
        <div className="flex flex-col gap-2">
          {WEEKDAYS.filter((d) => d !== fromDay).map((day) => (
            <label key={day} className="flex items-center gap-3 rounded-2xl border-2 border-line px-4 py-3">
              <input type="checkbox" className="h-5 w-5 accent-primary" checked={selected.includes(day)} onChange={() => toggle(day)} />
              <span className="font-semibold text-ink">{WEEKDAY_LABELS[day]}</span>
            </label>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-2xl border-2 border-line py-3 text-sm font-bold text-ink-soft">
            Cancelar
          </button>
          <button
            type="button"
            disabled={selected.length === 0}
            onClick={() => onConfirm(selected)}
            className="flex-1 rounded-2xl bg-primary py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            Copiar
          </button>
        </div>
      </div>
    </div>
  )
}
