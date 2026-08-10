"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { TagType } from "@/lib/supabase/types";

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createTagAction(formData: FormData) {
  await requireAdmin();

  const type = formData.get("type") as TagType | null;
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!type || !name) return;

  const supabase = await createClient();
  await supabase.from("tags").insert({
    type,
    name,
    slug: slugify(name),
    description: description || null,
  });

  revalidatePath("/admin/tags");
}

export async function deleteTagAction(formData: FormData) {
  await requireAdmin();

  const tagId = String(formData.get("tagId") ?? "");
  if (!tagId) return;

  const supabase = await createClient();
  await supabase.from("tags").delete().eq("id", tagId);

  revalidatePath("/admin/tags");
}
