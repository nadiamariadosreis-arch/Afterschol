import { useEffect, useState } from "react";
import { dailyFixedTasks } from "../../data/dailyFixedTasks";

interface Props {
  running: boolean;
  startedAt: number | null;
  onStart: () => void;
  onFinish: () => void;
}

export function DesafioCalibration({ running, startedAt, onStart, onFinish }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);

  const elapsedSeconds = running && startedAt ? Math.floor((now - startedAt) / 1000) : 0;
  const mm = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
  const ss = String(elapsedSeconds % 60).padStart(2, "0");

  return (
    <section className="rounded-3xl bg-white border border-gold-200 shadow-sm p-6 sm:p-8">
      <p className="inline-block px-3 py-1 rounded-full bg-gold-100 text-gold-700 text-xs font-bold uppercase tracking-wide">
        Dia 1 · calibração
      </p>
      <h2 className="mt-3 text-xl font-extrabold text-ink">
        Quanto tempo essas tarefas levam pra você?
      </h2>
      <p className="mt-1 text-ink-soft">
        Toque em começar e vá fazer as 5 tarefas fixas, no seu ritmo normal. Quando terminar todas,
        volte aqui e toque em terminei — isso vira o seu tempo-base, descontado todo dia antes de
        sugerir tarefas do desafio.
      </p>

      <ul className="mt-4 flex flex-col gap-1.5">
        {dailyFixedTasks.map((t) => (
          <li key={t.id} className="flex items-center gap-2 text-sm text-ink-soft">
            <span>{t.emoji}</span>
            <span>{t.name}</span>
          </li>
        ))}
      </ul>

      {running ? (
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="text-4xl font-extrabold text-gold-700 tabular-nums">
            {mm}:{ss}
          </div>
          <button
            type="button"
            onClick={onFinish}
            className="px-8 py-3 rounded-full bg-gold-600 text-white font-extrabold text-base shadow-md hover:bg-gold-700 transition-colors"
          >
            ✓ Terminei as 5 tarefas
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onStart}
          className="mt-6 w-full sm:w-auto px-8 py-3 rounded-full bg-gold-600 text-white font-extrabold text-base shadow-md hover:bg-gold-700 transition-colors"
        >
          ⏱️ Começar a calibração
        </button>
      )}
    </section>
  );
}
