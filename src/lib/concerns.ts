import { accumulationConcerns } from "../data/accumulationConcerns";
import type { Frequency, Task } from "../types";

export interface ConcernBoost {
  frequency: Frequency;
  priority: Task["priority"];
}

export type ConcernBoostMap = Map<string, ConcernBoost>;

/** Monta um mapa taskId -> boost a partir dos ids de preocupações marcadas pela mãe. */
export function buildConcernBoosts(activeConcernIds: string[]): ConcernBoostMap {
  const map: ConcernBoostMap = new Map();
  for (const concern of accumulationConcerns) {
    if (activeConcernIds.includes(concern.id)) {
      map.set(concern.taskId, {
        frequency: concern.boostedFrequency,
        priority: concern.boostedPriority,
      });
    }
  }
  return map;
}
