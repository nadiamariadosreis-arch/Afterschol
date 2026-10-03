import { createClient } from "@/lib/supabase/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GameLibrary } from "@/components/member/GameLibrary";
import type { GameCardData } from "@/components/member/GameCard";
import type { Tag } from "@/lib/supabase/types";

type JogoRow = {
  id: string;
  slug: string;
  titulo: string;
  resumo: string | null;
  capa_path: string | null;
  jogo_tags: { tags: Tag | null }[];
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: jogosData }, { data: tags }, { data: favoritos }] = await Promise.all([
    supabase
      .from("jogos")
      .select("id, slug, titulo, resumo, capa_path, jogo_tags(tags(*))")
      .eq("published", true)
      .order("titulo")
      .returns<JogoRow[]>(),
    supabase.from("tags").select("*").order("name").returns<Tag[]>(),
    user
      ? supabase.from("favoritos").select("jogo_id").eq("member_id", user.id)
      : Promise.resolve({ data: [] as { jogo_id: string }[] }),
  ]);

  const favoritedIds = new Set((favoritos ?? []).map((f) => f.jogo_id));

  const jogos: GameCardData[] = (jogosData ?? []).map((jogo) => ({
    id: jogo.id,
    slug: jogo.slug,
    titulo: jogo.titulo,
    resumo: jogo.resumo,
    capa_path: jogo.capa_path,
    tags: jogo.jogo_tags.map((jt) => jt.tags).filter((t): t is Tag => t !== null),
    favorited: favoritedIds.has(jogo.id),
  }));

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        eyebrow="Biblioteca"
        title="Busque uma atividade sem tela pela queixa ou pela virtude que você quer trabalhar"
      />
      <GameLibrary jogos={jogos} tags={tags ?? []} />
    </div>
  );
}
