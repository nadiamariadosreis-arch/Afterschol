import "server-only";
import { requireMember } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateActiveCycle } from "./ciclo";
import type { Cycle } from "./types";

export async function requireCurrentCycle() {
  const profile = await requireMember();
  const supabase = await createClient();
  const cycle: Cycle = await getOrCreateActiveCycle(supabase, profile.id);
  return { profile, supabase, cycle };
}
