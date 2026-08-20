"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

type ResetState = { error: string | null; success: boolean };

export async function requestPasswordReset(
  _prevState: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Informe seu e-mail.", success: false };

  const supabase = await createClient();
  const originHeader = (await headers()).get("origin");
  const origin = originHeader ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/redefinir-senha`,
  });

  if (error) return { error: error.message, success: false };
  return { error: null, success: true };
}
