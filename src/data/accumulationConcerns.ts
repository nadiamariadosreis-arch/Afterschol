import type { Frequency, Task } from "../types";

/**
 * Coisas que costumam "acumular" em casa. Quando a mãe marca uma dessas,
 * a tarefa ligada a ela passa a valer como se fosse mais urgente e mais
 * importante (sem precisar editar a tarefa na mão) — isso vira, na prática,
 * uma rotina diária para não deixar acumular de novo.
 */
export interface AccumulationConcern {
  id: string;
  label: string;
  emoji: string;
  /** id de uma tarefa do banco padrão (ver defaultTasks.ts) que será reforçada */
  taskId: string;
  boostedFrequency: Frequency;
  boostedPriority: Task["priority"];
}

export const accumulationConcerns: AccumulationConcern[] = [
  {
    id: "roupa-suja",
    label: "Roupa suja se acumula rápido",
    emoji: "🧺",
    taskId: "colocar-lavar-roupa",
    boostedFrequency: "diaria",
    boostedPriority: 3,
  },
  {
    id: "roupa-dobrar",
    label: "Roupa limpa fica acumulada sem dobrar/guardar",
    emoji: "👕",
    taskId: "dobrar-guardar-roupa",
    boostedFrequency: "diaria",
    boostedPriority: 3,
  },
  {
    id: "louca",
    label: "Louça se acumula na pia",
    emoji: "🧽",
    taskId: "lavar-louca",
    boostedFrequency: "diaria",
    boostedPriority: 3,
  },
  {
    id: "brinquedos",
    label: "Brinquedos ficam espalhados pela casa",
    emoji: "🧸",
    taskId: "organizar-brinquedos",
    boostedFrequency: "diaria",
    boostedPriority: 3,
  },
  {
    id: "lixo",
    label: "Lixo cheio incomoda quando ninguém tira",
    emoji: "🗑️",
    taskId: "tirar-lixo",
    boostedFrequency: "diaria",
    boostedPriority: 3,
  },
  {
    id: "cama",
    label: "Cama fica desarrumada o dia todo",
    emoji: "🛏️",
    taskId: "arrumar-camas",
    boostedFrequency: "diaria",
    boostedPriority: 2,
  },
  {
    id: "papelada",
    label: "Papelada e contas se acumulam sem organizar",
    emoji: "📄",
    taskId: "organizar-papelada",
    boostedFrequency: "semanal",
    boostedPriority: 2,
  },
  {
    id: "mochila",
    label: "Correria de manhã com mochila/material escolar",
    emoji: "🎒",
    taskId: "preparar-mochila",
    boostedFrequency: "diaria",
    boostedPriority: 3,
  },
  {
    id: "geladeira",
    label: "Geladeira vive desorganizada ou com comida vencendo",
    emoji: "🧊",
    taskId: "organizar-geladeira",
    boostedFrequency: "semanal",
    boostedPriority: 2,
  },
];
