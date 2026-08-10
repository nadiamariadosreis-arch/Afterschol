import { redirect } from "next/navigation";
import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getActiveChildProfileId } from "@/lib/active-profile";
import { hasAccessToTrack } from "@/lib/entitlements";
import { LinkButton } from "@/components/ui/Button";
import { Cover } from "@/components/member/Cover";
import type { ProductCode, Track } from "@/lib/supabase/types";

const LEVEL_LABEL: Record<Track["level"], string> = {
  inicial: "Nível inicial",
  intermediario: "Nível intermediário",
  avancado: "Nível avançado",
};

export default async function DashboardPage() {
  const profile = await requireFamily();
  const activeChildId = await getActiveChildProfileId();
  if (!activeChildId) redirect("/perfis");

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: tracks }, { data: entitlements }, { data: products }, { data: child }] =
    await Promise.all([
      supabase.from("tracks").select("*").order("sort_order"),
      supabase.from("entitlements").select("product_code").eq("family_id", profile.id),
      supabase.from("products").select("*"),
      supabase.from("child_profiles").select("*").eq("id", activeChildId).maybeSingle(),
    ]);

  if (!child) redirect("/perfis");

  const entitlementCodes = (entitlements ?? []).map((e) => e.product_code) as ProductCode[];
  const productByCode = new Map((products ?? []).map((p) => [p.code, p]));

  const { data: progressRows } = await supabase
    .from("progress")
    .select("week_id, completed_at")
    .eq("child_profile_id", activeChildId);
  const completedWeekIds = new Set(
    (progressRows ?? []).filter((p) => p.completed_at).map((p) => p.week_id),
  );

  const trackStats = await Promise.all(
    (tracks ?? []).map(async (track) => {
      const accessible = hasAccessToTrack(entitlementCodes, track);
      if (!accessible) return { track, accessible, total: 0, completed: 0, nextWeekNumber: null as number | null };

      const { data: weeks } = await supabase
        .from("weeks")
        .select("id, week_number")
        .eq("track_id", track.id)
        .lte("release_date", today)
        .order("week_number");

      const releasedWeeks = weeks ?? [];
      const completed = releasedWeeks.filter((w) => completedWeekIds.has(w.id)).length;
      const nextWeek = releasedWeeks.find((w) => !completedWeekIds.has(w.id));

      return {
        track,
        accessible,
        total: releasedWeeks.length,
        completed,
        nextWeekNumber: nextWeek?.week_number ?? null,
      };
    }),
  );

  const overallTotal = trackStats.reduce((sum, t) => sum + t.total, 0);
  const overallCompleted = trackStats.reduce((sum, t) => sum + t.completed, 0);
  const overallPct = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0;

  const nextUp = trackStats.find((t) => t.accessible && t.nextWeekNumber !== null);

  return (
    <div className="flex flex-col gap-10">
      <WelcomeBanner
        childName={child.name}
        overallTotal={overallTotal}
        overallCompleted={overallCompleted}
        overallPct={overallPct}
        nextUp={
          nextUp
            ? { trackSlug: nextUp.track.slug, trackName: nextUp.track.name, weekNumber: nextUp.nextWeekNumber! }
            : null
        }
        hasAnyAccess={trackStats.some((t) => t.accessible)}
      />

      <div>
        <h2 className="font-heading font-semibold text-[24px] text-ink mb-5">Suas trilhas</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {trackStats.map(({ track, accessible, total, completed }) => (
            <TrackCard
              key={track.id}
              track={track}
              accessible={accessible}
              total={total}
              completed={completed}
              productByCode={productByCode}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function WelcomeBanner({
  childName,
  overallTotal,
  overallCompleted,
  overallPct,
  nextUp,
  hasAnyAccess,
}: {
  childName: string;
  overallTotal: number;
  overallCompleted: number;
  overallPct: number;
  nextUp: { trackSlug: string; trackName: string; weekNumber: number } | null;
  hasAnyAccess: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-sm border border-line px-8 py-10 md:px-12 md:py-14"
      style={{ background: "linear-gradient(120deg, #384936, #2e2a22)" }}
    >
      <div className="relative max-w-xl">
        <div className="font-body text-[13px] tracking-[0.28em] uppercase text-gold mb-3">
          Bem-vinda de volta
        </div>
        <h1 className="font-display italic font-semibold text-[36px] md:text-[42px] text-parchment">
          Olá, {childName}!
        </h1>

        {!hasAnyAccess ? (
          <p className="text-parchment/70 mt-4 text-[17px]">
            Assim que uma trilha for liberada para sua família, ela aparece
            aqui.
          </p>
        ) : overallTotal === 0 ? (
          <p className="text-parchment/70 mt-4 text-[17px]">
            As primeiras semanas ainda serão liberadas — volte em breve.
          </p>
        ) : (
          <>
            <p className="text-parchment/70 mt-4 text-[17px]">
              {overallCompleted} de {overallTotal} semanas concluídas
              {overallPct === 100 ? " — tudo em dia! 🎉" : "."}
            </p>
            <div className="h-2 bg-parchment/20 rounded-full overflow-hidden mt-4 max-w-sm">
              <div className="h-full bg-gold" style={{ width: `${overallPct}%` }} />
            </div>

            {nextUp ? (
              <LinkButton
                href={`/trilhas/${nextUp.trackSlug}/semanas/${nextUp.weekNumber}`}
                variant="primary"
                className="mt-7 !bg-gold !border-gold !text-ink"
              >
                Continuar em {nextUp.trackName} — Semana {nextUp.weekNumber}
              </LinkButton>
            ) : (
              <p className="text-parchment/70 mt-6 text-[15px]">
                Todas as semanas liberadas já foram concluídas. 🎉
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TrackCard({
  track,
  accessible,
  total,
  completed,
  productByCode,
}: {
  track: Track;
  accessible: boolean;
  total: number;
  completed: number;
  productByCode: Map<string, { available_for_sale: boolean; checkout_url: string | null }>;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-4 bg-card border border-line rounded-sm overflow-hidden">
      <Cover trackSlug={track.slug} mark={track.name.charAt(0)} className="h-28 w-full" />

      <div className="px-6 pb-6 flex flex-col gap-3 flex-1">
        <div>
          <div className="text-[13px] tracking-[0.15em] uppercase text-moss mb-1">
            {LEVEL_LABEL[track.level]}
          </div>
          <h3 className="font-heading font-semibold text-[22px] text-ink">{track.name}</h3>
        </div>

        {accessible ? (
          <>
            <div className="h-2 bg-parchment-dark rounded-full overflow-hidden border border-line">
              <div className="h-full bg-moss" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-ink/60 text-[14px]">
              {completed} de {total} semana{total === 1 ? "" : "s"} · {pct}%
            </p>
            <LinkButton href={`/trilhas/${track.slug}`} variant="primary" className="mt-auto">
              {completed === 0 ? "Começar" : "Continuar"}
            </LinkButton>
          </>
        ) : (
          <LockedTrack productCode={track.product_code} productByCode={productByCode} />
        )}
      </div>
    </div>
  );
}

function LockedTrack({
  productCode,
  productByCode,
}: {
  productCode: ProductCode;
  productByCode: Map<string, { available_for_sale: boolean; checkout_url: string | null }>;
}) {
  const product = productByCode.get(productCode);
  const canBuy = product?.available_for_sale && product.checkout_url;

  return (
    <div className="flex-1 flex flex-col justify-end gap-3">
      <p className="text-ink/50 text-[15px]">Trilha ainda não adquirida.</p>
      {canBuy ? (
        <LinkButton href={product!.checkout_url!} variant="secondary">
          Adquirir esta trilha
        </LinkButton>
      ) : (
        <span className="inline-flex items-center justify-center rounded-sm px-6 py-2.5 font-body text-[15px] border border-line text-ink/40">
          Em breve
        </span>
      )}
    </div>
  );
}
