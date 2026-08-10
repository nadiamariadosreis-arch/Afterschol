import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getActiveChildProfileId } from "@/lib/active-profile";
import { hasAccessToTrack } from "@/lib/entitlements";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ProductCode, Week } from "@/lib/supabase/types";
import { toggleProgressAction } from "@/lib/progress-actions";

type WeekWithVirtue = Week & { virtues: { name: string; number: number } | null };

const BANNER_SHADES: Record<string, string[]> = {
  letras: ["#4a5d45", "#63795c", "#384936"],
  silabas: ["#a4644c", "#bd8267", "#7c4632"],
  gramatica: ["#333a4d", "#525f7d", "#262c3d"],
};

export default async function TrackPage({
  params,
}: {
  params: Promise<{ trackSlug: string }>;
}) {
  const { trackSlug } = await params;
  const profile = await requireFamily();
  const activeChildId = await getActiveChildProfileId();
  if (!activeChildId) redirect("/perfis");

  const supabase = await createClient();

  const { data: track } = await supabase
    .from("tracks")
    .select("*")
    .eq("slug", trackSlug)
    .maybeSingle();

  if (!track) notFound();

  const { data: entitlements } = await supabase
    .from("entitlements")
    .select("product_code")
    .eq("family_id", profile.id);

  const entitlementCodes = (entitlements ?? []).map((e) => e.product_code) as ProductCode[];
  if (!hasAccessToTrack(entitlementCodes, track)) {
    redirect("/dashboard");
  }

  const { data: weeks } = await supabase
    .from("weeks")
    .select("*, virtues(name, number)")
    .eq("track_id", track.id)
    .order("week_number")
    .returns<WeekWithVirtue[]>();

  const { data: progressRows } = await supabase
    .from("progress")
    .select("week_id, completed_at")
    .eq("child_profile_id", activeChildId);

  const completedWeekIds = new Set(
    (progressRows ?? []).filter((p) => p.completed_at).map((p) => p.week_id),
  );

  const today = new Date().toISOString().slice(0, 10);
  const releasedWeeks = (weeks ?? []).filter((w) => w.release_date <= today);
  const completedCount = releasedWeeks.filter((w) => completedWeekIds.has(w.id)).length;
  const pct = releasedWeeks.length > 0 ? Math.round((completedCount / releasedWeeks.length) * 100) : 0;

  const allWeeksCount = (weeks ?? []).length;
  const allCompletedCount = (weeks ?? []).filter((w) => completedWeekIds.has(w.id)).length;
  const isFullyComplete = allWeeksCount > 0 && allCompletedCount === allWeeksCount;

  const guideWeek = releasedWeeks.find((w) => w.description);

  return (
    <div>
      <SectionHeading eyebrow="Trilha" title={track.name} />

      {guideWeek ? (
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4 bg-gold/10 border border-gold/40 rounded-sm px-6 py-5">
          <div>
            <div className="text-[12px] tracking-[0.18em] uppercase text-terracotta font-semibold mb-1">
              Antes de começar
            </div>
            <p className="font-heading font-semibold text-[19px] text-ink">
              Leia o Guia dos Pais antes de acessar as semanas
            </p>
            <p className="text-ink/60 text-[14px] mt-1">
              São só alguns minutos de leitura — e vai te ajudar a aproveitar
              cada semana com mais confiança e tranquilidade.
            </p>
          </div>
          <LinkButton
            href={`/trilhas/${track.slug}/semanas/${guideWeek.week_number}?tab=guia`}
            variant="primary"
            className="shrink-0"
          >
            Ler o Guia dos Pais →
          </LinkButton>
        </div>
      ) : null}

      {releasedWeeks.length > 0 ? (
        <div className="mb-8 max-w-sm">
          <div className="h-2 bg-parchment-dark rounded-full overflow-hidden border border-line">
            <div className="h-full bg-moss" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-ink/60 text-[14px] mt-2">
            {completedCount} de {releasedWeeks.length} semanas concluídas · {pct}%
          </p>
        </div>
      ) : null}

      {isFullyComplete ? (
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4 bg-card border border-gold rounded-sm px-6 py-5">
          <div>
            <p className="font-heading font-semibold text-[20px] text-ink">
              🎓 Trilha concluída!
            </p>
            <p className="text-ink/60 text-[14px]">
              Todas as semanas desta trilha foram concluídas — baixe o certificado.
            </p>
          </div>
          <LinkButton href={`/api/certificado/${track.slug}`} variant="secondary">
            Baixar certificado
          </LinkButton>
        </div>
      ) : null}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(weeks ?? []).map((week, index) => {
          const released = week.release_date <= today;
          const completed = completedWeekIds.has(week.id);
          const virtue = week.virtues;
          const shades = BANNER_SHADES[track.slug] ?? BANNER_SHADES.letras;
          const bannerColor = shades[index % shades.length];

          return (
            <div
              key={week.id}
              className={`flex flex-col rounded-[18px] shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-card ${
                released ? "" : "opacity-60"
              }`}
            >
              <div
                className="h-24 flex items-center justify-center"
                style={{ backgroundColor: bannerColor }}
              >
                <span className="font-heading font-semibold text-[20px] tracking-wide text-parchment">
                  Semana {week.week_number}
                </span>
              </div>

              <div className="p-5 flex flex-col gap-2 flex-1">
                <h3 className="font-heading font-semibold text-[19px] text-ink">
                  {virtue?.name ?? "Virtude"}
                </h3>
                {!released ? (
                  <p className="text-ink/50 text-[13px]">
                    Libera em{" "}
                    {new Date(week.release_date + "T00:00:00").toLocaleDateString("pt-BR")}
                  </p>
                ) : null}

                {released ? (
                  <div className="flex items-center gap-3 mt-auto pt-2 flex-wrap">
                    <Link
                      href={`/trilhas/${track.slug}/semanas/${week.week_number}`}
                      className="text-navy underline underline-offset-4 text-[14px]"
                    >
                      Abrir
                    </Link>
                    <form action={toggleProgressAction}>
                      <input type="hidden" name="weekId" value={week.id} />
                      <input type="hidden" name="trackSlug" value={track.slug} />
                      <input type="hidden" name="currentlyCompleted" value={String(completed)} />
                      <Button
                        type="submit"
                        variant={completed ? "secondary" : "ghost"}
                        className="!px-3 !py-1 !text-[13px]"
                      >
                        {completed ? "✓ Concluído" : "Concluir"}
                      </Button>
                    </form>
                  </div>
                ) : (
                  <Badge tone="muted">Em breve</Badge>
                )}
              </div>
            </div>
          );
        })}

        {(weeks ?? []).length === 0 ? (
          <p className="text-ink/60">Conteúdo desta trilha ainda será publicado.</p>
        ) : null}
      </div>
    </div>
  );
}
