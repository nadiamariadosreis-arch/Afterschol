import { useState } from "react";
import type { Room, RoomType, Task } from "../../types";
import { useChallenge } from "../../hooks/useChallenge";
import { useDevClock } from "../../hooks/useDevClock";
import { DesafioCalibration } from "./DesafioCalibration";
import { DesafioFixedChecklist } from "./DesafioFixedChecklist";
import { DesafioTracker } from "./DesafioTracker";
import { DesafioWeekBrowser } from "./DesafioWeekBrowser";
import { DesafioDaily } from "./DesafioDaily";
import { DesafioTaskManager } from "./DesafioTaskManager";
import { DesafioCycleComplete } from "./DesafioCycleComplete";
import { DesafioDevClock } from "./DesafioDevClock";

interface Props {
  rooms: Room[];
  onGraduate: (task: Omit<Task, "id" | "custom">) => void;
  onAddRoom: (name: string, type: RoomType) => Room;
}

export function DesafioView({ rooms, onGraduate, onAddRoom }: Props) {
  const devClock = useDevClock();
  const {
    today,
    cycle,
    day,
    challengeCompleted,
    currentChallengeWeek,
    currentZoneWeek,
    currentZoneRoom,
    baselineMinutes,
    isCalibrated,
    stopwatch,
    startCalibration,
    finishCalibration,
    fixedDone,
    toggleFixedTask,
    challengeTasks,
    pendingTasks,
    addChallengeTask,
    removeChallengeTask,
    completeChallengeTask,
  } = useChallenge(onGraduate, rooms, devClock.today);

  const [viewedWeek, setViewedWeek] = useState(currentChallengeWeek);

  return (
    <div className="flex flex-col gap-6">
      <DesafioDevClock
        today={devClock.today}
        offsetDays={devClock.offsetDays}
        onAdvance={devClock.advanceDay}
        onRewind={devClock.rewindDay}
        onReset={devClock.resetToToday}
      />

      <DesafioTracker completedCount={cycle.completedDays.length} day={day} />

      {challengeCompleted && <DesafioCycleComplete />}

      <DesafioWeekBrowser
        currentWeek={currentChallengeWeek}
        completedCount={cycle.completedDays.length}
        rooms={rooms}
        challengeTasks={challengeTasks}
        viewedWeek={viewedWeek}
        onSelectWeek={setViewedWeek}
      />

      <p className="text-xs font-bold uppercase tracking-wide text-ink-soft text-center -mb-2">
        Hoje, dia {day}
      </p>

      {!isCalibrated ? (
        <DesafioCalibration
          running={stopwatch.running}
          startedAt={stopwatch.startedAt}
          onStart={startCalibration}
          onFinish={finishCalibration}
        />
      ) : (
        <DesafioFixedChecklist fixedDone={fixedDone} today={today} onToggle={toggleFixedTask} />
      )}

      {currentZoneWeek === 0 ? (
        <section className="rounded-3xl bg-white border border-cream-soft p-6 sm:p-8 text-center">
          <p className="text-ink-soft">
            Essa primeira semana é só o mínimo viável, todos os dias — sem se preocupar ainda com
            zona ou tempo disponível. A zona da semana entra sozinha a partir do dia 8.
          </p>
        </section>
      ) : !currentZoneRoom ? (
        <section className="rounded-3xl bg-white border border-cream-soft p-6 sm:p-8 text-center">
          <p className="text-ink-soft">
            A zona da semana gira pelos cômodos que você cadastrar — cadastre pelo menos um em
            "Minhas prioridades" (na aba Rotina do dia) pra ela entrar em cena.
          </p>
        </section>
      ) : (
        <DesafioDaily
          pendingTasks={pendingTasks}
          baselineMinutes={baselineMinutes}
          rooms={rooms}
          zoneRoom={currentZoneRoom}
          onComplete={completeChallengeTask}
        />
      )}

      <DesafioTaskManager
        tasks={pendingTasks}
        rooms={rooms}
        onAdd={addChallengeTask}
        onRemove={removeChallengeTask}
        onAddRoom={onAddRoom}
      />
    </div>
  );
}
