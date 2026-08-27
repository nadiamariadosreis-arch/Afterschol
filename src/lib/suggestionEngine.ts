import { TASK_BANK } from '../data/taskBank'
import type { Child, Family, PeriodOfDay, TaskCategory, TaskDefinition } from '../types'

export interface SuggestionFilters {
  category?: TaskCategory
  period?: PeriodOfDay
  maxDuration?: number
  search?: string
}

// Motor de sugestões — seção 16 e 17 do prompt mestre.
// IDADE + AUTONOMIA + AMBIENTE DA FAMÍLIA + CARACTERÍSTICAS DA FAMÍLIA + CONTEXTO + MOMENTO DO DIA → TAREFAS COMPATÍVEIS
// O resultado é sempre uma lista de possibilidades. A mãe decide o que usar.
export function suggestTasksForChild(
  child: Child,
  family: Family | null,
  filters: SuggestionFilters = {},
): TaskDefinition[] {
  const age = child.age ?? 0

  return TASK_BANK.filter((task) => {
    if (age < task.minAge || age > task.maxAge) return false

    if (child.autonomyLevel && !task.autonomy.includes(child.autonomyLevel)) return false

    if (family?.environment && task.environments.length > 0 && !task.environments.includes(family.environment)) {
      return false
    }

    if (task.requiresFeatures.length > 0) {
      const familyFeatures = family?.features ?? []
      const hasFeature = task.requiresFeatures.some((f) => familyFeatures.includes(f))
      if (!hasFeature) return false
    }

    if (filters.category && task.category !== filters.category) return false
    if (filters.period && !task.period.includes(filters.period)) return false
    if (filters.maxDuration && task.durationMinutes > filters.maxDuration) return false
    if (filters.search) {
      const q = filters.search.trim().toLowerCase()
      if (q && !task.name.toLowerCase().includes(q) && !task.description.toLowerCase().includes(q)) {
        return false
      }
    }

    return true
  })
}

export function filterTaskBank(filters: SuggestionFilters = {}): TaskDefinition[] {
  return TASK_BANK.filter((task) => {
    if (filters.category && task.category !== filters.category) return false
    if (filters.period && !task.period.includes(filters.period)) return false
    if (filters.maxDuration && task.durationMinutes > filters.maxDuration) return false
    if (filters.search) {
      const q = filters.search.trim().toLowerCase()
      if (q && !task.name.toLowerCase().includes(q) && !task.description.toLowerCase().includes(q)) {
        return false
      }
    }
    return true
  })
}
