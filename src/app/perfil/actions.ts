"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("profiles")
    .insert({ user_id: user.id, title: "Novo perfil", status: "nicho" })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Não foi possível criar o perfil");
  }

  redirect(`/perfil/${data.id}/nicho`);
}
