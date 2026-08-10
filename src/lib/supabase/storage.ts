import { supabaseUrl } from "./env";

/** Public URL for a path in the public "jogos-capas" storage bucket. */
export function coverImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${supabaseUrl()}/storage/v1/object/public/jogos-capas/${path}`;
}
