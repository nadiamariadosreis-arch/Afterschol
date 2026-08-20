import type { Energy, RoutineResult, ScoredTask, Task } from "../types";
import { daysBetween, todayISO } from "./dates";
import type { ConcernBoostMap } from "./concerns";

const FREQUENCY_DAYS: Record<Task["frequency"], number> = {
  diaria: 1,
  semanal: 7,
  quinzenal: 14,
  mensal: 30,
};

/** Nunca feita antes: tratamos como "bem atrasada" (3x o ciclo) em vez de infinito. */
const NEVER_DONE_MULTIPLIER = 3;

const ENERGY_RANK: Record<Energy, number> = { baixa: 1, media: 2, alta: 3 };

// Espaçado (não linear) para que tarefas essenciais realmente se destaquem
// das importantes, em vez de se perderem em meio a várias tarefas menores.
const PRIORITY_WEIGHT: Record<Task["priority"], number> = { 1: 1, 2: 2, 3: 4 };

const EMPTY_BOOSTS: ConcernBoostMap = new Map();

function scoreTask(task: Task, today: string, boosts: ConcernBoostMap): ScoredTask {
  const boost = boosts.get(task.id);
  const boosted = boost !== undefined;
  const frequency = boost?.frequency ?? task.frequency;
  const priority = boost?.priority ?? task.priority;

  const cycleDays = FREQUENCY_DAYS[frequency];
  const daysSinceDone = task.lastDone
    ? Math.max(0, daysBetween(task.lastDone, today))
    : cycleDays * NEVER_DONE_MULTIPLIER;

  const urgencyRatio = daysSinceDone / cycleDays;
  // Urgência (capada para não deixar uma tarefa mensal esquecida dominar tudo)
  // combinada com a importância da tarefa.
  const urgency = Math.min(urgencyRatio, 4);
  const score = urgency * PRIORITY_WEIGHT[priority];

  let reason: string;
  if (!task.lastDone) {
    reason = "ainda não foi feita";
  } else if (urgencyRatio >= 1.5) {
    reason = `atrasada há ${daysSinceDone} dias`;
  } else if (urgencyRatio >= 1) {
    reason = "no ponto de fazer de novo";
  } else {
    reason = "em dia, ainda dá tempo";
  }
  if (boosted) {
    reason += " · prioridade que você marcou";
  }

  return { ...task, daysSinceDone, urgencyRatio, score, reason, boosted };
}

/** Calcula urgência/score de todas as tarefas, sem aplicar o limite de tempo. */
export function scoreTasks(tasks: Task[], boosts: ConcernBoostMap = EMPTY_BOOSTS): ScoredTask[] {
  const today = todayISO();
  return tasks.map((t) => scoreTask(t, today, boosts));
}

/**
 * Escolhe o melhor conjunto de tarefas que cabe no tempo livre informado,
 * priorizando o que está mais urgente/importante (knapsack 0/1 por minuto).
 * Tarefas com energia acima do nível informado são penalizadas, não excluídas
 * (uma tarefa "alta energia" ainda pode entrar se for muito urgente).
 */
export function generateRoutine(
  tasks: Task[],
  freeTimeMinutes: number,
  energyLevel: Energy,
  boosts: ConcernBoostMap = EMPTY_BOOSTS,
): RoutineResult {
  const today = todayISO();
  const capacity = Math.max(0, Math.floor(freeTimeMinutes));

  const scored = tasks
    .filter((t) => t.durationMin > 0 && t.durationMin <= capacity)
    .map((t) => scoreTask(t, today, boosts))
    .map((t) => {
      const energyGap = ENERGY_RANK[t.energy] - ENERGY_RANK[energyLevel];
      const penalty = energyGap > 0 ? 1 - energyGap * 0.2 : 1;
      return { ...t, score: t.score * Math.max(penalty, 0.3) };
    });

  if (scored.length === 0 || capacity === 0) {
    return { selected: [], totalMinutes: 0, freeTimeMinutes, leftoverMinutes: capacity };
  }

  // Knapsack 0/1: dp[w] = melhor score possível usando até w minutos.
  const SCORE_SCALE = 1000;
  const dp = new Array<number>(capacity + 1).fill(0);
  const keep: boolean[][] = scored.map(() => new Array<boolean>(capacity + 1).fill(false));

  scored.forEach((task, i) => {
    const weight = task.durationMin;
    const value = Math.round(task.score * SCORE_SCALE);
    for (let w = capacity; w >= weight; w--) {
      const candidate = dp[w - weight] + value;
      if (candidate > dp[w]) {
        dp[w] = candidate;
        keep[i][w] = true;
      }
    }
  });

  const selected: ScoredTask[] = [];
  let w = capacity;
  for (let i = scored.length - 1; i >= 0; i--) {
    if (keep[i][w]) {
      selected.push(scored[i]);
      w -= scored[i].durationMin;
    }
  }

  selected.sort((a, b) => b.score - a.score);
  const totalMinutes = selected.reduce((sum, t) => sum + t.durationMin, 0);

  return {
    selected,
    totalMinutes,
    freeTimeMinutes,
    leftoverMinutes: Math.max(0, capacity - totalMinutes),
  };
}
