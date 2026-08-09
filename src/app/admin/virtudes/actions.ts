"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createVirtueAction(formData: FormData) {
  await requireAdmin();

  const number = Number(formData.get("number"));
  const name = String(formData.get("name") ?? "").trim();
  const file = formData.get("booklet") as File | null;

  if (!number || !name) return;

  const supabase = await createClient();
  const { data: virtue, error } = await supabase
    .from("virtues")
    .insert({ number, name })
    .select("id")
    .single();

  if (error || !virtue) return;

  if (file && file.size > 0) {
    await uploadBooklet(virtue.id, file);
  }

  revalidatePath("/admin/virtudes");
}

export async function replaceBookletAction(formData: FormData) {
  await requireAdmin();

  const virtueId = String(formData.get("virtueId") ?? "");
  const file = formData.get("booklet") as File | null;
  if (!virtueId || !file || file.size === 0) return;

  await uploadBooklet(virtueId, file);
  revalidatePath("/admin/virtudes");
}

async function uploadBooklet(virtueId: string, file: File) {
  const admin = createAdminClient();
  const path = `virtudes/${virtueId}.pdf`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  await admin.storage.from("content").upload(path, bytes, {
    contentType: "application/pdf",
    upsert: true,
  });

  await admin.from("virtues").update({ booklet_pdf_path: path }).eq("id", virtueId);
}
