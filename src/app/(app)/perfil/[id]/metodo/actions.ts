"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateJSON, summarizeDocument } from "@/lib/ai/client";
import { methodStructurePrompt } from "@/lib/ai/prompts";
import { awardXp, withLevelUpParam } from "@/lib/gamification";
import type { MethodPillar } from "@/lib/types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function ensureMethod(profileId: string, userId: string, supabase: SupabaseServerClient) {
  const { data: existing } = await supabase
    .from("methods")
    .select("id")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existing) return existing.id as string;

  const { data: created, error } = await supabase
    .from("methods")
    .insert({ profile_id: profileId, user_id: userId })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return created.id as string;
}

export async function saveMethodNotes(profileId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const methodId = await ensureMethod(profileId, user.id, supabase);

  const { error } = await supabase
    .from("methods")
    .update({
      desired_result: String(formData.get("desired_result") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      updated_at: new Date().toISOString(),
    })
    .eq("id", methodId);
  if (error) throw new Error(error.message);

  revalidatePath(`/perfil/${profileId}/metodo`);
}

type UploadState = { error: string | null };

export async function uploadMethodSource(
  profileId: string,
  _prevState: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecione um arquivo PDF." };
  }
  if (file.type !== "application/pdf") {
    return { error: "Envie um arquivo em PDF." };
  }
  if (file.size > 15 * 1024 * 1024) {
    return { error: "O PDF deve ter até 15MB." };
  }

  const methodId = await ensureMethod(profileId, user.id, supabase);

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  let summary: string;
  try {
    summary = await summarizeDocument(base64, file.name);
  } catch {
    return { error: "Não foi possível processar esse PDF agora. Tente novamente." };
  }

  const path = `${user.id}/${profileId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("method-materials")
    .upload(path, arrayBuffer, { contentType: "application/pdf" });
  if (uploadError) return { error: uploadError.message };

  const { error: insertError } = await supabase.from("method_sources").insert({
    method_id: methodId,
    profile_id: profileId,
    user_id: user.id,
    title: file.name,
    file_path: path,
    summary,
  });
  if (insertError) return { error: insertError.message };

  revalidatePath(`/perfil/${profileId}/metodo`);
  return { error: null };
}

export async function removeMethodSource(profileId: string, sourceId: string, filePath: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.storage.from("method-materials").remove([filePath]);
  await supabase.from("method_sources").delete().eq("id", sourceId);

  revalidatePath(`/perfil/${profileId}/metodo`);
}

type StructureState = { error: string | null };

export async function generateMethodStructure(
  profileId: string,
  _prevState: StructureState,
): Promise<StructureState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: method } = await supabase
    .from("methods")
    .select("id, desired_result, notes")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!method?.desired_result) {
    return { error: "Descreva o resultado desejado antes de gerar a estrutura." };
  }

  const { data: sources } = await supabase
    .from("method_sources")
    .select("title, summary")
    .eq("method_id", method.id);

  const sourceSummaries = (sources ?? [])
    .filter((s): s is { title: string; summary: string } => Boolean(s.summary))
    .map((s) => ({ title: s.title, summary: s.summary }));

  let structure: { pillars: MethodPillar[]; summary: string };
  try {
    structure = await generateJSON(
      methodStructurePrompt(method.desired_result, method.notes ?? "", sourceSummaries),
    );
  } catch {
    return { error: "Não foi possível gerar a estrutura agora. Tente novamente." };
  }

  const { error } = await supabase
    .from("methods")
    .update({
      pillars: structure.pillars,
      summary: structure.summary,
      updated_at: new Date().toISOString(),
    })
    .eq("id", method.id);
  if (error) return { error: error.message };

  revalidatePath(`/perfil/${profileId}/metodo`);
  return { error: null };
}

export async function saveMethodAndAdvance(
  profileId: string,
  methodId: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let pillars: MethodPillar[] = [];
  try {
    pillars = JSON.parse(String(formData.get("pillars_json") ?? "[]"));
  } catch {
    pillars = [];
  }

  const { error } = await supabase
    .from("methods")
    .update({
      summary: String(formData.get("summary") ?? ""),
      pillars,
      updated_at: new Date().toISOString(),
    })
    .eq("id", methodId);
  if (error) throw new Error(error.message);

  await supabase
    .from("profiles")
    .update({ status: "conteudo" })
    .eq("id", profileId)
    .eq("status", "metodo");

  const progress = await awardXp(supabase, user.id, 40);

  redirect(withLevelUpParam(`/perfil/${profileId}/conteudo`, progress));
}
