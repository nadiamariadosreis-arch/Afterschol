import { dailyFixedTasks } from "../../data/dailyFixedTasks";

interface Props {
  fixedDone: Record<string, string>;
  today: string;
  onToggle: (id: string) => void;
}

export function DesafioFixedChecklist({ fixedDone, today, onToggle }: Props) {
  return (
    <section className="rounded-3xl bg-white border border-cream-soft p-6 sm:p-8">
      <h2 className="text-lg font-extrabold text-ink">Tarefas fixas de hoje</h2>
      <p className="text-ink-soft text-sm mt-1">
        Não-negociáveis — acontecem todo dia, façam parte do desafio ou não.
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {dailyFixedTasks.map((t) => {
          const done = fixedDone[t.id] === today;
          return (
            <li
              key={t.id}
              className={`flex items-center gap-3 rounded-2xl border p-3 ${
                done ? "bg-sage-50 border-sage-100" : "bg-cream border-cream-soft"
              }`}
            >
              <button
                type="button"
                onClick={() => onToggle(t.id)}
                aria-pressed={done}
                aria-label={done ? `Marcar ${t.name} como não feita` : `Marcar ${t.name} como feita`}
                className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-base font-bold transition-colors ${
                  done
                    ? "bg-sage-500 border-sage-500 text-white"
                    : "border-terracotta-300 text-transparent hover:border-terracotta-500"
                }`}
              >
                ✓
              </button>
              <span
                className={`flex-1 font-semibold text-ink ${
                  done ? "line-through decoration-sage-500/60" : ""
                }`}
              >
                {t.emoji} {t.name}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
