"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateJSON } from "@/lib/ai/client";
import { identityBriefPrompt } from "@/lib/ai/prompts";

interface IdentityBrief {
  username_suggestion: string;
  bio: string;
  value_proposition: string;
  tone_of_voice: string;
  color_palette: string[];
  content_pillars: string[];
}

export async function generateIdentity(
  profileId: string,
  _prevState: { error: string | null },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: niche } = await supabase
    .from("niches")
    .select("chosen_niche, chosen_audience")
    .eq("profile_id", profileId)
    .not("chosen_niche", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!niche?.chosen_niche) {
    return { error: "Escolha um nicho antes de gerar a identidade." };
  }

  let brief: IdentityBrief;
  try {
    brief = await generateJSON<IdentityBrief>(
      identityBriefPrompt(niche.chosen_niche, niche.chosen_audience ?? ""),
    );
  } catch {
    return { error: "Não foi possível gerar a identidade agora. Tente novamente." };
  }

  const { error } = await supabase.from("identities").insert({
    profile_id: profileId,
    user_id: user.id,
    username_suggestion: brief.username_suggestion,
    bio: brief.bio,
    value_proposition: brief.value_proposition,
    tone_of_voice: brief.tone_of_voice,
    color_palette: brief.color_palette,
    content_pillars: brief.content_pillars,
  });
  if (error) return { error: error.message };

  revalidatePath(`/perfil/${profileId}/identidade`);
  return { error: null };
}

export async function startManualIdentity(profileId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("identities").insert({
    profile_id: profileId,
    user_id: user.id,
    username_suggestion: "",
    bio: "",
    value_proposition: "",
    tone_of_voice: "",
    color_palette: [],
    content_pillars: [],
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/perfil/${profileId}/identidade`);
}

export async function saveIdentityEdits(profileId: string, identityId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const content_pillars = String(formData.get("content_pillars") ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const color_palette = [1, 2, 3, 4]
    .map((i) => String(formData.get(`color_${i}`) ?? "").trim())
    .filter(Boolean);

  const { error } = await supabase
    .from("identities")
    .update({
      username_suggestion: String(formData.get("username_suggestion") ?? ""),
      bio: String(formData.get("bio") ?? ""),
      value_proposition: String(formData.get("value_proposition") ?? ""),
      tone_of_voice: String(formData.get("tone_of_voice") ?? ""),
      content_pillars,
      color_palette,
      updated_at: new Date().toISOString(),
    })
    .eq("id", identityId);
  if (error) throw new Error(error.message);

  await supabase.from("profiles").update({ status: "conteudo" }).eq("id", profileId);

  redirect(`/perfil/${profileId}/conteudo`);
}
