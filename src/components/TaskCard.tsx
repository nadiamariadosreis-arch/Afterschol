import type { ScoredTask } from "../types";
import { categoryMeta, frequencyMeta } from "../data/categories";

interface Props {
  task: ScoredTask;
  onComplete: (id: string) => void;
  completed: boolean;
}

export function TaskCard({ task, onComplete, completed }: Props) {
  const meta = categoryMeta[task.category];
  const isSpecial = task.category === "autocuidado";

  return (
    <li
      className={`flex items-center gap-4 rounded-2xl border p-4 transition-colors ${
        completed
          ? "bg-sage-50 border-sage-100"
          : isSpecial
            ? "bg-terracotta-50 border-terracotta-100"
            : "bg-white border-cream-soft"
      }`}
    >
      <button
        type="button"
        onClick={() => onComplete(task.id)}
        aria-pressed={completed}
        aria-label={completed ? "Marcar como não feita" : "Marcar como feita"}
        className={`shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center text-lg font-bold transition-colors ${
          completed
            ? "bg-sage-500 border-sage-500 text-white"
            : "border-terracotta-300 text-transparent hover:border-terracotta-500"
        }`}
      >
        ✓
      </button>

      <div className="min-w-0 flex-1">
        <p className={`font-bold text-ink ${completed ? "line-through decoration-sage-500/60" : ""}`}>
          {task.name}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-soft">
          <span className={`px-2 py-0.5 rounded-full border font-semibold ${meta.classes}`}>
            {meta.emoji} {meta.label}
          </span>
          <span>{frequencyMeta[task.frequency]}</span>
          <span>·</span>
          <span className="italic">{completed ? "feita hoje 🎉" : task.reason}</span>
        </div>
      </div>

      <span className="shrink-0 text-sm font-extrabold text-terracotta-600 tabular-nums">
        {task.durationMin} min
      </span>
    </li>
  );
}
