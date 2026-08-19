import { createClient } from "@/lib/supabase/server";
import type { ContentPiece, Identity } from "@/lib/types";
import { GridClient } from "./grid-client";
import { GrowthChecklist } from "@/components/growth-checklist";

export default async function GridPage({ params }: PageProps<"/perfil/[id]/grid">) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: pieces }, { data: identities }] = await Promise.all([
    supabase
      .from("content_pieces")
      .select("*")
      .eq("profile_id", id)
      .order("grid_order", { ascending: true, nullsFirst: false })
      .order("scheduled_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true }),
    supabase
      .from("identities")
      .select("*")
      .eq("profile_id", id)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const identity = (identities?.[0] as Identity | undefined) ?? null;

  return (
    <div>
      <h1 className="text-xl font-semibold">5. Simulador de grid</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Prévia de como o perfil vai ficar no Instagram. Arraste os quadrados para reorganizar
        o grid antes de postar de verdade.
      </p>
      <GridClient
        identity={identity}
        pieces={(pieces as ContentPiece[]) ?? []}
        profileId={id}
      />
      <GrowthChecklist />
    </div>
  );
}
