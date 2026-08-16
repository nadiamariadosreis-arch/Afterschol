import {
  PERCENTUAL_IDEAL,
  PROCESSO_ORDER,
  type AvaliarData,
  type Cycle,
  type EventoEspecial,
  type ExecucaoItem,
  type ItemMes,
  type LancamentoEnvelope,
  type MeioPagamento,
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
 * Semeia a Organização do mês a partir do que já foi preenchido no Avaliar
 * (contas fixas, gastos variáveis e parcelas) — assim a família não digita
 * o mesmo item duas vezes, só completa dia de pagamento, quem paga e o
 * meio. Gastos anuais ficam de fora por não serem um pagamento do mês.
 */
export function itensMesFromAvaliar(avaliar: AvaliarData | null): ItemMes[] {
  if (!avaliar) return [];
  const fonte = [...avaliar.contas_fixas, ...avaliar.gastos_variaveis, ...avaliar.parcelas];
  return fonte
    .filter((item) => item.nome.trim())
    .map((item) => ({
      id: `mes-avaliar-${item.id}`,
      nome: item.nome,
      processo: item.processo,
      dia_pagamento: null,
      quem_paga: "",
      meio_pagamento: "pix" as const,
      cortar: false,
    }));
}

/**
 * Mescla os itens do Avaliar na lista atual da Organização do mês, sem
 * duplicar (compara por nome, ignorando maiúsculas/espaços) e sem remover
 * ou alterar nada que a família já tenha preenchido ali.
 */
export function mesclarItensMesComAvaliar(itensAtuais: ItemMes[], avaliar: AvaliarData | null): ItemMes[] {
  const nomesExistentes = new Set(itensAtuais.map((i) => i.nome.trim().toLowerCase()).filter(Boolean));
  const faltando = itensMesFromAvaliar(avaliar).filter((i) => !nomesExistentes.has(i.nome.trim().toLowerCase()));
  return [...itensAtuais, ...faltando];
}

/**
 * Converte os eventos especiais definidos na parte técnica (aniversário,
 * festa, presente…) em itens da Organização do mês, já com o valor
 * estimado — diferente dos itens vindos do Avaliar, aqui o valor é
 * necessário porque essa despesa ainda não está em lugar nenhum.
 */
export function itensMesFromEventos(eventos: EventoEspecial[]): ItemMes[] {
  return eventos
    .filter((e) => e.nome.trim())
    .map((e) => ({
      id: `mes-evento-${e.id}`,
      nome: e.nome,
      processo: "presente" as const,
      dia_pagamento: null,
      quem_paga: "",
      meio_pagamento: "pix" as const,
      cortar: false,
      valor_estimado: e.valor_estimado,
    }));
}

export function mesclarItensMesComEventos(itensAtuais: ItemMes[], eventos: EventoEspecial[]): ItemMes[] {
  const nomesExistentes = new Set(itensAtuais.map((i) => i.nome.trim().toLowerCase()).filter(Boolean));
  const faltando = itensMesFromEventos(eventos).filter((i) => !nomesExistentes.has(i.nome.trim().toLowerCase()));
  return [...itensAtuais, ...faltando];
}

function diaDoMes(data: string): number | null {
  if (!data) return null;
  const dia = parseInt(data.slice(8, 10), 10);
  return Number.isFinite(dia) ? dia : null;
}

/**
 * Derives the Fazer Acontecer checklist from what was decided in Planejar —
 * um item de execução por dívida que a família marcou pra entrar este mês
 * (dívida ainda em negociação fica de fora), item do mês e fatura de
 * cartão — já ordenados pelo dia de vencimento (itens sem data definida
 * vão para o final).
 */
export function gerarItensExecucao(planejar: PlanejarData | null): ExecucaoItem[] {
  if (!planejar) return [];
  const itens: ExecucaoItem[] = [];

  for (const d of planejar.dividas) {
    if (d.quitada || !d.entra_fazer_acontecer) continue;
    itens.push({
      id: `divida-${d.id}`,
      origem: "divida",
      descricao: `${d.nome}${d.origem_pagamento ? ` (${d.origem_pagamento})` : ""}`,
      valor: d.valor_fazer_acontecer ?? d.valor,
      executado: false,
      data: null,
      dia_vencimento: diaDoMes(d.data_pagamento),
    });
  }

  for (const m of planejar.organizacao_mes) {
    if (m.cortar) continue;
    itens.push({
      id: `mes-${m.id}`,
      origem: "mes",
      descricao: `${m.nome}${m.quem_paga ? ` — ${m.quem_paga}` : ""}`,
      valor: m.valor_estimado ?? 0,
      executado: false,
      data: null,
      dia_vencimento: m.dia_pagamento,
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
      dia_vencimento: null,
    });
  }

  return itens.sort((a, b) => {
    if (a.dia_vencimento == null) return b.dia_vencimento == null ? 0 : 1;
    if (b.dia_vencimento == null) return -1;
    return a.dia_vencimento - b.dia_vencimento;
  });
}

/**
 * Recalcula o checklist do Fazer Acontecer a partir do Planejar mais
 * recente, preservando o que a família já fez ali (executado + data). Sem
 * isso, o checklist é gerado só uma vez e fica "preso" — se uma dívida for
 * desmarcada do Fazer Acontecer (ou uma conta do mês for cortada) depois
 * desse primeiro momento, ela continuaria aparecendo ali pra sempre.
 *
 * Enquanto a família não arrastou nada pra reordenar (`ordemManual` false),
 * a lista sempre volta a ficar ordenada pelo dia de vencimento — é o
 * padrão. A partir do primeiro arraste, a ordem salva passa a ser
 * respeitada: só remove o que não deve mais estar lá e acrescenta itens
 * novos no final (ordenados entre si por vencimento).
 */
export function reconciliarItensExecucao(
  itensAtuais: ExecucaoItem[],
  planejar: PlanejarData | null,
  ordemManual: boolean,
): ExecucaoItem[] {
  const gerados = gerarItensExecucao(planejar);
  const progresso = new Map(itensAtuais.map((i) => [i.id, i]));
  const comProgresso = (item: ExecucaoItem): ExecucaoItem => {
    const anterior = progresso.get(item.id);
    return anterior ? { ...item, executado: anterior.executado, data: anterior.data } : item;
  };

  if (!ordemManual) {
    return gerados.map(comProgresso);
  }

  const geradosPorId = new Map(gerados.map((i) => [i.id, i]));
  const mantidos = itensAtuais.filter((i) => geradosPorId.has(i.id)).map((i) => comProgresso(geradosPorId.get(i.id)!));
  const idsExistentes = new Set(mantidos.map((i) => i.id));
  const novos = gerados.filter((i) => !idsExistentes.has(i.id));

  return [...mantidos, ...novos];
}

export type Envelope = {
  id: string;
  nome: string;
  processo: ProcessoKey;
  diaPagamento: number | null;
  meioPagamento: MeioPagamento;
  orcado: number;
  gasto: number;
  disponivel: number;
};

/**
 * Valor orçado de um item da Organização do mês: usa `valor_estimado` quando
 * o item já tem um (eventos especiais, ou itens digitados manualmente); caso
 * contrário, busca o valor original no checklist do Avaliar — é de lá que
 * `itensMesFromAvaliar` gerou esse item.
 */
export function valorOrcadoItemMes(item: ItemMes, avaliar: AvaliarData | null): number {
  if (item.valor_estimado != null) return item.valor_estimado;
  const prefixo = "mes-avaliar-";
  if (!avaliar || !item.id.startsWith(prefixo)) return 0;
  const avaliarId = item.id.slice(prefixo.length);
  const todos = [...avaliar.contas_fixas, ...avaliar.gastos_variaveis, ...avaliar.parcelas];
  return todos.find((i) => i.id === avaliarId)?.valor ?? 0;
}

/**
 * Envelopes do mês: um por item da Organização do mês definida no Planejar,
 * com o quanto já foi gasto (soma dos lançamentos anotados no Acompanhar) e
 * o quanto ainda está disponível.
 */
export function gerarEnvelopes(
  planejar: PlanejarData | null,
  avaliar: AvaliarData | null,
  lancamentos: LancamentoEnvelope[],
): Envelope[] {
  if (!planejar) return [];
  return planejar.organizacao_mes.map((item) => {
    const orcado = valorOrcadoItemMes(item, avaliar);
    const gasto = lancamentos.filter((l) => l.item_id === item.id).reduce((sum, l) => sum + l.valor, 0);
    return {
      id: item.id,
      nome: item.nome,
      processo: item.processo,
      diaPagamento: item.dia_pagamento,
      meioPagamento: item.meio_pagamento,
      orcado,
      gasto,
      disponivel: orcado - gasto,
    };
  });
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
