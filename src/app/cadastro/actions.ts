"use server";

import { createClient } from "@/lib/supabase/server";

export async function signUp(_prevState: { error: string | null; success: boolean }, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message, success: false };
  }

  return { error: null, success: true };
}
