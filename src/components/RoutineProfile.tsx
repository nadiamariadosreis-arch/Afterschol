import { useState } from "react";
import type { DayOfWeek, Room, RoomType, RoutineProfile as RoutineProfileType } from "../types";
import { accumulationConcerns } from "../data/accumulationConcerns";
import { daysOfWeekOrder, dayOfWeekMeta } from "../data/categories";
import { roomTypeMeta } from "../data/roomTemplates";

interface Props {
  profile: RoutineProfileType;
  onToggleConcern: (id: string) => void;
  onSetCleaningDay: (day: DayOfWeek | null) => void;
  onSetCleaningDayMinutes: (minutes: number) => void;
  rooms: Room[];
  onAddRoom: (name: string, type: RoomType) => void;
  onRemoveRoom: (id: string) => void;
}

export function RoutineProfile({
  profile,
  onToggleConcern,
  onSetCleaningDay,
  onSetCleaningDayMinutes,
  rooms,
  onAddRoom,
  onRemoveRoom,
}: Props) {
  const [open, setOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState<RoomType>("quarto");

  function handleAddRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!roomName.trim()) return;
    onAddRoom(roomName.trim(), roomType);
    setRoomName("");
  }

  return (
    <section className="rounded-3xl bg-white border border-cream-soft p-6 sm:p-8">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <h2 className="text-xl font-extrabold text-ink">Minhas prioridades</h2>
          <p className="text-sm text-ink-soft mt-0.5">
            Conte pra gente o que mais pesa na sua rotina — a IA ajusta as sugestões a partir disso.
          </p>
        </div>
        <span className="shrink-0 ml-3 text-ink-soft text-sm font-semibold">
          {open ? "fechar ▲" : "configurar ▼"}
        </span>
      </button>

      {open && (
        <div className="mt-6 flex flex-col gap-8">
          {/* O que acumula */}
          <div>
            <h3 className="text-sm font-bold text-ink-soft uppercase tracking-wide">
              O que costuma acumular na sua casa?
            </h3>
            <p className="text-xs text-ink-soft mt-1">
              Marque o que se aplica — a gente transforma isso em rotina diária pra não deixar acumular de novo.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {accumulationConcerns.map((concern) => {
                const active = profile.concerns.includes(concern.id);
                return (
                  <button
                    key={concern.id}
                    type="button"
                    onClick={() => onToggleConcern(concern.id)}
                    className={`px-3 py-2 rounded-full border text-sm font-semibold transition-colors ${
                      active
                        ? "bg-terracotta-500 text-white border-terracotta-500"
                        : "bg-cream-soft text-ink border-transparent hover:border-terracotta-200"
                    }`}
                  >
                    {concern.emoji} {concern.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dia de faxina */}
          <div>
            <h3 className="text-sm font-bold text-ink-soft uppercase tracking-wide">
              Você tem um dia de faxina?
            </h3>
            <p className="text-xs text-ink-soft mt-1">
              Nesse dia a gente sugere usar um tempo maior para as tarefas mais pesadas.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onSetCleaningDay(null)}
                className={`px-3 py-2 rounded-full border text-sm font-semibold transition-colors ${
                  profile.cleaningDay === null
                    ? "bg-ink text-white border-ink"
                    : "bg-cream-soft text-ink border-transparent hover:border-ink/20"
                }`}
              >
                Não tenho
              </button>
              {daysOfWeekOrder.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => onSetCleaningDay(day)}
                  className={`w-12 h-10 rounded-full border text-sm font-semibold transition-colors ${
                    profile.cleaningDay === day
                      ? "bg-sage-500 text-white border-sage-500"
                      : "bg-cream-soft text-ink border-transparent hover:border-sage-200"
                  }`}
                >
                  {dayOfWeekMeta[day]}
                </button>
              ))}
            </div>
            {profile.cleaningDay !== null && (
              <label className="mt-3 flex items-center gap-2 text-sm text-ink-soft">
                Quanto tempo você costuma ter nesse dia?
                <input
                  type="number"
                  min={15}
                  step={15}
                  value={profile.cleaningDayMinutes}
                  onChange={(e) => onSetCleaningDayMinutes(Math.max(15, Number(e.target.value) || 15))}
                  className="w-20 px-2 py-1 rounded-lg border border-cream-soft bg-cream text-sm font-semibold text-ink outline-none focus:border-terracotta-300"
                />
                min
              </label>
            )}
          </div>

          {/* Cômodos */}
          <div>
            <h3 className="text-sm font-bold text-ink-soft uppercase tracking-wide">Cômodos da casa</h3>
            <p className="text-xs text-ink-soft mt-1">
              Cadastre um cômodo e a gente já sugere tarefas dele. Tarefas específicas (tipo "organizar
              uma gaveta") você pode adicionar em "Minhas tarefas", associando ao cômodo.
            </p>

            <form onSubmit={handleAddRoom} className="mt-3 flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Nome do cômodo (ex: Quarto do João)"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="flex-1 min-w-[10rem] px-3 py-2 rounded-xl border border-cream-soft bg-cream text-sm outline-none focus:border-terracotta-300"
              />
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value as RoomType)}
                className="px-3 py-2 rounded-xl border border-cream-soft bg-cream text-sm"
              >
                {(Object.keys(roomTypeMeta) as RoomType[]).map((t) => (
                  <option key={t} value={t}>
                    {roomTypeMeta[t].emoji} {roomTypeMeta[t].label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-sage-500 text-white text-sm font-bold hover:bg-sage-600"
              >
                + Adicionar
              </button>
            </form>

            {rooms.length > 0 && (
              <ul className="mt-3 flex flex-col gap-2">
                {rooms.map((room) => (
                  <li
                    key={room.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl bg-cream text-sm"
                  >
                    <span>{roomTypeMeta[room.type].emoji}</span>
                    <span className="flex-1 min-w-0 truncate font-semibold text-ink">{room.name}</span>
                    <span className="text-ink-soft text-xs">{roomTypeMeta[room.type].label}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveRoom(room.id)}
                      aria-label={`Remover ${room.name}`}
                      className="shrink-0 text-terracotta-500 hover:text-terracotta-700 font-bold px-1"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
