import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { createChildProfileAction, selectChildProfileAction } from "./actions";

export default async function ProfilesPage() {
  const profile = await requireFamily();
  const supabase = await createClient();

  const { data: children } = await supabase
    .from("child_profiles")
    .select("*")
    .eq("family_id", profile.id)
    .order("created_at");

  return (
    <div className="max-w-2xl mx-auto">
      <SectionHeading eyebrow="Perfis de crianças" title="Quem vai estudar hoje?" />

      <div className="flex flex-col gap-4 mb-10">
        {(children ?? []).map((child) => (
          <Card key={child.id} className="flex items-center justify-between">
            <span className="font-heading font-semibold text-[20px] text-ink">
              {child.name}
            </span>
            <form action={selectChildProfileAction}>
              <input type="hidden" name="id" value={child.id} />
              <Button type="submit" variant="secondary">
                Continuar como {child.name}
              </Button>
            </form>
          </Card>
        ))}

        {(children ?? []).length === 0 ? (
          <p className="text-ink/60">
            Cadastre o primeiro perfil de criança para começar.
          </p>
        ) : null}
      </div>

      <Card>
        <h3 className="font-heading font-semibold text-[20px] text-ink mb-4">
          Adicionar novo perfil
        </h3>
        <form action={createChildProfileAction} className="flex gap-3">
          <input
            type="text"
            name="name"
            required
            placeholder="Nome da criança"
            className="flex-1 border border-line bg-parchment rounded-sm px-4 py-2.5 font-body text-ink outline-none focus:border-moss"
          />
          <Button type="submit" variant="primary">
            Adicionar
          </Button>
        </form>
      </Card>
    </div>
  );
}
