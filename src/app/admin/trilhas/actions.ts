"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Week, WeekDay } from "@/lib/supabase/types";

export async function createWeekAction(formData: FormData) {
  await requireAdmin();

  const trackId = String(formData.get("trackId") ?? "");
  const trackSlug = String(formData.get("trackSlug") ?? "");
  const virtueId = String(formData.get("virtueId") ?? "");
  const weekNumber = Number(formData.get("weekNumber"));
  const releaseDate = String(formData.get("releaseDate") ?? "");
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const activityPath = String(formData.get("activityPath") ?? "").trim();

  if (!trackId || !virtueId || !weekNumber || !releaseDate) return;

  const supabase = await createClient();
  const { error } = await supabase.from("weeks").insert({
    track_id: trackId,
    virtue_id: virtueId,
    week_number: weekNumber,
    release_date: releaseDate,
    video_url: videoUrl || null,
    description: description || null,
    activity_pdf_path: activityPath || null,
  });

  if (error) {
    redirect(`/admin/trilhas/${trackSlug}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/admin/trilhas/${trackSlug}`);
  revalidatePath(`/trilhas/${trackSlug}`);
}

export async function updateWeekAction(formData: FormData) {
  await requireAdmin();

  const weekId = String(formData.get("weekId") ?? "");
  const trackSlug = String(formData.get("trackSlug") ?? "");
  const releaseDate = String(formData.get("releaseDate") ?? "");
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const activityPath = String(formData.get("activityPath") ?? "").trim();

  if (!weekId) return;

  const supabase = await createClient();
  const update: Partial<Week> = {
    release_date: releaseDate,
    video_url: videoUrl || null,
    description: description || null,
  };
  if (activityPath) update.activity_pdf_path = activityPath;

  const { error } = await supabase.from("weeks").update(update).eq("id", weekId);

  if (error) {
    redirect(`/admin/trilhas/${trackSlug}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/admin/trilhas/${trackSlug}`);
  revalidatePath(`/trilhas/${trackSlug}`);
}

export async function createWeekDayAction(formData: FormData) {
  await requireAdmin();

  const weekId = String(formData.get("weekId") ?? "");
  const trackSlug = String(formData.get("trackSlug") ?? "");
  const dayNumber = Number(formData.get("dayNumber"));
  const label = String(formData.get("label") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const pdfPath = String(formData.get("pdfPath") ?? "").trim();

  if (!weekId || !dayNumber || !label) return;

  const supabase = await createClient();
  const { error } = await supabase.from("week_days").insert({
    week_id: weekId,
    day_number: dayNumber,
    label,
    content: content || null,
    pdf_path: pdfPath || null,
  });

  if (error) {
    redirect(`/admin/trilhas/${trackSlug}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/admin/trilhas/${trackSlug}`);
  revalidatePath(`/trilhas/${trackSlug}`);
}

export async function updateWeekDayAction(formData: FormData) {
  await requireAdmin();

  const dayId = String(formData.get("dayId") ?? "");
  const trackSlug = String(formData.get("trackSlug") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const pdfPath = String(formData.get("pdfPath") ?? "").trim();

  if (!dayId || !label) return;

  const supabase = await createClient();
  const update: Partial<WeekDay> = { label, content: content || null };
  if (pdfPath) update.pdf_path = pdfPath;

  const { error } = await supabase.from("week_days").update(update).eq("id", dayId);

  if (error) {
    redirect(`/admin/trilhas/${trackSlug}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/admin/trilhas/${trackSlug}`);
  revalidatePath(`/trilhas/${trackSlug}`);
}

export async function deleteWeekDayAction(formData: FormData) {
  await requireAdmin();

  const dayId = String(formData.get("dayId") ?? "");
  const trackSlug = String(formData.get("trackSlug") ?? "");
  if (!dayId) return;

  const supabase = await createClient();
  await supabase.from("week_days").delete().eq("id", dayId);

  revalidatePath(`/admin/trilhas/${trackSlug}`);
  revalidatePath(`/trilhas/${trackSlug}`);
}

const IMAGE_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function uploadTrackCoverAction(formData: FormData) {
  await requireAdmin();

  const trackId = String(formData.get("trackId") ?? "");
  const trackSlug = String(formData.get("trackSlug") ?? "");
  const file = formData.get("cover") as File | null;
  if (!trackId || !trackSlug || !file || file.size === 0) return;

  const extension = IMAGE_EXTENSION[file.type] ?? "jpg";
  const path = `trilhas/${trackId}.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const admin = createAdminClient();
  await admin.storage.from("covers").upload(path, bytes, {
    contentType: file.type || "image/jpeg",
    upsert: true,
  });
  await admin.from("tracks").update({ cover_image_path: path }).eq("id", trackId);

  revalidatePath(`/admin/trilhas/${trackSlug}`);
  revalidatePath(`/trilhas/${trackSlug}`);
  revalidatePath("/dashboard");
  revalidatePath("/biblioteca");
  revalidatePath("/");
}
