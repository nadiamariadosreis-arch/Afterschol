import { redirect } from "next/navigation";
import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getActiveChildProfileId } from "@/lib/active-profile";
import { hasAccessToTrack } from "@/lib/entitlements";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
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

  const trackStats = await Promise.all(
    (tracks ?? []).map(async (track) => {
      const accessible = hasAccessToTrack(entitlementCodes, track);
      if (!accessible) return { track, accessible, total: 0, completed: 0 };

      const { data: weeks } = await supabase
        .from("weeks")
        .select("id")
        .eq("track_id", track.id)
        .lte("release_date", today);

      const weekIds = (weeks ?? []).map((w) => w.id);
      let completed = 0;
      if (weekIds.length > 0) {
        const { count } = await supabase
          .from("progress")
          .select("id", { count: "exact", head: true })
          .eq("child_profile_id", activeChildId)
          .in("week_id", weekIds)
          .not("completed_at", "is", null);
        completed = count ?? 0;
      }

      return { track, accessible, total: weekIds.length, completed };
    }),
  );

  return (
    <div>
      <SectionHeading eyebrow={`Perfil de ${child.name}`} title="Seu progresso" />

      <div className="grid md:grid-cols-3 gap-6">
        {trackStats.map(({ track, accessible, total, completed }) => (
          <Card key={track.id} className="flex flex-col gap-4">
            <div>
              <div className="text-[13px] tracking-[0.15em] uppercase text-moss mb-1">
                {LEVEL_LABEL[track.level]}
              </div>
              <h3 className="font-heading font-semibold text-[22px] text-ink">
                {track.name}
              </h3>
            </div>

            {accessible ? (
              <>
                <ProgressBar total={total} completed={completed} />
                <p className="text-ink/60 text-[14px]">
                  {completed} de {total} semana{total === 1 ? "" : "s"} liberadas concluídas
                </p>
                <LinkButton href={`/trilhas/${track.slug}`} variant="primary">
                  Continuar
                </LinkButton>
              </>
            ) : (
              <LockedTrack productCode={track.product_code} productByCode={productByCode} />
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProgressBar({ total, completed }: { total: number; completed: number }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="h-2 bg-parchment-dark rounded-full overflow-hidden border border-line">
      <div className="h-full bg-moss" style={{ width: `${pct}%` }} />
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
