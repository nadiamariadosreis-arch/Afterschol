import { useMemo, useState } from "react";
import { Header } from "./components/Header";
import { TimeSelector } from "./components/TimeSelector";
import { RoutineResult } from "./components/RoutineResult";
import { StatsBar } from "./components/StatsBar";
import { TaskManager } from "./components/TaskManager";
import { RoutineProfile } from "./components/RoutineProfile";
import { DesafioView } from "./components/desafio/DesafioView";
import { useTasks } from "./hooks/useTasks";
import { useRooms } from "./hooks/useRooms";
import { useProfile } from "./hooks/useProfile";
import { generateRoutine } from "./lib/scheduler";
import { buildConcernBoosts } from "./lib/concerns";
import { todayDayOfWeek, todayISO } from "./lib/dates";
import { roomTaskTemplates } from "./data/roomTemplates";
import type { Energy, RoomType, RoutineResult as RoutineResultType } from "./types";

type Tab = "rotina" | "desafio";

export default function App() {
  const { tasks, markDone, markUndone, addTask, removeTask } = useTasks();
  const { rooms, addRoom, removeRoom } = useRooms();
  const { profile, toggleConcern, setCleaningDay, setCleaningDayMinutes } = useProfile();
  const [freeTime, setFreeTime] = useState(30);
  const [energy, setEnergy] = useState<Energy>("media");
  const [routine, setRoutine] = useState<RoutineResultType | null>(null);
  const [tab, setTab] = useState<Tab>("rotina");

  const today = todayISO();
  const completedToday = useMemo(
    () => new Set(tasks.filter((t) => t.lastDone === today).map((t) => t.id)),
    [tasks, today],
  );
  const boosts = useMemo(() => buildConcernBoosts(profile.concerns), [profile.concerns]);
  const isCleaningDayToday = profile.cleaningDay === todayDayOfWeek();

  function handleGenerate() {
    setRoutine(generateRoutine(tasks, freeTime, energy, boosts));
  }

  function handleComplete(id: string) {
    if (completedToday.has(id)) {
      markUndone(id);
    } else {
      markDone(id);
    }
  }

  function handleAddRoom(name: string, type: RoomType) {
    const room = addRoom(name, type);
    for (const template of roomTaskTemplates[type]) {
      addTask({ ...template, roomId: room.id });
    }
  }

  function handleRemoveRoom(id: string) {
    removeRoom(id);
    for (const task of tasks.filter((t) => t.roomId === id)) {
      removeTask(task.id);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <Header />

        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setTab("rotina")}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${
              tab === "rotina"
                ? "bg-terracotta-500 text-white"
                : "bg-cream-soft text-ink-soft hover:text-ink"
            }`}
          >
            🏡 Rotina do dia
          </button>
          <button
            type="button"
            onClick={() => setTab("desafio")}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${
              tab === "desafio"
                ? "bg-gold-600 text-white"
                : "bg-cream-soft text-ink-soft hover:text-ink"
            }`}
          >
            🔥 Desafio de 21 dias
          </button>
        </div>

        {tab === "rotina" ? (
          <>
            <div className="mt-6">
              <StatsBar tasks={tasks} boosts={boosts} />
            </div>

            <div className="mt-6 flex flex-col gap-6">
              <TimeSelector
                freeTime={freeTime}
                onFreeTimeChange={setFreeTime}
                energy={energy}
                onEnergyChange={setEnergy}
                onGenerate={handleGenerate}
                isCleaningDayToday={isCleaningDayToday}
                cleaningDayMinutes={profile.cleaningDayMinutes}
              />

              <RoutineResult
                routine={routine}
                completedToday={completedToday}
                onComplete={handleComplete}
                rooms={rooms}
              />

              <RoutineProfile
                profile={profile}
                onToggleConcern={toggleConcern}
                onSetCleaningDay={setCleaningDay}
                onSetCleaningDayMinutes={setCleaningDayMinutes}
                rooms={rooms}
                onAddRoom={handleAddRoom}
                onRemoveRoom={handleRemoveRoom}
              />

              <TaskManager tasks={tasks} rooms={rooms} onAdd={addTask} onRemove={removeTask} />
            </div>
          </>
        ) : (
          <div className="mt-6">
            <DesafioView rooms={rooms} onGraduate={addTask} />
          </div>
        )}

        <footer className="mt-10 text-center text-xs text-ink-soft">
          Feito com carinho para quem cuida de tudo. 💛
        </footer>
      </div>
    </div>
  );
}
