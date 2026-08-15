import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { PERCENTUAL_IDEAL, emptyPlanejar, type Cycle } from "./types";
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
  const cicloAnterior = latest ? (latest as Cycle) : null;

  // O Avaliar não precisa ser refeito todo mês: a renda e o checklist do
  // mês anterior já vêm prontos aqui, a família só revisa e ajusta o que
  // mudou. Planejar, Fazer Acontecer e Acompanhar sempre começam do zero.
  const avaliarHerdado = cicloAnterior?.avaliar
    ? { ...cicloAnterior.avaliar, completed_at: new Date().toISOString() }
    : null;

  // As dívidas também se mantêm de mês a mês — só somem quando marcadas
  // como quitadas. O resto do Planejar (reunião, organização do mês,
  // cartão) começa do zero, então herda só a lista de dívidas em aberto.
  const dividasEmAberto = cicloAnterior?.planejar?.dividas.filter((d) => !d.quitada) ?? [];
  const planejarHerdado = cicloAnterior ? { ...emptyPlanejar(), dividas: dividasEmAberto } : null;

  const { data: created, error } = await supabase
    .from("cycles")
    .insert({
      family_id: familyId,
      year,
      month,
      percentuais: cicloAnterior ? cicloAnterior.percentuais : PERCENTUAL_IDEAL,
      avaliar: avaliarHerdado,
      planejar: planejarHerdado,
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
