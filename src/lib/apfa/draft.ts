import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { CycleRow } from "@/lib/supabase/types";

/**
 * Autosave for an in-progress pilar: writes the draft as-is (no strict
 * validation — a draft can be partially filled) and only touches the
 * columns passed in, so it can't mark a pilar complete or clobber others.
 */
export async function saveDraft(
  supabase: SupabaseClient<Database>,
  familyId: string,
  cycleId: string,
  patch: Partial<Pick<CycleRow, "avaliar" | "planejar" | "fazer_acontecer" | "acompanhar" | "percentuais">>,
): Promise<void> {
  const { error } = await supabase.from("cycles").update(patch).eq("id", cycleId).eq("family_id", familyId);
  if (error) throw new Error("Não foi possível salvar o rascunho.");
}
