"use client";

import { useState } from "react";
import { reorderGrid } from "./actions";
import type { ContentPiece, Identity } from "@/lib/types";

const FORMAT_ICON: Record<ContentPiece["format"], string> = {
  reels: "▶",
  carrossel: "▦",
  foto_unica: "▢",
  stories: "◔",
};

export function GridClient({
  identity,
  pieces,
  profileId,
}: {
  identity: Identity | null;
  pieces: ContentPiece[];
  profileId: string;
}) {
  const [ordered, setOrdered] = useState(pieces);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  function handleDrop(targetIndex: number) {
    if (draggingIndex === null || draggingIndex === targetIndex) return;
    const next = [...ordered];
    const [moved] = next.splice(draggingIndex, 1);
    next.splice(targetIndex, 0, moved);
    setOrdered(next);
    setDraggingIndex(null);
    reorderGrid(
      profileId,
      next.map((p) => p.id),
    );
  }

  const initial = identity?.username_suggestion?.replace("@", "").slice(0, 2).toUpperCase() ?? "IG";

  return (
    <div className="mt-6 mx-auto max-w-sm overflow-hidden rounded-2xl border border-line bg-card">
      <div className="flex items-center gap-4 p-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
          style={{ backgroundColor: identity?.color_palette?.[0] ?? "#e0692b" }}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">
            {identity?.username_suggestion ?? "@seu_perfil"}
          </p>
          <p className="mt-1 text-sm text-ink-soft">{identity?.bio ?? "Bio aparecerá aqui"}</p>
        </div>
      </div>

      {identity && identity.content_pillars.length > 0 && (
        <div className="flex gap-3 overflow-x-auto px-4 pb-4">
          {identity.content_pillars.map((pillar) => (
            <div key={pillar} className="flex shrink-0 flex-col items-center gap-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-line text-xs text-ink-soft">
                •
              </div>
              <span className="max-w-14 truncate text-center text-[11px] text-ink-soft">
                {pillar}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-px bg-line">
        {ordered.length === 0 && (
          <p className="col-span-3 p-6 text-center text-sm text-ink-soft">
            Nenhuma pauta ainda. Volte ao módulo de conteúdo para gerar posts.
          </p>
        )}
        {ordered.map((piece, index) => (
          <div
            key={piece.id}
            draggable
            onDragStart={() => setDraggingIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index)}
            className="flex aspect-square cursor-grab flex-col items-center justify-center gap-1 bg-cream-dark p-2 text-center active:cursor-grabbing"
            title={piece.theme}
          >
            <span className="text-lg text-ink-soft">{FORMAT_ICON[piece.format]}</span>
            <span className="line-clamp-2 text-[11px] text-ink-soft">{piece.theme}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
