"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { scheduleContentPiece, finishCalendar } from "./actions";
import { Badge, Button, Card } from "@/components/ui";
import type { ContentPiece } from "@/lib/types";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_FORMATTER = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Matriz de semanas (7 dias cada) cobrindo o mês, com dias de meses vizinhos pra completar as semanas. */
function monthMatrix(monthAnchor: Date) {
  const first = startOfMonth(monthAnchor);
  const gridStart = new Date(first);
  gridStart.setDate(gridStart.getDate() - first.getDay());

  const weeks: Date[][] = [];
  const cursor = new Date(gridStart);
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export function CalendarClient({
  profileId,
  pieces,
}: {
  profileId: string;
  pieces: ContentPiece[];
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(new Date()));
  const today = toDateKey(new Date());
  const currentMonthIndex = monthAnchor.getMonth();

  const weeks = useMemo(() => monthMatrix(monthAnchor), [monthAnchor]);

  const unscheduled = pieces.filter((p) => !p.scheduled_date);
  const byDate = useMemo(() => {
    const map = new Map<string, ContentPiece[]>();
    for (const piece of pieces) {
      if (!piece.scheduled_date) continue;
      const list = map.get(piece.scheduled_date) ?? [];
      list.push(piece);
      map.set(piece.scheduled_date, list);
    }
    return map;
  }, [pieces]);

  function handleDrop(dateKey: string | null) {
    if (!draggingId) return;
    scheduleContentPiece(profileId, draggingId, dateKey);
    setDraggingId(null);
  }

  function changeMonth(delta: number) {
    setMonthAnchor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  if (pieces.length === 0) {
    return (
      <p className="mt-6 text-sm text-ink-soft">
        Ainda não há pautas geradas.{" "}
        <Link href={`/perfil/${profileId}/conteudo`} className="underline">
          Volte para o módulo de conteúdo
        </Link>{" "}
        para gerar pautas primeiro.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <div>
        <p className="text-sm font-medium text-ink">Pautas sem data</p>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(null)}
          className="mt-2 flex min-h-16 flex-wrap gap-2 rounded-lg border border-dashed border-line p-3"
        >
          {unscheduled.length === 0 && (
            <span className="text-sm text-ink-soft">Todas as pautas foram agendadas.</span>
          )}
          {unscheduled.map((piece) => (
            <motion.div
              key={piece.id}
              layoutId={piece.id}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              whileHover={{ scale: 1.03 }}
              draggable
              onDragStart={() => setDraggingId(piece.id)}
              className="cursor-grab rounded-lg border border-line bg-card px-3 py-2 text-sm shadow-sm active:cursor-grabbing"
            >
              <Badge>{piece.format}</Badge> {piece.theme}
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-lg font-semibold capitalize text-ink">
            {MONTH_FORMATTER.format(monthAnchor)}
          </p>
          <div className="flex gap-1">
            <Button variant="secondary" onClick={() => changeMonth(-1)} className="px-3 py-1">
              ←
            </Button>
            <Button variant="secondary" onClick={() => changeMonth(1)} className="px-3 py-1">
              →
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-line bg-line text-center">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="bg-cream-dark py-1 text-xs font-medium text-ink-soft">
              {label}
            </div>
          ))}
          {weeks.map((week) =>
            week.map((date) => {
              const key = toDateKey(date);
              const items = byDate.get(key) ?? [];
              const inMonth = date.getMonth() === currentMonthIndex;
              const isToday = key === today;
              return (
                <div
                  key={key}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(key)}
                  className={`min-h-24 bg-card p-1.5 text-left ${inMonth ? "" : "opacity-40"}`}
                >
                  <p
                    className={`mb-1 text-xs ${
                      isToday
                        ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange font-medium text-white"
                        : "text-ink-soft"
                    }`}
                  >
                    {date.getDate()}
                  </p>
                  <div className="space-y-1">
                    {items.map((piece) => (
                      <motion.div
                        key={piece.id}
                        layoutId={piece.id}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        whileHover={{ scale: 1.05 }}
                        draggable
                        onDragStart={() => setDraggingId(piece.id)}
                        className="cursor-grab truncate rounded-md bg-cream-dark px-1.5 py-1 text-[11px] active:cursor-grabbing"
                        title={piece.theme}
                      >
                        {piece.theme}
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            }),
          )}
        </div>
      </div>

      <Card className="flex items-center justify-between">
        <p className="text-sm text-ink-soft">
          {byDate.size > 0
            ? "Quando terminar de organizar, veja como o grid do perfil vai ficar."
            : "Agende ao menos uma pauta para seguir para o simulador de grid."}
        </p>
        <form action={finishCalendar.bind(null, profileId)}>
          <Button type="submit" disabled={byDate.size === 0}>
            Ver simulador de grid →
          </Button>
        </form>
      </Card>
    </div>
  );
}
