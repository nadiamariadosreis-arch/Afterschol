interface Props {
  today: string;
  offsetDays: number;
  onAdvance: () => void;
  onRewind: () => void;
  onReset: () => void;
}

/** Controle de teste pra "andar" pelos dias do desafio sem esperar dias reais passarem. */
export function DesafioDevClock({ today, offsetDays, onAdvance, onRewind, onReset }: Props) {
  const [year, month, dayNum] = today.split("-");
  const displayDate = `${dayNum}/${month}/${year}`;

  return (
    <section className="rounded-2xl border border-dashed border-terracotta-200 bg-terracotta-50/50 p-4 flex flex-wrap items-center justify-between gap-3">
      <div className="text-sm">
        <span className="font-bold text-terracotta-600">🧪 Modo de teste</span>
        <span className="text-ink-soft ml-2">
          {offsetDays === 0 ? `hoje de verdade (${displayDate})` : `simulando ${displayDate}`}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRewind}
          disabled={offsetDays === 0}
          className="px-3 py-1.5 rounded-full border border-terracotta-200 text-sm font-semibold text-terracotta-600 disabled:opacity-30 hover:bg-white transition-colors"
        >
          ◀ dia anterior
        </button>
        <button
          type="button"
          onClick={onAdvance}
          className="px-3 py-1.5 rounded-full bg-terracotta-500 text-white text-sm font-bold hover:bg-terracotta-600 transition-colors"
        >
          próximo dia ▶
        </button>
        {offsetDays !== 0 && (
          <button
            type="button"
            onClick={onReset}
            className="px-3 py-1.5 rounded-full text-sm text-ink-soft hover:text-ink"
          >
            voltar pra hoje
          </button>
        )}
      </div>
    </section>
  );
}
