"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveChildProfileId } from "@/lib/active-profile";

export async function toggleProgressAction(formData: FormData) {
  const weekId = String(formData.get("weekId") ?? "");
  const trackSlug = String(formData.get("trackSlug") ?? "");
  const weekNumber = String(formData.get("weekNumber") ?? "");
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

  revalidatePath(`/trilhas/${trackSlug}/semanas/${weekNumber}`);
  revalidatePath(`/trilhas/${trackSlug}`);
  revalidatePath("/dashboard");
}
