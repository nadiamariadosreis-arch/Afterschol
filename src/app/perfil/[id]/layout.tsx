import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { STEP_LABELS, STEP_ORDER, STEP_ROUTE } from "@/lib/steps";
import type { Profile } from "@/lib/types";

export default async function PerfilLayout({
  children,
  params,
}: LayoutProps<"/perfil/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single<Profile>();

  if (!profile) notFound();

  const currentIndex = STEP_ORDER.indexOf(profile.status);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header title={profile.title} />
      <nav className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-4">
          {STEP_ORDER.map((step, index) => {
            const unlocked = index <= currentIndex;
            const label = STEP_LABELS[step];
            const className = `whitespace-nowrap border-b-2 px-3 py-3 text-sm ${
              unlocked
                ? "border-transparent text-ink hover:border-orange"
                : "border-transparent text-ink-soft pointer-events-none"
            }`;
            return unlocked ? (
              <Link key={step} href={`/perfil/${id}/${STEP_ROUTE[step]}`} className={className}>
                {index + 1}. {label}
              </Link>
            ) : (
              <span key={step} className={className}>
                {index + 1}. {label}
              </span>
            );
          })}
        </div>
      </nav>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">{children}</main>
    </div>
  );
}
