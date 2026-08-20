import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { StepNav } from "./step-nav";
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
      <Header title={profile.title} />
      <StepNav id={id} currentStatus={profile.status} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">{children}</main>
    </div>
  );
}
