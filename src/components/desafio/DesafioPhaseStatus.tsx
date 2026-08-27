import type { Room } from "../../types";
import { challengePhase, phaseLabels } from "../../lib/zoneRotation";
import { zoneLabels } from "../../data/zoneTaskBanks";
import { roomTypeMeta } from "../../data/roomTemplates";

interface Props {
  day: number;
  zoneRoom: Room | null;
}

export function DesafioPhaseStatus({ day, zoneRoom }: Props) {
  const phase = challengePhase(day);
  const meta = phaseLabels[phase];

  return (
    <section className="rounded-3xl bg-terracotta-50 border border-terracotta-100 p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="px-3 py-1 rounded-full bg-terracotta-500 text-white text-xs font-bold uppercase tracking-wide">
          {meta.title}
        </span>
        {zoneRoom && (
          <span className="px-3 py-1 rounded-full bg-white border border-terracotta-200 text-xs font-bold text-terracotta-600 uppercase tracking-wide">
            {roomTypeMeta[zoneRoom.type].emoji} Zona: {zoneRoom.name} · {zoneLabels[zoneRoom.type]}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-ink-soft">{meta.description}</p>
    </section>
  );
}
