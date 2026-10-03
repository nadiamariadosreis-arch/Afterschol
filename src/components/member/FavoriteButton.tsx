"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

export function FavoriteButton({
  jogoId,
  initialFavorited,
  variant = "overlay",
}: {
  jogoId: string;
  initialFavorited: boolean;
  variant?: "overlay" | "inline";
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;

    const next = !favorited;
    setFavorited(next);

    startTransition(async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setFavorited(!next);
        return;
      }

      const { error } = next
        ? await supabase.from("favoritos").insert({ member_id: user.id, jogo_id: jogoId })
        : await supabase.from("favoritos").delete().eq("member_id", user.id).eq("jogo_id", jogoId);

      if (error) setFavorited(!next);
    });
  }

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={toggle}
        className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-body font-semibold text-[15px] border transition-colors ${
          favorited
            ? "bg-rosa text-white border-rosa"
            : "bg-transparent text-rosa border-rosa hover:bg-rosa/10"
        }`}
      >
        <HeartIcon filled={favorited} />
        {favorited ? "Nos favoritos" : "Salvar nos favoritos"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={favorited ? "Remover dos favoritos" : "Salvar nos favoritos"}
      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white"
    >
      <HeartIcon filled={favorited} />
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className="w-[18px] h-[18px]"
      fill={filled ? "#ff6fa5" : "none"}
      stroke={filled ? "#ff6fa5" : "currentColor"}
      strokeWidth="1.6"
    >
      <path d="M10 17s-6.5-4-6.5-8.6C3.5 5.6 5.4 4 7.3 4c1.1 0 2.1.6 2.7 1.5C10.6 4.6 11.6 4 12.7 4c1.9 0 3.8 1.6 3.8 4.4C16.5 13 10 17 10 17Z" strokeLinejoin="round" />
    </svg>
  );
}
