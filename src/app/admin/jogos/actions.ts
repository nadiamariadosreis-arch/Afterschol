"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Game } from "@/lib/supabase/types";

const IMAGE_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function uploadCover(gameId: string, file: File): Promise<string | null> {
  const extension = IMAGE_EXTENSION[file.type] ?? "jpg";
  const path = `jogos/${gameId}.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const admin = createAdminClient();
  const { error } = await admin.storage.from("covers").upload(path, bytes, {
    contentType: file.type || "image/jpeg",
    upsert: true,
  });

  return error ? null : path;
}

function readGameFields(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    category_id: String(formData.get("categoryId") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    age_range: String(formData.get("ageRange") ?? "").trim() || null,
    video_url: String(formData.get("videoUrl") ?? "").trim() || null,
    instructions: String(formData.get("instructions") ?? "").trim() || null,
    sort_order: Number(formData.get("sortOrder") ?? 0),
  };
}

export async function createGameAction(formData: FormData) {
  await requireAdmin();

  const fields = readGameFields(formData);
  const pdfPath = String(formData.get("pdfPath") ?? "").trim();
  if (!fields.title) return;

  const supabase = await createClient();
  const { data: game, error } = await supabase
    .from("games")
    .insert({ ...fields, pdf_path: pdfPath || null })
    .select("id")
    .single();

  if (error || !game) {
    redirect(`/admin/jogos?error=${encodeURIComponent(error?.message ?? "Não foi possível criar o jogo.")}`);
  }

  const cover = formData.get("cover") as File | null;
  if (cover && cover.size > 0) {
    const path = await uploadCover(game.id, cover);
    if (path) {
      const admin = createAdminClient();
      await admin.from("games").update({ cover_image_path: path }).eq("id", game.id);
    }
  }

  revalidatePath("/admin/jogos");
  revalidatePath("/dashboard");
}

export async function updateGameAction(formData: FormData) {
  await requireAdmin();

  const gameId = String(formData.get("gameId") ?? "");
  if (!gameId) return;

  const fields = readGameFields(formData);
  const pdfPath = String(formData.get("pdfPath") ?? "").trim();

  const update: Partial<Game> = { ...fields };
  if (pdfPath) update.pdf_path = pdfPath;

  const supabase = await createClient();
  const { error } = await supabase.from("games").update(update).eq("id", gameId);

  if (error) {
    redirect(`/admin/jogos?error=${encodeURIComponent(error.message)}`);
  }

  const cover = formData.get("cover") as File | null;
  if (cover && cover.size > 0) {
    const path = await uploadCover(gameId, cover);
    if (path) {
      const admin = createAdminClient();
      await admin.from("games").update({ cover_image_path: path }).eq("id", gameId);
    }
  }

  revalidatePath("/admin/jogos");
  revalidatePath("/dashboard");
}

export async function deleteGameAction(formData: FormData) {
  await requireAdmin();

  const gameId = String(formData.get("gameId") ?? "");
  if (!gameId) return;

  const supabase = await createClient();
  await supabase.from("games").delete().eq("id", gameId);

  revalidatePath("/admin/jogos");
  revalidatePath("/dashboard");
}
