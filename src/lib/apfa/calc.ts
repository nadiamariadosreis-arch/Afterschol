import {
  PERCENTUAL_IDEAL,
  PROCESSO_ORDER,
  type AvaliarData,
  type Cycle,
  type ExecucaoItem,
  type PlanejarData,
  type ProcessoKey,
} from "./types";
import { MESES_LABEL } from "./processos";

/** Data intelligence: returns the cycle (year, month) the platform is currently on. */
export function currentCycleDate(now: Date = new Date()): { year: number; month: number } {
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function cycleLabel(year: number, month: number): string {
  return `${MESES_LABEL[month - 1]} de ${year}`;
}

export function pilarStatus(cycle: Cycle) {
  return {
    avaliar: Boolean(cycle.avaliar?.completed_at),
    planejar: Boolean(cycle.planejar?.completed_at),
    fazer_acontecer: Boolean(cycle.fazer_acontecer?.completed_at),
    acompanhar: Boolean(cycle.acompanhar?.completed_at),
  };
}

export function cycleProgress(cycle: Cycle): number {
  const status = pilarStatus(cycle);
  const done = Object.values(status).filter(Boolean).length;
  return Math.round((done / 4) * 100);
}

/** Real monthly spend per processo, from the Avaliar checklist (annual items divided by 12). */
export function rendaRealPorProcesso(avaliar: AvaliarData | null): Record<ProcessoKey, number> {
  const totals: Record<ProcessoKey, number> = {
    essencial: 0,
    compromissos: 0,
    futuro: 0,
    presente: 0,
  };
  if (!avaliar) return totals;

  for (const item of [...avaliar.contas_fixas, ...avaliar.gastos_variaveis, ...avaliar.parcelas]) {
    totals[item.processo] += item.valor;
  }
  for (const item of avaliar.gastos_anuais) {
    totals[item.processo] += item.valor / 12;
  }
  return totals;
}

export function totalRendaReal(avaliar: AvaliarData | null): number {
  const totals = rendaRealPorProcesso(avaliar);
  return PROCESSO_ORDER.reduce((sum, key) => sum + totals[key], 0);
}

export type ResumoCategoria = { nome: string; valor: number };

/** Soma de cada grupo do checklist do Avaliar — não item a item, só o total de cada "coisa". */
export function resumoPorCategoria(avaliar: AvaliarData | null): ResumoCategoria[] {
  if (!avaliar) return [];
  const soma = (itens: { valor: number }[]) => itens.reduce((sum, i) => sum + i.valor, 0);
  return [
    { nome: "Contas fixas", valor: soma(avaliar.contas_fixas) },
    { nome: "Gastos variáveis", valor: soma(avaliar.gastos_variaveis) },
    { nome: "Parcelas", valor: soma(avaliar.parcelas) },
    { nome: "Gastos anuais (rateado por mês)", valor: soma(avaliar.gastos_anuais) / 12 },
  ];
}

export type ComparativoLinha = {
  processo: ProcessoKey;
  idealPct: number;
  idealValor: number;
  realValor: number;
  realPct: number;
  diferencaPct: number;
};

/**
 * Derives the Fazer Acontecer checklist from what was decided in Planejar —
 * one execution item per dívida ativa, item do mês, and fatura de cartão.
 */
export function gerarItensExecucao(planejar: PlanejarData | null): ExecucaoItem[] {
  if (!planejar) return [];
  const itens: ExecucaoItem[] = [];

  for (const d of planejar.dividas) {
    if (d.quitada) continue;
    itens.push({
      id: `divida-${d.id}`,
      origem: "divida",
      descricao: `${d.nome}${d.origem_pagamento ? ` (${d.origem_pagamento})` : ""}`,
      valor: d.valor,
      executado: false,
      data: null,
    });
  }

  for (const m of planejar.organizacao_mes) {
    if (m.cortar) continue;
    itens.push({
      id: `mes-${m.id}`,
      origem: "mes",
      descricao: `${m.nome}${m.quem_paga ? ` — ${m.quem_paga}` : ""}`,
      valor: 0,
      executado: false,
      data: null,
    });
  }

  for (const c of planejar.cartao.cartoes) {
    itens.push({
      id: `cartao-${c.id}`,
      origem: "cartao",
      descricao: `Fatura ${c.nome || "cartão"}`,
      valor: c.valor_ultima_fatura,
      executado: false,
      data: null,
    });
  }

  return itens;
}

export function comparativo(
  percentuais: Record<ProcessoKey, number>,
  avaliar: AvaliarData | null,
): ComparativoLinha[] {
  const real = rendaRealPorProcesso(avaliar);
  const renda = avaliar?.renda_mensal ?? 0;

  return PROCESSO_ORDER.map((key) => {
    const idealPct = percentuais[key] ?? PERCENTUAL_IDEAL[key];
    const idealValor = (renda * idealPct) / 100;
    const realValor = real[key];
    const realPct = renda > 0 ? (realValor / renda) * 100 : 0;
    return {
      processo: key,
      idealPct,
      idealValor,
      realValor,
      realPct,
      diferencaPct: realPct - idealPct,
    };
  });
}
