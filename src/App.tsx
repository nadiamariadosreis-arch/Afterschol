import { useMemo, useState } from "react";
import { Header } from "./components/Header";
import { TimeSelector } from "./components/TimeSelector";
import { RoutineResult } from "./components/RoutineResult";
import { StatsBar } from "./components/StatsBar";
import { TaskManager } from "./components/TaskManager";
import { useTasks } from "./hooks/useTasks";
import { generateRoutine } from "./lib/scheduler";
import { todayISO } from "./lib/dates";
import type { Energy, RoutineResult as RoutineResultType } from "./types";

export default function App() {
  const { tasks, markDone, markUndone, addTask, removeTask } = useTasks();
  const [freeTime, setFreeTime] = useState(30);
  const [energy, setEnergy] = useState<Energy>("media");
  const [routine, setRoutine] = useState<RoutineResultType | null>(null);

  const today = todayISO();
  const completedToday = useMemo(
    () => new Set(tasks.filter((t) => t.lastDone === today).map((t) => t.id)),
    [tasks, today],
  );

  function handleGenerate() {
    setRoutine(generateRoutine(tasks, freeTime, energy));
  }

  function handleComplete(id: string) {
    if (completedToday.has(id)) {
      markUndone(id);
    } else {
      markDone(id);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <Header />

        <div className="mt-6">
          <StatsBar tasks={tasks} />
        </div>

        <div className="mt-6 flex flex-col gap-6">
          <TimeSelector
            freeTime={freeTime}
            onFreeTimeChange={setFreeTime}
            energy={energy}
            onEnergyChange={setEnergy}
            onGenerate={handleGenerate}
          />

          <RoutineResult routine={routine} completedToday={completedToday} onComplete={handleComplete} />

          <TaskManager tasks={tasks} onAdd={addTask} onRemove={removeTask} />
        </div>

        <footer className="mt-10 text-center text-xs text-ink-soft">
          Feito com carinho para quem cuida de tudo. 💛
        </footer>
      </div>
    </div>
  );
}
