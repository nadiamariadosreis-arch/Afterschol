import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getActiveChildProfileId } from "@/lib/active-profile";
import { hasAccessToTrack } from "@/lib/entitlements";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Cover } from "@/components/member/Cover";
import { coverImageUrl } from "@/lib/supabase/storage";
import type { ProductCode, Week } from "@/lib/supabase/types";
import { toggleProgressAction } from "@/lib/progress-actions";

type WeekWithVirtue = Week & { virtues: { name: string; number: number } | null };

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

  return (
    <div>
      <SectionHeading eyebrow="Trilha" title={track.name} />

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

      <div className="grid md:grid-cols-2 gap-5">
        {(weeks ?? []).map((week) => {
          const released = week.release_date <= today;
          const completed = completedWeekIds.has(week.id);
          const virtue = week.virtues;

          return (
            <div
              key={week.id}
              className={`flex gap-4 bg-card border border-line rounded-sm overflow-hidden ${
                released ? "" : "opacity-50"
              }`}
            >
              <Cover
                trackSlug={track.slug}
                mark={String(virtue?.number ?? week.week_number)}
                imageUrl={coverImageUrl(track.cover_image_path)}
                className="w-28 shrink-0"
              />

              <div className="py-4 pr-5 flex flex-col gap-2 flex-1 min-w-0">
                <div>
                  <div className="text-[12px] tracking-[0.15em] uppercase text-moss mb-1">
                    Semana {week.week_number}
                  </div>
                  <h3 className="font-heading font-semibold text-[19px] text-ink truncate">
                    {virtue?.name ?? "Virtude"}
                  </h3>
                  {!released ? (
                    <p className="text-ink/50 text-[13px] mt-1">
                      Libera em{" "}
                      {new Date(week.release_date + "T00:00:00").toLocaleDateString("pt-BR")}
                    </p>
                  ) : null}
                </div>

                {released ? (
                  <div className="flex items-center gap-3 mt-auto flex-wrap">
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
