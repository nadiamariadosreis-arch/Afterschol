export type DesafioCategoria = "semana" | "mes";

export type DesafioDef = {
  chave: string;
  categoria: DesafioCategoria;
  titulo: string;
  explicacao: string;
  duracaoDias: number;
};

export const DESAFIOS_SEMANA: DesafioDef[] = [
  {
    chave: "registrar-gastos-7-dias",
    categoria: "semana",
    titulo: "Registrar todos os gastos durante 7 dias",
    explicacao: "Anote cada gasto, por menor que seja, durante uma semana inteira — só de olhar, já ajuda a perceber padrões.",
    duracaoDias: 7,
  },
  {
    chave: "conferir-saldo-antes-de-gastar",
    categoria: "semana",
    titulo: "Conferir o saldo antes de gastar",
    explicacao: "Antes de qualquer compra nesta semana, dê uma olhada rápida no saldo disponível.",
    duracaoDias: 7,
  },
  {
    chave: "anotar-pequenos-gastos",
    categoria: "semana",
    titulo: "Anotar todos os pequenos gastos",
    explicacao: "Cafezinho, lanche, estacionamento — os gastos pequenos costumam passar despercebidos. Anote todos por 7 dias.",
    duracaoDias: 7,
  },
  {
    chave: "evitar-compras-por-impulso",
    categoria: "semana",
    titulo: "Evitar compras por impulso durante 7 dias",
    explicacao: "Antes de comprar algo que não estava nos planos, espere um pouco e pergunte: eu realmente preciso disso agora?",
    duracaoDias: 7,
  },
  {
    chave: "nao-realizar-compras-nao-planejadas",
    categoria: "semana",
    titulo: "Não realizar compras não planejadas",
    explicacao: "Durante 7 dias, só compre o que já estava previsto na Organização do mês.",
    duracaoDias: 7,
  },
];

export const DESAFIOS_MES: DesafioDef[] = [
  {
    chave: "cancelar-assinatura-nao-utilizada",
    categoria: "mes",
    titulo: "Cancelar uma assinatura que não utiliza",
    explicacao: "Dê uma olhada nas assinaturas e serviços recorrentes — tem algum que já não faz mais sentido para a família?",
    duracaoDias: 30,
  },
  {
    chave: "organizar-uma-divida",
    categoria: "mes",
    titulo: "Organizar uma dívida",
    explicacao: "Escolha uma dívida e dê um passo concreto nela este mês: negociar, definir uma forma de pagamento ou quitar.",
    duracaoDias: 30,
  },
  {
    chave: "comecar-pequena-reserva",
    categoria: "mes",
    titulo: "Começar uma pequena reserva",
    explicacao: "Separe, ainda que pouco, um valor para começar (ou reforçar) a reserva da família este mês.",
    duracaoDias: 30,
  },
  {
    chave: "registrar-gastos-mes-todo",
    categoria: "mes",
    titulo: "Registrar todos os gastos durante o mês",
    explicacao: "Leve o registro de gastos do desafio semanal para o mês inteiro — mais dados, mais clareza.",
    duracaoDias: 30,
  },
  {
    chave: "planejar-gastos-antes-de-receber",
    categoria: "mes",
    titulo: "Planejar os gastos antes de receber",
    explicacao: "Antes do próximo pagamento cair na conta, defina para onde cada parte da renda vai.",
    duracaoDias: 30,
  },
];

export const DESAFIOS: DesafioDef[] = [...DESAFIOS_SEMANA, ...DESAFIOS_MES];

export function desafioPorChave(chave: string): DesafioDef | undefined {
  return DESAFIOS.find((d) => d.chave === chave);
}
