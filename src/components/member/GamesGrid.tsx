"use client";

import { useRef, useState } from "react";
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
  const resultsRef = useRef<HTMLDivElement>(null);

  const usedCategoryIds = new Set(games.map((g) => g.category_id).filter(Boolean));
  const visibleCategories = categories.filter((c) => usedCategoryIds.has(c.id));

  const countFor = (categoryId: string) => games.filter((g) => g.category_id === categoryId).length;

  const filtered = activeCategory
    ? games.filter((g) => g.category_id === activeCategory)
    : games;

  const activeCategoryName = visibleCategories.find((c) => c.id === activeCategory)?.name ?? null;

  function selectCategory(id: string | null) {
    setActiveCategory(id);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="flex flex-col gap-10">
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
                className="text-flame text-[14px] hover:underline underline-offset-4"
              >
                Ver todos os jogos
              </button>
            ) : null}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {visibleCategories.map((c, i) => (
              <SkillCard
                key={c.id}
                name={c.name}
                count={countFor(c.id)}
                active={activeCategory === c.id}
                palette={paletteFor(i)}
                onClick={() => selectCategory(activeCategory === c.id ? null : c.id)}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div ref={resultsRef}>
        <h2 className="font-heading font-semibold text-[22px] text-ink mb-5">
          {activeCategoryName ? `Jogos de ${activeCategoryName}` : "Todos os jogos"}
        </h2>

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
        active ? "shadow-md ring-2 ring-flame" : "shadow-sm hover:shadow-md"
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
