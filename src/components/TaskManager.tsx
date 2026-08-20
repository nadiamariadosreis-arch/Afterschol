import { useState } from "react";
import type { Category, Energy, Frequency, Task } from "../types";
import { categoryMeta, energyMeta, frequencyMeta } from "../data/categories";

interface Props {
  tasks: Task[];
  onAdd: (task: Omit<Task, "id" | "custom">) => void;
  onRemove: (id: string) => void;
}

const emptyForm = {
  name: "",
  category: "organizacao" as Category,
  durationMin: 15,
  frequency: "semanal" as Frequency,
  priority: 2 as 1 | 2 | 3,
  energy: "media" as Energy,
};

export function TaskManager({ tasks, onAdd, onRemove }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onAdd({ ...form, name: form.name.trim() });
    setForm(emptyForm);
  }

  return (
    <section className="rounded-3xl bg-white border border-cream-soft p-6 sm:p-8">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left"
      >
        <h2 className="text-xl font-extrabold text-ink">Minhas tarefas ({tasks.length})</h2>
        <span className="text-ink-soft text-sm font-semibold">{open ? "fechar ▲" : "gerenciar ▼"}</span>
      </button>

      {open && (
        <div className="mt-5">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-6">
            <input
              type="text"
              placeholder="Nova tarefa..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="col-span-2 sm:col-span-2 px-3 py-2 rounded-xl border border-cream-soft bg-cream text-sm outline-none focus:border-terracotta-300"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
              className="px-3 py-2 rounded-xl border border-cream-soft bg-cream text-sm"
            >
              {(Object.keys(categoryMeta) as Category[]).map((c) => (
                <option key={c} value={c}>
                  {categoryMeta[c].emoji} {categoryMeta[c].label}
                </option>
              ))}
            </select>
            <select
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value as Frequency })}
              className="px-3 py-2 rounded-xl border border-cream-soft bg-cream text-sm"
            >
              {(Object.keys(frequencyMeta) as Frequency[]).map((f) => (
                <option key={f} value={f}>
                  {frequencyMeta[f]}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={5}
              step={5}
              value={form.durationMin}
              onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) || 5 })}
              className="px-3 py-2 rounded-xl border border-cream-soft bg-cream text-sm"
              aria-label="Duração em minutos"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-sage-500 text-white text-sm font-bold hover:bg-sage-600"
            >
              + Adicionar
            </button>
          </form>

          <ul className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-cream text-sm"
              >
                <span className="shrink-0">{categoryMeta[task.category].emoji}</span>
                <span className="flex-1 min-w-0 truncate font-semibold text-ink">{task.name}</span>
                <span className="text-ink-soft text-xs shrink-0">{frequencyMeta[task.frequency]}</span>
                <span className="text-ink-soft text-xs shrink-0">{task.durationMin} min</span>
                <span className="text-ink-soft text-xs shrink-0">{energyMeta[task.energy].emoji}</span>
                <button
                  type="button"
                  onClick={() => onRemove(task.id)}
                  aria-label={`Remover ${task.name}`}
                  className="shrink-0 text-terracotta-500 hover:text-terracotta-700 font-bold px-1"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
