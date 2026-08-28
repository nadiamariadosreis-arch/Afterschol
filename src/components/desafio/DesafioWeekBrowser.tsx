import type { ChallengeTask, Room } from "../../types";
import { zoneRoomForWeek, challengePhaseForWeek, phaseLabels, daysDoneInWeek } from "../../lib/zoneRotation";
import { zoneLabels } from "../../data/zoneTaskBanks";
import { roomTypeMeta } from "../../data/roomTemplates";

interface Props {
  currentWeek: number;
  completedCount: number;
  rooms: Room[];
  challengeTasks: ChallengeTask[];
  viewedWeek: number;
  onSelectWeek: (week: number) => void;
}

export function DesafioWeekBrowser({
  currentWeek,
  completedCount,
  rooms,
  challengeTasks,
  viewedWeek,
  onSelectWeek,
}: Props) {
  const weeks = [1, 2, 3];
  if (currentWeek > 3 && !weeks.includes(currentWeek)) weeks.push(currentWeek);

  const zoneIndex = viewedWeek - 1; // mesmo índice usado no id das tarefas injetadas
  const zoneRoom = viewedWeek >= 2 ? zoneRoomForWeek(zoneIndex, rooms) : null;
  const weekZoneTasks = zoneRoom
    ? challengeTasks.filter((t) => t.id.startsWith(`zone-${zoneIndex}-`))
    : [];
  const doneCount = weekZoneTasks.filter((t) => t.doneAt).length;
  const daysDone = daysDoneInWeek(viewedWeek, completedCount);
  const dayStart = 7 * (viewedWeek - 1) + 1;
  const dayEnd = 7 * viewedWeek;
  const phase = phaseLabels[challengePhaseForWeek(viewedWeek)];
  const status = viewedWeek < currentWeek ? "passada" : viewedWeek === currentWeek ? "atual" : "futura";

  return (
    <section className="rounded-3xl bg-white border border-cream-soft p-6 sm:p-8">
      <div className="flex flex-wrap gap-2">
        {weeks.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => onSelectWeek(w)}
            className={`px-4 py-2 rounded-full border text-sm font-bold transition-colors ${
              viewedWeek === w
                ? "bg-terracotta-500 text-white border-terracotta-500"
                : "bg-cream-soft text-ink border-transparent hover:border-terracotta-200"
            }`}
          >
            Semana {w}
            {w === currentWeek ? " · agora" : ""}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-extrabold text-ink">
            Semana {viewedWeek}{" "}
            <span className="text-ink-soft font-normal text-sm">
              · dias {dayStart}–{dayEnd}
            </span>
          </h3>
          <span className="text-xs font-bold uppercase tracking-wide text-terracotta-600">
            {phase.title}
          </span>
        </div>
        <p className="text-sm text-ink-soft mt-1">{phase.description}</p>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-cream-soft overflow-hidden">
            <div
              className="h-full bg-sage-500 transition-all"
              style={{ width: `${(daysDone / 7) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-ink-soft tabular-nums shrink-0">
            {daysDone}/7 dias
          </span>
        </div>

        {viewedWeek === 1 ? (
          <p className="mt-4 text-sm text-ink-soft">
            Só o mínimo viável nessa semana — a zona da semana entra a partir da Semana 2.
          </p>
        ) : !zoneRoom ? (
          <p className="mt-4 text-sm text-ink-soft italic">
            {status === "futura"
              ? "A zona dessa semana depende de quais cômodos você tiver cadastrado quando ela chegar."
              : "Nenhum cômodo cadastrado pra virar zona nessa semana."}
          </p>
        ) : (
          <div className="mt-4">
            <p className="text-sm font-semibold text-ink">
              {roomTypeMeta[zoneRoom.type].emoji} Zona: {zoneRoom.name} · {zoneLabels[zoneRoom.type]}
            </p>
            {status !== "futura" && weekZoneTasks.length > 0 && (
              <>
                <ul className="mt-2 flex flex-col gap-1">
                  {weekZoneTasks.map((t) => (
                    <li key={t.id} className="flex items-center gap-2 text-sm">
                      <span className={t.doneAt ? "text-sage-600" : "text-ink-soft"}>
                        {t.doneAt ? "✓" : "○"}
                      </span>
                      <span
                        className={
                          t.doneAt ? "text-ink-soft line-through decoration-sage-500/60" : "text-ink"
                        }
                      >
                        {t.name}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-ink-soft">
                  {doneCount} de {weekZoneTasks.length} feitas
                </p>
              </>
            )}
            {status === "futura" && (
              <p className="mt-2 text-xs text-ink-soft italic">Essa semana ainda não chegou.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
