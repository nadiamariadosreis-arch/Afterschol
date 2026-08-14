"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMember } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fazerAcontecerSchema } from "@/lib/apfa/schemas";

export type FazerAcontecerState = { error?: string };

export async function salvarFazerAcontecerAction(
  _prevState: FazerAcontecerState,
  formData: FormData,
): Promise<FazerAcontecerState> {
  const profile = await requireMember();
  const cycleId = String(formData.get("cycleId") ?? "");
  if (!cycleId) return { error: "Ciclo não encontrado." };

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("fazerAcontecer") ?? "{}"));
  } catch {
    return { error: "Dados inválidos. Recarregue a página e tente novamente." };
  }

  const parsed = fazerAcontecerSchema.safeParse({
    ...(raw as object),
    completed_at: new Date().toISOString(),
  });
  if (!parsed.success) return { error: "Confira os campos preenchidos e tente novamente." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("cycles")
    .update({ fazer_acontecer: parsed.data })
    .eq("id", cycleId)
    .eq("family_id", profile.id);

  if (error) return { error: "Não foi possível salvar. Tente novamente." };

  revalidatePath("/dashboard");
  redirect("/ciclo/acompanhar");
}
