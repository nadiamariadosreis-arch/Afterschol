import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ChangePasswordForm } from "./ChangePasswordForm";

const PRODUCT_LABEL: Record<string, string> = {
  pacote_completo: "Acesso Completo",
};

export default async function AccountPage() {
  const profile = await requireFamily();
  const supabase = await createClient();

  const { data: entitlements } = await supabase
    .from("entitlements")
    .select("product_code")
    .eq("family_id", profile.id);

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
        <h3 className="font-heading font-semibold text-[20px] text-ink mb-4">Alterar senha</h3>
        <ChangePasswordForm />
      </Card>
    </div>
  );
}
