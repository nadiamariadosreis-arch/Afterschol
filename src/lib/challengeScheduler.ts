import type { ChallengeTask } from "../types";

export interface ChallengeSuggestion {
  selected: ChallengeTask[];
  totalMinutes: number;
  leftoverMinutes: number;
}

const NO_ROOM_KEY = "__sem_comodo__";

/**
 * Sugere as tarefas do desafio pro tempo disponível hoje.
 *
 * Ao contrário do motor de rotina normal (que mistura tarefas de qualquer
 * cômodo pra maximizar urgência/tempo), aqui a regra é sempre terminar tudo
 * que couber do cômodo em andamento antes de pular pra outro — ex.: esvaziar
 * o guarda-roupa inteiro antes de começar a geladeira. Cada cômodo é
 * preenchido do menor tempo pro maior, pra caber o máximo de tarefas
 * possível antes de passar pro próximo.
 */
export function suggestDailyChallengeTasks(
  pending: ChallengeTask[],
  minutesAvailable: number,
): ChallengeSuggestion {
  const capacity = Math.max(0, Math.floor(minutesAvailable));
  if (capacity === 0 || pending.length === 0) {
    return { selected: [], totalMinutes: 0, leftoverMinutes: capacity };
  }

  const roomOrder: string[] = [];
  const byRoom = new Map<string, ChallengeTask[]>();
  for (const task of pending) {
    const key = task.roomId ?? NO_ROOM_KEY;
    if (!byRoom.has(key)) {
      byRoom.set(key, []);
      roomOrder.push(key);
    }
    byRoom.get(key)!.push(task);
  }

  const selected: ChallengeTask[] = [];
  let remaining = capacity;

  for (const roomKey of roomOrder) {
    if (remaining <= 0) break;
    const roomTasks = [...byRoom.get(roomKey)!].sort(
      (a, b) => a.estimatedMinutes - b.estimatedMinutes,
    );
    for (const task of roomTasks) {
      if (task.estimatedMinutes <= remaining) {
        selected.push(task);
        remaining -= task.estimatedMinutes;
      }
    }
  }

  return { selected, totalMinutes: capacity - remaining, leftoverMinutes: remaining };
}
