import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createProfile } from "@/app/(app)/perfil/actions";
import { Button, Card } from "@/components/ui";
import { PageFade, StaggerItem, StaggerList } from "@/components/motion";
import { InstallAppBanner } from "@/components/install-app-banner";
import { STEP_LABELS, STEP_ROUTE } from "@/lib/steps";
import type { Profile } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const items = (profiles ?? []) as Profile[];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:py-10">
      <PageFade>
        <InstallAppBanner />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-semibold">Seus perfis</h1>
            <p className="mt-1 text-sm text-ink-soft">
              Cada perfil é um projeto isolado: um nicho, uma identidade, um calendário.
            </p>
          </div>
          <form action={createProfile}>
            <Button type="submit">Novo perfil</Button>
          </form>
        </div>

        {items.length === 0 ? (
          <Card className="mt-8 text-center text-sm text-ink-soft">
            Você ainda não começou nenhum perfil. Clique em &quot;Novo perfil&quot; para
            iniciar pela pesquisa de nicho.
          </Card>
        ) : (
          <StaggerList className="mt-6 flex snap-x gap-4 overflow-x-auto pb-4">
            {items.map((profile) => (
              <StaggerItem key={profile.id} className="w-56 shrink-0 snap-start">
                <Link href={`/perfil/${profile.id}/${STEP_ROUTE[profile.status]}`}>
                  <Card
                    hoverable
                    className="flex h-40 flex-col justify-between bg-gradient-to-br from-orange to-orange-dark text-white"
                  >
                    <p className="font-display text-lg font-semibold">{profile.title}</p>
                    <div>
                      <p className="text-sm text-white/80">Etapa atual</p>
                      <p className="font-medium">{STEP_LABELS[profile.status]}</p>
                    </div>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </StaggerList>
        )}
      </PageFade>
    </main>
  );
}
