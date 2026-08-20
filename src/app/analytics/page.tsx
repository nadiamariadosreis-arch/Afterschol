import { createClient } from "@/lib/supabase/server";
import { computeLevel, titleForLevel } from "@/lib/gamification";
import { Header } from "@/components/header";
import { StatTile } from "@/components/stat-tile";
import { StatusBarChart } from "@/components/status-bar-chart";
import { PageFade } from "@/components/motion";
import type { Profile } from "@/lib/types";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profiles }, { data: pieces }, { data: niches }, { data: progressRow }] =
    await Promise.all([
      supabase.from("profiles").select("status"),
      supabase.from("content_pieces").select("status"),
      supabase.from("niches").select("chosen_niche").not("chosen_niche", "is", null),
      user
        ? supabase.from("user_progress").select("xp, streak_days").eq("user_id", user.id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const profileList = (profiles ?? []) as Pick<Profile, "status">[];
  const activeProfiles = profileList.filter((p) => p.status === "ativo").length;

  const pauta = (pieces ?? []).filter((p) => p.status === "pauta").length;
  const agendado = (pieces ?? []).filter((p) => p.status === "agendado").length;
  const publicado = (pieces ?? []).filter((p) => p.status === "publicado").length;

  const { level, streakDays } = {
    ...computeLevel(progressRow?.xp ?? 0),
    streakDays: progressRow?.streak_days ?? 0,
  };

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <PageFade>
          <h1 className="font-display text-xl font-semibold">Seu progresso</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Um raio-x de tudo que você já estruturou na plataforma.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatTile label="Nível atual" value={`${level} · ${titleForLevel(level)}`} />
            <StatTile label="Sequência de dias" value={streakDays} />
            <StatTile label="Perfis criados" value={profileList.length} />
            <StatTile label="Perfis ativos" value={activeProfiles} />
            <StatTile label="Nichos escolhidos" value={niches?.length ?? 0} />
            <StatTile label="Pautas geradas" value={pauta + agendado + publicado} />
          </div>

          <div className="mt-8">
            <StatusBarChart
              title="Pautas por status"
              bars={[
                { label: "A fazer", value: pauta, color: "#2a78d6" },
                { label: "Agendado", value: agendado, color: "#e0692b" },
                { label: "Publicado", value: publicado, color: "#1baf7a" },
              ]}
            />
          </div>
        </PageFade>
      </main>
    </div>
  );
}
