"use client";

import { useMemo, useState } from "react";
import { GameCard, type GameCardData } from "./GameCard";
import type { Tag } from "@/lib/supabase/types";

export function GameLibrary({ jogos, tags }: { jogos: GameCardData[]; tags: Tag[] }) {
  const [search, setSearch] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const queixas = tags.filter((t) => t.type === "queixa");
  const virtudes = tags.filter((t) => t.type === "virtude");

  function toggleTag(id: string) {
    setSelectedTagIds((current) =>
      current.includes(id) ? current.filter((t) => t !== id) : [...current, id],
    );
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return jogos.filter((jogo) => {
      const matchesSearch =
        !term ||
        jogo.titulo.toLowerCase().includes(term) ||
        (jogo.resumo ?? "").toLowerCase().includes(term);

      const matchesTags =
        selectedTagIds.length === 0 || jogo.tags.some((tag) => selectedTagIds.includes(tag.id));

      return matchesSearch && matchesTags;
    });
  }, [jogos, search, selectedTagIds]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar jogo por nome…"
          className="border border-line bg-card rounded-xl px-5 py-3 font-body text-ink outline-none focus:border-coral max-w-md"
        />

        {queixas.length > 0 ? (
          <TagGroup label="Queixas" tags={queixas} selected={selectedTagIds} onToggle={toggleTag} />
        ) : null}
        {virtudes.length > 0 ? (
          <TagGroup label="Virtudes" tags={virtudes} selected={selectedTagIds} onToggle={toggleTag} />
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <p className="text-ink/60">Nenhum jogo encontrado com esse filtro.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((jogo) => (
            <GameCard key={jogo.slug} jogo={jogo} />
          ))}
        </div>
      )}
    </div>
  );
}

function TagGroup({
  label,
  tags,
  selected,
  onToggle,
}: {
  label: string;
  tags: Tag[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink/50 mr-1">
        {label}
      </span>
      {tags.map((tag) => {
        const active = selected.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => onToggle(tag.id)}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold border transition-colors ${
              active
                ? tag.type === "queixa"
                  ? "bg-coral text-white border-coral"
                  : "bg-teal text-white border-teal"
                : "bg-card text-ink/70 border-line hover:border-coral"
            }`}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}
