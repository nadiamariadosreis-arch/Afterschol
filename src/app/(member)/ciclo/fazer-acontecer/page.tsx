import { requireCurrentCycle } from "@/lib/apfa/session";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Callout } from "@/components/ui/Callout";
import { Paywall } from "@/components/member/Paywall";
import { temAcessoPago } from "@/lib/auth";
import { emptyFazerAcontecer } from "@/lib/apfa/types";
import { reconciliarItensExecucao } from "@/lib/apfa/calc";
import { FazerAcontecerForm } from "./FazerAcontecerForm";

export default async function FazerAcontecerPage() {
  const { profile, cycle } = await requireCurrentCycle();

  if (!temAcessoPago(profile)) {
    return (
      <Paywall
        titulo="Fazer Acontecer"
        resumo="O dia em que o dinheiro cai é o dia de agir — não depois. Uma decisão única no momento do recebimento, em vez de força de vontade repetida ao longo do mês."
      />
    );
  }

  const initial = cycle.fazer_acontecer ?? emptyFazerAcontecer();
  // Recalcula sempre a partir do Planejar mais recente — assim uma dívida
  // desmarcada do Fazer Acontecer (ou um item cortado da Organização do
  // mês) some do checklist mesmo depois da primeira geração.
  initial.itens = reconciliarItensExecucao(initial.itens, cycle.planejar);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        eyebrow="Pilar 3"
        title="Fazer Acontecer"
        subtitle="O dia em que o dinheiro cai é o dia de agir — não depois. Uma decisão única no momento do recebimento, em vez de força de vontade repetida ao longo do mês."
      />
      <Callout title="Ao final deste pilar, você vai ter:">
        A reserva do mês separada de imediato, e cada dívida, conta e fatura do Planejar marcada
        como executada, com a data em que foi feita.
      </Callout>
      <FazerAcontecerForm cycleId={cycle.id} initial={initial} />
    </div>
  );
}
