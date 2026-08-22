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

export type DayOfWeek = "dom" | "seg" | "ter" | "qua" | "qui" | "sex" | "sab";

export type RoomType =
  | "quarto"
  | "banheiro"
  | "cozinha"
  | "sala"
  | "area_servico"
  | "outro";

export interface Room {
  id: string;
  name: string;
  type: RoomType;
}

/** Preferências da mãe: o que ela sente que acumula, e seu dia de faxina. */
export interface RoutineProfile {
  /** ids de AccumulationConcern marcados como "isso acumula na minha casa" */
  concerns: string[];
  cleaningDay: DayOfWeek | null;
  cleaningDayMinutes: number;
}

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
  /** cômodo ao qual a tarefa pertence, se houver */
  roomId?: string;
}

export interface ScoredTask extends Task {
  daysSinceDone: number;
  urgencyRatio: number;
  score: number;
  reason: string;
  /** true quando a urgência/prioridade foi reforçada por uma preocupação marcada pela mãe */
  boosted: boolean;
}

export interface RoutineResult {
  selected: ScoredTask[];
  totalMinutes: number;
  freeTimeMinutes: number;
  leftoverMinutes: number;
}

/** Tipo do item acumulado, usado só pra prever a frequência de manutenção depois que ele é feito. */
export type ChallengeCategory =
  | "movel_grande"
  | "geladeira_despensa"
  | "gaveta_papelada"
  | "area_externa"
  | "outro";

/** Item da fila do Desafio de 21 dias — algo acumulado que a mãe cadastrou manualmente. */
export interface ChallengeTask {
  id: string;
  name: string;
  roomId?: string;
  estimatedMinutes: number;
  category: ChallengeCategory;
  cycleId: string;
  createdAt: string;
  /** ISO date de quando foi concluída. Ausente = ainda pendente. */
  doneAt?: string;
}

export interface ChallengeCycle {
  id: string;
  startDate: string;
  /** ISO dates em que pelo menos uma tarefa (fixa ou do desafio) foi concluída. */
  completedDays: string[];
}

export interface ChallengeBaseline {
  minutes: number | null;
  calibratedAt: string | null;
}
