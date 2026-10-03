"use client";

import { useMemo, useState } from "react";
import { GameCard, type GameCardData } from "./GameCard";
import { SHORTCUT_TAG_TYPES, tagLabel, tagSolidClasses } from "@/lib/tagStyle";
import type { Tag } from "@/lib/supabase/types";

export function GameLibrary({ jogos, tags }: { jogos: GameCardData[]; tags: Tag[] }) {
  const [search, setSearch] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const queixas = tags.filter((t) => t.type === "queixa");
  const virtudes = tags.filter((t) => t.type === "virtude");
  const shortcutTags = tags.filter((t) => SHORTCUT_TAG_TYPES.includes(t.type));

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

      const matchesFavorites = !favoritesOnly || jogo.favorited;

      return matchesSearch && matchesTags && matchesFavorites;
    });
  }, [jogos, search, selectedTagIds, favoritesOnly]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5">
        {shortcutTags.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setFavoritesOnly((v) => !v)}
              className={`rounded-2xl px-5 py-3 font-display font-bold text-[15px] transition-opacity hover:opacity-90 ${
                favoritesOnly ? "bg-rosa text-white" : "bg-rosa/15 text-rosa-dark"
              }`}
            >
              ❤ Meus Favoritos
            </button>
            {shortcutTags.map((tag) => {
              const active = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`rounded-2xl px-5 py-3 font-display font-bold text-[15px] transition-opacity hover:opacity-90 ${
                    active ? tagSolidClasses(tag.type) : "bg-card text-ink/70 border border-line"
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        ) : null}

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar atividade por nome…"
          className="border border-line bg-card rounded-xl px-5 py-3 font-body text-ink outline-none focus:border-coral max-w-md"
        />

        {queixas.length > 0 ? (
          <TagGroup
            label={tagLabel("queixa")}
            tags={queixas}
            selected={selectedTagIds}
            onToggle={toggleTag}
          />
        ) : null}
        {virtudes.length > 0 ? (
          <TagGroup
            label={tagLabel("virtude")}
            tags={virtudes}
            selected={selectedTagIds}
            onToggle={toggleTag}
          />
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <p className="text-ink/60">Nenhuma atividade encontrada com esse filtro.</p>
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
                ? `${tagSolidClasses(tag.type)} border-transparent`
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
