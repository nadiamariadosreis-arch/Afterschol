import { useState } from "react";
import type { ChallengeTask, Room, RoomType } from "../../types";
import { suggestDailyChallengeTasks } from "../../lib/challengeScheduler";
import { challengeTaskEmoji } from "../../lib/taskDisplay";
import { zoneLabels } from "../../data/zoneTaskBanks";

interface Props {
  pendingTasks: ChallengeTask[];
  baselineMinutes: number;
  rooms: Room[];
  zoneType: RoomType | null;
  onComplete: (id: string) => void;
}

const TIME_PRESETS = [15, 30, 60];

export function DesafioDaily({ pendingTasks, baselineMinutes, rooms, zoneType, onComplete }: Props) {
  const [totalTime, setTotalTime] = useState(30);

  const remaining = Math.max(0, totalTime - baselineMinutes);
  const suggestion = suggestDailyChallengeTasks(pendingTasks, remaining);

  function roomName(id?: string) {
    return id ? rooms.find((r) => r.id === id)?.name : undefined;
  }

  // A sugestão já vem agrupada por cômodo (o motor termina um antes de
  // pular pro outro) — só precisamos marcar onde cada grupo começa.
  const distinctRoomKeys = new Set(suggestion.selected.map((t) => t.roomId ?? "__sem__"));
  const showRoomHeadings = distinctRoomKeys.size > 1;
  const rows = suggestion.selected.map((task, i) => {
    const roomKey = task.roomId ?? "__sem__";
    const prevRoomKey = i > 0 ? (suggestion.selected[i - 1].roomId ?? "__sem__") : null;
    return { task, isNewGroup: showRoomHeadings && roomKey !== prevRoomKey };
  });

  return (
    <section className="rounded-3xl bg-white border border-terracotta-100 shadow-sm p-6 sm:p-8">
      <h2 className="text-xl font-extrabold text-ink">Quanto tempo você tem hoje, no total?</h2>
      <p className="text-ink-soft mt-1">
        Já descontamos os {baselineMinutes} min do mínimo viável — o resto vai pra{" "}
        {zoneType ? `zona: ${zoneLabels[zoneType]}` : "zona da semana"}.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {TIME_PRESETS.map((minutes) => (
          <button
            key={minutes}
            type="button"
            onClick={() => setTotalTime(minutes)}
            className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${
              totalTime === minutes
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
            min={0}
            step={5}
            value={totalTime}
            onChange={(e) => setTotalTime(Math.max(0, Number(e.target.value) || 0))}
            className="w-16 bg-transparent outline-none font-semibold"
          />
          <span className="text-ink-soft">min</span>
        </label>
      </div>

      {pendingTasks.length === 0 ? (
        <p className="mt-6 text-ink-soft text-sm italic">
          Fila vazia por enquanto — o banco da próxima zona entra sozinho quando a semana virar.
        </p>
      ) : remaining <= 0 ? (
        <p className="mt-6 text-sm text-ink-soft bg-cream rounded-2xl p-4">
          Hoje só dá pra manter o mínimo viável — e tudo bem. Isso já conta como um dia cumprido
          do desafio.
        </p>
      ) : (
        <div className="mt-6">
          <p className="text-sm font-bold text-ink-soft uppercase tracking-wide">
            Pra hoje ({suggestion.totalMinutes} de {remaining} min disponíveis)
          </p>
          {suggestion.selected.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft italic">
              Nenhuma tarefa da fila cabe em {remaining} min ainda — aumente o tempo ou volte
              amanhã.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {rows.map(({ task, isNewGroup }) => {
                return (
                  <li key={task.id}>
                    {isNewGroup && (
                      <p className="text-xs font-bold text-ink-soft uppercase tracking-wide mb-1.5">
                        {roomName(task.roomId) ?? "Sem cômodo"}
                      </p>
                    )}
                    <div className="flex items-center gap-3 rounded-2xl border border-cream-soft bg-cream p-3">
                      <button
                        type="button"
                        onClick={() => onComplete(task.id)}
                        aria-label={`Marcar ${task.name} como feita`}
                        className="shrink-0 w-8 h-8 rounded-full border-2 border-terracotta-300 flex items-center justify-center text-transparent hover:border-terracotta-500 font-bold transition-colors"
                      >
                        ✓
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ink">
                          {challengeTaskEmoji(task)} {task.name}
                        </p>
                        {!showRoomHeadings && roomName(task.roomId) && (
                          <p className="text-xs text-ink-soft">{roomName(task.roomId)}</p>
                        )}
                      </div>
                      <span className="shrink-0 text-sm font-extrabold text-terracotta-600 tabular-nums">
                        {task.estimatedMinutes} min
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {suggestion.leftoverMinutes > 0 && suggestion.selected.length > 0 && (
            <p className="mt-3 text-xs text-ink-soft italic">
              Sobraram {suggestion.leftoverMinutes} min — não coube mais nenhuma tarefa inteira sem
              pular pra outro cômodo.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
