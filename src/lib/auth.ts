import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return profile ?? null;
}

export async function requireMember(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}

/** O acesso pago (Planejar, Fazer Acontecer, Acompanhar) vale por 1 ano da compra. */
export function temAcessoPago(profile: Pick<Profile, "paid" | "paid_until">): boolean {
  if (!profile.paid) return false;
  if (!profile.paid_until) return true;
  return new Date(profile.paid_until) > new Date();
}
