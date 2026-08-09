import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { supabaseServiceRoleKey, supabaseUrl } from "./env";

/**
 * Service-role client — bypasses RLS. Server-only: used to read the
 * private `content` storage bucket (e.g. to stamp a watermark before
 * streaming a PDF) and by admin server actions. Never import this from
 * client components.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(supabaseUrl(), supabaseServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
