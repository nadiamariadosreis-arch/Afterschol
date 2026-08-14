import { z } from "zod";

const processoKey = z.enum(["essencial", "compromissos", "futuro", "presente"]);

const checklistItem = z.object({
  id: z.string(),
  nome: z.string().min(1),
  processo: processoKey,
  valor: z.number().nonnegative(),
});

export const percentuaisSchema = z.object({
  essencial: z.number().min(0).max(100),
  compromissos: z.number().min(0).max(100),
  futuro: z.number().min(0).max(100),
  presente: z.number().min(0).max(100),
});

export const avaliarSchema = z.object({
  renda_mensal: z.number().nonnegative(),
  contas_fixas: z.array(checklistItem),
  gastos_variaveis: z.array(checklistItem),
  parcelas: z.array(checklistItem),
  gastos_anuais: z.array(checklistItem),
  completed_at: z.string().nullable(),
});

const divida = z.object({
  id: z.string(),
  nome: z.string().min(1),
  valor: z.number().nonnegative(),
  juros: z.number().nullable(),
  urgencia: z.enum(["alta", "media", "baixa"]),
  dolorosa: z.boolean(),
  origem_pagamento: z.string(),
  quitada: z.boolean(),
});

const itemMes = z.object({
  id: z.string(),
  nome: z.string().min(1),
  processo: processoKey,
  dia_pagamento: z.number().nullable(),
  quem_paga: z.string(),
  meio_pagamento: z.enum(["cartao", "dinheiro", "pix", "debito", "transferencia"]),
  cortar: z.boolean(),
});

const faturaItem = z.object({
  id: z.string(),
  descricao: z.string().min(1),
  valor: z.number().nonnegative(),
  tipo: z.enum(["recorrente", "unica"]),
  processo: processoKey,
  manter: z.boolean(),
});

const cartaoItem = z.object({
  id: z.string(),
  nome: z.string().min(1),
  valor_ultima_fatura: z.number().nonnegative(),
  itens: z.array(faturaItem),
  pdf_path: z.string().nullable(),
  avaliacao: z.string(),
});

export const planejarSchema = z.object({
  reuniao: z.object({
    dia: z.string(),
    cadencia: z.enum(["mensal", "quinzenal", ""]),
    responsaveis: z.string(),
    proxima_data: z.string(),
  }),
  dividas: z.array(divida),
  organizacao_mes: z.array(itemMes),
  cartao: z.object({
    quantidade: z.number().nonnegative(),
    cartoes: z.array(cartaoItem),
  }),
  completed_at: z.string().nullable(),
});

const execucaoItem = z.object({
  id: z.string(),
  origem: z.enum(["divida", "mes", "cartao", "reserva"]),
  descricao: z.string(),
  valor: z.number().nonnegative(),
  executado: z.boolean(),
  data: z.string().nullable(),
});

export const fazerAcontecerSchema = z.object({
  reserva: z.object({
    conta_destino: z.string(),
    banco: z.string(),
    guardado: z.boolean(),
    data: z.string().nullable(),
  }),
  itens: z.array(execucaoItem),
  completed_at: z.string().nullable(),
});

const diagnosticoProcesso = z.object({
  deu_certo: z.string(),
  nao_deu_certo: z.string(),
  motivo: z.enum(["execucao", "meta_irreal", ""]),
  mudanca: z.string(),
  novo_percentual: z.number().nullable(),
});

export const acompanharSchema = z.object({
  por_processo: z.object({
    essencial: diagnosticoProcesso,
    compromissos: diagnosticoProcesso,
    futuro: diagnosticoProcesso,
    presente: diagnosticoProcesso,
  }),
  reserva_separada: z.enum(["sim", "nao", ""]),
  cortes_feitos: z.string(),
  imprevistos: z.string(),
  proxima_reuniao_confirmada: z.enum(["sim", "nao", ""]),
  completed_at: z.string().nullable(),
});
