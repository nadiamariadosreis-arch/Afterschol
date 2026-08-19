"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateJSON } from "@/lib/ai/client";
import { nicheSuggestionsPrompt } from "@/lib/ai/prompts";
import type { NicheSuggestion } from "@/lib/types";

export async function generateNicheSuggestions(
  profileId: string,
  _prevState: { error: string | null },
  formData: FormData,
) {
  const interest = String(formData.get("interest") ?? "").trim();
  if (!interest) return { error: "Descreva um interesse ou área de competência." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let suggestions: NicheSuggestion[];
  try {
    suggestions = await generateJSON<NicheSuggestion[]>(nicheSuggestionsPrompt(interest));
  } catch {
    return { error: "Não foi possível gerar sugestões agora. Tente novamente." };
  }

  const { error } = await supabase.from("niches").insert({
    profile_id: profileId,
    user_id: user.id,
    input_interest: interest,
    suggestions,
  });

  if (error) return { error: error.message };

  revalidatePath(`/perfil/${profileId}/nicho`);
  return { error: null };
}

export async function chooseNiche(profileId: string, nicheId: string, index: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: nicheRow, error: fetchError } = await supabase
    .from("niches")
    .select("suggestions")
    .eq("id", nicheId)
    .single<{ suggestions: NicheSuggestion[] }>();
  if (fetchError || !nicheRow) throw new Error(fetchError?.message ?? "Nicho não encontrado");

  const suggestion = nicheRow.suggestions[index];
  if (!suggestion) throw new Error("Sugestão inválida");

  const { error: nicheError } = await supabase
    .from("niches")
    .update({
      chosen_niche: suggestion.niche,
      chosen_audience: suggestion.audience,
      chosen_rationale: suggestion.rationale,
    })
    .eq("id", nicheId);
  if (nicheError) throw new Error(nicheError.message);

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ status: "identidade", title: suggestion.niche })
    .eq("id", profileId);
  if (profileError) throw new Error(profileError.message);

  redirect(`/perfil/${profileId}/identidade`);
}
