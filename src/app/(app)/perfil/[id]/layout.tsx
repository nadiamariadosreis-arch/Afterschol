import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LevelUpFromQuery } from "@/components/level-up-from-query";
import { ModuleRail } from "./module-rail";
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

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="border-b border-line bg-card px-4 pt-4 md:px-8">
        <p className="text-sm text-ink-soft">{profile.title}</p>
      </div>
      <ModuleRail id={id} currentStatus={profile.status} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 md:px-8 md:py-10">
        {children}
      </main>
      <LevelUpFromQuery />
    </div>
  );
}
