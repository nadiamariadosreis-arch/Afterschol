import type { Energy } from "../types";
import { energyMeta, timePresets } from "../data/categories";

interface Props {
  freeTime: number;
  onFreeTimeChange: (minutes: number) => void;
  energy: Energy;
  onEnergyChange: (energy: Energy) => void;
  onGenerate: () => void;
}

export function TimeSelector({ freeTime, onFreeTimeChange, energy, onEnergyChange, onGenerate }: Props) {
  return (
    <section className="rounded-3xl bg-white border border-terracotta-100 shadow-sm p-6 sm:p-8">
      <h2 className="text-xl font-extrabold text-ink">Quanto tempo livre você tem agora?</h2>
      <p className="text-ink-soft mt-1">A gente monta a rotina certinha para caber nesse tempo.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {timePresets.map((minutes) => (
          <button
            key={minutes}
            type="button"
            onClick={() => onFreeTimeChange(minutes)}
            className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${
              freeTime === minutes
                ? "bg-terracotta-500 text-white border-terracotta-500"
                : "bg-cream-soft text-ink border-transparent hover:border-terracotta-200"
            }`}
          >
            {minutes} min
          </button>
        ))}
        <label className="flex items-center gap-2 px-4 py-2 rounded-full border border-dashed border-terracotta-200 text-sm">
          <span className="text-ink-soft">Outro:</span>
          <input
            type="number"
            min={5}
            step={5}
            value={freeTime}
            onChange={(e) => onFreeTimeChange(Math.max(0, Number(e.target.value) || 0))}
            className="w-16 bg-transparent outline-none font-semibold"
          />
          <span className="text-ink-soft">min</span>
        </label>
      </div>

      <h3 className="mt-6 text-sm font-bold text-ink-soft uppercase tracking-wide">Como está sua energia?</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {(Object.keys(energyMeta) as Energy[]).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onEnergyChange(level)}
            className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${
              energy === level
                ? "bg-sage-500 text-white border-sage-500"
                : "bg-cream-soft text-ink border-transparent hover:border-sage-200"
            }`}
          >
            {energyMeta[level].emoji} {energyMeta[level].label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onGenerate}
        className="mt-7 w-full sm:w-auto px-8 py-3 rounded-full bg-terracotta-600 text-white font-extrabold text-base shadow-md hover:bg-terracotta-700 transition-colors"
      >
        ✨ Gerar minha rotina
      </button>
    </section>
  );
}
