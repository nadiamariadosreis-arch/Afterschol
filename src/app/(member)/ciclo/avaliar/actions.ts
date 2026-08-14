"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMember } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { avaliarSchema, percentuaisSchema } from "@/lib/apfa/schemas";

export type AvaliarState = { error?: string };

export async function salvarAvaliarAction(_prevState: AvaliarState, formData: FormData): Promise<AvaliarState> {
  const profile = await requireMember();
  const cycleId = String(formData.get("cycleId") ?? "");
  if (!cycleId) return { error: "Ciclo não encontrado." };

  let avaliarRaw: unknown;
  let percentuaisRaw: unknown;
  try {
    avaliarRaw = JSON.parse(String(formData.get("avaliar") ?? "{}"));
    percentuaisRaw = JSON.parse(String(formData.get("percentuais") ?? "{}"));
  } catch {
    return { error: "Dados inválidos. Recarregue a página e tente novamente." };
  }

  const percentuaisParsed = percentuaisSchema.safeParse(percentuaisRaw);
  if (!percentuaisParsed.success) return { error: "Os percentuais informados são inválidos." };

  const soma = Object.values(percentuaisParsed.data).reduce((a, b) => a + b, 0);
  if (Math.round(soma) !== 100) {
    return { error: `Os percentuais precisam somar 100% (hoje somam ${Math.round(soma)}%).` };
  }

  const avaliarParsed = avaliarSchema.safeParse({
    ...(avaliarRaw as object),
    completed_at: new Date().toISOString(),
  });
  if (!avaliarParsed.success) return { error: "Confira os valores preenchidos e tente novamente." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("cycles")
    .update({ avaliar: avaliarParsed.data, percentuais: percentuaisParsed.data })
    .eq("id", cycleId)
    .eq("family_id", profile.id);

  if (error) return { error: "Não foi possível salvar. Tente novamente." };

  revalidatePath("/dashboard");
  redirect("/ciclo/planejar");
}
