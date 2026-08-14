import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { PERCENTUAL_IDEAL, type Cycle } from "./types";
import { currentCycleDate, pilarStatus } from "./calc";

type TypedSupabase = SupabaseClient<Database>;

export {
  currentCycleDate,
  cycleLabel,
  pilarStatus,
  cycleProgress,
  rendaRealPorProcesso,
  totalRendaReal,
  comparativo,
  gerarItensExecucao,
} from "./calc";

/**
 * Data intelligence: returns the cycle the family should be working on.
 *
 * If the most recent cycle isn't fully closed yet (some pilar missing),
 * the family keeps working on it — even if a new calendar month has
 * already started, so nothing from a late month gets skipped. Only once
 * a cycle is fully closed (all 4 pilares) does the platform open a new
 * one for the current calendar month.
 */
export async function getOrCreateActiveCycle(
  supabase: TypedSupabase,
  familyId: string,
): Promise<Cycle> {
  const { data: latest } = await supabase
    .from("cycles")
    .select("*")
    .eq("family_id", familyId)
    .order("year", { ascending: false })
    .order("month", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latest) {
    const cycle = latest as Cycle;
    const status = pilarStatus(cycle);
    const closed = status.avaliar && status.planejar && status.fazer_acontecer && status.acompanhar;
    const { year, month } = currentCycleDate();
    const isCurrentMonth = cycle.year === year && cycle.month === month;
    if (!closed || isCurrentMonth) return cycle;
  }

  const { year, month } = currentCycleDate();
  const { data: created, error } = await supabase
    .from("cycles")
    .insert({
      family_id: familyId,
      year,
      month,
      percentuais: latest ? (latest as Cycle).percentuais : PERCENTUAL_IDEAL,
    })
    .select("*")
    .single();

  if (error || !created) {
    throw new Error("Não foi possível iniciar o ciclo do mês.");
  }

  return created as Cycle;
}

export async function getPreviousCycle(
  supabase: TypedSupabase,
  familyId: string,
  cycle: Cycle,
): Promise<Cycle | null> {
  const prevMonth = cycle.month === 1 ? 12 : cycle.month - 1;
  const prevYear = cycle.month === 1 ? cycle.year - 1 : cycle.year;

  const { data } = await supabase
    .from("cycles")
    .select("*")
    .eq("family_id", familyId)
    .eq("year", prevYear)
    .eq("month", prevMonth)
    .maybeSingle();

  return (data as Cycle) ?? null;
}

export async function getCycleById(
  supabase: TypedSupabase,
  familyId: string,
  cycleId: string,
): Promise<Cycle | null> {
  const { data } = await supabase
    .from("cycles")
    .select("*")
    .eq("family_id", familyId)
    .eq("id", cycleId)
    .maybeSingle();

  return (data as Cycle) ?? null;
}

/** Recent cycles for the Histórico page, most recent first, capped at 12 months. */
export async function listRecentCycles(supabase: TypedSupabase, familyId: string): Promise<Cycle[]> {
  const { data } = await supabase
    .from("cycles")
    .select("*")
    .eq("family_id", familyId)
    .order("year", { ascending: false })
    .order("month", { ascending: false })
    .limit(12);

  return (data as Cycle[]) ?? [];
}
