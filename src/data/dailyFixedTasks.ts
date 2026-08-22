export interface DailyFixedTask {
  id: string;
  name: string;
  emoji: string;
  /** usado como tempo-base antes da calibração do dia 1 */
  defaultMinutes: number;
}

/**
 * As tarefas não-negociáveis do dia a dia — acontecem todo dia, façam parte
 * do desafio ou não. Servem de base pra descontar do tempo livre informado
 * antes de sugerir tarefas do desafio.
 */
export const dailyFixedTasks: DailyFixedTask[] = [
  { id: "louca", name: "Lavar a louça", emoji: "🧽", defaultMinutes: 10 },
  { id: "roupa", name: "Dobrar e guardar a roupa", emoji: "🧺", defaultMinutes: 8 },
  { id: "lixo", name: "Tirar o lixo", emoji: "🗑️", defaultMinutes: 3 },
  { id: "camas", name: "Arrumar as camas", emoji: "🛏️", defaultMinutes: 5 },
  { id: "chao", name: "Passar a vassourinha no chão", emoji: "🧹", defaultMinutes: 8 },
];
