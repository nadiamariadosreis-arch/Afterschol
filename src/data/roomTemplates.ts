import type { Category, Energy, Frequency, RoomType } from "../types";

export const roomTypeMeta: Record<RoomType, { label: string; emoji: string }> = {
  quarto: { label: "Quarto", emoji: "🛏️" },
  banheiro: { label: "Banheiro", emoji: "🚿" },
  cozinha: { label: "Cozinha", emoji: "🍳" },
  sala: { label: "Sala", emoji: "🛋️" },
  area_servico: { label: "Área de serviço", emoji: "🧺" },
  outro: { label: "Outro cômodo", emoji: "🚪" },
};

export interface RoomTaskTemplate {
  name: string;
  category: Category;
  durationMin: number;
  frequency: Frequency;
  priority: 1 | 2 | 3;
  energy: Energy;
}

/**
 * Tarefas sugeridas automaticamente quando um cômodo é cadastrado.
 * Evita repetir tarefas genéricas que já existem no banco padrão
 * (lavar louça, tirar lixo, etc.) — foca no que é específico do cômodo.
 */
export const roomTaskTemplates: Record<RoomType, RoomTaskTemplate[]> = {
  quarto: [
    { name: "Tirar o pó dos móveis", category: "limpeza", durationMin: 10, frequency: "semanal", priority: 1, energy: "media" },
    { name: "Organizar o guarda-roupa", category: "organizacao", durationMin: 25, frequency: "mensal", priority: 1, energy: "alta" },
  ],
  banheiro: [
    { name: "Limpar vaso, box e pia", category: "limpeza", durationMin: 15, frequency: "semanal", priority: 3, energy: "alta" },
    { name: "Trocar as toalhas", category: "limpeza", durationMin: 5, frequency: "semanal", priority: 2, energy: "baixa" },
    { name: "Repor papel higiênico e produtos", category: "organizacao", durationMin: 5, frequency: "semanal", priority: 2, energy: "baixa" },
  ],
  cozinha: [
    { name: "Limpar a bancada e o fogão", category: "cozinha", durationMin: 10, frequency: "diaria", priority: 2, energy: "baixa" },
    { name: "Organizar os armários da cozinha", category: "organizacao", durationMin: 30, frequency: "mensal", priority: 1, energy: "alta" },
  ],
  sala: [
    { name: "Tirar o pó e organizar a estante", category: "limpeza", durationMin: 10, frequency: "semanal", priority: 1, energy: "media" },
    { name: "Organizar os controles e cabos", category: "organizacao", durationMin: 10, frequency: "mensal", priority: 1, energy: "baixa" },
  ],
  area_servico: [
    { name: "Organizar produtos de limpeza", category: "organizacao", durationMin: 15, frequency: "mensal", priority: 1, energy: "media" },
    { name: "Limpar o tanque e a máquina de lavar", category: "limpeza", durationMin: 15, frequency: "quinzenal", priority: 2, energy: "media" },
  ],
  outro: [],
};
