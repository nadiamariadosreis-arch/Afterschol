"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

let cachedConfig: { url: string; anonKey: string } | null = null;

async function getPublicConfig() {
  if (!cachedConfig) {
    const res = await fetch("/api/public-config");
    cachedConfig = await res.json();
  }
  return cachedConfig!;
}

export async function createClient() {
  const { url, anonKey } = await getPublicConfig();
  return createBrowserClient<Database>(url, anonKey);
}
