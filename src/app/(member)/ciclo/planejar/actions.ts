"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMember } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { planejarSchema } from "@/lib/apfa/schemas";
import { saveDraft } from "@/lib/apfa/draft";
import type { PlanejarData } from "@/lib/apfa/types";

export type PlanejarState = { error?: string };

export async function autosalvarPlanejarAction(cycleId: string, planejar: PlanejarData): Promise<void> {
  const profile = await requireMember();
  const supabase = await createClient();
  await saveDraft(supabase, profile.id, cycleId, { planejar });
}

export async function salvarPlanejarAction(_prevState: PlanejarState, formData: FormData): Promise<PlanejarState> {
  const profile = await requireMember();
  const cycleId = String(formData.get("cycleId") ?? "");
  if (!cycleId) return { error: "Ciclo não encontrado." };

  let planejarRaw: unknown;
  try {
    planejarRaw = JSON.parse(String(formData.get("planejar") ?? "{}"));
  } catch {
    return { error: "Dados inválidos. Recarregue a página e tente novamente." };
  }

  const parsed = planejarSchema.safeParse({
    ...(planejarRaw as object),
    completed_at: new Date().toISOString(),
  });
  if (!parsed.success) return { error: "Confira os campos preenchidos e tente novamente." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("cycles")
    .update({ planejar: parsed.data })
    .eq("id", cycleId)
    .eq("family_id", profile.id);

  if (error) return { error: "Não foi possível salvar. Tente novamente." };

  revalidatePath("/dashboard");
  redirect("/ciclo/fazer-acontecer");
}
