import type { RoomType } from "../types";

export interface ZoneTask {
  id: string;
  name: string;
  minutes: number;
}

/**
 * Ordem fixa da rotação semanal — um cômodo por semana, sempre nessa
 * sequência, repetindo a cada 5 semanas. Segue o método Casa em Ordem.
 */
export const ZONE_ROTATION: RoomType[] = ["cozinha", "quarto", "banheiro", "sala", "area_servico"];

export const zoneLabels: Record<RoomType, string> = {
  cozinha: "Cozinha a fundo",
  quarto: "Quartos",
  banheiro: "Banheiros",
  sala: "Sala e áreas comuns",
  area_servico: "Roupa de cama/banho e área de serviço",
  outro: "Outro",
};

/**
 * O banco de tarefas de cada zona — o que NÃO é do dia a dia (isso já é o
 * mínimo viável), mas que também não pode ser esquecido por meses. Uma
 * semana inteira pra dar conta do banco daquele cômodo, no tempo que sobrar
 * a cada dia.
 */
export const zoneTaskBanks: Record<RoomType, ZoneTask[]> = {
  cozinha: [
    { id: "cozinha-geladeira", name: "Geladeira por dentro", minutes: 20 },
    { id: "cozinha-fogao", name: "Fogão e forno por dentro", minutes: 15 },
    { id: "cozinha-mantimento", name: "Armários de mantimento", minutes: 25 },
    { id: "cozinha-panelas", name: "Armários de panelas e utensílios", minutes: 20 },
  ],
  quarto: [
    { id: "quarto-guardaroupa", name: "Guarda-roupa", minutes: 25 },
    { id: "quarto-gavetas", name: "Gavetas da cômoda", minutes: 15 },
    { id: "quarto-embaixocama", name: "Embaixo da cama", minutes: 10 },
    { id: "quarto-rodapes", name: "Rodapés, portas e janelas", minutes: 15 },
  ],
  banheiro: [
    { id: "banheiro-armarios", name: "Armários do banheiro", minutes: 15 },
    { id: "banheiro-box", name: "Box e ralo", minutes: 15 },
    { id: "banheiro-vencidos", name: "Produtos vencidos", minutes: 10 },
    { id: "banheiro-cantos", name: "Rodapés e cantos", minutes: 10 },
  ],
  sala: [
    { id: "sala-estante", name: "Estante", minutes: 20 },
    { id: "sala-hometheater", name: "Home theater e cabos", minutes: 15 },
    { id: "sala-mesa", name: "Mesa de jantar e cadeiras", minutes: 10 },
    { id: "sala-tapetes", name: "Tapetes e janelas", minutes: 15 },
  ],
  area_servico: [
    { id: "as-roupacama", name: "Roupa de cama", minutes: 15 },
    { id: "as-toalhas", name: "Toalhas", minutes: 10 },
    { id: "as-produtos", name: "Produtos de limpeza", minutes: 15 },
    { id: "as-lavanderia", name: "Área de serviço / lavanderia", minutes: 20 },
  ],
  outro: [],
};
