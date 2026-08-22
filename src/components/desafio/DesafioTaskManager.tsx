import { useState } from "react";
import type { ChallengeCategory, ChallengeTask, Room, RoomType } from "../../types";
import { challengeCategoryMeta } from "../../data/challengeCategories";
import { roomTypeMeta } from "../../data/roomTemplates";

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
  onAddRoom: (name: string, type: RoomType) => Room;
}

const NO_ROOM = "";
const NEW_ROOM = "__novo__";
const emptyForm = {
  name: "",
  category: "outro" as ChallengeCategory,
  estimatedMinutes: 20,
  roomId: NO_ROOM,
};
const emptyRoomForm = { name: "", type: "quarto" as RoomType };
const SEM_COMODO = "Sem cômodo";

export function DesafioTaskManager({ tasks, rooms, onAdd, onRemove, onAddRoom }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [addingRoom, setAddingRoom] = useState(false);
  const [roomForm, setRoomForm] = useState(emptyRoomForm);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onAdd({
      name: form.name.trim(),
      category: form.category,
      estimatedMinutes: form.estimatedMinutes,
      roomId: form.roomId || undefined,
    });
    setForm({ ...emptyForm, roomId: form.roomId });
  }

  function handleRoomSelect(value: string) {
    if (value === NEW_ROOM) {
      setAddingRoom(true);
      return;
    }
    setForm({ ...form, roomId: value });
  }

  function handleAddRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!roomForm.name.trim()) return;
    const room = onAddRoom(roomForm.name.trim(), roomForm.type);
    setForm({ ...form, roomId: room.id });
    setRoomForm(emptyRoomForm);
    setAddingRoom(false);
  }

  function roomName(id?: string) {
    return id ? rooms.find((r) => r.id === id)?.name : undefined;
  }

  // Agrupa a fila por cômodo — na mesma ordem em que os cômodos foram
  // cadastrados — pra ficar visualmente óbvio o que ainda falta em cada um.
  const groups = [
    ...rooms.map((room) => ({ room, tasks: tasks.filter((t) => t.roomId === room.id) })),
    {
      room: null,
      tasks: tasks.filter((t) => !t.roomId || !rooms.some((r) => r.id === t.roomId)),
    },
  ].filter((g) => g.tasks.length > 0);
  const showHeadings = groups.length > 1;

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
          onChange={(e) => handleRoomSelect(e.target.value)}
          className="px-3 py-2 rounded-xl border border-cream-soft bg-cream text-sm"
        >
          <option value={NO_ROOM}>{SEM_COMODO}</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
          <option value={NEW_ROOM}>+ Novo cômodo...</option>
        </select>
        <button
          type="submit"
          className="px-3 py-2 rounded-xl bg-gold-600 text-white text-sm font-bold hover:bg-gold-700"
        >
          + Adicionar
        </button>
      </form>

      {addingRoom && (
        <form
          onSubmit={handleAddRoom}
          className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-gold-200 bg-gold-50 p-3"
        >
          <span className="text-sm font-semibold text-gold-700">Novo cômodo:</span>
          <input
            type="text"
            autoFocus
            placeholder="Nome (ex: Quarto do João)"
            value={roomForm.name}
            onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
            className="flex-1 min-w-[9rem] px-3 py-2 rounded-xl border border-cream-soft bg-white text-sm outline-none focus:border-gold-300"
          />
          <select
            value={roomForm.type}
            onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value as RoomType })}
            className="px-3 py-2 rounded-xl border border-cream-soft bg-white text-sm"
          >
            {(Object.keys(roomTypeMeta) as RoomType[]).map((t) => (
              <option key={t} value={t}>
                {roomTypeMeta[t].emoji} {roomTypeMeta[t].label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-gold-600 text-white text-sm font-bold hover:bg-gold-700"
          >
            Adicionar cômodo
          </button>
          <button
            type="button"
            onClick={() => {
              setAddingRoom(false);
              setRoomForm(emptyRoomForm);
            }}
            className="px-2 py-2 text-sm text-ink-soft hover:text-ink"
          >
            cancelar
          </button>
        </form>
      )}

      <div className="mt-5 flex flex-col gap-4 max-h-96 overflow-y-auto pr-1">
        {groups.map((group) => (
          <div key={group.room?.id ?? "sem-comodo"}>
            {showHeadings && (
              <p className="text-xs font-bold text-ink-soft uppercase tracking-wide mb-1.5">
                {group.room ? `${roomTypeMeta[group.room.type].emoji} ${group.room.name}` : SEM_COMODO}
              </p>
            )}
            <ul className="flex flex-col gap-2">
              {group.tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl bg-cream text-sm"
                >
                  <span className="shrink-0">{challengeCategoryMeta[task.category].emoji}</span>
                  <span className="flex-1 min-w-0 truncate font-semibold text-ink">
                    {task.name}
                    {!showHeadings && roomName(task.roomId) && (
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
            </ul>
          </div>
        ))}
        {tasks.length === 0 && (
          <p className="text-ink-soft text-sm italic px-3 py-2">Nenhuma tarefa cadastrada ainda.</p>
        )}
      </div>
    </section>
  );
}
