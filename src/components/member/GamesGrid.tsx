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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
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
          ? "bg-moss text-parchment border-moss"
          : "bg-transparent text-ink/70 border-line hover:border-moss"
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
      className="group flex flex-col gap-2 rounded-sm overflow-hidden"
    >
      <div className="relative aspect-[3/4] rounded-sm overflow-hidden border border-line shadow-sm group-hover:shadow-md transition-shadow">
        <Cover
          trackSlug={game.id}
          mark={game.title.charAt(0)}
          imageUrl={coverImageUrl(game.cover_image_path)}
          className="absolute inset-0 w-full h-full rounded-none"
        />
      </div>
      <div>
        <h3 className="font-heading font-semibold text-[15px] text-ink leading-snug line-clamp-2">
          {game.title}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          {game.game_categories ? (
            <span className="text-[12px] text-moss-dark">{game.game_categories.name}</span>
          ) : null}
          {game.age_range ? (
            <span className="text-[12px] text-ink/40">{game.age_range}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
