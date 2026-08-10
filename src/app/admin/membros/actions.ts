"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function inviteMemberAction(formData: FormData) {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  if (!email) return;

  const admin = createAdminClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName || undefined },
    redirectTo: `${origin}/redefinir-senha`,
  });

  revalidatePath("/admin/membros");
}

export async function setMemberRoleAction(formData: FormData) {
  await requireAdmin();

  const memberId = String(formData.get("memberId") ?? "");
  const role = formData.get("role") === "admin" ? "member" : "admin";
  if (!memberId) return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("id", memberId);

  revalidatePath("/admin/membros");
}
