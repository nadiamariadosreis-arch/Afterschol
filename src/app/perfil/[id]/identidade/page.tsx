import { createClient } from "@/lib/supabase/server";
import type { Identity } from "@/lib/types";
import { IdentityClient } from "./identity-client";

export default async function IdentidadePage({ params }: PageProps<"/perfil/[id]/identidade">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: identities } = await supabase
    .from("identities")
    .select("*")
    .eq("profile_id", id)
    .order("created_at", { ascending: false })
    .limit(1);

  const latest = (identities?.[0] as Identity | undefined) ?? null;

  return (
    <div>
      <h1 className="font-display text-xl font-semibold">2. Identidade do perfil</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Um briefing de marca pessoal gerado a partir do nicho escolhido. Edite à vontade antes
        de avançar.
      </p>
      <IdentityClient profileId={id} latest={latest} />
    </div>
  );
}
