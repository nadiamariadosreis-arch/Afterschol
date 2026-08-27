import type { Room, RoomType, Task } from "../../types";
import { useChallenge } from "../../hooks/useChallenge";
import { useDevClock } from "../../hooks/useDevClock";
import { DesafioCalibration } from "./DesafioCalibration";
import { DesafioFixedChecklist } from "./DesafioFixedChecklist";
import { DesafioTracker } from "./DesafioTracker";
import { DesafioPhaseStatus } from "./DesafioPhaseStatus";
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
    currentZoneWeek,
    currentZoneType,
    baselineMinutes,
    isCalibrated,
    stopwatch,
    startCalibration,
    finishCalibration,
    fixedDone,
    toggleFixedTask,
    pendingTasks,
    addChallengeTask,
    removeChallengeTask,
    completeChallengeTask,
  } = useChallenge(onGraduate, rooms, devClock.today);

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

      <DesafioPhaseStatus day={day} zoneType={currentZoneType} />

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
      ) : (
        <DesafioDaily
          pendingTasks={pendingTasks}
          baselineMinutes={baselineMinutes}
          rooms={rooms}
          zoneType={currentZoneType}
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
