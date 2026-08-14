import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { supabaseServiceRoleKey, supabaseUrl } from "./env";

/**
 * Service-role client — bypasses RLS. Server-only: used by the Kiwify
 * webhook to provision family accounts and by the fatura upload route to
 * write to the private storage bucket. Never import this from client
 * components.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(supabaseUrl(), supabaseServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
