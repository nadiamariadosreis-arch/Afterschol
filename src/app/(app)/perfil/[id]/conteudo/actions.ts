"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateJSON } from "@/lib/ai/client";
import { contentPiecesPrompt } from "@/lib/ai/prompts";
import { awardXp } from "@/lib/gamification";
import type { ContentFormat, MethodPillar } from "@/lib/types";

interface GeneratedPiece {
  format: ContentFormat;
  theme: string;
  hook: string;
  script: string;
  caption: string;
}

type ContentState = { error: string | null; leveledUpTo?: number };

export async function generateContentPieces(
  profileId: string,
  _prevState: ContentState,
): Promise<ContentState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: niche }, { data: identity }, { data: method }] = await Promise.all([
    supabase
      .from("niches")
      .select("chosen_niche")
      .eq("profile_id", profileId)
      .not("chosen_niche", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("identities")
      .select("content_pillars")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("methods")
      .select("desired_result, summary, pillars")
      .eq("profile_id", profileId)
      .not("summary", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!niche?.chosen_niche) return { error: "Escolha um nicho antes de gerar conteúdo." };
  const pillars: string[] = identity?.content_pillars ?? [];
  if (pillars.length === 0) return { error: "Defina os pilares de conteúdo na etapa de identidade." };

  const methodContext =
    method?.desired_result && method?.summary
      ? {
          desiredResult: method.desired_result as string,
          summary: method.summary as string,
          pillars: (method.pillars as MethodPillar[]) ?? [],
        }
      : null;

  let pieces: GeneratedPiece[];
  try {
    pieces = await generateJSON<GeneratedPiece[]>(
      contentPiecesPrompt(niche.chosen_niche, pillars, 8, methodContext),
    );
  } catch {
    return { error: "Não foi possível gerar pautas agora. Tente novamente." };
  }

  const { error } = await supabase.from("content_pieces").insert(
    pieces.map((piece) => ({
      profile_id: profileId,
      user_id: user.id,
      format: piece.format,
      theme: piece.theme,
      hook: piece.hook,
      script: piece.script,
      caption: piece.caption,
      status: "pauta",
    })),
  );
  if (error) return { error: error.message };

  await supabase
    .from("profiles")
    .update({ status: "calendario" })
    .eq("id", profileId)
    .eq("status", "conteudo");

  revalidatePath(`/perfil/${profileId}/conteudo`);

  const progress = await awardXp(supabase, user.id, 30);

  return { error: null, leveledUpTo: progress.leveledUp ? progress.level : undefined };
}
