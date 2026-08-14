import { requireMember } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { listRecentCycles } from "@/lib/apfa/ciclo";
import { cycleLabel, cycleProgress, pilarStatus } from "@/lib/apfa/calc";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";

export default async function HistoricoPage() {
  const profile = await requireMember();
  const supabase = await createClient();
  const cycles = await listRecentCycles(supabase, profile.id);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        eyebrow="Histórico"
        title="Seus ciclos"
        subtitle="Até 12 meses guardados. Cada ciclo fechado tem um planner pronto para consultar."
      />

      {cycles.length === 0 ? (
        <Card>
          <p className="text-ink/60">Nenhum ciclo ainda — comece pelo Avaliar.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {cycles.map((cycle) => {
            const status = pilarStatus(cycle);
            const progress = cycleProgress(cycle);
            return (
              <Card key={cycle.id} className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="font-display-italic font-semibold text-[18px] text-ink">
                    {cycleLabel(cycle.year, cycle.month)}
                  </h3>
                  <p className="text-ink/50 text-[14px]">{progress}% concluído</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={progress === 100 ? "sage" : "muted"}>
                    {progress === 100 ? "Ciclo fechado" : `${Object.values(status).filter(Boolean).length}/4 pilares`}
                  </Badge>
                  <LinkButton href={`/planner/${cycle.id}`} variant="ghost">
                    Ver planner
                  </LinkButton>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
