import { redirect } from "next/navigation";
import Link from "next/link";
import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getActiveChildProfileId } from "@/lib/active-profile";
import { hasAccessToTrack } from "@/lib/entitlements";
import { LinkButton } from "@/components/ui/Button";
import { Cover } from "@/components/member/Cover";
import { coverImageUrl } from "@/lib/supabase/storage";
import type { ProductCode, Track } from "@/lib/supabase/types";

const LEVEL_LABEL: Record<Track["level"], string> = {
  inicial: "Nível 1 · Alfabetização",
  intermediario: "Nível 2 · Sílabas",
  avancado: "Nível 3 · Gramática",
};

const TRACK_DESCRIPTION: Record<string, string> = {
  letras: "Identificação de letras — o primeiro passo da alfabetização.",
  silabas: "Sílabas para a criança começar a ler com confiança.",
  gramatica: "Separação silábica, sílaba tônica e classes gramaticais.",
};

type NextUp = {
  trackSlug: string;
  trackName: string;
  weekNumber: number;
  virtueName: string | null;
  coverImagePath: string | null;
  bookletPath: string | null;
  activityPath: string | null;
  videoUrl: string | null;
  weekId: string;
};

type TrackStat = {
  track: Track;
  accessible: boolean;
  totalReleased: number;
  totalDefined: number;
  completed: number;
  nextWeekNumber: number | null;
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

  const trackStats: TrackStat[] = await Promise.all(
    (tracks ?? []).map(async (track) => {
      const accessible = hasAccessToTrack(entitlementCodes, track);
      if (!accessible) {
        return {
          track,
          accessible,
          totalReleased: 0,
          totalDefined: 0,
          completed: 0,
          nextWeekNumber: null,
        };
      }

      const { data: weeks } = await supabase
        .from("weeks")
        .select("id, week_number, release_date")
        .eq("track_id", track.id)
        .order("week_number");

      const allWeeks = weeks ?? [];
      const releasedWeeks = allWeeks.filter((w) => w.release_date <= today);
      const completed = releasedWeeks.filter((w) => completedWeekIds.has(w.id)).length;
      const nextWeek = releasedWeeks.find((w) => !completedWeekIds.has(w.id));

      return {
        track,
        accessible,
        totalReleased: releasedWeeks.length,
        totalDefined: allWeeks.length,
        completed,
        nextWeekNumber: nextWeek?.week_number ?? null,
      };
    }),
  );

  const overallTotal = trackStats.reduce((sum, t) => sum + t.totalReleased, 0);
  const overallCompleted = trackStats.reduce((sum, t) => sum + t.completed, 0);
  const overallPct = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0;
  const activeTracks = trackStats.filter((t) => t.accessible).length;

  const nextUpStat = trackStats.find((t) => t.accessible && t.nextWeekNumber !== null);

  let nextUp: NextUp | null = null;
  if (nextUpStat) {
    const { data: week } = await supabase
      .from("weeks")
      .select("id, activity_pdf_path, video_url, virtues(name, booklet_pdf_path)")
      .eq("track_id", nextUpStat.track.id)
      .eq("week_number", nextUpStat.nextWeekNumber!)
      .returns<
        {
          id: string;
          activity_pdf_path: string | null;
          video_url: string | null;
          virtues: { name: string; booklet_pdf_path: string | null } | null;
        }[]
      >()
      .maybeSingle();

    nextUp = {
      trackSlug: nextUpStat.track.slug,
      trackName: nextUpStat.track.name,
      weekNumber: nextUpStat.nextWeekNumber!,
      virtueName: week?.virtues?.name ?? null,
      coverImagePath: nextUpStat.track.cover_image_path,
      bookletPath: week?.virtues?.booklet_pdf_path ?? null,
      activityPath: week?.activity_pdf_path ?? null,
      videoUrl: week?.video_url ?? null,
      weekId: week?.id ?? "",
    };
  }

  const hasAnyAccess = trackStats.some((t) => t.accessible);

  const completedDays = new Set(
    (progressRows ?? [])
      .filter((p) => p.completed_at)
      .map((p) => p.completed_at!.slice(0, 10)),
  );
  const streak = calculateStreak(completedDays);

  const heroTrack =
    trackStats.find((t) => t.track.cover_image_path)?.track ?? trackStats[0]?.track ?? null;

  return (
    <div className="flex flex-col gap-10">
      <WelcomeBanner
        childName={child.name}
        hasAnyAccess={hasAnyAccess}
        heroTrack={heroTrack}
        continueHref={nextUp ? `/trilhas/${nextUp.trackSlug}/semanas/${nextUp.weekNumber}` : null}
      />

      {hasAnyAccess ? (
        <StatsRow
          overallTotal={overallTotal}
          overallCompleted={overallCompleted}
          overallPct={overallPct}
          activeTracks={activeTracks}
          totalTracks={trackStats.length}
          streak={streak}
        />
      ) : null}

      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading font-semibold text-[24px] text-ink">
            Trilhas de Aprendizagem
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {trackStats.map((stat, index) => (
            <TrackCard
              key={stat.track.id}
              stat={stat}
              index={index}
              productByCode={productByCode}
            />
          ))}
        </div>
      </div>

      {nextUp ? <ContinueCard nextUp={nextUp} /> : null}
    </div>
  );
}

function calculateStreak(daysWithActivity: Set<string>): number {
  const cursor = new Date();
  const todayStr = cursor.toISOString().slice(0, 10);
  if (!daysWithActivity.has(todayStr)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (daysWithActivity.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function WelcomeBanner({
  childName,
  hasAnyAccess,
  heroTrack,
  continueHref,
}: {
  childName: string;
  hasAnyAccess: boolean;
  heroTrack: Track | null;
  continueHref: string | null;
}) {
  return (
    <div className="relative overflow-hidden rounded-sm border border-line grid md:grid-cols-[1.1fr_1fr] bg-card">
      <div
        className="p-8 md:p-12 flex flex-col justify-center"
        style={{
          background: [
            "radial-gradient(circle at 90% 10%, #eef2ec, transparent 55%)",
            "linear-gradient(120deg, #ffffff, #f6f6f4)",
          ].join(", "),
        }}
      >
        <div className="font-body text-[13px] tracking-[0.28em] uppercase text-moss mb-3">
          Bem-vinda de volta
        </div>
        <h1 className="font-display italic font-semibold text-[34px] md:text-[40px] text-ink leading-tight">
          Olá, {childName}!
        </h1>
        <p className="text-ink/70 mt-4 text-[16px] max-w-sm">
          {hasAnyAccess
            ? "Cada história é uma semente. Cultive virtudes, bons hábitos e conhecimento."
            : "Assim que uma trilha for liberada para sua família, ela aparece aqui."}
        </p>
        {continueHref ? (
          <LinkButton href={continueHref} variant="primary" className="mt-7 self-start">
            Continuar aprendendo
          </LinkButton>
        ) : null}
      </div>

      <div className="relative h-56 md:h-auto">
        {heroTrack ? (
          <Cover
            trackSlug={heroTrack.slug}
            mark={heroTrack.name.charAt(0)}
            imageUrl={coverImageUrl(heroTrack.cover_image_path)}
            className="absolute inset-0 w-full h-full rounded-none"
          />
        ) : null}
      </div>
    </div>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 20c0-9 6-15 16-15-1 10-7 15-16 15Z" strokeLinejoin="round" />
      <path d="M5 19c3-4 7-7 13-9" strokeLinecap="round" />
    </svg>
  );
}

function TrailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 20c3-7 5-11 8-16" strokeLinecap="round" />
      <path d="M20 20c-3-7-5-11-8-16" strokeLinecap="round" />
      <circle cx="12" cy="4" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SproutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 21V11" strokeLinecap="round" />
      <path d="M12 12C12 7 9 5 5 5c0 4.5 3 7 7 7Z" strokeLinejoin="round" />
      <path d="M12 10c0-3.5 2.2-5 6-5 0 3.7-2.5 6-6 6" strokeLinejoin="round" />
    </svg>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(pct, 100) / 100) * c;

  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#eeeeee" strokeWidth="5" />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke="#4a5d45"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[12px] font-semibold text-ink">
        {pct}%
      </span>
    </div>
  );
}

function StatsRow({
  overallTotal,
  overallCompleted,
  overallPct,
  activeTracks,
  totalTracks,
  streak,
}: {
  overallTotal: number;
  overallCompleted: number;
  overallPct: number;
  activeTracks: number;
  totalTracks: number;
  streak: number;
}) {
  return (
    <div className="bg-card border border-line rounded-sm px-6 py-5">
      <div className="text-[13px] tracking-[0.15em] uppercase text-moss mb-4">Seu progresso</div>
      <div className="flex flex-wrap items-center gap-x-10 gap-y-5">
        <div className="flex items-center gap-3">
          <span className="text-moss">
            <LeafIcon />
          </span>
          <div>
            <div className="text-[12px] text-ink/50">Semanas concluídas</div>
            <div className="font-heading font-semibold text-[18px] text-ink">
              {overallCompleted} de {overallTotal}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-moss">
            <TrailIcon />
          </span>
          <div>
            <div className="text-[12px] text-ink/50">Trilhas em andamento</div>
            <div className="font-heading font-semibold text-[18px] text-ink">
              {activeTracks} de {totalTracks}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-terracotta">
            <SproutIcon />
          </span>
          <div>
            <div className="text-[12px] text-ink/50">Sequência atual</div>
            <div className="font-heading font-semibold text-[18px] text-ink">
              {streak} dia{streak === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <ProgressRing pct={overallPct} />
          <div className="text-[12px] text-ink/50 max-w-[6rem]">do total já liberado</div>
        </div>
      </div>
    </div>
  );
}

function TrackCard({
  stat,
  index,
  productByCode,
}: {
  stat: TrackStat;
  index: number;
  productByCode: Map<string, { available_for_sale: boolean; checkout_url: string | null }>;
}) {
  const { track, accessible, totalReleased, totalDefined, completed } = stat;
  const pct = totalReleased > 0 ? Math.round((completed / totalReleased) * 100) : 0;
  const product = productByCode.get(track.product_code);
  const canBuy = !accessible && product?.available_for_sale && product.checkout_url;

  return (
    <div className="relative rounded-sm overflow-hidden border border-line h-[340px] flex flex-col">
      <div className="absolute inset-0">
        <Cover
          trackSlug={track.slug}
          mark={track.name.charAt(0)}
          imageUrl={coverImageUrl(track.cover_image_path)}
          className="w-full h-full rounded-none"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/55 to-transparent" />

      <span className="relative bg-moss/10 text-moss-dark border border-moss/30 text-[11px] tracking-[0.15em] uppercase font-semibold px-4 py-1.5 rounded-r-full self-start mt-4">
        Trilha {index + 1}
      </span>

      <div className="relative mt-auto p-5 flex flex-col gap-2">
        <div className="text-moss-dark text-[12px] tracking-[0.15em] uppercase font-semibold">
          {LEVEL_LABEL[track.level]}
        </div>
        <p className="text-ink/70 text-[13px] leading-snug">{TRACK_DESCRIPTION[track.slug]}</p>

        {accessible ? (
          <>
            <div className="h-1.5 bg-parchment-dark rounded-full overflow-hidden mt-1">
              <div className="h-full bg-moss" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-ink/50 text-[12px]">{totalDefined} livros</span>
              <LinkButton
                href={`/trilhas/${track.slug}`}
                variant="primary"
                className="!px-4 !py-1.5 !text-[13px]"
              >
                Acessar trilha
              </LinkButton>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between mt-1">
            <span className="text-ink/50 text-[12px]">Não adquirida</span>
            {canBuy ? (
              <LinkButton
                href={product!.checkout_url!}
                variant="primary"
                className="!px-4 !py-1.5 !text-[13px]"
              >
                Adquirir
              </LinkButton>
            ) : (
              <span className="text-ink/40 text-[12px] border border-line rounded-full px-3 py-1">
                Em breve
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ContinueCard({ nextUp }: { nextUp: NextUp }) {
  const chips = [
    { label: "Livrinho da virtude", done: Boolean(nextUp.bookletPath) },
    { label: "Atividades", done: Boolean(nextUp.activityPath) },
    { label: "Vídeo-aula", done: Boolean(nextUp.videoUrl) },
  ].filter((c) => c.done);

  return (
    <div>
      <h2 className="font-heading font-semibold text-[24px] text-ink mb-5">
        Continue de onde parou
      </h2>
      <div className="flex flex-col md:flex-row gap-5 bg-card border border-line rounded-sm p-5">
        <Cover
          trackSlug={nextUp.trackSlug}
          mark={String(nextUp.weekNumber)}
          imageUrl={coverImageUrl(nextUp.coverImagePath)}
          className="w-full md:w-32 h-40 shrink-0 rounded-sm"
        />
        <div className="flex flex-col justify-center gap-1 md:border-r md:border-line md:pr-6 md:min-w-[240px]">
          <div className="text-[12px] text-ink/50">Livro atual</div>
          <h3 className="font-heading font-semibold text-[20px] text-ink leading-tight">
            {nextUp.virtueName ?? "Próxima virtude"}
          </h3>
          <p className="text-ink/50 text-[13px] mt-1">
            {nextUp.trackName} · Semana {nextUp.weekNumber}
          </p>
          <LinkButton
            href={`/trilhas/${nextUp.trackSlug}/semanas/${nextUp.weekNumber}`}
            variant="primary"
            className="mt-3 self-start"
          >
            Continuar leitura
          </LinkButton>
        </div>

        {chips.length > 0 ? (
          <div className="flex-1 grid sm:grid-cols-3 gap-3 content-center">
            {chips.map((chip) => (
              <Link
                key={chip.label}
                href={`/trilhas/${nextUp.trackSlug}/semanas/${nextUp.weekNumber}`}
                className="flex items-center justify-between gap-2 border border-line rounded-sm px-4 py-3 hover:bg-parchment-dark"
              >
                <span className="text-[14px] text-ink">{chip.label}</span>
                <span className="text-moss">→</span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
