import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default async function TracksAdminIndexPage() {
  const supabase = await createClient();
  const { data: tracks } = await supabase.from("tracks").select("*").order("sort_order");

  const counts = await Promise.all(
    (tracks ?? []).map(async (track) => {
      const { count } = await supabase
        .from("weeks")
        .select("id", { count: "exact", head: true })
        .eq("track_id", track.id);
      return count ?? 0;
    }),
  );

  return (
    <div>
      <SectionHeading eyebrow="Conteúdo" title="Trilhas e Semanas" />

      <div className="grid md:grid-cols-3 gap-6">
        {(tracks ?? []).map((track, i) => (
          <Card key={track.id} className="flex flex-col gap-4">
            <h3 className="font-heading font-semibold text-[22px] text-ink">{track.name}</h3>
            <p className="text-ink/60">{counts[i]} semana(s) cadastrada(s)</p>
            <LinkButton href={`/admin/trilhas/${track.slug}`} variant="primary">
              Gerenciar semanas
            </LinkButton>
          </Card>
        ))}
      </div>
    </div>
  );
}
