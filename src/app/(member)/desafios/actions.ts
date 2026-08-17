"use server";

import { revalidatePath } from "next/cache";
import { requireMember } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { desafioPorChave } from "@/lib/apfa/desafios";

export async function iniciarDesafioAction(chave: string): Promise<void> {
  if (!desafioPorChave(chave)) return;
  const profile = await requireMember();
  const supabase = await createClient();
  await supabase
    .from("desafios_progresso")
    .upsert(
      { family_id: profile.id, chave, iniciado_em: new Date().toISOString(), concluido_em: null },
      { onConflict: "family_id,chave" },
    );
  revalidatePath("/desafios");
}

export async function concluirDesafioAction(chave: string): Promise<void> {
  if (!desafioPorChave(chave)) return;
  const profile = await requireMember();
  const supabase = await createClient();
  await supabase
    .from("desafios_progresso")
    .update({ concluido_em: new Date().toISOString() })
    .eq("family_id", profile.id)
    .eq("chave", chave);
  revalidatePath("/desafios");
}
