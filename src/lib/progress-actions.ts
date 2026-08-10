"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveChildProfileId } from "@/lib/active-profile";

/**
 * Shared by the week detail page and the week/track cards on the
 * dashboard — both need to flip a week's completion state for the
 * active child and see the change reflected immediately.
 */
export async function toggleProgressAction(formData: FormData) {
  const weekId = String(formData.get("weekId") ?? "");
  const trackSlug = String(formData.get("trackSlug") ?? "");
  const currentlyCompleted = formData.get("currentlyCompleted") === "true";

  const childProfileId = await getActiveChildProfileId();
  if (!childProfileId || !weekId) return;

  const supabase = await createClient();

  await supabase
    .from("progress")
    .upsert(
      {
        child_profile_id: childProfileId,
        week_id: weekId,
        completed_at: currentlyCompleted ? null : new Date().toISOString(),
      },
      { onConflict: "child_profile_id,week_id" },
    );

  if (trackSlug) revalidatePath(`/trilhas/${trackSlug}`, "layout");
  revalidatePath("/dashboard");
}
