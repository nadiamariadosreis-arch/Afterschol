import type { Room, RoutineResult as RoutineResultType } from "../types";
import { TaskCard } from "./TaskCard";

interface Props {
  routine: RoutineResultType | null;
  completedToday: Set<string>;
  onComplete: (id: string) => void;
  rooms: Room[];
}

export function RoutineResult({ routine, completedToday, onComplete, rooms }: Props) {
  if (!routine) return null;

  if (routine.selected.length === 0) {
    return (
      <section className="rounded-3xl bg-white border border-cream-soft p-6 sm:p-8 text-center">
        <p className="text-ink-soft">
          Com esse tempinho ainda não dá para encaixar nenhuma tarefa. Que tal aproveitar para
          descansar? 💛
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-white border border-cream-soft p-6 sm:p-8">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2 className="text-xl font-extrabold text-ink">Sua rotina de agora</h2>
        <p className="text-sm text-ink-soft">
          {routine.totalMinutes} de {routine.freeTimeMinutes} min usados
          {routine.leftoverMinutes > 0 ? ` · ${routine.leftoverMinutes} min sobrando` : ""}
        </p>
      </div>

      <ul className="mt-5 flex flex-col gap-3">
        {routine.selected.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            completed={completedToday.has(task.id)}
            onComplete={onComplete}
            roomName={rooms.find((r) => r.id === task.roomId)?.name}
          />
        ))}
      </ul>
    </section>
  );
}
