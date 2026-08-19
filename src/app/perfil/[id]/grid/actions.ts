"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function reorderGrid(profileId: string, orderedIds: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await Promise.all(
    orderedIds.map((pieceId, index) =>
      supabase.from("content_pieces").update({ grid_order: index }).eq("id", pieceId),
    ),
  );

  revalidatePath(`/perfil/${profileId}/grid`);
}
