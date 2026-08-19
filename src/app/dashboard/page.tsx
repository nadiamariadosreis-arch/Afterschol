import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createProfile } from "@/app/perfil/actions";
import { Header } from "@/components/header";
import { Button, Card } from "@/components/ui";
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Seus perfis</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Cada perfil é um projeto isolado: um nicho, uma identidade, um calendário.
            </p>
          </div>
          <form action={createProfile}>
            <Button type="submit">Novo perfil</Button>
          </form>
        </div>

        {items.length === 0 ? (
          <Card className="mt-8 text-center text-sm text-neutral-500">
            Você ainda não começou nenhum perfil. Clique em &quot;Novo perfil&quot; para
            iniciar pela pesquisa de nicho.
          </Card>
        ) : (
          <ul className="mt-6 space-y-3">
            {items.map((profile) => (
              <li key={profile.id}>
                <Link href={`/perfil/${profile.id}/${STEP_ROUTE[profile.status]}`}>
                  <Card className="flex items-center justify-between hover:border-neutral-400">
                    <div>
                      <p className="font-medium">{profile.title}</p>
                      <p className="text-sm text-neutral-500">
                        Etapa atual: {STEP_LABELS[profile.status]}
                      </p>
                    </div>
                    <span className="text-sm text-neutral-400">Continuar →</span>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
