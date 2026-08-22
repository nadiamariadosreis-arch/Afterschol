import type { Room, RoomType, Task } from "../../types";
import { useChallenge } from "../../hooks/useChallenge";
import { DesafioCalibration } from "./DesafioCalibration";
import { DesafioFixedChecklist } from "./DesafioFixedChecklist";
import { DesafioTracker } from "./DesafioTracker";
import { DesafioDaily } from "./DesafioDaily";
import { DesafioTaskManager } from "./DesafioTaskManager";
import { DesafioCycleComplete } from "./DesafioCycleComplete";

interface Props {
  rooms: Room[];
  onGraduate: (task: Omit<Task, "id" | "custom">) => void;
  onAddRoom: (name: string, type: RoomType) => Room;
}

export function DesafioView({ rooms, onGraduate, onAddRoom }: Props) {
  const {
    today,
    cycle,
    day,
    cycleFinished,
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
    startNewCycle,
  } = useChallenge(onGraduate);

  return (
    <div className="flex flex-col gap-6">
      <DesafioTracker startDate={cycle.startDate} completedDays={cycle.completedDays} day={day} />

      {cycleFinished && (
        <DesafioCycleComplete pendingCount={pendingTasks.length} onStartNewCycle={startNewCycle} />
      )}

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

      <DesafioDaily
        pendingTasks={pendingTasks}
        baselineMinutes={baselineMinutes}
        rooms={rooms}
        onComplete={completeChallengeTask}
      />

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
