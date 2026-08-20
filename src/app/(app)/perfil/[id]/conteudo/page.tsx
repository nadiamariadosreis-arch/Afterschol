import { createClient } from "@/lib/supabase/server";
import { PageFade } from "@/components/motion";
import type { ContentPiece } from "@/lib/types";
import { ContentClient } from "./content-client";

export default async function ConteudoPage({ params }: PageProps<"/perfil/[id]/conteudo">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: pieces } = await supabase
    .from("content_pieces")
    .select("*")
    .eq("profile_id", id)
    .order("created_at", { ascending: true });

  return (
    <PageFade>
      <h1 className="font-display text-xl font-semibold">3. Pautas de conteúdo</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Roteiros e legendas prontos, gerados a partir do nicho e dos pilares definidos.
      </p>
      <ContentClient profileId={id} pieces={(pieces as ContentPiece[]) ?? []} />
    </PageFade>
  );
}
