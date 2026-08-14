import { requireCurrentCycle } from "@/lib/apfa/session";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { emptyFazerAcontecer } from "@/lib/apfa/types";
import { gerarItensExecucao } from "@/lib/apfa/calc";
import { FazerAcontecerForm } from "./FazerAcontecerForm";

export default async function FazerAcontecerPage() {
  const { cycle } = await requireCurrentCycle();

  const initial = cycle.fazer_acontecer ?? emptyFazerAcontecer();
  if (initial.itens.length === 0) {
    initial.itens = gerarItensExecucao(cycle.planejar);
  }

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        eyebrow="Pilar 3"
        title="Fazer Acontecer"
        subtitle="O dia em que o dinheiro cai é o dia de agir — não depois. Uma decisão única no momento do recebimento, em vez de força de vontade repetida ao longo do mês."
      />
      <FazerAcontecerForm cycleId={cycle.id} initial={initial} />
    </div>
  );
}
