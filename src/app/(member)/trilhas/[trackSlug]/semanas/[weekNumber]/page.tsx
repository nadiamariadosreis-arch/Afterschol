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
import type { ProductCode, Week, WeekDay } from "@/lib/supabase/types";
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

  const { data: days } = await supabase
    .from("week_days")
    .select("*")
    .eq("week_id", week.id)
    .order("day_number")
    .returns<WeekDay[]>();

  const virtue = week.virtues;
  const completedWeekIds = new Set(
    (progressRows ?? []).filter((p) => p.completed_at).map((p) => p.week_id),
  );
  const completed = completedWeekIds.has(week.id);

  const tabs: WeekTab[] = [
    { key: "conteudo", label: "Conteúdo", content: <ContentSections week={week} virtue={virtue} /> },
    ...(days ?? []).map((day) => ({
      key: `dia-${day.id}`,
      label: day.label,
      content: <DayContent day={day} />,
    })),
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
  const items: { title: string; description: string; action?: React.ReactNode; body: React.ReactNode }[] = [];

  if (week.video_url) {
    items.push({
      title: "Vídeo-aula",
      description: "Assista antes de começar a atividade da semana.",
      body: (
        <div className="aspect-video rounded-sm overflow-hidden border border-line">
          <iframe
            src={toEmbedUrl(week.video_url)}
            title="Vídeo-aula"
            className="w-full h-full"
            allowFullScreen
          />
        </div>
      ),
    });
  }

  if (virtue?.booklet_pdf_path) {
    items.push({
      title: "Livrinho da virtude",
      description: `A história desta semana: ${virtue.name}.`,
      action: <DownloadButton href={`/api/pdf/${week.id}?type=booklet&mode=download`} />,
      body: <PdfViewer src={`/api/pdf/${week.id}?type=booklet`} title="Livrinho da virtude" />,
    });
  }

  if (week.activity_pdf_path) {
    items.push({
      title: "Atividades",
      description: "Exercícios para praticar o que foi lido.",
      action: <DownloadButton href={`/api/pdf/${week.id}?type=activity&mode=download`} />,
      body: <PdfViewer src={`/api/pdf/${week.id}?type=activity`} title="Atividades da semana" />,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {items.map((item, index) => (
        <section key={item.title} className="border border-line rounded-sm bg-card overflow-hidden">
          <div className="flex items-start gap-4 p-5 border-b border-line">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-moss text-parchment text-[14px] font-semibold shrink-0">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-semibold text-[18px] text-ink">{item.title}</h3>
              <p className="text-ink/60 text-[14px] mt-0.5">{item.description}</p>
            </div>
            {item.action}
          </div>
          <div className="p-5">{item.body}</div>
        </section>
      ))}
    </div>
  );
}

function DayContent({ day }: { day: WeekDay }) {
  if (!day.content && !day.pdf_path) {
    return <p className="text-ink/50 text-[14px]">Conteúdo deste dia ainda será publicado.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {day.content ? <GuideContent markdown={day.content} /> : null}

      {day.pdf_path ? (
        <section className="border border-line rounded-sm bg-card overflow-hidden">
          <div className="flex items-start gap-4 p-5 border-b border-line">
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-semibold text-[18px] text-ink">Atividade do dia</h3>
              <p className="text-ink/60 text-[14px] mt-0.5">Material para {day.label}.</p>
            </div>
            <DownloadButton href={`/api/pdf-dia/${day.id}?mode=download`} />
          </div>
          <div className="p-5">
            <PdfViewer src={`/api/pdf-dia/${day.id}`} title={`Atividade — ${day.label}`} />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function DownloadButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 border border-line rounded-sm px-3 py-1.5 text-[13px] text-ink hover:bg-parchment-dark shrink-0"
    >
      <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M10 3v10" strokeLinecap="round" />
        <path d="M6 9.5 10 13.5 14 9.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 16.5h12" strokeLinecap="round" />
      </svg>
      Baixar PDF
    </a>
  );
}
