"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const IMAGE_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function uploadCover(categoryId: string, file: File): Promise<string | null> {
  const extension = IMAGE_EXTENSION[file.type] ?? "jpg";
  const path = `categorias/${categoryId}.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const admin = createAdminClient();
  const { error } = await admin.storage.from("covers").upload(path, bytes, {
    contentType: file.type || "image/jpeg",
    upsert: true,
  });

  return error ? null : path;
}

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  if (!name) return;

  const supabase = await createClient();
  const { data: category, error } = await supabase
    .from("categories")
    .insert({ name, sort_order: sortOrder })
    .select("id")
    .single();

  if (error || !category) {
    redirect(
      `/admin/categorias?error=${encodeURIComponent(error?.message ?? "Não foi possível criar a categoria.")}`,
    );
  }

  const cover = formData.get("cover") as File | null;
  if (cover && cover.size > 0) {
    const path = await uploadCover(category.id, cover);
    if (path) {
      const admin = createAdminClient();
      await admin.from("categories").update({ cover_image_path: path }).eq("id", category.id);
    }
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/dashboard");
}

export async function updateCategoryAction(formData: FormData) {
  await requireAdmin();

  const categoryId = String(formData.get("categoryId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  if (!categoryId || !name) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ name, sort_order: sortOrder })
    .eq("id", categoryId);

  if (error) {
    redirect(`/admin/categorias?error=${encodeURIComponent(error.message)}`);
  }

  const cover = formData.get("cover") as File | null;
  if (cover && cover.size > 0) {
    const path = await uploadCover(categoryId, cover);
    if (path) {
      const admin = createAdminClient();
      await admin.from("categories").update({ cover_image_path: path }).eq("id", categoryId);
    }
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/dashboard");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();

  const categoryId = String(formData.get("categoryId") ?? "");
  if (!categoryId) return;

  const supabase = await createClient();
  await supabase.from("categories").delete().eq("id", categoryId);

  revalidatePath("/admin/categorias");
  revalidatePath("/dashboard");
}
