"use server";

import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Signed upload URLs let the browser PUT a file straight into Supabase
 * Storage, bypassing the server entirely. Needed because large PDFs
 * (picture-book booklets, illustrated activities) can exceed Vercel's
 * hard 4.5MB request-body cap for Server Actions/Route Handlers — a
 * platform limit that no Next.js config can raise.
 */
export async function createPdfUploadUrlAction(
  path: string,
): Promise<{ path: string; token: string; signedUrl: string } | { error: string }> {
  await requireAdmin();

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("content")
    .createSignedUploadUrl(path, { upsert: true });

  if (error || !data) {
    return { error: error?.message ?? "Não foi possível preparar o upload." };
  }

  return { path: data.path, token: data.token, signedUrl: data.signedUrl };
}
