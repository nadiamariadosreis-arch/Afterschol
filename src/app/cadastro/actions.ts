"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SignupState = { error?: string; confirmEmail?: boolean; email?: string };

export async function signupAction(_prevState: SignupState, formData: FormData): Promise<SignupState> {
  const familyName = String(formData.get("familyName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!familyName || !email || !password) {
    return { error: "Preencha todos os campos." };
  }
  if (password.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { family_name: familyName },
      emailRedirectTo: `${origin}/auth/confirm?next=/dashboard`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already")) {
      return { error: "Já existe uma conta com este e-mail. Faça login." };
    }
    return { error: "Não foi possível criar sua conta. Tente novamente." };
  }

  // If e-mail confirmation is required, Supabase returns a user with no session yet.
  if (data.user && !data.session) {
    return { confirmEmail: true, email };
  }

  redirect("/dashboard");
}
