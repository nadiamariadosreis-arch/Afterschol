import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getActiveChildProfileId } from "@/lib/active-profile";
import { hasAccessToTrack } from "@/lib/entitlements";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ProductCode, Week } from "@/lib/supabase/types";

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

  return (
    <div>
      <SectionHeading eyebrow="Trilha" title={track.name} />

      <div className="flex flex-col gap-4">
        {(weeks ?? []).map((week) => {
          const released = week.release_date <= today;
          const completed = completedWeekIds.has(week.id);
          const virtue = week.virtues;

          return (
            <Card
              key={week.id}
              className={`flex items-center justify-between gap-4 ${
                released ? "" : "opacity-50"
              }`}
            >
              <div>
                <div className="text-[13px] tracking-[0.15em] uppercase text-moss mb-1">
                  Semana {week.week_number}
                </div>
                <h3 className="font-heading font-semibold text-[20px] text-ink">
                  {virtue?.name ?? "Virtude"}
                </h3>
                {!released ? (
                  <p className="text-ink/50 text-[14px] mt-1">
                    Libera em{" "}
                    {new Date(week.release_date + "T00:00:00").toLocaleDateString("pt-BR")}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center gap-4">
                <Badge tone={completed ? "moss" : "muted"}>
                  {completed ? "Concluído" : "Pendente"}
                </Badge>
                {released ? (
                  <Link
                    href={`/trilhas/${track.slug}/semanas/${week.week_number}`}
                    className="text-navy underline underline-offset-4 text-[15px]"
                  >
                    Abrir
                  </Link>
                ) : null}
              </div>
            </Card>
          );
        })}

        {(weeks ?? []).length === 0 ? (
          <p className="text-ink/60">Conteúdo desta trilha ainda será publicado.</p>
        ) : null}
      </div>
    </div>
  );
}
