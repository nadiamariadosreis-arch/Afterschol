import { createClient } from "@/lib/supabase/server";
import { PageFade } from "@/components/motion";
import type { ContentPiece } from "@/lib/types";
import { CalendarClient } from "./calendar-client";

export default async function CalendarioPage({ params }: PageProps<"/perfil/[id]/calendario">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: pieces } = await supabase
    .from("content_pieces")
    .select("*")
    .eq("profile_id", id)
    .order("created_at", { ascending: true });

  return (
    <PageFade>
      <h1 className="font-display text-xl font-semibold">4. Calendário editorial</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Arraste as pautas para os dias da semana. Consistência é o principal fator de
        crescimento orgânico.
      </p>
      <CalendarClient profileId={id} pieces={(pieces as ContentPiece[]) ?? []} />
    </PageFade>
  );
}
