import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { computeLevel } from "@/lib/gamification";
import { XpBadge } from "@/components/xp-badge";

export async function Header({ title }: { title?: string }) {
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
    <header className="border-b border-line bg-card">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="font-display text-lg font-semibold text-orange-dark">
            Estúdio de Crescimento
          </Link>
          {title && <span className="hidden text-sm text-ink-soft md:inline">{title}</span>}
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <Link href="/analytics" className="hidden text-sm text-ink-soft hover:text-ink sm:inline">
              Progresso
            </Link>
          )}
          {progress && <XpBadge {...progress} />}
          <form action="/logout" method="post">
            <button type="submit" className="text-sm text-ink-soft hover:text-ink">
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
