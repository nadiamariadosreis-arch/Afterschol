"use server";

import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseAnonKey } from "@/lib/supabase/env";

/**
 * Signed upload URLs let the browser PUT a file straight into Supabase
 * Storage, bypassing the server entirely. Needed because large PDFs
 * (picture-book booklets, illustrated activities) can exceed Vercel's
 * hard 4.5MB request-body cap for Server Actions/Route Handlers — a
 * platform limit that no Next.js config can raise.
 *
 * Returns the anon key alongside the signed URL so the client never
 * needs to read NEXT_PUBLIC_* env vars itself or instantiate a
 * Supabase client — env vars are read here, server-side, where
 * they're always available regardless of client-bundle inlining.
 */
export async function createPdfUploadUrlAction(
  path: string,
): Promise<{ path: string; token: string; signedUrl: string; anonKey: string } | { error: string }> {
  await requireAdmin();

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("content")
    .createSignedUploadUrl(path, { upsert: true });

  if (error || !data) {
    return { error: error?.message ?? "Não foi possível preparar o upload." };
  }

  return { path: data.path, token: data.token, signedUrl: data.signedUrl, anonKey: supabaseAnonKey() };
}
