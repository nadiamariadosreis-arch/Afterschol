// Utilitários de data e cálculo do ciclo semanal do método.

const MS_DIA = 24 * 60 * 60 * 1000;

export function hojeISO(): string {
  return toISO(new Date());
}

export function toISO(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

function diasDesdeEpoch(iso: string): number {
  return Math.floor(new Date(`${iso}T00:00:00`).getTime() / MS_DIA);
}

/** Índice de semana global (muda a cada 7 dias corridos), usado pra girar o ciclo de zonas. */
export function indiceSemana(iso: string = hojeISO()): number {
  return Math.floor(diasDesdeEpoch(iso) / 7);
}

/** Retorna a semana do ciclo de 5 semanas (1 a 5) pra uma data. */
export function semanaDoCiclo(iso: string = hojeISO()): number {
  return (indiceSemana(iso) % 5) + 1;
}

/** Chave estável por semana corrida, usada pra guardar progresso da zona daquela semana. */
export function chaveSemana(iso: string = hojeISO()): string {
  return `sem-${indiceSemana(iso)}`;
}

/** Dia do plano de 21 dias (1-based) a partir de uma data de início. Retorna null se ainda não começou. */
export function diaDoPlano(inicioISO: string, iso: string = hojeISO()): number | null {
  const diff = diasDesdeEpoch(iso) - diasDesdeEpoch(inicioISO);
  if (diff < 0) return null;
  return diff + 1;
}

export function semanaDoPlano(dia: number): 1 | 2 | 3 | 4 {
  if (dia <= 7) return 1;
  if (dia <= 14) return 2;
  if (dia <= 21) return 3;
  return 4; // pós plano: manutenção
}

export function adicionarDias(iso: string, dias: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + dias);
  return toISO(d);
}

export function formatarDataLonga(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
}
