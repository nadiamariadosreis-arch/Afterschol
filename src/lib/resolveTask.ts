import { getTaskById } from '../data/taskBank'
import type { ChildTask, CustomTask, TaskCategory } from '../types'

export interface ResolvedTask {
  name: string
  description: string
  icon: string
  durationMinutes: number
  canHaveHowTo: boolean
  category: TaskCategory
  originTaskId: string | null
  originCustomTaskId: string | null
}

export function resolveChildTask(
  childTask: ChildTask,
  customTasks: Record<string, CustomTask>,
): ResolvedTask | null {
  const base = childTask.taskId
    ? getTaskById(childTask.taskId)
    : childTask.customTaskId
      ? customTasks[childTask.customTaskId]
      : null

  if (!base) return null

  return {
    name: childTask.overrideName ?? base.name,
    description: childTask.overrideDescription ?? base.description,
    icon: childTask.overrideIcon ?? base.icon,
    durationMinutes: childTask.overrideDuration ?? base.durationMinutes,
    canHaveHowTo: 'canHaveHowTo' in base ? base.canHaveHowTo : true,
    category: base.category,
    originTaskId: childTask.taskId,
    originCustomTaskId: childTask.customTaskId,
  }
}
