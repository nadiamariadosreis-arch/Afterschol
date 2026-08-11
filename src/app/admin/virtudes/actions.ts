"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function createVirtueAction(formData: FormData) {
  await requireAdmin();

  const number = Number(formData.get("number"));
  const name = String(formData.get("name") ?? "").trim();
  const bookletPath = String(formData.get("bookletPath") ?? "").trim();

  if (!number || !name) return;

  const supabase = await createClient();
  const { error } = await supabase.from("virtues").insert({
    number,
    name,
    booklet_pdf_path: bookletPath || null,
  });

  if (error) {
    redirect(`/admin/virtudes?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/virtudes");
}

export async function replaceBookletAction(formData: FormData) {
  await requireAdmin();

  const virtueId = String(formData.get("virtueId") ?? "");
  const bookletPath = String(formData.get("bookletPath") ?? "").trim();
  if (!virtueId || !bookletPath) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("virtues")
    .update({ booklet_pdf_path: bookletPath })
    .eq("id", virtueId);

  if (error) {
    redirect(`/admin/virtudes?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/virtudes");
}
