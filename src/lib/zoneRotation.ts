import { zoneTaskBanks } from "../data/zoneTaskBanks";
import type { Room } from "../types";

/** Semana 1 = dias 1-7, semana 2 = dias 8-14, e assim por diante, sem limite. */
export function challengeWeekNumber(day: number): number {
  return Math.floor((day - 1) / 7) + 1;
}

/**
 * Semana 1 do desafio é só o mínimo viável — nenhuma zona ainda. A partir
 * da semana 2, uma zona nova entra a cada semana, girando pela rotação
 * indefinidamente (o sistema continua depois do dia 21).
 */
export function zoneWeekNumber(day: number): number {
  const week = challengeWeekNumber(day);
  return week >= 2 ? week - 1 : 0;
}

/** Quantos dos 7 dias daquela semana do desafio já foram cumpridos. */
export function daysDoneInWeek(weekNumber: number, completedCount: number): number {
  return Math.min(Math.max(completedCount - 7 * (weekNumber - 1), 0), 7);
}

/**
 * A zona da semana é um dos cômodos que ela mesma cadastrou, na ordem em
 * que cadastrou — não uma lista fixa de tipos de cômodo. A rotina se
 * adapta à casa dela, e não o contrário. Cômodos do tipo "outro" ficam de
 * fora porque não têm banco de tarefas definido.
 */
export function zoneRoomForWeek(weekNumber: number, rooms: Room[]): Room | null {
  const eligible = rooms.filter((r) => zoneTaskBanks[r.type].length > 0);
  if (eligible.length === 0) return null;
  return eligible[(weekNumber - 1) % eligible.length];
}

export type ChallengePhase = "fundacao" | "ritmo" | "consolidacao" | "continuo";

export function challengePhase(day: number): ChallengePhase {
  return challengePhaseForWeek(challengeWeekNumber(day));
}

export function challengePhaseForWeek(weekNumber: number): ChallengePhase {
  if (weekNumber === 1) return "fundacao";
  if (weekNumber === 2) return "ritmo";
  if (weekNumber === 3) return "consolidacao";
  return "continuo";
}

export const phaseLabels: Record<ChallengePhase, { title: string; description: string }> = {
  fundacao: {
    title: "Fundação",
    description: "Só o mínimo viável, todos os dias. O objetivo não é perfeição, é repetição.",
  },
  ritmo: {
    title: "Ritmo",
    description: "O mínimo viável continua, e a primeira zona da semana entra em cena.",
  },
  consolidacao: {
    title: "Consolidação",
    description: "O sistema completo rodando — e espaço pra errar um dia sem culpa.",
  },
  continuo: {
    title: "Rotina",
    description: "O desafio virou hábito — o sistema continua, uma zona por semana.",
  },
};
