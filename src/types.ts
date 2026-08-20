export type Frequency = "diaria" | "semanal" | "quinzenal" | "mensal";

export type Category =
  | "cozinha"
  | "limpeza"
  | "roupas"
  | "organizacao"
  | "financas"
  | "criancas"
  | "autocuidado";

export type Energy = "baixa" | "media" | "alta";

export interface Task {
  id: string;
  name: string;
  category: Category;
  durationMin: number;
  frequency: Frequency;
  /** 1 = importante, 2 = muito importante, 3 = essencial */
  priority: 1 | 2 | 3;
  energy: Energy;
  /** true para tarefas criadas pela usuária (podem ser excluídas) */
  custom?: boolean;
  /** ISO date (yyyy-mm-dd) da última vez que foi concluída */
  lastDone?: string;
}

export interface ScoredTask extends Task {
  daysSinceDone: number;
  urgencyRatio: number;
  score: number;
  reason: string;
}

export interface RoutineResult {
  selected: ScoredTask[];
  totalMinutes: number;
  freeTimeMinutes: number;
  leftoverMinutes: number;
}
