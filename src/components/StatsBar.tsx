import { useMemo } from "react";
import type { Task } from "../types";
import { scoreTasks } from "../lib/scheduler";

interface Props {
  tasks: Task[];
}

export function StatsBar({ tasks }: Props) {
  const stats = useMemo(() => {
    const scored = scoreTasks(tasks);
    const overdue = scored.filter((t) => t.urgencyRatio >= 1).length;
    const pendingMinutes = scored
      .filter((t) => t.urgencyRatio >= 1)
      .reduce((sum, t) => sum + t.durationMin, 0);
    return { total: tasks.length, overdue, pendingMinutes };
  }, [tasks]);

  return (
    <div className="grid grid-cols-3 gap-3 text-center">
      <div className="rounded-2xl bg-white border border-cream-soft py-3">
        <p className="text-2xl font-extrabold text-ink">{stats.total}</p>
        <p className="text-xs text-ink-soft font-semibold">tarefas na lista</p>
      </div>
      <div className="rounded-2xl bg-white border border-cream-soft py-3">
        <p className="text-2xl font-extrabold text-terracotta-600">{stats.overdue}</p>
        <p className="text-xs text-ink-soft font-semibold">no ponto de fazer</p>
      </div>
      <div className="rounded-2xl bg-white border border-cream-soft py-3">
        <p className="text-2xl font-extrabold text-ink">{stats.pendingMinutes}</p>
        <p className="text-xs text-ink-soft font-semibold">min pendentes</p>
      </div>
    </div>
  );
}
