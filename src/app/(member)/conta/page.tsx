import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LinkButton } from "@/components/ui/Button";
import { ChangePasswordForm } from "./ChangePasswordForm";

const PRODUCT_LABEL: Record<string, string> = {
  trilha_letras: "Trilha de Letras",
  trilha_silabas: "Trilha de Sílabas/Leitura",
  trilha_gramatica: "Trilha de Gramática",
  pacote_completo: "Pacote Completo",
};

export default async function AccountPage() {
  const profile = await requireFamily();
  const supabase = await createClient();

  const [{ data: entitlements }, { data: children }] = await Promise.all([
    supabase.from("entitlements").select("product_code").eq("family_id", profile.id),
    supabase.from("child_profiles").select("*").eq("family_id", profile.id),
  ]);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <SectionHeading eyebrow="Minha Conta" title={profile.full_name ?? profile.email} />

      <Card>
        <h3 className="font-heading font-semibold text-[20px] text-ink mb-4">Meus acessos</h3>
        <div className="flex flex-wrap gap-3">
          {(entitlements ?? []).length === 0 ? (
            <p className="text-ink/60">Nenhum acesso liberado ainda.</p>
          ) : (
            (entitlements ?? []).map((e) => (
              <Badge key={e.product_code} tone="moss">
                {PRODUCT_LABEL[e.product_code] ?? e.product_code}
              </Badge>
            ))
          )}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-[20px] text-ink">
            Perfis de crianças
          </h3>
          <LinkButton href="/perfis" variant="secondary">
            Gerenciar
          </LinkButton>
        </div>
        <p className="text-ink/70">
          {(children ?? []).length} perfil{(children ?? []).length === 1 ? "" : "is"} cadastrado
          {(children ?? []).length === 1 ? "" : "s"}.
        </p>
      </Card>

      <Card>
        <h3 className="font-heading font-semibold text-[20px] text-ink mb-4">Alterar senha</h3>
        <ChangePasswordForm />
      </Card>
    </div>
  );
}
