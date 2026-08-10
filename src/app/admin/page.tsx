import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ count: members }, { count: jogos }, { count: tags }] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "member"),
    supabase.from("jogos").select("id", { count: "exact", head: true }),
    supabase.from("tags").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div>
      <SectionHeading eyebrow="Visão geral" title="Administração da plataforma" />

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <div className="text-[13px] tracking-[0.15em] uppercase text-teal-dark font-bold mb-2">
            Membros
          </div>
          <p className="font-display text-[36px] text-ink">{members ?? 0}</p>
        </Card>
        <Card>
          <div className="text-[13px] tracking-[0.15em] uppercase text-teal-dark font-bold mb-2">
            Jogos cadastrados
          </div>
          <p className="font-display text-[36px] text-ink">{jogos ?? 0}</p>
        </Card>
        <Card>
          <div className="text-[13px] tracking-[0.15em] uppercase text-teal-dark font-bold mb-2">
            Tags (queixas/virtudes)
          </div>
          <p className="font-display text-[36px] text-ink">{tags ?? 0}</p>
        </Card>
      </div>
    </div>
  );
}
