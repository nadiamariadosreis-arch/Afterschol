"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function updateProductAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const checkoutUrl = String(formData.get("checkoutUrl") ?? "").trim();
  const availableForSale = formData.get("availableForSale") === "on";
  if (!id) return;

  const supabase = await createClient();
  await supabase
    .from("products")
    .update({
      checkout_url: checkoutUrl || null,
      available_for_sale: availableForSale,
    })
    .eq("id", id);

  revalidatePath("/admin/produtos");
  revalidatePath("/");
}
