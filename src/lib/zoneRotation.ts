import { ZONE_ROTATION } from "../data/zoneTaskBanks";
import type { RoomType } from "../types";

/**
 * Semana 1 do desafio (dias 1-7) é só o mínimo viável — nenhuma zona ainda.
 * A partir do dia 8, uma zona nova entra a cada 7 dias de uso, girando pela
 * rotação de 5 cômodos indefinidamente (o sistema continua depois do dia 21).
 */
export function zoneWeekNumber(day: number): number {
  if (day < 8) return 0;
  return Math.floor((day - 8) / 7) + 1;
}

export function zoneRoomTypeForWeek(weekNumber: number): RoomType {
  return ZONE_ROTATION[(weekNumber - 1) % ZONE_ROTATION.length];
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
