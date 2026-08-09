import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ProductCode } from "@/lib/supabase/types";
import { grantEntitlementAction, inviteFamilyAction, revokeEntitlementAction } from "./actions";

const PRODUCT_LABEL: Record<string, string> = {
  trilha_letras: "Trilha de Letras",
  trilha_silabas: "Trilha de Sílabas/Leitura",
  trilha_gramatica: "Trilha de Gramática",
  pacote_completo: "Pacote Completo",
};

export default async function FamiliesAdminPage() {
  const supabase = await createClient();

  const [{ data: families }, { data: entitlements }, { data: children }, { data: products }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("role", "family").order("created_at", { ascending: false }),
      supabase.from("entitlements").select("*"),
      supabase.from("child_profiles").select("id, family_id"),
      supabase.from("products").select("*").order("code"),
    ]);

  const entitlementsByFamily = new Map<string, typeof entitlements>();
  for (const e of entitlements ?? []) {
    const list = entitlementsByFamily.get(e.family_id) ?? [];
    list.push(e);
    entitlementsByFamily.set(e.family_id, list);
  }

  const childCountByFamily = new Map<string, number>();
  for (const c of children ?? []) {
    childCountByFamily.set(c.family_id, (childCountByFamily.get(c.family_id) ?? 0) + 1);
  }

  return (
    <div>
      <SectionHeading eyebrow="Membros" title="Famílias" />

      <div className="flex flex-col gap-4 mb-10">
        {(families ?? []).map((family) => {
          const familyEntitlements = entitlementsByFamily.get(family.id) ?? [];
          const ownedCodes = new Set(familyEntitlements.map((e) => e.product_code));

          return (
            <Card key={family.id}>
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <div>
                  <h3 className="font-heading font-semibold text-[20px] text-ink">
                    {family.full_name ?? family.email}
                  </h3>
                  <p className="text-ink/50 text-[14px]">
                    {family.email} · {childCountByFamily.get(family.id) ?? 0} perfil(is) de criança
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {familyEntitlements.map((e) => (
                  <form key={e.id} action={revokeEntitlementAction}>
                    <input type="hidden" name="entitlementId" value={e.id} />
                    <button
                      type="submit"
                      title="Clique para revogar"
                      className="inline-block"
                    >
                      <Badge tone="moss">{PRODUCT_LABEL[e.product_code]} ✕</Badge>
                    </button>
                  </form>
                ))}
              </div>

              <form action={grantEntitlementAction} className="flex items-center gap-3">
                <input type="hidden" name="familyId" value={family.id} />
                <select
                  name="productCode"
                  required
                  className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss text-[14px]"
                >
                  <option value="">Conceder acesso a…</option>
                  {(products ?? [])
                    .filter((p) => !ownedCodes.has(p.code as ProductCode))
                    .map((p) => (
                      <option key={p.code} value={p.code}>
                        {PRODUCT_LABEL[p.code]}
                      </option>
                    ))}
                </select>
                <Button type="submit" variant="secondary">
                  Conceder
                </Button>
              </form>
            </Card>
          );
        })}

        {(families ?? []).length === 0 ? (
          <p className="text-ink/60">Nenhuma família cadastrada ainda.</p>
        ) : null}
      </div>

      <Card>
        <h3 className="font-heading font-semibold text-[20px] text-ink mb-2">
          Convidar nova família
        </h3>
        <p className="text-ink/60 text-[15px] mb-4">
          Um e-mail de convite é enviado para a família definir sua própria senha.
          Isso é temporário — quando a integração com a Kiwify estiver pronta, esse
          convite e a liberação de acesso acontecem automaticamente após a compra.
        </p>
        <form action={inviteFamilyAction} className="grid md:grid-cols-3 gap-3 items-end">
          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">E-mail</span>
            <input
              type="email"
              name="email"
              required
              className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Nome (opcional)</span>
            <input
              type="text"
              name="fullName"
              className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Acesso inicial</span>
            <select
              name="productCode"
              className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
            >
              <option value="">Nenhum (definir depois)</option>
              {(products ?? []).map((p) => (
                <option key={p.code} value={p.code}>
                  {PRODUCT_LABEL[p.code]}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" variant="primary" className="md:col-span-3">
            Enviar convite
          </Button>
        </form>
      </Card>
    </div>
  );
}
