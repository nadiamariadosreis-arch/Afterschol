"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Cover } from "@/components/member/Cover";
import { coverImageUrl } from "@/lib/supabase/storage";
import { PASTELS, SkillIcon, paletteFor } from "@/components/member/skillVisuals";
import type { Game, GameCategory } from "@/lib/supabase/types";

type GameWithCategory = Game & { game_categories: Pick<GameCategory, "id" | "name"> | null };

export function GamesGrid({
  games,
  categories,
}: {
  games: GameWithCategory[];
  categories: GameCategory[];
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  const usedCategoryIds = new Set(games.map((g) => g.category_id).filter(Boolean));
  const visibleCategories = categories.filter((c) => usedCategoryIds.has(c.id));

  const categoryPalette = useMemo(() => {
    const map = new Map<string, { bg: string; fg: string }>();
    visibleCategories.forEach((c, i) => map.set(c.id, paletteFor(i)));
    return map;
  }, [visibleCategories]);

  const countFor = (categoryId: string) => games.filter((g) => g.category_id === categoryId).length;

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = games
    .filter((g) => !activeCategory || g.category_id === activeCategory)
    .filter((g) => !normalizedQuery || g.title.toLowerCase().includes(normalizedQuery));

  const activeCategoryName = visibleCategories.find((c) => c.id === activeCategory)?.name ?? null;

  function selectCategory(id: string | null) {
    setActiveCategory(id);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="flex flex-col gap-10">
      <label className="relative block">
        <svg
          viewBox="0 0 20 20"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <circle cx="9" cy="9" r="6" />
          <path d="M17.5 17.5 13.5 13.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar jogos, habilidades ou temas..."
          className="w-full rounded-full border border-line bg-card pl-11 pr-4 py-3 text-[15px] text-ink outline-none focus:border-navy"
        />
      </label>

      {visibleCategories.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-semibold text-[22px] text-ink">
              Escolha uma habilidade
            </h2>
            {activeCategory ? (
              <button
                type="button"
                onClick={() => selectCategory(null)}
                className="text-navy text-[14px] hover:underline underline-offset-4"
              >
                Ver todos os jogos
              </button>
            ) : null}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {visibleCategories.map((c) => (
              <SkillCard
                key={c.id}
                name={c.name}
                count={countFor(c.id)}
                active={activeCategory === c.id}
                palette={categoryPalette.get(c.id)!}
                onClick={() => selectCategory(activeCategory === c.id ? null : c.id)}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div id="jogos" ref={resultsRef}>
        <h2 className="font-heading font-semibold text-[22px] text-ink mb-5">
          {activeCategoryName ? `Jogos de ${activeCategoryName}` : "Todos os jogos"}
        </h2>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                palette={game.category_id ? categoryPalette.get(game.category_id) : undefined}
              />
            ))}
          </div>
        ) : (
          <p className="text-ink/60">Nenhum jogo encontrado.</p>
        )}
      </div>
    </div>
  );
}

function SkillCard({
  name,
  count,
  active,
  palette,
  onClick,
}: {
  name: string;
  count: number;
  active: boolean;
  palette: { bg: string; fg: string };
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2.5 rounded-2xl p-5 text-center transition-shadow ${
        active ? "shadow-md ring-2 ring-navy" : "shadow-sm hover:shadow-md"
      }`}
      style={{ backgroundColor: palette.bg }}
    >
      <span style={{ color: palette.fg }}>
        <SkillIcon name={name} />
      </span>
      <span className="font-heading font-semibold text-[14px] text-ink leading-snug">{name}</span>
      <span className="text-[12px] text-ink/50">
        {count} jogo{count === 1 ? "" : "s"}
      </span>
    </button>
  );
}

function GameCard({
  game,
  palette,
}: {
  game: GameWithCategory;
  palette: { bg: string; fg: string } | undefined;
}) {
  const tone = palette ?? PASTELS[0];

  return (
    <Link
      href={`/jogos/${game.id}`}
      className="group flex flex-col rounded-2xl overflow-hidden bg-card shadow-sm hover:shadow-lg transition-shadow"
    >
      <div className="relative aspect-video overflow-hidden">
        <Cover
          trackSlug={game.id}
          mark={game.title.charAt(0)}
          imageUrl={coverImageUrl(game.cover_image_path)}
          className="absolute inset-0 w-full h-full rounded-none scale-100 group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {game.game_categories ? (
            <span
              className="text-[11px] tracking-[0.06em] uppercase font-semibold px-3 py-1 rounded-full"
              style={{ backgroundColor: tone.bg, color: tone.fg }}
            >
              {game.game_categories.name}
            </span>
          ) : null}
          {game.age_range ? (
            <span className="text-[12px] text-ink/40">{game.age_range}</span>
          ) : null}
        </div>
        <h3 className="font-heading font-semibold text-[16px] text-navy leading-snug line-clamp-2">
          {game.title}
        </h3>
      </div>
    </Link>
  );
}
