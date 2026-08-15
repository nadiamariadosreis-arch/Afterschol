"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMember } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { acompanharSchema, percentuaisSchema } from "@/lib/apfa/schemas";
import { PROCESSO_ORDER, type AcompanharData } from "@/lib/apfa/types";
import { saveDraft } from "@/lib/apfa/draft";

export type AcompanharState = { error?: string };

export async function autosalvarAcompanharAction(cycleId: string, acompanhar: AcompanharData): Promise<void> {
  const profile = await requireMember();
  const supabase = await createClient();
  await saveDraft(supabase, profile.id, cycleId, { acompanhar });
}

export async function salvarAcompanharAction(
  _prevState: AcompanharState,
  formData: FormData,
): Promise<AcompanharState> {
  const profile = await requireMember();
  const cycleId = String(formData.get("cycleId") ?? "");
  if (!cycleId) return { error: "Ciclo não encontrado." };

  let raw: unknown;
  let percentuaisAtuaisRaw: unknown;
  try {
    raw = JSON.parse(String(formData.get("acompanhar") ?? "{}"));
    percentuaisAtuaisRaw = JSON.parse(String(formData.get("percentuaisAtuais") ?? "{}"));
  } catch {
    return { error: "Dados inválidos. Recarregue a página e tente novamente." };
  }

  const parsed = acompanharSchema.safeParse({
    ...(raw as object),
    completed_at: new Date().toISOString(),
  });
  if (!parsed.success) return { error: "Confira os campos preenchidos e tente novamente." };

  const percentuaisAtuais = percentuaisSchema.safeParse(percentuaisAtuaisRaw);
  if (!percentuaisAtuais.success) return { error: "Percentuais inválidos." };

  const novosPercentuais = { ...percentuaisAtuais.data };
  for (const key of PROCESSO_ORDER) {
    const diagnostico = parsed.data.por_processo[key];
    if (diagnostico.motivo === "meta_irreal" && diagnostico.novo_percentual !== null) {
      novosPercentuais[key] = diagnostico.novo_percentual;
    }
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("cycles")
    .update({ acompanhar: parsed.data, percentuais: novosPercentuais })
    .eq("id", cycleId)
    .eq("family_id", profile.id);

  if (error) return { error: "Não foi possível salvar. Tente novamente." };

  revalidatePath("/dashboard");
  revalidatePath("/historico");
  redirect("/dashboard");
}
