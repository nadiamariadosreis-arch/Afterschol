"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Material } from "@/lib/supabase/types";

const IMAGE_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function uploadCover(materialId: string, file: File): Promise<string | null> {
  const extension = IMAGE_EXTENSION[file.type] ?? "jpg";
  const path = `materiais/${materialId}.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const admin = createAdminClient();
  const { error } = await admin.storage.from("covers").upload(path, bytes, {
    contentType: file.type || "image/jpeg",
    upsert: true,
  });

  return error ? null : path;
}

function readMaterialFields(formData: FormData) {
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

export async function createMaterialAction(formData: FormData) {
  await requireAdmin();

  const fields = readMaterialFields(formData);
  const pdfPath = String(formData.get("pdfPath") ?? "").trim();
  if (!fields.title) return;

  const supabase = await createClient();
  const { data: material, error } = await supabase
    .from("materials")
    .insert({ ...fields, pdf_path: pdfPath || null })
    .select("id")
    .single();

  if (error || !material) {
    redirect(
      `/admin/materiais?error=${encodeURIComponent(error?.message ?? "Não foi possível criar o material.")}`,
    );
  }

  const cover = formData.get("cover") as File | null;
  if (cover && cover.size > 0) {
    const path = await uploadCover(material.id, cover);
    if (path) {
      const admin = createAdminClient();
      await admin.from("materials").update({ cover_image_path: path }).eq("id", material.id);
    }
  }

  revalidatePath("/admin/materiais");
  revalidatePath("/dashboard");
}

export async function updateMaterialAction(formData: FormData) {
  await requireAdmin();

  const materialId = String(formData.get("materialId") ?? "");
  if (!materialId) return;

  const fields = readMaterialFields(formData);
  const pdfPath = String(formData.get("pdfPath") ?? "").trim();

  const update: Partial<Material> = { ...fields };
  if (pdfPath) update.pdf_path = pdfPath;

  const supabase = await createClient();
  const { error } = await supabase.from("materials").update(update).eq("id", materialId);

  if (error) {
    redirect(`/admin/materiais?error=${encodeURIComponent(error.message)}`);
  }

  const cover = formData.get("cover") as File | null;
  if (cover && cover.size > 0) {
    const path = await uploadCover(materialId, cover);
    if (path) {
      const admin = createAdminClient();
      await admin.from("materials").update({ cover_image_path: path }).eq("id", materialId);
    }
  }

  revalidatePath("/admin/materiais");
  revalidatePath("/dashboard");
}

export async function deleteMaterialAction(formData: FormData) {
  await requireAdmin();

  const materialId = String(formData.get("materialId") ?? "");
  if (!materialId) return;

  const supabase = await createClient();
  await supabase.from("materials").delete().eq("id", materialId);

  revalidatePath("/admin/materiais");
  revalidatePath("/dashboard");
}
