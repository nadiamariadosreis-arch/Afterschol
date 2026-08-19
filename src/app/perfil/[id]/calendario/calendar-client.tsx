"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { scheduleContentPiece, finishCalendar } from "./actions";
import { Badge, Button, Card } from "@/components/ui";
import type { ContentPiece } from "@/lib/types";

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });
const DAY_FORMATTER = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function nextDays(count: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    return date;
  });
}

export function CalendarClient({
  profileId,
  pieces,
}: {
  profileId: string;
  pieces: ContentPiece[];
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const days = useMemo(() => nextDays(14), []);

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

  if (pieces.length === 0) {
    return (
      <p className="mt-6 text-sm text-neutral-500">
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
        <p className="text-sm font-medium text-neutral-700">Pautas sem data</p>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(null)}
          className="mt-2 flex min-h-16 flex-wrap gap-2 rounded-lg border border-dashed border-neutral-300 p-3"
        >
          {unscheduled.length === 0 && (
            <span className="text-sm text-neutral-400">Todas as pautas foram agendadas.</span>
          )}
          {unscheduled.map((piece) => (
            <div
              key={piece.id}
              draggable
              onDragStart={() => setDraggingId(piece.id)}
              className="cursor-grab rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm active:cursor-grabbing"
            >
              <Badge>{piece.format}</Badge> {piece.theme}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        {days.map((date) => {
          const key = toDateKey(date);
          const items = byDate.get(key) ?? [];
          return (
            <div
              key={key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(key)}
              className="min-h-32 rounded-lg border border-neutral-200 bg-white p-2"
            >
              <p className="text-xs font-medium capitalize text-neutral-500">
                {WEEKDAY_FORMATTER.format(date)} · {DAY_FORMATTER.format(date)}
              </p>
              <div className="mt-2 space-y-1">
                {items.map((piece) => (
                  <div
                    key={piece.id}
                    draggable
                    onDragStart={() => setDraggingId(piece.id)}
                    className="cursor-grab rounded-md bg-neutral-100 px-2 py-1 text-xs active:cursor-grabbing"
                  >
                    {piece.theme}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Card className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">
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
