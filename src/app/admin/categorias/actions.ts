"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  if (!name) return;

  const supabase = await createClient();
  const { error } = await supabase.from("game_categories").insert({ name, sort_order: sortOrder });

  if (error) {
    redirect(`/admin/categorias?error=${encodeURIComponent(error.message)}`);
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
    .from("game_categories")
    .update({ name, sort_order: sortOrder })
    .eq("id", categoryId);

  if (error) {
    redirect(`/admin/categorias?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/dashboard");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();

  const categoryId = String(formData.get("categoryId") ?? "");
  if (!categoryId) return;

  const supabase = await createClient();
  await supabase.from("game_categories").delete().eq("id", categoryId);

  revalidatePath("/admin/categorias");
  revalidatePath("/dashboard");
}
