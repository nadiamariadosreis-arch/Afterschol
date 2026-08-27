import type { ChallengeTask } from "../types";
import { challengeCategoryMeta } from "../data/challengeCategories";
import { roomTypeMeta } from "../data/roomTemplates";

/** Emoji certo pra cada tarefa do desafio, venha ela da zona da semana ou de cadastro manual. */
export function challengeTaskEmoji(task: ChallengeTask): string {
  if (task.source === "zone" && task.zoneType) return roomTypeMeta[task.zoneType].emoji;
  if (task.category) return challengeCategoryMeta[task.category].emoji;
  return "📦";
}
