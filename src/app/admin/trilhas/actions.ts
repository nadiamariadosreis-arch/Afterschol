"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createWeekAction(formData: FormData) {
  await requireAdmin();

  const trackId = String(formData.get("trackId") ?? "");
  const trackSlug = String(formData.get("trackSlug") ?? "");
  const virtueId = String(formData.get("virtueId") ?? "");
  const weekNumber = Number(formData.get("weekNumber"));
  const releaseDate = String(formData.get("releaseDate") ?? "");
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const file = formData.get("activity") as File | null;

  if (!trackId || !virtueId || !weekNumber || !releaseDate) return;

  const supabase = await createClient();
  const { data: week, error } = await supabase
    .from("weeks")
    .insert({
      track_id: trackId,
      virtue_id: virtueId,
      week_number: weekNumber,
      release_date: releaseDate,
      video_url: videoUrl || null,
    })
    .select("id")
    .single();

  if (error || !week) return;

  if (file && file.size > 0) {
    await uploadActivity(week.id, file);
  }

  revalidatePath(`/admin/trilhas/${trackSlug}`);
}

export async function updateWeekAction(formData: FormData) {
  await requireAdmin();

  const weekId = String(formData.get("weekId") ?? "");
  const trackSlug = String(formData.get("trackSlug") ?? "");
  const releaseDate = String(formData.get("releaseDate") ?? "");
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const file = formData.get("activity") as File | null;

  if (!weekId) return;

  const supabase = await createClient();
  await supabase
    .from("weeks")
    .update({ release_date: releaseDate, video_url: videoUrl || null })
    .eq("id", weekId);

  if (file && file.size > 0) {
    await uploadActivity(weekId, file);
  }

  revalidatePath(`/admin/trilhas/${trackSlug}`);
}

async function uploadActivity(weekId: string, file: File) {
  const admin = createAdminClient();
  const path = `atividades/${weekId}.pdf`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  await admin.storage.from("content").upload(path, bytes, {
    contentType: "application/pdf",
    upsert: true,
  });

  await admin.from("weeks").update({ activity_pdf_path: path }).eq("id", weekId);
}
