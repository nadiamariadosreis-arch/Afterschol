"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function scheduleContentPiece(
  profileId: string,
  pieceId: string,
  date: string | null,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("content_pieces")
    .update({ scheduled_date: date, status: date ? "agendado" : "pauta" })
    .eq("id", pieceId);
  if (error) throw new Error(error.message);

  revalidatePath(`/perfil/${profileId}/calendario`);
}

export async function finishCalendar(profileId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("profiles")
    .update({ status: "ativo" })
    .eq("id", profileId);

  redirect(`/perfil/${profileId}/grid`);
}
