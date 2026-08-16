export type ProcessoKey = "essencial" | "compromissos" | "futuro" | "presente";

export const PROCESSO_ORDER: ProcessoKey[] = ["essencial", "compromissos", "futuro", "presente"];

export const PERCENTUAL_IDEAL: Record<ProcessoKey, number> = {
  essencial: 60,
  compromissos: 10,
  futuro: 15,
  presente: 15,
};

export type ChecklistItem = {
  id: string;
  nome: string;
  processo: ProcessoKey;
  valor: number;
};

export type AvaliarData = {
  renda_mensal: number;
  contas_fixas: ChecklistItem[];
  gastos_variaveis: ChecklistItem[];
  parcelas: ChecklistItem[];
  gastos_anuais: ChecklistItem[];
  completed_at: string | null;
};

export type FormaPagamentoDivida = "parcelado" | "avista" | "";

export type Divida = {
  id: string;
  nome: string;
  valor: number;
  juros: number | null;
  urgencia: "alta" | "media" | "baixa";
  dolorosa: boolean;
  origem_pagamento: string;
  quitada: boolean;
  /** Conseguiu negociar o valor/condições dessa dívida com o credor? */
  negociada: "sim" | "nao" | "";
  forma_pagamento: FormaPagamentoDivida;
  /** Data combinada para o pagamento, se já definida. */
  data_pagamento: string;
  /** Só entra no checklist do Fazer Acontecer deste mês se a família marcar isso — muitas famílias
   * endividadas não vão pagar a dívida toda já no mês seguinte, ainda precisam negociar. */
  entra_fazer_acontecer: boolean;
  /** Valor que aparece no Fazer Acontecer — pode ser a parcela negociada, não o total da dívida. */
  valor_fazer_acontecer: number | null;
};

export type MeioPagamento = "cartao" | "dinheiro" | "pix" | "debito" | "transferencia";

export type ItemMes = {
  id: string;
  nome: string;
  processo: ProcessoKey;
  dia_pagamento: number | null;
  quem_paga: string;
  meio_pagamento: MeioPagamento;
  cortar: boolean;
  /** Só usado por itens que não vêm do Avaliar (ex: eventos especiais) — lá o valor já mora no checklist do Avaliar. */
  valor_estimado?: number;
};

export type EventoEspecial = {
  id: string;
  nome: string;
  data: string;
  valor_estimado: number;
};

/** Um gasto anotado num envelope (item da Organização do mês) durante o Acompanhar. */
export type LancamentoEnvelope = {
  id: string;
  /** Referencia o `id` de um `ItemMes` em `planejar.organizacao_mes`. */
  item_id: string;
  valor: number;
  data: string;
  descricao: string;
};

export type FaturaItem = {
  id: string;
  descricao: string;
  valor: number;
  tipo: "recorrente" | "unica";
  processo: ProcessoKey;
  manter: boolean;
};

export type CartaoItem = {
  id: string;
  nome: string;
  valor_ultima_fatura: number;
  itens: FaturaItem[];
  pdf_path: string | null;
  avaliacao: string;
};

export type PlanejarData = {
  reuniao: {
    dia: string;
    cadencia: "mensal" | "quinzenal" | "";
    responsaveis: string;
    proxima_data: string;
    eventos_especiais: EventoEspecial[];
  };
  dividas: Divida[];
  organizacao_mes: ItemMes[];
  cartao: {
    quantidade: number;
    cartoes: CartaoItem[];
  };
  completed_at: string | null;
};

export type ExecucaoItem = {
  id: string;
  origem: "divida" | "mes" | "cartao" | "reserva";
  descricao: string;
  valor: number;
  executado: boolean;
  data: string | null;
  /** Dia do mês (1-31) em que o item vence, usado para ordenar o checklist. Null quando não há vencimento definido (ex: fatura de cartão sem dia marcado). */
  dia_vencimento: number | null;
};

export type FazerAcontecerData = {
  reserva: {
    conta_destino: string;
    banco: string;
    guardado: boolean;
    data: string | null;
  };
  itens: ExecucaoItem[];
  /** Vira true assim que a família arrasta um item pra reordenar — a partir daí a ordem salva
   * é respeitada. Enquanto for false, o checklist sempre reordena pelo dia de vencimento. */
  ordem_manual: boolean;
  completed_at: string | null;
};

export type MotivoDesvio = "execucao" | "meta_irreal" | "";

export type DiagnosticoProcesso = {
  deu_certo: string;
  nao_deu_certo: string;
  motivo: MotivoDesvio;
  mudanca: string;
  novo_percentual: number | null;
};

export type AcompanharData = {
  por_processo: Record<ProcessoKey, DiagnosticoProcesso>;
  reserva_separada: "sim" | "nao" | "";
  cortes_feitos: string;
  imprevistos: string;
  proxima_reuniao_confirmada: "sim" | "nao" | "";
  /** Gastos anotados dia a dia nos envelopes do mês (Organização do mês do Planejar). */
  lancamentos: LancamentoEnvelope[];
  completed_at: string | null;
};

export type Cycle = {
  id: string;
  family_id: string;
  year: number;
  month: number;
  percentuais: Record<ProcessoKey, number>;
  avaliar: AvaliarData | null;
  planejar: PlanejarData | null;
  fazer_acontecer: FazerAcontecerData | null;
  acompanhar: AcompanharData | null;
  created_at: string;
  updated_at: string;
};

export function emptyAvaliar(): AvaliarData {
  return {
    renda_mensal: 0,
    contas_fixas: [],
    gastos_variaveis: [],
    parcelas: [],
    gastos_anuais: [],
    completed_at: null,
  };
}

export function emptyPlanejar(): PlanejarData {
  return {
    reuniao: { dia: "", cadencia: "", responsaveis: "", proxima_data: "", eventos_especiais: [] },
    dividas: [],
    organizacao_mes: [],
    cartao: { quantidade: 0, cartoes: [] },
    completed_at: null,
  };
}

export function emptyFazerAcontecer(): FazerAcontecerData {
  return {
    reserva: { conta_destino: "", banco: "", guardado: false, data: null },
    itens: [],
    ordem_manual: false,
    completed_at: null,
  };
}

export function emptyAcompanhar(): AcompanharData {
  const vazio: DiagnosticoProcesso = {
    deu_certo: "",
    nao_deu_certo: "",
    motivo: "",
    mudanca: "",
    novo_percentual: null,
  };
  return {
    por_processo: {
      essencial: { ...vazio },
      compromissos: { ...vazio },
      futuro: { ...vazio },
      presente: { ...vazio },
    },
    reserva_separada: "",
    cortes_feitos: "",
    imprevistos: "",
    proxima_reuniao_confirmada: "",
    lancamentos: [],
    completed_at: null,
  };
}
