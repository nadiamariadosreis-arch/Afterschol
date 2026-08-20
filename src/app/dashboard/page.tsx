import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createProfile } from "@/app/perfil/actions";
import { Header } from "@/components/header";
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
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
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
            <StaggerList className="mt-6 space-y-3">
              {items.map((profile) => (
                <StaggerItem key={profile.id}>
                  <Link href={`/perfil/${profile.id}/${STEP_ROUTE[profile.status]}`}>
                    <Card hoverable className="flex items-center justify-between hover:border-orange">
                      <div>
                        <p className="font-medium">{profile.title}</p>
                        <p className="text-sm text-ink-soft">
                          Etapa atual: {STEP_LABELS[profile.status]}
                        </p>
                      </div>
                      <span className="text-sm text-ink-soft">Continuar →</span>
                    </Card>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerList>
          )}
        </PageFade>
      </main>
    </div>
  );
}
