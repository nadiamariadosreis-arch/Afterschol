"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ProductCode } from "@/lib/supabase/types";

export async function inviteFamilyAction(formData: FormData) {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const productCode = formData.get("productCode") as ProductCode | null;
  if (!email) return;

  const admin = createAdminClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName || undefined },
    redirectTo: `${origin}/redefinir-senha`,
  });

  if (error || !data.user) return;

  if (productCode) {
    await admin
      .from("entitlements")
      .insert({ family_id: data.user.id, product_code: productCode, source: "manual" });
  }

  revalidatePath("/admin/familias");
}

export async function grantEntitlementAction(formData: FormData) {
  await requireAdmin();

  const familyId = String(formData.get("familyId") ?? "");
  const productCode = formData.get("productCode") as ProductCode | null;
  if (!familyId || !productCode) return;

  const supabase = await createClient();
  await supabase
    .from("entitlements")
    .upsert(
      { family_id: familyId, product_code: productCode, source: "manual" },
      { onConflict: "family_id,product_code" },
    );

  revalidatePath("/admin/familias");
}

export async function revokeEntitlementAction(formData: FormData) {
  await requireAdmin();

  const entitlementId = String(formData.get("entitlementId") ?? "");
  if (!entitlementId) return;

  const supabase = await createClient();
  await supabase.from("entitlements").delete().eq("id", entitlementId);

  revalidatePath("/admin/familias");
}
