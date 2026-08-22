import { useEffect, useState } from "react";
import type {
  ChallengeBaseline,
  ChallengeCategory,
  ChallengeCycle,
  ChallengeTask,
  Task,
} from "../types";
import { daysBetween, todayISO } from "../lib/dates";
import { dailyFixedTasks } from "../data/dailyFixedTasks";
import { challengeCategoryMeta, daysToFrequency } from "../data/challengeCategories";

const CYCLE_KEY = "rotina-mamae:desafio:cycle:v1";
const TASKS_KEY = "rotina-mamae:desafio:tasks:v1";
const BASELINE_KEY = "rotina-mamae:desafio:baseline:v1";
const FIXED_DONE_KEY = "rotina-mamae:desafio:fixeddone:v1";

const DEFAULT_BASELINE = dailyFixedTasks.reduce((sum, t) => sum + t.defaultMinutes, 0);

function newCycle(): ChallengeCycle {
  return { id: `cycle-${Date.now()}`, startDate: todayISO(), completedDays: [] };
}

function loadCycle(): ChallengeCycle {
  try {
    const raw = localStorage.getItem(CYCLE_KEY);
    return raw ? (JSON.parse(raw) as ChallengeCycle) : newCycle();
  } catch {
    return newCycle();
  }
}

function loadChallengeTasks(): ChallengeTask[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    return raw ? (JSON.parse(raw) as ChallengeTask[]) : [];
  } catch {
    return [];
  }
}

function loadBaseline(): ChallengeBaseline {
  try {
    const raw = localStorage.getItem(BASELINE_KEY);
    return raw ? (JSON.parse(raw) as ChallengeBaseline) : { minutes: null, calibratedAt: null };
  } catch {
    return { minutes: null, calibratedAt: null };
  }
}

function loadFixedDone(): Record<string, string> {
  try {
    const raw = localStorage.getItem(FIXED_DONE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

/**
 * Estado do Desafio de 21 dias. `onGraduate` é chamado quando uma tarefa do
 * desafio é concluída pela primeira vez — quem chama o hook decide o que
 * fazer com isso (aqui: criar uma tarefa recorrente de manutenção via
 * useTasks, mantendo os dois sistemas desacoplados).
 */
export function useChallenge(onGraduate: (task: Omit<Task, "id" | "custom">) => void) {
  const [cycle, setCycle] = useState<ChallengeCycle>(loadCycle);
  const [challengeTasks, setChallengeTasks] = useState<ChallengeTask[]>(loadChallengeTasks);
  const [baseline, setBaseline] = useState<ChallengeBaseline>(loadBaseline);
  const [fixedDone, setFixedDone] = useState<Record<string, string>>(loadFixedDone);
  const [stopwatch, setStopwatch] = useState<{ running: boolean; startedAt: number | null }>({
    running: false,
    startedAt: null,
  });

  useEffect(() => localStorage.setItem(CYCLE_KEY, JSON.stringify(cycle)), [cycle]);
  useEffect(() => localStorage.setItem(TASKS_KEY, JSON.stringify(challengeTasks)), [challengeTasks]);
  useEffect(() => localStorage.setItem(BASELINE_KEY, JSON.stringify(baseline)), [baseline]);
  useEffect(() => localStorage.setItem(FIXED_DONE_KEY, JSON.stringify(fixedDone)), [fixedDone]);

  const today = todayISO();
  const day = daysBetween(cycle.startDate, today) + 1;
  const cycleFinished = day > 21;

  const baselineMinutes = baseline.minutes ?? DEFAULT_BASELINE;
  const isCalibrated = baseline.minutes !== null;

  const pendingTasks = challengeTasks.filter((t) => t.cycleId === cycle.id && !t.doneAt);
  const doneTasksThisCycle = challengeTasks.filter((t) => t.cycleId === cycle.id && t.doneAt);

  function markDayCompleted() {
    setCycle((prev) =>
      prev.completedDays.includes(today)
        ? prev
        : { ...prev, completedDays: [...prev.completedDays, today] },
    );
  }

  function startCalibration() {
    setStopwatch({ running: true, startedAt: Date.now() });
  }

  function finishCalibration() {
    if (!stopwatch.startedAt) return;
    const elapsedMinutes = Math.max(1, Math.round((Date.now() - stopwatch.startedAt) / 60000));
    setBaseline({ minutes: elapsedMinutes, calibratedAt: today });
    setStopwatch({ running: false, startedAt: null });
    setFixedDone(() => {
      const next: Record<string, string> = {};
      for (const t of dailyFixedTasks) next[t.id] = today;
      return next;
    });
    markDayCompleted();
  }

  function toggleFixedTask(id: string) {
    setFixedDone((prev) => {
      const next = { ...prev };
      if (next[id] === today) {
        delete next[id];
      } else {
        next[id] = today;
      }
      return next;
    });
    markDayCompleted();
  }

  function addChallengeTask(input: {
    name: string;
    roomId?: string;
    estimatedMinutes: number;
    category: ChallengeCategory;
  }) {
    const task: ChallengeTask = {
      id: `desafio-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      cycleId: cycle.id,
      createdAt: today,
      ...input,
    };
    setChallengeTasks((prev) => [...prev, task]);
  }

  function removeChallengeTask(id: string) {
    setChallengeTasks((prev) => prev.filter((t) => t.id !== id));
  }

  /**
   * Marca como feita e, na primeira vez, "gradua" a tarefa: cria uma
   * recorrência de manutenção na rotina normal, com frequência prevista
   * pelo tipo do item (ex.: geladeira volta em 7 dias, guarda-roupa em 60).
   */
  function completeChallengeTask(id: string) {
    const task = challengeTasks.find((t) => t.id === id);
    if (!task || task.doneAt) return;

    setChallengeTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, doneAt: today } : t)),
    );
    markDayCompleted();

    const meta = challengeCategoryMeta[task.category];
    onGraduate({
      name: task.name,
      category: task.category === "geladeira_despensa" ? "cozinha" : "organizacao",
      durationMin: task.estimatedMinutes,
      frequency: daysToFrequency(meta.maintenanceDays),
      priority: 2,
      energy: "media",
      roomId: task.roomId,
    });
  }

  /** Tarefas que ficaram pendentes seguem pro novo ciclo — nada se perde. */
  function startNewCycle() {
    const fresh = newCycle();
    setChallengeTasks((prev) =>
      prev.map((t) => (t.cycleId === cycle.id && !t.doneAt ? { ...t, cycleId: fresh.id } : t)),
    );
    setCycle(fresh);
    setFixedDone({});
  }

  return {
    today,
    cycle,
    day,
    cycleFinished,
    baseline,
    baselineMinutes,
    isCalibrated,
    stopwatch,
    startCalibration,
    finishCalibration,
    fixedDone,
    toggleFixedTask,
    pendingTasks,
    doneTasksThisCycle,
    addChallengeTask,
    removeChallengeTask,
    completeChallengeTask,
    startNewCycle,
  };
}
