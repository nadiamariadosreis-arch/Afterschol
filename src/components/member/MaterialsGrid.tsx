"use client";

import { useState } from "react";
import Link from "next/link";
import { Cover } from "@/components/member/Cover";
import { coverImageUrl } from "@/lib/supabase/storage";
import type { Material } from "@/lib/supabase/types";

export function MaterialsGrid({ materials }: { materials: Material[] }) {
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = materials.filter(
    (m) => !normalizedQuery || m.title.toLowerCase().includes(normalizedQuery),
  );

  return (
    <div className="flex flex-col gap-6">
      {materials.length > 6 ? (
        <label className="relative block max-w-sm">
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
            placeholder="Buscar nesta categoria..."
            className="w-full rounded-full border border-line bg-card pl-11 pr-4 py-2.5 text-[14px] text-ink outline-none focus:border-navy"
          />
        </label>
      ) : null}

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      ) : (
        <p className="text-ink/60">Nenhum material encontrado.</p>
      )}
    </div>
  );
}

function MaterialCard({ material }: { material: Material }) {
  return (
    <Link
      href={`/materiais/${material.id}`}
      className="group flex flex-col rounded-2xl overflow-hidden bg-card shadow-sm hover:shadow-lg transition-shadow"
    >
      <div className="relative aspect-video overflow-hidden">
        <Cover
          trackSlug={material.id}
          mark={material.title.charAt(0)}
          imageUrl={coverImageUrl(material.cover_image_path)}
          className="absolute inset-0 w-full h-full rounded-none scale-100 group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-4 flex flex-col gap-2">
        {material.age_range ? (
          <span className="text-[12px] text-ink/40">{material.age_range}</span>
        ) : null}
        <h3 className="font-heading font-semibold text-[16px] text-navy leading-snug line-clamp-2">
          {material.title}
        </h3>
      </div>
    </Link>
  );
}
