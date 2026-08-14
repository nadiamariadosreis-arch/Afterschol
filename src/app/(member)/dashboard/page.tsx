import { requireCurrentCycle } from "@/lib/apfa/session";
import { cycleLabel, cycleProgress, pilarStatus } from "@/lib/apfa/ciclo";
import { ModuleCard } from "@/components/member/ModuleCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";

export default async function DashboardPage() {
  const { profile, cycle } = await requireCurrentCycle();
  const status = pilarStatus(cycle);
  const progress = cycleProgress(cycle);
  const nome = profile.family_name || "família";

  return (
    <div className="flex flex-col gap-10">
      <div>
        <div className="font-body text-[13px] tracking-[0.24em] uppercase text-orange-dark font-bold mb-3">
          {cycleLabel(cycle.year, cycle.month)}
        </div>
        <h1 className="font-display-italic font-semibold text-[36px] text-ink">Olá, {nome}!</h1>
        <p className="text-ink/65 text-[16px] mt-2 max-w-xl">
          {progress === 100
            ? "Ciclo completo — seu planner deste mês já está pronto no Histórico."
            : "Siga os 4 módulos, na ordem, para fechar o ciclo deste mês."}
        </p>
        <div className="max-w-sm mt-5">
          <ProgressBar percent={progress} label={`${progress}% do ciclo concluído`} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <ModuleCard
          href="/ciclo/avaliar"
          numero={1}
          titulo="Avaliar"
          resumo="Sentar uma vez, olhar o cenário real, sem julgamento."
          concluido={status.avaliar}
        />
        <ModuleCard
          href="/ciclo/planejar"
          numero={2}
          titulo="Planejar"
          resumo="Decidir o plano do mês, com ação real para o que dói."
          concluido={status.planejar}
        />
        <ModuleCard
          href="/ciclo/fazer-acontecer"
          numero={3}
          titulo="Fazer Acontecer"
          resumo="O dia em que o dinheiro cai é o dia de agir — não depois."
          concluido={status.fazer_acontecer}
        />
        <ModuleCard
          href="/ciclo/acompanhar"
          numero={4}
          titulo="Acompanhar"
          resumo="Revisão contínua, com perguntas — não cobrança."
          concluido={status.acompanhar}
        />
      </div>

      {progress === 100 ? (
        <Card className="bg-orange-light/40 border-orange-light">
          <h3 className="font-display-italic font-semibold text-[20px] text-ink mb-1">
            Este ciclo está fechado
          </h3>
          <p className="text-ink/70 text-[15px]">
            Veja o planner gerado no Histórico, ou volte quando o próximo mês começar — a plataforma
            abre o novo ciclo automaticamente.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
