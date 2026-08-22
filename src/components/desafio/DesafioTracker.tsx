import { addDaysISO } from "../../lib/dates";

interface Props {
  startDate: string;
  completedDays: string[];
  day: number;
}

export function DesafioTracker({ startDate, completedDays, day }: Props) {
  const completedSet = new Set(completedDays);
  const cells = Array.from({ length: 21 }, (_, i) => {
    const n = i + 1;
    const dateISO = addDaysISO(startDate, i);
    return { n, done: completedSet.has(dateISO), isToday: n === day };
  });

  return (
    <section className="rounded-3xl bg-white border border-gold-200 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-ink">Painel de acompanhamento</h2>
        <span className="text-sm font-bold text-gold-700 tabular-nums">
          Dia {Math.min(Math.max(day, 1), 21)} de 21
        </span>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-2">
        {cells.map((c) => (
          <div
            key={c.n}
            className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold border tabular-nums ${
              c.done
                ? "bg-gold-500 border-gold-500 text-white"
                : c.isToday
                  ? "border-gold-500 text-gold-700"
                  : "border-cream-soft text-ink-soft"
            }`}
          >
            {c.done ? "✓" : c.n}
          </div>
        ))}
      </div>
    </section>
  );
}
