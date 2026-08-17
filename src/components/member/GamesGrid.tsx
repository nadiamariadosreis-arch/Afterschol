"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Cover } from "@/components/member/Cover";
import { coverImageUrl } from "@/lib/supabase/storage";
import type { Game, GameCategory } from "@/lib/supabase/types";

type GameWithCategory = Game & { game_categories: Pick<GameCategory, "id" | "name"> | null };

const PASTELS = [
  { bg: "#e4ecf7", fg: "#33507a" }, // soft blue
  { bg: "#e7f1e2", fg: "#3f6b3a" }, // soft green
  { bg: "#faf0d6", fg: "#8a6a1f" }, // soft gold
  { bg: "#f7e3da", fg: "#a15230" }, // soft peach
  { bg: "#f2e0e6", fg: "#8a3d55" }, // soft rose
  { bg: "#e2e7f0", fg: "#3a4a6b" }, // soft slate
];

function paletteFor(index: number) {
  return PASTELS[index % PASTELS.length];
}

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

function SkillIcon({ name }: { name: string }) {
  const key = name.toLowerCase();

  if (key.includes("aten")) {
    return (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="M20 20 15.3 15.3" strokeLinecap="round" />
      </svg>
    );
  }
  if (key.includes("mem")) {
    return (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 3c-3.3 0-5.5 2.3-5.5 5.2 0 1.7.8 2.8 1.7 3.8.7.8 1.1 1.4 1.1 2.5v1h5.4v-1c0-1.1.4-1.7 1.1-2.5.9-1 1.7-2.1 1.7-3.8C17.5 5.3 15.3 3 12 3Z" strokeLinejoin="round" />
        <path d="M9.3 18.5h5.4M10 21h4" strokeLinecap="round" />
      </svg>
    );
  }
  if (key.includes("lógic") || key.includes("logic") || key.includes("racioc")) {
    return (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M9 3.5h3a1.5 1.5 0 0 1 1.5 1.5v1.5H15a1.5 1.5 0 0 1 1.5 1.5V11H18a1.5 1.5 0 0 1 0 3h-1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3V16a1.5 1.5 0 0 0-3 0v2.5H6A1.5 1.5 0 0 1 4.5 17v-3H6a1.5 1.5 0 0 0 0-3H4.5V8A1.5 1.5 0 0 1 6 6.5h1.5V5A1.5 1.5 0 0 1 9 3.5Z" strokeLinejoin="round" />
      </svg>
    );
  }
  if (key.includes("autocontrole") || key.includes("controle") || key.includes("impulso")) {
    return (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="8" y="2.5" width="8" height="15" rx="2.5" />
        <circle cx="12" cy="6" r="1.1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="10" r="1.1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="14" r="1.1" fill="currentColor" stroke="none" />
        <path d="M12 17.5V21" strokeLinecap="round" />
        <path d="M8 21h8" strokeLinecap="round" />
      </svg>
    );
  }
  if (key.includes("lingua")) {
    return (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 5.5h16v10H9.5L6 19v-3.5H4v-10Z" strokeLinejoin="round" />
        <path d="M8 9.5h8M8 12.5h5" strokeLinecap="round" />
      </svg>
    );
  }
  if (key.includes("coopera") || key.includes("social")) {
    return (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="8.5" cy="8" r="2.6" />
        <circle cx="16" cy="8" r="2.6" />
        <path d="M3.5 19c.7-3 2.6-4.6 5-4.6s4.3 1.6 5 4.6" strokeLinecap="round" />
        <path d="M12.8 14.6c2.1.2 3.7 1.8 4.3 4.4" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3.5c.7 3.3 1.9 4.5 5.2 5.2-3.3.7-4.5 1.9-5.2 5.2-.7-3.3-1.9-4.5-5.2-5.2 3.3-.7 4.5-1.9 5.2-5.2Z" strokeLinejoin="round" />
      <path d="M18.5 15c.4 1.6.9 2.1 2.5 2.5-1.6.4-2.1.9-2.5 2.5-.4-1.6-.9-2.1-2.5-2.5 1.6-.4 2.1-.9 2.5-2.5Z" strokeLinejoin="round" />
    </svg>
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
