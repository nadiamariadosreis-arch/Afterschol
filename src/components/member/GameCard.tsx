import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { coverImageUrl } from "@/lib/supabase/storage";
import type { Tag } from "@/lib/supabase/types";

export type GameCardData = {
  slug: string;
  titulo: string;
  resumo: string | null;
  capa_path: string | null;
  tags: Tag[];
};

export function GameCard({ jogo }: { jogo: GameCardData }) {
  const cover = coverImageUrl(jogo.capa_path);

  return (
    <Link
      href={`/jogos/${jogo.slug}`}
      className="flex flex-col bg-card border border-line rounded-2xl overflow-hidden hover:border-coral transition-colors"
    >
      <div className="relative aspect-[4/3] bg-cream-dark">
        {cover ? (
          <Image src={cover} alt="" fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink/30 text-[13px]">
            Sem capa
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-5">
        <h3 className="font-display font-bold text-[18px] text-ink leading-tight">{jogo.titulo}</h3>
        {jogo.resumo ? <p className="text-ink/70 text-[14px] line-clamp-2">{jogo.resumo}</p> : null}
        {jogo.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {jogo.tags.map((tag) => (
              <Badge key={tag.id} tone={tag.type === "queixa" ? "coral" : "teal"}>
                {tag.name}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
