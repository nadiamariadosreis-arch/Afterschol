import { redirect, notFound } from "next/navigation";
import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getActiveChildProfileId } from "@/lib/active-profile";
import { hasAccessToTrack } from "@/lib/entitlements";
import { toEmbedUrl } from "@/lib/video";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PdfViewer } from "@/components/member/PdfViewer";
import { Button } from "@/components/ui/Button";
import type { ProductCode, Week } from "@/lib/supabase/types";
import { toggleProgressAction } from "./actions";

type WeekWithVirtue = Week & {
  virtues: { name: string; number: number; booklet_pdf_path: string | null } | null;
};

export default async function WeekPage({
  params,
}: {
  params: Promise<{ trackSlug: string; weekNumber: string }>;
}) {
  const { trackSlug, weekNumber } = await params;
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
  if (!hasAccessToTrack(entitlementCodes, track)) redirect("/dashboard");

  const { data: week } = await supabase
    .from("weeks")
    .select("*, virtues(name, number, booklet_pdf_path)")
    .eq("track_id", track.id)
    .eq("week_number", Number(weekNumber))
    .returns<WeekWithVirtue[]>()
    .maybeSingle();
  if (!week) notFound();

  const today = new Date().toISOString().slice(0, 10);
  if (week.release_date > today) redirect(`/trilhas/${trackSlug}`);

  const virtue = week.virtues;

  const { data: progressRow } = await supabase
    .from("progress")
    .select("completed_at")
    .eq("child_profile_id", activeChildId)
    .eq("week_id", week.id)
    .maybeSingle();
  const completed = Boolean(progressRow?.completed_at);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-10">
      <SectionHeading
        eyebrow={`${track.name} · Semana ${week.week_number}`}
        title={virtue?.name ?? "Virtude da semana"}
      />

      {virtue?.booklet_pdf_path ? (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-semibold text-[20px] text-ink">
              Livrinho da virtude
            </h3>
            <a
              href={`/api/pdf/${week.id}?type=booklet&mode=download`}
              className="text-navy underline underline-offset-4 text-[15px]"
            >
              Baixar PDF
            </a>
          </div>
          <PdfViewer src={`/api/pdf/${week.id}?type=booklet`} title="Livrinho da virtude" />
        </section>
      ) : null}

      {week.activity_pdf_path ? (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-semibold text-[20px] text-ink">Atividades</h3>
            <a
              href={`/api/pdf/${week.id}?type=activity&mode=download`}
              className="text-navy underline underline-offset-4 text-[15px]"
            >
              Baixar PDF
            </a>
          </div>
          <PdfViewer src={`/api/pdf/${week.id}?type=activity`} title="Atividades da semana" />
        </section>
      ) : null}

      {week.video_url ? (
        <section>
          <h3 className="font-heading font-semibold text-[20px] text-ink mb-3">Vídeo-aula</h3>
          <div className="aspect-video border border-line rounded-sm overflow-hidden">
            <iframe
              src={toEmbedUrl(week.video_url)}
              title="Vídeo-aula"
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        </section>
      ) : null}

      <form action={toggleProgressAction} className="flex justify-center">
        <input type="hidden" name="weekId" value={week.id} />
        <input type="hidden" name="trackSlug" value={trackSlug} />
        <input type="hidden" name="weekNumber" value={weekNumber} />
        <input type="hidden" name="currentlyCompleted" value={String(completed)} />
        <Button type="submit" variant={completed ? "secondary" : "primary"}>
          {completed ? "Marcar como pendente" : "Marcar como concluído"}
        </Button>
      </form>
    </div>
  );
}
