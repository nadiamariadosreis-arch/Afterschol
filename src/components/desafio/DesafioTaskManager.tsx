import { useState } from "react";
import type { ChallengeCategory, ChallengeTask, Room } from "../../types";
import { challengeCategoryMeta } from "../../data/challengeCategories";

interface Props {
  tasks: ChallengeTask[];
  rooms: Room[];
  onAdd: (input: {
    name: string;
    roomId?: string;
    estimatedMinutes: number;
    category: ChallengeCategory;
  }) => void;
  onRemove: (id: string) => void;
}

const NO_ROOM = "";
const emptyForm = {
  name: "",
  category: "outro" as ChallengeCategory,
  estimatedMinutes: 20,
  roomId: NO_ROOM,
};

export function DesafioTaskManager({ tasks, rooms, onAdd, onRemove }: Props) {
  const [form, setForm] = useState(emptyForm);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onAdd({
      name: form.name.trim(),
      category: form.category,
      estimatedMinutes: form.estimatedMinutes,
      roomId: form.roomId || undefined,
    });
    setForm(emptyForm);
  }

  function roomName(id?: string) {
    return id ? rooms.find((r) => r.id === id)?.name : undefined;
  }

  return (
    <section className="rounded-3xl bg-white border border-cream-soft p-6 sm:p-8">
      <h2 className="text-xl font-extrabold text-ink">
        O que está te incomodando na casa? ({tasks.length})
      </h2>
      <p className="text-ink-soft text-sm mt-1">
        Cadastre cada coisa acumulada — o desafio vai encaixando aos poucos, no seu tempo.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-2 sm:grid-cols-6 gap-3">
        <input
          type="text"
          placeholder="Ex: gaveta de baixo do guarda-roupa"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="col-span-2 sm:col-span-2 px-3 py-2 rounded-xl border border-cream-soft bg-cream text-sm outline-none focus:border-terracotta-300"
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value as ChallengeCategory })}
          className="px-3 py-2 rounded-xl border border-cream-soft bg-cream text-sm"
        >
          {(Object.keys(challengeCategoryMeta) as ChallengeCategory[]).map((c) => (
            <option key={c} value={c}>
              {challengeCategoryMeta[c].emoji} {challengeCategoryMeta[c].label}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={5}
          step={5}
          value={form.estimatedMinutes}
          onChange={(e) => setForm({ ...form, estimatedMinutes: Number(e.target.value) || 5 })}
          className="px-3 py-2 rounded-xl border border-cream-soft bg-cream text-sm"
          aria-label="Tempo estimado em minutos"
          title="Quanto tempo você acha que essa tarefa leva"
        />
        <select
          value={form.roomId}
          onChange={(e) => setForm({ ...form, roomId: e.target.value })}
          className="px-3 py-2 rounded-xl border border-cream-soft bg-cream text-sm"
        >
          <option value={NO_ROOM}>Sem cômodo</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-3 py-2 rounded-xl bg-gold-600 text-white text-sm font-bold hover:bg-gold-700"
        >
          + Adicionar
        </button>
      </form>

      <ul className="mt-5 flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-cream text-sm">
            <span className="shrink-0">{challengeCategoryMeta[task.category].emoji}</span>
            <span className="flex-1 min-w-0 truncate font-semibold text-ink">
              {task.name}
              {roomName(task.roomId) && (
                <span className="ml-1 font-normal text-ink-soft">· {roomName(task.roomId)}</span>
              )}
            </span>
            <span className="text-ink-soft text-xs shrink-0">{task.estimatedMinutes} min</span>
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
        {tasks.length === 0 && (
          <li className="text-ink-soft text-sm italic px-3 py-2">Nenhuma tarefa cadastrada ainda.</li>
        )}
      </ul>
    </section>
  );
}
