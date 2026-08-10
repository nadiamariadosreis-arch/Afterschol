import { createClient } from "@/lib/supabase/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GameLibrary } from "@/components/member/GameLibrary";
import type { GameCardData } from "@/components/member/GameCard";
import type { Tag } from "@/lib/supabase/types";

type JogoRow = {
  slug: string;
  titulo: string;
  resumo: string | null;
  capa_path: string | null;
  jogo_tags: { tags: Tag | null }[];
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: jogosData }, { data: tags }] = await Promise.all([
    supabase
      .from("jogos")
      .select("slug, titulo, resumo, capa_path, jogo_tags(tags(*))")
      .eq("published", true)
      .order("titulo")
      .returns<JogoRow[]>(),
    supabase.from("tags").select("*").order("name").returns<Tag[]>(),
  ]);

  const jogos: GameCardData[] = (jogosData ?? []).map((jogo) => ({
    slug: jogo.slug,
    titulo: jogo.titulo,
    resumo: jogo.resumo,
    capa_path: jogo.capa_path,
    tags: jogo.jogo_tags.map((jt) => jt.tags).filter((t): t is Tag => t !== null),
  }));

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        eyebrow="Biblioteca"
        title="Busque um jogo pela queixa ou pela virtude que você quer trabalhar"
      />
      <GameLibrary jogos={jogos} tags={tags ?? []} />
    </div>
  );
}
