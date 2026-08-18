import Link from "next/link";
import { Cover } from "@/components/member/Cover";
import { coverImageUrl } from "@/lib/supabase/storage";
import type { Category } from "@/lib/supabase/types";

export function CategoriesGrid({
  categories,
  countByCategory,
}: {
  categories: Category[];
  countByCategory: Map<string, number>;
}) {
  if (categories.length === 0) {
    return <p className="text-ink/60">Nenhuma categoria disponível ainda.</p>;
  }

  return (
    <div id="categorias" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          count={countByCategory.get(category.id) ?? 0}
        />
      ))}
    </div>
  );
}

function CategoryCard({ category, count }: { category: Category; count: number }) {
  return (
    <Link
      href={`/categorias/${category.id}`}
      className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
    >
      <Cover
        trackSlug={category.id}
        mark={category.name.charAt(0)}
        imageUrl={coverImageUrl(category.cover_image_path)}
        className="absolute inset-0 w-full h-full rounded-none scale-100 group-hover:scale-105 transition-transform duration-300"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(0deg, rgba(20,12,8,0.85) 0%, rgba(20,12,8,0.25) 55%, transparent 85%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="font-heading font-semibold text-[16px] text-white leading-snug">
          {category.name}
        </h3>
        <span className="text-[12px] text-white/70 mt-0.5 block">
          {count} material{count === 1 ? "" : "is"}
        </span>
      </div>
    </Link>
  );
}
