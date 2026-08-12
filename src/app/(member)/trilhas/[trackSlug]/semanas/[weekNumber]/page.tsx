import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getActiveChildProfileId } from "@/lib/active-profile";
import { hasAccessToTrack } from "@/lib/entitlements";
import { toEmbedUrl } from "@/lib/video";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PdfViewer } from "@/components/member/PdfViewer";
import { GuideContent } from "@/components/member/GuideContent";
import { Button } from "@/components/ui/Button";
import type { ProductCode, Week } from "@/lib/supabase/types";
import { toggleProgressAction } from "@/lib/progress-actions";
import { WeekTabs, type WeekTab } from "./WeekTabs";

type WeekWithVirtue = Week & {
  virtues: { name: string; number: number; booklet_pdf_path: string | null } | null;
};

type WeekListItem = {
  id: string;
  week_number: number;
  release_date: string;
  virtues: { name: string } | null;
};

export default async function WeekPage({
  params,
  searchParams,
}: {
  params: Promise<{ trackSlug: string; weekNumber: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { trackSlug, weekNumber } = await params;
  const { tab } = await searchParams;
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

  const [{ data: week }, { data: allWeeks }, { data: progressRows }] = await Promise.all([
    supabase
      .from("weeks")
      .select("*, virtues(name, number, booklet_pdf_path)")
      .eq("track_id", track.id)
      .eq("week_number", Number(weekNumber))
      .returns<WeekWithVirtue[]>()
      .maybeSingle(),
    supabase
      .from("weeks")
      .select("id, week_number, release_date, virtues(name)")
      .eq("track_id", track.id)
      .order("week_number")
      .returns<WeekListItem[]>(),
    supabase.from("progress").select("week_id, completed_at").eq("child_profile_id", activeChildId),
  ]);
  if (!week) notFound();

  const today = new Date().toISOString().slice(0, 10);
  if (week.release_date > today) redirect(`/trilhas/${trackSlug}`);

  const virtue = week.virtues;
  const completedWeekIds = new Set(
    (progressRows ?? []).filter((p) => p.completed_at).map((p) => p.week_id),
  );
  const completed = completedWeekIds.has(week.id);

  const tabs: WeekTab[] = [
    { key: "conteudo", label: "Conteúdo", content: <ContentSections week={week} virtue={virtue} /> },
    ...(week.description
      ? [{ key: "guia", label: "Guia dos Pais", content: <GuideContent markdown={week.description} /> }]
      : []),
  ];

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-8 items-start">
      <aside className="order-2 md:order-1 md:sticky md:top-10 bg-card border border-line rounded-sm p-5">
        <div className="text-[12px] tracking-[0.15em] uppercase text-moss mb-3">
          {track.name}
        </div>
        <nav className="flex flex-col gap-1">
          {(allWeeks ?? []).map((w) => {
            const released = w.release_date <= today;
            const isCurrent = w.week_number === week.week_number;
            const isDone = completedWeekIds.has(w.id);

            const rowContent = (
              <>
                <span
                  className={`flex items-center justify-center w-7 h-7 rounded-full border text-[12px] shrink-0 ${
                    isDone
                      ? "bg-moss border-moss text-parchment"
                      : isCurrent
                        ? "border-moss text-moss"
                        : "border-line text-ink/40"
                  }`}
                >
                  {isDone ? "✓" : w.week_number}
                </span>
                <span
                  className={`text-[14px] leading-tight ${
                    isCurrent ? "text-ink font-semibold" : released ? "text-ink/70" : "text-ink/35"
                  }`}
                >
                  {w.virtues?.name ?? `Semana ${w.week_number}`}
                </span>
              </>
            );

            if (!released) {
              return (
                <div key={w.id} className="flex items-center gap-3 px-2 py-2 rounded-sm">
                  {rowContent}
                </div>
              );
            }

            return (
              <Link
                key={w.id}
                href={`/trilhas/${trackSlug}/semanas/${w.week_number}`}
                className={`flex items-center gap-3 px-2 py-2 rounded-sm ${
                  isCurrent ? "bg-parchment-dark" : "hover:bg-parchment-dark"
                }`}
              >
                {rowContent}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="order-1 md:order-2 flex flex-col gap-6">
        <SectionHeading
          eyebrow={`${track.name} · Semana ${week.week_number}`}
          title={virtue?.name ?? "Virtude da semana"}
        />

        <WeekTabs tabs={tabs} initialTab={tab} />

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
    </div>
  );
}

function ContentSections({
  week,
  virtue,
}: {
  week: WeekWithVirtue;
  virtue: WeekWithVirtue["virtues"];
}) {
  return (
    <div className="flex flex-col gap-6">
      {virtue?.booklet_pdf_path ? (
        <HeroCard
          eyebrow="Material principal da semana"
          title={`Livrinho — ${virtue.name}`}
          description="A história desta semana, para ler e reler com seu filho."
          downloadLabel="Baixar Livrinho"
          downloadHref={`/api/pdf/${week.id}?type=booklet&mode=download`}
          pdfSrc={`/api/pdf/${week.id}?type=booklet`}
          pdfTitle="Livrinho da virtude"
          icon={<BookIcon />}
        />
      ) : null}

      {week.activity_pdf_path ? (
        <HeroCard
          eyebrow="Roteiro, atividades e cartões da semana"
          title="Atividades da Semana"
          description="Tudo que vocês vão precisar para os próximos dias, em um só arquivo."
          downloadLabel="Baixar Atividades"
          downloadHref={`/api/pdf/${week.id}?type=activity&mode=download`}
          pdfSrc={`/api/pdf/${week.id}?type=activity`}
          pdfTitle="Atividades da semana"
          icon={<ActivitiesIcon />}
        />
      ) : null}

      {week.video_url ? (
        <section className="border border-line rounded-sm bg-card overflow-hidden">
          <div className="flex items-start gap-4 p-5 border-b border-line">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-moss text-parchment text-[14px] font-semibold shrink-0">
              1
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-semibold text-[18px] text-ink">Vídeo-aula</h3>
              <p className="text-ink/60 text-[14px] mt-0.5">
                Assista antes de começar a atividade da semana.
              </p>
            </div>
          </div>
          <div className="p-5">
            <div className="aspect-video rounded-sm overflow-hidden border border-line">
              <iframe
                src={toEmbedUrl(week.video_url)}
                title="Vídeo-aula"
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function HeroCard({
  eyebrow,
  title,
  description,
  downloadLabel,
  downloadHref,
  pdfSrc,
  pdfTitle,
  icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  downloadLabel: string;
  downloadHref: string;
  pdfSrc: string;
  pdfTitle: string;
  icon: React.ReactNode;
}) {
  return (
    <section className="rounded-[18px] border border-moss/30 bg-gradient-to-br from-moss/10 via-card to-gold/10 shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-moss text-parchment shrink-0 shadow-sm">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] tracking-[0.18em] uppercase text-terracotta font-semibold mb-1">
            {eyebrow}
          </div>
          <h3 className="font-heading font-semibold text-[24px] text-ink">{title}</h3>
          <p className="text-ink/60 text-[15px] mt-1">{description}</p>
        </div>
        <a
          href={downloadHref}
          className="inline-flex items-center justify-center gap-2 rounded-sm px-6 py-2.5 font-body text-[15px] tracking-wide bg-moss text-parchment hover:bg-moss-dark border border-moss transition-colors duration-150 shrink-0"
        >
          <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M10 3v10" strokeLinecap="round" />
            <path d="M6 9.5 10 13.5 14 9.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 16.5h12" strokeLinecap="round" />
          </svg>
          {downloadLabel}
        </a>
      </div>
      <div className="px-6 md:px-8 pb-6 md:pb-8">
        <PdfViewer src={pdfSrc} title={pdfTitle} />
      </div>
    </section>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5C4.7 20 4 19.3 4 18.5V5.5Z" strokeLinejoin="round" />
      <path d="M20 5.5C20 4.7 19.3 4 18.5 4H13v16h5.5c.8 0 1.5-.7 1.5-1.5V5.5Z" strokeLinejoin="round" />
    </svg>
  );
}

function ActivitiesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3h9L19 6.5v14a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20.5v-16Z" strokeLinejoin="round" />
      <path d="M8.5 12h7M8.5 15.5h7M8.5 8.5h4" strokeLinecap="round" />
    </svg>
  );
}
