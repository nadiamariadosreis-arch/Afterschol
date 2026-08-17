import type { ProcessoKey } from "./types";

export const PROCESSO_INFO: Record<
  ProcessoKey,
  { titulo: string; resumo: string; descricao: string; itensSugeridos: string[] }
> = {
  essencial: {
    titulo: "Essencial",
    resumo: "Manter a vida funcionando",
    descricao:
      "O dinheiro necessário para a família viver e cumprir suas necessidades reais: casa, alimentação, saúde, transporte, educação.",
    itensSugeridos: [
      "Aluguel ou financiamento",
      "Condomínio",
      "Água, luz e gás",
      "Internet e telefone",
      "Mercado",
      "Combustível ou transporte",
      "Plano de saúde",
      "Escola ou mensalidade escolar",
      "Medicamentos de uso contínuo",
    ],
  },
  compromissos: {
    titulo: "Compromissos",
    resumo: "Resolver o que já foi assumido",
    descricao: "Parcelas, dívidas e compromissos já contraídos — o que o passado deixou para o presente resolver.",
    itensSugeridos: [
      "Parcela do cartão de crédito",
      "Empréstimo pessoal",
      "Financiamento do carro",
      "Cheque especial",
      "Dívida com familiares",
      "Parcelamento de compra grande",
    ],
  },
  futuro: {
    titulo: "Futuro",
    resumo: "Construir o futuro",
    descricao:
      "O que deixa de olhar só o mês atual e prepara a família para o amanhã — reserva de emergência, investimentos, objetivos de longo prazo.",
    itensSugeridos: [
      "Reserva de emergência",
      "Investimentos",
      "Previdência",
      "Poupança para um objetivo (casa, viagem, faculdade dos filhos)",
      "Seguro de vida",
    ],
  },
  presente: {
    titulo: "Presente",
    resumo: "Viver bem o presente",
    descricao:
      "Aproveitar a vida, criar boas experiências em família, sem comprometer os outros processos — lazer, presentes, hobbies.",
    itensSugeridos: [
      "Lazer e passeios",
      "Restaurantes",
      "Streaming e assinaturas",
      "Presentes",
      "Hobbies",
      "Cuidados pessoais",
    ],
  },
};

export const CADENCIA_LABEL: Record<string, string> = {
  mensal: "Mensal",
  quinzenal: "Quinzenal",
};

export const MEIO_PAGAMENTO_LABEL: Record<string, string> = {
  cartao: "Cartão de crédito",
  dinheiro: "Dinheiro",
  pix: "Pix",
  debito: "Cartão de débito",
  transferencia: "Transferência",
};

export const URGENCIA_LABEL: Record<string, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

export const MOTIVO_COMPRA_LABEL: Record<string, string> = {
  necessidade: "Necessidade",
  planejamento: "Planejamento",
  conveniencia: "Conveniência",
  prazer: "Prazer",
  impulso: "Impulso",
  ansiedade: "Ansiedade/estresse",
  pressao_social: "Pressão social",
  outro: "Outro",
};

export const MESES_LABEL = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
