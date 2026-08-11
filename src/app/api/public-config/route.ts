import { NextResponse } from "next/server";
import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase/env";

/**
 * Hands the browser Supabase client its URL/anon key at runtime instead
 * of relying on NEXT_PUBLIC_* vars being inlined into the client bundle
 * at build time. Both values are meant to be public (that's the point of
 * the NEXT_PUBLIC_ prefix), so exposing them here is not a secret leak —
 * it just makes the browser client resilient to build-time env gaps.
 */
export async function GET() {
  return NextResponse.json({ url: supabaseUrl(), anonKey: supabaseAnonKey() });
}
