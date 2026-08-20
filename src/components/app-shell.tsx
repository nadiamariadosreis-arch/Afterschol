import { createClient } from "@/lib/supabase/server";
import { computeLevel } from "@/lib/gamification";
import { XpBadge } from "@/components/xp-badge";
import { SidebarNav } from "@/components/sidebar-nav";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let progress = null;
  if (user) {
    const { data } = await supabase
      .from("user_progress")
      .select("xp, streak_days")
      .eq("user_id", user.id)
      .maybeSingle();
    const { level, xpIntoLevel, xpForNextLevel } = computeLevel(data?.xp ?? 0);
    progress = { level, xpIntoLevel, xpForNextLevel, streakDays: data?.streak_days ?? 0 };
  }

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      {/* Barra superior — só no celular */}
      <header className="flex items-center justify-between border-b border-line bg-card px-4 py-3 md:hidden">
        <span className="font-display text-lg font-semibold text-orange-dark">Crescimento</span>
        <div className="flex items-center gap-3">
          {progress && <XpBadge {...progress} />}
          <form action="/logout" method="post">
            <button type="submit" className="text-sm text-ink-soft hover:text-ink">
              Sair
            </button>
          </form>
        </div>
      </header>

      {/* Barra lateral — só no computador */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-line bg-card md:flex">
        <div className="px-5 py-6">
          <span className="font-display text-lg font-semibold text-orange-dark">
            Estúdio de Crescimento
          </span>
        </div>
        <SidebarNav />
        <div className="mt-auto space-y-3 border-t border-line p-4">
          {progress && <XpBadge {...progress} />}
          <form action="/logout" method="post">
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-ink-soft hover:bg-cream-dark hover:text-ink"
            >
              Sair
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-full flex-1 flex-col pb-16 md:pb-0">{children}</div>

      {/* Barra inferior — só no celular */}
      <SidebarNav mobile />
    </div>
  );
}
