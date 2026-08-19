import { createClient } from "@/lib/supabase/server";
import type { Niche } from "@/lib/types";
import { NicheClient } from "./niche-client";

export default async function NichoPage({ params }: PageProps<"/perfil/[id]/nicho">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: niches } = await supabase
    .from("niches")
    .select("*")
    .eq("profile_id", id)
    .order("created_at", { ascending: false })
    .limit(1);

  const latest = (niches?.[0] as Niche | undefined) ?? null;

  return (
    <div>
      <h1 className="text-xl font-semibold">1. Pesquisa de nicho</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Descreva um interesse ou competência. A IA sugere sub-nichos com potencial real de
        crescimento orgânico.
      </p>
      <NicheClient profileId={id} latest={latest} />
    </div>
  );
}
