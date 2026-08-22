import type { ChallengeCategory, Frequency } from "../types";

/**
 * maintenanceDays = de quanto em quanto tempo esse tipo de coisa volta a
 * precisar de atenção depois da primeira organizada — usado pra reintroduzir
 * a tarefa como manutenção recorrente na rotina normal.
 */
export const challengeCategoryMeta: Record<
  ChallengeCategory,
  { label: string; emoji: string; maintenanceDays: number }
> = {
  movel_grande: {
    label: "Móvel grande (guarda-roupa, armário, estante)",
    emoji: "🗄️",
    maintenanceDays: 60,
  },
  geladeira_despensa: {
    label: "Geladeira ou despensa",
    emoji: "🧊",
    maintenanceDays: 7,
  },
  gaveta_papelada: {
    label: "Gaveta ou papelada",
    emoji: "🗂️",
    maintenanceDays: 30,
  },
  area_externa: {
    label: "Área externa (quintal, garagem, varanda)",
    emoji: "🌿",
    maintenanceDays: 45,
  },
  outro: {
    label: "Outro",
    emoji: "📦",
    maintenanceDays: 30,
  },
};

/** Converte dias de manutenção pro Frequency mais próximo que o motor de rotina entende. */
export function daysToFrequency(days: number): Frequency {
  if (days <= 3) return "diaria";
  if (days <= 10) return "semanal";
  if (days <= 21) return "quinzenal";
  return "mensal";
}
