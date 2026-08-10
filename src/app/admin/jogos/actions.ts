"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createJogoAction(formData: FormData) {
  await requireAdmin();

  const titulo = String(formData.get("titulo") ?? "").trim();
  if (!titulo) return;

  const supabase = await createClient();
  const { data: jogo, error } = await supabase
    .from("jogos")
    .insert({ titulo, slug: slugify(titulo), published: false })
    .select("id")
    .single();

  if (error || !jogo) return;

  revalidatePath("/admin/jogos");
  redirect(`/admin/jogos/${jogo.id}`);
}

export async function updateJogoAction(formData: FormData) {
  await requireAdmin();

  const jogoId = String(formData.get("jogoId") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  if (!jogoId || !titulo) return;

  const resumo = String(formData.get("resumo") ?? "").trim();
  const comoJogar = String(formData.get("como_jogar") ?? "").trim();
  const comoAjuda = String(formData.get("como_ajuda") ?? "").trim();
  const videoUrl = String(formData.get("video_url") ?? "").trim();
  const published = formData.get("published") === "on";

  const supabase = await createClient();
  await supabase
    .from("jogos")
    .update({
      titulo,
      slug: slugify(titulo),
      resumo: resumo || null,
      como_jogar: comoJogar || null,
      como_ajuda: comoAjuda || null,
      video_url: videoUrl || null,
      published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", jogoId);

  revalidatePath("/admin/jogos");
  revalidatePath(`/admin/jogos/${jogoId}`);
}

export async function uploadPdfAction(formData: FormData) {
  await requireAdmin();

  const jogoId = String(formData.get("jogoId") ?? "");
  const file = formData.get("pdf") as File | null;
  if (!jogoId || !file || file.size === 0) return;

  const admin = createAdminClient();
  const path = `${jogoId}.pdf`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  await admin.storage.from("jogos-pdf").upload(path, bytes, {
    contentType: "application/pdf",
    upsert: true,
  });

  await admin.from("jogos").update({ pdf_path: path }).eq("id", jogoId);

  revalidatePath(`/admin/jogos/${jogoId}`);
}

export async function uploadCapaAction(formData: FormData) {
  await requireAdmin();

  const jogoId = String(formData.get("jogoId") ?? "");
  const file = formData.get("capa") as File | null;
  if (!jogoId || !file || file.size === 0) return;

  const admin = createAdminClient();
  const extension = file.type === "image/png" ? "png" : "jpg";
  const path = `${jogoId}.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  await admin.storage.from("jogos-capas").upload(path, bytes, {
    contentType: file.type || "image/jpeg",
    upsert: true,
  });

  await admin.from("jogos").update({ capa_path: path }).eq("id", jogoId);

  revalidatePath(`/admin/jogos/${jogoId}`);
}

export async function toggleJogoTagAction(formData: FormData) {
  await requireAdmin();

  const jogoId = String(formData.get("jogoId") ?? "");
  const tagId = String(formData.get("tagId") ?? "");
  const checked = formData.get("checked") === "true";
  if (!jogoId || !tagId) return;

  const supabase = await createClient();
  if (checked) {
    await supabase.from("jogo_tags").delete().eq("jogo_id", jogoId).eq("tag_id", tagId);
  } else {
    await supabase.from("jogo_tags").insert({ jogo_id: jogoId, tag_id: tagId });
  }

  revalidatePath(`/admin/jogos/${jogoId}`);
}

export async function deleteJogoAction(formData: FormData) {
  await requireAdmin();

  const jogoId = String(formData.get("jogoId") ?? "");
  if (!jogoId) return;

  const supabase = await createClient();
  await supabase.from("jogos").delete().eq("id", jogoId);

  revalidatePath("/admin/jogos");
  redirect("/admin/jogos");
}
