"use client";

import { useState } from "react";
import Link from "next/link";
import { Cover } from "@/components/member/Cover";
import { coverImageUrl } from "@/lib/supabase/storage";
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

  const usedCategoryIds = new Set(games.map((g) => g.category_id).filter(Boolean));
  const visibleCategories = categories.filter((c) => usedCategoryIds.has(c.id));

  const filtered = activeCategory
    ? games.filter((g) => g.category_id === activeCategory)
    : games;

  return (
    <div>
      {visibleCategories.length > 0 ? (
        <div className="flex items-center gap-2 flex-wrap mb-6">
          <FilterChip active={activeCategory === null} onClick={() => setActiveCategory(null)}>
            Todos
          </FilterChip>
          {visibleCategories.map((c) => (
            <FilterChip
              key={c.id}
              active={activeCategory === c.id}
              onClick={() => setActiveCategory(c.id)}
            >
              {c.name}
            </FilterChip>
          ))}
        </div>
      ) : null}

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <p className="text-ink/60">Nenhum jogo disponível ainda.</p>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${
        active
          ? "bg-flame text-white border-flame"
          : "bg-transparent text-ink/70 border-line hover:border-flame"
      }`}
    >
      {children}
    </button>
  );
}

function GameCard({ game }: { game: GameWithCategory }) {
  return (
    <Link
      href={`/jogos/${game.id}`}
      className="group relative aspect-video rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
    >
      <Cover
        trackSlug={game.id}
        mark={game.title.charAt(0)}
        imageUrl={coverImageUrl(game.cover_image_path)}
        className="absolute inset-0 w-full h-full rounded-none scale-100 group-hover:scale-105 transition-transform duration-300"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(0deg, rgba(20,12,8,0.9) 0%, rgba(20,12,8,0.35) 55%, transparent 85%)",
        }}
      />

      {game.game_categories ? (
        <span className="absolute top-3 left-3 bg-flame text-white text-[11px] tracking-[0.1em] uppercase font-semibold px-3 py-1 rounded-full">
          {game.game_categories.name}
        </span>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="font-heading font-semibold text-[16px] text-white leading-snug line-clamp-2">
          {game.title}
        </h3>
        {game.age_range ? (
          <span className="text-[12px] text-white/70 mt-0.5 block">{game.age_range}</span>
        ) : null}
      </div>
    </Link>
  );
}
