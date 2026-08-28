import { useEffect, useState } from "react";
import type {
  ChallengeBaseline,
  ChallengeCategory,
  ChallengeCycle,
  ChallengeTask,
  Room,
  Task,
} from "../types";
import { todayISO } from "../lib/dates";
import { dailyFixedTasks } from "../data/dailyFixedTasks";
import { challengeCategoryMeta, daysToFrequency } from "../data/challengeCategories";
import { zoneTaskBanks } from "../data/zoneTaskBanks";
import { challengeWeekNumber, zoneRoomForWeek, zoneWeekNumber } from "../lib/zoneRotation";

const CYCLE_KEY = "rotina-mamae:desafio:cycle:v1";
const TASKS_KEY = "rotina-mamae:desafio:tasks:v1";
const BASELINE_KEY = "rotina-mamae:desafio:baseline:v1";
const FIXED_DONE_KEY = "rotina-mamae:desafio:fixeddone:v1";

const DEFAULT_BASELINE = dailyFixedTasks.reduce((sum, t) => sum + t.defaultMinutes, 0);

function newCycle(): ChallengeCycle {
  return { id: `cycle-${Date.now()}`, startDate: todayISO(), completedDays: [], zoneWeeksInjected: 0 };
}

function loadCycle(): ChallengeCycle {
  try {
    const raw = localStorage.getItem(CYCLE_KEY);
    if (!raw) return newCycle();
    const parsed = JSON.parse(raw) as ChallengeCycle;
    return { ...parsed, zoneWeeksInjected: parsed.zoneWeeksInjected ?? 0 };
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
 * Estado do Desafio de 21 dias, seguindo o método Casa em Ordem: semana 1 só
 * o mínimo viável, a partir da semana 2 uma zona (cômodo) nova entra a cada
 * 7 dias de uso, girando por 5 cômodos indefinidamente — o sistema continua
 * depois do dia 21, não é um ciclo que se repete do zero.
 *
 * `onGraduate` é chamado só quando uma tarefa cadastrada à mão (não vinda do
 * banco da zona, que já tem sua própria recorrência pela rotação) é
 * concluída pela primeira vez — cria uma manutenção recorrente via useTasks.
 */
export function useChallenge(
  onGraduate: (task: Omit<Task, "id" | "custom">) => void,
  rooms: Room[],
  today: string,
) {
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

  // O dia do desafio conta dias em que ela de fato usou o método, não dias
  // do calendário — pular um dia (ou uma semana) nunca "atrasa" nada, só
  // espera ela retomar. Ninguém compensa o que ficou pra trás.
  const completedCount = cycle.completedDays.length;
  const day = completedCount + (cycle.completedDays.includes(today) ? 0 : 1);
  const challengeCompleted = completedCount >= 21;

  const currentChallengeWeek = challengeWeekNumber(day);
  const currentZoneWeek = zoneWeekNumber(day);
  const currentZoneRoom = currentZoneWeek > 0 ? zoneRoomForWeek(currentZoneWeek, rooms) : null;

  const baselineMinutes = baseline.minutes ?? DEFAULT_BASELINE;
  const isCalibrated = baseline.minutes !== null;

  const pendingTasks = challengeTasks.filter((t) => t.cycleId === cycle.id && !t.doneAt);

  // Assim que uma nova semana de zona começa, injeta o banco de tarefas do
  // cômodo daquela semana na fila — a zona é um dos cômodos que ela mesma
  // cadastrou, na ordem em que cadastrou, girando entre eles. Sem nenhum
  // cômodo cadastrado ainda, não injeta nada — espera ela cadastrar um.
  //
  // Injeta em lote todas as semanas entre a última já injetada e a atual —
  // se ela ficar dias sem abrir o app e pular semanas inteiras, nenhuma
  // zona fica sem o banco dela, mesmo que já tenha passado.
  //
  // Usa updates funcionais e checa se as tarefas já existem antes de somar —
  // não pode confiar só nas dependências do efeito pra evitar duplicar,
  // porque o StrictMode do React roda efeitos duas vezes em desenvolvimento.
  useEffect(() => {
    const startWeek = (cycle.zoneWeeksInjected ?? 0) + 1;
    if (currentZoneWeek === 0 || startWeek > currentZoneWeek) return;

    // Descobre até onde dá pra injetar nessa passada — para no primeiro
    // ponto sem cômodo disponível, pra tentar de novo quando ela cadastrar
    // um (em vez de marcar como injetada uma semana que ficou sem nada).
    let lastReachable = cycle.zoneWeeksInjected ?? 0;
    const plan: { week: number; room: Room }[] = [];
    for (let week = startWeek; week <= currentZoneWeek; week++) {
      const room = zoneRoomForWeek(week, rooms);
      if (!room) break;
      plan.push({ week, room });
      lastReachable = week;
    }
    if (plan.length === 0) return;

    setChallengeTasks((prev) => {
      let next = prev;
      for (const { week, room } of plan) {
        const zoneId = `zone-${week}-`;
        if (next.some((t) => t.id.startsWith(zoneId))) continue;

        const bank = zoneTaskBanks[room.type];
        const newTasks: ChallengeTask[] = bank.map((zt) => ({
          id: `${zoneId}${zt.id}-${room.id}`,
          name: zt.name,
          roomId: room.id,
          estimatedMinutes: zt.minutes,
          source: "zone" as const,
          zoneType: room.type,
          cycleId: cycle.id,
          createdAt: today,
        }));
        next = [...next, ...newTasks];
      }
      return next;
    });

    setCycle((prev) =>
      lastReachable > (prev.zoneWeeksInjected ?? 0)
        ? { ...prev, zoneWeeksInjected: lastReachable }
        : prev,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentZoneWeek, cycle.zoneWeeksInjected, cycle.id, rooms]);

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
      source: "manual",
      ...input,
    };
    setChallengeTasks((prev) => [...prev, task]);
  }

  function removeChallengeTask(id: string) {
    setChallengeTasks((prev) => prev.filter((t) => t.id !== id));
  }

  /**
   * Marca como feita. Tarefas manuais graduam pra manutenção recorrente na
   * rotina normal (frequência prevista pelo tipo do item); tarefas da zona
   * não precisam — a própria rotação de 5 semanas já é a manutenção.
   */
  function completeChallengeTask(id: string) {
    const task = challengeTasks.find((t) => t.id === id);
    if (!task || task.doneAt) return;

    setChallengeTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, doneAt: today } : t)),
    );
    markDayCompleted();

    if (task.source === "manual" && task.category) {
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
  }

  return {
    today,
    cycle,
    day,
    challengeCompleted,
    currentChallengeWeek,
    currentZoneWeek,
    currentZoneRoom,
    baseline,
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
  };
}
