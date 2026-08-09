import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ count: families }, { count: virtues }, { count: weeks }, { data: upcoming }] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "family"),
      supabase.from("virtues").select("id", { count: "exact", head: true }),
      supabase.from("weeks").select("id", { count: "exact", head: true }),
      supabase
        .from("weeks")
        .select("release_date")
        .gt("release_date", new Date().toISOString().slice(0, 10))
        .order("release_date")
        .limit(1),
    ]);

  return (
    <div>
      <SectionHeading eyebrow="Visão geral" title="Administração da plataforma" />

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <div className="text-[13px] tracking-[0.15em] uppercase text-moss mb-2">Famílias</div>
          <p className="font-display text-[36px] text-ink">{families ?? 0}</p>
        </Card>
        <Card>
          <div className="text-[13px] tracking-[0.15em] uppercase text-moss mb-2">
            Virtudes cadastradas
          </div>
          <p className="font-display text-[36px] text-ink">{virtues ?? 0} / 20</p>
        </Card>
        <Card>
          <div className="text-[13px] tracking-[0.15em] uppercase text-moss mb-2">
            Semanas cadastradas
          </div>
          <p className="font-display text-[36px] text-ink">{weeks ?? 0}</p>
        </Card>
      </div>

      {upcoming && upcoming.length > 0 ? (
        <p className="text-ink/60 mt-8">
          Próxima liberação de conteúdo em{" "}
          {new Date(upcoming[0].release_date + "T00:00:00").toLocaleDateString("pt-BR")}.
        </p>
      ) : null}
    </div>
  );
}
