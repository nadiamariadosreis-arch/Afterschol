"use server";

import { redirect } from "next/navigation";
import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { setActiveChildProfileId } from "@/lib/active-profile";

export async function createChildProfileAction(formData: FormData) {
  const profile = await requireFamily();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const supabase = await createClient();
  const { data } = await supabase
    .from("child_profiles")
    .insert({ family_id: profile.id, name })
    .select("id")
    .single();

  if (data) {
    await setActiveChildProfileId(data.id);
  }

  redirect("/dashboard");
}

export async function selectChildProfileAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await setActiveChildProfileId(id);
  redirect("/dashboard");
}
