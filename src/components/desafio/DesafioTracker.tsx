interface Props {
  completedCount: number;
  day: number;
}

/**
 * As 21 células representam dias de uso, não dias do calendário — a N-ésima
 * célula acende quando ela completa o N-ésimo dia em que usou o desafio,
 * não quando 24h se passam. Pular um dia não "atrasa" nada: o painel
 * simplesmente espera ela voltar.
 */
export function DesafioTracker({ completedCount, day }: Props) {
  const cells = Array.from({ length: 21 }, (_, i) => {
    const n = i + 1;
    return { n, done: n <= completedCount, isCurrent: n === day && n > completedCount };
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
                : c.isCurrent
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
