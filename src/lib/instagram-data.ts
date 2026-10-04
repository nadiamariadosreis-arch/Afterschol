import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { IgPost, IgTheme } from "@/lib/supabase/types";

export type ThemeWithPosts = IgTheme & { posts: IgPost[] };

/** Temas (em ordem) com os seus posts (em ordem) de um perfil. */
export async function loadMatrix(accountId: string) {
  const supabase = await createClient();
  const [{ data: themes }, { data: posts }] = await Promise.all([
    supabase.from("ig_themes").select("*").eq("account_id", accountId).order("position"),
    supabase.from("ig_posts").select("*").eq("account_id", accountId).order("position"),
  ]);

  const allPosts = posts ?? [];
  const matrix: ThemeWithPosts[] = (themes ?? []).map((theme) => ({
    ...theme,
    posts: allPosts.filter((post) => post.theme_id === theme.id),
  }));
  const themeById = new Map(matrix.map((theme) => [theme.id, theme]));

  return { matrix, posts: allPosts, themeById };
}

export function themeLabel(theme: IgTheme | undefined) {
  if (!theme) return "";
  return theme.name.trim() || `Tema ${theme.position}`;
}
