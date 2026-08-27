import { zoneTaskBanks } from "../data/zoneTaskBanks";
import type { Room } from "../types";

/**
 * Semana 1 do desafio (dias 1-7) é só o mínimo viável — nenhuma zona ainda.
 * A partir do dia 8, uma zona nova entra a cada 7 dias de uso, girando pela
 * rotação indefinidamente (o sistema continua depois do dia 21).
 */
export function zoneWeekNumber(day: number): number {
  if (day < 8) return 0;
  return Math.floor((day - 8) / 7) + 1;
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
  if (day <= 7) return "fundacao";
  if (day <= 14) return "ritmo";
  if (day <= 21) return "consolidacao";
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
